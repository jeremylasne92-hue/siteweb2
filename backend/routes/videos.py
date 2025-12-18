from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, status
from fastapi.responses import FileResponse, StreamingResponse
from routes.auth import get_current_user, require_admin, get_db
from models import User
import aiofiles
import os
import uuid
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/videos", tags=["Videos"])

UPLOAD_DIR = Path("/app/backend/uploads/videos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    """Upload video file (admin only) - Local storage for demo"""
    try:
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        video_id = str(uuid.uuid4())
        filename = f"{video_id}{file_ext}"
        file_path = UPLOAD_DIR / filename
        
        # Save file in chunks
        async with aiofiles.open(file_path, 'wb') as f:
            while chunk := await file.read(1024 * 1024):  # Read 1MB at a time
                await f.write(chunk)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        logger.info(f"Uploaded video {filename}, size: {file_size} bytes")
        
        return {
            "video_id": video_id,
            "filename": filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "url": f"/api/videos/{video_id}/stream"
        }
    
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{video_id}/stream")
async def stream_video(video_id: str):
    """Stream video file with range support"""
    # Find video file
    video_files = list(UPLOAD_DIR.glob(f"{video_id}.*"))
    
    if not video_files:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    video_path = video_files[0]
    
    return FileResponse(
        video_path,
        media_type="video/mp4",
        headers={
            "Accept-Ranges": "bytes",
            "Content-Disposition": f"inline; filename={video_path.name}"
        }
    )
