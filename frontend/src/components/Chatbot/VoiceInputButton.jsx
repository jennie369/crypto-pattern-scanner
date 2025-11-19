import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { voiceInputService } from '../../services/voiceInput';
import './VoiceInputButton.css';

export const VoiceInputButton = ({ onTranscript, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [language, setLanguage] = useState('vi-VN');

  const toggleListening = () => {
    if (isListening) {
      voiceInputService.stop();
      setIsListening(false);
      setInterimText('');
    } else {
      voiceInputService.setLanguage(language);
      voiceInputService.start(
        (transcript, isFinal) => {
          if (isFinal) {
            onTranscript(transcript);
            setInterimText('');
          } else {
            setInterimText(transcript);
          }
        },
        () => {
          setIsListening(false);
          setInterimText('');
        },
        (error) => {
          console.error('Voice input error:', error);
          setIsListening(false);
          setInterimText('');
        }
      );
      setIsListening(true);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'vi-VN' ? 'en-US' : 'vi-VN');
  };

  if (!voiceInputService.isSupported()) {
    return null;
  }

  return (
    <div className="voice-input-container">
      <button
        onClick={toggleListening}
        disabled={disabled}
        className={`voice-btn ${isListening ? 'listening' : ''}`}
        title={isListening ? 'Nhấn để dừng' : 'Nhấn để nói'}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <button
        onClick={toggleLanguage}
        className="lang-toggle"
        title="Đổi ngôn ngữ"
        disabled={disabled || isListening}
      >
        {language === 'vi-VN' ? '🇻🇳' : '🇺🇸'}
      </button>

      {interimText && (
        <div className="interim-text">
          {interimText}
        </div>
      )}
    </div>
  );
};
