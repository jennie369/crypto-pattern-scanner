import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Clock, Gift, Users, Eye, ChevronUp, Send, Lock, Shield, CheckCircle,
  TrendingDown, Brain, Heart, Search, Zap, Target, DollarSign, AlertTriangle,
  BookOpen, Star, Sparkles, CreditCard, Phone, Mail, MapPin, ExternalLink,
  BarChart3, Layers, Activity, Timer, Bell, History, FileText, Gamepad2,
  Compass, Quote, Play, UserPlus, Mic, GraduationCap, Facebook, Youtube,
  Instagram, MessageCircle, ChevronRight, X, User, ArrowUp, TrendingUp,
  CircleX, ShoppingBag, Award, Briefcase, Globe, Info, Smile, LogIn, Menu,
  ShoppingCart, Plus, Minus, Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Landing.css';

// Supabase image URLs
const IMAGES = {
  hero: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767797226483_tq4kc1_gemral-landing-11.webp',
  painFinance: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767797396519_mkzpi0_gemral-landing-05.webp',
  painLife: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk41rftx-08q037/1767797402692_ietkp7_gemral-landing-12.webp',
  gemMaster: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/landing/gemral_20260123_011848_27.webp',
  tarot: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768132275766_haheqd_gemral-landing-06.webp',
  kinhDich: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768132608964_4cgufu_gemral_20260111_185544_02.webp',
  marketAnalysis: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk857d2c-qftm5a/1768046652309_yyocqq_sec04-02.jpg.webp',
  visionBoard: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768132606257_kqq69q_gemral_20260111_185544_03.webp',
  scanner: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/landing/gemral_20260201_021757_02.webp',
  // New images for additional sections
  frequencyMethod: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768146689220_mbfoqb_gemral-landing-08.webp',
  coursesMindset: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/landing/gemral_20260123_011848_39.webp',
  coursesTrading1: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/landing/gemral_20260123_011848_37.webp',
  coursesTrading2: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/landing/gemral-landing-13.webp',
  personas: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768147893451_0cuqpi_gemral-landing-01.webp',
  testimonials: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/landing/gemral_20260113_192423_02.webp',
  partnership: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/landing/gemral_20260113_184459_03.webp',
  // Testimonial avatars
  testimonial1: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768156652185_flnht6_gemral_20260112_003909_01.webp',
  testimonial2: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768156549499_fm3fa3_gemral_20260112_003909_03.webp',
  testimonial3: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768156653321_fxov0z_gemral_20260112_003909_04.webp',
  testimonial4: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/storage/v1/object/public/course-images/lesson-mk9i1b5i-70exnb/1768156656914_9s92k8_gemral_20260112_003909_02.webp',
};

// Vietnamese names for toast notifications
const vietnameseNames = [
  'Nguyễn Văn A.', 'Trần Thị B.', 'Lê Văn C.', 'Phạm Thị D.', 'Hoàng Văn T.',
  'Nguyễn Thị P.', 'Trần Văn G.', 'Lê Thị H.', 'Phạm Văn T.', 'Hoàng Thị K.',
  'Vũ Văn L.', 'Đặng Thị M.', 'Bùi Văn N.', 'Đỗ Thị O.', 'Hồ Văn P.',
  'Thanh V.', 'Minh B.', 'Hải X.', 'Long D.', 'Hùng T.',
  'An từ HN', 'Bình từ SG', 'Châu từ ĐN', 'Dũng từ HP', 'Linh từ HCM'
];

const notificationActions = [
  { text: 'vừa đăng ký khóa học Trading Mastery', badge: 'Mới' },
  { text: 'vừa đăng ký vào Danh sách chờ', badge: 'Hot' },
  { text: 'vừa nhận ưu đãi Early Bird 10%', badge: 'Ưu đãi' },
  { text: 'vừa mua combo Scanner + Course', badge: 'VIP' },
  { text: 'vừa đăng ký dùng thử AI Scanner', badge: 'Free' },
  { text: 'vừa tham gia cộng đồng GEMRAL', badge: 'Mới' },
];

const timeAgoTexts = ['Vừa xong', '1 phút trước', '2 phút trước', '3 phút trước', '5 phút trước'];

// Product catalog for Shopify checkout
const PRODUCT_CATALOG = {
  'course-starter': {
    id: 'course-starter', name: 'Khóa Học Trading - Starter',
    price: 299000, priceDisplay: '299.000đ', variantId: '46448154050737',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-trading-course-tier-starter',
  },
  'course-tier1': {
    id: 'course-tier1', name: 'Khóa Học Trading - Tier 1',
    price: 11000000, priceDisplay: '11.000.000đ', variantId: '46351707898033',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-tier1',
  },
  'course-tier2': {
    id: 'course-tier2', name: 'Khóa Học Trading - Tier 2',
    price: 21000000, priceDisplay: '21.000.000đ', variantId: '46351719235761',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-tier2',
  },
  'course-tier3': {
    id: 'course-tier3', name: 'Khóa Học Trading - Tier 3',
    price: 68000000, priceDisplay: '68.000.000đ', variantId: '46351723331761',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-tier3',
  },
  'chatbot-pro': {
    id: 'chatbot-pro', name: 'GEM MASTER Sư Phụ AI - PRO',
    price: 39000, priceDisplay: '39.000đ/tháng', variantId: '46351763701937',
    shopifyUrl: 'https://yinyangmasters.com/products/yinyang-chatbot-ai-pro',
  },
  'chatbot-premium': {
    id: 'chatbot-premium', name: 'GEM MASTER Sư Phụ AI - PREMIUM',
    price: 59000, priceDisplay: '59.000đ/tháng', variantId: '46351771893937',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-chatbot-premium',
  },
  'chatbot-vip': {
    id: 'chatbot-vip', name: 'GEM MASTER Sư Phụ AI - VIP',
    price: 99000, priceDisplay: '99.000đ/tháng', variantId: '46421822832817',
    shopifyUrl: 'https://yinyangmasters.com/products/yinyang-chatbot-ai-vip',
  },
  'scanner-pro': {
    id: 'scanner-pro', name: 'Scanner Dashboard - Pro',
    price: 997000, priceDisplay: '997.000đ/tháng', variantId: '46351752069297',
    shopifyUrl: 'https://yinyangmasters.com/products/gem-scanner-pro',
  },
  'scanner-premium': {
    id: 'scanner-premium', name: 'Scanner Dashboard - Premium',
    price: 1997000, priceDisplay: '1.997.000đ/tháng', variantId: '46351759507633',
    shopifyUrl: 'https://yinyangmasters.com/products/scanner-dashboard-premium',
  },
  'scanner-vip': {
    id: 'scanner-vip', name: 'Scanner Dashboard - VIP',
    price: 5997000, priceDisplay: '5.997.000đ/tháng', variantId: '46351760294065',
    shopifyUrl: 'https://yinyangmasters.com/products/scanner-dashboard-vip',
  },
  'mindset-7days': {
    id: 'mindset-7days', name: '7 Ngày Khai Mở Tần Số Gốc',
    price: 1990000, priceDisplay: '1.990.000đ', variantId: '46448176758961',
    shopifyUrl: 'https://yinyangmasters.com/products/khoa-hoc-7-ngay-khai-mo-tan-so-goc',
  },
  'mindset-love': {
    id: 'mindset-love', name: 'Kích Hoạt Tần Số Tình Yêu',
    price: 399000, priceDisplay: '399.000đ', variantId: '46448180166833',
    shopifyUrl: 'https://yinyangmasters.com/products/khoa-hoc-kich-hoat-tan-so-tinh-yeu',
  },
  'mindset-wealth': {
    id: 'mindset-wealth', name: 'Tái Tạo Tư Duy Triệu Phú',
    price: 499000, priceDisplay: '499.000đ', variantId: '46448192192689',
    shopifyUrl: 'https://yinyangmasters.com/products/khoa-hoc-tai-tao-tu-duy-trieu-phu',
  },
};

// Waitlist form config
const WAITLIST_CONFIG = {
  EDGE_FUNCTION_URL: 'https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1/waitlist-submit',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZmtiY256cW96emtvaHdiZ2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzc1MzYsImV4cCI6MjA3Nzc1MzUzNn0.1De0-m3GhFHUrKl-ViqX_r6bydVFoWDaW8DsxhhbjEc',
  PHONE_REGEX: /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/,
  MIN_FILL_TIME: 2000,
};

export default function Landing() {
  const { user } = useAuth();
  // === STATE ===
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [spotsRemaining, setSpotsRemaining] = useState(47);
  const [liveViewers, setLiveViewers] = useState(47);
  const [todaySignups, setTodaySignups] = useState(23);
  const [showToast, setShowToast] = useState(false);
  const [currentToast, setCurrentToast] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    interests: [],
    marketingConsent: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(null); // { queue_number, referral_code }
  const [errorModal, setErrorModal] = useState(null); // string message
  const [referralCode, setReferralCode] = useState('');
  const formLoadTime = useRef(Date.now());

  // === CART STATE ===
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gemral_cart')) || []; }
    catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState(null);

  // === PARTNERSHIP FORM STATE ===
  const [partnershipOpen, setPartnershipOpen] = useState(false);
  const [partnershipType, setPartnershipType] = useState(null); // 'ctv' | 'kol'
  const [partnershipStep, setPartnershipStep] = useState('form'); // 'form' | 'success'
  const [partnershipLoading, setPartnershipLoading] = useState(false);
  const [partnershipError, setPartnershipError] = useState('');
  const [partnershipSuccess, setPartnershipSuccess] = useState(null);
  const [partnerForm, setPartnerForm] = useState({
    fullName: '', email: '', phone: '', referralCode: '', reason: '',
    // KOL fields
    youtubeUrl: '', youtubeFollowers: '', facebookUrl: '', facebookFollowers: '',
    instagramUrl: '', instagramFollowers: '', tiktokUrl: '', tiktokFollowers: '',
    telegramUrl: '', telegramMembers: '', discordUrl: '', discordMembers: '',
  });

  const SUPABASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co';
  const SUPABASE_ANON_KEY = WAITLIST_CONFIG.SUPABASE_ANON_KEY;

  const openPartnershipForm = useCallback((type) => {
    setPartnershipType(type);
    setPartnershipStep('form');
    setPartnershipError('');
    setPartnershipSuccess(null);
    setPartnerForm({
      fullName: '', email: '', phone: '', referralCode: '', reason: '',
      youtubeUrl: '', youtubeFollowers: '', facebookUrl: '', facebookFollowers: '',
      instagramUrl: '', instagramFollowers: '', tiktokUrl: '', tiktokFollowers: '',
      telegramUrl: '', telegramMembers: '', discordUrl: '', discordMembers: '',
    });
    setPartnershipOpen(true);
  }, []);

  const closePartnershipForm = useCallback(() => {
    setPartnershipOpen(false);
    setPartnershipType(null);
  }, []);

  const handlePartnerInput = useCallback((field, value) => {
    setPartnerForm(prev => ({ ...prev, [field]: value }));
    setPartnershipError('');
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePartnerPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 9 && cleaned.length <= 11;
  };
  const formatPartnerPhone = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('84')) cleaned = '0' + cleaned.substring(2);
    if (cleaned.startsWith('+84')) cleaned = '0' + cleaned.substring(3);
    return cleaned;
  };

  const submitPartnership = useCallback(async () => {
    const { fullName, email, phone, referralCode: refCode, reason } = partnerForm;
    const cleanPhone = formatPartnerPhone(phone);

    // Validate
    if (!fullName || fullName.trim().length < 2) {
      setPartnershipError('Vui lòng nhập họ và tên');
      return;
    }
    if (!validateEmail(email)) {
      setPartnershipError('Email không hợp lệ');
      return;
    }
    if (!validatePartnerPhone(cleanPhone)) {
      setPartnershipError('Số điện thoại không hợp lệ');
      return;
    }

    // KOL: validate social media
    if (partnershipType === 'kol') {
      const socialPlatforms = {
        youtube: parseInt(partnerForm.youtubeFollowers) || 0,
        facebook: parseInt(partnerForm.facebookFollowers) || 0,
        instagram: parseInt(partnerForm.instagramFollowers) || 0,
        tiktok: parseInt(partnerForm.tiktokFollowers) || 0,
        telegram: parseInt(partnerForm.telegramMembers) || 0,
        discord: parseInt(partnerForm.discordMembers) || 0,
      };
      const totalFollowers = Object.values(socialPlatforms).reduce((a, b) => a + b, 0);
      const socialUrls = [
        partnerForm.youtubeUrl, partnerForm.facebookUrl, partnerForm.instagramUrl,
        partnerForm.tiktokUrl, partnerForm.telegramUrl, partnerForm.discordUrl,
      ].filter(Boolean);

      if (totalFollowers < 20000) {
        setPartnershipError(`Tổng followers cần ≥ 20,000. Hiện tại: ${totalFollowers.toLocaleString()}`);
        return;
      }
      if (socialUrls.length === 0) {
        setPartnershipError('Vui lòng nhập ít nhất 1 link social media');
        return;
      }
    }

    setPartnershipLoading(true);
    setPartnershipError('');

    try {
      // Check existing application
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/partnership_applications?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&application_type=eq.${partnershipType}&status=eq.pending&select=id`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const existing = await checkRes.json();
      if (existing && existing.length > 0) {
        throw new Error(`Email này đã có đơn đăng ký ${partnershipType === 'ctv' ? 'CTV' : 'KOL'} đang chờ duyệt`);
      }

      // Build submission data
      const submissionData = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        application_type: partnershipType,
        referred_by_code: refCode.trim().toUpperCase() || null,
        status: 'pending',
        source: 'landing_page',
      };

      if (partnershipType === 'ctv') {
        const autoApproveAt = new Date();
        autoApproveAt.setDate(autoApproveAt.getDate() + 3);
        submissionData.auto_approve_at = autoApproveAt.toISOString();
        submissionData.reason_for_joining = reason.trim() || null;
      } else {
        // KOL
        const socialPlatforms = {
          youtube: parseInt(partnerForm.youtubeFollowers) || 0,
          facebook: parseInt(partnerForm.facebookFollowers) || 0,
          instagram: parseInt(partnerForm.instagramFollowers) || 0,
          tiktok: parseInt(partnerForm.tiktokFollowers) || 0,
          telegram: parseInt(partnerForm.telegramMembers) || 0,
          discord: parseInt(partnerForm.discordMembers) || 0,
        };
        submissionData.social_platforms = socialPlatforms;
        submissionData.total_followers = Object.values(socialPlatforms).reduce((a, b) => a + b, 0);
        submissionData.social_proof_urls = [
          partnerForm.youtubeUrl, partnerForm.facebookUrl, partnerForm.instagramUrl,
          partnerForm.tiktokUrl, partnerForm.telegramUrl, partnerForm.discordUrl,
        ].filter(Boolean);
      }

      // Submit
      const response = await fetch(`${SUPABASE_URL}/rest/v1/partnership_applications`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.details || 'Đăng ký thất bại');
      }

      const result = await response.json();
      const app = Array.isArray(result) ? result[0] : result;

      // Send admin notification
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/admin_notifications`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: partnershipType === 'ctv' ? 'new_ctv_application' : 'new_kol_application',
            title: partnershipType === 'ctv'
              ? `Đơn đăng ký CTV mới: ${fullName.trim()}`
              : `Đơn đăng ký KOL mới: ${fullName.trim()} (${submissionData.total_followers?.toLocaleString() || 0} followers)`,
            message: `Email: ${email.trim().toLowerCase()}, Phone: ${cleanPhone}`,
            data: { application_id: app.id, application_type: partnershipType },
            is_read: false,
          }),
        });
      } catch (notifyErr) {
        console.warn('[Partnership] Admin notification failed:', notifyErr);
      }

      // Show success
      const code = app.id ? `${partnershipType === 'ctv' ? 'CTV' : 'KOL'}-${app.id.substring(0, 8).toUpperCase()}` : null;
      setPartnershipSuccess({ code, type: partnershipType, email: email.trim().toLowerCase() });
      setPartnershipStep('success');

    } catch (error) {
      console.error('[Partnership] Submit error:', error);
      setPartnershipError(error.message);
    } finally {
      setPartnershipLoading(false);
    }
  }, [partnerForm, partnershipType]);

  // Lock body scroll when partnership form is open
  useEffect(() => {
    if (partnershipOpen) document.body.style.overflow = 'hidden';
    else if (!cartOpen) document.body.style.overflow = '';
  }, [partnershipOpen, cartOpen]);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('gemral_cart', JSON.stringify(cart));
  }, [cart]);

  // Auto-hide cart toast
  useEffect(() => {
    if (!cartToast) return;
    const timer = setTimeout(() => setCartToast(null), 3000);
    return () => clearTimeout(timer);
  }, [cartToast]);

  // Lock body scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  const addToCart = (productId) => {
    const product = PRODUCT_CATALOG[productId];
    if (!product) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: productId, qty: 1 }];
    });
    setCartToast({ type: 'success', message: `${product.name} đã thêm vào giỏ hàng!` });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, qty } : item));
  };

  const getCartTotal = () => cart.reduce((sum, item) => {
    const product = PRODUCT_CATALOG[item.id];
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  const getCartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);

  const formatPrice = (price) => price.toLocaleString('vi-VN') + 'đ';

  const checkout = () => {
    if (cart.length === 0) return;
    const items = cart.map(item => {
      const product = PRODUCT_CATALOG[item.id];
      return product ? `${product.variantId}:${item.qty}` : null;
    }).filter(Boolean).join(',');
    let url = `https://yinyangmasters.com/cart/${items}`;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || localStorage.getItem('gemral_referral');
    if (ref) url += `?ref=${encodeURIComponent(ref)}`;
    window.location.href = url;
  };

  const clearCart = () => {
    setCart([]);
    setCartToast({ type: 'info', message: 'Đã xóa toàn bộ giỏ hàng' });
  };

  // Cross-tab cart sync
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'gemral_cart') {
        try { setCart(JSON.parse(e.newValue) || []); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // === REFERRAL CODE CAPTURE ===
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referral') || params.get('r') || params.get('code') || '';
    if (ref) {
      const code = ref.toUpperCase();
      setReferralCode(code);
      try {
        sessionStorage.setItem('gemral_referral', code);
        localStorage.setItem('gemral_referral', code);
      } catch {}
    } else {
      try {
        const stored = sessionStorage.getItem('gemral_referral') || localStorage.getItem('gemral_referral') || '';
        if (stored) setReferralCode(stored);
      } catch {}
    }
  }, []);

  // === SCROLL ANIMATIONS (IntersectionObserver) ===
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

    document.querySelectorAll('.section-hero, .section-pain, .section-pricing, .section-courses-mindset, .section-courses-trading, .section-personas, .section-testimonials, .section-partnership, .section-waitlist').forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // === 3D CARD HOVER EFFECTS (CSS-only, no JS transform conflicts) ===
  // Removed JS mousemove transform — it conflicts with scroll animation transforms.
  // Hover effects are now handled purely via CSS :hover (see Landing.css).

  // === COUNTER ANIMATION ===
  useEffect(() => {
    const counters = document.querySelectorAll('.stat-number[data-animate]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          const el = entry.target;
          const target = parseInt(el.textContent.replace(/[^\d]/g, '')) || 0;
          const suffix = el.textContent.replace(/[\d,.]+/g, '');
          const duration = 2000;
          const startTime = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(target * eased).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  // === COUNTDOWN TIMER - Fixed end date: Feb 17, 2026 ===
  useEffect(() => {
    const endTime = new Date(Date.UTC(2026, 1, 16, 17, 0, 0)).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // === FOMO: LIVE VIEWERS ===
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers(prev => {
        const change = Math.floor(Math.random() * 11) - 5;
        return Math.max(30, Math.min(80, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // === FOMO: SPOTS REMAINING ===
  useEffect(() => {
    const scheduleDecrease = () => {
      const delay = Math.floor(Math.random() * 60000) + 30000;
      return setTimeout(() => {
        setSpotsRemaining(prev => Math.max(12, prev - 1));
        scheduleDecrease();
      }, delay);
    };
    const timeout = scheduleDecrease();
    return () => clearTimeout(timeout);
  }, []);

  // === FOMO: TODAY SIGNUPS ===
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.4) {
        setTodaySignups(prev => prev + 1);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // === LIVE TOAST NOTIFICATIONS ===
  useEffect(() => {
    const showRandomToast = () => {
      const name = vietnameseNames[Math.floor(Math.random() * vietnameseNames.length)];
      const action = notificationActions[Math.floor(Math.random() * notificationActions.length)];
      const time = timeAgoTexts[Math.floor(Math.random() * timeAgoTexts.length)];

      setCurrentToast({ name, action: action.text, badge: action.badge, time });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    const scheduleNotification = () => {
      const delay = Math.floor(Math.random() * 30000) + 15000;
      return setTimeout(() => {
        showRandomToast();
        scheduleNotification();
      }, delay);
    };

    const firstTimeout = setTimeout(showRandomToast, 3000);
    const recurringTimeout = scheduleNotification();

    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(recurringTimeout);
    };
  }, []);

  // === BACK TO TOP ===
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  // === FORM HANDLERS ===
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone') {
      // Phone formatting: digits only, max 11
      const digits = value.replace(/\D/g, '').slice(0, 11);
      setFormData(prev => ({ ...prev, phone: digits }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const normalizePhone = (phone) => {
    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('84')) normalized = '0' + normalized.slice(2);
    return normalized;
  };

  const getUrlParam = (param) => new URLSearchParams(window.location.search).get(param) || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Anti-spam: ensure minimum fill time
    const fillTime = Date.now() - formLoadTime.current;
    if (fillTime < WAITLIST_CONFIG.MIN_FILL_TIME) {
      await new Promise(r => setTimeout(r, WAITLIST_CONFIG.MIN_FILL_TIME - fillTime));
    }

    // Honeypot check
    const honeypot = e.target.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      setIsSubmitting(false);
      setSuccessModal({ queue_number: 999, referral_code: 'GEMXXXXX' });
      return;
    }

    const name = formData.fullName.trim();
    const phone = normalizePhone(formData.phone);
    const email = formData.email.trim().toLowerCase();

    // Validation
    if (!name || name.length < 2) {
      setIsSubmitting(false);
      setErrorModal('Vui lòng nhập họ tên (ít nhất 2 ký tự)');
      return;
    }
    if (!phone || !WAITLIST_CONFIG.PHONE_REGEX.test(phone)) {
      setIsSubmitting(false);
      setErrorModal('Số điện thoại không hợp lệ (VD: 0912345678)');
      return;
    }

    const requestData = {
      full_name: name,
      phone,
      email: email || null,
      interested_products: formData.interests,
      marketing_consent: formData.marketingConsent,
      referral_code: referralCode || null,
      utm_source: getUrlParam('utm_source') || null,
      utm_medium: getUrlParam('utm_medium') || null,
      utm_campaign: getUrlParam('utm_campaign') || null,
      utm_content: getUrlParam('utm_content') || null,
      referrer_url: document.referrer || null,
    };

    try {
      const response = await fetch(WAITLIST_CONFIG.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + WAITLIST_CONFIG.SUPABASE_ANON_KEY,
          'apikey': WAITLIST_CONFIG.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || result.message || 'Đã có lỗi xảy ra');

      if (result.success) {
        setSuccessModal(result.data || {});
        setFormData({ fullName: '', phone: '', email: '', interests: [], marketingConsent: true });
        setTodaySignups(prev => prev + 1);
        setSpotsRemaining(prev => Math.max(1, prev - 1));

        // Analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'waitlist_signup', {
            queue_number: result.data?.queue_number,
            interests: formData.interests.join(','),
          });
        }
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Lead', { content_name: 'Waitlist Signup' });
        }
      } else {
        throw new Error(result.message || 'Đăng ký không thành công');
      }
    } catch (error) {
      let msg = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      if (error.message.includes('rate limit') || error.message.includes('quá nhiều'))
        msg = 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
      else if (error.message.includes('phone') || error.message.includes('điện thoại'))
        msg = 'Số điện thoại không hợp lệ hoặc đã được đăng ký.';
      else if (error.name === 'TypeError' || error.message.includes('fetch'))
        msg = 'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.';
      else if (error.message) msg = error.message;
      setErrorModal(msg);
    } finally {
      setIsSubmitting(false);
      formLoadTime.current = Date.now();
    }
  };

  // === SHARE FUNCTIONS ===
  const getShareLink = () => {
    const code = successModal?.referral_code || referralCode;
    return code ? `https://gemral.com/?ref=${code}` : 'https://gemral.com/';
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      return true;
    } catch { return false; }
  };

  const copyReferralCode = async () => {
    const code = successModal?.referral_code || '';
    if (!code) return;
    const ok = await copyToClipboard(code);
    setCartToast({ type: 'success', message: ok ? `Đã copy mã: ${code}` : 'Không thể copy' });
  };

  const copyShareLink = async () => {
    const link = getShareLink();
    const ok = await copyToClipboard(link);
    setCartToast({ type: 'success', message: ok ? 'Đã copy link giới thiệu!' : 'Không thể copy' });
  };

  const shareToZalo = () => {
    const link = getShareLink();
    window.open(`https://zalo.me/share?url=${encodeURIComponent(link)}&title=${encodeURIComponent('Đăng ký GEMRAL ngay để nhận ưu đãi Early Bird!')}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareLink())}`, '_blank');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'GEMRAL - Ưu đãi Early Bird', text: 'Đăng ký GEMRAL ngay để nhận ưu đãi đặc biệt!', url: getShareLink() });
      } catch { copyShareLink(); }
    } else {
      copyShareLink();
    }
  };

  // === RENDER ===
  return (
    <div className="landing-page">
      {/* ========== STICKY TOP BAR ========== */}
      <div className="sticky-top-bar">
        <span className="urgency-text">Ưu đãi Founder kết thúc:</span>
        <div className="countdown-mini">
          <div className="countdown-box">
            <span className="number">{String(countdown.days).padStart(2, '0')}</span>
            <span className="label">Ngày</span>
          </div>
          <div className="countdown-box">
            <span className="number">{String(countdown.hours).padStart(2, '0')}</span>
            <span className="label">Giờ</span>
          </div>
          <div className="countdown-box">
            <span className="number">{String(countdown.minutes).padStart(2, '0')}</span>
            <span className="label">Phút</span>
          </div>
          <div className="countdown-box">
            <span className="number">{String(countdown.seconds).padStart(2, '0')}</span>
            <span className="label">Giây</span>
          </div>
        </div>
        <button className="btn-cta-small" onClick={scrollToWaitlist}>Đăng ký</button>
      </div>

      {/* ========== TET ANNOUNCEMENT BAR ========== */}
      <div className="fomo-tet-announcement">
        <div className="fomo-tet-content">
          <Gift size={16} className="fomo-tet-icon" />
          <span className="fomo-tet-text">Đăng ký trước Tết Nguyên Đán giảm 99k với mã:</span>
          <span className="fomo-tet-code">TET99K</span>
          <span className="fomo-tet-text">→ Giảm ngay</span>
          <span className="fomo-tet-discount">99.000đ</span>
          <Sparkles size={16} className="fomo-tet-icon" />
        </div>
      </div>

      {/* ========== MAIN NAVIGATION BAR (Hidden) ========== */}

      {/* ========== FOMO WIDGET STICKY ========== */}
      <div className="fomo-widget">
        <div className="fomo-icon">
          <Users size={40} strokeWidth={1.5} />
        </div>
        <p className="fomo-label">Còn lại</p>
        <p className="fomo-count"><span className="highlight">{spotsRemaining}</span> / 100</p>
        <div className="fomo-progress">
          <div className="fomo-progress-bar" style={{ width: `${(spotsRemaining / 100) * 100}%` }} />
        </div>
        <p className="fomo-warning">
          {spotsRemaining <= 15 ? <><Flame size={12} /> Gần hết chỗ!</> :
           spotsRemaining <= 30 ? <><Zap size={12} /> Đang giảm nhanh!</> :
           <><Sparkles size={12} /> Ưu đãi có hạn</>}
        </p>
        <button className="btn-fomo" onClick={scrollToWaitlist}>Giữ chỗ</button>
      </div>

      {/* ========== LIVE NOTIFICATION TOAST ========== */}
      {showToast && currentToast && (
        <div className="live-notification show">
          <button className="live-notification-close" onClick={() => setShowToast(false)}>
            <X size={12} />
          </button>
          <div className="live-notification-avatar">
            <User size={18} />
          </div>
          <div className="live-notification-content">
            <p className="live-notification-text">
              <strong>{currentToast.name}</strong> {currentToast.action}
            </p>
            <span className="live-notification-time">{currentToast.time}</span>
          </div>
          <span className="live-notification-badge">{currentToast.badge}</span>
        </div>
      )}

      {/* ========== SECTION 1: HERO ========== */}
      <section className="section-hero">
        <div className="container">
          <div className="hero-content">
            <span className="badge badge-burgundy pulse-glow">
              <MapPin size={14} /> Lần đầu tiên tại Việt Nam
            </span>

            <h1 className="hero-headline">
              TỰ DO TÀI CHÍNH<br />
              BẮT ĐẦU TỪ<br />
              <span className="gradient-text">TẦN SỐ ĐÚNG</span>
            </h1>

            <p className="hero-subheadline">
              <strong>Nền tảng khóa học trading & phát triển bản thân đầu tiên tại Việt Nam.</strong><br /><br />
              Tính năng nổi bật: <span className="text-cyan">AI Scanner</span> phát hiện pattern,
              <span className="text-gold"> GEM Master</span> chatbot thông minh,
              <span className="text-pink"> Tarot & Kinh Dịch</span>, Vision Board, và Khóa học trực tuyến.
            </p>

            <div className="live-viewers">
              <span className="live-dot" />
              <span><strong>{liveViewers}</strong> người đang xem trang này</span>
            </div>

            <div className="hook-box">
              <p className="hook-question">
                "Bạn đã bao giờ tự hỏi... tại sao một số người dường như luôn may mắn trong cả tình yêu lẫn tiền bạc, trong khi bạn cứ mãi chật vật dù đã cố gắng rất nhiều?"
              </p>
              <p className="hook-answer">
                Sự thật là... <strong>thành công không đến từ may mắn</strong>.
                Nó đến từ việc bạn có <span className="text-gold">ĐÚNG CÔNG CỤ</span> để đưa ra quyết định chính xác,
                và <span className="text-cyan">ĐÚNG TẦN SỐ</span> để thu hút những điều tốt đẹp vào cuộc sống.
                Và đó chính xác là lý do <strong>GEMRAL</strong> ra đời — để trao cho bạn cả hai thứ đó
                trong một nền tảng duy nhất.
              </p>
              <img src={IMAGES.hero} alt="GEMRAL Hero" className="hook-image" />
            </div>

            <div className="hero-stats-row">
              <div className="stat-item">
                <span className="stat-number text-gold">10,000+</span>
                <span className="stat-label">Người quan tâm</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number text-cyan">68-85%</span>
                <span className="stat-label">Win Rate Backtest</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number text-pink">5+ năm</span>
                <span className="stat-label">Data đã kiểm chứng</span>
              </div>
            </div>

            <div className="urgency-badge">
              <Flame size={16} /> <span>{todaySignups}</span> người đã đăng ký hôm nay
            </div>

            <div className="hero-cta-group">
              <button className="btn-primary pulse-glow" onClick={scrollToWaitlist}>
                <Send size={18} /> Đăng ký nhận ưu đãi Founder
              </button>
            </div>

            <div className="section-footer">gemral.com</div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: PAIN POINTS ========== */}
      <section className="section-pain">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              BẠN CÓ THẤY MÌNH<br />
              <span className="text-gold">TRONG NHỮNG DÒNG NÀY?</span>
            </h2>
            <p className="section-intro">
              "Bạn thu hút những gì bạn rung động, không phải những gì bạn muốn."
            </p>
          </div>

          <div className="pain-grid">
            {/* Column 1: Trading/Finance Pain */}
            <div className="pain-column">
              <h3 className="pain-category-title">
                <DollarSign size={24} />
                Trong tài chính & đầu tư
              </h3>

              <div className="pain-card">
                <div className="pain-icon"><AlertTriangle size={36} /></div>
                <h4>Tần số sợ hãi chi phối quyết định</h4>
                <p>
                  Bạn thấy Bitcoin tăng 20% trong một đêm, vội vàng mua vào ở đỉnh vì sợ bỏ lỡ.
                  Đó không phải quyết định từ lý trí — đó là Hình Tư Tưởng sợ hãi đang điều khiển bạn,
                  khiến bạn hành động từ tần số thấp và thu hút kết quả tương ứng.
                </p>
                <div className="quote-box">
                  <p>"Trong thế nào, ngoài thế ấy" — Khi tâm bạn hoảng loạn, quyết định sẽ hoảng loạn.</p>
                </div>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><TrendingDown size={36} /></div>
                <h4>Vòng lặp "mua đỉnh bán đáy"</h4>
                <p>
                  Dù đã nghiên cứu kỹ lưỡng, bạn vẫn cứ mua là giảm, bán là tăng.
                  Đây không phải xui xẻo — đây là Hình Tư Tưởng "tôi không đủ giỏi" đang hoạt động như nam châm,
                  thu hút về những tình huống xác nhận niềm tin đó. Vòng lặp được củng cố mỗi ngày.
                </p>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><Clock size={36} /></div>
                <h4>Quá tải thông tin — Không có hệ thống</h4>
                <p>
                  Người này nói Long, người kia nói Short. Bạn bị nhấn chìm trong biển thông tin mâu thuẫn,
                  không biết đâu là sự thật. Vấn đề không phải thiếu kiến thức — vấn đề là bạn chưa có
                  HỆ THỐNG rõ ràng để đưa ra quyết định từ tần số ổn định, không bị chi phối bởi nhiễu loạn bên ngoài.
                </p>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><DollarSign size={36} /></div>
                <h4>Tần số thiếu thốn tạo thiếu thốn</h4>
                <p>
                  Mỗi lần lo lắng về tiền, bạn đang phát ra tần số thiếu thốn (150-200 Hz)
                  và tạo thêm một Hình Tư Tưởng thu hút thiếu thốn. Kết quả? Deal thất bại,
                  chi phí bất ngờ, khách hàng trả chậm. Vòng lặp cứ tiếp diễn vì "Trong thế nào, ngoài thế ấy".
                </p>
                <img src={IMAGES.painFinance} alt="Pain Finance" className="pain-image" />
              </div>
            </div>

            {/* Column 2: Life/Personal Pain */}
            <div className="pain-column">
              <h3 className="pain-category-title">
                <Heart size={24} />
                Trong cuộc sống & tinh thần
              </h3>

              <div className="pain-card">
                <div className="pain-icon"><Heart size={36} /></div>
                <h4>Thành công bên ngoài, trống rỗng bên trong</h4>
                <p>
                  Bạn có công việc ổn định, thu nhập khá, mọi thứ bên ngoài đều ổn...
                  nhưng sâu trong lòng có một khoảng trống. Đó là dấu hiệu: bạn đang sống ở tầng tâm thức
                  chỉ tập trung vào vật chất, chưa kết nối với tần số cao hơn của bản thể.
                </p>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><Search size={36} /></div>
                <h4>Mất phương hướng — Không biết mình muốn gì</h4>
                <p>
                  Bạn thức dậy mỗi sáng mà không có động lực, làm việc như một cỗ máy.
                  Đây là trạng thái "ngủ mê" — sống theo quán tính, không có ý thức.
                  Bạn chưa tìm được "Tần Số Bản Nguyên" của mình — tần số độc đáo mà chỉ bạn mới có.
                </p>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><Zap size={36} /></div>
                <h4>Cảm giác chưa đạt được tiềm năng thật sự</h4>
                <p>
                  Sâu trong thâm tâm, bạn biết mình có thể làm được nhiều hơn.
                  Nhưng có thứ gì đó kìm hãm — đó là những Hình Tư Tưởng giới hạn từ quá khứ:
                  "Tôi không xứng đáng", "Tôi không đủ giỏi". Chúng là nghiệp tần số tích lũy,
                  và chúng có thể được chuyển hóa.
                </p>
                <div className="quote-box">
                  <p>"Kiến thức không thay đổi cuộc đời. Hành động mới thay đổi."</p>
                </div>
              </div>

              <div className="pain-card">
                <div className="pain-icon"><Compass size={36} /></div>
                <h4>Thiếu hệ thống hướng dẫn đáng tin cậy</h4>
                <p>
                  Bạn muốn hiểu bản thân sâu hơn, muốn có công cụ để đưa ra quyết định tốt hơn.
                  Nhưng ngoài kia đầy những thông tin rời rạc, thiếu hệ thống.
                  Bạn cần một lộ trình rõ ràng — không phải để ai đó nói cho bạn "tương lai",
                  mà để bạn tự HIỂU mình và CHỌN tương lai của chính mình.
                </p>
                <img src={IMAGES.painLife} alt="Pain Life" className="pain-image" />
              </div>
            </div>
          </div>

          <div className="transition-box">
            <p className="transition-text">
              Nếu bạn gật đầu với bất kỳ điều nào ở trên...
            </p>
            <p className="transition-highlight text-gold">
              GEMRAL là hành trình chuyển hóa dành cho bạn.
            </p>
            <p className="transition-subtext">
              Không phải để "sửa" bạn — vì bạn không hỏng. Mà để giúp bạn nhận diện tần số,
              phá vỡ Hình Tư Tưởng cũ, và tạo Hình Tư Tưởng mới phù hợp với cuộc đời bạn muốn sống.
            </p>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 3: GEM MASTER ========== */}
      <section className="section-master">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Sparkles size={14} /> Công cụ Giải Mã Tần Số
            </span>
            <h2 className="section-title">
              <span className="text-gold">GEM MASTER</span>
            </h2>
            <p className="section-subtitle">Người bạn đồng hành trên hành trình Chuyển Hóa Nội Tâm</p>
            <p className="section-intro">
              GEM Master không nói cho bạn "tương lai" — vì tương lai là thứ bạn KIẾN TẠO.
              Đây là công cụ giúp bạn giải mã tần số hiện tại, nhận diện Hình Tư Tưởng đang chi phối,
              và có ý thức tạo ra Hình Tư Tưởng mới phù hợp với cuộc đời bạn muốn sống.
            </p>
          </div>

          <img src={IMAGES.gemMaster} alt="GEM Master" className="section-hero-image" />

          <div className="features-grid">
            <div className="feature-card">
              <div className="card-icon">
                <Layers size={36} />
              </div>
              <img src={IMAGES.tarot} alt="Tarot" className="feature-image" />
              <h3>Rút Tarot 3 Lá</h3>
              <p>
                Công cụ giải mã tần số giúp bạn nhìn thấy những pattern năng lượng đang diễn ra
                trong cuộc sống — không phải để "đoán" tương lai, mà để HIỂU hiện tại và đưa ra lựa chọn có ý thức.
              </p>
              <ul className="feature-list">
                <li>Nhận diện tần số đang phát ra</li>
                <li>Phân tích Quá khứ - Hiện tại - Tương lai</li>
                <li>Hướng dẫn hành động từ tần số cao</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <Activity size={36} />
              </div>
              <img src={IMAGES.kinhDich} alt="Kinh Dịch" className="feature-image" />
              <h3>Gieo Quẻ Kinh Dịch</h3>
              <p>
                Tiếp cận trí tuệ cổ nhân hàng nghìn năm để hiểu quy luật vận hành của năng lượng,
                vị trí của bạn trong dòng chảy đó, và hành động phù hợp với tần số hiện tại.
              </p>
              <ul className="feature-list">
                <li>64 quẻ dịch với giải thích sâu</li>
                <li>Hiểu quy luật Âm - Dương - Ngũ Hành</li>
                <li>Lời khuyên theo triết lý phương Đông</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <BarChart3 size={36} />
              </div>
              <img src={IMAGES.marketAnalysis} alt="Market Analysis" className="feature-image" />
              <h3>Phân Tích Thị Trường Mới Nhất</h3>
              <p>
                Phân tích nhanh các tin tức thị trường mới nhất, giúp bạn nắm bắt xu hướng và ra quyết định kịp thời.
              </p>
              <ul className="feature-list">
                <li>Biến thông tin thành lợi thế giao dịch</li>
                <li>Lọc nhiễu thông tin để chỉ giữ lại tín hiệu có giá trị</li>
                <li>Súc tích và đúng trọng tâm</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="card-icon">
                <Target size={36} />
              </div>
              <img src={IMAGES.visionBoard} alt="Vision Board" className="feature-image" />
              <h3>Vision Board</h3>
              <p>
                Công cụ tạo Hình Tư Tưởng có ý thức. Bạn không chỉ "ước mơ" — bạn đang chủ động
                kiến tạo trường năng lượng cho những gì bạn muốn thu hút vào cuộc sống.
              </p>
              <ul className="feature-list">
                <li>Tạo Hình Tư Tưởng mới có ý thức</li>
                <li>Chia nhỏ mục tiêu thành bước cụ thể</li>
                <li>Theo dõi tiến độ chuyển hóa</li>
              </ul>
            </div>
          </div>

          <div className="free-banner">
            <span className="badge badge-green">
              <Gift size={14} /> Trải Nghiệm Miễn Phí
            </span>
            <h3 className="text-gold">Bắt đầu hành trình chuyển hóa ngay hôm nay</h3>
            <p>
              GEM Master không thay thế sự thực hành của bạn — nó là CÔNG CỤ hỗ trợ trên hành trình.
              Đăng ký waitlist để nhận <span className="text-cyan">5 lượt trải nghiệm miễn phí mỗi ngày</span>
              khi app ra mắt. Trải nghiệm trước, quyết định sau.
            </p>
            <p className="banner-quote">
              "Thế giới không thiếu kiến thức. Thế giới thiếu người SỐNG kiến thức." — Học Thuyết Chuyển Hóa Nội Tâm
            </p>
            <button className="btn-primary" onClick={scrollToWaitlist}>
              <Send size={18} /> Đăng ký trải nghiệm GEM Master
            </button>

            <div className="testimonial-mini">
              <blockquote>
                "GEM Master giúp tôi nhận ra những Hình Tư Tưởng đang chi phối mình.
                Từ đó tôi có ý thức hơn trong mỗi quyết định, không còn hành động từ sợ hãi nữa."
              </blockquote>
              <cite>— Thu Hương, Chủ shop online TPHCM</cite>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 4: GEM SCANNER ========== */}
      <section className="section-scanner">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-green">
              <BarChart3 size={14} /> Công Cụ Phân Tích Tần Số Thị Trường
            </span>
            <div className="exclusive-tag">
              <MapPin size={12} /> ĐỘC QUYỀN TẠI VIỆT NAM
            </div>
            <h2 className="section-title">
              <span className="text-gold">GEM SCANNER</span>
            </h2>
            <p className="section-subtitle">
              Scanner tự động phát hiện <strong>6 công thức tần số độc quyền của Gem Trading</strong> —
              duy nhất tại Việt Nam. Giúp bạn đưa ra quyết định từ dữ liệu thay vì cảm xúc.
              Không còn hoảng loạn, không còn đoán mò — chỉ có hệ thống và kỷ luật.
            </p>
          </div>

          <div className="scanner-preview">
            <div className="preview-header">
              <div className="preview-title">
                <BarChart3 size={24} />
                GEM Pattern Scanner Interface
              </div>
              <div className="confidence-badge">Confidence: 89.7%</div>
            </div>
            <img src={IMAGES.scanner} alt="GEM Scanner" className="scanner-image" />
          </div>

          <div className="scanner-features-grid">
            <div className="scanner-feature-card">
              <div className="card-icon">
                <Search size={36} />
              </div>
              <h3>Quét Tự Động 24/7</h3>
              <p>
                Scanner hoạt động không ngừng nghỉ, phân tích hàng trăm cặp coin mỗi giờ
                để tìm ra những setup có xác suất cao nhất.
                Bạn không cần ngồi trước màn hình cả ngày — hệ thống làm việc đó cho bạn.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <Target size={36} />
              </div>
              <h3>6 Pattern Độc Quyền</h3>
              <p>
                Phát hiện tự động <strong>6 công thức Frequency độc quyền của Gem Trading</strong>,
                duy nhất tại Việt Nam. Đã được backtest qua 5 năm dữ liệu với win rate từ 68% đến 85% khi áp dụng đúng điều kiện.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <BarChart3 size={36} />
              </div>
              <h3>Entry / Stop / Target</h3>
              <p>
                Không còn phải đoán mò. Mỗi signal đều đi kèm điểm Entry chính xác,
                Stop Loss để bảo vệ vốn, và Take Profit targets theo từng mức.
                Bạn chỉ cần thực thi theo hệ thống.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <Gamepad2 size={36} />
              </div>
              <h3>Paper Trading</h3>
              <p>
                Thực hành giao dịch với tiền ảo trước khi dùng tiền thật.
                Luyện tập không giới hạn, hoàn toàn miễn phí, không rủi ro — cho đến khi bạn tự tin 100% với phương pháp GEM Frequency.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <Bell size={36} />
              </div>
              <h3>Thông Báo Real-time</h3>
              <p>
                Nhận alert ngay lập tức khi có pattern mới xuất hiện qua Telegram hoặc app.
                Bạn có thể đang làm việc khác mà vẫn không bỏ lỡ cơ hội — hệ thống sẽ báo cho bạn khi cần hành động.
              </p>
            </div>

            <div className="scanner-feature-card">
              <div className="card-icon">
                <History size={36} />
              </div>
              <h3>Backtest 5+ Năm Data</h3>
              <p>
                Tất cả công thức đều được kiểm chứng qua hơn 5 năm dữ liệu lịch sử
                với hàng nghìn giao dịch. Đây không phải lý thuyết — đây là kết quả thực tế đã được chứng minh qua thời gian.
              </p>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number text-cyan">68-85%</span>
              <span className="stat-label">Win Rate Backtest</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-gold">6</span>
              <span className="stat-label">Pattern Độc Quyền</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-pink">500+</span>
              <span className="stat-label">Cặp Coin Theo Dõi</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-cyan">24/7</span>
              <span className="stat-label">Hoạt Động Liên Tục</span>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 5: FREQUENCY METHOD ========== */}
      <section className="section-patterns">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">
              <Target size={14} /> GEM Frequency Method
            </span>
            <div className="exclusive-tag">ĐỘC QUYỀN TẠI VIỆT NAM</div>
            <h2 className="section-title">
              6 CÔNG THỨC TẦN SỐ<br />
              <span className="text-gold">TÍN HIỆU VÀO LỆNH CHUẨN XÁC NHẤT</span>
            </h2>
            <p className="section-subtitle">
              6 mẫu nến đặc biệt được phát triển độc quyền bởi Gem Trading —
              đây là những dấu hiệu mua/bán rõ ràng nhất mà bạn có thể học và áp dụng ngay.
              Không cần kinh nghiệm, không cần đoán mò — chỉ cần nhận diện đúng pattern là vào lệnh.
            </p>
            <img src={IMAGES.frequencyMethod} alt="Frequency Method" className="section-hero-image" style={{marginTop: '20px'}} />
          </div>

          <div className="patterns-grid">
            {/* Pattern 1: DPD */}
            <div className="pattern-card bullish">
              <div className="pattern-header">
                <TrendingUp size={24} />
                <span className="pattern-label">TÍN HIỆU MUA</span>
              </div>
              <h3 className="pattern-name">DPD</h3>
              <p className="pattern-tagline text-cyan">Điểm Mua Vàng Trong Xu Hướng Tăng</p>
              <p className="pattern-desc">
                Mẫu nến cho bạn biết chính xác khi nào nên MUA VÀO —
                điểm entry tối ưu với rủi ro thấp nhất và tiềm năng lợi nhuận cao nhất trong sóng tăng.
              </p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Tỷ Lệ Thắng</span><span className="value text-green">72%</span></div>
                <div className="stat"><span className="label">Lời/Lỗ</span><span className="value text-cyan">2.5:1</span></div>
              </div>
            </div>

            {/* Pattern 2: UPU */}
            <div className="pattern-card bearish">
              <div className="pattern-header">
                <TrendingDown size={24} />
                <span className="pattern-label">TÍN HIỆU BÁN</span>
              </div>
              <h3 className="pattern-name">UPU</h3>
              <p className="pattern-tagline text-cyan">Điểm Bán Đỉnh Trong Xu Hướng Giảm</p>
              <p className="pattern-desc">
                Mẫu nến báo hiệu thời điểm BÁN RA hoàn hảo —
                giúp bạn thoát hàng ở đỉnh hoặc mở vị thế Short khi thị trường chuẩn bị đảo chiều.
              </p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Tỷ Lệ Thắng</span><span className="value text-red">68%</span></div>
                <div className="stat"><span className="label">Lời/Lỗ</span><span className="value text-cyan">2.2:1</span></div>
              </div>
            </div>

            {/* Pattern 3: UPD */}
            <div className="pattern-card bullish">
              <div className="pattern-header">
                <TrendingUp size={24} />
                <span className="pattern-label">TÍN HIỆU MUA</span>
              </div>
              <h3 className="pattern-name">UPD</h3>
              <p className="pattern-tagline text-cyan">Bắt Đáy Chính Xác Sau Điều Chỉnh</p>
              <p className="pattern-desc">
                Pattern giúp bạn MUA VÀO đúng đáy khi giá vừa điều chỉnh xong —
                cơ hội vàng cho những ai đã bỏ lỡ đợt tăng trước đó.
              </p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Tỷ Lệ Thắng</span><span className="value text-green">75%</span></div>
                <div className="stat"><span className="label">Lời/Lỗ</span><span className="value text-cyan">2.8:1</span></div>
              </div>
            </div>

            {/* Pattern 4: DPU */}
            <div className="pattern-card bearish">
              <div className="pattern-header">
                <TrendingDown size={24} />
                <span className="pattern-label">TÍN HIỆU BÁN</span>
              </div>
              <h3 className="pattern-name">DPU</h3>
              <p className="pattern-tagline text-cyan">Bán Đỉnh Sau Nhịp Hồi Phục</p>
              <p className="pattern-desc">
                Mẫu nến cho phép bạn BÁN RA ở mức giá cao nhất có thể khi thị trường hồi phục tạm thời —
                lý tưởng để chốt lời hoặc mở Short.
              </p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Tỷ Lệ Thắng</span><span className="value text-red">70%</span></div>
                <div className="stat"><span className="label">Lời/Lỗ</span><span className="value text-cyan">2.4:1</span></div>
              </div>
            </div>

            {/* Pattern 5: HFZ */}
            <div className="pattern-card zone">
              <div className="pattern-header">
                <Layers size={24} />
                <span className="pattern-label">VÙNG KHÁNG CỰ</span>
              </div>
              <h3 className="pattern-name">HFZ</h3>
              <p className="pattern-tagline text-cyan">Vùng Giá Sẽ Bật Xuống</p>
              <p className="pattern-desc">
                Hệ thống tự động đánh dấu những vùng giá quan trọng mà thị trường có khả năng cao sẽ QUAY ĐẦU GIẢM —
                giúp bạn tránh mua đỉnh.
              </p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Độ Chính Xác</span><span className="value text-purple">85%</span></div>
                <div className="stat"><span className="label">Nhận Diện</span><span className="value text-cyan">Tự Động</span></div>
              </div>
            </div>

            {/* Pattern 6: LFZ */}
            <div className="pattern-card zone">
              <div className="pattern-header">
                <Layers size={24} />
                <span className="pattern-label">VÙNG HỖ TRỢ</span>
              </div>
              <h3 className="pattern-name">LFZ</h3>
              <p className="pattern-tagline text-cyan">Vùng Giá Sẽ Bật Lên</p>
              <p className="pattern-desc">
                Hệ thống tự động đánh dấu những vùng giá quan trọng mà thị trường có khả năng cao sẽ QUAY ĐẦU TĂNG —
                giúp bạn tìm điểm mua đáy.
              </p>
              <div className="pattern-stats">
                <div className="stat"><span className="label">Độ Chính Xác</span><span className="value text-purple">83%</span></div>
                <div className="stat"><span className="label">Nhận Diện</span><span className="value text-cyan">Tự Động</span></div>
              </div>
            </div>
          </div>

          <div className="paper-trading-box">
            <Gamepad2 size={28} />
            <div className="paper-trading-content">
              <h4><span className="text-cyan">Paper Trading</span> — Thực Hành Không Mất Tiền Thật</h4>
              <p>
                Trước khi giao dịch bằng tiền thật, bạn có thể luyện tập với tài khoản ảo để làm quen với 6 công thức tần số.
                Thực hành bao nhiêu cũng được, hoàn toàn miễn phí, không rủi ro — cho đến khi bạn tự tin 100% với phương pháp.
              </p>
              <div className="paper-trading-features">
                <span className="pt-feature"><CheckCircle size={14} /> Tiền ảo không giới hạn</span>
                <span className="pt-feature"><CheckCircle size={14} /> Dữ liệu thị trường thực</span>
                <span className="pt-feature"><CheckCircle size={14} /> Theo dõi kết quả chi tiết</span>
                <span className="pt-feature"><CheckCircle size={14} /> Luyện tập đến khi tự tin</span>
              </div>
            </div>
          </div>

          <div className="method-box">
            <h4 className="text-gold">Quy Trình 5 Bước Đơn Giản</h4>
            <div className="method-steps">
              <div className="step"><span className="step-num">1</span><span>Scanner phát hiện vùng giá quan trọng (HFZ/LFZ)</span></div>
              <div className="step"><span className="step-num">2</span><span>Chờ giá quay về test vùng đó</span></div>
              <div className="step"><span className="step-num">3</span><span>Nhận diện mẫu nến xác nhận (DPD, UPU...)</span></div>
              <div className="step"><span className="step-num">4</span><span>Vào lệnh theo Entry/Stop/Target có sẵn</span></div>
              <div className="step"><span className="step-num">5</span><span>Quản lý vốn 1-2% mỗi lệnh</span></div>
            </div>
            <div className="method-quote">
              <p>"Trong thế nào, ngoài thế ấy" — Khi bạn có hệ thống rõ ràng, tâm lý sẽ ổn định, quyết định sẽ chính xác hơn.</p>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 6: TIER COMPARISON (PART 1 + PART 2) ========== */}
      <section className="section-pricing">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-burgundy">
              💎 Bảng Giá Sản Phẩm
            </span>
            <h2 className="section-title">
              CHỌN GÓI PHÙ HỢP<br />
              <span className="text-gold">VỚI HÀNH TRÌNH CỦA BẠN</span>
            </h2>
            <p className="section-subtitle">
              Từ người mới bắt đầu đến trader chuyên nghiệp, từ tìm kiếm sự thịnh vượng tài chính
              đến chuyển hóa tư duy — GEMRAL có giải pháp phù hợp cho mọi giai đoạn.
            </p>
          </div>

          {/* ===== CATEGORY 1: KHÓA HỌC FREQUENCY TRADING ===== */}
          <div className="pricing-category">
            <div className="category-header">
              <div className="category-icon">
                <TrendingUp size={28} />
              </div>
              <h3 className="category-title">Khóa Học Frequency Trading</h3>
              <span className="category-desc">Phương pháp giao dịch tần số độc quyền của Gem Trading</span>
            </div>

            <div className="pricing-grid-4">
              {/* STARTER */}
              <div className="pricing-card free">
                <span className="card-badge badge-free">Người Mới</span>
                <div className="card-head">
                  <span className="card-tier">Starter</span>
                  <h4 className="card-name">Khóa Học Cơ Bản</h4>
                  <div className="card-price">
                    <span className="price-amount text-cyan">299.000</span>
                    <span className="price-period">đ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Dành cho người mới bắt đầu muốn học trading</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Kiến thức nền tảng về thị trường crypto</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Giới thiệu 6 công thức tần số cơ bản</span>
                  </div>
                  <div className="feature-item disabled">
                    <CircleX size={14} />
                    <span>Không bao gồm Scanner & Chatbot</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('course-starter')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* TIER 1 */}
              <div className="pricing-card pro">
                <div className="card-head">
                  <span className="card-tier">Tier 1</span>
                  <h4 className="card-name">Frequency Pro</h4>
                  <div className="card-price">
                    <span className="price-amount text-cyan">11.000.000</span>
                    <span className="price-period">đ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Toàn bộ nội dung khóa Trading Frequency</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Scanner PRO (997K/tháng × 12) <span className="bonus-tag">MIỄN PHÍ</span></span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Chatbot PRO (39K/tháng × 12) <span className="bonus-tag">MIỄN PHÍ</span></span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Hỗ trợ qua nhóm Telegram</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('course-tier1')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* TIER 2 */}
              <div className="pricing-card premium">
                <span className="card-badge badge-popular">Phổ Biến Nhất</span>
                <div className="card-head">
                  <span className="card-tier">Tier 2</span>
                  <h4 className="card-name">Frequency Premium</h4>
                  <div className="card-price">
                    <span className="price-amount text-gold">21.000.000</span>
                    <span className="price-period">đ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Toàn bộ Tier 1 + Chiến lược nâng cao</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Scanner PREMIUM (1.997K × 12) <span className="bonus-tag">MIỄN PHÍ</span></span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Chatbot PREMIUM (99K × 12) <span className="bonus-tag">MIỄN PHÍ</span></span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Hướng dẫn 1-1 hàng tháng</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('course-tier2')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* TIER 3 */}
              <div className="pricing-card vip">
                <span className="card-badge badge-best">VIP Cao Cấp</span>
                <div className="card-head">
                  <span className="card-tier">Tier 3</span>
                  <h4 className="card-name">Frequency VIP</h4>
                  <div className="card-price">
                    <span className="price-amount text-purple">68.000.000</span>
                    <span className="price-period">đ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Toàn bộ Tier 2 + Lớp học VIP riêng tư</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Scanner VIP (5.997K × 24) <span className="bonus-tag">MIỄN PHÍ</span></span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Chatbot PREMIUM (24 tháng) <span className="bonus-tag">MIỄN PHÍ</span></span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Nhóm VIP riêng + Hỗ trợ 24/7</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('course-tier3')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* ===== CATEGORY 2: KHÓA HỌC CHUYỂN HÓA TƯ DUY ===== */}
          <div className="pricing-category">
            <div className="category-header">
              <div className="category-icon">
                <Brain size={28} />
              </div>
              <h3 className="category-title">Khóa Học Chuyển Hóa Tư Duy</h3>
              <span className="category-desc">Học Thuyết Chuyển Hóa Nội Tâm — Jennie Uyen Chu</span>
            </div>

            <div className="pricing-grid-3">
              {/* 7 Ngày Chuyển Hóa */}
              <div className="pricing-card mindset">
                <span className="card-badge badge-popular">Bán Chạy Nhất</span>
                <div className="card-head">
                  <span className="card-tier">7 Ngày Chuyển Hóa</span>
                  <h4 className="card-name">Khai Mở Tần Số Gốc</h4>
                  <div className="card-price">
                    <span className="price-amount text-gold">1.990.000</span>
                    <span className="price-period">đ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Hành trình 7 ngày chuyển hóa tần số từ gốc rễ</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Hiểu rõ 5 Niềm Tin Nền Tảng</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>7 Nghi Thức duy trì tần số cao</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Bài tập thực hành và nhật ký hướng dẫn</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('mindset-7days')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/pages/7ngaykhaimotansogoc" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* Tình Yêu */}
              <div className="pricing-card mindset">
                <div className="card-head">
                  <span className="card-tier">Tình Yêu & Quan Hệ</span>
                  <h4 className="card-name">Kích Hoạt Tần Số Tình Yêu</h4>
                  <div className="card-price">
                    <span className="price-amount text-pink">399.000</span>
                    <span className="price-period">đ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Hiểu tần số tình yêu trong các mối quan hệ</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Phá vỡ Hình Tư Tưởng "không xứng đáng"</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Kỹ thuật thu hút quan hệ lành mạnh</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Bài tập yêu thương bản thân</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('mindset-love')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/pages/khoahockichhoattansotinhyeu" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* Triệu Phú */}
              <div className="pricing-card mindset">
                <div className="card-head">
                  <span className="card-tier">Tài Chính & Thịnh Vượng</span>
                  <h4 className="card-name">Tái Tạo Tư Duy Triệu Phú</h4>
                  <div className="card-price">
                    <span className="price-amount text-gold">499.000</span>
                    <span className="price-period">đ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Phá vỡ Hình Tư Tưởng thiếu thốn</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Cài đặt tư duy thịnh vượng</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Kỹ thuật gieo hạt tài chính</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Bài tập xả bỏ và nhận vào</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('mindset-wealth')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/pages/khoahoctaitaotuduytrieuphu" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* ===== CATEGORY 3: GEM MASTER SƯ PHỤ AI (PART 2) ===== */}
          <div className="pricing-category">
            <div className="category-header">
              <div className="category-icon">
                <MessageCircle size={28} />
              </div>
              <h3 className="category-title">GEM Master Sư Phụ AI</h3>
              <span className="category-desc">Người bạn đồng hành trên hành trình chuyển hóa</span>
            </div>

            <div className="pricing-grid-4">
              {/* FREE */}
              <div className="pricing-card free">
                <span className="card-badge badge-free">Miễn Phí</span>
                <div className="card-head">
                  <span className="card-tier">Miễn Phí</span>
                  <h4 className="card-name">Trải Nghiệm</h4>
                  <div className="card-price">
                    <span className="price-free">MIỄN PHÍ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>5 câu hỏi mỗi ngày</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Tự động reset mỗi 24 giờ</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Rút Tarot, Kinh Dịch, Tử Vi cơ bản</span>
                  </div>
                  <div className="feature-item disabled">
                    <CircleX size={14} />
                    <span>Không có phân tích chuyên sâu</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={scrollToWaitlist}>Bắt Đầu Miễn Phí</button>
                  <a href="#" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* PRO */}
              <div className="pricing-card pro">
                <div className="card-head">
                  <span className="card-tier">Pro</span>
                  <h4 className="card-name">Nâng Cao</h4>
                  <div className="card-price">
                    <span className="price-amount text-cyan">39.000</span>
                    <span className="price-period">đ/tháng</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>15 câu hỏi mỗi ngày</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Phân tích chi tiết hơn</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Gợi ý pha lê phù hợp</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Lưu lịch sử hội thoại</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Nghi thức Luật Hấp Dẫn <span className="exclusive-tag">ĐỘC QUYỀN</span></span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('chatbot-pro')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/products/yinyang-chatbot-ai-pro" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* PREMIUM */}
              <div className="pricing-card premium">
                <span className="card-badge badge-popular">Phổ Biến</span>
                <div className="card-head">
                  <span className="card-tier">Premium</span>
                  <h4 className="card-name">Chuyên Nghiệp</h4>
                  <div className="card-price">
                    <span className="price-amount text-gold">59.000</span>
                    <span className="price-period">đ/tháng</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>50 câu hỏi mỗi ngày</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Phân tích chuyên sâu theo Học Thuyết</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Bảng Tầm Nhìn tích hợp</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Theo dõi hành trình chuyển hóa</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Nghi thức Luật Hấp Dẫn <span className="exclusive-tag">ĐẦU TIÊN TẠI VN</span></span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('chatbot-premium')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/products/gem-chatbot-premium" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* VIP */}
              <div className="pricing-card vip">
                <span className="card-badge badge-best">Không Giới Hạn</span>
                <div className="card-head">
                  <span className="card-tier">VIP</span>
                  <h4 className="card-name">Không Giới Hạn</h4>
                  <div className="card-price">
                    <span className="price-amount text-purple">99.000</span>
                    <span className="price-period">đ/tháng</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Không giới hạn câu hỏi mỗi ngày</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Tất cả tính năng Premium</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Ưu tiên phản hồi nhanh hơn</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Truy cập tính năng mới sớm nhất</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">Nghi thức Luật Hấp Dẫn <span className="exclusive-tag">ĐẦU TIÊN TẠI VN</span></span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('chatbot-vip')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/products/yinyang-chatbot-ai-vip" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* ===== CATEGORY 4: GEM SCANNER DASHBOARD (PART 2) ===== */}
          <div className="pricing-category">
            <div className="category-header">
              <div className="category-icon">
                <Search size={28} />
              </div>
              <h3 className="category-title">GEM Scanner Dashboard</h3>
              <span className="category-desc">Mua riêng không bao gồm khóa học</span>
            </div>

            <div className="pricing-grid-4">
              {/* FREE */}
              <div className="pricing-card free">
                <span className="card-badge badge-free">Dùng Thử</span>
                <div className="card-head">
                  <span className="card-tier">Miễn Phí</span>
                  <h4 className="card-name">Trải Nghiệm</h4>
                  <div className="card-price">
                    <span className="price-free">MIỄN PHÍ</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>5 lần quét mỗi ngày</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>3 mẫu nến cơ bản</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Giao dịch thử không giới hạn</span>
                  </div>
                  <div className="feature-item disabled">
                    <CircleX size={14} />
                    <span>Không có thông báo tức thời</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={scrollToWaitlist}>Dùng Thử Miễn Phí</button>
                  <a href="#" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* PRO */}
              <div className="pricing-card pro">
                <div className="card-head">
                  <span className="card-tier">Pro</span>
                  <h4 className="card-name">Scanner Pro</h4>
                  <div className="card-price">
                    <span className="price-amount text-cyan">997.000</span>
                    <span className="price-period">đ/tháng</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Quét không giới hạn</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>7 mẫu nến đầy đủ</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Thông báo qua Telegram</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Gợi ý điểm vào/cắt lỗ/chốt lời</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('scanner-pro')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/products/gem-scanner-pro" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* PREMIUM */}
              <div className="pricing-card premium">
                <span className="card-badge badge-popular">Phổ Biến</span>
                <div className="card-head">
                  <span className="card-tier">Premium</span>
                  <h4 className="card-name">Scanner Premium</h4>
                  <div className="card-price">
                    <span className="price-amount text-gold">1.997.000</span>
                    <span className="price-period">đ/tháng</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Tất cả tính năng Pro</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">15 mẫu nến + công cụ nâng cao</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Phân tích đa khung thời gian</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Bảng điều khiển kiểm chứng lịch sử</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('scanner-premium')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/products/scanner-dashboard-premium" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>

              {/* VIP */}
              <div className="pricing-card vip">
                <span className="card-badge badge-best">Đầy Đủ Nhất</span>
                <div className="card-head">
                  <span className="card-tier">VIP</span>
                  <h4 className="card-name">Scanner VIP</h4>
                  <div className="card-price">
                    <span className="price-amount text-purple">5.997.000</span>
                    <span className="price-period">đ/tháng</span>
                  </div>
                </div>
                <div className="card-features">
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Tất cả tính năng Premium</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span className="feature-highlight">24 mẫu nến + dự đoán AI</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Theo dõi cá voi & phân tích khối lượng</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle size={14} />
                    <span>Hỗ trợ ưu tiên + Nhóm riêng tư</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn-card btn-card-primary" onClick={() => addToCart('scanner-vip')}>
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <a href="https://yinyangmasters.com/products/scanner-dashboard-vip" target="_blank" rel="noopener noreferrer" className="btn-card btn-card-secondary">Tìm Hiểu Thêm →</a>
                </div>
              </div>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 7: COURSES MINDSET ========== */}
      <section className="section-courses-mindset">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-pink">
              <Heart size={14} /> Khóa Học Chuyển Hóa
            </span>
            <h2 className="section-title">
              HÀNH TRÌNH CHUYỂN HÓA<br />
              <span className="text-pink">TỪ BÊN TRONG</span>
            </h2>
            <p className="section-subtitle">
              Dựa trên Học Thuyết Chuyển Hóa Nội Tâm của Jennie Uyen Chu,
              mỗi khóa học là một hành trình giúp bạn nhận diện và thay đổi những năng lượng tiêu cực
              đã ăn sâu trong tiềm thức, để từ đó thu hút cuộc sống bạn thực sự xứng đáng.
            </p>
          </div>

          <div className="intro-quote-box">
            <Quote size={32} className="quote-icon" />
            <blockquote>
              "Bạn không cần thay đổi thế giới bên ngoài. Bạn chỉ cần thay đổi tần số bên trong —
              và thế giới sẽ tự động phản chiếu sự thay đổi đó."
            </blockquote>
            <cite>— Jennie Uyen Chu, Tác giả Học Thuyết Chuyển Hóa Nội Tâm</cite>
          </div>

          <div className="mindset-courses-grid">
            <div className="mindset-course-card">
              <h4>Khai Mở Tần Số Gốc</h4>
              <p>Hành trình 7 ngày đặt nền móng cho mọi sự chuyển hóa, giúp bạn nhận diện và phá vỡ những năng lượng tiêu cực đã ăn sâu trong tiềm thức từ thuở nhỏ, đồng thời hiểu rõ 5 Niềm Tin Nền Tảng của Học Thuyết để áp dụng vào cuộc sống hàng ngày.</p>
              <div className="price-box">
                <span className="original-price">2.990.000đ</span>
                <span className="current-price">1.990.000đ</span>
              </div>
              <ul className="course-features">
                <li><CheckCircle size={14} /> 7 bài học chuyên sâu với hướng dẫn chi tiết từng bước thực hành nghi thức hàng ngày</li>
                <li><CheckCircle size={14} /> Hiểu rõ 5 Niềm Tin Nền Tảng của Học Thuyết và cách chúng vận hành trong cuộc sống</li>
                <li><CheckCircle size={14} /> Bài tập viết nhật ký có hướng dẫn giúp bạn nhận diện pattern năng lượng cá nhân</li>
                <li><CheckCircle size={14} /> 7 Nghi Thức buổi sáng và buổi tối để duy trì tần số cao suốt cả ngày</li>
              </ul>
              <button className="btn-course" onClick={() => addToCart('mindset-7days')}>Đăng Ký Ngay</button>
            </div>

            <div className="mindset-course-card featured">
              <span className="featured-tag">Mới Ra Mắt</span>
              <h4>Kích Hoạt Tần Số Tình Yêu</h4>
              <p>Khóa học giúp bạn hiểu sâu về tần số tình yêu và cách nó vận hành trong các mối quan hệ, từ đó phá vỡ những năng lượng tiêu cực như "không xứng đáng được yêu" hoặc "sợ bị tổn thương" để thu hút và duy trì mối quan hệ lành mạnh, viên mãn.</p>
              <div className="price-box">
                <span className="original-price">599.000đ</span>
                <span className="current-price">399.000đ</span>
              </div>
              <ul className="course-features">
                <li><CheckCircle size={14} /> Hiểu cơ chế tần số tình yêu và tại sao bạn thu hút những mối quan hệ hiện tại</li>
                <li><CheckCircle size={14} /> Nhận diện và chuyển hóa năng lượng "sợ bị bỏ rơi" và "không đủ tốt"</li>
                <li><CheckCircle size={14} /> Kỹ thuật nâng tần số để trở thành nam châm thu hút tình yêu đích thực</li>
                <li><CheckCircle size={14} /> Bài tập thực hành yêu thương bản thân trước khi yêu người khác</li>
              </ul>
              <button className="btn-course primary" onClick={() => addToCart('mindset-love')}>Đăng Ký Ngay</button>
            </div>

            <div className="mindset-course-card">
              <h4>Tái Tạo Tư Duy Triệu Phú</h4>
              <p>Khóa học giúp bạn nhận diện những tần số thiếu thốn đang kìm hãm dòng chảy thịnh vượng trong cuộc sống, rồi cài đặt tư duy giàu có theo đúng nguyên lý của Học Thuyết Chuyển Hóa Nội Tâm để tiền bạc tự nhiên chảy về phía bạn.</p>
              <div className="price-box">
                <span className="original-price">799.000đ</span>
                <span className="current-price">499.000đ</span>
              </div>
              <ul className="course-features">
                <li><CheckCircle size={14} /> Nhận diện những niềm tin vô thức về tiền bạc đã được gieo từ thuở nhỏ</li>
                <li><CheckCircle size={14} /> Cài đặt tư duy thịnh vượng theo nguyên lý "Trong thế nào, ngoài thế ấy"</li>
                <li><CheckCircle size={14} /> Kỹ thuật gieo hạt tài chính để tạo năng lượng mới về tiền bạc</li>
                <li><CheckCircle size={14} /> Bài tập thực hành "Xả để Nhận" giúp mở rộng khả năng tiếp nhận</li>
              </ul>
              <button className="btn-course" onClick={() => addToCart('mindset-wealth')}>Đăng Ký Ngay</button>
            </div>
          </div>

          <img src={IMAGES.coursesMindset} alt="Courses Mindset" className="section-hero-image" />

          <div className="highlight-box">
            <Sparkles size={24} />
            <div>
              <h4 className="text-gold">Tại Sao Chọn Học Thuyết Chuyển Hóa Nội Tâm?</h4>
              <p>Khác với những phương pháp chỉ tập trung vào hành động bên ngoài, Học Thuyết Chuyển Hóa Nội Tâm đi vào gốc rễ vấn đề — những năng lượng tiêu cực đã được gieo từ vô thức. Khi bạn thay đổi tần số bên trong, mọi thứ bên ngoài sẽ tự động thay đổi theo nguyên lý "Trong thế nào, ngoài thế ấy".</p>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 8: COURSES TRADING ========== */}
      <section className="section-courses-trading">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-cyan">
              <BarChart3 size={14} /> Khóa Học Trading
            </span>
            <h2 className="section-title">
              LỘ TRÌNH HỌC<br />
              <span className="text-cyan">FREQUENCY TRADING</span>
            </h2>
            <p className="section-subtitle">
              Từ người mới bắt đầu đến trader chuyên nghiệp — lộ trình được thiết kế khoa học
              giúp bạn làm chủ phương pháp GEM Frequency Method với tỷ lệ thắng từ 68-85%
              đã được kiểm chứng qua hàng nghìn giao dịch thực tế.
            </p>
          </div>

          <div className="exclusive-tag">
            <MapPin size={12} /> CÔNG THỨC ĐỘC QUYỀN TẠI VIỆT NAM
          </div>

          <img src={IMAGES.coursesTrading1} alt="Trading Path" className="section-hero-image" />

          <div className="levels-container">
            {/* STARTER */}
            <div className="level-card starter">
              <div className="level-indicator">
                <div className="level-number">S</div>
              </div>
              <div className="card-info">
                <span className="card-tier-name">Dành Cho Người Mới</span>
                <h4 className="card-title">Khóa Học Cơ Bản</h4>
                <p className="card-description">
                  Bước đầu tiên trên hành trình làm chủ thị trường crypto, giúp bạn hiểu rõ nền tảng
                  của phương pháp GEM Frequency và có thể tự tin đọc biểu đồ, nhận diện xu hướng
                  cơ bản trước khi bước vào các cấp độ chuyên sâu hơn.
                </p>
                <ul className="features-list">
                  <li><CheckCircle size={14} /> Kiến thức nền tảng về thị trường cryptocurrency và cách thức vận hành của nó</li>
                  <li><CheckCircle size={14} /> Giới thiệu 6 công thức tần số cơ bản của phương pháp GEM Frequency</li>
                  <li><CheckCircle size={14} /> Hướng dẫn sử dụng nền tảng giao dịch và các công cụ cần thiết</li>
                  <li><CheckCircle size={14} /> Truy cập nhóm học viên để trao đổi và hỗ trợ lẫn nhau</li>
                </ul>
              </div>
              <div className="card-pricing">
                <span className="price-amount">299.000đ</span>
                <span className="price-period">Thanh toán một lần</span>
                <button className="btn-primary" onClick={() => addToCart('course-starter')}><ShoppingBag size={16} /> Thêm Vào Giỏ</button>
                <a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen" target="_blank" rel="noopener noreferrer" className="btn-secondary">Xem Chi Tiết →</a>
              </div>
            </div>

            {/* TIER 1 */}
            <div className="level-card tier1">
              <div className="level-indicator">
                <div className="level-number">1</div>
              </div>
              <div className="card-info">
                <span className="card-tier-name">Nâng Cao</span>
                <h4 className="card-title">Frequency Pro</h4>
                <p className="card-description">
                  Bước tiến quan trọng giúp bạn làm chủ hoàn toàn phương pháp GEM Frequency,
                  với khả năng nhận diện patterns chính xác và thực hiện giao dịch có hệ thống
                  để đạt được kết quả ổn định và bền vững theo thời gian.
                </p>
                <ul className="features-list">
                  <li><CheckCircle size={14} /> Toàn bộ nội dung khóa Trading Frequency chuyên sâu với case studies thực tế</li>
                  <li><CheckCircle size={14} /> <span className="feature-highlight">Scanner PRO 12 tháng (trị giá 11.964.000đ) <span className="bonus-tag">MIỄN PHÍ</span></span></li>
                  <li><CheckCircle size={14} /> <span className="feature-highlight">GEM Master Chatbot PRO 12 tháng <span className="bonus-tag">MIỄN PHÍ</span></span></li>
                  <li><CheckCircle size={14} /> Hỗ trợ qua nhóm riêng với các học viên cùng cấp độ</li>
                </ul>
              </div>
              <div className="card-pricing">
                <span className="price-original">15.000.000đ</span>
                <span className="price-amount text-cyan">11.000.000đ</span>
                <span className="price-period">Thanh toán một lần</span>
                <button className="btn-primary" onClick={() => addToCart('course-tier1')}><ShoppingBag size={16} /> Thêm Vào Giỏ</button>
                <a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen" target="_blank" rel="noopener noreferrer" className="btn-secondary">Xem Chi Tiết →</a>
              </div>
            </div>

            {/* TIER 2 - POPULAR */}
            <div className="level-card tier2">
              <span className="card-badge badge-popular">Phổ Biến Nhất</span>
              <div className="level-indicator">
                <div className="level-number">2</div>
              </div>
              <div className="card-info">
                <span className="card-tier-name">Chuyên Nghiệp</span>
                <h4 className="card-title">Frequency Premium</h4>
                <p className="card-description">
                  Gói được chọn nhiều nhất dành cho những ai muốn đạt kết quả tối ưu trong giao dịch,
                  với chiến lược nâng cao, công cụ Premium và hỗ trợ ưu tiên qua nhóm riêng giúp bạn
                  nhanh chóng trở thành trader có lợi nhuận ổn định và bền vững.
                </p>
                <ul className="features-list">
                  <li><CheckCircle size={14} /> Toàn bộ nội dung Tier 1 cộng thêm chiến lược nâng cao cho trader chuyên nghiệp</li>
                  <li><CheckCircle size={14} /> <span className="feature-highlight">Scanner PREMIUM 12 tháng (trị giá 23.964.000đ) <span className="bonus-tag">MIỄN PHÍ</span></span></li>
                  <li><CheckCircle size={14} /> <span className="feature-highlight">GEM Master Chatbot PREMIUM 12 tháng <span className="bonus-tag">MIỄN PHÍ</span></span></li>
                  <li><CheckCircle size={14} /> Hỗ trợ ưu tiên qua nhóm riêng để review và cải thiện kết quả</li>
                </ul>
              </div>
              <div className="card-pricing">
                <span className="price-original">28.000.000đ</span>
                <span className="price-amount text-gold">21.000.000đ</span>
                <span className="price-period">Thanh toán một lần</span>
                <button className="btn-primary" onClick={() => addToCart('course-tier2')}><ShoppingBag size={16} /> Thêm Vào Giỏ</button>
                <a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen" target="_blank" rel="noopener noreferrer" className="btn-secondary">Xem Chi Tiết →</a>
              </div>
            </div>

            {/* TIER 3 - VIP */}
            <div className="level-card tier3">
              <span className="card-badge badge-vip">VIP Cao Cấp</span>
              <div className="level-indicator">
                <div className="level-number">3</div>
              </div>
              <div className="card-info">
                <span className="card-tier-name">Cao Cấp Nhất</span>
                <h4 className="card-title">Frequency VIP</h4>
                <p className="card-description">
                  Gói cao cấp nhất dành cho những ai muốn được đồng hành sát sao trên hành trình
                  trở thành trader chuyên nghiệp, với quyền truy cập VIP suốt 24 tháng, nội dung
                  độc quyền và hỗ trợ ưu tiên cao nhất từ đội ngũ.
                </p>
                <ul className="features-list">
                  <li><CheckCircle size={14} /> Toàn bộ nội dung Tier 2 cộng thêm nội dung VIP độc quyền với số lượng giới hạn</li>
                  <li><CheckCircle size={14} /> <span className="feature-highlight">Scanner VIP 24 tháng (trị giá 143.928.000đ) <span className="bonus-tag">MIỄN PHÍ</span></span></li>
                  <li><CheckCircle size={14} /> <span className="feature-highlight">GEM Master Chatbot PREMIUM 24 tháng <span className="bonus-tag">MIỄN PHÍ</span></span></li>
                  <li><CheckCircle size={14} /> Truy cập nhóm VIP riêng với hỗ trợ ưu tiên cao nhất từ đội ngũ</li>
                </ul>
              </div>
              <div className="card-pricing">
                <span className="price-original">90.000.000đ</span>
                <span className="price-amount text-purple">68.000.000đ</span>
                <span className="price-period">Thanh toán một lần</span>
                <button className="btn-primary" onClick={() => addToCart('course-tier3')}><ShoppingBag size={16} /> Thêm Vào Giỏ</button>
                <a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen" target="_blank" rel="noopener noreferrer" className="btn-secondary">Xem Chi Tiết →</a>
              </div>
            </div>
          </div>

          <img src={IMAGES.coursesTrading2} alt="Trading Results" className="section-hero-image" />

          <div className="stats-row trading-stats">
            <div className="stat-item">
              <span className="stat-number text-cyan">68-85%</span>
              <span className="stat-label">Tỷ Lệ Thắng Backtest</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-gold">686+</span>
              <span className="stat-label">Giao Dịch Đã Kiểm Chứng</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-pink">5+ năm</span>
              <span className="stat-label">Dữ Liệu Lịch Sử</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-purple">6</span>
              <span className="stat-label">Công Thức Độc Quyền</span>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 9: PERSONAS ========== */}
      <section className="section-personas">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Users size={14} /> Dành Cho Ai?
            </span>
            <h2 className="section-title">
              GEMRAL ĐƯỢC TẠO RA<br />
              <span className="text-purple">DÀNH RIÊNG CHO BẠN</span>
            </h2>
            <p className="section-subtitle">
              Dù bạn là ai, ở đâu trên hành trình cuộc sống — nếu bạn khao khát sự chuyển hóa
              thực sự từ bên trong, GEMRAL có giải pháp phù hợp với bạn.
            </p>
            <img src={IMAGES.personas} alt="GEMRAL Personas" className="section-hero-image" style={{marginTop: '30px'}} />
          </div>

          <div className="personas-grid">
            <div className="persona-card cyan">
              <div className="card-header">
                <div className="card-icon"><Zap size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">18-25 tuổi</span>
                  <h3 className="card-title text-cyan">Gen Z Trader</h3>
                </div>
              </div>
              <p className="card-quote">"Em muốn kiếm tiền từ crypto nhưng không biết bắt đầu từ đâu, sợ mất tiền lắm."</p>
              <p className="card-description">Bạn trẻ năng động muốn tạo thu nhập từ thị trường crypto nhưng chưa có kinh nghiệm, dễ bị cuốn vào FOMO và thường mua đỉnh bán đáy vì thiếu phương pháp rõ ràng.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> FOMO mua theo đám đông rồi bị kẹt hàng ở đỉnh</li>
                  <li><CircleX size={14} /> Không có hệ thống, giao dịch theo cảm xúc</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> GEM Scanner + Khóa Starter</div>
            </div>

            <div className="persona-card gold">
              <div className="card-header">
                <div className="card-icon"><BarChart3 size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">Đã có kinh nghiệm</span>
                  <h3 className="card-title text-gold">Trader Thua Lỗ</h3>
                </div>
              </div>
              <p className="card-quote">"Tôi đã mất rất nhiều tiền vào crypto. Cần một phương pháp có hệ thống thật sự."</p>
              <p className="card-description">Trader đã có kinh nghiệm nhưng vẫn chưa tìm được phương pháp hiệu quả, từng trải qua những lần thua lỗ đau thương và đang tìm kiếm cách giao dịch bền vững hơn.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Đã mất tiền vì không có hệ thống rõ ràng</li>
                  <li><CircleX size={14} /> Thiếu kỷ luật, không tuân thủ kế hoạch</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> Khóa Tier 1/2 + Scanner PRO</div>
            </div>

            <div className="persona-card purple">
              <div className="card-header">
                <div className="card-icon"><Globe size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">Quan tâm phát triển bản thân</span>
                  <h3 className="card-title text-purple">Người Tìm Kiếm</h3>
                </div>
              </div>
              <p className="card-quote">"Tôi tin vào năng lượng và luật hấp dẫn, muốn hiểu sâu hơn để áp dụng vào cuộc sống."</p>
              <p className="card-description">Người quan tâm đến phát triển bản thân và các phương pháp nâng cao nhận thức, tin vào sức mạnh của năng lượng nhưng chưa tìm được hệ thống có cơ sở rõ ràng.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Thông tin rời rạc, thiếu hệ thống hóa</li>
                  <li><CircleX size={14} /> Chưa biết cách áp dụng vào thực tế</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> GEM Master + Khóa Tần Số Gốc</div>
            </div>

            <div className="persona-card pink">
              <div className="card-header">
                <div className="card-icon"><Heart size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">25-40 tuổi</span>
                  <h3 className="card-title text-pink">Phụ Nữ Khao Khát Tình Yêu</h3>
                </div>
              </div>
              <p className="card-quote">"Tôi cứ mãi gặp sai người, không biết làm sao để thu hút tình yêu đích thực."</p>
              <p className="card-description">Phụ nữ đã trải qua những mối quan hệ không như ý, cảm thấy mình không xứng đáng được yêu thương hoặc sợ bị tổn thương nên vô tình đẩy tình yêu ra xa.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Pattern lặp lại trong các mối quan hệ</li>
                  <li><CircleX size={14} /> Cảm giác không xứng đáng được yêu</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> Khóa Tần Số Tình Yêu + GEM Master</div>
            </div>

            <div className="persona-card green">
              <div className="card-header">
                <div className="card-icon"><DollarSign size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">30-50 tuổi</span>
                  <h3 className="card-title text-green">Doanh Nhân</h3>
                </div>
              </div>
              <p className="card-quote">"Kinh doanh thành công nhưng luôn có cảm giác thiếu thốn, sợ mất những gì đang có."</p>
              <p className="card-description">Người đã có sự nghiệp nhất định nhưng vẫn cảm thấy thiếu thốn, lo lắng về tài chính dù có thu nhập tốt, muốn xây dựng tư duy thịnh vượng bền vững từ bên trong.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Tư duy thiếu thốn dù đã có tiền</li>
                  <li><CircleX size={14} /> Sợ mất những gì đang có</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> Khóa Tư Duy Triệu Phú + Trading</div>
            </div>

            <div className="persona-card orange">
              <div className="card-header">
                <div className="card-icon"><Info size={24} /></div>
                <div className="card-title-group">
                  <span className="card-label">Mọi lứa tuổi</span>
                  <h3 className="card-title text-orange">Người Mất Phương Hướng</h3>
                </div>
              </div>
              <p className="card-quote">"Tôi cảm thấy cuộc sống cứ trôi đi mà không biết mình thực sự muốn gì."</p>
              <p className="card-description">Người đang ở giai đoạn chuyển đổi trong cuộc sống, cảm thấy mất phương hướng, không biết mình muốn gì và cần một người bạn đồng hành để tìm lại chính mình.</p>
              <div className="pain-points">
                <span className="pain-title">Nỗi đau</span>
                <ul className="pain-list">
                  <li><CircleX size={14} /> Không biết mục đích sống của mình là gì</li>
                  <li><CircleX size={14} /> Cảm thấy trống rỗng và mất kết nối</li>
                </ul>
              </div>
              <div className="solution-tag"><CheckCircle size={14} /> GEM Master + Vision Board</div>
            </div>

            <div className="persona-card burgundy full-width">
              <div className="card-content">
                <div className="card-header">
                  <div className="card-icon"><Star size={24} /></div>
                  <div className="card-title-group">
                    <span className="card-label">Khao Khát Chuyển Hóa Toàn Diện</span>
                    <h3 className="card-title text-gold">Người Muốn Tất Cả</h3>
                  </div>
                </div>
                <p className="card-quote">"Tôi muốn cả tài chính tự do, tình yêu viên mãn và sự bình an trong tâm hồn — tôi tin mình xứng đáng có tất cả."</p>
                <p className="card-description">
                  Bạn không chỉ muốn thành công trong một lĩnh vực mà khao khát sự thịnh vượng toàn diện — tài chính,
                  tình yêu, sức khỏe và sự bình an nội tâm. GEMRAL được tạo ra chính xác dành cho những người như bạn,
                  những người tin rằng mình xứng đáng có được cuộc sống trọn vẹn và đang sẵn sàng hành động để đạt được điều đó.
                </p>
                <div className="solution-tag"><CheckCircle size={14} /> Trọn Bộ GEMRAL — Trading + Mindset + GEM Master + Vision Board</div>
              </div>
              <div className="card-cta">
                <button className="btn-primary" onClick={scrollToWaitlist}>
                  <Zap size={18} /> Bắt Đầu Hành Trình
                </button>
              </div>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 10: TESTIMONIALS ========== */}
      <section className="section-testimonials">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">
              <Star size={14} /> Học Viên Chia Sẻ
            </span>
            <h2 className="section-title">
              CÂU CHUYỆN THÀNH CÔNG<br />
              <span className="text-gold">TỪ CỘNG ĐỒNG GEMRAL</span>
            </h2>
            <p className="section-subtitle">
              Những chia sẻ thực tế từ học viên đã trải nghiệm hành trình chuyển hóa cùng GEMRAL,
              từ người mới bắt đầu đến trader có kinh nghiệm đều tìm thấy giá trị phù hợp với mình.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="testimonial-avatar-wrapper">
                <img src={IMAGES.testimonial1} alt="Minh Tuấn" className="testimonial-image" />
              </div>
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="avatar-initials">MT</span></div>
                <div className="testimonial-info">
                  <h4>Minh Tuấn</h4>
                  <p className="role">Nhân viên IT, Hà Nội</p>
                  <div className="star-rating">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />)}</div>
                </div>
              </div>
              <blockquote className="testimonial-quote">
                "Trước khi biết GEMRAL, tôi đã thua gần 50 triệu trong 6 tháng trading theo cảm tính mà không có hệ thống rõ ràng.
                Sau khi học Frequency Method và sử dụng Scanner, 3 tháng đầu tôi đã hòa vốn và tháng thứ 4 bắt đầu có lợi nhuận ổn định.
                Bây giờ trung bình mỗi tháng tôi kiếm thêm 15-20 triệu từ trading part-time bên cạnh công việc chính tại công ty."
              </blockquote>
              <div className="result-badge success"><CheckCircle size={16} /> +45% ROI trong 90 ngày</div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="testimonial-avatar-wrapper">
                <img src={IMAGES.testimonial2} alt="Thu Hương" className="testimonial-image" />
              </div>
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="avatar-initials">TH</span></div>
                <div className="testimonial-info">
                  <h4>Thu Hương</h4>
                  <p className="role">Chủ shop online, TP.HCM</p>
                  <div className="star-rating">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />)}</div>
                </div>
              </div>
              <blockquote className="testimonial-quote">
                "GEM Master thực sự thay đổi cách tôi nhìn nhận cuộc sống và công việc kinh doanh của mình.
                Những lần rút Tarot và gieo quẻ Kinh Dịch giúp tôi bình tĩnh hơn khi đưa ra quyết định kinh doanh quan trọng.
                Kết hợp với Scanner, tôi có thêm nguồn thu nhập thụ động từ trading mà không mất nhiều thời gian theo dõi thị trường
                vì hệ thống đã làm phần lớn công việc phân tích thay tôi."
              </blockquote>
              <div className="result-badge success"><CheckCircle size={16} /> Thu nhập tăng 80%</div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="testimonial-avatar-wrapper">
                <img src={IMAGES.testimonial3} alt="Quang Hải" className="testimonial-image" />
              </div>
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="avatar-initials">QH</span></div>
                <div className="testimonial-info">
                  <h4>Quang Hải</h4>
                  <p className="role">Trader Full-time, Đà Nẵng</p>
                  <div className="star-rating">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />)}</div>
                </div>
              </div>
              <blockquote className="testimonial-quote">
                "Tôi đã trade được 3 năm và thử qua nhiều phương pháp khác nhau như ICT, SMC, Wyckoff nhưng kết quả vẫn không ổn định.
                Frequency Method cho tôi một góc nhìn hoàn toàn mới về thị trường mà trước đây tôi chưa từng nghĩ đến.
                Scanner giúp tôi không bỏ lỡ bất kỳ setup nào và quan trọng nhất là có kỷ luật trading rõ ràng,
                không còn giao dịch theo cảm xúc như trước đây nữa."
              </blockquote>
              <div className="result-badge success"><CheckCircle size={16} /> Win rate từ 45% lên 72%</div>
            </div>

            <div className="testimonial-card">
              <div className="quote-icon"><Quote size={40} /></div>
              <div className="testimonial-avatar-wrapper">
                <img src={IMAGES.testimonial4} alt="Ngọc Anh" className="testimonial-image" />
              </div>
              <div className="testimonial-header">
                <div className="testimonial-avatar"><span className="avatar-initials">NA</span></div>
                <div className="testimonial-info">
                  <h4>Ngọc Anh</h4>
                  <p className="role">Mẹ bỉm sữa, Bình Dương</p>
                  <div className="star-rating">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--gold)" stroke="var(--gold)" />)}</div>
                </div>
              </div>
              <blockquote className="testimonial-quote">
                "Là mẹ của 2 bé nhỏ, tôi không có nhiều thời gian rảnh để ngồi trước màn hình phân tích thị trường.
                Scanner cho tôi tín hiệu rõ ràng và cụ thể, chỉ cần check app 15 phút buổi sáng và buổi tối là đủ.
                Khóa học Chuyển Hóa giúp tôi cân bằng hơn rất nhiều trong vai trò làm mẹ và đồng thời vẫn có thể
                tạo thu nhập phụ để đóng góp vào tài chính gia đình."
              </blockquote>
              <div className="result-badge success"><CheckCircle size={16} /> +18 triệu/tháng part-time</div>
            </div>
          </div>

          <div className="stats-row testimonial-stats">
            <div className="stat-item">
              <span className="stat-number text-gold">500+</span>
              <span className="stat-label">Học viên đã tham gia</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-cyan">4.8/5</span>
              <span className="stat-label">Đánh giá trung bình</span>
            </div>
            <div className="stat-item">
              <span className="stat-number text-pink">92%</span>
              <span className="stat-label">Hài lòng với kết quả</span>
            </div>
          </div>

          <div className="video-cta-box">
            <h3><Play size={28} /> Xem Thêm Chia Sẻ Từ Học Viên</h3>
            <p>Hơn 50 câu chuyện thực tế từ học viên đã trải nghiệm hành trình chuyển hóa cùng GEMRAL, từ những người mới bắt đầu đến trader có kinh nghiệm lâu năm.</p>
            <img src={IMAGES.testimonials} alt="More Testimonials" className="video-cta-image" />
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 11: PARTNERSHIP ========== */}
      <section className="section-partnership">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-purple">
              <Users size={14} /> Cơ Hội Hợp Tác
            </span>
            <h2 className="section-title">
              CÙNG PHÁT TRIỂN VỚI<br />
              <span className="text-gold">HỆ SINH THÁI GEMRAL</span>
            </h2>
            <p className="section-subtitle">
              Trở thành đối tác của GEMRAL và tạo thu nhập không giới hạn khi giới thiệu sản phẩm đến
              cộng đồng của bạn. Ba chương trình partnership với mức hoa hồng hấp dẫn dành cho mọi đối tượng.
            </p>
          </div>

          <div className="partner-types-grid">
            <div className="partner-type-card ctv">
              <div className="partner-icon"><UserPlus size={32} /></div>
              <h3 className="text-cyan">TIER 1: CTV</h3>
              <div className="commission text-cyan">10-30%</div>
              <span className="requirement-badge">Ai cũng đăng ký được</span>
              <p>Chương trình Cộng Tác Viên dành cho tất cả mọi người muốn kiếm thu nhập thụ động bằng cách giới thiệu sản phẩm GEMRAL đến bạn bè và người quen.</p>
              <ul className="partner-features">
                <li><CheckCircle size={14} /> 5 cấp bậc thăng tiến: Bronze → Diamond</li>
                <li><CheckCircle size={14} /> Hoa hồng Digital: 10% - 30%</li>
                <li><CheckCircle size={14} /> Hoa hồng Physical: 6% - 15%</li>
              </ul>
            </div>

            <div className="partner-type-card kol">
              <div className="partner-icon"><Star size={32} /></div>
              <h3 className="text-gold">TIER 2: KOL AFFILIATE</h3>
              <div className="commission text-gold">20%</div>
              <span className="requirement-badge warning">Yêu cầu: 20,000+ followers</span>
              <p>Chương trình dành riêng cho Influencers và KOLs có tầm ảnh hưởng lớn trên mạng xã hội, với mức hoa hồng đồng nhất cao cho cả sản phẩm Digital và Physical.</p>
              <ul className="partner-features">
                <li><CheckCircle size={14} /> Hoa hồng Digital: 20%</li>
                <li><CheckCircle size={14} /> Hoa hồng Physical: 20%</li>
              </ul>
            </div>

            <div className="partner-type-card instructor">
              <div className="partner-icon"><GraduationCap size={32} /></div>
              <h3 className="text-purple">TIER 3: INSTRUCTOR</h3>
              <div className="commission text-purple">40-60%</div>
              <span className="requirement-badge exclusive">Được GEM mời hoặc có chuyên môn</span>
              <p>Chương trình Giảng Viên dành cho chuyên gia có năng lực đặc biệt trong lĩnh vực trading, tài chính hoặc phát triển bản thân muốn đồng sáng tạo nội dung cùng GEMRAL.</p>
              <ul className="partner-features">
                <li><CheckCircle size={14} /> Revenue Share: 40-60%</li>
                <li><CheckCircle size={14} /> Multiple Income Streams</li>
                <li><CheckCircle size={14} /> Commission + Royalties</li>
                <li><CheckCircle size={14} /> Co-branding & Phát triển khóa học riêng</li>
              </ul>
            </div>
          </div>

          <div className="ctv-table-wrapper">
            <div className="table-header">
              <h3 className="text-cyan">Bảng Hoa Hồng CTV - 5 Cấp Bậc</h3>
              <p>Thăng cấp dựa trên tổng doanh số tích lũy — càng bán nhiều, hoa hồng càng cao</p>
            </div>
            <table className="ctv-table">
              <thead>
                <tr>
                  <th>Cấp Bậc</th>
                  <th>Digital</th>
                  <th>Physical</th>
                </tr>
              </thead>
              <tbody>
                <tr className="tier-bronze">
                  <td><div className="tier-cell"><span className="tier-icon">🥉</span><span className="tier-name">Bronze (Đồng)</span></div></td>
                  <td><span className="commission-value">10%</span></td>
                  <td><span className="commission-value">6%</span></td>
                </tr>
                <tr className="tier-silver">
                  <td><div className="tier-cell"><span className="tier-icon">🥈</span><span className="tier-name">Silver (Bạc)</span></div></td>
                  <td><span className="commission-value">15%</span></td>
                  <td><span className="commission-value">8%</span></td>
                </tr>
                <tr className="tier-gold">
                  <td><div className="tier-cell"><span className="tier-icon">🥇</span><span className="tier-name">Gold (Vàng)</span></div></td>
                  <td><span className="commission-value">20%</span></td>
                  <td><span className="commission-value">10%</span></td>
                </tr>
                <tr className="tier-platinum">
                  <td><div className="tier-cell"><span className="tier-icon">💎</span><span className="tier-name">Platinum (Bạch Kim)</span></div></td>
                  <td><span className="commission-value">25%</span></td>
                  <td><span className="commission-value">12%</span></td>
                </tr>
                <tr className="tier-diamond">
                  <td><div className="tier-cell"><span className="tier-icon">👑</span><span className="tier-name">Diamond (Kim Cương)</span></div></td>
                  <td><span className="commission-value">30%</span></td>
                  <td><span className="commission-value">15%</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <img src={IMAGES.partnership} alt="Partnership" className="section-hero-image" />

          <div className="cta-section">
            <div className="cta-card">
              <h4 className="text-gold">Mua Sản Phẩm</h4>
              <p>Khám phá bộ sưu tập Crystal và các sản phẩm năng lượng giúp nâng cao tần số cuộc sống của bạn.</p>
              <Link to="/shop" className="btn-primary"><ShoppingBag size={16} /> Shop Crystal/Products</Link>
            </div>
            <div className="cta-card">
              <h4 className="text-cyan">Trở Thành CTV</h4>
              <p>Đăng ký miễn phí và bắt đầu kiếm hoa hồng từ ngày đầu tiên. Không cần điều kiện, ai cũng tham gia được.</p>
              <button className="btn-secondary" onClick={() => openPartnershipForm('ctv')}><UserPlus size={16} /> Đăng Ký CTV (Miễn Phí)</button>
            </div>
            <div className="cta-card">
              <h4 className="text-purple">Đăng Ký KOL</h4>
              <p>Bạn có 20,000+ followers? Đăng ký chương trình KOL để nhận mức hoa hồng 20% cho tất cả sản phẩm.</p>
              <button className="btn-tertiary" onClick={() => openPartnershipForm('kol')}><Star size={16} /> Đăng Ký KOL (20K+ Followers)</button>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 12: STATS ========== */}
      <section className="section-stats">
        <div className="grid-bg" />
        <div className="container">
          <div className="section-header">
            <span className="badge badge-gold">
              <BarChart3 size={14} /> Số Liệu Thực Tế
            </span>
            <h2 className="section-title">
              SỐ LIỆU<br />
              <span className="text-gold">KHÔNG NÓI DỐI</span>
            </h2>
            <p className="section-subtitle">
              Tất cả con số dưới đây đều được kiểm chứng từ dữ liệu backtest thực tế trên thị trường crypto,
              không phải lời hứa hão huyền mà là kết quả có thể tái lập được.
            </p>
          </div>

          <div className="stats-grid-main">
            <div className="stat-card">
              <div className="stat-icon"><CheckCircle size={28} /></div>
              <div className="stat-number">68-85%</div>
              <div className="stat-label">Win Rate Backtest</div>
              <div className="stat-desc">Tỷ lệ thắng được kiểm chứng qua hơn 5 năm dữ liệu lịch sử trên các cặp tiền phổ biến.</div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon"><Activity size={28} /></div>
              <div className="stat-number">686+</div>
              <div className="stat-label">Giao Dịch Phân Tích</div>
              <div className="stat-desc">Số lượng giao dịch đã được backtest và phân tích để xây dựng 6 công thức Frequency Method.</div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon"><Clock size={28} /></div>
              <div className="stat-number">5+ năm</div>
              <div className="stat-label">Dữ Liệu Kiểm Chứng</div>
              <div className="stat-desc">Frequency Method được xây dựng và kiểm chứng qua hơn 5 năm dữ liệu thị trường crypto.</div>
            </div>

            <div className="stat-card pink">
              <div className="stat-icon"><Layers size={28} /></div>
              <div className="stat-number">6</div>
              <div className="stat-label">Công Thức Độc Quyền</div>
              <div className="stat-desc">Hệ thống 6 pattern tần số: DPD, UPU, UPD, DPU, HFZ, LFZ giúp nhận diện điểm vào lệnh.</div>
            </div>
          </div>

          <div className="stats-grid-bottom">
            <div className="stat-card green">
              <div className="stat-icon"><Users size={28} /></div>
              <div className="stat-number">500+</div>
              <div className="stat-label">Học Viên Đã Tham Gia</div>
              <div className="stat-desc">Cộng đồng học viên đã và đang thực hành Frequency Method trên thị trường thực tế.</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon"><UserPlus size={28} /></div>
              <div className="stat-number">100+</div>
              <div className="stat-label">Đối Tác CTV/KOL</div>
              <div className="stat-desc">Mạng lưới đối tác đang cùng phát triển và lan tỏa hệ sinh thái GEMRAL tại Việt Nam.</div>
            </div>

            <div className="stat-card cyan">
              <div className="stat-icon"><Smile size={28} /></div>
              <div className="stat-number">92%</div>
              <div className="stat-label">Hài Lòng Với Kết Quả</div>
              <div className="stat-desc">Tỷ lệ học viên hài lòng với kết quả sau khi áp dụng hệ thống vào giao dịch thực tế.</div>
            </div>
          </div>

          <div className="verification-row">
            <div className="verification-item"><CheckCircle size={20} /> Dữ liệu backtest có thể kiểm chứng</div>
            <div className="verification-item"><CheckCircle size={20} /> Kết quả từ học viên thực tế</div>
            <div className="verification-item"><CheckCircle size={20} /> Không hứa hẹn lợi nhuận phi thực tế</div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 13: WAITLIST ========== */}
      <section className="section-waitlist" id="waitlist">
        <div className="particles">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>

        <div className="container">
          <div className="waitlist-grid">
            {/* Left Column */}
            <div className="waitlist-content">
              <span className="badge badge-urgency">
                <Clock size={14} /> Ưu Đãi Có Hạn
              </span>

              <h2 className="waitlist-title">
                ĐĂNG KÝ NGAY<br />
                <span className="text-gold">NHẬN ƯU ĐÃI ĐẶC BIỆT</span>
              </h2>

              <p className="waitlist-subtitle">
                Gia nhập danh sách chờ để nhận quyền truy cập sớm vào hệ sinh thái GEMRAL
                cùng những ưu đãi độc quyền chỉ dành cho thành viên đăng ký trước ngày ra mắt.
              </p>

              <ul className="benefits-list">
                <li>
                  <div className="benefit-icon">
                    <BookOpen size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>Giảm 5% Khóa Học Premium</strong>
                    <span>Áp dụng cho tất cả khóa học Tư Duy và Trading khi ra mắt chính thức trong 7 ngày đầu.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <Lock size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>Truy Cập Scanner Sớm 14 Ngày</strong>
                    <span>Sử dụng GEM Scanner miễn phí trong 14 ngày trước khi tính phí subscription chính thức.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <Users size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>Tham Gia Nhóm Riêng VIP</strong>
                    <span>Kết nối trực tiếp với cộng đồng Early Birds và nhận hỗ trợ ưu tiên từ đội ngũ GEMRAL.</span>
                  </div>
                </li>
                <li>
                  <div className="benefit-icon">
                    <Star size={16} />
                  </div>
                  <div className="benefit-text">
                    <strong>Tặng Crystal Năng Lượng</strong>
                    <span>Nhận miễn phí 1 viên Crystal năng lượng trị giá 200K cho 100 người đăng ký đầu tiên.</span>
                  </div>
                </li>
              </ul>

              <div className="urgency-box">
                <div className="urgency-icon">
                  <AlertTriangle size={26} />
                </div>
                <div className="urgency-text">
                  <strong>Chỉ còn {spotsRemaining} suất ưu đãi Crystal miễn phí!</strong>
                  <span>Ưu đãi tự động hết hạn khi đủ 100 người hoặc sau 7 ngày.</span>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="waitlist-form-wrapper">
              <div className="form-header">
                <h3>Đăng Ký <span className="text-gold">Waitlist</span></h3>
                <p>Hoàn tất form dưới đây để nhận ưu đãi Early Birds</p>
              </div>

              <form className="waitlist-form" onSubmit={handleSubmit}>
                {/* Honeypot anti-spam */}
                <input type="text" name="website" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }} tabIndex={-1} autoComplete="off" />

                <div className="form-group">
                  <label>Họ và tên <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <User size={20} />
                    <input
                      type="text"
                      name="fullName"
                      className="form-input"
                      placeholder="Nhập họ và tên của bạn"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <Phone size={20} />
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <Mail size={20} />
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mã giới thiệu (nếu có)</label>
                  <div className="input-wrapper">
                    <Gift size={20} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: GEM95A52"
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20))}
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bạn quan tâm đến</label>
                  <div className="interest-checkbox-group">
                    {[
                      { value: 'trading', label: 'GEM Trading & Tín Hiệu Crypto', icon: BarChart3 },
                      { value: 'spiritual', label: 'GEM Master Sư Phụ AI', icon: Sparkles },
                      { value: 'courses', label: 'Khóa học chuyển hóa', icon: BookOpen },
                      { value: 'affiliate', label: 'Cơ hội làm CTV/KOL', icon: Users },
                    ].map(interest => (
                      <div
                        key={interest.value}
                        className={`interest-checkbox ${formData.interests.includes(interest.value) ? 'selected' : ''}`}
                        onClick={() => toggleInterest(interest.value)}
                      >
                        <span className="checkbox-custom">
                          {formData.interests.includes(interest.value) && <CheckCircle size={14} />}
                        </span>
                        <interest.icon size={16} />
                        <span className="checkbox-text">{interest.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Clock size={18} className="spin" /> Đang xử lý...</>
                  ) : (
                    <><Send size={18} /> Đăng Ký Nhận Ưu Đãi</>
                  )}
                </button>
              </form>

              <div className="form-footer">
                <p><Lock size={14} /> Thông tin của bạn được bảo mật 100%</p>
                <div className="trust-badges">
                  <span className="trust-badge"><Shield size={14} /> SSL Secured</span>
                  <span className="trust-badge"><CheckCircle size={14} /> GDPR Compliant</span>
                  <span className="trust-badge"><Lock size={14} /> Không Spam</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-footer">gemral.com</div>
        </div>
      </section>

      {/* ========== SECTION 14: FOOTER ========== */}
      <footer className="footer">
        <div className="footer-glow" />

        <div className="container">
          <div className="footer-content">
            {/* Brand Column */}
            <div className="footer-brand">
              <div className="footer-logo">Gemral</div>
              <p className="footer-tagline">
                Nền tảng chuyển hóa tư duy và phát triển bản thân hàng đầu Việt Nam.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="social-link" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
                <a href="#" className="social-link" aria-label="TikTok">
                  <MessageCircle size={20} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="footer-links-grid">
              <div className="links-column">
                <h4>Khóa Học</h4>
                <ul>
                  <li><a href="https://yinyangmasters.com/pages/khoahoctaitaotuduytrieuphu"><ChevronRight size={14} /> Tái Tạo Tư Duy Triệu Phú</a></li>
                  <li><a href="https://yinyangmasters.com/pages/khoahockichhoattansotinhyeu"><ChevronRight size={14} /> Kích Hoạt Tần Số Tình Yêu</a></li>
                  <li><a href="https://yinyangmasters.com/pages/khoatradingtansodocquyen"><ChevronRight size={14} /> GEM Trading</a></li>
                  <li><a href="https://yinyangmasters.com/pages/7ngaykhaimotansogoc"><ChevronRight size={14} /> 7 Ngày Khai Mở Tần Số Gốc</a></li>
                </ul>
              </div>

              <div className="links-column">
                <h4>Đối Tác</h4>
                <ul>
                  <li><a href="https://yinyangmasters.com/pages/doitacthinhvuong"><ChevronRight size={14} /> Chương trình CTV</a></li>
                  <li><a href="https://yinyangmasters.com/pages/doitacthinhvuong"><ChevronRight size={14} /> KOL Affiliate</a></li>
                  <li><a href="https://yinyangmasters.com/pages/doitacthinhvuong"><ChevronRight size={14} /> Giảng viên Partner</a></li>
                  <li><a href="https://yinyangmasters.com/pages/doitacthinhvuong"><ChevronRight size={14} /> Enterprise B2B</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <div className="copyright">
              © 2025 GEM Academy by Gemral. All rights reserved.
            </div>
            <div className="legal-links">
              <a href="#">Chính sách cookie</a>
            </div>
          </div>
        </div>

        <div className="disclaimer">
          <div className="container">
            <p className="disclaimer-text">
              <strong>Tuyên bố miễn trừ trách nhiệm:</strong>
              Giao dịch tiền điện tử có rủi ro cao và có thể không phù hợp với tất cả nhà đầu tư.
              Hiệu suất trong quá khứ không đảm bảo kết quả tương lai.
              Các thông tin trên website chỉ mang tính chất tham khảo, không phải là lời khuyên đầu tư.
            </p>
          </div>
        </div>
      </footer>

      {/* ========== PARTNERSHIP FORM MODAL ========== */}
      {partnershipOpen && (
        <div className="partnership-overlay" onClick={(e) => { if (e.target === e.currentTarget) closePartnershipForm(); }}>
          <div className="partnership-popup">
            <button className="partnership-close" onClick={closePartnershipForm}><X size={18} /></button>

            {partnershipStep === 'form' ? (
              <>
                {/* Header */}
                <div className="partnership-header">
                  <div className="partnership-icon">{partnershipType === 'ctv' ? '🥉' : '⭐'}</div>
                  <h2 className="partnership-title">
                    {partnershipType === 'ctv' ? 'ĐĂNG KÝ CTV' : 'ĐĂNG KÝ KOL'}
                  </h2>
                  <p className="partnership-subtitle">
                    {partnershipType === 'ctv'
                      ? 'Cộng Tác Viên — Bán hàng & Giới thiệu'
                      : 'KOL Affiliate — Influencer & Creator'}
                  </p>
                </div>

                {/* Benefits */}
                <div className="partner-benefits-box">
                  <div className="partner-benefits-title">
                    {partnershipType === 'ctv' ? '🎁 Quyền lợi CTV Bronze' : '🌟 Quyền lợi KOL Affiliate'}
                  </div>
                  <ul className="partner-benefits-list">
                    {partnershipType === 'ctv' ? (
                      <>
                        <li>Hoa hồng Digital: 10%</li>
                        <li>Hoa hồng Physical: 6%</li>
                        <li>Sub-affiliate: 2%</li>
                        <li>Thanh toán: Hàng tháng</li>
                      </>
                    ) : (
                      <>
                        <li>Hoa hồng Digital: 20%</li>
                        <li>Hoa hồng Physical: 20%</li>
                        <li>Sub-affiliate: 3.5%</li>
                        <li>Thanh toán: 2 tuần/lần</li>
                        <li>Marketing Kit chuyên nghiệp</li>
                      </>
                    )}
                  </ul>
                </div>

                {partnershipType === 'ctv' && (
                  <div className="partner-auto-approve">
                    <span className="partner-auto-approve-icon">⏰</span>
                    <span className="partner-auto-approve-text">Đơn đăng ký sẽ được duyệt trong vòng 3 ngày</span>
                  </div>
                )}

                {partnershipType === 'kol' && (
                  <div className="partner-kol-note">
                    <Info size={14} /> Yêu cầu: Tổng followers ≥ 20,000 trên các nền tảng social
                  </div>
                )}

                {/* Form Fields */}
                <div className="partner-form-group">
                  <label className="partner-form-label">Họ và tên <span>*</span></label>
                  <input type="text" className="partner-form-input" placeholder="Nguyễn Văn A"
                    value={partnerForm.fullName} onChange={e => handlePartnerInput('fullName', e.target.value)} />
                </div>
                <div className="partner-form-group">
                  <label className="partner-form-label">Email <span>*</span></label>
                  <input type="email" className="partner-form-input" placeholder="email@example.com"
                    value={partnerForm.email} onChange={e => handlePartnerInput('email', e.target.value)} />
                </div>
                <div className="partner-form-group">
                  <label className="partner-form-label">Số điện thoại <span>*</span></label>
                  <input type="tel" className="partner-form-input" placeholder="0901234567"
                    value={partnerForm.phone} onChange={e => handlePartnerInput('phone', e.target.value)} />
                </div>

                {/* KOL Social Media */}
                {partnershipType === 'kol' && (
                  <div className="partner-social-section">
                    <div className="partner-social-title"><Mic size={14} /> Kênh Social Media (điền ít nhất 1)</div>
                    <div className="partner-social-grid">
                      {[
                        { label: '🎬 YouTube', urlField: 'youtubeUrl', countField: 'youtubeFollowers', countLabel: 'Subscribers' },
                        { label: '📘 Facebook', urlField: 'facebookUrl', countField: 'facebookFollowers', countLabel: 'Followers' },
                        { label: '📸 Instagram', urlField: 'instagramUrl', countField: 'instagramFollowers', countLabel: 'Followers' },
                        { label: '🎵 TikTok', urlField: 'tiktokUrl', countField: 'tiktokFollowers', countLabel: 'Followers' },
                        { label: '💬 Telegram', urlField: 'telegramUrl', countField: 'telegramMembers', countLabel: 'Members' },
                        { label: '🎮 Discord', urlField: 'discordUrl', countField: 'discordMembers', countLabel: 'Members' },
                      ].map(({ label, urlField, countField, countLabel }) => (
                        <div className="partner-social-item" key={urlField}>
                          <label className="partner-social-label">{label}</label>
                          <input type="text" className="partner-social-input" placeholder="URL kênh"
                            value={partnerForm[urlField]} onChange={e => handlePartnerInput(urlField, e.target.value)} />
                          <input type="number" className="partner-social-input" placeholder={countLabel}
                            value={partnerForm[countField]} onChange={e => handlePartnerInput(countField, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="partner-form-group">
                  <label className="partner-form-label">Mã giới thiệu (nếu có)</label>
                  <input type="text" className="partner-form-input" placeholder="GEM12345" style={{ textTransform: 'uppercase' }}
                    value={partnerForm.referralCode} onChange={e => handlePartnerInput('referralCode', e.target.value)} />
                </div>

                {partnershipType === 'ctv' && (
                  <div className="partner-form-group">
                    <label className="partner-form-label">Lý do tham gia (tùy chọn)</label>
                    <textarea className="partner-form-input partner-form-textarea" placeholder="Chia sẻ lý do bạn muốn trở thành CTV..."
                      value={partnerForm.reason} onChange={e => handlePartnerInput('reason', e.target.value)} />
                  </div>
                )}

                {partnershipError && (
                  <div className="partner-form-error">{partnershipError}</div>
                )}

                <button
                  className="partner-submit-btn"
                  onClick={submitPartnership}
                  disabled={partnershipLoading}
                >
                  {partnershipLoading ? 'Đang gửi...' : `Gửi Đăng Ký ${partnershipType === 'ctv' ? 'CTV' : 'KOL'}`}
                </button>

                {partnershipType === 'kol' && (
                  <p className="partner-note">
                    * Sau khi đăng ký, Admin sẽ xác minh và thông báo kết quả trong 3-5 ngày làm việc.
                  </p>
                )}
              </>
            ) : (
              /* Success State */
              <div className="partner-success">
                <div className="partner-success-icon">🎉</div>
                <h3 className="partner-success-title">
                  {partnershipSuccess?.type === 'ctv' ? 'ĐĂNG KÝ CTV THÀNH CÔNG!' : 'ĐƠN ĐĂNG KÝ KOL ĐÃ GỬI!'}
                </h3>
                <p className="partner-success-message">
                  {partnershipSuccess?.type === 'ctv'
                    ? <>Đơn đăng ký của bạn sẽ được <strong>duyệt trong vòng 3 ngày</strong>.<br /><br />
                        Bạn sẽ nhận được thông báo khi được duyệt qua app GEMRAL.<br />
                        Hãy tải app <strong>Gemral</strong> và đăng ký với email <strong>{partnershipSuccess?.email}</strong> để sẵn sàng nhận hoa hồng!</>
                    : <>Admin sẽ xác minh và thông báo kết quả trong <strong>3-5 ngày làm việc</strong>.<br /><br />
                        Để được duyệt nhanh hơn, hãy tải app <strong>Gemral</strong> và hoàn thành xác minh KYC.</>
                  }
                </p>
                {partnershipSuccess?.code && (
                  <div className="partner-success-code">
                    <div className="partner-success-code-label">Mã đăng ký của bạn:</div>
                    <div className="partner-success-code-value">{partnershipSuccess.code}</div>
                  </div>
                )}
                <button className="partner-submit-btn" onClick={closePartnershipForm}>Đóng</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== SUCCESS MODAL ========== */}
      {successModal && (
        <div className="waitlist-modal" onClick={(e) => { if (e.target === e.currentTarget) setSuccessModal(null); }}>
          <div className="waitlist-modal-content success">
            <button className="modal-close-btn" onClick={() => setSuccessModal(null)}><X size={20} /></button>
            <div className="modal-icon-success"><CheckCircle size={48} /></div>
            <h3>Đăng Ký Thành Công!</h3>
            {successModal.queue_number && (
              <p className="modal-queue">Số thứ tự của bạn: <strong>#{successModal.queue_number}</strong></p>
            )}
            {successModal.referral_code && (
              <div className="modal-referral">
                <p>Mã giới thiệu của bạn:</p>
                <div className="referral-code-box">
                  <span className="referral-code-text">{successModal.referral_code}</span>
                  <button className="referral-copy-btn" onClick={copyReferralCode}>Copy</button>
                </div>
                <p className="referral-hint">Chia sẻ mã này để nhận thêm ưu đãi!</p>
              </div>
            )}
            <div className="modal-share-buttons">
              <button className="share-btn share-btn-copy" onClick={copyShareLink}>
                <ExternalLink size={16} /> Copy Link
              </button>
              <button className="share-btn share-btn-zalo" onClick={shareToZalo}>
                <MessageCircle size={16} /> Zalo
              </button>
              <button className="share-btn share-btn-facebook" onClick={shareToFacebook}>
                <Facebook size={16} /> Facebook
              </button>
              <button className="share-btn share-btn-native" onClick={nativeShare}>
                <Send size={16} /> Chia Sẻ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ERROR MODAL ========== */}
      {errorModal && (
        <div className="waitlist-modal" onClick={(e) => { if (e.target === e.currentTarget) setErrorModal(null); }}>
          <div className="waitlist-modal-content error">
            <button className="modal-close-btn" onClick={() => setErrorModal(null)}><X size={20} /></button>
            <div className="modal-icon-error"><AlertTriangle size={48} /></div>
            <h3>Có Lỗi Xảy Ra</h3>
            <p className="modal-error-message">{errorModal}</p>
            <button className="modal-retry-btn" onClick={() => setErrorModal(null)}>Thử Lại</button>
          </div>
        </div>
      )}

      {/* ========== MOBILE FOMO BANNER (bottom) ========== */}
      <div className={`fomo-banner-mobile ${showBackToTop ? 'show' : ''}`}>
        <div className="fomo-banner-content">
          <div className="fomo-banner-info">
            <Flame size={14} />
            <span>Còn <strong>{spotsRemaining}</strong> chỗ VIP</span>
          </div>
          <button className="btn-fomo-mobile" onClick={scrollToWaitlist}>ĐĂNG KÝ</button>
        </div>
      </div>

      {/* ========== CART ICON (Fixed) ========== */}
      <div className="gemral-cart-icon-wrapper">
        <button className="gemral-cart-icon-btn" onClick={() => setCartOpen(true)} aria-label="Mở giỏ hàng">
          <ShoppingCart size={24} />
          {getCartCount() > 0 && (
            <span className="gemral-cart-count" key={getCartCount()}>{getCartCount()}</span>
          )}
        </button>
      </div>

      {/* ========== CART OVERLAY ========== */}
      <div
        className={`gemral-cart-overlay ${cartOpen ? 'active' : ''}`}
        onClick={() => setCartOpen(false)}
      />

      {/* ========== CART DRAWER ========== */}
      <aside className={`gemral-cart-drawer ${cartOpen ? 'open' : ''}`} aria-label="Giỏ hàng">
        <div className="gemral-cart-header">
          <h3><ShoppingCart size={22} /> Giỏ Hàng</h3>
          <button className="gemral-cart-close-btn" onClick={() => setCartOpen(false)} aria-label="Đóng giỏ hàng">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="gemral-cart-empty">
            <ShoppingBag size={80} strokeWidth={1} className="gemral-cart-empty-icon" />
            <h4 className="gemral-cart-empty-title">Giỏ hàng trống</h4>
            <p className="gemral-cart-empty-text">Hãy khám phá các sản phẩm của chúng tôi!</p>
          </div>
        ) : (
          <div className="gemral-cart-content">
            <div className="gemral-cart-items">
              {cart.map(item => {
                const product = PRODUCT_CATALOG[item.id];
                if (!product) return null;
                return (
                  <div className="gemral-cart-item" key={item.id}>
                    <div className="gemral-cart-item-details">
                      <a
                        href={product.shopifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gemral-cart-item-name"
                      >
                        {product.name} <ExternalLink size={12} className="external-link-icon" />
                      </a>
                      <span className="gemral-cart-item-price">{product.priceDisplay}</span>
                    </div>
                    <div className="gemral-cart-item-actions">
                      <div className="gemral-quantity-control">
                        <button className="gemral-qty-btn" onClick={() => updateQuantity(item.id, item.qty - 1)}>
                          <Minus size={14} />
                        </button>
                        <span className="gemral-qty-value">{item.qty}</span>
                        <button className="gemral-qty-btn" onClick={() => updateQuantity(item.id, item.qty + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <button className="gemral-remove-btn" onClick={() => removeFromCart(item.id)} aria-label="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="gemral-cart-footer">
          <div className="gemral-cart-total-row">
            <span className="gemral-cart-total-label">Tổng cộng:</span>
            <span className="gemral-cart-total">{formatPrice(getCartTotal())}</span>
          </div>
          <button
            className="gemral-btn-checkout"
            onClick={checkout}
            disabled={cart.length === 0}
          >
            <CreditCard size={20} /> Thanh Toán
          </button>
        </div>
      </aside>

      {/* ========== CART TOAST ========== */}
      {cartToast && (
        <div className={`gemral-toast show gemral-toast--${cartToast.type || 'success'}`}>
          <div className="gemral-toast-icon">
            <CheckCircle size={20} />
          </div>
          <span className="gemral-toast-message">{cartToast.message}</span>
        </div>
      )}

      {/* ========== BACK TO TOP ========== */}
      <button
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Về đầu trang"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}
