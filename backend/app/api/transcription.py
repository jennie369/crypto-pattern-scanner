"""
Voice Transcription API Endpoints
Whisper API integration for Vietnamese speech-to-text
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import base64
import tempfile
import os
from typing import Optional

from ..core.security import get_current_user
from ..services.voice_service import voice_service

router = APIRouter(prefix="/api", tags=["Transcription"])


class TranscriptionRequest(BaseModel):
    """Request body for transcription"""
    audio_base64: str  # Base64 encoded audio file
    file_extension: str = "m4a"  # File extension (m4a, wav, mp3, webm)
    language: str = "vi"  # Language code
    prompt: Optional[str] = None  # Optional prompt for better accuracy


class TranscriptionResponse(BaseModel):
    """Response for transcription"""
    text: str
    language: str
    duration: Optional[float] = None


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    request: TranscriptionRequest,
    user_id: str = Depends(get_current_user)
):
    """
    Transcribe audio to text using Whisper API

    - Accepts base64 encoded audio
    - Returns transcribed text in Vietnamese
    - Requires authentication
    """
    try:
        # Decode base64 audio
        try:
            audio_bytes = base64.b64decode(request.audio_base64)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 audio data: {str(e)}"
            )

        # Validate file size (max 25MB for Whisper)
        if len(audio_bytes) > 25 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio file too large. Maximum size is 25MB."
            )

        # Save to temporary file
        with tempfile.NamedTemporaryFile(
            suffix=f".{request.file_extension}",
            delete=False
        ) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        try:
            # Transcribe using voice service
            result = await voice_service.transcribe_from_file(
                file_path=temp_path,
                language=request.language,
                prompt=request.prompt
            )

            if not result.get("success"):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=result.get("error", "Transcription failed")
                )

            return TranscriptionResponse(
                text=result.get("text", ""),
                language=result.get("language", request.language),
                duration=result.get("duration")
            )

        finally:
            # Clean up temp file
            try:
                os.unlink(temp_path)
            except Exception:
                pass

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription error: {str(e)}"
        )


@router.post("/transcribe-url")
async def transcribe_from_url(
    audio_url: str,
    language: str = "vi",
    prompt: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    """
    Transcribe audio from URL (for Zalo/Messenger voice messages)

    - Downloads audio from URL
    - Returns transcribed text
    - Requires authentication
    """
    try:
        result = await voice_service.transcribe_from_url(
            audio_url=audio_url,
            language=language,
            prompt=prompt
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("error", "Transcription failed")
            )

        return TranscriptionResponse(
            text=result.get("text", ""),
            language=result.get("language", language),
            duration=result.get("duration")
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transcription error: {str(e)}"
        )
