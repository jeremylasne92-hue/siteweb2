"""AI enrichment service for media resources using Claude Haiku."""
import json
import re
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

YT_REGEX = re.compile(
    r'(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([a-zA-Z0-9_-]{11})'
)


def extract_youtube_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from URL."""
    match = YT_REGEX.search(url)
    return match.group(1) if match else None


async def fetch_youtube_metadata(video_id: str) -> dict:
    """Fetch metadata from YouTube oEmbed (no API key needed)."""
    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            resp = await client.get(oembed_url)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "title": data.get("title", ""),
                    "author": data.get("author_name", ""),
                    "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                    "source": data.get("author_name", ""),
                }
        except Exception as e:
            logger.warning(f"YouTube oEmbed failed for {video_id}: {e}")
    return {}


async def enrich_with_llm(title: str, content: str, url: str) -> dict:
    """Call Claude Haiku to generate description, tags, and category."""
    from core.config import settings

    if not settings.ANTHROPIC_API_KEY:
        logger.info("ANTHROPIC_API_KEY not set, skipping LLM enrichment")
        return {}

    try:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        prompt = f"""Analyse cette ressource sur la transition écologique et retourne un JSON avec :
- "description_fr": un résumé en français de 2-3 phrases (max 300 caractères)
- "tags": une liste de 3-5 tags thématiques parmi [climat, biodiversité, énergie, alimentation, mobilité, habitat, économie-circulaire, justice-climatique, éducation, culture, gouvernance, coopération]
- "category": la catégorie principale (un seul tag de la liste ci-dessus)

Titre : {title}
URL : {url}
Contenu : {content[:2000]}

Réponds UNIQUEMENT avec le JSON, sans markdown ni commentaire."""

        response = await client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )

        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1].rsplit("```", 1)[0]
        return json.loads(text)

    except Exception as e:
        logger.warning(f"LLM enrichment failed: {e}")
        return {}


async def enrich_url(url: str) -> dict:
    """Main enrichment pipeline: URL -> metadata + LLM."""
    result = {"external_url": url}

    youtube_id = extract_youtube_id(url)
    if youtube_id:
        result["resource_type"] = "video"
        yt_meta = await fetch_youtube_metadata(youtube_id)
        result.update(yt_meta)

        llm = await enrich_with_llm(
            title=result.get("title", ""),
            content=result.get("title", ""),
            url=url
        )
        if llm.get("description_fr"):
            result["ai_description"] = llm["description_fr"]
        if llm.get("tags"):
            result["tags"] = llm["tags"]
    else:
        result["resource_type"] = "outil"
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(url, follow_redirects=True)
                if resp.status_code == 200:
                    html = resp.text[:5000]
                    og_title = re.search(r'<meta property="og:title" content="([^"]*)"', html)
                    html_title = re.search(r'<title>([^<]*)</title>', html)
                    if og_title:
                        result["title"] = og_title.group(1)
                    elif html_title:
                        result["title"] = html_title.group(1)

                    og_desc = re.search(r'<meta property="og:description" content="([^"]*)"', html)
                    if og_desc:
                        result["ai_description"] = og_desc.group(1)

                    og_image = re.search(r'<meta property="og:image" content="([^"]*)"', html)
                    if og_image:
                        result["thumbnail_url"] = og_image.group(1)
        except Exception as e:
            logger.warning(f"OpenGraph extraction failed for {url}: {e}")

    return result
