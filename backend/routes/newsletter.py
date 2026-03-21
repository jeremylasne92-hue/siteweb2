"""Newsletter endpoints — admin-only monthly newsletter sending."""
import logging
import re
import html as html_mod
from datetime import datetime, UTC
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import User
from routes.auth import get_db, require_admin
from email_service import send_newsletter_batch, _use_sendgrid, _log_email
from core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/newsletter", tags=["Newsletter"])


class NewsletterRequest(BaseModel):
    subject: str = Field(..., min_length=1, max_length=200)
    content_text: str = Field(..., min_length=1, max_length=50000)


def _build_unsubscribe_url(user_id: str) -> str:
    """Build HMAC-signed unsubscribe URL for a user."""
    import hmac
    import hashlib

    token = hmac.new(
        settings.UNSUBSCRIBE_SECRET.encode(),
        user_id.encode(),
        hashlib.sha256,
    ).hexdigest()

    frontend_base = settings.FRONTEND_URL or "https://mouvementecho.fr"
    if settings.is_production:
        from urllib.parse import urlparse, urlunparse
        parsed = urlparse(frontend_base)
        api_base = urlunparse(parsed._replace(netloc=f"api.{parsed.netloc}"))
    else:
        api_base = frontend_base

    return f"{api_base}/api/auth/unsubscribe/{user_id}?token={token}"


def _text_to_html(content_text: str) -> str:
    """Convert plain text to HTML: paragraphs + clickable URLs."""
    url_regex = re.compile(r'(https?://[^\s<>"]+)')

    paragraphs = content_text.strip().split("\n\n")
    html_parts = []
    for para in paragraphs:
        # Collapse single newlines within a paragraph to <br>
        lines = para.strip().split("\n")
        safe_lines = []
        for line in lines:
            safe_line = html_mod.escape(line.strip())
            # Turn URLs into clickable links
            safe_line = url_regex.sub(
                r'<a href="\1" style="color:#D4AF37;text-decoration:underline;">\1</a>',
                safe_line,
            )
            safe_lines.append(safe_line)
        html_parts.append(
            f"<p style='line-height:1.7;font-size:15px;margin:0 0 16px;'>"
            f"{'<br>'.join(safe_lines)}</p>"
        )
    return "".join(html_parts)


def _build_newsletter_html(subject: str, content_text: str, unsubscribe_url: str = "") -> str:
    """Build full newsletter HTML using ECHO design system."""
    safe_subject = html_mod.escape(subject)
    body_html = _text_to_html(content_text)
    site_url = "https://mouvementecho.fr"

    unsub_block = ""
    if unsubscribe_url:
        unsub_block = (
            f"<p style='margin:12px 0 0;font-size:11px;'>"
            f"<a href='{unsubscribe_url}' style='color:#D4AF37;text-decoration:underline;'>"
            f"Se d\u00e9sinscrire de la newsletter</a></p>"
        )

    return (
        f"<div style='font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;"
        f"background:#0a0a0a;color:#e0e0e0;border-radius:12px;overflow:hidden;'>"
        # Header
        f"<div style='background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px;text-align:center;'>"
        f"<h1 style='color:#D4AF37;font-size:28px;margin:0;letter-spacing:2px;'>ECHO</h1>"
        f"<p style='color:#aaa;font-size:13px;margin:8px 0 0;'>Mouvement citoyen &amp; documentaire</p>"
        f"</div>"
        # Body
        f"<div style='padding:32px;'>"
        f"<h2 style='color:#D4AF37;font-size:22px;margin:0 0 24px;'>{safe_subject}</h2>"
        f"{body_html}"
        f"<p style='margin-top:24px;font-size:15px;'>"
        f"Chaleureusement,<br><strong>L'\u00e9quipe ECHO</strong></p>"
        f"</div>"
        # Footer
        f"<div style='background:#111;padding:20px 32px;text-align:center;"
        f"font-size:12px;color:#666;'>"
        f"<p style='margin:0;'>Mouvement ECHO &mdash; "
        f"<a href='{site_url}' style='color:#D4AF37;text-decoration:none;'>mouvementecho.fr</a></p>"
        f"{unsub_block}"
        f"</div>"
        f"</div>"
    )


@router.get("/subscribers/count")
async def get_subscriber_count(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return count of users who have not opted out of emails."""
    count = await db.users.count_documents({"email_opt_out": {"$ne": True}})
    return {"count": count}


@router.get("/subscribers/stats")
async def get_subscriber_stats(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return active / opted-out / total subscriber counts."""
    total = await db.users.count_documents({})
    opted_out = await db.users.count_documents({"email_opt_out": True})
    active = total - opted_out
    return {"active": active, "opted_out": opted_out, "total": total}


@router.post("/test")
async def send_test_newsletter(
    data: NewsletterRequest,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Send a test newsletter to the admin's own email."""
    unsub_url = _build_unsubscribe_url(admin.id)
    html_content = _build_newsletter_html(data.subject, data.content_text, unsub_url)

    if _use_sendgrid():
        from email_service import _send_via_sendgrid
        success = await _send_via_sendgrid(admin.email, data.subject, html_content)
    else:
        success = await _log_email(admin.email, data.subject, data.content_text)

    if not success:
        raise HTTPException(status_code=502, detail="Failed to send test email")

    logger.info(f"Admin {admin.id} sent test newsletter to {admin.email}")
    return {"message": f"Test envoy\u00e9 \u00e0 {admin.email}"}


async def _send_newsletter_background(
    newsletter_id: str,
    subject: str,
    content_text: str,
    admin_id: str,
    db: AsyncIOMotorDatabase,
):
    """Background task: send newsletter to all opted-in users in batches."""
    # Fetch eligible users (not opted out)
    cursor = db.users.find(
        {"email_opt_out": {"$ne": True}},
        {"email": 1, "id": 1, "_id": 0},
    )
    users = await cursor.to_list(length=100000)

    if not users:
        await db.newsletters.update_one(
            {"id": newsletter_id},
            {"$set": {"status": "sent", "recipient_count": 0, "error_count": 0, "sent_at": datetime.now(UTC)}},
        )
        return

    total = len(users)
    error_count = 0
    batch_size = 100

    await db.newsletters.update_one(
        {"id": newsletter_id},
        {"$set": {"status": "sending", "recipient_count": total}},
    )

    # Process in batches
    for i in range(0, total, batch_size):
        batch_users = users[i : i + batch_size]

        # Build per-user HTML with individual unsubscribe links
        emails = []
        html_contents = []
        for u in batch_users:
            unsub_url = _build_unsubscribe_url(u["id"])
            user_html = _build_newsletter_html(subject, content_text, unsub_url)
            emails.append(u["email"])
            html_contents.append(user_html)

        try:
            success = await send_newsletter_batch(emails, subject, html_contents)
            if not success:
                error_count += len(batch_users)
        except Exception as e:
            logger.error(f"Newsletter batch {i // batch_size} failed: {e}")
            error_count += len(batch_users)

    # Determine final status
    if error_count == 0:
        final_status = "sent"
    elif error_count < total:
        final_status = "partial"
    else:
        final_status = "failed"

    await db.newsletters.update_one(
        {"id": newsletter_id},
        {
            "$set": {
                "status": final_status,
                "recipient_count": total,
                "error_count": error_count,
                "sent_at": datetime.now(UTC),
            }
        },
    )
    logger.info(
        f"Newsletter {newsletter_id} finished: status={final_status}, "
        f"recipients={total}, errors={error_count}"
    )


@router.post("/send")
async def send_newsletter(
    data: NewsletterRequest,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Send newsletter to all opted-in users. Runs in background."""
    import uuid

    newsletter_id = str(uuid.uuid4())
    newsletter_doc = {
        "id": newsletter_id,
        "subject": data.subject,
        "content_text": data.content_text,
        "content_html": _build_newsletter_html(data.subject, data.content_text),
        "sent_by": admin.id,
        "status": "draft",
        "recipient_count": 0,
        "error_count": 0,
        "created_at": datetime.now(UTC),
        "sent_at": None,
    }
    await db.newsletters.insert_one(newsletter_doc)

    background_tasks.add_task(
        _send_newsletter_background,
        newsletter_id,
        data.subject,
        data.content_text,
        admin.id,
        db,
    )

    logger.info(f"Admin {admin.id} triggered newsletter send: {newsletter_id}")
    return {"message": "Newsletter en cours d'envoi", "newsletter_id": newsletter_id}


@router.get("/history")
async def get_newsletter_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List sent newsletters, most recent first (paginated)."""
    skip = (page - 1) * limit
    total = await db.newsletters.count_documents({})
    cursor = db.newsletters.find(
        {},
        {"_id": 0, "content_html": 0},
    ).sort("created_at", -1).skip(skip).limit(limit)

    items = await cursor.to_list(length=limit)

    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if total else 0,
    }
