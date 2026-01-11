"""
Voice Transcription Service
Uses OpenAI Whisper API for Vietnamese speech-to-text
"""
import httpx
import tempfile
import os
from typing import Dict, Any, Optional
from datetime import datetime
import logging

from ..core.config import get_settings

logger = logging.getLogger(__name__)


class VoiceService:
    """Voice transcription service using Whisper API"""

    def __init__(self):
        self.settings = get_settings()
        self.default_prompt = "Day la cau hoi ve da quy, phong thuy, tarot, kinh dich, hoac trading crypto."

    async def transcribe_from_url(
        self,
        audio_url: str,
        language: str = "vi",
        prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Transcribe audio from URL.
        Downloads file, sends to Whisper API.

        Args:
            audio_url: URL of audio file
            language: Language code (default: vi)
            prompt: Context prompt for better accuracy

        Returns:
            {"success": True, "text": "...", "language": "vi", "processing_time_ms": N}
        """
        start_time = datetime.utcnow()

        if not self.settings.OPENAI_API_KEY:
            return {
                "success": False,
                "error": "OpenAI API key not configured",
                "language": language,
            }

        try:
            # Download audio file
            async with httpx.AsyncClient() as client:
                response = await client.get(audio_url, timeout=30.0)

                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Failed to download audio: {response.status_code}",
                        "language": language,
                    }

                audio_data = response.content

            # Save to temp file
            with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as f:
                f.write(audio_data)
                temp_path = f.name

            try:
                # Call Whisper API
                async with httpx.AsyncClient() as client:
                    with open(temp_path, "rb") as audio_file:
                        response = await client.post(
                            "https://api.openai.com/v1/audio/transcriptions",
                            headers={
                                "Authorization": f"Bearer {self.settings.OPENAI_API_KEY}",
                            },
                            files={
                                "file": ("audio.m4a", audio_file, "audio/m4a"),
                            },
                            data={
                                "model": "whisper-1",
                                "language": language.split("-")[0],
                                "prompt": prompt or self.default_prompt,
                                "response_format": "json",
                            },
                            timeout=60.0,
                        )

                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Whisper API error: {response.status_code}",
                        "language": language,
                    }

                result = response.json()
                processing_time = int(
                    (datetime.utcnow() - start_time).total_seconds() * 1000
                )

                return {
                    "success": True,
                    "text": result.get("text", ""),
                    "language": language,
                    "processing_time_ms": processing_time,
                }

            finally:
                # Cleanup temp file
                try:
                    os.unlink(temp_path)
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Voice transcription error: {e}")
            return {
                "success": False,
                "error": str(e),
                "language": language,
            }

    async def transcribe_from_bytes(
        self,
        audio_bytes: bytes,
        filename: str = "recording.m4a",
        language: str = "vi",
        prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Transcribe audio from bytes.

        Args:
            audio_bytes: Raw audio data
            filename: Original filename (for format detection)
            language: Language code
            prompt: Context prompt

        Returns:
            {"success": True, "text": "...", "language": "vi", "processing_time_ms": N}
        """
        start_time = datetime.utcnow()

        if not self.settings.OPENAI_API_KEY:
            return {
                "success": False,
                "error": "OpenAI API key not configured",
            }

        try:
            # Determine file extension
            ext = os.path.splitext(filename)[1] or ".m4a"

            # Save to temp file
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name

            try:
                async with httpx.AsyncClient() as client:
                    with open(temp_path, "rb") as audio_file:
                        response = await client.post(
                            "https://api.openai.com/v1/audio/transcriptions",
                            headers={
                                "Authorization": f"Bearer {self.settings.OPENAI_API_KEY}",
                            },
                            files={
                                "file": (filename, audio_file),
                            },
                            data={
                                "model": "whisper-1",
                                "language": language.split("-")[0],
                                "prompt": prompt or self.default_prompt,
                                "response_format": "json",
                            },
                            timeout=60.0,
                        )

                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Whisper API error: {response.status_code}",
                    }

                result = response.json()
                processing_time = int(
                    (datetime.utcnow() - start_time).total_seconds() * 1000
                )

                return {
                    "success": True,
                    "text": result.get("text", ""),
                    "language": language,
                    "processing_time_ms": processing_time,
                }

            finally:
                try:
                    os.unlink(temp_path)
                except Exception:
                    pass

        except Exception as e:
            logger.error(f"Voice transcription error: {e}")
            return {
                "success": False,
                "error": str(e),
            }


    async def transcribe_from_file(
        self,
        file_path: str,
        language: str = "vi",
        prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Transcribe audio from a file path.

        Args:
            file_path: Path to audio file
            language: Language code
            prompt: Context prompt

        Returns:
            {"success": True, "text": "...", "language": "vi", "duration": N}
        """
        start_time = datetime.utcnow()

        if not self.settings.OPENAI_API_KEY:
            return {
                "success": False,
                "error": "OpenAI API key not configured",
            }

        try:
            filename = os.path.basename(file_path)

            async with httpx.AsyncClient() as client:
                with open(file_path, "rb") as audio_file:
                    response = await client.post(
                        "https://api.openai.com/v1/audio/transcriptions",
                        headers={
                            "Authorization": f"Bearer {self.settings.OPENAI_API_KEY}",
                        },
                        files={
                            "file": (filename, audio_file),
                        },
                        data={
                            "model": "whisper-1",
                            "language": language.split("-")[0],
                            "prompt": prompt or self.default_prompt,
                            "response_format": "verbose_json",
                        },
                        timeout=60.0,
                    )

            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"Whisper API error: {response.status_code} - {response.text}",
                }

            result = response.json()
            processing_time = (datetime.utcnow() - start_time).total_seconds()

            return {
                "success": True,
                "text": result.get("text", ""),
                "language": result.get("language", language),
                "duration": result.get("duration"),
                "processing_time": processing_time,
            }

        except Exception as e:
            logger.error(f"Voice transcription error: {e}")
            return {
                "success": False,
                "error": str(e),
            }


# Global instance
voice_service = VoiceService()
