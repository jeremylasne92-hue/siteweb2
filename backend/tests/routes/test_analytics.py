from fastapi.testclient import TestClient
from server import app, db

# Injection manuelle de la BDD pour les tests TestClient qui ne déclenchent pas les Lifespans/Events.
app.db = db

client = TestClient(app)

def test_analytics_logging_success():
    """Vérifier que le endpoint réagit en 202 Accepted"""
    payload = {
        "category": "CTA",
        "action": "click_helloasso",
        "path": "/soutenir"
    }

    response = client.post(
        "/api/analytics/events",
        json=payload
    )

    # 202 Accepted indique que le serveur l'a mis en BackgroundTask
    assert response.status_code == 202
    assert response.json()["status"] == "accepted"


def test_analytics_logging_invalid_payload():
    """
    Le tracking public ne doit JAMAIS faire d'erreur 500 ou spammer des 422
    Il doit absorber silencieusement l'erreur (drop event) et rendre 202.
    """
    payload = {
        "category": "CTA"
        # Manque paramètre requis
    }

    response = client.post(
        "/api/analytics/events",
        json=payload
    )

    assert response.status_code == 202
    assert response.json()["status"] == "dropped"
