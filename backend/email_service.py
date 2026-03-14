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


async def send_email(email: str, subject: str, message: str, user_id: str = None, db=None) -> bool:
    """Generic email sender for notifications. Checks email_opt_out if user_id and db provided."""
    # Check opt-out for non-transactional emails
    if user_id and db:
        user = await db.users.find_one({"id": user_id}, {"email_opt_out": 1})
        if user and user.get("email_opt_out"):
            logger.info(f"Email skipped for {email}: user opted out")
            return True

    unsubscribe = ""
    if user_id:
        import hmac, hashlib
        token = hmac.new(
            settings.UNSUBSCRIBE_SECRET.encode(),
            user_id.encode(),
            hashlib.sha256
        ).hexdigest()
        base = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') and settings.FRONTEND_URL else "https://mouvement-echo.fr"
        unsubscribe = (
            f'<p style="margin-top:20px;font-size:11px;color:#888;text-align:center;">'
            f'Pour vous desinscrire des emails : '
            f'<a href="{base}/api/auth/unsubscribe/{user_id}?token={token}" style="color:#D4AF37;">cliquez ici</a></p>'
        )
    html = f"<div style='white-space:pre-line;'>{message}</div>{unsubscribe}"
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, message)


# --- Candidature email functions ---

PROJECT_LABELS = {
    "cognisphere": "CogniSphère",
    "echolink": "ECHOLink",
    "scenariste": "Scénariste",
}


async def send_candidature_confirmation(email: str, name: str, project: str) -> bool:
    """Send confirmation email when a candidature is submitted."""
    label = PROJECT_LABELS.get(project, project)
    subject = f"Candidature reçue — {label}"
    html = (
        f"<h2>Merci pour votre candidature, {name} !</h2>"
        f"<p>Nous avons bien reçu votre candidature pour le projet <strong>{label}</strong>.</p>"
        f"<p>Notre équipe examinera votre profil et reviendra vers vous dans les meilleurs délais.</p>"
        f"<p>À bientôt,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Confirmation candidature {label} pour {name}")


async def send_candidature_interview(email: str, name: str, booking_url: str) -> bool:
    """Send interview invitation with a booking link."""
    subject = "Entretien — Mouvement ECHO"
    html = (
        f"<h2>Félicitations, {name} !</h2>"
        f"<p>Votre candidature a retenu notre attention et nous aimerions vous rencontrer.</p>"
        f"<p>Réservez un créneau pour votre entretien :</p>"
        f"<p style='text-align:center;margin:24px 0;'>"
        f"<a href='{booking_url}' style='background:#D4AF37;color:#fff;padding:12px 32px;"
        f"text-decoration:none;border-radius:6px;font-weight:bold;'>Réserver mon entretien</a></p>"
        f"<p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>"
        f"<p>{booking_url}</p>"
        f"<p>À bientôt,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Invitation entretien pour {name} — {booking_url}")


async def send_candidature_accepted(email: str, name: str, project: str) -> bool:
    """Send acceptance notification email."""
    label = PROJECT_LABELS.get(project, project)
    subject = f"Candidature acceptée — {label}"
    html = (
        f"<h2>Bienvenue dans l'équipe, {name} !</h2>"
        f"<p>Nous avons le plaisir de vous informer que votre candidature pour "
        f"le projet <strong>{label}</strong> a été acceptée.</p>"
        f"<p>Un membre de l'équipe vous contactera prochainement pour les prochaines étapes.</p>"
        f"<p>À très bientôt,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Candidature acceptée — {label} pour {name}")


async def send_candidature_rejected(email: str, name: str, status_note: str | None) -> bool:
    """Send rejection notification with optional reason."""
    subject = "Candidature — Mouvement ECHO"
    reason_html = ""
    reason_text = ""
    if status_note:
        reason_html = f"<p><strong>Motif :</strong> {status_note}</p>"
        reason_text = f"\nMotif : {status_note}"
    html = (
        f"<h2>Merci pour votre intérêt, {name}</h2>"
        f"<p>Après examen attentif de votre candidature, nous ne sommes malheureusement "
        f"pas en mesure de donner suite pour le moment.</p>"
        f"{reason_html}"
        f"<p>Nous vous encourageons à suivre nos prochains appels à candidatures.</p>"
        f"<p>Cordialement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Candidature non retenue pour {name}{reason_text}")
