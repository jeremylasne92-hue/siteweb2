from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class PartnerCategory(str, Enum):
    EXPERT = "expert"           # Experts (académiciens, scientifiques, ONG, associations, entreprises, universités)
    FINANCIER = "financier"     # Financiers (investisseurs, mécènes, fondations, organismes)
    AUDIOVISUEL = "audiovisuel" # Audiovisuels (studios, plateformes, fournisseurs équipements)
    EDUCATION = "education"     # Éducation & Culture (écoles, musées, médias, organismes culturels)
    MEMBRE = "membre"           # Membres ECHO (salariés, bénévoles, ambassadeurs)

class PartnerStatus(str, Enum):
    PENDING = "pending"         # En attente de validation
    APPROVED = "approved"       # Validé et publié
    REJECTED = "rejected"       # Refusé
    SUSPENDED = "suspended"     # Suspendu

class Partner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Identité
    name: str                                    # Nom de l'organisation *
    slug: str                                    # URL-friendly (auto-généré depuis name)
    logo_url: Optional[str] = None               # URL du logo uploadé
    description: str                             # Description courte (max 300 car.) *
    description_long: Optional[str] = None       # Description détaillée
    website_url: Optional[str] = None            # Site web
    
    # Catégorisation
    category: PartnerCategory                    # Catégorie unique *
    thematics: List[str] = []                    # Codes thématiques (ENV, SOC, ECO...) *
    
    # Localisation
    address: str                                 # Adresse complète *
    city: str                                    # Ville *
    postal_code: str                             # Code postal *
    country: str = "France"                      # Pays
    latitude: float                              # Coordonnées GPS *
    longitude: float                             # Coordonnées GPS *
    
    # Contact référent
    contact_name: str                            # Nom du référent *
    contact_role: Optional[str] = None           # Fonction du référent
    contact_email: EmailStr                      # Email de contact *
    contact_phone: Optional[str] = None          # Téléphone
    
    # Réseaux sociaux
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    
    # Compte utilisateur lié (pour espace partenaire)
    user_id: Optional[str] = None                # Réf → User.id
    
    # Statut & modération
    status: PartnerStatus = PartnerStatus.PENDING
    is_featured: bool = False                    # Mis en avant sur la page
    rejection_reason: Optional[str] = None       # Motif si refusé
    
    # Métadonnées
    partnership_date: Optional[datetime] = None  # Date début partenariat officiel
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    validated_at: Optional[datetime] = None
    validated_by: Optional[str] = None           # Admin ID qui a validé

class ThematicRef(BaseModel):
    code: str       # Code unique
    label: str      # Libellé affiché
    color: str      # Couleur hex
    icon: str       # Nom icône Lucide
