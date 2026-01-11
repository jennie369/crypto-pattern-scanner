// =====================================================
// VIETNAMESE NLP DATA
// Slang mapping, stopwords, locations, patterns
// Dữ liệu cho xử lý ngôn ngữ tự nhiên tiếng Việt
// =====================================================

/**
 * SLANG MAPPING - Chuyển đổi slang/viết tắt → tiếng Việt chuẩn
 * Nguồn: Tổng hợp từ chat Facebook, Zalo, TikTok comments
 * Cập nhật: 27/12/2024
 */
export const SLANG_MAPPING = {
  // ========== PHỦ ĐỊNH ==========
  'ko': 'không',
  'k': 'không',
  'hem': 'không',
  'hok': 'không',
  'hông': 'không',
  'hong': 'không',
  'kh': 'không',
  'khong': 'không',
  'kg': 'không',
  'kô': 'không',

  // ========== ĐƯỢC/OK ==========
  'dc': 'được',
  'đc': 'được',
  'dk': 'được',
  'đk': 'được',
  'duoc': 'được',
  'ok': 'được',
  'okie': 'được',
  'oki': 'được',
  'okk': 'được',
  'okey': 'được',
  'oke': 'được',

  // ========== ĐẠI TỪ ==========
  'mk': 'mình',
  'mik': 'mình',
  'mh': 'mình',
  'minh': 'mình',
  't': 'tôi',
  'tui': 'tôi',
  'mn': 'mọi người',
  'mng': 'mọi người',
  'ng': 'người',
  'nyc': 'người yêu cũ',
  'ny': 'người yêu',
  'gf': 'bạn gái',
  'bf': 'bạn trai',
  'e': 'em',
  'bn': 'bạn',

  // ========== THỜI GIAN/VỊ TRÍ ==========
  'trc': 'trước',
  'trog': 'trong',
  'tg': 'thời gian',
  'lun': 'luôn',
  'luon': 'luôn',
  'r': 'rồi',
  'ròi': 'rồi',
  'rùi': 'rồi',
  'roi': 'rồi',
  'h': 'giờ',
  'gio': 'giờ',
  'bh': 'bây giờ',
  'bgio': 'bây giờ',
  'hnay': 'hôm nay',
  'hqua': 'hôm qua',

  // ========== ĐANG/SẼ/ĐÃ ==========
  'đag': 'đang',
  'dag': 'đang',
  'dg': 'đang',
  'se': 'sẽ',
  'da': 'đã',

  // ========== ĐỘNG TỪ PHỔ BIẾN ==========
  'ns': 'nói',
  'noi': 'nói',
  'bt': 'biết',
  'bít': 'biết',
  'biet': 'biết',
  'lm': 'làm',
  'lam': 'làm',
  'muon': 'muốn',
  'thik': 'thích',
  'thich': 'thích',
  'hỉu': 'hiểu',
  'hiu': 'hiểu',
  'hieu': 'hiểu',
  'nghi': 'nghĩ',
  'dung': 'đúng',

  // ========== LIÊN TỪ/PHỤ TỪ ==========
  'cx': 'cũng',
  'cg': 'cũng',
  'cug': 'cũng',
  'cung': 'cũng',
  'vs': 'với',
  'voi': 'với',
  'wa': 'quá',
  'qua': 'quá',
  'ntn': 'như thế nào',
  'j': 'gì',
  'gi': 'gì',
  'z': 'vậy',
  'zậy': 'vậy',
  'vay': 'vậy',
  'ma': 'mà',
  'thi': 'thì',
  'vi': 'vì',
  'nen': 'nên',

  // ========== TIỂU TỪ/CẢM THÁN ==========
  'ak': 'à',
  'ah': 'à',
  'uk': 'ừ',
  'uhm': 'ừ',
  'uh': 'ừ',
  'um': 'ừ',
  'nha': 'nhé',
  'nhe': 'nhé',
  'hen': 'nhé',
  'nghen': 'nhé',
  'ne': 'nè',
  'lunn': 'luôn',
  'ha': 'hả',

  // ========== CẢM ƠN/XIN LỖI ==========
  'tks': 'cảm ơn',
  'thanks': 'cảm ơn',
  'thank': 'cảm ơn',
  'thks': 'cảm ơn',
  'ty': 'cảm ơn',
  'thankiu': 'cảm ơn',
  'sr': 'xin lỗi',
  'sorry': 'xin lỗi',
  'sory': 'xin lỗi',

  // ========== CHÀO HỎI ==========
  'hi': 'xin chào',
  'hello': 'xin chào',
  'hey': 'xin chào',
  'chao': 'xin chào',
  'alo': 'xin chào',
  'helu': 'xin chào',

  // ========== E-COMMERCE ==========
  'ship': 'giao hàng',
  'sip': 'giao hàng',
  'shipp': 'giao hàng',
  'shipper': 'người giao hàng',
  'freeship': 'miễn phí giao hàng',
  'fs': 'miễn phí giao hàng',
  'cod': 'thanh toán khi nhận hàng',
  'sp': 'sản phẩm',
  'dt': 'điện thoại',
  'sdt': 'số điện thoại',
  'đt': 'điện thoại',
  'đh': 'đơn hàng',
  'kh': 'khách hàng',
  'nv': 'nhân viên',
  'ck': 'chuyển khoản',
  'stk': 'số tài khoản',
  'tk': 'tài khoản',
  'ad': 'admin',
  'admin': 'quản trị viên',
  'inbox': 'nhắn tin',
  'ib': 'nhắn tin',

  // ========== SỐ LƯỢNG ==========
  'c': 'cái',
  'cai': 'cái',
  'chiec': 'chiếc',
  'bo': 'bộ',
  'doi': 'đôi',
  'cap': 'cặp',

  // ========== TIỀN TỆ ==========
  'đ': 'đồng',
  'd': 'đồng',
  'vnd': 'đồng',
  'vnđ': 'đồng',
  'dong': 'đồng',
  'nghin': 'nghìn',
  'tr': 'triệu',
  'trieu': 'triệu',
  'củ': 'triệu',
  'cu': 'triệu',

  // ========== TRADING/CRYPTO ==========
  'btc': 'Bitcoin',
  'eth': 'Ethereum',
  'usdt': 'USDT',
  'bnb': 'BNB',
  'long': 'mua lên',
  'short': 'bán xuống',
  'sl': 'cắt lỗ',
  'tp': 'chốt lời',
  'entry': 'điểm vào',
  'pnl': 'lãi lỗ',

  // ========== SPIRITUAL ==========
  'pt': 'phong thủy',
  'menh': 'mệnh',
  'tuoi': 'tuổi',
  'que': 'quẻ',
  'boi': 'bói',
};

/**
 * STOPWORDS - Các từ không mang nghĩa, loại bỏ khi extract keywords
 */
export const STOPWORDS = new Set([
  // Liên từ
  'và', 'hoặc', 'nhưng', 'mà', 'thì', 'là', 'của', 'cho', 'với',
  'để', 'được', 'có', 'này', 'đó', 'kia', 'ấy', 'nào', 'bao',
  'như', 'thế', 'sao', 'vậy', 'rằng', 'nếu', 'khi', 'vì', 'bởi',
  'tại', 'do', 'từ', 'đến', 'trong', 'ngoài', 'trên', 'dưới',

  // Số từ/Lượng từ
  'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười',
  'các', 'những', 'mọi', 'tất', 'cả', 'đều', 'cũng', 'còn',

  // Phó từ
  'rất', 'quá', 'lắm', 'hơn', 'nhất', 'thật', 'đã', 'đang', 'sẽ',
  'rồi', 'nữa', 'vẫn', 'cứ', 'hãy', 'đừng', 'chớ',

  // Tiểu từ/Cảm thán
  'à', 'ơi', 'ạ', 'nhé', 'nha', 'hen', 'vâng', 'dạ', 'ừ', 'ờ',
  'ơ', 'ô', 'ồ', 'ui', 'ôi', 'trời',

  // Đại từ
  'em', 'anh', 'chị', 'shop', 'bạn', 'mình', 'tôi', 'ta', 'chúng',
  'họ', 'nó', 'hắn', 'cô', 'chú', 'bác', 'ông', 'bà',

  // Từ chỉ thời gian
  'hôm', 'nay', 'mai', 'ngày', 'tuần', 'tháng', 'năm',
  'sáng', 'trưa', 'chiều', 'tối', 'đêm',

  // Từ chỉ nơi chốn
  'đây', 'kia',

  // Từ hỏi
  'ai', 'gì', 'đâu', 'mấy',

  // Từ phủ định
  'không', 'chẳng', 'chả', 'chưa',

  // Từ khác
  'xin', 'vui', 'lòng', 'cảm', 'ơn', 'giúp', 'hỏi',
]);

/**
 * LOCATION ABBREVIATIONS - Viết tắt địa danh Việt Nam
 */
export const LOCATION_ABBREVIATIONS = {
  // Thành phố lớn
  'hn': 'Hà Nội',
  'hni': 'Hà Nội',
  'hanoi': 'Hà Nội',
  'hcm': 'Hồ Chí Minh',
  'sg': 'Sài Gòn',
  'saigon': 'Sài Gòn',
  'tphcm': 'Hồ Chí Minh',
  'dn': 'Đà Nẵng',
  'danang': 'Đà Nẵng',
  'hp': 'Hải Phòng',
  'ct': 'Cần Thơ',
  'cantho': 'Cần Thơ',

  // Các tỉnh/thành khác
  'bd': 'Bình Dương',
  'dl': 'Đà Lạt',
  'dalat': 'Đà Lạt',
  'nt': 'Nha Trang',
  'nhatrang': 'Nha Trang',
  'vt': 'Vũng Tàu',
  'vungtau': 'Vũng Tàu',
  'hue': 'Huế',
  'qn': 'Quảng Ninh',
  'quangninh': 'Quảng Ninh',
  'ha': 'Hội An',
  'hoian': 'Hội An',
  'hl': 'Hạ Long',
  'halong': 'Hạ Long',
  'bmt': 'Buôn Ma Thuột',
  'pq': 'Phú Quốc',
  'phuquoc': 'Phú Quốc',
  'tb': 'Thái Bình',
  'nd': 'Nam Định',
  'nb': 'Ninh Bình',
  'tn': 'Thái Nguyên',
  'vp': 'Vĩnh Phúc',
  'bg': 'Bắc Giang',
  'hd': 'Hải Dương',
  'hy': 'Hưng Yên',
  'hb': 'Hòa Bình',
  'ls': 'Lạng Sơn',
  'cb': 'Cao Bằng',
  'tq': 'Tuyên Quang',
  'lc': 'Lào Cai',
  'yn': 'Yên Bái',
  'db': 'Điện Biên',
  'hg': 'Hà Giang',
  'na': 'Nghệ An',
  'ht': 'Hà Tĩnh',
  'qb': 'Quảng Bình',
  'qt': 'Quảng Trị',
  'tth': 'Thừa Thiên Huế',
  'qnam': 'Quảng Nam',
  'qng': 'Quảng Ngãi',
  'bdi': 'Bình Định',
  'py': 'Phú Yên',
  'kh': 'Khánh Hòa',
  'gl': 'Gia Lai',
  'kontum': 'Kon Tum',
  'daklak': 'Đắk Lắk',
  'daknong': 'Đắk Nông',
  'ldo': 'Lâm Đồng',
  'bt': 'Bình Thuận',
  'bp': 'Bình Phước',
  'la': 'Long An',
  'dg': 'Đồng Nai',
  'br': 'Bà Rịa',
  'bl': 'Bến Tre',
  'vl': 'Vĩnh Long',
  'tv': 'Trà Vinh',
  'ag': 'An Giang',
  'kg': 'Kiên Giang',
  'hgi': 'Hậu Giang',
  'st': 'Sóc Trăng',
  'bl2': 'Bạc Liêu',
  'cm': 'Cà Mau',
};

/**
 * VIETNAMESE CITIES - Tên đầy đủ các thành phố lớn
 */
export const VIETNAMESE_CITIES = [
  'hà nội', 'sài gòn', 'hồ chí minh', 'đà nẵng', 'hải phòng',
  'cần thơ', 'biên hòa', 'nha trang', 'huế', 'buôn ma thuột',
  'thái nguyên', 'nam định', 'quy nhơn', 'vũng tàu', 'hạ long',
  'đà lạt', 'phan thiết', 'cà mau', 'rạch giá', 'mỹ tho',
  'long xuyên', 'phú quốc', 'hội an', 'sa pa', 'tam đảo',
];

/**
 * TYPO PATTERNS - Các lỗi chính tả thường gặp
 */
export const TYPO_PATTERNS = [
  { pattern: /\bkieem\b/gi, replacement: 'kiểm' },
  { pattern: /\btraa\b/gi, replacement: 'tra' },
  { pattern: /\bdoon\b/gi, replacement: 'đơn' },
  { pattern: /\bhaang\b/gi, replacement: 'hàng' },
  { pattern: /\bgiaa\b/gi, replacement: 'giá' },
  { pattern: /\bmuaa\b/gi, replacement: 'mua' },
  { pattern: /\bbaan\b/gi, replacement: 'bán' },
  { pattern: /\bxinchao\b/gi, replacement: 'xin chào' },
  { pattern: /\bcamon\b/gi, replacement: 'cảm ơn' },
  { pattern: /\bconhang\b/gi, replacement: 'còn hàng' },
  { pattern: /\bbaonhieu\b/gi, replacement: 'bao nhiêu' },
  { pattern: /\bkhongg\b/gi, replacement: 'không' },
  { pattern: /\bduocc\b/gi, replacement: 'được' },
  { pattern: /\broii\b/gi, replacement: 'rồi' },
  { pattern: /\bgiaohang\b/gi, replacement: 'giao hàng' },
  { pattern: /\bdathang\b/gi, replacement: 'đặt hàng' },
  { pattern: /\bgiamgia\b/gi, replacement: 'giảm giá' },
  { pattern: /\bkhuyenmai\b/gi, replacement: 'khuyến mãi' },
];

/**
 * VIETNAMESE CHARACTERS - Để detect ngôn ngữ
 */
export const VIETNAMESE_CHARS = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';

/**
 * INTENT KEYWORDS - Keywords cho việc detect intent
 * Dùng bổ sung cho intentDetector.js
 */
export const INTENT_KEYWORDS = {
  // E-commerce intents
  purchase: ['mua', 'đặt', 'order', 'lấy', 'chốt', 'muốn', 'cần', 'đặt hàng', 'mua hàng'],
  inventory: ['còn', 'hàng', 'hết', 'tồn', 'kho', 'sẵn', 'còn hàng', 'hết hàng'],
  pricing: ['giá', 'bao nhiêu', 'tiền', 'cost', 'phí', 'giá bao nhiêu', 'giá tiền'],
  shipping: ['ship', 'giao', 'vận chuyển', 'giao hàng', 'freeship', 'cod', 'bao lâu'],
  size: ['size', 'cỡ', 'cm', 'vừa', 'tay', 'lớn', 'nhỏ', 'rộng', 'chật'],

  // Spiritual intents
  spiritual: ['phong thủy', 'mệnh', 'hợp', 'ngũ hành', 'cung', 'tuổi', 'sao'],
  divination: ['gieo quẻ', 'bói', 'tarot', 'kinh dịch', 'xem', 'luận', 'quẻ'],
  crystal: ['đá', 'vòng', 'thạch anh', 'ngọc', 'mắt hổ', 'obsidian', 'crystal'],

  // Life areas
  love: ['tình', 'yêu', 'hôn nhân', 'gia đình', 'người yêu', 'vợ', 'chồng', 'crush'],
  money: ['tiền', 'tài', 'lộc', 'giàu', 'nghèo', 'thu nhập', 'lương', 'đầu tư'],
  health: ['khỏe', 'bệnh', 'sức khỏe', 'ốm', 'đau', 'thuốc', 'bác sĩ'],
  career: ['nghề', 'việc', 'công việc', 'sự nghiệp', 'thăng tiến', 'sếp'],

  // Trading intents
  trading: ['trade', 'trading', 'long', 'short', 'entry', 'tp', 'sl', 'lệnh'],
  crypto: ['btc', 'eth', 'bitcoin', 'coin', 'crypto', 'usdt', 'bnb'],
  analysis: ['phân tích', 'chart', 'đồ thị', 'tín hiệu', 'pattern', 'zone'],

  // General
  greeting: ['chào', 'hello', 'hi', 'xin chào', 'hey'],
  thanks: ['cảm ơn', 'thank', 'tks', 'thanks'],
  help: ['help', 'hỗ trợ', 'giúp', 'hướng dẫn', 'làm sao'],
  gift: ['tặng', 'gift', 'quà', 'sinh nhật', 'valentine', 'kỷ niệm'],
};

export default {
  SLANG_MAPPING,
  STOPWORDS,
  LOCATION_ABBREVIATIONS,
  VIETNAMESE_CITIES,
  TYPO_PATTERNS,
  VIETNAMESE_CHARS,
  INTENT_KEYWORDS,
};
