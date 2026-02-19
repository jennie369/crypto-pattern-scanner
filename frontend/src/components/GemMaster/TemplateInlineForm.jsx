import React, { useState, useCallback, useEffect } from 'react';
import {
  X, Check, Target, AlertTriangle, BookOpen, Heart, Award,
  Calendar, Star, Sparkles, TrendingUp, Plus, Minus,
} from 'lucide-react';
import './TemplateInlineForm.css';

const TEMPLATE_ICONS = {
  goal_basic: Target,
  fear_setting: AlertTriangle,
  think_day: BookOpen,
  gratitude: Heart,
  daily_wins: Award,
  weekly_planning: Calendar,
  vision_3_5_years: Star,
  free_form: Sparkles,
  trading_journal: TrendingUp,
};

const TEMPLATES = {
  fear_setting: {
    title: 'Fear Setting',
    subtitle: 'Vuot qua noi so theo phuong phap Tim Ferriss',
    fields: [
      { id: 'fear', type: 'textarea', label: 'Noi so lon nhat cua ban la gi?', placeholder: 'Mo ta noi so...', required: true },
      { id: 'worst_case', type: 'textarea', label: 'Dieu te nhat co the xay ra?', placeholder: 'Kich ban xau nhat...' },
      { id: 'prevent', type: 'list', label: 'Cach ngan chan kich ban xau', placeholder: 'Them bien phap...' },
      { id: 'repair', type: 'list', label: 'Cach khac phuc neu xay ra', placeholder: 'Them giai phap...' },
      { id: 'benefits', type: 'textarea', label: 'Loi ich neu ban hanh dong?', placeholder: 'Nhung dieu tot dep...' },
      { id: 'cost_inaction', type: 'textarea', label: 'Cai gia phai tra neu khong hanh dong?', placeholder: 'Mat mat...' },
    ],
  },
  think_day: {
    title: 'Think Day',
    subtitle: 'Ngay suy nghi chien luoc',
    fields: [
      { id: 'reflection', type: 'textarea', label: 'Dieu gi dang hoat dong tot?', placeholder: 'Thanh tuu gan day...', required: true },
      { id: 'challenges', type: 'textarea', label: 'Thu thach lon nhat hien tai?', placeholder: 'Kho khan...' },
      { id: 'opportunities', type: 'textarea', label: 'Co hoi nao ban thay?', placeholder: 'Co hoi...' },
      { id: 'priorities', type: 'list', label: 'Uu tien 3 thang toi', placeholder: 'Them uu tien...' },
      { id: 'energy_level', type: 'rating', label: 'Muc nang luong hien tai?', min: 1, max: 10 },
    ],
  },
  gratitude: {
    title: 'Gratitude Journal',
    subtitle: 'Ghi chep long biet on',
    fields: [
      { id: 'grateful_1', type: 'text', label: 'Dieu biet on thu 1', placeholder: 'Toi biet on vi...', required: true },
      { id: 'grateful_2', type: 'text', label: 'Dieu biet on thu 2', placeholder: 'Toi biet on vi...' },
      { id: 'grateful_3', type: 'text', label: 'Dieu biet on thu 3', placeholder: 'Toi biet on vi...' },
      { id: 'highlight', type: 'textarea', label: 'Diem sang cua ngay hom nay', placeholder: 'Dieu tot dep nhat...' },
      { id: 'intention', type: 'text', label: 'Y dinh cho ngay mai', placeholder: 'Ngay mai toi se...' },
    ],
  },
  daily_wins: {
    title: 'Daily Wins',
    subtitle: 'Ghi nhan thanh tuu moi ngay',
    fields: [
      { id: 'wins', type: 'list', label: 'Chien thang hom nay', placeholder: 'Them thanh tuu...', required: true },
      { id: 'lesson', type: 'textarea', label: 'Bai hoc rut ra', placeholder: 'Toi da hoc duoc...' },
      { id: 'mood', type: 'rating', label: 'Tam trang hom nay', min: 1, max: 5 },
    ],
  },
  weekly_planning: {
    title: 'Weekly Planning',
    subtitle: 'Lap ke hoach tuan',
    fields: [
      { id: 'review', type: 'textarea', label: 'Tong ket tuan truoc', placeholder: 'Nhung gi da lam duoc...', required: true },
      { id: 'goals', type: 'list', label: 'Muc tieu tuan nay', placeholder: 'Them muc tieu...' },
      { id: 'priorities', type: 'list', label: 'Top 3 uu tien', placeholder: 'Them uu tien...' },
      { id: 'blockers', type: 'textarea', label: 'Tro ngai co the gap', placeholder: 'Kho khan...' },
    ],
  },
  trading_journal: {
    title: 'Trading Journal',
    subtitle: 'Ghi chep giao dich',
    fields: [
      { id: 'pair', type: 'text', label: 'Cap giao dich', placeholder: 'BTC/USDT', required: true },
      { id: 'direction', type: 'select', label: 'Huong giao dich', options: ['Long', 'Short'] },
      { id: 'entry', type: 'text', label: 'Gia vao', placeholder: '0.00' },
      { id: 'stop_loss', type: 'text', label: 'Stop Loss', placeholder: '0.00' },
      { id: 'take_profit', type: 'text', label: 'Take Profit', placeholder: '0.00' },
      { id: 'reasoning', type: 'textarea', label: 'Ly do vao lenh', placeholder: 'Setup, pattern, zone...' },
      { id: 'emotion', type: 'select', label: 'Cam xuc khi vao lenh', options: ['Binh tinh', 'Tu tin', 'Lo lang', 'FOMO', 'Tham lam'] },
      { id: 'lesson', type: 'textarea', label: 'Bai hoc rut ra (sau lenh)', placeholder: 'Dieu can cai thien...' },
    ],
  },
  free_form: {
    title: 'Free Form',
    subtitle: 'Viet tu do',
    fields: [
      { id: 'title', type: 'text', label: 'Tieu de', placeholder: 'Dat tieu de...', required: true },
      { id: 'content', type: 'textarea', label: 'Noi dung', placeholder: 'Viet tu do suy nghi cua ban...' },
      { id: 'tags', type: 'list', label: 'Tags', placeholder: 'Them tag...' },
    ],
  },
};

const TemplateInlineForm = ({
  visible,
  templateType = 'gratitude',
  onSubmit,
  onCancel,
}) => {
  const template = TEMPLATES[templateType] || TEMPLATES.free_form;
  const IconComponent = TEMPLATE_ICONS[templateType] || Sparkles;

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      const defaults = {};
      template.fields.forEach(f => {
        defaults[f.id] = f.type === 'list' ? [''] : f.type === 'rating' ? 0 : '';
      });
      setFormData(defaults);
      setErrors({});
    }
  }, [visible, templateType]);

  const handleFieldChange = useCallback((fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => { const next = { ...prev }; delete next[fieldId]; return next; });
    }
  }, [errors]);

  const handleListAdd = useCallback((fieldId) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), ''],
    }));
  }, []);

  const handleListRemove = useCallback((fieldId, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: (prev[fieldId] || []).filter((_, i) => i !== index),
    }));
  }, []);

  const handleListItemChange = useCallback((fieldId, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: (prev[fieldId] || []).map((item, i) => i === index ? value : item),
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const newErrors = {};
    template.fields.forEach(f => {
      if (f.required) {
        const val = formData[f.id];
        if (f.type === 'list') {
          if (!val || val.filter(v => v.trim()).length === 0) newErrors[f.id] = 'Bat buoc';
        } else if (!val || (typeof val === 'string' && !val.trim())) {
          newErrors[f.id] = 'Bat buoc';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      onSubmit?.({ templateType, formData });
    } finally {
      setIsSubmitting(false);
    }
  }, [templateType, formData, template, onSubmit]);

  if (!visible) return null;

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            className="template-inline-form__input"
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case 'textarea':
        return (
          <textarea
            className="template-inline-form__input template-inline-form__textarea"
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            rows={3}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            className="template-inline-form__input template-inline-form__date-input"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case 'select':
        return (
          <div className="template-inline-form__options">
            {(field.options || []).map((opt) => (
              <button
                key={opt}
                className={`template-inline-form__option ${formData[field.id] === opt ? 'template-inline-form__option--selected' : ''}`}
                onClick={() => handleFieldChange(field.id, opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case 'list':
        return (
          <div className="template-inline-form__list">
            {(formData[field.id] || []).map((item, i) => (
              <div key={i} className="template-inline-form__list-item">
                <input
                  className="template-inline-form__list-input"
                  placeholder={field.placeholder}
                  value={item}
                  onChange={(e) => handleListItemChange(field.id, i, e.target.value)}
                />
                {(formData[field.id] || []).length > 1 && (
                  <button className="template-inline-form__list-remove" onClick={() => handleListRemove(field.id, i)}>
                    <Minus size={16} />
                  </button>
                )}
              </div>
            ))}
            <button className="template-inline-form__list-add" onClick={() => handleListAdd(field.id)}>
              <Plus size={14} /> Them
            </button>
          </div>
        );
      case 'rating':
        return (
          <div className="template-inline-form__rating">
            {Array.from({ length: (field.max || 5) - (field.min || 1) + 1 }, (_, i) => (field.min || 1) + i).map((val) => (
              <button
                key={val}
                className={`template-inline-form__rating-item ${formData[field.id] === val ? 'template-inline-form__rating-item--selected' : ''}`}
                onClick={() => handleFieldChange(field.id, val)}
              >
                {val}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="template-inline-form__overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}>
      <div className="template-inline-form">
        {/* Header */}
        <div className="template-inline-form__header">
          <div className="template-inline-form__header-left">
            <div className="template-inline-form__header-icon">
              <IconComponent size={20} color="#FFBD59" />
            </div>
            <div className="template-inline-form__header-info">
              <span className="template-inline-form__title">{template.title}</span>
              <span className="template-inline-form__subtitle">{template.subtitle}</span>
            </div>
          </div>
          <button className="template-inline-form__close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="template-inline-form__content">
          {template.fields.map((field) => (
            <div key={field.id} className="template-inline-form__field">
              <div className="template-inline-form__field-label">
                {field.label}
                {field.required && <span style={{ color: '#EF4444' }}> *</span>}
              </div>
              {field.hint && <div className="template-inline-form__field-hint">{field.hint}</div>}
              {renderField(field)}
              {errors[field.id] && <div className="template-inline-form__error">{errors[field.id]}</div>}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="template-inline-form__footer">
          <button className="template-inline-form__cancel-btn" onClick={onCancel}>Huy</button>
          <button className="template-inline-form__submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <div className="template-inline-form__spinner" /> : (
              <>
                <Check size={18} color="#0A0F1C" />
                Luu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateInlineForm;
