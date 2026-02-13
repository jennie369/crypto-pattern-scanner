# MuseTalk API Server

API server for generating lip-sync avatar videos for GEMRAL AI Livestream.

## Requirements

- Windows 10/11
- NVIDIA RTX 3060 12GB (or better)
- CUDA 12.x installed
- Python 3.10+
- Anaconda/Miniconda

## Setup

### 1. Clone MuseTalk

```bash
cd C:\Projects
git clone https://github.com/TMElyralab/MuseTalk.git
cd MuseTalk
```

### 2. Create Conda Environment

```bash
conda create -n musetalk python=3.10 -y
conda activate musetalk
```

### 3. Install PyTorch with CUDA

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 4. Install MuseTalk Dependencies

```bash
cd C:\Projects\MuseTalk
pip install -r requirements.txt
```

### 5. Download MuseTalk Models

```bash
python scripts/download_models.py
```

### 6. Setup API Server

```bash
cd C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\musetalk-server
pip install -r requirements.txt
```

### 7. Configure Environment

Set the MuseTalk path:
```bash
set MUSETALK_PATH=C:\Projects\MuseTalk
```

Or create a `.env` file:
```
MUSETALK_PATH=C:\Projects\MuseTalk
```

## Running the Server

### Development Mode

```bash
cd C:\Users\Jennie Chu\Desktop\Projects\crypto-pattern-scanner\musetalk-server
python api_server.py
```

Or with uvicorn directly:
```bash
uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode

```bash
uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 2
```

## Exposing to Mobile App

### Option 1: ngrok (Free, but URL changes)

```bash
ngrok http 8000
```

Copy the URL (e.g., `https://abc123.ngrok.io`) to your mobile app's `.env`:
```
EXPO_PUBLIC_MUSETALK_API_URL=https://abc123.ngrok.io
```

### Option 2: Cloudflare Tunnel (Free, stable)

```bash
# Install cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

cloudflared tunnel --url http://localhost:8000
```

## API Endpoints

### Health Check
```
GET /health
```

### List Avatars
```
GET /avatars
```

### Generate Video (Async)
```
POST /generate
{
    "audio_url": "https://example.com/audio.wav",
    "avatar_id": "suphu",
    "expression": "neutral",
    "quality": "medium"
}
```

### Generate Video (Sync)
```
POST /generate-sync
{
    "audio_url": "https://example.com/audio.wav",
    "avatar_id": "suphu",
    "expression": "neutral",
    "quality": "medium"
}
```

### Check Job Status
```
GET /job/{job_id}
```

### Stream Video
```
GET /videos/{video_id}
```

## Avatars

Default avatars:
- `suphu` - Sư Phụ (Wise spiritual master)
- `cogai` - Cô Gái Phố Núi (Mountain girl guide)
- `thayphongthuy` - Thầy Phong Thủy (Feng shui master)

Place avatar images in `./avatars/` folder.

## Expressions

Available expressions:
- `neutral`
- `happy`
- `sad`
- `excited`
- `thinking`
- `surprised`
- `apologetic`

## Troubleshooting

### CUDA Not Found

```bash
# Check CUDA version
nvidia-smi

# Reinstall PyTorch with correct CUDA version
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### MuseTalk Models Missing

```bash
cd C:\Projects\MuseTalk
python scripts/download_models.py
```

### Port Already in Use

```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F
```

## Performance Notes

- First generation takes longer (model loading)
- Subsequent generations: ~1-2 seconds
- GPU memory usage: ~4-6GB
- Keep server running for best performance

## Integration with GEM Mobile

The mobile app connects to this server via the `avatarService.js`:

```javascript
// gem-mobile/src/services/avatarService.js
const MUSETALK_API_URL = process.env.EXPO_PUBLIC_MUSETALK_API_URL;

const generateVideo = async (audioUrl, expression) => {
    const response = await fetch(`${MUSETALK_API_URL}/generate-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            audio_url: audioUrl,
            avatar_id: 'suphu',
            expression: expression,
            quality: 'medium',
        }),
    });
    return response.json();
};
```
