# 📋 PLAN ĐIỀU CHỈNH HỆ THỐNG AFFILIATE/CTV - VERSION 2.0

**Ngày:** 26/11/2025  
**Status:** 🎯 PENDING APPROVAL  
**Effort:** 3-4 ngày work (24-32 giờ)

---

## 🎯 TÓM TẮT YÊU CẦU

### **Vấn đề hiện tại:**
1. ❌ Mã giới thiệu hiển thị cho TẤT CẢ users (chưa đăng ký affiliate)
2. ❌ Không có flow đăng ký → approval
3. ❌ Không phân biệt rõ Affiliate vs CTV
4. ❌ Chưa có withdraw system
5. ❌ Chưa có Admin Dashboard

### **Giải pháp:**
✅ Flow đăng ký mới với approval process  
✅ Phân biệt rõ 2 vai trò: Affiliate (3%) vs CTV (10-30%)  
✅ Auto-unlock form CTV nếu đã mua khóa học  
✅ Implement withdraw request system  
✅ Tạo Admin Dashboard đầy đủ  

---

## 📊 PHÂN TÍCH FLOW HIỆN TẠI

### **Flow Hiện Tại (CÓ VẤN ĐỀ):**

```
User mở Tab Tài Sản
  ↓
Section "Chương Trình Affiliate" LUÔN hiển thị
  ├─ Mã giới thiệu: GEM64F7F0 ❌ (tự động gen)
  ├─ Hoa hồng tháng này: $0.00
  └─ Người giới thiệu: 0
  ↓
User có thể share link NGAY (chưa approved!)
```

**Vấn đề:**
- User chưa đăng ký affiliate vẫn có mã
- Không kiểm soát được ai được phép làm affiliate
- Tracking không chính xác (user không official)

---

## 🎯 FLOW MỚI ĐỀ XUẤT (UX OPTIMIZED)

### **Scenario 1: User chưa đăng ký Affiliate/CTV**

```
User mở Tab Tài Sản
  ↓
Section "Chương Trình Affiliate" hiển thị:
┌────────────────────────────────────────────┐
│ 💎 Tham Gia Chương Trình Affiliate         │
│                                            │
│ 🎯 Kiếm tiền khi giới thiệu bạn bè         │
│                                            │
│ ├─ Affiliate: 3% hoa hồng                  │
│ │  • Tự do đăng ký                         │
│ │  • Không yêu cầu                         │
│ │                                          │
│ └─ CTV 4 Cấp: 10-30% hoa hồng             │
│    • Cần mua khóa học trước               │
│    • Cam kết doanh số                      │
│                                            │
│ [Đăng Ký Affiliate] [Đăng Ký CTV] 🔒      │
│                                            │
│ 📖 Tìm hiểu thêm về chương trình           │
└────────────────────────────────────────────┘
```

**Logic:**
- Nút [Đăng Ký CTV] có icon khóa 🔒
- Khi tap → Check: Đã mua khóa học chưa?
  - ✅ Có → Mở form đăng ký CTV
  - ❌ Chưa → Alert: "Bạn cần mua ít nhất 1 khóa học để đăng ký CTV"

---

### **Scenario 2: User đã mua khóa học (Auto unlock CTV)**

```
User đã mua khóa TIER 1/2/3 hoặc Gem Academy
  ↓
Nút [Đăng Ký CTV] tự động unlock (không còn 🔒)
  ↓
Section hiển thị:
┌────────────────────────────────────────────┐
│ 💎 Tham Gia Chương Trình Affiliate         │
│                                            │
│ ✅ Bạn đã đủ điều kiện đăng ký CTV!        │
│    (Đã mua: Khóa Trading TIER 1)          │
│                                            │
│ [Đăng Ký Affiliate] [Đăng Ký CTV] ✅      │
└────────────────────────────────────────────┘
```

**Logic:**
- Query database: Check user có order nào status = 'paid' với course product
- Nếu có → Enable CTV button + show eligible badge

---

### **Scenario 3: User đã submit form, chờ approval**

```
User đã điền form → Submit
  ↓
Section hiển thị:
┌────────────────────────────────────────────┐
│ ⏳ Đơn Đăng Ký Đang Được Xử Lý             │
│                                            │
│ Loại: CTV 4 Cấp                           │
│ Ngày đăng ký: 26/11/2025                  │
│ Trạng thái: Chờ phê duyệt                 │
│                                            │
│ Chúng tôi sẽ xem xét trong 1-2 ngày làm   │
│ việc và thông báo qua email/app.          │
│                                            │
│ [Hủy Đơn]                                 │
└────────────────────────────────────────────┘
```

**Logic:**
- Disable form buttons (cannot resubmit)
- Show pending status với countdown timer
- Option: Cancel application nếu muốn

---

### **Scenario 4: User được approved**

```
Admin approved đơn
  ↓
User nhận notification
  ↓
Section hiển thị (FINAL):
┌────────────────────────────────────────────┐
│ 💎 Chương Trình CTV 4 Cấp                 │
│                                            │
│ Mã giới thiệu: GEM64F7F0                  │
│ [Sao chép]                                │
│                                            │
│ Cấp độ: Beginner (Cấp 1)                  │
│ Hoa hồng tháng này: $0.00                 │
│ Người giới thiệu: 0                       │
│                                            │
│ [Chi Tiết]  [Rút Tiền]                   │
└────────────────────────────────────────────┘
```

**Logic:**
- MỚI hiển thị mã giới thiệu
- Show role-specific info (Affiliate 3% or CTV tier)
- Enable withdraw button

---

### **Scenario 5: Admin rejected (Optional)**

```
Admin rejected đơn với lý do
  ↓
Section hiển thị:
┌────────────────────────────────────────────┐
│ ❌ Đơn Đăng Ký Bị Từ Chối                  │
│                                            │
│ Lý do: Chưa đủ điều kiện                  │
│                                            │
│ Bạn có thể đăng ký lại sau khi đáp ứng    │
│ đủ yêu cầu hoặc liên hệ hỗ trợ.           │
│                                            │
│ [Đăng Ký Lại]  [Liên Hệ Hỗ Trợ]          │
└────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA CHANGES

### **1. Bảng mới: `partnership_applications`**

```sql
CREATE TABLE partnership_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Application info
  application_type VARCHAR(20) NOT NULL,  -- 'affiliate' or 'ctv'
  
  -- Personal info (from form)
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  -- CTV-specific
  courses_owned TEXT[],  -- Array of course names owned
  reason_for_joining TEXT,
  marketing_channels TEXT,  -- Facebook, TikTok, YouTube, etc.
  estimated_monthly_sales VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_applications_user ON partnership_applications(user_id);
CREATE INDEX idx_applications_status ON partnership_applications(status);
```

---

### **2. Bảng mới: `withdrawal_requests`**

```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Request info
  amount NUMERIC NOT NULL,
  available_balance NUMERIC NOT NULL,  -- Balance at time of request
  
  -- Bank info
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100) NOT NULL,
  account_holder_name VARCHAR(255) NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'processing', 'completed', 'rejected'
  approved_at TIMESTAMP,
  processed_at TIMESTAMP,
  completed_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Admin
  admin_notes TEXT,
  transaction_reference VARCHAR(255),  -- Bank transaction ref
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_partner ON withdrawal_requests(partner_id);
CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status);
```

---

### **3. Update bảng `profiles`**

```sql
-- Add columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_code VARCHAR(20) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partnership_role VARCHAR(20);  -- NULL, 'affiliate', 'ctv'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ctv_tier INTEGER DEFAULT 1;  -- 1, 2, 3, 4
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_commission NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available_balance NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS withdrawn_total NUMERIC DEFAULT 0;

-- Generate unique affiliate code function
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS VARCHAR AS $$
DECLARE
  new_code VARCHAR(20);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Format: GEM + 6 random hex characters (e.g., GEMF4A9B2)
    new_code := 'GEM' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM profiles WHERE affiliate_code = new_code
    ) INTO code_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;
```

---

### **4. SQL Functions mới**

#### **4.1. Check user eligibility for CTV**

```sql
CREATE OR REPLACE FUNCTION check_ctv_eligibility(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_course_purchase BOOLEAN;
BEGIN
  -- Check if user has purchased any course
  SELECT EXISTS(
    SELECT 1 
    FROM shopify_orders 
    WHERE user_id = user_id_param
      AND financial_status = 'paid'
      AND product_type = 'digital'
      AND (
        product_category ILIKE '%course%' 
        OR product_category ILIKE '%tier%'
      )
  ) INTO has_course_purchase;
  
  RETURN has_course_purchase;
END;
$$ LANGUAGE plpgsql;
```

---

#### **4.2. Get user courses owned**

```sql
CREATE OR REPLACE FUNCTION get_user_courses(user_id_param UUID)
RETURNS TABLE(
  course_name TEXT,
  purchase_date TIMESTAMP,
  price NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    so.product_category::TEXT,
    so.paid_at,
    so.total_price
  FROM shopify_orders so
  WHERE so.user_id = user_id_param
    AND so.financial_status = 'paid'
    AND so.product_type = 'digital'
    AND (
      so.product_category ILIKE '%course%'
      OR so.product_category ILIKE '%tier%'
    )
  ORDER BY so.paid_at DESC;
END;
$$ LANGUAGE plpgsql;
```

---

#### **4.3. Submit partnership application**

```sql
CREATE OR REPLACE FUNCTION submit_partnership_application(
  user_id_param UUID,
  app_type VARCHAR,
  full_name_param VARCHAR,
  email_param VARCHAR,
  phone_param VARCHAR,
  reason_param TEXT,
  channels_param TEXT,
  estimated_sales_param VARCHAR
)
RETURNS JSON AS $$
DECLARE
  existing_app RECORD;
  new_app_id UUID;
  is_eligible BOOLEAN;
BEGIN
  -- Check if user already has pending or approved application
  SELECT * INTO existing_app
  FROM partnership_applications
  WHERE user_id = user_id_param
    AND status IN ('pending', 'approved');
  
  IF existing_app IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bạn đã có đơn đăng ký đang được xử lý hoặc đã được duyệt'
    );
  END IF;
  
  -- If CTV, check eligibility
  IF app_type = 'ctv' THEN
    SELECT check_ctv_eligibility(user_id_param) INTO is_eligible;
    
    IF NOT is_eligible THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Bạn cần mua ít nhất 1 khóa học để đăng ký CTV'
      );
    END IF;
  END IF;
  
  -- Insert application
  INSERT INTO partnership_applications (
    user_id,
    application_type,
    full_name,
    email,
    phone,
    reason_for_joining,
    marketing_channels,
    estimated_monthly_sales,
    status
  ) VALUES (
    user_id_param,
    app_type,
    full_name_param,
    email_param,
    phone_param,
    reason_param,
    channels_param,
    estimated_sales_param,
    'pending'
  ) RETURNING id INTO new_app_id;
  
  RETURN json_build_object(
    'success', true,
    'application_id', new_app_id,
    'message', 'Đơn đăng ký đã được gửi thành công'
  );
END;
$$ LANGUAGE plpgsql;
```

---

#### **4.4. Get partnership status**

```sql
CREATE OR REPLACE FUNCTION get_partnership_status(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  profile_data RECORD;
  app_data RECORD;
  courses_count INTEGER;
  is_eligible BOOLEAN;
  result JSON;
BEGIN
  -- Get user profile
  SELECT 
    partnership_role,
    affiliate_code,
    ctv_tier,
    total_commission,
    available_balance
  INTO profile_data
  FROM profiles
  WHERE id = user_id_param;
  
  -- Get latest application
  SELECT *
  INTO app_data
  FROM partnership_applications
  WHERE user_id = user_id_param
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Check CTV eligibility
  SELECT check_ctv_eligibility(user_id_param) INTO is_eligible;
  
  -- Get courses count
  SELECT COUNT(*) INTO courses_count
  FROM shopify_orders
  WHERE user_id = user_id_param
    AND financial_status = 'paid'
    AND product_type = 'digital';
  
  -- Build result
  result := json_build_object(
    'has_partnership', profile_data.partnership_role IS NOT NULL,
    'partnership_role', profile_data.partnership_role,
    'affiliate_code', profile_data.affiliate_code,
    'ctv_tier', profile_data.ctv_tier,
    'total_commission', profile_data.total_commission,
    'available_balance', profile_data.available_balance,
    'has_application', app_data IS NOT NULL,
    'application_status', COALESCE(app_data.status, NULL),
    'application_type', COALESCE(app_data.application_type, NULL),
    'application_date', COALESCE(app_data.created_at, NULL),
    'rejection_reason', COALESCE(app_data.rejection_reason, NULL),
    'is_ctv_eligible', is_eligible,
    'courses_owned_count', courses_count
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

#### **4.5. Approve partnership application**

```sql
CREATE OR REPLACE FUNCTION approve_partnership_application(
  application_id_param UUID,
  admin_notes_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  app_data RECORD;
  new_affiliate_code VARCHAR(20);
BEGIN
  -- Get application
  SELECT * INTO app_data
  FROM partnership_applications
  WHERE id = application_id_param;
  
  IF app_data IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Application not found'
    );
  END IF;
  
  IF app_data.status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Application already processed'
    );
  END IF;
  
  -- Generate affiliate code
  SELECT generate_affiliate_code() INTO new_affiliate_code;
  
  -- Update application
  UPDATE partnership_applications
  SET 
    status = 'approved',
    approved_at = NOW(),
    admin_notes = admin_notes_param,
    updated_at = NOW()
  WHERE id = application_id_param;
  
  -- Update user profile
  UPDATE profiles
  SET 
    partnership_role = app_data.application_type,
    affiliate_code = new_affiliate_code,
    ctv_tier = CASE 
      WHEN app_data.application_type = 'ctv' THEN 1
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE id = app_data.user_id;
  
  -- TODO: Send notification to user
  
  RETURN json_build_object(
    'success', true,
    'affiliate_code', new_affiliate_code,
    'message', 'Application approved successfully'
  );
END;
$$ LANGUAGE plpgsql;
```

---

#### **4.6. Request withdrawal**

```sql
CREATE OR REPLACE FUNCTION request_withdrawal(
  partner_id_param UUID,
  amount_param NUMERIC,
  bank_name_param VARCHAR,
  account_number_param VARCHAR,
  account_holder_param VARCHAR
)
RETURNS JSON AS $$
DECLARE
  current_balance NUMERIC;
  min_withdrawal NUMERIC := 100000;  -- 100K VND minimum
  new_request_id UUID;
BEGIN
  -- Get current available balance
  SELECT available_balance INTO current_balance
  FROM profiles
  WHERE id = partner_id_param;
  
  -- Validation checks
  IF current_balance IS NULL OR current_balance = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Số dư khả dụng bằng 0'
    );
  END IF;
  
  IF amount_param < min_withdrawal THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Số tiền rút tối thiểu là 100,000 VND'
    );
  END IF;
  
  IF amount_param > current_balance THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Số tiền rút vượt quá số dư khả dụng'
    );
  END IF;
  
  -- Check for pending withdrawals
  IF EXISTS(
    SELECT 1 FROM withdrawal_requests
    WHERE partner_id = partner_id_param
      AND status = 'pending'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Bạn có yêu cầu rút tiền đang chờ xử lý'
    );
  END IF;
  
  -- Create withdrawal request
  INSERT INTO withdrawal_requests (
    partner_id,
    amount,
    available_balance,
    bank_name,
    account_number,
    account_holder_name,
    status
  ) VALUES (
    partner_id_param,
    amount_param,
    current_balance,
    bank_name_param,
    account_number_param,
    account_holder_param,
    'pending'
  ) RETURNING id INTO new_request_id;
  
  -- Deduct from available balance (lock funds)
  UPDATE profiles
  SET available_balance = available_balance - amount_param
  WHERE id = partner_id_param;
  
  RETURN json_build_object(
    'success', true,
    'request_id', new_request_id,
    'message', 'Yêu cầu rút tiền đã được gửi'
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 📱 MOBILE APP CHANGES

### **File 1: `src/services/partnershipService.js`**

```javascript
import { supabase } from '../lib/supabase';

export const partnershipService = {
  /**
   * Get current partnership status
   */
  async getPartnershipStatus(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_partnership_status', { user_id_param: userId });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting partnership status:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if user is eligible for CTV
   */
  async checkCtvEligibility(userId) {
    try {
      const { data, error } = await supabase
        .rpc('check_ctv_eligibility', { user_id_param: userId });
      
      if (error) throw error;
      return { success: true, eligible: data };
    } catch (error) {
      console.error('Error checking CTV eligibility:', error);
      return { success: false, eligible: false };
    }
  },

  /**
   * Get user's owned courses
   */
  async getUserCourses(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_courses', { user_id_param: userId });
      
      if (error) throw error;
      return { success: true, courses: data };
    } catch (error) {
      console.error('Error getting user courses:', error);
      return { success: false, courses: [] };
    }
  },

  /**
   * Submit partnership application
   */
  async submitApplication(formData) {
    try {
      const { data, error } = await supabase.rpc('submit_partnership_application', {
        user_id_param: formData.userId,
        app_type: formData.applicationType,
        full_name_param: formData.fullName,
        email_param: formData.email,
        phone_param: formData.phone,
        reason_param: formData.reason,
        channels_param: formData.marketingChannels,
        estimated_sales_param: formData.estimatedSales
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting application:', error);
      return { 
        success: false, 
        error: error.message || 'Có lỗi xảy ra khi gửi đơn' 
      };
    }
  },

  /**
   * Cancel pending application
   */
  async cancelApplication(applicationId) {
    try {
      const { error } = await supabase
        .from('partnership_applications')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .eq('status', 'pending');
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error cancelling application:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Request withdrawal
   */
  async requestWithdrawal(withdrawalData) {
    try {
      const { data, error } = await supabase.rpc('request_withdrawal', {
        partner_id_param: withdrawalData.partnerId,
        amount_param: withdrawalData.amount,
        bank_name_param: withdrawalData.bankName,
        account_number_param: withdrawalData.accountNumber,
        account_holder_param: withdrawalData.accountHolder
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      return { 
        success: false, 
        error: error.message || 'Có lỗi xảy ra khi gửi yêu cầu rút tiền' 
      };
    }
  },

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(partnerId) {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, history: data };
    } catch (error) {
      console.error('Error getting withdrawal history:', error);
      return { success: false, history: [] };
    }
  }
};
```

---

### **File 2: Update `AccountScreen.js` - Section Affiliate**

```javascript
// src/screens/tabs/AccountScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { partnershipService } from '../../services/partnershipService';

const AffiliateSection = ({ userId, navigation }) => {
  const [partnershipStatus, setPartnershipStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartnershipStatus();
  }, [userId]);

  const loadPartnershipStatus = async () => {
    setLoading(true);
    const result = await partnershipService.getPartnershipStatus(userId);
    if (result.success) {
      setPartnershipStatus(result.data);
    }
    setLoading(false);
  };

  // Copy affiliate code
  const handleCopyCode = async (code) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert('✅ Thành công', 'Đã sao chép mã giới thiệu!');
    } catch (error) {
      Alert.alert('❌ Lỗi', 'Không thể sao chép');
    }
  };

  // Handle CTV button tap
  const handleCtvRegister = async () => {
    // Check eligibility first
    if (!partnershipStatus.is_ctv_eligible) {
      Alert.alert(
        '⚠️ Chưa đủ điều kiện',
        'Bạn cần mua ít nhất 1 khóa học để đăng ký CTV',
        [
          { text: 'Đóng', style: 'cancel' },
          { 
            text: 'Xem Khóa Học', 
            onPress: () => navigation.navigate('Shop')
          }
        ]
      );
      return;
    }
    
    // Navigate to CTV registration form
    navigation.navigate('PartnershipRegistration', { type: 'ctv' });
  };

  // Handle Affiliate button tap
  const handleAffiliateRegister = () => {
    navigation.navigate('PartnershipRegistration', { type: 'affiliate' });
  };

  // Handle cancel application
  const handleCancelApplication = () => {
    Alert.alert(
      'Hủy Đơn Đăng Ký',
      'Bạn có chắc muốn hủy đơn đăng ký?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy Đơn',
          style: 'destructive',
          onPress: async () => {
            const result = await partnershipService.cancelApplication(
              partnershipStatus.application_id
            );
            if (result.success) {
              Alert.alert('✅', 'Đã hủy đơn đăng ký');
              loadPartnershipStatus();
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <Text>Đang tải...</Text>;
  }

  // SCENARIO 1: No partnership, no application
  if (!partnershipStatus.has_partnership && !partnershipStatus.has_application) {
    return (
      <View style={styles.affiliateSection}>
        <Text style={styles.sectionTitle}>💎 Tham Gia Chương Trình Affiliate</Text>
        
        <Text style={styles.descText}>
          🎯 Kiếm tiền khi giới thiệu bạn bè
        </Text>
        
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>Affiliate: 3% hoa hồng</Text>
          <Text style={styles.programDetails}>• Tự do đăng ký</Text>
          <Text style={styles.programDetails}>• Không yêu cầu</Text>
        </View>
        
        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>CTV 4 Cấp: 10-30% hoa hồng</Text>
          <Text style={styles.programDetails}>• Cần mua khóa học trước</Text>
          <Text style={styles.programDetails}>• Cam kết doanh số</Text>
          
          {partnershipStatus.is_ctv_eligible && (
            <View style={styles.eligibleBadge}>
              <Text style={styles.eligibleText}>
                ✅ Bạn đã đủ điều kiện!
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleAffiliateRegister}
          >
            <Text style={styles.buttonText}>Đăng Ký Affiliate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.registerButton,
              !partnershipStatus.is_ctv_eligible && styles.buttonDisabled
            ]}
            onPress={handleCtvRegister}
          >
            <Text style={styles.buttonText}>
              Đăng Ký CTV {!partnershipStatus.is_ctv_eligible && '🔒'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('AffiliateInfo')}>
          <Text style={styles.linkText}>📖 Tìm hiểu thêm về chương trình</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // SCENARIO 2: Has application, pending
  if (partnershipStatus.has_application && partnershipStatus.application_status === 'pending') {
    return (
      <View style={styles.affiliateSection}>
        <Text style={styles.sectionTitle}>⏳ Đơn Đăng Ký Đang Được Xử Lý</Text>
        
        <View style={styles.applicationInfo}>
          <Text style={styles.infoRow}>
            Loại: {partnershipStatus.application_type === 'affiliate' ? 'Affiliate' : 'CTV 4 Cấp'}
          </Text>
          <Text style={styles.infoRow}>
            Ngày đăng ký: {new Date(partnershipStatus.application_date).toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.infoRow}>
            Trạng thái: Chờ phê duyệt
          </Text>
        </View>
        
        <Text style={styles.noteText}>
          Chúng tôi sẽ xem xét trong 1-2 ngày làm việc và thông báo qua email/app.
        </Text>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelApplication}
        >
          <Text style={styles.cancelButtonText}>Hủy Đơn</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // SCENARIO 3: Application rejected
  if (partnershipStatus.has_application && partnershipStatus.application_status === 'rejected') {
    return (
      <View style={styles.affiliateSection}>
        <Text style={styles.sectionTitle}>❌ Đơn Đăng Ký Bị Từ Chối</Text>
        
        {partnershipStatus.rejection_reason && (
          <Text style={styles.rejectionReason}>
            Lý do: {partnershipStatus.rejection_reason}
          </Text>
        )}
        
        <Text style={styles.noteText}>
          Bạn có thể đăng ký lại sau khi đáp ứng đủ yêu cầu hoặc liên hệ hỗ trợ.
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => loadPartnershipStatus()}
          >
            <Text style={styles.buttonText}>Đăng Ký Lại</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.buttonText}>Liên Hệ Hỗ Trợ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // SCENARIO 4: Has partnership (approved)
  if (partnershipStatus.has_partnership) {
    const isAffiliate = partnershipStatus.partnership_role === 'affiliate';
    const isCTV = partnershipStatus.partnership_role === 'ctv';
    
    return (
      <View style={styles.affiliateSection}>
        <Text style={styles.sectionTitle}>
          💎 {isAffiliate ? 'Chương Trình Affiliate' : 'Chương Trình CTV 4 Cấp'}
        </Text>
        
        {/* Affiliate Code */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Mã giới thiệu:</Text>
          <Text style={styles.codeValue}>{partnershipStatus.affiliate_code}</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => handleCopyCode(partnershipStatus.affiliate_code)}
          >
            <Text style={styles.copyButtonText}>Sao chép</Text>
          </TouchableOpacity>
        </View>
        
        {/* CTV Tier */}
        {isCTV && (
          <Text style={styles.tierText}>
            Cấp độ: Tier {partnershipStatus.ctv_tier}
          </Text>
        )}
        
        {/* Commission Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {partnershipStatus.total_commission?.toLocaleString('vi-VN') || '0'}₫
            </Text>
            <Text style={styles.statLabel}>Tổng hoa hồng</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {partnershipStatus.available_balance?.toLocaleString('vi-VN') || '0'}₫
            </Text>
            <Text style={styles.statLabel}>Khả dụng</Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AffiliateDetail')}
          >
            <Text style={styles.buttonText}>Chi Tiết</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              partnershipStatus.available_balance < 100000 && styles.buttonDisabled
            ]}
            onPress={() => navigation.navigate('WithdrawRequest')}
            disabled={partnershipStatus.available_balance < 100000}
          >
            <Text style={styles.buttonText}>Rút Tiền</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
};

export default AffiliateSection;
```

---

### **File 3: `PartnershipRegistrationScreen.js` (NEW)**

```javascript
// src/screens/Account/PartnershipRegistrationScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { partnershipService } from '../../services/partnershipService';

const PartnershipRegistrationScreen = ({ route, navigation }) => {
  const { type } = route.params; // 'affiliate' or 'ctv'
  const isAffiliate = type === 'affiliate';
  const isCTV = type === 'ctv';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    reason: '',
    marketingChannels: '',
    estimatedSales: ''
  });

  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    loadUserInfo();
    if (isCTV) {
      loadUserCourses();
    }
  }, []);

  const loadUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
      
      // Load profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setFormData(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          phone: profile.phone || ''
        }));
      }
    }
  };

  const loadUserCourses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const result = await partnershipService.getUserCourses(user.id);
      if (result.success) {
        setUserCourses(result.courses);
      }
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    if (isCTV && !formData.reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng cho biết lý do tham gia');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const submitData = {
        userId: user.id,
        applicationType: type,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        marketingChannels: formData.marketingChannels,
        estimatedSales: formData.estimatedSales
      };

      const result = await partnershipService.submitApplication(submitData);

      if (result.success) {
        Alert.alert(
          '✅ Thành công',
          'Đơn đăng ký đã được gửi. Chúng tôi sẽ xem xét và thông báo trong 1-2 ngày làm việc.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('❌ Lỗi', result.error);
      }
    } catch (error) {
      Alert.alert('❌ Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Đăng Ký {isAffiliate ? 'Affiliate' : 'CTV 4 Cấp'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isAffiliate 
            ? 'Hoa hồng 3% cho tất cả sản phẩm'
            : 'Hoa hồng 10-30% cho digital, 3-15% cho physical'
          }
        </Text>
      </View>

      {/* CTV: Show owned courses */}
      {isCTV && userCourses.length > 0 && (
        <View style={styles.coursesSection}>
          <Text style={styles.sectionTitle}>Khóa học đã sở hữu</Text>
          {userCourses.map((course, index) => (
            <View key={index} style={styles.courseItem}>
              <Text style={styles.courseName}>{course.course_name}</Text>
              <Text style={styles.courseDate}>
                {new Date(course.purchase_date).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Form Fields */}
      <View style={styles.formSection}>
        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
          placeholder="Nguyễn Văn A"
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
          placeholder="0901234567"
          keyboardType="phone-pad"
        />

        {isCTV && (
          <>
            <Text style={styles.label}>Lý do tham gia *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.reason}
              onChangeText={(text) => setFormData(prev => ({ ...prev, reason: text }))}
              placeholder="Ví dụ: Muốn kiếm thêm thu nhập từ mạng xã hội..."
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Kênh marketing (Facebook, TikTok, ...)</Text>
            <TextInput
              style={styles.input}
              value={formData.marketingChannels}
              onChangeText={(text) => setFormData(prev => ({ ...prev, marketingChannels: text }))}
              placeholder="Ví dụ: Facebook, TikTok, YouTube"
            />

            <Text style={styles.label}>Doanh số ước tính/tháng</Text>
            <TextInput
              style={styles.input}
              value={formData.estimatedSales}
              onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedSales: text }))}
              placeholder="Ví dụ: 10-20 triệu"
            />
          </>
        )}
      </View>

      {/* Terms */}
      <View style={styles.termsSection}>
        <Text style={styles.termsText}>
          Bằng cách gửi đơn, bạn đồng ý với{' '}
          <Text style={styles.termsLink}>Điều khoản Chương trình Partnership</Text>
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Gửi Đơn Đăng Ký</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PartnershipRegistrationScreen;
```

---

### **File 4: `WithdrawRequestScreen.js` (NEW)**

```javascript
// src/screens/Account/WithdrawRequestScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { partnershipService } from '../../services/partnershipService';

const WithdrawRequestScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('available_balance, full_name')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setAvailableBalance(profile.available_balance || 0);
        setFormData(prev => ({
          ...prev,
          accountHolder: profile.full_name || ''
        }));
      }
    }
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount.replace(/[^0-9]/g, ''));
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return false;
    }
    if (amount < 100000) {
      Alert.alert('Lỗi', 'Số tiền rút tối thiểu là 100,000 VND');
      return false;
    }
    if (amount > availableBalance) {
      Alert.alert('Lỗi', 'Số tiền rút vượt quá số dư khả dụng');
      return false;
    }
    if (!formData.bankName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ngân hàng');
      return false;
    }
    if (!formData.accountNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tài khoản');
      return false;
    }
    if (!formData.accountHolder.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ tài khoản');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    Alert.alert(
      'Xác nhận',
      `Rút ${formData.amount}₫ về tài khoản ${formData.accountNumber}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              const amount = parseFloat(formData.amount.replace(/[^0-9]/g, ''));
              
              const result = await partnershipService.requestWithdrawal({
                partnerId: user.id,
                amount,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                accountHolder: formData.accountHolder
              });

              if (result.success) {
                Alert.alert(
                  '✅ Thành công',
                  'Yêu cầu rút tiền đã được gửi. Chúng tôi sẽ xử lý trong 1-3 ngày làm việc.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert('❌ Lỗi', result.error);
              }
            } catch (error) {
              Alert.alert('❌ Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatCurrency = (text) => {
    const number = text.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu Cầu Rút Tiền</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          <Text style={styles.balanceValue}>
            {availableBalance.toLocaleString('vi-VN')}₫
          </Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>Số tiền rút *</Text>
        <TextInput
          style={styles.input}
          value={formData.amount}
          onChangeText={(text) => {
            const formatted = formatCurrency(text);
            setFormData(prev => ({ ...prev, amount: formatted }));
          }}
          placeholder="100,000"
          keyboardType="numeric"
        />
        <Text style={styles.hint}>Tối thiểu 100,000 VND</Text>

        <Text style={styles.label}>Tên ngân hàng *</Text>
        <TextInput
          style={styles.input}
          value={formData.bankName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, bankName: text }))}
          placeholder="Vietcombank, BIDV, Techcombank..."
        />

        <Text style={styles.label}>Số tài khoản *</Text>
        <TextInput
          style={styles.input}
          value={formData.accountNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, accountNumber: text }))}
          placeholder="1234567890"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Tên chủ tài khoản *</Text>
        <TextInput
          style={styles.input}
          value={formData.accountHolder}
          onChangeText={(text) => setFormData(prev => ({ ...prev, accountHolder: text }))}
          placeholder="NGUYEN VAN A"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteTitle}>📌 Lưu ý:</Text>
        <Text style={styles.noteText}>• Thời gian xử lý: 1-3 ngày làm việc</Text>
        <Text style={styles.noteText}>• Phí chuyển khoản do GEM chi trả</Text>
        <Text style={styles.noteText}>• Kiểm tra kỹ thông tin tài khoản trước khi gửi</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Gửi Yêu Cầu</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('WithdrawHistory')}
      >
        <Text style={styles.historyButtonText}>Xem Lịch Sử Rút Tiền</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default WithdrawRequestScreen;
```

---

## 🎛️ ADMIN DASHBOARD

### **Architecture:**

```
Admin Dashboard (Web-based)
  ├─ Users Management
  │   ├─ All Users
  │   ├─ Partners (Affiliate + CTV)
  │   ├─ User Details
  │   └─ Edit User
  │
  ├─ Partnership Applications
  │   ├─ Pending Applications
  │   ├─ Approve/Reject
  │   └─ Application History
  │
  ├─ Orders Management
  │   ├─ All Orders
  │   ├─ Shopify Sync Status
  │   └─ Order Details
  │
  ├─ Commission Management
  │   ├─ All Commissions
  │   ├─ By Partner
  │   ├─ By Product Type
  │   └─ Monthly Reports
  │
  ├─ Withdrawal Requests
  │   ├─ Pending Requests
  │   ├─ Approve/Process
  │   ├─ Mark as Completed
  │   └─ Withdrawal History
  │
  ├─ Analytics
  │   ├─ Revenue Dashboard
  │   ├─ Partner Performance
  │   ├─ Product Performance
  │   └─ KPI Tracking
  │
  └─ System Settings
      ├─ Commission Rates
      ├─ KPI Thresholds
      └─ Notification Templates
```

---

### **Admin Dashboard - Phase 1: Core Features**

**Priority:**
1. Partnership Applications (CRITICAL)
2. Withdrawal Requests (CRITICAL)
3. Commission Management (HIGH)
4. Users Management (MEDIUM)
5. Analytics (MEDIUM)

---

### **File: Admin Dashboard SQL Views & Functions**

```sql
-- Admin: Get all pending partnership applications
CREATE OR REPLACE VIEW admin_pending_applications AS
SELECT 
  pa.id,
  pa.user_id,
  pa.application_type,
  pa.full_name,
  pa.email,
  pa.phone,
  pa.reason_for_joining,
  pa.marketing_channels,
  pa.estimated_monthly_sales,
  pa.created_at,
  p.username,
  p.avatar_url,
  -- Check if user has courses
  (
    SELECT COUNT(*) 
    FROM shopify_orders 
    WHERE user_id = pa.user_id 
      AND financial_status = 'paid'
      AND product_type = 'digital'
  ) as courses_owned_count,
  -- Get courses list
  (
    SELECT array_agg(product_category)
    FROM shopify_orders
    WHERE user_id = pa.user_id
      AND financial_status = 'paid'
      AND product_type = 'digital'
  ) as courses_list
FROM partnership_applications pa
LEFT JOIN profiles p ON pa.user_id = p.id
WHERE pa.status = 'pending'
ORDER BY pa.created_at ASC;

-- Admin: Get all pending withdrawals
CREATE OR REPLACE VIEW admin_pending_withdrawals AS
SELECT 
  wr.id,
  wr.partner_id,
  wr.amount,
  wr.available_balance,
  wr.bank_name,
  wr.account_number,
  wr.account_holder_name,
  wr.status,
  wr.created_at,
  p.username,
  p.full_name,
  p.email,
  p.partnership_role,
  p.ctv_tier,
  p.total_commission,
  p.withdrawn_total
FROM withdrawal_requests wr
LEFT JOIN profiles p ON wr.partner_id = p.id
WHERE wr.status = 'pending'
ORDER BY wr.created_at ASC;

-- Admin: Approve withdrawal
CREATE OR REPLACE FUNCTION admin_approve_withdrawal(
  withdrawal_id_param UUID,
  admin_notes_param TEXT DEFAULT NULL,
  transaction_ref_param VARCHAR DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  withdrawal_data RECORD;
BEGIN
  -- Get withdrawal request
  SELECT * INTO withdrawal_data
  FROM withdrawal_requests
  WHERE id = withdrawal_id_param;
  
  IF withdrawal_data IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Withdrawal request not found'
    );
  END IF;
  
  IF withdrawal_data.status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Withdrawal already processed'
    );
  END IF;
  
  -- Update withdrawal request
  UPDATE withdrawal_requests
  SET 
    status = 'approved',
    approved_at = NOW(),
    admin_notes = admin_notes_param,
    transaction_reference = transaction_ref_param,
    updated_at = NOW()
  WHERE id = withdrawal_id_param;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Withdrawal approved successfully'
  );
END;
$$ LANGUAGE plpgsql;

-- Admin: Complete withdrawal (after bank transfer)
CREATE OR REPLACE FUNCTION admin_complete_withdrawal(
  withdrawal_id_param UUID,
  transaction_ref_param VARCHAR
)
RETURNS JSON AS $$
DECLARE
  withdrawal_data RECORD;
BEGIN
  -- Get withdrawal request
  SELECT * INTO withdrawal_data
  FROM withdrawal_requests
  WHERE id = withdrawal_id_param;
  
  IF withdrawal_data IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Withdrawal request not found'
    );
  END IF;
  
  IF withdrawal_data.status NOT IN ('approved', 'processing') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Withdrawal not in approved/processing status'
    );
  END IF;
  
  -- Update withdrawal request
  UPDATE withdrawal_requests
  SET 
    status = 'completed',
    completed_at = NOW(),
    transaction_reference = transaction_ref_param,
    updated_at = NOW()
  WHERE id = withdrawal_id_param;
  
  -- Update partner's withdrawn total
  UPDATE profiles
  SET withdrawn_total = withdrawn_total + withdrawal_data.amount
  WHERE id = withdrawal_data.partner_id;
  
  -- TODO: Send notification to partner
  
  RETURN json_build_object(
    'success', true,
    'message', 'Withdrawal completed successfully'
  );
END;
$$ LANGUAGE plpgsql;

-- Admin: Reject withdrawal
CREATE OR REPLACE FUNCTION admin_reject_withdrawal(
  withdrawal_id_param UUID,
  reason_param TEXT
)
RETURNS JSON AS $$
DECLARE
  withdrawal_data RECORD;
BEGIN
  -- Get withdrawal request
  SELECT * INTO withdrawal_data
  FROM withdrawal_requests
  WHERE id = withdrawal_id_param;
  
  IF withdrawal_data IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Withdrawal request not found'
    );
  END IF;
  
  IF withdrawal_data.status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Withdrawal already processed'
    );
  END IF;
  
  -- Update withdrawal request
  UPDATE withdrawal_requests
  SET 
    status = 'rejected',
    rejected_at = NOW(),
    rejection_reason = reason_param,
    updated_at = NOW()
  WHERE id = withdrawal_id_param;
  
  -- Return funds to available balance
  UPDATE profiles
  SET available_balance = available_balance + withdrawal_data.amount
  WHERE id = withdrawal_data.partner_id;
  
  -- TODO: Send notification to partner
  
  RETURN json_build_object(
    'success', true,
    'message', 'Withdrawal rejected successfully'
  );
END;
$$ LANGUAGE plpgsql;

-- Admin: Get commission stats
CREATE OR REPLACE VIEW admin_commission_stats AS
SELECT 
  DATE_TRUNC('month', cs.created_at) as month,
  p.partnership_role,
  p.ctv_tier,
  COUNT(*) as total_sales,
  SUM(cs.order_total) as total_revenue,
  SUM(cs.commission_amount) as total_commission,
  AVG(cs.commission_rate) as avg_commission_rate
FROM commission_sales cs
LEFT JOIN profiles p ON cs.partner_id = p.id
GROUP BY month, p.partnership_role, p.ctv_tier
ORDER BY month DESC, p.partnership_role;

-- Admin: Get partner performance
CREATE OR REPLACE FUNCTION admin_get_partner_performance(
  start_date_param DATE,
  end_date_param DATE
)
RETURNS TABLE(
  partner_id UUID,
  partner_name TEXT,
  partnership_role VARCHAR,
  ctv_tier INTEGER,
  total_sales BIGINT,
  total_revenue NUMERIC,
  total_commission NUMERIC,
  avg_order_value NUMERIC,
  referrals_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as partner_id,
    p.full_name as partner_name,
    p.partnership_role,
    p.ctv_tier,
    COUNT(cs.id) as total_sales,
    SUM(cs.order_total) as total_revenue,
    SUM(cs.commission_amount) as total_commission,
    AVG(cs.order_total) as avg_order_value,
    COUNT(DISTINCT ar.referred_user_id) as referrals_count
  FROM profiles p
  LEFT JOIN commission_sales cs ON p.id = cs.partner_id
    AND cs.created_at BETWEEN start_date_param AND end_date_param
  LEFT JOIN affiliate_referrals ar ON p.id = ar.affiliate_id
  WHERE p.partnership_role IS NOT NULL
  GROUP BY p.id, p.full_name, p.partnership_role, p.ctv_tier
  ORDER BY total_commission DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;
```

---

### **Admin Dashboard Tech Stack Recommendation:**

**Option 1: React Admin (Recommended)**
- Framework: React Admin (https://marmelab.com/react-admin/)
- Backend: Supabase (already have)
- Auth: Supabase Auth with admin role
- Deployment: Vercel/Netlify
- Timeline: 3-4 ngày

**Option 2: Custom Next.js Dashboard**
- Framework: Next.js 14 + shadcn/ui
- Backend: Supabase
- Timeline: 5-7 ngày

**Option 3: Supabase Studio Custom Views**
- Use: Supabase Studio SQL Editor + Custom queries
- Pro: Fastest (1 ngày)
- Con: Limited UI/UX

---

## ⏱️ IMPLEMENTATION TIMELINE

### **Phase 1: Database (1 ngày)**
- [ ] Run all SQL migrations
- [ ] Create tables: partnership_applications, withdrawal_requests
- [ ] Add columns to profiles
- [ ] Create all SQL functions (10 functions)
- [ ] Create admin views
- [ ] Test all functions

### **Phase 2: Mobile App (2 ngày)**
- [ ] Create partnershipService.js
- [ ] Update AccountScreen.js với new logic
- [ ] Create PartnershipRegistrationScreen.js
- [ ] Create WithdrawRequestScreen.js
- [ ] Create WithdrawHistoryScreen.js (bonus)
- [ ] Update navigation routes
- [ ] Test all flows

### **Phase 3: Admin Dashboard (1-2 ngày)**
- [ ] Setup React Admin project
- [ ] Create admin auth
- [ ] Build partnership applications page
- [ ] Build withdrawal requests page
- [ ] Build users management
- [ ] Build commission reports
- [ ] Deploy admin dashboard

### **Phase 4: Testing & Polish (0.5 ngày)**
- [ ] End-to-end testing
- [ ] Fix bugs
- [ ] UI polish
- [ ] Documentation

**Total: 4.5 - 5.5 ngày (24-32 giờ work)**

---

## 📋 IMPLEMENTATION CHECKLIST

### **Database Setup:**
- [ ] Create `partnership_applications` table
- [ ] Create `withdrawal_requests` table
- [ ] Add columns to `profiles` table
- [ ] Create `generate_affiliate_code()` function
- [ ] Create `check_ctv_eligibility()` function
- [ ] Create `get_user_courses()` function
- [ ] Create `submit_partnership_application()` function
- [ ] Create `get_partnership_status()` function
- [ ] Create `approve_partnership_application()` function
- [ ] Create `request_withdrawal()` function
- [ ] Create admin views and functions
- [ ] Test all functions

### **Mobile App:**
- [ ] Create `src/services/partnershipService.js`
- [ ] Update `src/screens/tabs/AccountScreen.js`
- [ ] Create `src/screens/Account/PartnershipRegistrationScreen.js`
- [ ] Create `src/screens/Account/WithdrawRequestScreen.js`
- [ ] Create `src/screens/Account/WithdrawHistoryScreen.js`
- [ ] Create `src/screens/Account/AffiliateInfoScreen.js` (info page)
- [ ] Add navigation routes
- [ ] Test all flows
- [ ] Update UI components
- [ ] Add loading states
- [ ] Add error handling

### **Admin Dashboard:**
- [ ] Setup React Admin project
- [ ] Configure Supabase connection
- [ ] Create admin authentication
- [ ] Build Partnership Applications page
- [ ] Build Withdrawal Requests page
- [ ] Build Users Management page
- [ ] Build Commission Reports page
- [ ] Build Analytics Dashboard
- [ ] Deploy to production
- [ ] Setup admin accounts

### **Integration & Testing:**
- [ ] Test affiliate registration flow
- [ ] Test CTV registration flow (with course check)
- [ ] Test approval process
- [ ] Test rejection process
- [ ] Test withdrawal request flow
- [ ] Test withdrawal approval/completion
- [ ] Test admin dashboard all features
- [ ] Test commission calculation
- [ ] Test auto tier progression
- [ ] End-to-end testing

---

## 🎯 SUCCESS CRITERIA

### **User Experience:**
✅ User không thấy mã affiliate cho đến khi được approved  
✅ CTV form tự động unlock khi đã mua khóa học  
✅ Application status rõ ràng (pending/approved/rejected)  
✅ Withdrawal flow mượt mà, thông tin đầy đủ  
✅ UI/UX chuyên nghiệp, không confusing

### **Admin Experience:**
✅ Admin dashboard đầy đủ, dễ sử dụng  
✅ Approve/reject applications trong 1 click  
✅ Process withdrawals efficiently  
✅ View all stats và reports  
✅ Filter và search works well

### **Technical:**
✅ Database schema chuẩn, optimized  
✅ SQL functions tested và working  
✅ Mobile app không crash  
✅ Admin dashboard secure (role-based access)  
✅ All APIs have proper error handling

---

## 📄 FILES CẦN TẠO

### **Database:**
1. `migration_partnership_system.sql` - All tables + functions

### **Mobile App:**
2. `src/services/partnershipService.js`
3. `src/screens/tabs/AccountScreen.js` (update)
4. `src/screens/Account/PartnershipRegistrationScreen.js`
5. `src/screens/Account/WithdrawRequestScreen.js`
6. `src/screens/Account/WithdrawHistoryScreen.js`
7. `src/screens/Account/AffiliateInfoScreen.js`

### **Admin Dashboard:**
8. Admin Dashboard repository (separate project)

---

## 🚨 CRITICAL NOTES

1. **Security:**
   - Admin dashboard PHẢI có authentication
   - Admin role check trong Supabase RLS
   - Không expose sensitive data trong APIs

2. **User Experience:**
   - Flow phải rõ ràng, không confusing
   - Feedback tốt cho mỗi action (success/error)
   - Loading states cho tất cả async operations

3. **Data Integrity:**
   - Validate tất cả inputs
   - Check balances trước khi withdraw
   - Lock funds khi withdrawal pending

4. **Testing:**
   - Test với real Shopify orders
   - Test tier progression
   - Test commission calculations
   - Test withdrawal flows

---

## 📊 EXPECTED RESULTS

### **For Users:**
- Professional registration experience
- Clear status tracking
- Easy withdrawal process
- Transparency in commissions

### **For Admin:**
- Efficient application processing
- Easy withdrawal management
- Comprehensive reporting
- Full system control

### **For Business:**
- Quality control on partners
- Reduced fraudulent applications
- Better tracking and analytics
- Scalable partnership program

---

## 🔗 DEPENDENCIES & REFERENCES

**Existing Files:**
- `BẢNG_TÍNH_COMMISSION_CHUẨN.md` - Commission rates reference
- `YEU_CAU_1_UPDATED_COMPLETE.md` - Affiliate system current state
- `SESSION_SUMMARY_25_NOV_2025.md` - Previous session context

**External:**
- Supabase project: pgfkbcnzqozzkohwbgbk
- Shopify stores: yinyangmasters.com, gemcapitalholding.com
- React Native app repo: (existing)

---

**STATUS:** 🎯 READY FOR APPROVAL  
**PRIORITY:** 🔴 CRITICAL  
**EFFORT:** 4-5 ngày (24-32 giờ)  
**DEPENDENCIES:** Supabase access, Shopify webhook setup  
**RISK LEVEL:** Medium-High (requires careful testing)

---

*Created: November 26, 2025*  
*Version: 2.0 - Complete System Redesign*
