"""
Simple email service for development
In production, replace with real email service (SendGrid, AWS SES, etc.)
"""
import logging

logger = logging.getLogger(__name__)


async def send_2fa_code(email: str, code: str) -> bool:
    """
    Send 2FA code via email
    For demo: just log the code
    """
    logger.info(f"=" * 60)
    logger.info(f"📧 EMAIL TO: {email}")
    logger.info(f"SUBJECT: Code de vérification ECHO")
    logger.info(f"")
    logger.info(f"Votre code de vérification à 4 chiffres :")
    logger.info(f"")
    logger.info(f"    {code}")
    logger.info(f"")
    logger.info(f"Ce code expire dans 10 minutes.")
    logger.info(f"Vous avez 5 tentatives maximum.")
    logger.info(f"=" * 60)
    
    # In production, use real email service:
    # async with httpx.AsyncClient() as client:
    #     await client.post("https://api.sendgrid.com/v3/mail/send", ...)
    
    return True


async def send_password_reset(email: str, reset_link: str) -> bool:
    """Send password reset link"""
    logger.info(f"📧 Password reset email to {email}: {reset_link}")
    return True
