import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, MessageSquare, Bookmark, Settings as SettingsIcon, Maximize } from 'lucide-react';

export default function VideoPlayer({
  url,
  onProgress,
  onEnded,
  savedProgress = 0,
  onAddNote,
  onAddBookmark
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(savedProgress);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (playing && showControls) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [playing, showControls]);

  // Update video element when playing state changes
  useEffect(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [playing]);

  // Handle progress
  const handleTimeUpdate = () => {
    if (videoRef.current && duration > 0) {
      const currentProgress = videoRef.current.currentTime / duration;
      setPlayed(currentProgress);
      if (onProgress) {
        onProgress(currentProgress);
      }
    }
  };

  // Handle seek
  const handleSeekChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setPlayed(newProgress);
    if (videoRef.current) {
      videoRef.current.currentTime = duration * newProgress;
    }
  };

  // Format time
  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  // Skip forward/backward
  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Add note at current timestamp
  const handleAddNote = () => {
    if (noteText.trim() && videoRef.current) {
      const timestamp = videoRef.current.currentTime;
      onAddNote?.({
        text: noteText,
        timestamp,
        formattedTime: formatTime(timestamp)
      });
      setNoteText('');
      setShowNoteInput(false);
    }
  };

  // Add bookmark
  const handleAddBookmark = () => {
    if (videoRef.current) {
      const timestamp = videoRef.current.currentTime;
      onAddBookmark?.({
        timestamp,
        formattedTime: formatTime(timestamp)
      });
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 aspect ratio
        background: '#000000',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={(e) => setDuration(e.target.duration)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
          if (savedProgress > 0) {
            e.target.currentTime = e.target.duration * savedProgress;
          }
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
        playsInline
      />

      {/* Play/Pause Overlay */}
      {!playing && (
        <button
          onClick={() => setPlaying(true)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255, 189, 89, 0.9)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
        >
          <Play size={32} style={{ marginLeft: '4px' }} />
        </button>
      )}

      {/* Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
          padding: '40px 20px 20px',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none',
          zIndex: 20
        }}
      >
        {/* Progress Bar */}
        <input
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={played}
          onChange={handleSeekChange}
          style={{
            width: '100%',
            height: '6px',
            marginBottom: '16px',
            cursor: 'pointer',
            appearance: 'none',
            background: `linear-gradient(to right, #FFBD59 0%, #FFBD59 ${played * 100}%, rgba(255, 255, 255, 0.3) ${played * 100}%, rgba(255, 255, 255, 0.3) 100%)`,
            borderRadius: '3px',
            outline: 'none'
          }}
        />

        {/* Control Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Left Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying(!playing)}
              className="video-btn"
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Skip Backward */}
            <button onClick={() => skip(-10)} className="video-btn">
              <SkipBack size={20} />
            </button>

            {/* Skip Forward */}
            <button onClick={() => skip(10)} className="video-btn">
              <SkipForward size={20} />
            </button>

            {/* Volume */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => {
                  setMuted(!muted);
                  if (videoRef.current) {
                    videoRef.current.muted = !muted;
                  }
                }}
                className="video-btn"
              >
                {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  setMuted(false);
                  if (videoRef.current) {
                    videoRef.current.volume = newVolume;
                    videoRef.current.muted = false;
                  }
                }}
                style={{
                  width: '80px',
                  height: '4px',
                  cursor: 'pointer',
                  appearance: 'none',
                  background: `linear-gradient(to right, #FFBD59 0%, #FFBD59 ${volume * 100}%, rgba(255, 255, 255, 0.3) ${volume * 100}%, rgba(255, 255, 255, 0.3) 100%)`,
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Time Display */}
            <span style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontFamily: 'monospace',
              marginLeft: '8px'
            }}>
              {formatTime(duration * played)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Add Note */}
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="video-btn"
              style={{
                background: showNoteInput ? 'rgba(255, 189, 89, 0.2)' : 'none',
                border: showNoteInput ? '1px solid #FFBD59' : 'none'
              }}
              title="Thêm ghi chú"
            >
              <MessageSquare size={20} />
            </button>

            {/* Add Bookmark */}
            <button
              onClick={handleAddBookmark}
              className="video-btn"
              title="Đánh dấu"
            >
              <Bookmark size={20} />
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="video-btn"
              style={{
                background: showSettings ? 'rgba(255, 189, 89, 0.2)' : 'none',
                border: showSettings ? '1px solid #FFBD59' : 'none'
              }}
            >
              <SettingsIcon size={20} />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="video-btn">
              <Maximize size={20} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="video-panel">
            <h4 className="video-panel-title">Cài Đặt Video</h4>

            {/* Playback Speed */}
            <div style={{ marginBottom: '16px' }}>
              <label className="video-label">Tốc độ phát</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px'
              }}>
                {[0.5, 1, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackRate(speed);
                      if (videoRef.current) {
                        videoRef.current.playbackRate = speed;
                      }
                    }}
                    className="speed-btn"
                    style={{
                      background: playbackRate === speed
                        ? 'rgba(255, 189, 89, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: playbackRate === speed
                        ? '1px solid #FFBD59'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      color: playbackRate === speed ? '#FFBD59' : '#FFFFFF'
                    }}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Note Input */}
        {showNoteInput && (
          <div className="video-panel">
            <h4 className="video-panel-title">Thêm Ghi Chú</h4>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Nhập ghi chú của bạn..."
              className="note-textarea"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleAddNote} className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '12px' }}>
                Lưu Ghi Chú
              </button>
              <button
                onClick={() => {
                  setShowNoteInput(false);
                  setNoteText('');
                }}
                className="btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '12px' }}
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .video-btn {
          background: none;
          border: none;
          color: #FFFFFF;
          cursor: pointer;
          padding: 8px;
          font-size: 20px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .video-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .video-panel {
          position: absolute;
          bottom: 80px;
          right: 20px;
          background: rgba(10, 14, 39, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          borderRadius: 12px;
          padding: 16px;
          min-width: 200px;
        }

        .video-panel-title {
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .video-label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          margin-bottom: 8px;
        }

        .speed-btn {
          padding: 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .note-textarea {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          background: rgba(17, 34, 80, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: #FFFFFF;
          font-size: 14px;
          font-family: Poppins, sans-serif;
          resize: vertical;
          margin-bottom: 12px;
        }

        .note-textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FFBD59;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #FFBD59;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
