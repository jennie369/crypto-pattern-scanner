"""
MuseTalk API Server
FastAPI server to expose MuseTalk avatar generation via HTTP API.

Setup:
1. Copy this file to your MuseTalk directory (C:\\Projects\\MuseTalk\\api_server.py)
2. Install dependencies: pip install fastapi uvicorn python-multipart aiofiles
3. Run: uvicorn api_server:app --host 0.0.0.0 --port 8000

Endpoints:
- POST /generate - Generate lip-sync video from audio
- GET /health - Health check
- GET /videos/{filename} - Serve generated videos
"""

import os
import uuid
import time
import asyncio
import subprocess
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiofiles
import httpx

# ============================================================================
# CONFIGURATION
# ============================================================================

# Directories
BASE_DIR = Path(__file__).parent
AVATARS_DIR = BASE_DIR / "avatars"
OUTPUTS_DIR = BASE_DIR / "outputs"
TEMP_DIR = BASE_DIR / "temp"

# Create directories if not exist
AVATARS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# Avatar images (place your avatar images in avatars/ folder)
AVATARS = {
    "default": AVATARS_DIR / "default.png",
    "sufu": AVATARS_DIR / "sufu.png",       # Sư Phụ
    "cogiao": AVATARS_DIR / "cogiao.png",   # Cô Giáo
    "banthan": AVATARS_DIR / "banthan.png", # Bạn Thân
}

# Expression configurations for MuseTalk
# These are blendshape weights for facial expressions
EXPRESSIONS = {
    "neutral": {},
    "happy": {"smile": 0.5},
    "sad": {"frown": 0.3},
    "excited": {"smile": 0.7, "eyebrow_raise": 0.3},
    "calm": {"smile": 0.2},
    "thinking": {"eyebrow_raise": 0.2, "look_up": 0.3},
    "surprised": {"eyebrow_raise": 0.6, "mouth_open": 0.4},
}

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="MuseTalk Avatar API",
    description="Generate lip-synced avatar videos from audio",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class GenerateRequest(BaseModel):
    audio_url: str
    avatar_id: str = "default"
    expression: str = "neutral"

class GenerateResponse(BaseModel):
    video_url: str
    duration: float
    latency_ms: int
    avatar_id: str
    expression: str

class HealthResponse(BaseModel):
    status: str
    gpu_available: bool
    cuda_version: Optional[str]
    avatars_available: list

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    import torch

    gpu_available = torch.cuda.is_available()
    cuda_version = torch.version.cuda if gpu_available else None

    # Check available avatars
    available_avatars = []
    for avatar_id, path in AVATARS.items():
        if path.exists():
            available_avatars.append(avatar_id)

    return HealthResponse(
        status="healthy",
        gpu_available=gpu_available,
        cuda_version=cuda_version,
        avatars_available=available_avatars,
    )


@app.post("/generate", response_model=GenerateResponse)
async def generate_video(request: GenerateRequest, background_tasks: BackgroundTasks):
    """
    Generate lip-synced avatar video from audio URL

    Args:
        audio_url: URL to audio file (mp3/wav)
        avatar_id: Avatar to use (default, sufu, cogiao, banthan)
        expression: Facial expression (neutral, happy, sad, excited, calm, thinking, surprised)

    Returns:
        video_url: URL to generated video
        duration: Video duration in seconds
        latency_ms: Generation time in milliseconds
    """
    start_time = time.time()

    # Validate avatar
    avatar_path = AVATARS.get(request.avatar_id, AVATARS["default"])
    if not avatar_path.exists():
        # Try default if selected doesn't exist
        avatar_path = AVATARS["default"]
        if not avatar_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Avatar not found: {request.avatar_id}. Please add avatar image to {AVATARS_DIR}"
            )

    # Validate expression
    if request.expression not in EXPRESSIONS:
        request.expression = "neutral"

    # Generate unique filenames
    job_id = str(uuid.uuid4())[:8]
    audio_filename = f"{job_id}_audio.mp3"
    video_filename = f"{job_id}_output.mp4"
    audio_path = TEMP_DIR / audio_filename
    video_path = OUTPUTS_DIR / video_filename

    try:
        # Download audio from URL
        print(f"[MuseTalk] Downloading audio from: {request.audio_url}")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(request.audio_url)
            response.raise_for_status()

            async with aiofiles.open(audio_path, 'wb') as f:
                await f.write(response.content)

        print(f"[MuseTalk] Audio downloaded: {audio_path}")

        # Run MuseTalk inference
        print(f"[MuseTalk] Starting inference with avatar: {request.avatar_id}, expression: {request.expression}")

        # Build command for MuseTalk
        # Adjust this based on your MuseTalk installation
        cmd = [
            "python",
            str(BASE_DIR / "inference.py"),
            "--audio_path", str(audio_path),
            "--source_image", str(avatar_path),
            "--result_dir", str(OUTPUTS_DIR),
            "--output_name", video_filename.replace(".mp4", ""),
        ]

        # Run inference (this is synchronous, will block)
        # For production, consider running in a separate process/queue
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(BASE_DIR),
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            print(f"[MuseTalk] Inference failed: {stderr.decode()}")
            raise HTTPException(
                status_code=500,
                detail=f"MuseTalk inference failed: {stderr.decode()[:500]}"
            )

        print(f"[MuseTalk] Inference complete: {video_path}")

        # Check if video was created
        if not video_path.exists():
            # Try alternative output path (MuseTalk may add suffix)
            for file in OUTPUTS_DIR.glob(f"{job_id}*.mp4"):
                video_path = file
                video_filename = file.name
                break

        if not video_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Video generation failed - output file not created"
            )

        # Get video duration using ffprobe
        duration = await get_video_duration(video_path)

        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)

        # Schedule cleanup of temp audio file
        background_tasks.add_task(cleanup_file, audio_path)

        # Build video URL
        # In production, you'd want to serve from a CDN or proper static file server
        video_url = f"/videos/{video_filename}"

        print(f"[MuseTalk] Generated video in {latency_ms}ms: {video_url}")

        return GenerateResponse(
            video_url=video_url,
            duration=duration,
            latency_ms=latency_ms,
            avatar_id=request.avatar_id,
            expression=request.expression,
        )

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download audio: {str(e)}"
        )
    except Exception as e:
        # Cleanup on error
        if audio_path.exists():
            audio_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )


@app.get("/videos/{filename}")
async def serve_video(filename: str):
    """Serve generated video files"""
    video_path = OUTPUTS_DIR / filename

    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(
        video_path,
        media_type="video/mp4",
        filename=filename,
    )


@app.get("/avatars")
async def list_avatars():
    """List available avatar images"""
    available = []
    for avatar_id, path in AVATARS.items():
        available.append({
            "id": avatar_id,
            "exists": path.exists(),
            "path": str(path),
        })
    return {"avatars": available}


@app.get("/expressions")
async def list_expressions():
    """List available facial expressions"""
    return {"expressions": list(EXPRESSIONS.keys())}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def get_video_duration(video_path: Path) -> float:
    """Get video duration using ffprobe"""
    try:
        cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, _ = await process.communicate()
        duration = float(stdout.decode().strip())
        return duration
    except:
        return 0.0


async def cleanup_file(file_path: Path):
    """Delete a file (for cleanup)"""
    try:
        await asyncio.sleep(60)  # Wait 1 minute before cleanup
        if file_path.exists():
            file_path.unlink()
            print(f"[Cleanup] Deleted: {file_path}")
    except Exception as e:
        print(f"[Cleanup] Failed to delete {file_path}: {e}")


# ============================================================================
# STARTUP / SHUTDOWN
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Startup tasks"""
    print("=" * 60)
    print("MuseTalk API Server Starting...")
    print(f"Avatars directory: {AVATARS_DIR}")
    print(f"Outputs directory: {OUTPUTS_DIR}")
    print("=" * 60)

    # Check GPU
    try:
        import torch
        if torch.cuda.is_available():
            print(f"GPU: {torch.cuda.get_device_name(0)}")
            print(f"CUDA Version: {torch.version.cuda}")
        else:
            print("WARNING: No GPU detected! MuseTalk will be slow.")
    except ImportError:
        print("WARNING: PyTorch not installed!")

    # Check avatars
    print("\nAvailable Avatars:")
    for avatar_id, path in AVATARS.items():
        status = "✓" if path.exists() else "✗ (missing)"
        print(f"  - {avatar_id}: {status}")

    print("\n" + "=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup tasks on shutdown"""
    print("MuseTalk API Server shutting down...")


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    import uvicorn

    print("""
    =====================================================
    MuseTalk API Server
    =====================================================

    Usage:
    1. Place avatar images in ./avatars/ folder
    2. Run: uvicorn api_server:app --host 0.0.0.0 --port 8000
    3. Or run this file directly: python api_server.py

    Endpoints:
    - POST /generate - Generate lip-sync video
    - GET /health - Health check
    - GET /videos/{filename} - Serve videos
    - GET /avatars - List avatars
    - GET /expressions - List expressions

    =====================================================
    """)

    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Remove in production
    )
