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
        "reply_to": {"email": settings.EMAIL_REPLY_TO, "name": settings.EMAIL_FROM_NAME},
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
    import html as html_mod

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
        base = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') and settings.FRONTEND_URL else "https://mouvementecho.fr"
        unsubscribe = (
            f'<p style="margin-top:20px;font-size:11px;color:#888;text-align:center;">'
            f'Pour vous desinscrire des emails : '
            f'<a href="{base}/api/auth/unsubscribe/{user_id}?token={token}" style="color:#D4AF37;">cliquez ici</a></p>'
        )
    safe_message = html_mod.escape(message)
    html = f"<div style='white-space:pre-line;'>{safe_message}</div>{unsubscribe}"
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
    import html as html_mod
    label = PROJECT_LABELS.get(project, project)
    safe_name = html_mod.escape(name)
    subject = f"Candidature reçue — {label}"
    html = (
        f"<h2>Bonjour {safe_name},</h2>"
        f"<p>Nous avons bien reçu votre candidature pour le projet <strong>{label}</strong> "
        f"et nous vous remercions pour l'intérêt que vous portez au Mouvement ECHO.</p>"
        f"<p>Notre équipe prendra le temps d'examiner votre profil avec attention. "
        f"Nous reviendrons vers vous dans les meilleurs délais pour vous tenir "
        f"informé(e) de la suite donnée à votre candidature.</p>"
        f"<p>En attendant, n'hésitez pas à suivre nos actualités sur notre site.</p>"
        f"<p>Bien cordialement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Confirmation candidature {label} pour {name}")


async def send_candidature_interview(email: str, name: str, booking_url: str) -> bool:
    """Send interview invitation with a booking link."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Invitation à un entretien — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {safe_name},</h2>"
        f"<p>Bonne nouvelle ! Votre candidature a retenu toute notre attention "
        f"et nous aimerions échanger avec vous lors d'un court entretien.</p>"
        f"<p>Cet échange nous permettra de mieux comprendre vos motivations "
        f"et de vous présenter le projet plus en détail. "
        f"C'est avant tout une discussion ouverte et bienveillante.</p>"
        f"<p style='text-align:center;margin:24px 0;'>"
        f"<a href='{booking_url}' style='background:#D4AF37;color:#fff;padding:12px 32px;"
        f"text-decoration:none;border-radius:6px;font-weight:bold;'>Réserver mon créneau d'entretien</a></p>"
        f"<p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>"
        f"<p>{booking_url}</p>"
        f"<p>Si aucun créneau ne vous convient, répondez simplement à cet email "
        f"et nous trouverons un moment adapté.</p>"
        f"<p>À très bientôt,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Invitation entretien pour {name} — {booking_url}")


async def send_candidature_accepted(email: str, name: str, project: str) -> bool:
    """Send acceptance notification email."""
    import html as html_mod
    label = PROJECT_LABELS.get(project, project)
    safe_name = html_mod.escape(name)
    subject = f"Bienvenue dans l'équipe — {label}"
    html = (
        f"<h2>Bonjour {safe_name},</h2>"
        f"<p>Nous avons le plaisir de vous confirmer que votre candidature pour "
        f"le projet <strong>{label}</strong> a été retenue. "
        f"Bienvenue dans l'aventure ECHO !</p>"
        f"<p>Un membre de notre équipe vous contactera très prochainement "
        f"pour vous présenter les prochaines étapes et faciliter votre intégration.</p>"
        f"<p>Nous sommes ravis de vous compter parmi nous "
        f"et avons hâte de collaborer avec vous.</p>"
        f"<p>Chaleureusement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Candidature acceptée — {label} pour {name}")


async def send_candidature_rejected(email: str, name: str, status_note: str | None) -> bool:
    """Send rejection notification with optional reason."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Retour sur votre candidature — Mouvement ECHO"
    reason_html = ""
    reason_text = ""
    if status_note:
        safe_note = html_mod.escape(status_note)
        reason_html = f"<p><strong>Motif :</strong> {safe_note}</p>"
        reason_text = f"\nMotif : {status_note}"
    html = (
        f"<h2>Bonjour {safe_name},</h2>"
        f"<p>Nous tenons à vous remercier pour le temps que vous avez consacré "
        f"à votre candidature auprès du Mouvement ECHO.</p>"
        f"<p>Après un examen attentif de votre profil, nous ne sommes malheureusement "
        f"pas en mesure d'y donner une suite favorable pour le moment.</p>"
        f"{reason_html}"
        f"<p>Cette décision ne remet en aucun cas en question vos compétences. "
        f"Nous vous encourageons à rester attentif(ve) à nos prochains appels "
        f"à candidatures — nos besoins évoluent et votre profil pourrait "
        f"correspondre à de futures opportunités.</p>"
        f"<p>Nous vous souhaitons le meilleur dans vos projets.</p>"
        f"<p>Cordialement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Candidature non retenue pour {name}{reason_text}")


# --- Volunteer email functions ---


async def send_volunteer_confirmation(email: str, name: str) -> bool:
    """Send confirmation email when a volunteer application is submitted."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Candidature bénévole reçue — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {safe_name},</h2>"
        f"<p>Nous avons bien reçu votre candidature bénévole "
        f"et nous vous remercions pour l'intérêt que vous portez au Mouvement ECHO.</p>"
        f"<p>Notre équipe prendra le temps d'examiner votre profil avec attention. "
        f"Nous reviendrons vers vous dans les meilleurs délais pour vous tenir "
        f"informé(e) de la suite donnée à votre candidature.</p>"
        f"<p>En attendant, n'hésitez pas à suivre nos actualités sur notre site.</p>"
        f"<p>Bien cordialement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Confirmation candidature bénévole pour {name}")


async def send_volunteer_interview(email: str, name: str, booking_url: str) -> bool:
    """Send interview invitation with a booking link for volunteer applicants."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Invitation à un entretien — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {safe_name},</h2>"
        f"<p>Bonne nouvelle ! Votre candidature bénévole a retenu toute notre attention "
        f"et nous aimerions échanger avec vous lors d'un court entretien.</p>"
        f"<p>Cet échange nous permettra de mieux comprendre vos motivations "
        f"et de vous présenter le projet plus en détail. "
        f"C'est avant tout une discussion ouverte et bienveillante.</p>"
        f"<p style='text-align:center;margin:24px 0;'>"
        f"<a href='{booking_url}' style='background:#D4AF37;color:#fff;padding:12px 32px;"
        f"text-decoration:none;border-radius:6px;font-weight:bold;'>Réserver mon créneau d'entretien</a></p>"
        f"<p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>"
        f"<p>{booking_url}</p>"
        f"<p>Si aucun créneau ne vous convient, répondez simplement à cet email "
        f"et nous trouverons un moment adapté.</p>"
        f"<p>À très bientôt,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Invitation entretien bénévole pour {name} — {booking_url}")


async def send_volunteer_accepted(email: str, name: str) -> bool:
    """Send acceptance notification email for volunteer applicants."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Bienvenue dans l'équipe — Mouvement ECHO"
    html = (
        f"<h2>Bonjour {safe_name},</h2>"
        f"<p>Nous avons le plaisir de vous confirmer que votre candidature bénévole "
        f"a été retenue. Bienvenue dans l'aventure ECHO !</p>"
        f"<p>Un membre de notre équipe vous contactera très prochainement "
        f"pour vous présenter les prochaines étapes et faciliter votre intégration.</p>"
        f"<p>Nous sommes ravis de vous compter parmi nous "
        f"et avons hâte de collaborer avec vous.</p>"
        f"<p>Chaleureusement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Candidature bénévole acceptée pour {name}")


async def send_volunteer_rejected(email: str, name: str, status_note: str | None) -> bool:
    """Send rejection notification with optional reason for volunteer applicants."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Retour sur votre candidature — Mouvement ECHO"
    reason_html = ""
    reason_text = ""
    if status_note:
        safe_note = html_mod.escape(status_note)
        reason_html = f"<p><strong>Motif :</strong> {safe_note}</p>"
        reason_text = f"\nMotif : {status_note}"
    html = (
        f"<h2>Bonjour {safe_name},</h2>"
        f"<p>Nous tenons à vous remercier pour le temps que vous avez consacré "
        f"à votre candidature bénévole auprès du Mouvement ECHO.</p>"
        f"<p>Après un examen attentif de votre profil, nous ne sommes malheureusement "
        f"pas en mesure d'y donner une suite favorable pour le moment.</p>"
        f"{reason_html}"
        f"<p>Cette décision ne remet en aucun cas en question vos compétences. "
        f"Nous vous encourageons à rester attentif(ve) à nos prochains appels "
        f"à candidatures — nos besoins évoluent et votre profil pourrait "
        f"correspondre à de futures opportunités.</p>"
        f"<p>Nous vous souhaitons le meilleur dans vos projets.</p>"
        f"<p>Cordialement,<br>L'équipe Mouvement ECHO</p>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(email, subject, html)
    return await _log_email(email, subject, f"Candidature bénévole non retenue pour {name}{reason_text}")


# --- Student/intern application email functions ---


async def send_student_confirmation(to_email: str, name: str) -> bool:
    """Send confirmation email when a student/intern application is submitted."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Candidature stage reçue — Mouvement ECHO"
    html = (
        f"<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>"
        f"<h2 style='color:#D4AF37;'>Bonjour {safe_name},</h2>"
        f"<p>Nous avons bien reçu votre candidature de stage "
        f"et nous vous remercions pour l'intérêt que vous portez au Mouvement ECHO.</p>"
        f"<p>Notre équipe prendra le temps d'examiner votre profil avec attention. "
        f"Nous reviendrons vers vous dans les meilleurs délais pour vous tenir "
        f"informé(e) de la suite donnée à votre candidature.</p>"
        f"<p>En attendant, n'hésitez pas à suivre nos actualités sur notre site.</p>"
        f"<p>Bien cordialement,<br>L'équipe Mouvement ECHO</p>"
        f"</div>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(to_email, subject, html)
    return await _log_email(to_email, subject, f"Confirmation candidature stage pour {name}")


async def send_student_interview(to_email: str, name: str, booking_url: str) -> bool:
    """Send interview invitation with a booking link for student/intern applicants."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Invitation à un entretien — Mouvement ECHO"
    html = (
        f"<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>"
        f"<h2 style='color:#D4AF37;'>Bonjour {safe_name},</h2>"
        f"<p>Bonne nouvelle ! Votre candidature de stage a retenu toute notre attention "
        f"et nous aimerions échanger avec vous lors d'un court entretien.</p>"
        f"<p>Cet échange nous permettra de mieux comprendre vos motivations "
        f"et de vous présenter le projet plus en détail. "
        f"C'est avant tout une discussion ouverte et bienveillante.</p>"
        f"<p style='text-align:center;margin:24px 0;'>"
        f"<a href='{booking_url}' style='background:#D4AF37;color:#fff;padding:12px 32px;"
        f"text-decoration:none;border-radius:6px;font-weight:bold;'>Réserver mon créneau d'entretien</a></p>"
        f"<p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>"
        f"<p>{booking_url}</p>"
        f"<p>Si aucun créneau ne vous convient, répondez simplement à cet email "
        f"et nous trouverons un moment adapté.</p>"
        f"<p>À très bientôt,<br>L'équipe Mouvement ECHO</p>"
        f"</div>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(to_email, subject, html)
    return await _log_email(to_email, subject, f"Invitation entretien stage pour {name} — {booking_url}")


async def send_student_accepted(to_email: str, name: str) -> bool:
    """Send acceptance notification email for student/intern applicants."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Bienvenue dans l'équipe — Mouvement ECHO"
    html = (
        f"<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>"
        f"<h2 style='color:#D4AF37;'>Bonjour {safe_name},</h2>"
        f"<p>Nous avons le plaisir de vous confirmer que votre candidature de stage "
        f"a été retenue pour la production de notre série documentaire. "
        f"Bienvenue dans l'aventure ECHO !</p>"
        f"<p>Un membre de notre équipe vous contactera très prochainement "
        f"pour vous présenter les prochaines étapes et faciliter votre intégration.</p>"
        f"<p>Nous sommes ravis de vous compter parmi nous "
        f"et avons hâte de collaborer avec vous.</p>"
        f"<p>Chaleureusement,<br>L'équipe Mouvement ECHO</p>"
        f"</div>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(to_email, subject, html)
    return await _log_email(to_email, subject, f"Candidature stage acceptée pour {name}")


async def send_student_rejected(to_email: str, name: str, status_note: str = "") -> bool:
    """Send rejection notification with optional reason for student/intern applicants."""
    import html as html_mod
    safe_name = html_mod.escape(name)
    subject = "Retour sur votre candidature — Mouvement ECHO"
    reason_html = ""
    reason_text = ""
    if status_note:
        safe_note = html_mod.escape(status_note)
        reason_html = f"<p><strong>Motif :</strong> {safe_note}</p>"
        reason_text = f"\nMotif : {status_note}"
    html = (
        f"<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;'>"
        f"<h2 style='color:#D4AF37;'>Bonjour {safe_name},</h2>"
        f"<p>Nous tenons à vous remercier pour le temps que vous avez consacré "
        f"à votre candidature de stage auprès du Mouvement ECHO.</p>"
        f"<p>Après un examen attentif de votre profil, nous ne sommes malheureusement "
        f"pas en mesure d'y donner une suite favorable pour le moment.</p>"
        f"{reason_html}"
        f"<p>Cette décision ne remet en aucun cas en question vos compétences. "
        f"Nous vous encourageons à rester attentif(ve) à nos prochains appels "
        f"à candidatures — nos besoins évoluent et votre profil pourrait "
        f"correspondre à de futures opportunités.</p>"
        f"<p>Nous vous souhaitons le meilleur dans vos projets.</p>"
        f"<p>Cordialement,<br>L'équipe Mouvement ECHO</p>"
        f"</div>"
    )
    if _use_sendgrid():
        return await _send_via_sendgrid(to_email, subject, html)
    return await _log_email(to_email, subject, f"Candidature stage non retenue pour {name}{reason_text}")
