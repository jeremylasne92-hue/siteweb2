"""
Email service for ECHO backend.
Uses SendGrid HTTP API in production, logs to console in development.

Setup for production:
1. Set SENDGRID_API_KEY in .env
2. Set EMAIL_FROM to a verified sender in SendGrid
3. Set ENVIRONMENT=production
"""
import logging
import httpx
from core.config import settings

logger = logging.getLogger(__name__)

SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send"


async def _send_via_sendgrid(to_email: str, subject: str, html_content: str) -> bool:
    """Send email via SendGrid HTTP API."""
    payload = {
        "personalizations": [{"to": [{"email": to_email}]}],
        "from": {"email": settings.EMAIL_FROM, "name": settings.EMAIL_FROM_NAME},
        "subject": subject,
        "content": [{"type": "text/html", "value": html_content}],
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                SENDGRID_API_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
        if resp.status_code in (200, 201, 202):
            logger.info(f"Email sent to {to_email}: {subject}")
            return True
        logger.error(f"SendGrid error {resp.status_code}: {resp.text}")
        return False
    except httpx.HTTPError as e:
        logger.error(f"SendGrid request failed: {e}")
        return False


async def _log_email(to_email: str, subject: str, body: str) -> bool:
    """Development fallback: log email to console."""
    logger.info("=" * 60)
    logger.info(f"[DEV] EMAIL TO: {to_email}")
    logger.info(f"SUBJECT: {subject}")
    logger.info(f"")
    logger.info(body)
    logger.info("=" * 60)
    return True


def _use_sendgrid() -> bool:
    """Check if SendGrid is configured."""
    return bool(settings.SENDGRID_API_KEY) and settings.is_production


async def send_2fa_code(email: str, code: str) -> bool:
    """Send 2FA verification code via email."""
    subject = "Code de verification ECHO"
    html = (
        f"<h2>Code de verification</h2>"
        f"<p>Votre code de verification a 6 chiffres :</p>"
        f"<p style='font-size:32px;font-weight:bold;letter-spacing:8px;'>{code}</p>"
        f"<p>Ce code expire dans 10 minutes. Vous avez 5 tentatives maximum.</p>"
        f"<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Code: [REDACTED] (6 digits, expires 10min)")


async def send_password_reset(email: str, reset_link: str) -> bool:
    """Send password reset link via email."""
    subject = "Reinitialisation de votre mot de passe ECHO"
    html = (
        f"<h2>Reinitialisation de mot de passe</h2>"
        f"<p>Vous avez demande la reinitialisation de votre mot de passe.</p>"
        f"<p>Cliquez sur le lien ci-dessous pour definir un nouveau mot de passe :</p>"
        f"<p><a href='{reset_link}'>{reset_link}</a></p>"
        f"<p>Ce lien expire dans 1 heure.</p>"
        f"<p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Reset link: {reset_link}\nExpires in 1 hour.")


async def send_email(email: str, subject: str, message: str) -> bool:
    """Generic email sender for notifications."""
    html = f"<div style='white-space:pre-line;'>{message}</div>"
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, message)
