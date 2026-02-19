import React, { useState, useCallback } from 'react';
import {
  Target, Heart, Briefcase, DollarSign, Users, Brain, Sparkles,
  X, Check, ChevronRight, Zap,
} from 'lucide-react';
import './InlineChatForm.css';

const LIFE_AREAS = [
  { id: 'finance', label: 'Tai chinh', Icon: DollarSign, color: '#10B981' },
  { id: 'crypto', label: 'Crypto', Icon: Zap, color: '#F7931A' },
  { id: 'career', label: 'Su nghiep', Icon: Briefcase, color: '#6366F1' },
  { id: 'health', label: 'Suc khoe', Icon: Heart, color: '#EF4444' },
  { id: 'relationships', label: 'Moi quan he', Icon: Users, color: '#EC4899' },
  { id: 'personal', label: 'Phat trien', Icon: Brain, color: '#8B5CF6' },
  { id: 'spiritual', label: 'Tam thuc', Icon: Sparkles, color: '#F59E0B' },
];

const GOAL_SUGGESTIONS = {
  finance: ['Tiet kiem 100 trieu trong 6 thang', 'Tang thu nhap thu dong'],
  crypto: ['Dat loi nhuan 50% tu trading', 'Quan ly rui ro 2%/lenh'],
  career: ['Thang tien len vi tri quan ly', 'Hoc ky nang moi'],
  health: ['Tap gym 4 buoi/tuan', 'Thien dinh 15 phut/ngay'],
  relationships: ['Cai thien quan he gia dinh', 'Mo rong mang luoi'],
  personal: ['Doc 24 cuon sach', 'Phat trien tu duy tich cuc'],
  spiritual: ['Thien dinh 30 phut/ngay', 'Thuc hanh biet on'],
};

const TIMEFRAMES = [
  { id: '1week', label: '1 tuan' },
  { id: '1month', label: '1 thang' },
  { id: '3months', label: '3 thang' },
  { id: '6months', label: '6 thang' },
  { id: '1year', label: '1 nam' },
];

const AFFIRMATION_TEMPLATES = {
  finance: ['Toi thu hut tien bac va thinh vuong', 'Tien bac den voi toi de dang'],
  crypto: ['Toi giao dich voi binh tinh va ky luat', 'Toi kien nhan cho doi co hoi hoan hao'],
  career: ['Toi la chuyen gia trong linh vuc cua minh', 'Co hoi tot luon den voi toi'],
  health: ['Co the toi khoe manh va day nang luong', 'Toi cham soc ban than moi ngay'],
  relationships: ['Toi thu hut moi quan he tich cuc', 'Toi duoc yeu thuong va ton trong'],
  personal: ['Toi tin tuong vao kha nang cua ban than', 'Moi ngay toi tro nen tot dep hon'],
  spiritual: ['Toi ket noi sau sac voi vu tru', 'Nang luong tich cuc bao quanh toi'],
};

const InlineChatForm = ({ type = 'goal', onSubmit, onCancel, context }) => {
  const [step, setStep] = useState(1);
  const [selectedArea, setSelectedArea] = useState(context?.preSelectedArea || null);
  const [goalText, setGoalText] = useState(context?.userInput || '');
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);
  const [selectedAffirmations, setSelectedAffirmations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;

  const toggleAffirmation = useCallback((aff) => {
    setSelectedAffirmations(prev =>
      prev.includes(aff) ? prev.filter(a => a !== aff) : [...prev, aff]
    );
  }, []);

  const canProceed = useCallback(() => {
    switch (step) {
      case 1: return selectedArea && goalText.trim().length >= 3;
      case 2: return selectedTimeframe !== null;
      case 3: return selectedAffirmations.length > 0;
      default: return false;
    }
  }, [step, selectedArea, goalText, selectedTimeframe, selectedAffirmations]);

  const handleNext = useCallback(() => {
    if (step < totalSteps) setStep(step + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const areaLabel = LIFE_AREAS.find(a => a.id === selectedArea)?.label || '';
      const timeframeLabel = TIMEFRAMES.find(t => t.id === selectedTimeframe)?.label || '';

      onSubmit?.({
        type,
        formData: {
          lifeArea: selectedArea,
          lifeAreaLabel: areaLabel,
          goal: goalText,
          timeframe: timeframeLabel,
          affirmations: selectedAffirmations,
        },
        widgets: [
          { type: 'goal', title: goalText, icon: '🎯', data: { goalText, lifeArea: selectedArea, timeline: timeframeLabel } },
          { type: 'affirmation', title: `Khang dinh: ${areaLabel}`, icon: '✨', data: { affirmations: selectedAffirmations, lifeArea: selectedArea } },
        ],
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [type, selectedArea, goalText, selectedTimeframe, selectedAffirmations, onSubmit]);

  return (
    <div className="inline-chat-form">
      {/* Header */}
      <div className="inline-chat-form__header">
        <div className="inline-chat-form__header-left">
          <Target size={16} color="#FFBD59" />
          <span className="inline-chat-form__title">
            {type === 'goal' ? 'Tao Muc Tieu' : 'Tao Affirmation'}
          </span>
        </div>
        <button className="inline-chat-form__close-btn" onClick={onCancel}>
          <X size={18} />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="inline-chat-form__step-indicator">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`inline-chat-form__step-dot ${i + 1 === step ? 'inline-chat-form__step-dot--active' : ''} ${i + 1 < step ? 'inline-chat-form__step-dot--complete' : ''}`}
          />
        ))}
      </div>

      {/* Step 1: Area + Goal */}
      {step === 1 && (
        <>
          <div className="inline-chat-form__area-grid">
            {LIFE_AREAS.map((area) => (
              <button
                key={area.id}
                className={`inline-chat-form__area-chip ${selectedArea === area.id ? 'inline-chat-form__area-chip--selected' : ''}`}
                style={{ '--area-color': area.color }}
                onClick={() => setSelectedArea(area.id)}
              >
                <area.Icon size={14} color={selectedArea === area.id ? area.color : '#A0AEC0'} />
                {area.label}
              </button>
            ))}
          </div>

          <div className="inline-chat-form__input-group">
            <input
              className="inline-chat-form__input"
              placeholder="Mo ta muc tieu cua ban..."
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
            />
          </div>

          {selectedArea && (GOAL_SUGGESTIONS[selectedArea] || []).length > 0 && (
            <div className="inline-chat-form__suggestions">
              {GOAL_SUGGESTIONS[selectedArea].map((s, i) => (
                <button
                  key={i}
                  className={`inline-chat-form__suggestion-chip ${goalText === s ? 'inline-chat-form__suggestion-chip--selected' : ''}`}
                  onClick={() => setGoalText(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Step 2: Timeframe */}
      {step === 2 && (
        <>
          <div className="inline-chat-form__input-label">Thoi gian hoan thanh:</div>
          <div className="inline-chat-form__timeframe-row">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                className={`inline-chat-form__timeframe-chip ${selectedTimeframe === tf.id ? 'inline-chat-form__timeframe-chip--selected' : ''}`}
                onClick={() => setSelectedTimeframe(tf.id)}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 3: Affirmations */}
      {step === 3 && (
        <>
          <div className="inline-chat-form__input-label">Chon affirmation:</div>
          <div className="inline-chat-form__affirmation-list">
            {(AFFIRMATION_TEMPLATES[selectedArea] || AFFIRMATION_TEMPLATES.personal).map((aff, i) => {
              const isSelected = selectedAffirmations.includes(aff);
              return (
                <div
                  key={i}
                  className="inline-chat-form__affirmation-item"
                  onClick={() => toggleAffirmation(aff)}
                >
                  <div className={`inline-chat-form__affirmation-check ${isSelected ? 'inline-chat-form__affirmation-check--selected' : ''}`}>
                    {isSelected && <Check size={12} color="#0A0F1C" />}
                  </div>
                  <span className="inline-chat-form__affirmation-text">&ldquo;{aff}&rdquo;</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="inline-chat-form__actions">
        {step > 1 && (
          <button className="inline-chat-form__cancel-btn" onClick={handleBack}>Quay lai</button>
        )}
        <button className="inline-chat-form__cancel-btn" onClick={onCancel}>Huy</button>
        {step < totalSteps ? (
          <button className="inline-chat-form__submit-btn" onClick={handleNext} disabled={!canProceed()}>
            Tiep <ChevronRight size={14} color="#0A0F1C" />
          </button>
        ) : (
          <button className="inline-chat-form__submit-btn" onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
            {isSubmitting ? 'Dang xu ly...' : 'Tao Muc Tieu'}
          </button>
        )}
      </div>
    </div>
  );
};

export default InlineChatForm;
