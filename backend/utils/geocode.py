"""Geocode a French city name to GPS coordinates via Nominatim."""
import httpx
import logging

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "MouvementECHO/1.0 (contact@mouvementecho.fr)"


async def geocode_city(city: str) -> tuple[float, float] | None:
    """Return (latitude, longitude) for a French city, or None on failure."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                NOMINATIM_URL,
                params={"city": city, "country": "France", "format": "json", "limit": "1"},
                headers={"User-Agent": USER_AGENT},
            )
            resp.raise_for_status()
            data = resp.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        logger.warning("Geocoding failed for city '%s': %s", city, e)
    return None
