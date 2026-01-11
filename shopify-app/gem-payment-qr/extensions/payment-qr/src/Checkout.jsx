import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

// Bank config - Vietcombank BIN: 970436
const BANK_CONFIG = {
  bankBin: '970436',
  accountNo: '1074286868',
  accountName: 'CT TNHH GEM CAPITAL HOLDING',
  bankName: 'Vietcombank',
};

// API endpoint
const API_BASE_URL = 'https://pgfkbcnzqozzkohwbgbk.supabase.co/functions/v1';

// Deep link to return to app
const APP_DEEP_LINK = 'gem://payment-success';

// CRC16-CCITT calculation for VietQR
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// Generate VietQR EMVCo format string
function generateVietQRString(bankBin, accountNo, amount, content) {
  const f = (id, val) => id + val.length.toString().padStart(2, '0') + val;

  const guid = f('00', 'A000000727');
  const bank = f('01', f('00', bankBin) + f('01', accountNo));
  const svc = f('02', 'QRIBFTTA');
  const merchant = f('38', guid + bank + svc);
  const addl = f('62', f('08', content));

  let qr = f('00', '01') + f('01', '12') + merchant;
  qr += f('52', '0000') + f('53', '704');
  qr += f('54', amount.toString()) + f('58', 'VN') + addl + '6304';

  return qr + crc16(qr);
}

// Main extension export
export default async () => {
  render(<PaymentQR />, document.body);
};

function PaymentQR() {
  const [orderNumber, setOrderNumber] = useState('....');
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checkCount, setCheckCount] = useState(0);
  const pollingRef = useRef(null);

  // Check payment status from API
  const checkPaymentStatus = async (orderNum) => {
    if (!orderNum || orderNum === '....') return;

    try {
      console.log('[PaymentQR] Checking payment status for:', orderNum);
      const response = await fetch(`${API_BASE_URL}/payment-status?order_number=${orderNum}`);
      const result = await response.json();

      console.log('[PaymentQR] Payment status:', result);

      if (result.success && result.status === 'paid') {
        setPaymentStatus('paid');
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }

      setCheckCount(prev => prev + 1);
    } catch (error) {
      console.error('[PaymentQR] Status check error:', error);
    }
  };

  // Start polling for payment status
  const startPolling = (orderNum) => {
    if (pollingRef.current) return;
    checkPaymentStatus(orderNum);
    pollingRef.current = setInterval(() => {
      checkPaymentStatus(orderNum);
    }, 5000);
  };

  // Handle return to app
  const handleReturnToApp = () => {
    window.location.href = `${APP_DEEP_LINK}?order=${orderNumber}&status=paid`;
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const api = globalThis.shopify;
    if (!api) return;

    const fetchOrderNumber = async (orderIdentityId, confirmationNumber, amount) => {
      try {
        console.log('[PaymentQR] Fetching order number...', { orderIdentityId, confirmationNumber, amount });

        const response = await fetch(`${API_BASE_URL}/get-order-number`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIdentityId, confirmationNumber, totalAmount: amount }),
        });

        const result = await response.json();
        console.log('[PaymentQR] API response:', result);

        if (result.success && result.orderNumber) {
          setOrderNumber(result.orderNumber);
          console.log('[PaymentQR] Order number set:', result.orderNumber);
          startPolling(result.orderNumber);
        } else {
          console.log('[PaymentQR] API failed, using confirmation number:', confirmationNumber);
          setOrderNumber(confirmationNumber || '0000');
        }
      } catch (error) {
        console.error('[PaymentQR] API error:', error);
        setOrderNumber(confirmationNumber || '0000');
      } finally {
        setLoading(false);
      }
    };

    let storedOrderIdentityId = null;
    let storedConfirmationNumber = null;
    let storedAmount = 0;

    if (api.orderConfirmation) {
      api.orderConfirmation.subscribe((orderData) => {
        if (orderData) {
          console.log('[PaymentQR] OrderConfirmation data:', JSON.stringify(orderData, null, 2));
          storedOrderIdentityId = orderData.order?.id || null;
          storedConfirmationNumber = orderData.number || null;
        }
      });
    }

    if (api.cost?.totalAmount) {
      api.cost.totalAmount.subscribe((totalData) => {
        if (totalData?.amount) {
          storedAmount = parseFloat(totalData.amount);
          setTotalAmount(storedAmount);
        }
      });
    }

    setTimeout(() => {
      try {
        const orderData = api.orderConfirmation?.current || api.orderConfirmation?.value;
        if (orderData && !storedOrderIdentityId) {
          storedOrderIdentityId = orderData.order?.id || null;
          storedConfirmationNumber = orderData.number || null;
        }

        const totalData = api.cost?.totalAmount?.current || api.cost?.totalAmount?.value;
        if (totalData?.amount && storedAmount === 0) {
          storedAmount = parseFloat(totalData.amount);
          setTotalAmount(storedAmount);
        }

        console.log('[PaymentQR] Calling API with:', { storedOrderIdentityId, storedConfirmationNumber, storedAmount });
        fetchOrderNumber(storedOrderIdentityId, storedConfirmationNumber, storedAmount);
      } catch (e) {
        console.log('[PaymentQR] Error:', e);
        setLoading(false);
      }
    }, 1000);
  }, []);

  const transferContent = `DH${orderNumber}`;
  const formattedAmount = new Intl.NumberFormat('vi-VN').format(totalAmount);

  const qrContent = generateVietQRString(
    BANK_CONFIG.bankBin,
    BANK_CONFIG.accountNo,
    Math.round(totalAmount),
    transferContent
  );

  // Payment SUCCESS state
  if (paymentStatus === 'paid') {
    return (
      <s-stack gap="loose">
        <s-banner heading="THANH TOÁN THÀNH CÔNG!" tone="success">
          <s-text>Đơn hàng #{orderNumber} đã được xác nhận thanh toán.</s-text>
        </s-banner>

        <s-stack gap="tight" align="center">
          <s-text emphasis="bold">Cảm ơn bạn đã mua hàng!</s-text>
          <s-text>Tier Access hoặc khóa học của bạn đã được mở khóa.</s-text>
          <s-text>Bạn sẽ nhận được email xác nhận trong vài phút.</s-text>
        </s-stack>

        <s-divider />

        <s-stack gap="tight" align="center">
          <s-text emphasis="bold">Quay lại ứng dụng GEM để trải nghiệm:</s-text>
          <s-button kind="primary" onPress={handleReturnToApp}>
            Mở ứng dụng GEM
          </s-button>
          <s-text size="small" appearance="subdued">
            Hoặc đóng trình duyệt và mở lại ứng dụng GEM
          </s-text>
        </s-stack>
      </s-stack>
    );
  }

  // Payment PENDING state (default)
  return (
    <s-stack gap="loose">
      {/* Header Banner */}
      <s-banner heading="💳 THANH TOÁN CHUYỂN KHOẢN" tone="warning">
        <s-text>Quét mã QR bên dưới để thanh toán tự động</s-text>
      </s-banner>

      {/* QR Code Section */}
      <s-banner heading="📱 Quét mã QR để thanh toán">
        <s-stack gap="base" align="center">
          <s-qr-code content={qrContent} size="large" />
          <s-text size="small" appearance="subdued">Số tiền cần thanh toán:</s-text>
          <s-text size="large" emphasis="bold">{formattedAmount} VND</s-text>
        </s-stack>
      </s-banner>

      {/* Payment Steps */}
      <s-banner heading="📋 HƯỚNG DẪN THANH TOÁN">
        <s-stack gap="tight">
          <s-text>① Mở ứng dụng Mobile Banking của ngân hàng</s-text>
          <s-text>② Chọn "Thanh Toán" hoặc "Quét QR" và quét mã QR trên</s-text>
          <s-text>③ Xác nhận thanh toán và đợi hệ thống xử lý</s-text>
        </s-stack>
      </s-banner>

      {/* Warning */}
      <s-banner tone="critical">
        <s-text>⚠️ LƯU Ý: Không được sửa nội dung chuyển khoản! Việc thay đổi sẽ khiến giao dịch không được tự động xác nhận.</s-text>
      </s-banner>

      {/* Bank Info */}
      <s-banner heading="🏦 THÔNG TIN CHUYỂN KHOẢN THỦ CÔNG">
        <s-stack gap="extra-tight">
          <s-text size="small" appearance="subdued">(Nếu không quét được mã QR)</s-text>
          <s-text>Ngân hàng: {BANK_CONFIG.bankName}</s-text>
          <s-text>Số tài khoản: {BANK_CONFIG.accountNo}</s-text>
          <s-text>Chủ tài khoản: {BANK_CONFIG.accountName}</s-text>
          <s-text>Số tiền: {formattedAmount} VND</s-text>
          <s-text emphasis="bold">Nội dung CK: {transferContent}</s-text>
        </s-stack>
      </s-banner>

      {/* Status Banner */}
      <s-banner tone="info">
        <s-stack gap="extra-tight">
          <s-text emphasis="bold">✅ Ghi đúng nội dung chuyển khoản để được xác nhận tự động!</s-text>
          <s-text size="small">🔄 Hệ thống đang tự động kiểm tra thanh toán... (lần {checkCount})</s-text>
          <s-text size="small" appearance="subdued">Sau khi chuyển khoản, trang này sẽ tự động cập nhật trong 1-2 phút.</s-text>
        </s-stack>
      </s-banner>

      {/* Footer Note */}
      <s-stack gap="extra-tight" align="center">
        <s-text size="small" appearance="subdued">
          Nếu đã chuyển khoản xong, bạn có thể đóng trang này và quay lại ứng dụng GEM.
        </s-text>
        <s-text size="small" appearance="subdued">
          Tier Access hoặc khóa học sẽ được mở khóa tự động sau khi xác nhận thanh toán.
        </s-text>
      </s-stack>
    </s-stack>
  );
}
