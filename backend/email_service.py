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
    """Send password reset link via email."""
    logger.info(f"=" * 60)
    logger.info(f"📧 EMAIL TO: {email}")
    logger.info(f"SUBJECT: Réinitialisation de votre mot de passe ECHO")
    logger.info(f"")
    logger.info(f"Vous avez demandé la réinitialisation de votre mot de passe.")
    logger.info(f"Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :")
    logger.info(f"")
    logger.info(f"    {reset_link}")
    logger.info(f"")
    logger.info(f"Ce lien expire dans 1 heure.")
    logger.info(f"Si vous n'avez pas fait cette demande, ignorez cet email.")
    logger.info(f"=" * 60)
    return True

async def send_email(email: str, subject: str, message: str) -> bool:
    """Generic email sender (stub)"""
    logger.info(f"=" * 60)
    logger.info(f"📧 EMAIL TO: {email}")
    logger.info(f"SUBJECT: {subject}")
    logger.info(f"")
    logger.info(f"{message}")
    logger.info(f"=" * 60)
    return True
