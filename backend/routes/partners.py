from fastapi.responses import StreamingResponse
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks, Request
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, UTC
import csv
import io
import json
import logging
import os
import re
import shutil
import uuid as uuid_mod
import slugify
from PIL import Image

from pymongo.errors import PyMongoError
from models import User, UserRole, UserCreate
from models_partner import Partner, PartnerCategory, PartnerStatus, ThematicRef
from routes.auth import get_current_user, require_admin, get_db, hash_password
from email_service import send_email
from utils.rate_limit import anonymize_ip, check_rate_limit
from utils.audit import log_admin_action
from utils.date_helpers import format_date_csv
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/partners", tags=["Partners"])
LOGO_MAX_SIZE = 2 * 1024 * 1024  # 2 Mo
LOGO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

# ==============================================================================
# SCHEMAS (Pydantic Models for requests/responses)
# ==============================================================================

class ApplyPartnerRequest(BaseModel):
    name: str
    category: PartnerCategory
    thematics: str # JSON string of list
    description: str
    description_long: Optional[str] = None
    address: str
    city: str
    postal_code: str
    country: str = "France"
    latitude: float
    longitude: float
    contact_name: str
    contact_role: Optional[str] = None
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    password: str

class RejectReason(BaseModel):
    reason: str

class PaginatedPartners(BaseModel):
    partners: List[Partner]
    total: int
    has_more: bool

# ==============================================================================
# PUBLIC ENDPOINTS
# ==============================================================================

@router.get("/thematics", response_model=List[ThematicRef])
async def get_thematics(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all thematics reference data"""
    # Insert initial data if collection is empty
    count = await db.thematics_ref.count_documents({})
    if count == 0:
        initial_data = [
            {"code": "ENV", "label": "Environnement & Climat", "color": "#10B981", "icon": "Leaf"},
            {"code": "SOC", "label": "Justice sociale", "color": "#EF4444", "icon": "Users"},
            {"code": "ECO", "label": "Économie alternative", "color": "#F59E0B", "icon": "TrendingUp"},
            {"code": "EDU", "label": "Éducation & Pédagogie", "color": "#8B5CF6", "icon": "GraduationCap"},
            {"code": "TEC", "label": "Technologies & IA", "color": "#3B82F6", "icon": "Cpu"},
            {"code": "SAN", "label": "Santé & Bien-être", "color": "#EC4899", "icon": "Heart"},
            {"code": "ART", "label": "Art & Culture", "color": "#D4AF37", "icon": "Palette"},
            {"code": "GEO", "label": "Géopolitique & Citoyenneté", "color": "#6366F1", "icon": "Globe"},
            {"code": "SPI", "label": "Spiritualité & Philosophie", "color": "#A855F7", "icon": "Sparkles"},
            {"code": "AGR", "label": "Agriculture & Alimentation", "color": "#84CC16", "icon": "Wheat"}
        ]
        await db.thematics_ref.insert_many(initial_data)
        
    cursor = db.thematics_ref.find({}, {"_id": 0})
    return await cursor.to_list(length=100)

@router.get("/stats")
async def get_partner_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get public statistics for approved partners"""
    pipeline = [
        {"$match": {"status": PartnerStatus.APPROVED}},
        {"$facet": {
            "total": [{"$count": "count"}],
            "by_category": [{"$group": {"_id": "$category", "count": {"$sum": 1}}}],
            "by_thematic": [{"$unwind": "$thematics"}, {"$group": {"_id": "$thematics", "count": {"$sum": 1}}}]
        }}
    ]
    
    result = await db.partners.aggregate(pipeline).to_list(1)
    data = result[0]
    
    return {
        "total": data["total"][0]["count"] if data["total"] else 0,
        "by_category": {item["_id"]: item["count"] for item in data["by_category"]},
        "by_thematic": {item["_id"]: item["count"] for item in data["by_thematic"]}
    }

# Fields to strip from public partner responses (RGPD art. 5)
PUBLIC_EXCLUDED_FIELDS = {"contact_email", "contact_phone", "ip_address"}

def sanitize_partner_for_public(partner: Partner) -> dict:
    """Remove personal contact data from partner for public display."""
    data = partner.model_dump()
    for field in PUBLIC_EXCLUDED_FIELDS:
        data.pop(field, None)
    return data

@router.get("")
async def get_public_partners(
    category: Optional[PartnerCategory] = None,
    thematic: Optional[str] = None, # Comma separated list
    search: Optional[str] = None,
    bounds: Optional[str] = None, # lat_min,lng_min,lat_max,lng_max
    skip: int = 0,
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List approved partners with filters"""
    query = {"status": PartnerStatus.APPROVED}
    
    if category:
        query["category"] = category
        
    if thematic:
        thematic_list = thematic.split(",")
        query["thematics"] = {"$in": thematic_list}
        
    if search:
        safe_search = re.escape(search)
        query["$or"] = [
            {"name": {"$regex": safe_search, "$options": "i"}},
            {"city": {"$regex": safe_search, "$options": "i"}}
        ]
        
    if bounds:
        try:
            lat_min, lng_min, lat_max, lng_max = map(float, bounds.split(","))
            # Validate geographic coordinate ranges
            if not (-90 <= lat_min <= 90 and -90 <= lat_max <= 90):
                raise HTTPException(status_code=400, detail="Latitude must be between -90 and 90")
            if not (-180 <= lng_min <= 180 and -180 <= lng_max <= 180):
                raise HTTPException(status_code=400, detail="Longitude must be between -180 and 180")
            query["latitude"] = {"$gte": lat_min, "$lte": lat_max}
            query["longitude"] = {"$gte": lng_min, "$lte": lng_max}
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid bounds format")

    cursor = db.partners.find(query, {"_id": 0}).skip(skip).limit(limit+1)
    partners = [Partner(**doc) for doc in await cursor.to_list(length=limit+1)]
    
    has_more = len(partners) > limit
    if has_more:
        partners.pop()
        
    total = await db.partners.count_documents(query)
    
    return {
        "partners": [sanitize_partner_for_public(p) for p in partners],
        "total": total,
        "has_more": has_more
    }

@router.get("/{slug}")
async def get_partner_by_slug(slug: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get single approved partner by slug"""
    partner = await db.partners.find_one(
        {"slug": slug, "status": PartnerStatus.APPROVED},
        {"_id": 0}
    )
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    # Strip personal contact data from public response (RGPD art. 5)
    for field in PUBLIC_EXCLUDED_FIELDS:
        partner.pop(field, None)
    return partner

@router.post("/apply")
async def apply_partnership(
    request: Request,
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    category: PartnerCategory = Form(...),
    thematics: str = Form(...), # JSON string representation of list like '["ENV", "SOC"]'
    description: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    postal_code: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    contact_name: str = Form(...),
    contact_email: EmailStr = Form(...),
    password: str = Form(...),
    description_long: Optional[str] = Form(None),
    country: str = Form("France"),
    contact_role: Optional[str] = Form(None),
    contact_phone: Optional[str] = Form(None),
    website_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    instagram_url: Optional[str] = Form(None),
    twitter_url: Optional[str] = Form(None),
    logo: UploadFile = File(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Submit a partnership application (multipart/form-data)"""
    client_ip = request.client.host if request.client else "unknown"

    # Anti-spam: rate limiting (max 3 per hour per IP)
    await check_rate_limit(db, request, "partner_register", max_requests=3, window_minutes=60)

    # Check if email is already used for contact or user account
    existing_user = await db.users.find_one({"email": contact_email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Un compte existe déjà avec cet email")

    # Validate logo and parse thematics BEFORE creating user (prevent orphan accounts)
    logo_url = None
    logo_contents = None
    if logo:
        # Validate content type
        if logo.content_type not in LOGO_ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WebP")
        # Validate file size (max 2 Mo)
        logo_contents = await logo.read()
        if len(logo_contents) > LOGO_MAX_SIZE:
            raise HTTPException(status_code=400, detail="Le fichier ne doit pas dépasser 2 Mo")
        # Validate real image content via Pillow (prevents malicious files)
        try:
            img = Image.open(io.BytesIO(logo_contents))
            img.verify()
        except Exception:
            raise HTTPException(status_code=400, detail="Le fichier n'est pas une image valide")

    # Parse thematics
    try:
        thematics_list = json.loads(thematics)
    except Exception:
        thematics_list = []

    # Create the user account with PARTNER role
    user_doc = User(
        username=name,
        email=contact_email,
        password_hash=hash_password(password),
        role=UserRole.PARTNER
    )
    try:
        await db.users.insert_one(user_doc.model_dump())
    except PyMongoError as e:
        logger.error(f"Failed to create partner user account: {e}")
        raise HTTPException(status_code=503, detail="Impossible de créer votre compte. Veuillez réessayer.")

    # Save logo file (after user creation, since we need user_doc.id)
    try:
        if logo and logo_contents:
            from pathlib import Path as FilePath
            upload_dir = FilePath(__file__).parent.parent / "uploads" / "partners" / "logos"
            upload_dir.mkdir(parents=True, exist_ok=True)
            ext = os.path.splitext(logo.filename or "logo.png")[1].lower()
            if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
                ext = ".png"
            safe_filename = f"{user_doc.id}_{uuid_mod.uuid4().hex[:8]}{ext}"
            file_path = upload_dir / safe_filename

            with open(file_path, "wb") as buffer:
                buffer.write(logo_contents)

            logo_url = f"/api/uploads/partners/logos/{safe_filename}"
    except Exception as e:
        # Rollback user creation if logo save fails
        await db.users.delete_one({"id": user_doc.id})
        logger.error(f"Logo save failed, rolled back user creation: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement du logo")

    # Create the Partner record
    slug = slugify.slugify(name)
    # Check slug uniqueness
    existing_slug = await db.partners.find_one({"slug": slug})
    if existing_slug:
        slug = f"{slug}-{user_doc.id[:6]}"
        
    partner = Partner(
        name=name,
        slug=slug,
        logo_url=logo_url,
        description=description,
        description_long=description_long,
        website_url=website_url,
        category=category,
        thematics=thematics_list,
        address=address,
        city=city,
        postal_code=postal_code,
        country=country,
        latitude=latitude,
        longitude=longitude,
        contact_name=contact_name,
        contact_role=contact_role,
        contact_email=contact_email,
        contact_phone=contact_phone,
        linkedin_url=linkedin_url,
        instagram_url=instagram_url,
        twitter_url=twitter_url,
        user_id=user_doc.id,
        status=PartnerStatus.PENDING,
        ip_address=anonymize_ip(client_ip)
    )
    
    try:
        await db.partners.insert_one(partner.model_dump())
    except PyMongoError as e:
        # Rollback: delete the user we just created
        await db.users.delete_one({"id": user_doc.id})
        logger.error(f"Failed to create partner record, rolled back user: {e}")
        raise HTTPException(status_code=503, detail="Impossible de soumettre votre candidature. Veuillez réessayer.")

    logger.info(f"New partner application from {name} ({contact_email})")

    # Send confirmation email to candidate (FR12)
    background_tasks.add_task(
        send_email,
        contact_email,
        "Votre demande de partenariat ECHO",
        f"Bonjour {contact_name},\n\nNous avons bien reçu votre demande de partenariat pour \"{name}\" (catégorie: {category}).\n\nVotre dossier est en cours d'examen. Nous vous contacterons prochainement.\n\nL'équipe ECHO"
    )

    # Send alert email to internal team (FR13)
    background_tasks.add_task(
        send_email,
        "partenaires@mouvementecho.fr",
        f"Nouvelle candidature partenaire — {name}",
        f"Nom: {name}\nCatégorie: {category}\nVille: {city}\nContact: {contact_name} ({contact_email})\nDescription: {description}"
    )

    return {
        "success": True,
        "message": "Votre demande a été soumise. Vous recevrez un email de confirmation.",
        "partner_id": partner.id
    }

# ==============================================================================
# PARTNER PRIVATE ENDPOINTS (Role: PARTNER)
# ==============================================================================

@router.get("/me/account")
async def get_my_partner_account(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get own partner profile if logged in as partner"""
    if current_user.role != UserRole.PARTNER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not a partner")
        
    partner = await db.partners.find_one({"user_id": current_user.id}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner account not found")
        
    return partner

@router.get("/me/stats")
async def get_my_partner_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get visitor statistics for the logged-in partner (FR15)"""
    if current_user.role != UserRole.PARTNER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Espace partenaire uniquement")
        
    partner = await db.partners.find_one({"user_id": current_user.id})
    if not partner:
        raise HTTPException(status_code=404, detail="Compte partenaire introuvable")
        
    partner_id = partner["id"]
    
    # Date 30 jours en arrière pour le graphe
    since = datetime.now(UTC) - timedelta(days=30)
    
    pipeline = [
        {"$match": {
            "partner_id": partner_id,
            "created_at": {"$gte": since}
        }},
        {"$facet": {
            "summary": [
                {"$group": {
                    "_id": "$action",
                    "count": {"$sum": 1}
                }}
            ],
            "daily": [
                {"$group": {
                    "_id": {
                        "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                        "action": "$action"
                    },
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id.date": 1}}
            ]
        }}
    ]
    
    result = await db.analytics_events.aggregate(pipeline).to_list(1)
    data = result[0] if result else {"summary": [], "daily": []}
    
    # Formatter le summary pour le simplifier au front
    summary_dict = {item["_id"]: item["count"] for item in data.get("summary", [])}
    
    return {
        "partner_id": partner_id,
        "period_days": 30,
        "summary": {
            "views": summary_dict.get("partner_view", 0),
            "website_clicks": summary_dict.get("partner_click_website", 0),
            "map_clicks": summary_dict.get("partner_click_map", 0),
        },
        "daily": data.get("daily", [])
    }

@router.put("/me/account")
async def update_my_partner_account(
    description: Optional[str] = Form(None),
    description_long: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    postal_code: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    contact_phone: Optional[str] = Form(None),
    website_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    instagram_url: Optional[str] = Form(None),
    twitter_url: Optional[str] = Form(None),
    logo: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update own partner profile"""
    if current_user.role != UserRole.PARTNER and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not a partner")
        
    partner = await db.partners.find_one({"user_id": current_user.id})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner account not found")
    
    # Build update dict with only provided fields
    update_data: Dict[str, Any] = {"updated_at": datetime.now(UTC)}
    
    for field_name, value in [
        ("description", description),
        ("description_long", description_long),
        ("address", address),
        ("city", city),
        ("postal_code", postal_code),
        ("latitude", latitude),
        ("longitude", longitude),
        ("contact_phone", contact_phone),
        ("website_url", website_url),
        ("linkedin_url", linkedin_url),
        ("instagram_url", instagram_url),
        ("twitter_url", twitter_url),
    ]:
        if value is not None:
            update_data[field_name] = value
    
    # Handle logo upload with validation
    if logo:
        if logo.content_type not in LOGO_ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail="Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WebP")
        contents = await logo.read()
        if len(contents) > LOGO_MAX_SIZE:
            raise HTTPException(status_code=400, detail="Le fichier ne doit pas dépasser 2 Mo")
        # Validate real image content via Pillow (prevents malicious files)
        try:
            img = Image.open(io.BytesIO(contents))
            img.verify()
        except Exception:
            raise HTTPException(status_code=400, detail="Le fichier n'est pas une image valide")
        from pathlib import Path as FilePath
        upload_dir = FilePath(__file__).parent.parent / "uploads" / "partners" / "logos"
        upload_dir.mkdir(parents=True, exist_ok=True)
        ext = os.path.splitext(logo.filename or "logo.png")[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".png"
        safe_filename = f"{partner['id']}_{uuid_mod.uuid4().hex[:8]}{ext}"
        file_path = upload_dir / safe_filename

        with open(file_path, "wb") as buffer:
            buffer.write(contents)
            
        update_data["logo_url"] = f"/api/uploads/partners/logos/{safe_filename}"
    
    await db.partners.update_one(
        {"user_id": current_user.id},
        {"$set": update_data}
    )
    
    updated = await db.partners.find_one({"user_id": current_user.id}, {"_id": 0})
    return {"success": True, "message": "Profil mis à jour", "partner": updated}

# ==============================================================================
# ADMIN ENDPOINTS (Role: ADMIN)
# ==============================================================================

@router.get("/admin/all")
async def admin_get_all_partners(
    status: Optional[PartnerStatus] = None,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List all partners for admins, optionally filtered by status"""
    query = {}
    if status:
        query["status"] = status

    cursor = db.partners.find(query, {"_id": 0, "ip_address": 0}).sort("created_at", -1)
    results = await cursor.to_list(length=500)
    return results

@router.put("/admin/{partner_id}/approve")
async def admin_approve_partner(
    partner_id: str,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Approve a partner application"""
    result = await db.partners.update_one(
        {"id": partner_id},
        {"$set": {
            "status": PartnerStatus.APPROVED,
            "validated_at": datetime.now(UTC),
            "validated_by": admin.id,
            "updated_at": datetime.now(UTC)
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found or already approved")

    await log_admin_action(db, admin.id, "approve", "partner", partner_id)

    partner = await db.partners.find_one({"id": partner_id})
    if partner:
        background_tasks.add_task(
            send_email,
            partner["contact_email"],
            "Bienvenue dans l'ÉCHOSystem !",
            "Votre demande de partenariat a été approuvée. Votre profil est désormais public."
        )

    return {"success": True, "message": "Partenaire approuvé avec succès"}

@router.put("/admin/{partner_id}/reject")
async def admin_reject_partner(
    partner_id: str,
    body: RejectReason,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reject a partner application"""
    result = await db.partners.update_one(
        {"id": partner_id},
        {"$set": {
            "status": PartnerStatus.REJECTED,
            "rejection_reason": body.reason,
            "updated_at": datetime.now(UTC)
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")

    await log_admin_action(db, admin.id, "reject", "partner", partner_id, {"reason": body.reason})

    partner = await db.partners.find_one({"id": partner_id})
    if partner:
        background_tasks.add_task(
            send_email,
            partner["contact_email"],
            "Suite à votre demande de partenariat ECHO",
            f"Malheureusement nous ne pouvons donner suite. Motif : {body.reason}"
        )

    return {"success": True, "message": "Partenaire refusé"}

@router.put("/admin/{partner_id}/feature")
async def admin_toggle_feature(
    partner_id: str,
    is_featured: bool,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Toggle the 'is_featured' flag on a partner"""
    result = await db.partners.update_one(
        {"id": partner_id},
        {"$set": {
            "is_featured": is_featured,
            "updated_at": datetime.now(UTC)
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")

    await log_admin_action(db, admin.id, "feature_toggle", "partner", partner_id)

    return {"success": True, "message": f"Mise en avant {'activée' if is_featured else 'désactivée'}"}

@router.put("/admin/{partner_id}/suspend")
async def admin_suspend_partner(
    partner_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Suspend (hide) a partner — removes from public listing"""
    partner = await db.partners.find_one({"id": partner_id})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    new_status = PartnerStatus.APPROVED if partner["status"] == PartnerStatus.SUSPENDED else PartnerStatus.SUSPENDED
    await db.partners.update_one(
        {"id": partner_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(UTC)}}
    )
    await log_admin_action(db, admin.id, "suspend", "partner", partner_id)

    label = "réactivé" if new_status == PartnerStatus.APPROVED else "suspendu"
    return {"success": True, "message": f"Partenaire {label}"}


@router.delete("/admin/{partner_id}")
async def admin_delete_partner(
    partner_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Permanently delete a partner and their associated user account"""
    partner = await db.partners.find_one({"id": partner_id})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    # Delete associated user account if exists
    if partner.get("user_id"):
        await db.users.delete_one({"id": partner["user_id"]})
        await db.user_sessions.delete_many({"user_id": partner["user_id"]})

    # Delete partner logo file if exists
    if partner.get("logo_url"):
        logo_path = partner["logo_url"].replace("/api/uploads/", "uploads/")
        if os.path.exists(logo_path):
            os.remove(logo_path)

    await db.partners.delete_one({"id": partner_id})
    await log_admin_action(db, admin.id, "delete", "partner", partner_id)
    logger.info(f"Admin {admin.id} deleted partner {partner_id} ({partner.get('name', 'unknown')})")

    return {"success": True, "message": "Partenaire supprimé définitivement"}


class AdminPartnerEdit(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    description_long: Optional[str] = None
    category: Optional[PartnerCategory] = None
    contract_status: Optional[str] = None
    thematics: Optional[List[str]] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_role: Optional[str] = None
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None
    admin_notes: Optional[str] = None


@router.put("/admin/{partner_id}/edit")
async def admin_edit_partner(
    partner_id: str,
    body: AdminPartnerEdit,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin can edit any partner field"""
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Regenerate slug if name changed
    if "name" in updates:
        updates["slug"] = slugify.slugify(updates["name"])

    # Auto-geocode when city changes
    if "city" in updates:
        try:
            from utils.geocode import geocode_city
            coords = await geocode_city(updates["city"])
            if coords:
                updates["latitude"] = coords[0]
                updates["longitude"] = coords[1]
                logger.info(f"Partner geocoded city '{updates['city']}' → {coords}")
            else:
                logger.warning(f"Partner geocoding failed for city '{updates['city']}'")
        except Exception as e:
            logger.warning(f"Partner geocoding error for city '{updates['city']}': {e}")

    updates["updated_at"] = datetime.now(UTC)

    result = await db.partners.update_one(
        {"id": partner_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")

    await log_admin_action(db, admin.id, "edit", "partner", partner_id, {"fields": list(updates.keys())})

    return {"success": True, "message": "Partenaire mis à jour"}


@router.post("/admin/{partner_id}/logo")
async def admin_upload_logo(
    partner_id: str,
    logo: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin uploads a logo for a partner"""
    partner = await db.partners.find_one({"id": partner_id})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    # Validate content type
    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
    if logo.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WebP")
    
    # Validate file size (max 2 Mo)
    contents = await logo.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Le fichier ne doit pas dépasser 2 Mo")
    
    # Validate real image content via Pillow
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Le fichier n'est pas une image valide")
    
    # Delete old logo file if exists
    if partner.get("logo_url"):
        old_path = partner["logo_url"].replace("/api/uploads/", "uploads/")
        if os.path.exists(old_path):
            os.remove(old_path)
    
    # Save new logo
    upload_dir = "uploads/partners/logos"
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(logo.filename or "logo.png")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".png"
    safe_filename = f"{partner_id}_{uuid_mod.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(contents)
    
    logo_url = f"/api/uploads/partners/logos/{safe_filename}"
    await db.partners.update_one(
        {"id": partner_id},
        {"$set":  {"logo_url": logo_url, "updated_at": datetime.now(UTC)}}
    )
    
    return {"success": True, "logo_url": logo_url}


@router.delete("/admin/{partner_id}/logo")
async def admin_delete_logo(
    partner_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Admin deletes a partner's logo"""
    partner = await db.partners.find_one({"id": partner_id})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    if partner.get("logo_url"):
        old_path = partner["logo_url"].replace("/api/uploads/", "uploads/")
        if os.path.exists(old_path):
            os.remove(old_path)
    
    await db.partners.update_one(
        {"id": partner_id},
        {"$set":  {"logo_url": None, "updated_at": datetime.now(UTC)}}
    )
    
    return {"success": True, "message": "Logo supprimé"}


def _sanitize_csv_cell(value) -> str:
    """Escape CSV injection characters for Excel safety."""
    s = str(value) if value is not None else ""
    if s and s[0] in ('=', '+', '-', '@', '\t', '\r'):
        return "'" + s
    return s


@router.get("/admin/export")
async def admin_export_partners_csv(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Export all partners as CSV (admin only)"""
    partners = await db.partners.find({}, {"_id": 0}).to_list(None)

    output = io.StringIO()
    output.write("﻿")
    writer = csv.writer(output)
    writer.writerow([
        "id", "name", "category", "status", "city", "postal_code", "country",
        "address", "latitude", "longitude",
        "contact_name", "contact_role", "contact_email", "contact_phone",
        "thematics", "description", "description_long",
        "website_url", "linkedin_url", "instagram_url", "twitter_url",
        "is_featured", "created_at", "validated_at", "rejection_reason",
    ])
    for p in partners:
        created = format_date_csv(p.get("created_at"))
        validated = format_date_csv(p.get("validated_at"))
        thematics = ";".join(p.get("thematics", []))
        writer.writerow([
            _sanitize_csv_cell(p.get("id", "")),
            _sanitize_csv_cell(p.get("name", "")),
            _sanitize_csv_cell(p.get("category", "")),
            _sanitize_csv_cell(p.get("status", "")),
            _sanitize_csv_cell(p.get("city", "")),
            _sanitize_csv_cell(p.get("postal_code", "")),
            _sanitize_csv_cell(p.get("country", "")),
            _sanitize_csv_cell(p.get("address", "")),
            p.get("latitude", ""),
            p.get("longitude", ""),
            _sanitize_csv_cell(p.get("contact_name", "")),
            _sanitize_csv_cell(p.get("contact_role", "")),
            _sanitize_csv_cell(p.get("contact_email", "")),
            _sanitize_csv_cell(p.get("contact_phone", "")),
            _sanitize_csv_cell(thematics),
            _sanitize_csv_cell(p.get("description", "")),
            _sanitize_csv_cell(p.get("description_long", "") or ""),
            _sanitize_csv_cell(p.get("website_url", "") or ""),
            _sanitize_csv_cell(p.get("linkedin_url", "") or ""),
            _sanitize_csv_cell(p.get("instagram_url", "") or ""),
            _sanitize_csv_cell(p.get("twitter_url", "") or ""),
            p.get("is_featured", False),
            created,
            validated or "",
            _sanitize_csv_cell(p.get("rejection_reason", "") or ""),
        ])

    output.seek(0)
    logger.info(f"Admin {admin.id} exported {len(partners)} partner records")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=partenaires-export.csv"}
    )
