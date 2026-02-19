import React, { useState, useCallback, useEffect } from 'react';
import {
  X, Target, Heart, Briefcase, DollarSign, Users, Brain, Sparkles,
  ChevronRight, Check, Plus, CheckCircle, Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import './GoalSettingForm.css';

const LIFE_AREAS = [
  { id: 'finance', label: 'Tai chinh', Icon: DollarSign, color: '#10B981' },
  { id: 'crypto', label: 'Crypto', Icon: Zap, color: '#F7931A' },
  { id: 'career', label: 'Su nghiep', Icon: Briefcase, color: '#6366F1' },
  { id: 'health', label: 'Suc khoe', Icon: Heart, color: '#EF4444' },
  { id: 'relationships', label: 'Moi quan he', Icon: Users, color: '#EC4899' },
  { id: 'personal', label: 'Phat trien ban than', Icon: Brain, color: '#8B5CF6' },
  { id: 'spiritual', label: 'Tam linh', Icon: Sparkles, color: '#F59E0B' },
];

const TIMEFRAMES = [
  { id: '1week', label: '1 tuan' },
  { id: '1month', label: '1 thang' },
  { id: '3months', label: '3 thang' },
  { id: '6months', label: '6 thang' },
  { id: '1year', label: '1 nam' },
  { id: 'ongoing', label: 'Khong gioi han' },
];

const MOTIVATION_LEVELS = [
  { id: 'very_high', label: 'Rat cao', emoji: '100%' },
  { id: 'high', label: 'Cao', emoji: '80%' },
  { id: 'medium', label: 'Trung binh', emoji: '50%' },
  { id: 'need_help', label: 'Can ho tro', emoji: '30%' },
];

const GOAL_SUGGESTIONS = {
  finance: ['Tiet kiem 100 trieu trong 6 thang', 'Xay dung quy khan cap', 'Tang thu nhap thu dong len 10tr/thang'],
  crypto: ['Dat loi nhuan 50% tu trading', 'Xay dung portfolio can bang', 'Hoc phan tich ky thuat thanh thao'],
  career: ['Thang tien len vi tri quan ly', 'Tang luong 30% trong nam nay', 'Hoc them ky nang moi (AI, Data)'],
  health: ['Giam 10kg va duy tri can nang', 'Tap gym deu dan 4 buoi/tuan', 'Ngu du 7-8 tieng moi dem'],
  relationships: ['Cai thien moi quan he voi gia dinh', 'Mo rong mang luoi quan he', 'Hoc cach giao tiep hieu qua'],
  personal: ['Hoc ngoai ngu moi', 'Doc 24 cuon sach trong nam', 'Phat trien tu duy tich cuc'],
  spiritual: ['Thien dinh sau 30 phut moi ngay', 'Ket noi voi ban nga cao hon', 'Thuc hanh biet on moi ngay'],
};

const AFFIRMATION_TEMPLATES = {
  finance: ['Toi thu hut tien bac va su thinh vuong moi ngay', 'Toi xung dang duoc giau co va sung tuc', 'Tien bac den voi toi de dang va lien tuc'],
  crypto: ['Toi giao dich voi su binh tinh va ky luat', 'Moi quyet dinh trading cua toi deu sang suot', 'Toi kien nhan cho doi co hoi hoan hao'],
  career: ['Toi la chuyen gia trong linh vuc cua minh', 'Co hoi tot luon den voi toi', 'Toi tu tin trong moi quyet dinh cong viec'],
  health: ['Co the toi khoe manh va tran day nang luong', 'Toi yeu thuong va cham soc ban than moi ngay', 'Toi ngu ngon va thuc day day suc song'],
  relationships: ['Toi thu hut nhung moi quan he tich cuc', 'Toi duoc yeu thuong va ton trong', 'Tinh yeu tran ngap trong cuoc song cua toi'],
  personal: ['Toi tin tuong vao kha nang cua ban than', 'Moi ngay toi tro nen tot dep hon', 'Toi dung cam theo duoi uoc mo'],
  spiritual: ['Toi ket noi sau sac voi vu tru', 'Nang luong tich cuc bao quanh toi', 'Toi song trong su biet on moi ngay'],
};

const getActionSteps = (area) => {
  const stepsByArea = {
    finance: ['Lap ngan sach chi tiet va theo doi chi tieu', 'Dat muc tieu tiet kiem cu the moi thang', 'Tim hieu va dau tu vao kenh phu hop'],
    crypto: ['Hoc trading/phan tich ky thuat 1h/ngay', 'Ghi chep trading journal sau moi lenh', 'Quan ly rui ro: khong vao qua 2% von/lenh'],
    career: ['Xac dinh 3 ky nang quan trong can phat trien', 'Mo rong network qua cac su kien nganh', 'Dat muc tieu KPI hang thang'],
    health: ['Lap lich tap luyen co dinh 3 buoi/tuan', 'Chuan bi bua an lanh manh tu dau tuan', 'Ngu du 7-8 tieng va duy tri gio ngu deu dan'],
    relationships: ['Danh thoi gian chat luong voi nguoi than yeu', 'Thuc hanh lang nghe tich cuc', 'Tham gia hoat dong xa hoi'],
    personal: ['Doc sach hoac hoc ky nang moi 30 phut moi ngay', 'Viet nhat ky phan chieu', 'Dat ra thu thach nho hang tuan'],
    spiritual: ['Thien dinh 10-15 phut moi ngay', 'Viet 3 dieu biet on moi toi', 'Ket noi voi thien nhien'],
  };
  return stepsByArea[area] || stepsByArea.personal;
};

const GoalSettingForm = ({
  isOpen,
  formType = 'goal',
  preSelectedArea = null,
  userInput = null,
  onClose,
  onSubmit,
}) => {
  const initialStep = preSelectedArea ? 2 : 1;

  const [step, setStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedArea, setSelectedArea] = useState(preSelectedArea);
  const [goalText, setGoalText] = useState(userInput || '');
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);
  const [selectedMotivation, setSelectedMotivation] = useState(null);
  const [selectedAffirmations, setSelectedAffirmations] = useState([]);
  const [customAffirmation, setCustomAffirmation] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (preSelectedArea) {
        setSelectedArea(preSelectedArea);
        setStep(2);
      } else {
        setStep(1);
      }
      if (userInput) setGoalText(userInput);
    }
  }, [isOpen, preSelectedArea, userInput]);

  const resetForm = useCallback(() => {
    setStep(preSelectedArea ? 2 : 1);
    setSelectedArea(preSelectedArea || null);
    setGoalText(userInput || '');
    setSelectedTimeframe(null);
    setSelectedMotivation(null);
    setSelectedAffirmations([]);
    setCustomAffirmation('');
    setShowResult(false);
    setAnalysisResult(null);
  }, [preSelectedArea, userInput]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose?.();
  }, [resetForm, onClose]);

  const toggleAffirmation = useCallback((aff) => {
    setSelectedAffirmations(prev =>
      prev.includes(aff) ? prev.filter(a => a !== aff) : [...prev, aff]
    );
  }, []);

  const addCustomAffirmation = useCallback(() => {
    if (customAffirmation.trim()) {
      setSelectedAffirmations(prev => [...prev, customAffirmation.trim()]);
      setCustomAffirmation('');
    }
  }, [customAffirmation]);

  const nextStep = useCallback(() => {
    if (step < 4) setStep(step + 1);
  }, [step]);

  const prevStep = useCallback(() => {
    const minStep = preSelectedArea ? 2 : 1;
    if (step > minStep) setStep(step - 1);
  }, [step, preSelectedArea]);

  const isStepComplete = useCallback(() => {
    switch (step) {
      case 1: return selectedArea !== null;
      case 2: return goalText.trim().length >= 5;
      case 3: return selectedTimeframe !== null && selectedMotivation !== null;
      case 4: return selectedAffirmations.length > 0;
      default: return false;
    }
  }, [step, selectedArea, goalText, selectedTimeframe, selectedMotivation, selectedAffirmations]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const areaLabel = LIFE_AREAS.find(a => a.id === selectedArea)?.label || '';
      const timeframeLabel = TIMEFRAMES.find(t => t.id === selectedTimeframe)?.label || '';
      const motivationLabel = MOTIVATION_LEVELS.find(m => m.id === selectedMotivation)?.label || '';
      const actionSteps = getActionSteps(selectedArea);

      const analysis = `Phan tich muc tieu: ${areaLabel}\n\nMuc tieu cua ban:\n"${goalText}"\n\nThoi gian: ${timeframeLabel}\nMuc do quyet tam: ${motivationLabel}\n\n3 buoc hanh dong de xuat:\n${actionSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nAffirmations hang ngay:\n${selectedAffirmations.map(a => `• "${a}"`).join('\n')}`;

      const result = {
        formData: { lifeArea: selectedArea, goal: goalText, timeframe: timeframeLabel, motivation: selectedMotivation, affirmations: selectedAffirmations },
        analysis,
        widgets: [
          { type: 'goal', title: goalText, icon: '🎯', data: { goalText, lifeArea: selectedArea, timeline: timeframeLabel } },
          { type: 'affirmation', title: `Khang dinh: ${areaLabel}`, icon: '✨', data: { affirmations: selectedAffirmations, lifeArea: selectedArea } },
          { type: 'action_plan', title: `Ke hoach: ${areaLabel}`, icon: '📋', data: { steps: actionSteps.map((s, i) => ({ id: `step_${i}`, text: s, completed: false })), lifeArea: selectedArea } },
        ],
      };

      setAnalysisResult(result);
      setShowResult(true);
    } catch (error) {
      console.error('[GoalSettingForm] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedArea, goalText, selectedTimeframe, selectedMotivation, selectedAffirmations]);

  const handleAddToVisionBoard = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const widgets = analysisResult?.widgets || [];
      for (const widget of widgets) {
        await supabase.from('vision_board_widgets').insert({
          user_id: user.id,
          type: widget.type,
          title: widget.title,
          icon: widget.icon,
          content: widget.data,
          is_active: true,
        });
      }

      setShowSuccessModal(true);
      onSubmit?.({ success: true, widgets: analysisResult?.widgets, analysis: analysisResult?.analysis });
    } catch (error) {
      console.error('[GoalSettingForm] Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [analysisResult, onSubmit]);

  const getAreaLabel = useCallback(() => {
    return LIFE_AREAS.find(a => a.id === selectedArea)?.label || '';
  }, [selectedArea]);

  if (!isOpen) return null;

  const totalSteps = preSelectedArea ? 3 : 4;
  const adjustedStep = preSelectedArea ? step - 1 : step;

  return (
    <div className="goal-setting-form__overlay">
      <div className="goal-setting-form">
        {/* Header */}
        <div className="goal-setting-form__header">
          <button className="goal-setting-form__close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
          <span className="goal-setting-form__header-title">
            {preSelectedArea ? `Manifest ${getAreaLabel()}` : formType === 'goal' ? 'Dat Muc Tieu Moi' : 'Tao Affirmation'}
          </span>
          <div className="goal-setting-form__header-spacer" />
        </div>

        {/* Step Indicator */}
        {!showResult && (
          <div className="goal-setting-form__step-indicator">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`goal-setting-form__step-dot ${s === adjustedStep ? 'goal-setting-form__step-dot--active' : ''} ${s < adjustedStep ? 'goal-setting-form__step-dot--complete' : ''}`}
              >
                {s < adjustedStep && <Check size={12} color="#0A0F1C" />}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="goal-setting-form__scroll-content">
          {showResult ? (
            <div className="goal-setting-form__result-container">
              <div className="goal-setting-form__result-header">
                <CheckCircle size={48} color="#10B981" />
                <div className="goal-setting-form__result-title">Phan tich hoan tat!</div>
              </div>

              <div className="goal-setting-form__analysis-card">
                <div className="goal-setting-form__analysis-title">Ket qua phan tich</div>
                <div className="goal-setting-form__analysis-text">{analysisResult?.analysis}</div>
              </div>

              <div className="goal-setting-form__widget-preview">
                <div className="goal-setting-form__widget-preview-title">Muc tieu se duoc tao:</div>
                {analysisResult?.widgets?.map((w, i) => (
                  <div key={i} className="goal-setting-form__widget-preview-item">
                    <span className="goal-setting-form__widget-preview-icon">{w.icon}</span>
                    <span className="goal-setting-form__widget-preview-text">{w.title}</span>
                  </div>
                ))}
              </div>

              <div className="goal-setting-form__result-actions">
                <button className="goal-setting-form__skip-result-btn" onClick={handleClose}>De sau</button>
                <button className="goal-setting-form__add-vision-btn" onClick={handleAddToVisionBoard} disabled={isSubmitting}>
                  {isSubmitting ? <div className="goal-setting-form__spinner" /> : (
                    <>
                      <Plus size={18} color="#0A0F1C" />
                      Them vao Vision Board
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="goal-setting-form__step-content">
              {/* Step 1: Life Area Selection */}
              {step === 1 && (
                <>
                  <div className="goal-setting-form__step-title">Ban muon dat muc tieu o linh vuc nao?</div>
                  <div className="goal-setting-form__step-subtitle">Chon mot linh vuc phu hop nhat</div>
                  <div className="goal-setting-form__area-grid">
                    {LIFE_AREAS.map((area) => (
                      <div
                        key={area.id}
                        className={`goal-setting-form__area-card ${selectedArea === area.id ? 'goal-setting-form__area-card--selected' : ''}`}
                        style={{ '--area-color': area.color }}
                        onClick={() => setSelectedArea(area.id)}
                      >
                        <div className="goal-setting-form__area-icon-container" style={{ background: `${area.color}30` }}>
                          <area.Icon size={24} color={area.color} />
                        </div>
                        <div className="goal-setting-form__area-label">{area.label}</div>
                        {selectedArea === area.id && (
                          <div className="goal-setting-form__check-badge" style={{ background: area.color }}>
                            <Check size={14} color="#fff" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Step 2: Goal Description */}
              {step === 2 && (
                <>
                  <div className="goal-setting-form__step-title">Mo ta muc tieu cua ban</div>
                  <div className="goal-setting-form__step-subtitle">
                    Trong linh vuc <span className="goal-setting-form__step-subtitle-area" style={{ color: LIFE_AREAS.find(a => a.id === selectedArea)?.color }}>{getAreaLabel()}</span>, ban muon dat duoc gi?
                  </div>
                  <textarea
                    className="goal-setting-form__goal-input"
                    placeholder="Nhap muc tieu hoac chon goi y ben duoi..."
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    rows={4}
                  />
                  <div className="goal-setting-form__char-count">{goalText.length} ky tu (toi thieu 5)</div>
                  {(GOAL_SUGGESTIONS[selectedArea] || []).length > 0 && (
                    <div className="goal-setting-form__suggestions-section">
                      <div className="goal-setting-form__suggestions-label">Goi y nhanh:</div>
                      <div className="goal-setting-form__suggestions-list">
                        {(GOAL_SUGGESTIONS[selectedArea] || []).map((suggestion, index) => (
                          <button
                            key={index}
                            className={`goal-setting-form__suggestion-chip ${goalText === suggestion ? 'goal-setting-form__suggestion-chip--selected' : ''}`}
                            onClick={() => setGoalText(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 3: Timeframe & Motivation */}
              {step === 3 && (
                <>
                  <div className="goal-setting-form__step-title">Thoi gian & Muc do quyet tam</div>

                  <div className="goal-setting-form__section-label">Ban muon hoan thanh trong bao lau?</div>
                  <div className="goal-setting-form__option-row">
                    {TIMEFRAMES.map((tf) => (
                      <button
                        key={tf.id}
                        className={`goal-setting-form__option-chip ${selectedTimeframe === tf.id ? 'goal-setting-form__option-chip--selected' : ''}`}
                        onClick={() => setSelectedTimeframe(tf.id)}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>

                  <div className="goal-setting-form__section-label" style={{ marginTop: 24 }}>Muc do quyet tam cua ban?</div>
                  <div className="goal-setting-form__motivation-grid">
                    {MOTIVATION_LEVELS.map((level) => (
                      <div
                        key={level.id}
                        className={`goal-setting-form__motivation-card ${selectedMotivation === level.id ? 'goal-setting-form__motivation-card--selected' : ''}`}
                        onClick={() => setSelectedMotivation(level.id)}
                      >
                        <div className="goal-setting-form__motivation-emoji">{level.emoji}</div>
                        <div className="goal-setting-form__motivation-label">{level.label}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Step 4: Affirmations */}
              {step === 4 && (
                <>
                  <div className="goal-setting-form__step-title">Chon Affirmation phu hop</div>
                  <div className="goal-setting-form__step-subtitle">Chon nhung cau khang dinh ban muon nhac nho moi ngay</div>

                  <div className="goal-setting-form__affirmation-list">
                    {(AFFIRMATION_TEMPLATES[selectedArea] || AFFIRMATION_TEMPLATES.personal).map((aff, index) => {
                      const isSelected = selectedAffirmations.includes(aff);
                      return (
                        <div
                          key={index}
                          className={`goal-setting-form__affirmation-item ${isSelected ? 'goal-setting-form__affirmation-item--selected' : ''}`}
                          onClick={() => toggleAffirmation(aff)}
                        >
                          <div className={`goal-setting-form__checkbox ${isSelected ? 'goal-setting-form__checkbox--selected' : ''}`}>
                            {isSelected && <Check size={14} color="#0A0F1C" />}
                          </div>
                          <span className="goal-setting-form__affirmation-text">&ldquo;{aff}&rdquo;</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="goal-setting-form__custom-aff-container">
                    <input
                      className="goal-setting-form__custom-aff-input"
                      placeholder="Hoac them affirmation cua rieng ban..."
                      value={customAffirmation}
                      onChange={(e) => setCustomAffirmation(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomAffirmation()}
                    />
                    <button
                      className="goal-setting-form__add-aff-btn"
                      onClick={addCustomAffirmation}
                      disabled={!customAffirmation.trim()}
                    >
                      <Plus size={18} color={customAffirmation.trim() ? '#FFBD59' : '#718096'} />
                    </button>
                  </div>

                  <div className="goal-setting-form__selected-count">Da chon: {selectedAffirmations.length} affirmation</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {!showResult && (
          <div className="goal-setting-form__bottom-actions">
            {step > (preSelectedArea ? 2 : 1) && (
              <button className="goal-setting-form__back-btn" onClick={prevStep}>Quay lai</button>
            )}
            {step < 4 ? (
              <button className="goal-setting-form__next-btn" onClick={nextStep} disabled={!isStepComplete()}>
                Tiep theo
                <ChevronRight size={20} color="#0A0F1C" />
              </button>
            ) : (
              <button className="goal-setting-form__submit-btn" onClick={handleSubmit} disabled={!isStepComplete() || isSubmitting}>
                {isSubmitting ? <div className="goal-setting-form__spinner" /> : (
                  <>
                    <Sparkles size={20} color="#0A0F1C" />
                    Phan tich & Tao Muc Tieu
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="goal-setting-form__success-overlay">
            <div className="goal-setting-form__success-modal">
              <CheckCircle size={48} color="#10B981" />
              <div className="goal-setting-form__success-title">Da them thanh cong!</div>
              <div className="goal-setting-form__success-message">Muc tieu da duoc them vao Vision Board cua ban.</div>
              <div className="goal-setting-form__success-buttons">
                <button className="goal-setting-form__success-btn-secondary" onClick={() => { setShowSuccessModal(false); handleClose(); }}>Dong</button>
                <button className="goal-setting-form__success-btn-primary" onClick={() => { setShowSuccessModal(false); handleClose(); }}>Xem Vision Board</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalSettingForm;
