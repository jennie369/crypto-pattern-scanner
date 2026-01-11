"""
MuseTalk API Server
FastAPI server for generating lip-sync avatar videos
Runs on PC with RTX 3060 12GB, CUDA 12.7

Usage:
    pip install fastapi uvicorn python-multipart aiofiles
    uvicorn api_server:app --host 0.0.0.0 --port 8000

For external access (expose to mobile app):
    ngrok http 8000
    # OR
    cloudflared tunnel --url http://localhost:8000
"""

import os
import uuid
import time
import asyncio
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =====================================================
# CONFIGURATION
# =====================================================

# Paths - adjust these based on your MuseTalk installation
MUSETALK_PATH = os.environ.get('MUSETALK_PATH', 'C:/Projects/MuseTalk')
OUTPUT_PATH = Path('./outputs')
TEMP_PATH = Path('./temp')
AVATAR_IMAGES_PATH = Path('./avatars')

# Create directories
OUTPUT_PATH.mkdir(exist_ok=True)
TEMP_PATH.mkdir(exist_ok=True)
AVATAR_IMAGES_PATH.mkdir(exist_ok=True)

# Avatar configurations
AVATARS = {
    'suphu': {
        'name': 'Sư Phụ',
        'image': 'suphu.png',
        'description': 'Wise spiritual master',
    },
    'cogai': {
        'name': 'Cô Gái Phố Núi',
        'image': 'cogai.png',
        'description': 'Mountain girl guide',
    },
    'thayphongthuy': {
        'name': 'Thầy Phong Thủy',
        'image': 'thayphongthuy.png',
        'description': 'Feng shui master',
    },
}

# Expression mappings (for future facial expression control)
EXPRESSIONS = {
    'neutral': {'blend_shapes': {}},
    'happy': {'blend_shapes': {'smile': 0.8, 'eyeSquint': 0.3}},
    'sad': {'blend_shapes': {'frownDown': 0.5, 'browDown': 0.3}},
    'excited': {'blend_shapes': {'smile': 1.0, 'eyeWide': 0.5}},
    'thinking': {'blend_shapes': {'browUp': 0.3, 'lookUp': 0.2}},
    'surprised': {'blend_shapes': {'eyeWide': 0.8, 'jawOpen': 0.3}},
    'apologetic': {'blend_shapes': {'browInner': 0.5, 'smile': 0.2}},
}

# =====================================================
# PYDANTIC MODELS
# =====================================================

class GenerateVideoRequest(BaseModel):
    audio_url: str
    avatar_id: str = 'suphu'
    expression: str = 'neutral'
    quality: str = 'medium'  # low, medium, high

class GenerateVideoResponse(BaseModel):
    success: bool
    video_url: Optional[str] = None
    video_id: Optional[str] = None
    duration_ms: Optional[int] = None
    latency_ms: Optional[int] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    gpu_available: bool
    gpu_name: Optional[str] = None
    gpu_memory_mb: Optional[int] = None
    musetalk_ready: bool
    uptime_seconds: int

class JobStatus(BaseModel):
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: float  # 0.0 to 1.0
    video_url: Optional[str] = None
    error: Optional[str] = None

# =====================================================
# APP SETUP
# =====================================================

app = FastAPI(
    title="MuseTalk API Server",
    description="API for generating lip-sync avatar videos for GEMRAL AI Livestream",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for serving generated videos
app.mount("/videos", StaticFiles(directory=str(OUTPUT_PATH)), name="videos")

# Global state
start_time = time.time()
jobs = {}  # In-memory job tracking (use Redis in production)

# =====================================================
# GPU UTILITIES
# =====================================================

def check_gpu():
    """Check if GPU is available and get info."""
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            gpu_memory = torch.cuda.get_device_properties(0).total_memory // (1024 * 1024)
            return True, gpu_name, gpu_memory
    except ImportError:
        pass
    return False, None, None

def check_musetalk():
    """Check if MuseTalk is properly installed."""
    musetalk_path = Path(MUSETALK_PATH)
    required_files = [
        'inference.py',
        'models/musetalk/pytorch_model.bin',
    ]

    for file in required_files:
        if not (musetalk_path / file).exists():
            return False
    return True

# =====================================================
# VIDEO GENERATION
# =====================================================

async def download_audio(audio_url: str, output_path: Path) -> Path:
    """Download audio file from URL."""
    import aiohttp

    audio_file = output_path / f"audio_{uuid.uuid4().hex[:8]}.wav"

    async with aiohttp.ClientSession() as session:
        async with session.get(audio_url) as response:
            if response.status != 200:
                raise HTTPException(status_code=400, detail="Failed to download audio")

            content = await response.read()
            with open(audio_file, 'wb') as f:
                f.write(content)

    return audio_file

async def generate_video_musetalk(
    audio_path: Path,
    avatar_id: str,
    expression: str,
    quality: str,
    output_path: Path,
) -> Path:
    """
    Generate lip-sync video using MuseTalk.

    In production, this would call the actual MuseTalk inference.
    For now, we simulate the process.
    """
    video_id = uuid.uuid4().hex[:12]
    output_file = output_path / f"{video_id}.mp4"

    # Get avatar image path
    avatar = AVATARS.get(avatar_id, AVATARS['suphu'])
    avatar_image = AVATAR_IMAGES_PATH / avatar['image']

    # Quality settings
    quality_settings = {
        'low': {'resolution': '360p', 'fps': 24},
        'medium': {'resolution': '720p', 'fps': 30},
        'high': {'resolution': '1080p', 'fps': 30},
    }
    settings = quality_settings.get(quality, quality_settings['medium'])

    # In production, run MuseTalk inference:
    # cmd = f"python {MUSETALK_PATH}/inference.py \
    #     --audio_path {audio_path} \
    #     --source_image {avatar_image} \
    #     --result_dir {output_path} \
    #     --fps {settings['fps']}"
    # process = await asyncio.create_subprocess_shell(cmd)
    # await process.wait()

    # For development, simulate processing time
    await asyncio.sleep(1.5)  # Simulate 1.5s processing

    # Create placeholder video (in production, MuseTalk creates the actual video)
    # For now, just create an empty file as placeholder
    with open(output_file, 'wb') as f:
        f.write(b'placeholder')

    logger.info(f"Generated video: {output_file}")
    return output_file

async def process_video_job(job_id: str, request: GenerateVideoRequest):
    """Background task to process video generation."""
    try:
        jobs[job_id]['status'] = 'processing'
        jobs[job_id]['progress'] = 0.1

        start_time = time.time()

        # Download audio
        jobs[job_id]['progress'] = 0.2
        audio_path = await download_audio(request.audio_url, TEMP_PATH)

        # Generate video
        jobs[job_id]['progress'] = 0.5
        video_path = await generate_video_musetalk(
            audio_path=audio_path,
            avatar_id=request.avatar_id,
            expression=request.expression,
            quality=request.quality,
            output_path=OUTPUT_PATH,
        )

        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)

        # Update job status
        jobs[job_id].update({
            'status': 'completed',
            'progress': 1.0,
            'video_url': f"/videos/{video_path.name}",
            'video_id': video_path.stem,
            'latency_ms': latency_ms,
        })

        # Cleanup temp audio file
        if audio_path.exists():
            audio_path.unlink()

        logger.info(f"Job {job_id} completed in {latency_ms}ms")

    except Exception as e:
        logger.error(f"Job {job_id} failed: {str(e)}")
        jobs[job_id].update({
            'status': 'failed',
            'error': str(e),
        })

# =====================================================
# API ENDPOINTS
# =====================================================

@app.get("/", response_class=JSONResponse)
async def root():
    """API root endpoint."""
    return {
        "name": "MuseTalk API Server",
        "version": "1.0.0",
        "description": "Avatar lip-sync video generation for GEMRAL AI Livestream",
        "endpoints": {
            "health": "/health",
            "generate": "/generate",
            "job_status": "/job/{job_id}",
            "avatars": "/avatars",
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    gpu_available, gpu_name, gpu_memory = check_gpu()
    musetalk_ready = check_musetalk()
    uptime = int(time.time() - start_time)

    status = "healthy" if gpu_available and musetalk_ready else "degraded"

    return HealthResponse(
        status=status,
        gpu_available=gpu_available,
        gpu_name=gpu_name,
        gpu_memory_mb=gpu_memory,
        musetalk_ready=musetalk_ready,
        uptime_seconds=uptime,
    )

@app.get("/avatars")
async def list_avatars():
    """List available avatars."""
    return {
        "avatars": [
            {
                "id": avatar_id,
                **avatar_info,
                "image_url": f"/avatars/{avatar_info['image']}",
            }
            for avatar_id, avatar_info in AVATARS.items()
        ]
    }

@app.get("/expressions")
async def list_expressions():
    """List available expressions."""
    return {
        "expressions": list(EXPRESSIONS.keys())
    }

@app.post("/generate", response_model=GenerateVideoResponse)
async def generate_video(
    request: GenerateVideoRequest,
    background_tasks: BackgroundTasks,
):
    """
    Generate lip-sync video from audio.

    This endpoint starts an async job and returns immediately.
    Use /job/{job_id} to check status.

    For synchronous generation, use /generate-sync
    """
    job_id = uuid.uuid4().hex[:16]

    # Initialize job
    jobs[job_id] = {
        'status': 'pending',
        'progress': 0.0,
        'created_at': datetime.now().isoformat(),
    }

    # Start background processing
    background_tasks.add_task(process_video_job, job_id, request)

    return GenerateVideoResponse(
        success=True,
        video_id=job_id,
        latency_ms=0,
    )

@app.post("/generate-sync", response_model=GenerateVideoResponse)
async def generate_video_sync(request: GenerateVideoRequest):
    """
    Generate lip-sync video synchronously (blocking).

    Use this for low-latency requirements where you need
    the video immediately.
    """
    start_time = time.time()

    try:
        # Download audio
        audio_path = await download_audio(request.audio_url, TEMP_PATH)

        # Generate video
        video_path = await generate_video_musetalk(
            audio_path=audio_path,
            avatar_id=request.avatar_id,
            expression=request.expression,
            quality=request.quality,
            output_path=OUTPUT_PATH,
        )

        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)

        # Cleanup
        if audio_path.exists():
            audio_path.unlink()

        return GenerateVideoResponse(
            success=True,
            video_url=f"/videos/{video_path.name}",
            video_id=video_path.stem,
            latency_ms=latency_ms,
        )

    except Exception as e:
        logger.error(f"Video generation failed: {str(e)}")
        return GenerateVideoResponse(
            success=False,
            error=str(e),
        )

@app.get("/job/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Get status of a video generation job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    return JobStatus(
        job_id=job_id,
        status=job['status'],
        progress=job['progress'],
        video_url=job.get('video_url'),
        error=job.get('error'),
    )

@app.get("/videos/{video_id}")
async def get_video(video_id: str):
    """Stream a generated video."""
    video_path = OUTPUT_PATH / f"{video_id}.mp4"
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=f"{video_id}.mp4",
    )

@app.post("/upload-avatar")
async def upload_avatar(
    avatar_id: str,
    file: UploadFile = File(...),
):
    """Upload a custom avatar image."""
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        raise HTTPException(status_code=400, detail="Invalid image format")

    # Save avatar image
    avatar_path = AVATAR_IMAGES_PATH / f"{avatar_id}.png"
    content = await file.read()

    with open(avatar_path, 'wb') as f:
        f.write(content)

    # Add to avatars config
    AVATARS[avatar_id] = {
        'name': avatar_id.title(),
        'image': f"{avatar_id}.png",
        'description': 'Custom avatar',
    }

    return {"success": True, "avatar_id": avatar_id}

@app.delete("/cleanup")
async def cleanup_old_files():
    """Cleanup old generated files."""
    import time

    count = 0
    max_age_hours = 24
    now = time.time()

    for file in OUTPUT_PATH.glob("*.mp4"):
        age_hours = (now - file.stat().st_mtime) / 3600
        if age_hours > max_age_hours:
            file.unlink()
            count += 1

    for file in TEMP_PATH.glob("*"):
        age_hours = (now - file.stat().st_mtime) / 3600
        if age_hours > 1:  # Cleanup temp after 1 hour
            file.unlink()
            count += 1

    return {"success": True, "files_deleted": count}

# =====================================================
# MAIN
# =====================================================

if __name__ == "__main__":
    import uvicorn

    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║         MUSETALK API SERVER FOR GEMRAL AI LIVESTREAM      ║
    ╠══════════════════════════════════════════════════════════╣
    ║                                                          ║
    ║  Starting server on http://0.0.0.0:8000                  ║
    ║                                                          ║
    ║  For external access, use:                               ║
    ║  - ngrok http 8000                                       ║
    ║  - cloudflared tunnel --url http://localhost:8000        ║
    ║                                                          ║
    ║  Endpoints:                                              ║
    ║  - GET  /health          - Health check                  ║
    ║  - GET  /avatars         - List avatars                  ║
    ║  - POST /generate        - Generate video (async)        ║
    ║  - POST /generate-sync   - Generate video (sync)         ║
    ║  - GET  /job/{id}        - Job status                    ║
    ║  - GET  /videos/{id}     - Stream video                  ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    """)

    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
