"""Geocode a city name to GPS coordinates via Nominatim."""
import httpx
import logging

logger = logging.getLogger(__name__)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "MouvementECHO/1.0 (contact@mouvementecho.fr)"


async def geocode_city(city: str, country: str = "France") -> tuple[float, float] | None:
    """Return (latitude, longitude) for a city, or None on failure.

    Tries with the specified country first. If country is not "France",
    falls back to a worldwide search if no result is found.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            params = {"city": city, "format": "json", "limit": "1"}
            if country:
                params["country"] = country

            resp = await client.get(
                NOMINATIM_URL,
                params=params,
                headers={"User-Agent": USER_AGENT},
            )
            resp.raise_for_status()
            data = resp.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])

            # Fallback: search without country restriction
            if country:
                params.pop("country")
                resp = await client.get(
                    NOMINATIM_URL,
                    params=params,
                    headers={"User-Agent": USER_AGENT},
                )
                resp.raise_for_status()
                data = resp.json()
                if data:
                    return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        logger.warning("Geocoding failed for city '%s' (country=%s): %s", city, country, e)
    return None
