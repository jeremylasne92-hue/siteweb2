from pymongo import MongoClient
from datetime import datetime
import uuid
from slugify import slugify
from dotenv import load_dotenv
import os

load_dotenv()

# Connect to MongoDB
mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
db_name = os.getenv("DB_NAME", "test_database")
client = MongoClient(mongo_url)
db = client[db_name]
print(f"Connected to MongoDB database: {db_name}")

partners_data = [
    {
        "name": "3iS Paris",
        "description": "Institut International de l'Image et du Son, formant aux métiers créatifs (cinéma, audiovisuel, son, animation, jeu vidéo).",
        "category": "education",
        "thematics": ["EDU", "ART", "TEC"],
        "address": "4 Rue Blaise Pascal",
        "city": "Élancourt",
        "postal_code": "78990",
        "country": "France",
        "latitude": 48.7845,
        "longitude": 1.9568,
        "contact_name": "Contact 3iS",
        "contact_email": "contact@3is.fr",
        "status": "approved",
        "is_featured": True
    },
    {
        "name": "Le 47",
        "description": "Espace citoyen et collectif à Paris, accueillant des acteurs engagés pour collaborer sur des thématiques de justice sociale et de transition écologique.",
        "category": "expert",
        "thematics": ["SOC", "ENV", "ECO"],
        "address": "47 Boulevard de Sébastopol",
        "city": "Paris",
        "postal_code": "75001",
        "country": "France",
        "latitude": 48.8617,
        "longitude": 2.3486,
        "contact_name": "Contact Le 47",
        "contact_email": "hello@le47.paris",
        "status": "approved",
        "is_featured": True
    },
    {
        "name": "Julien Devaureix",
        "description": "Auteur, consultant et créateur du podcast Sismique qui explore les dynamiques globales, la transition écologique et sociétale.",
        "category": "expert",
        "thematics": ["ECO", "SOC", "ENV", "SPI"],
        "address": "Paris",
        "city": "Paris",
        "postal_code": "75001",
        "country": "France",
        "latitude": 48.8550,
        "longitude": 2.3450,
        "contact_name": "Julien Devaureix",
        "contact_email": "contact@sismique.fr",
        "status": "approved",
        "is_featured": False
    },
    {
        "name": "Jean-Pierre Goux",
        "description": "Fondateur de l'ONG OneHome, auteur de la saga Siècle Bleu, engagé pour l'émergence d'une conscience planétaire via l'Overview Effect.",
        "category": "expert",
        "thematics": ["ENV", "SPI", "GEO"],
        "address": "Paris",
        "city": "Paris",
        "postal_code": "75002",
        "country": "France",
        "latitude": 48.8670,
        "longitude": 2.3440,
        "contact_name": "Jean-Pierre Goux",
        "contact_email": "jean-pierre@onehome.org",
        "status": "approved",
        "is_featured": False
    },
    {
        "name": "Camille Étienne",
        "description": "Activiste pour la justice climatique et sociale, réalisatrice et membre de collectifs œuvrant pour le soulèvement écologique.",
        "category": "expert",
        "thematics": ["ENV", "SOC"],
        "address": "Paris",
        "city": "Paris",
        "postal_code": "75003",
        "country": "France",
        "latitude": 48.8630,
        "longitude": 2.3590,
        "contact_name": "Camille Étienne",
        "contact_email": "contact@camille-etienne.fr",
        "status": "approved",
        "is_featured": False
    },
    {
        "name": "Timothée Parrique",
        "description": "Économiste, chercheur spécialiste de la décroissance et de l'économie post-croissance, auteur de 'Ralentir ou Périr'.",
        "category": "expert",
        "thematics": ["ECO", "ENV"],
        "address": "Versailles",
        "city": "Versailles",
        "postal_code": "78000",
        "country": "France",
        "latitude": 48.8014,
        "longitude": 2.1301,
        "contact_name": "Timothée Parrique",
        "contact_email": "timothee@parrique.fr",
        "status": "approved",
        "is_featured": False
    },
    {
        "name": "Cyril Dion",
        "description": "Réalisateur, poète et militant écologiste, coréalisateur du documentaire césarisé 'Demain' et fondateur du mouvement Colibris.",
        "category": "expert",
        "thematics": ["ENV", "ART", "SOC"],
        "address": "Paris",
        "city": "Paris",
        "postal_code": "75010",
        "country": "France",
        "latitude": 48.8720,
        "longitude": 2.3600,
        "contact_name": "Cyril Dion",
        "contact_email": "contact@cyrildion.com",
        "status": "approved",
        "is_featured": False
    },
    {
        "name": "Flore Vasseur",
        "description": "Réalisatrice et écrivaine, connue pour son documentaire 'Bigger Than Us' qui met en lumière des jeunes activistes du monde entier.",
        "category": "expert",
        "thematics": ["SOC", "EDU", "ART"],
        "address": "Paris",
        "city": "Paris",
        "postal_code": "75011",
        "country": "France",
        "latitude": 48.8600,
        "longitude": 2.3800,
        "contact_name": "Flore Vasseur",
        "contact_email": "contact@florevasseur.com",
        "status": "approved",
        "is_featured": False
    }
]

for p in partners_data:
    p["_id"] = str(uuid.uuid4())
    p["slug"] = slugify(p["name"])
    p["created_at"] = datetime.utcnow()
    p["updated_at"] = datetime.utcnow()
    
    # Check if exists by name to avoid duplicates
    if not db.partners.find_one({"name": p["name"]}):
        db.partners.insert_one(p)
        print(f"Inserted {p['name']}")
    else:
        print(f"Partner {p['name']} already exists")
