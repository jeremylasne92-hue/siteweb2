"""
Configuration centralisée pour le backend ECHO.
Toutes les variables d'environnement sont chargées ici et validées au démarrage.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Database
    MONGO_URL: str = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.environ.get("DB_NAME", "test_database")

    # CORS
    CORS_ORIGINS: str = os.environ.get("CORS_ORIGINS", "http://localhost:5173")

    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.environ.get("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.environ.get(
        "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback"
    )

    # Frontend
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    # Security
    OAUTH_STATE_SECRET: str = os.environ.get("OAUTH_STATE_SECRET", "change-me-in-production")
    RECAPTCHA_SECRET_KEY: str = os.environ.get("RECAPTCHA_SECRET_KEY", "")

    # Email (SendGrid)
    SENDGRID_API_KEY: str = os.environ.get("SENDGRID_API_KEY", "")
    EMAIL_FROM: str = os.environ.get("EMAIL_FROM", "noreply@mouvement-echo.fr")
    EMAIL_FROM_NAME: str = os.environ.get("EMAIL_FROM_NAME", "Mouvement ECHO")

    # Watchdog monitoring
    ALERT_EMAILS: str = os.environ.get("ALERT_EMAILS", "mouvement.echo.france@gmail.com")
    WATCHDOG_INTERVAL_HOURS: int = int(os.environ.get("WATCHDOG_INTERVAL_HOURS", "1"))
    WATCHDOG_STALE_PARTNER_DAYS: int = int(os.environ.get("WATCHDOG_STALE_PARTNER_DAYS", "5"))
    WATCHDOG_STALE_CANDIDATURE_DAYS: int = int(os.environ.get("WATCHDOG_STALE_CANDIDATURE_DAYS", "7"))
    WATCHDOG_STALE_CONTACT_HOURS: int = int(os.environ.get("WATCHDOG_STALE_CONTACT_HOURS", "48"))
    WATCHDOG_ALERT_COOLDOWN_HOURS: int = int(os.environ.get("WATCHDOG_ALERT_COOLDOWN_HOURS", "24"))
    WATCHDOG_ADMIN_INACTIVE_DAYS: int = int(os.environ.get("WATCHDOG_ADMIN_INACTIVE_DAYS", "3"))

    # Booking (Google Calendar appointment link)
    BOOKING_URL: str = os.environ.get("BOOKING_URL", "https://calendar.app.google/GSpXrQq72uqWhhSx9")

    # Unsubscribe
    UNSUBSCRIBE_SECRET: str = os.environ.get("UNSUBSCRIBE_SECRET", "echo-unsubscribe-secret-change-me")

    # Environment
    ENVIRONMENT: str = os.environ.get("ENVIRONMENT", "development")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    def validate(self) -> None:
        """Validate that critical settings are present."""
        import logging
        logger = logging.getLogger(__name__)

        missing = []
        if not self.GOOGLE_CLIENT_ID or self.GOOGLE_CLIENT_ID == "your_google_client_id_here":
            missing.append("GOOGLE_CLIENT_ID")
        if not self.GOOGLE_CLIENT_SECRET or self.GOOGLE_CLIENT_SECRET == "your_google_client_secret_here":
            missing.append("GOOGLE_CLIENT_SECRET")
        if missing:
            logger.warning(
                f"Missing or placeholder OAuth config: {', '.join(missing)}. "
                "Google OAuth will not work until these are set in .env"
            )

        # Enforce strong secrets in production
        if self.is_production:
            if self.OAUTH_STATE_SECRET == "change-me-in-production":
                raise ValueError("OAUTH_STATE_SECRET must be changed from default in production")
            if self.UNSUBSCRIBE_SECRET == "echo-unsubscribe-secret-change-me":
                raise ValueError("UNSUBSCRIBE_SECRET must be changed from default in production")
            if not self.SENDGRID_API_KEY:
                raise ValueError("SENDGRID_API_KEY is required in production for email delivery")
            if not self.RECAPTCHA_SECRET_KEY:
                raise ValueError("RECAPTCHA_SECRET_KEY is required in production for spam protection")


settings = Settings()
