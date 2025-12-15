/**
 * Gemral - Seed Content Datasets
 * Vietnamese data for generating realistic seed users, posts, and comments
 */

// ============================================
// VIETNAMESE NAMES
// ============================================

export const VIETNAMESE_LAST_NAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Trương', 'Lương', 'Mai',
  'Tô', 'Hà', 'Tăng', 'Cao', 'Đoàn', 'Lâm', 'Tạ', 'Châu', 'Thái', 'Từ',
];

export const VIETNAMESE_MIDDLE_NAMES = {
  male: ['Văn', 'Minh', 'Hoàng', 'Quốc', 'Đức', 'Hữu', 'Thanh', 'Công', 'Ngọc', 'Bảo'],
  female: ['Thị', 'Ngọc', 'Hoàng', 'Phương', 'Thanh', 'Mỹ', 'Kim', 'Thuỳ', 'Bích', 'Lan'],
};

export const VIETNAMESE_FIRST_NAMES = {
  male: [
    'Anh', 'Bảo', 'Cường', 'Dũng', 'Đạt', 'Hải', 'Hoàng', 'Hùng', 'Khang', 'Khoa',
    'Kiên', 'Long', 'Minh', 'Nam', 'Phong', 'Phúc', 'Quân', 'Sơn', 'Thắng', 'Thiên',
    'Thuận', 'Toàn', 'Trung', 'Tuấn', 'Tùng', 'Việt', 'Vương', 'Huy', 'Đức', 'Nhật',
  ],
  female: [
    'Anh', 'Chi', 'Dung', 'Giang', 'Hà', 'Hạnh', 'Hiền', 'Hoa', 'Hương', 'Lan',
    'Linh', 'Mai', 'My', 'Ngân', 'Ngọc', 'Nhung', 'Oanh', 'Phương', 'Quỳnh', 'Thảo',
    'Thu', 'Thuỳ', 'Trang', 'Trinh', 'Trúc', 'Tuyết', 'Uyên', 'Vân', 'Yến', 'Hằng',
  ],
};

// 20% Viet-English names - organized by gender for correct avatar matching
export const VIET_ENGLISH_NAMES = {
  female: [
    { first: 'Kelly', last: 'Nguyen' }, { first: 'Anna', last: 'Le' },
    { first: 'Emily', last: 'Hoang' }, { first: 'Jenny', last: 'Dang' },
    { first: 'Linda', last: 'Bui' }, { first: 'Michelle', last: 'Duong' },
    { first: 'Jessica', last: 'Dinh' }, { first: 'Nancy', last: 'Mai' },
    { first: 'Helen', last: 'Lam' }, { first: 'Amy', last: 'Chau' },
    { first: 'Sarah', last: 'Vo' }, { first: 'Lisa', last: 'Luong' },
    { first: 'Tina', last: 'Ho' }, { first: 'Cindy', last: 'Luu' },
    { first: 'Diana', last: 'Ta' }, { first: 'Grace', last: 'Dam' },
  ],
  male: [
    { first: 'Bill', last: 'Tran' }, { first: 'David', last: 'Pham' },
    { first: 'Kevin', last: 'Vu' }, { first: 'Tommy', last: 'Do' },
    { first: 'Tony', last: 'Ngo' }, { first: 'Andy', last: 'Ly' },
    { first: 'Chris', last: 'Truong' }, { first: 'Steve', last: 'Cao' },
    { first: 'Jason', last: 'Ha' }, { first: 'Peter', last: 'Thai' },
    { first: 'Mike', last: 'Vo' }, { first: 'Danny', last: 'Luong' },
    { first: 'Eric', last: 'Ho' }, { first: 'Brian', last: 'Luu' },
    { first: 'John', last: 'Ta' }, { first: 'Ryan', last: 'Dam' },
  ],
};

// ============================================
// VIETNAMESE LOCATIONS
// ============================================

export const VIETNAMESE_LOCATIONS = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Nha Trang', 'Huế', 'Đà Lạt', 'Vũng Tàu', 'Quy Nhơn',
  'Biên Hòa', 'Thủ Đức', 'Bình Dương', 'Long An', 'Bà Rịa',
  'Phú Quốc', 'Hội An', 'Sapa', 'Ninh Bình', 'Hạ Long',
];

// ============================================
// PERSONAS
// ============================================

export const PERSONAS = [
  'trader_expert',
  'spiritual_healer',
  'newbie_learner',
  'business_pro',
  'affiliate_marketer',
  'crystal_collector',
  'loa_practitioner',
  'mixed_interest',
];

export const PERSONA_DISTRIBUTION = {
  trader_expert: 0.15,
  spiritual_healer: 0.12,
  newbie_learner: 0.20,
  business_pro: 0.10,
  affiliate_marketer: 0.08,
  crystal_collector: 0.15,
  loa_practitioner: 0.12,
  mixed_interest: 0.08,
};

export const PERSONA_TOPIC_PREFERENCE = {
  trader_expert: ['trading', 'education', 'wealth'],
  spiritual_healer: ['crystal', 'loa', 'education'],
  newbie_learner: ['education', 'trading', 'loa'],
  business_pro: ['wealth', 'trading', 'affiliate'],
  affiliate_marketer: ['affiliate', 'wealth', 'education'],
  crystal_collector: ['crystal', 'loa', 'wealth'],
  loa_practitioner: ['loa', 'crystal', 'wealth'],
  mixed_interest: ['trading', 'crystal', 'loa', 'education', 'wealth'],
};

// ============================================
// BIO TEMPLATES BY PERSONA
// ============================================

export const BIO_TEMPLATES = {
  trader_expert: [
    'Trader chuyên nghiệp | {years} năm kinh nghiệm | BTC/ETH/Altcoins',
    'Full-time trader | Phân tích kỹ thuật | Price Action',
    'Crypto trader từ {year} | Chuyên swing trade | {location}',
    'Trading mentor | Đã train {count}+ học viên | Free signals',
    'Trader | Technical Analysis | Quản lý vốn chuyên nghiệp',
  ],
  spiritual_healer: [
    'Chuyên gia phong thuỷ & tâm linh | Tư vấn {location}',
    'Healer | Khai mở năng lượng | Thiền định',
    'Master Reiki | Cân bằng chakra | Hướng dẫn thiền',
    'Tư vấn tâm linh | Bói bài Tarot | Phong thuỷ',
    'Chuyên gia năng lượng | Healing crystals | {location}',
  ],
  newbie_learner: [
    'Đang học trade | Newbie cần học hỏi',
    'Mới bắt đầu với crypto | Tìm hiểu LOA',
    'Student | Yêu thích đá phong thuỷ | {location}',
    'Đang tìm hiểu về đầu tư | Newbie friendly',
    'Học viên mới | Cần mentor hướng dẫn',
  ],
  business_pro: [
    'CEO | Entrepreneur | Crypto investor',
    'Business owner | Real estate | Crypto',
    'Startup founder | Angel investor | {location}',
    'Doanh nhân | Đầu tư đa dạng | Mentor',
    'MBA | Business consultant | Crypto enthusiast',
  ],
  affiliate_marketer: [
    'Affiliate marketer | Passive income | MMO',
    'Digital marketing | Affiliate pro | {location}',
    'Make money online | Affiliate expert',
    'Marketing chuyên nghiệp | KOL | Influencer',
    'Affiliate & Dropshipping | Financial freedom',
  ],
  crystal_collector: [
    'Sưu tầm đá quý | Crystal lover | {location}',
    'Đá phong thuỷ cao cấp | Collector {years} năm',
    'Yêu đá tự nhiên | Healing crystals | Energy',
    'Crystal healer | Sưu tầm & chia sẻ',
    'Đá quý phong thuỷ | Trang sức đá | {location}',
  ],
  loa_practitioner: [
    'LOA practitioner | Manifestation | Abundance',
    'Law of Attraction | Thiền định | Tích cực',
    'Hấp dẫn sự thịnh vượng | Mindset coach',
    'LOA mentor | Giúp bạn đạt mục tiêu',
    'Positive mindset | Attract wealth | {location}',
  ],
  mixed_interest: [
    'Trade + Đá + LOA | Đam mê nhiều thứ',
    'Crypto trader | Crystal lover | {location}',
    'Đầu tư & Tâm linh | Balance life',
    'Trading + Phong thuỷ | Đa dạng sở thích',
    'Yêu thích: Crypto, Crystals, LOA',
  ],
};

// ============================================
// TOPIC WEIGHTS
// ============================================

export const TOPIC_WEIGHTS = {
  trading: 0.30,
  crystal: 0.20,
  loa: 0.20,
  education: 0.15,
  wealth: 0.10,
  affiliate: 0.05,
};

// ============================================
// POST TEMPLATES BY TOPIC
// ============================================

export const POST_TEMPLATES = {
  trading: [
    // Analysis posts
    'Phân tích {coin} trên khung {timeframe}:\n\n{analysis}\n\nMục tiêu: {target}\nStoploss: {stoploss}\n\n#trading #crypto #{coin_tag}',
    '{coin} đang test vùng {price_area}. {indicator} cho thấy {signal}.\n\nEntry tốt quanh ${entry}.\n\n#analysis #{coin_tag}',
    'Update thị trường:\n\n- BTC: {btc_status}\n- ETH: {eth_status}\n- Alts: {alts_status}\n\nChiến lược: {strategy}\n\n#crypto #trading',

    // Win/Loss posts
    'Vừa close {coin} lời +{profit}%!\n\n{emoji} Entry: ${entry}\n{emoji} Exit: ${exit}\n\nĐúng phân tích hôm trước. Keep going!\n\n#win #trading',
    '{coin} hit target! Ai vào theo được không?\n\nLời {profit}% trong {duration}.\n\n#profit #{coin_tag}',

    // Educational trading
    'Chia sẻ kinh nghiệm trade {coin}:\n\n1. {tip1}\n2. {tip2}\n3. {tip3}\n\nHy vọng giúp ích cho mọi người!\n\n#tips #trading',
    'Sai lầm phổ biến khi trade:\n\n❌ {mistake1}\n❌ {mistake2}\n❌ {mistake3}\n\nĐừng như mình ngày xưa nhé!\n\n#learning',

    // Pattern posts
    'Phát hiện {pattern} trên {coin}!\n\n{description}\n\nChờ confirm rồi vào.\n\n#pattern #{coin_tag}',
    '{coin} đang hình thành {pattern}. Nếu break {level}, target sẽ là {target}.\n\n#technicalanalysis',
  ],

  crystal: [
    // Showcase posts
    'Vừa nhập về lô {crystal} tuyệt đẹp!\n\n{description}\n\nĐá tự nhiên 100%, năng lượng siêu tốt.\n\n#crystal #{crystal_tag}',
    'Bộ sưu tập {crystal} của mình:\n\n{emoji} {item1}\n{emoji} {item2}\n{emoji} {item3}\n\nMọi người thích viên nào nhất?\n\n#collection',

    // Benefits posts
    '{crystal} - Viên đá {purpose}:\n\n{benefit1}\n{benefit2}\n{benefit3}\n\nAi đang dùng đá này?\n\n#{crystal_tag}',
    'Công dụng của {crystal}:\n\n✨ {benefit1}\n✨ {benefit2}\n✨ {benefit3}\n\nĐá phù hợp với mệnh {element}.\n\n#phongthuy',

    // Tips posts
    'Cách sạc năng lượng cho {crystal}:\n\n1. {method1}\n2. {method2}\n3. {method3}\n\nNên sạc định kỳ để đá luôn mạnh!\n\n#tips',
    'Cách nhận biết {crystal} thật - giả:\n\n{tip1}\n{tip2}\n{tip3}\n\nCẩn thận kẻo mua phải đá fake!\n\n#guide',

    // Experience posts
    'Trải nghiệm với {crystal} sau {duration}:\n\n{experience}\n\nNăng lượng thật sự khác biệt!\n\n#{crystal_tag}',
    'Review {crystal} mình mua từ Gem:\n\n{review}\n\nRất hài lòng! {rating}/5 ⭐\n\n#review',
  ],

  loa: [
    // Affirmation posts
    'Khẳng định hôm nay:\n\n"{affirmation}"\n\nRepeat sau mình nào!\n\n#loa #affirmation',
    'Morning affirmations:\n\n🌟 {aff1}\n🌟 {aff2}\n🌟 {aff3}\n\nHãy nói mỗi sáng nhé!\n\n#manifestation',

    // Success story
    'Chia sẻ chuyện manifest thành công:\n\n{story}\n\nLOA thật sự works!\n\n#success #loa',
    'Mình đã manifest được {achievement}!\n\n{process}\n\nCảm ơn vũ trụ!\n\n#manifestation',

    // Tips posts
    'Cách manifest {goal}:\n\n1. {step1}\n2. {step2}\n3. {step3}\n4. {step4}\n\nTin và hành động!\n\n#loatips',
    'Sai lầm khi thực hành LOA:\n\n❌ {mistake1}\n❌ {mistake2}\n❌ {mistake3}\n\nĐừng mắc phải nhé!\n\n#loa',

    // Gratitude posts
    'Gratitude list hôm nay:\n\n💜 {item1}\n💜 {item2}\n💜 {item3}\n\nMọi người biết ơn điều gì?\n\n#gratitude',
    'Cảm ơn vũ trụ vì:\n\n{gratitude}\n\nGratitude brings more blessings!\n\n#thankful',

    // Technique posts
    'Kỹ thuật {technique} cực hiệu quả:\n\n{description}\n\nAi đã thử chưa?\n\n#loatechnique',
  ],

  education: [
    // Course recommendation
    'Review khoá học {course_name}:\n\n{review}\n\nRất đáng học!\n\n#course #education',
    'Vừa hoàn thành khoá {course_name}!\n\n{learnings}\n\nRecommend cho ai muốn học.\n\n#learning',

    // Knowledge sharing
    'Chia sẻ kiến thức về {topic}:\n\n{content}\n\nHy vọng hữu ích!\n\n#knowledge',
    '{count} điều cần biết về {topic}:\n\n1. {point1}\n2. {point2}\n3. {point3}\n\n#tips #education',

    // Resource sharing
    'Nguồn học {topic} miễn phí:\n\n📚 {resource1}\n📚 {resource2}\n📚 {resource3}\n\nSave lại nhé!\n\n#freeresource',
    'Sách hay về {topic}:\n\n"{book_name}" - {author}\n\n{review}\n\n#bookreview',
  ],

  wealth: [
    // Mindset posts
    'Mindset về tiền bạc:\n\n"{quote}"\n\nThay đổi tư duy, thay đổi cuộc sống!\n\n#wealth #mindset',
    '{count} thói quen của người giàu:\n\n1. {habit1}\n2. {habit2}\n3. {habit3}\n\n#successhabits',

    // Investment posts
    'Đa dạng hoá đầu tư:\n\n{portfolio}\n\nĐừng bỏ hết trứng vào một giỏ!\n\n#investment',
    'Mục tiêu tài chính {year}:\n\n💰 {goal1}\n💰 {goal2}\n💰 {goal3}\n\nMọi người có target gì?\n\n#financialgoals',

    // Tips posts
    'Cách quản lý tiền hiệu quả:\n\n{tips}\n\nTiết kiệm + Đầu tư = Tự do tài chính!\n\n#moneytips',
  ],

  affiliate: [
    // Opportunity posts
    'Cơ hội kiếm thêm thu nhập:\n\n{description}\n\nAi quan tâm inbox mình nhé!\n\n#affiliate #income',
    'Tháng này kiếm được {amount} từ affiliate!\n\n{breakdown}\n\nPassive income is real!\n\n#affiliatemarketing',

    // Tips posts
    'Tips làm affiliate hiệu quả:\n\n1. {tip1}\n2. {tip2}\n3. {tip3}\n\n#affiliatetips',
    'Sai lầm khi làm affiliate:\n\n{mistakes}\n\nTránh ngay để tăng thu nhập!\n\n#tips',
  ],
};

// ============================================
// TRADING VARIABLES
// ============================================

export const TRADING_VARIABLES = {
  coins: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC', 'LINK', 'ATOM'],
  timeframes: ['1H', '4H', 'D1', 'W1', '15M', '30M'],
  indicators: ['RSI', 'MACD', 'EMA', 'Bollinger Bands', 'Volume', 'Stochastic'],
  signals: ['oversold', 'overbought', 'bullish divergence', 'bearish divergence', 'golden cross', 'death cross'],
  patterns: ['Double Bottom', 'Head & Shoulders', 'Triangle', 'Wedge', 'Flag', 'Cup & Handle', 'Ascending Channel'],
  analysis: [
    'Đang accumulate trong range này',
    'Có dấu hiệu breakout',
    'Whale đang gom hàng',
    'Volume tăng đáng kể',
    'Tín hiệu tích cực từ on-chain',
  ],
  strategies: ['DCA vào vùng này', 'Chờ confirmation', 'Scalp ngắn hạn', 'Swing trade medium term'],
  btc_status: ['Sideway quanh $X', 'Test resistance $X', 'Đang uptrend', 'Chờ fed meeting'],
  eth_status: ['Follow BTC', 'Mạnh hơn BTC', 'Accumulation zone', 'Breakout pending'],
  alts_status: ['Đang chờ BTC', 'Một số alt đang pump', 'Risk cao', 'Selective trading'],
  mistakes: [
    'FOMO vào đỉnh', 'Không set stoploss', 'All-in một coin',
    'Trade khi tâm lý không ổn', 'Không có kế hoạch',
  ],
  tips: [
    'Luôn set stoploss', 'Quản lý vốn nghiêm ngặt', 'Đừng FOMO',
    'Học phân tích kỹ thuật', 'Kiên nhẫn chờ setup',
  ],
};

// ============================================
// CRYSTAL VARIABLES
// ============================================

export const CRYSTAL_VARIABLES = {
  crystals: [
    'Thạch Anh Tím (Amethyst)', 'Thạch Anh Hồng (Rose Quartz)', 'Thạch Anh Trắng (Clear Quartz)',
    'Citrine', 'Tiger Eye', 'Black Tourmaline', 'Obsidian', 'Labradorite',
    'Moonstone', 'Lapis Lazuli', 'Malachite', 'Jade', 'Carnelian',
    'Fluorite', 'Selenite', 'Pyrite', 'Amazonite', 'Rhodonite',
  ],
  purposes: [
    'thu hút tài lộc', 'bảo vệ năng lượng', 'tăng trực giác',
    'cân bằng cảm xúc', 'giải stress', 'tăng tình yêu',
    'tăng sự tự tin', 'thanh lọc không gian', 'tăng sức khoẻ',
  ],
  benefits: [
    'Giúp ngủ ngon hơn', 'Tăng cường trí nhớ', 'Bảo vệ khỏi năng lượng xấu',
    'Thu hút may mắn', 'Cân bằng chakra', 'Giảm lo âu',
    'Tăng tập trung', 'Mang lại bình an', 'Thúc đẩy sáng tạo',
  ],
  elements: ['Kim', 'Mộc', 'Thuỷ', 'Hoả', 'Thổ'],
  cleansing_methods: [
    'Để dưới ánh trăng qua đêm', 'Rửa dưới nước chảy',
    'Đặt trên cụm Thạch Anh', 'Xông khói sage',
    'Chôn xuống đất 24h', 'Để dưới nắng sớm',
  ],
  ratings: ['5', '4.5', '4.8', '5', '4.9'],
};

// ============================================
// LOA VARIABLES
// ============================================

export const LOA_VARIABLES = {
  affirmations: [
    'Tôi xứng đáng được giàu có và thịnh vượng',
    'Tiền bạc đến với tôi dễ dàng và dồi dào',
    'Tôi thu hút mọi điều tốt đẹp vào cuộc sống',
    'Mỗi ngày tôi đều thành công hơn',
    'Tôi biết ơn tất cả những gì tôi có',
    'Vũ trụ đang hỗ trợ tôi đạt mục tiêu',
    'Tôi là nam châm thu hút sự thịnh vượng',
    'Mọi thứ đều xảy ra đúng thời điểm',
    'Tôi tin tưởng vào hành trình của mình',
    'Sức khoẻ và hạnh phúc đến với tôi',
  ],
  techniques: [
    '369 Method', 'Scripting', 'Vision Board',
    'Gratitude Journal', 'Meditation', 'Visualization',
    'Affirmation', 'Acting As If', 'Letting Go',
  ],
  goals: [
    'công việc mơ ước', 'sức khoẻ tốt', 'mối quan hệ lý tưởng',
    'tài chính tự do', 'nhà mới', 'xe mới', 'chuyến du lịch',
  ],
  achievements: [
    'công việc lương cao', 'mối quan hệ hạnh phúc',
    'sức khoẻ tốt hơn', 'thu nhập tăng gấp đôi',
    'tìm được soulmate', 'mua được nhà', 'được thăng chức',
  ],
  mistakes: [
    'Không tin tưởng vũ trụ', 'Thiếu kiên nhẫn',
    'Chỉ nghĩ mà không hành động', 'Tập trung vào thiếu thốn',
    'Không biết ơn những gì đang có',
  ],
};

// ============================================
// COMMENT TEMPLATES
// ============================================

export const COMMENT_TEMPLATES = {
  positive: [
    'Hay quá! {emoji}', 'Cảm ơn bạn đã chia sẻ!', 'Bài viết rất hữu ích {emoji}',
    'Đúng luôn!', 'Quá đỉnh! {emoji}', 'Học hỏi được nhiều quá',
    'Thanks bạn nhiều!', 'Tuyệt vời! {emoji}', 'Rất hay!',
    'Bạn viết hay quá!', 'Đồng ý với bạn!', 'Chính xác!',
    'Chia sẻ quá giá trị!', 'Saved lại rồi!', 'Bookmark ngay!',
  ],
  questions: [
    'Bạn ơi cho mình hỏi {question}?', 'Làm sao để {action} vậy bạn?',
    '{topic} này có khó không bạn?', 'Mình mới bắt đầu, bạn có tips gì không?',
    'Bạn có thể giải thích thêm về {point} được không?',
    'Nên bắt đầu từ đâu bạn?', 'Có cần kinh nghiệm gì không?',
  ],
  sharing: [
    'Mình cũng đang {action}!', 'Giống mình quá!', 'Mình cũng nghĩ vậy!',
    'Trước mình cũng {past_action}', 'Mình có trải nghiệm tương tự',
    'Đúng rồi, mình cũng thấy {observation}',
  ],
  agreement: [
    'Đồng ý 100%!', 'Chuẩn luôn!', 'Exactly!', 'True!', 'Facts!',
    'Không thể đồng ý hơn!', 'Rất đúng!', 'Chính xác những gì mình nghĩ!',
  ],
  emoji_only: [
    '{emoji}{emoji}{emoji}', '{emoji}{emoji}', '{emoji}',
  ],
};

export const COMMENT_EMOJIS = [
  '🔥', '💯', '👍', '❤️', '🙏', '✨', '💪', '👏', '🎯', '💎',
  '🚀', '⭐', '💰', '🌟', '😍', '🤩', '💜', '💙', '🧿', '🔮',
];

export const COMMENT_TYPE_DISTRIBUTION = {
  positive: 0.40,
  questions: 0.25,
  sharing: 0.20,
  agreement: 0.10,
  emoji_only: 0.05,
};

// ============================================
// REPLY TEMPLATES
// ============================================

export const REPLY_TEMPLATES = {
  to_question: [
    'Bạn có thể {suggestion}!', 'Theo mình thì {answer}',
    'Mình recommend {recommendation}', 'Thử {action} xem!',
    'Cái này thì {explanation}', 'Mình giải thích nhé: {explanation}',
  ],
  to_positive: [
    'Cảm ơn bạn! {emoji}', 'Thanks bạn nha!', 'Glad to help!',
    'Vui vì bạn thấy hữu ích!', '{emoji} Thank you!',
  ],
  to_sharing: [
    'Hay quá bạn!', 'Chia sẻ thêm đi bạn!', 'Thú vị đó!',
    'Mình cũng vậy nè!', 'Great sharing!',
  ],
  general: [
    '{emoji}', 'Thanks!', 'Noted!', '👍', 'Cảm ơn!',
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

export const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomFloat = (min, max, decimals = 2) => {
  const num = Math.random() * (max - min) + min;
  return Number(num.toFixed(decimals));
};

export const fillTemplate = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
};

export const generateVietnameseName = (gender = null) => {
  // Determine gender FIRST - this will be used for avatar selection
  const g = gender || (Math.random() > 0.5 ? 'male' : 'female');

  // 20% chance for Viet-English name - use gender-specific list
  if (Math.random() < 0.2) {
    const vietEnglish = getRandomItem(VIET_ENGLISH_NAMES[g]);
    return {
      fullName: `${vietEnglish.first} ${vietEnglish.last}`,
      gender: g,
      isVietEnglish: true,
    };
  }

  const lastName = getRandomItem(VIETNAMESE_LAST_NAMES);
  const middleName = getRandomItem(VIETNAMESE_MIDDLE_NAMES[g]);
  const firstName = getRandomItem(VIETNAMESE_FIRST_NAMES[g]);

  return {
    fullName: `${lastName} ${middleName} ${firstName}`,
    gender: g,
    isVietEnglish: false,
  };
};

export const generateBio = (persona, isPremium = false) => {
  const templates = BIO_TEMPLATES[persona] || BIO_TEMPLATES.mixed_interest;
  let bio = getRandomItem(templates);

  // Fill variables
  bio = bio.replace('{years}', String(getRandomNumber(2, 10)));
  bio = bio.replace('{year}', String(getRandomNumber(2017, 2023)));
  bio = bio.replace('{location}', getRandomItem(VIETNAMESE_LOCATIONS));
  bio = bio.replace('{count}', String(getRandomNumber(50, 500)));

  if (isPremium) {
    bio += ' | Premium member';
  }

  return bio;
};

export const getPersonaByDistribution = () => {
  const rand = Math.random();
  let cumulative = 0;

  for (const [persona, weight] of Object.entries(PERSONA_DISTRIBUTION)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return persona;
    }
  }

  return 'mixed_interest';
};

export const getTopicByDistribution = (persona = null) => {
  if (persona && PERSONA_TOPIC_PREFERENCE[persona]) {
    // 70% chance to pick from preferred topics
    if (Math.random() < 0.7) {
      return getRandomItem(PERSONA_TOPIC_PREFERENCE[persona]);
    }
  }

  const rand = Math.random();
  let cumulative = 0;

  for (const [topic, weight] of Object.entries(TOPIC_WEIGHTS)) {
    cumulative += weight;
    if (rand <= cumulative) {
      return topic;
    }
  }

  return 'trading';
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  VIETNAMESE_LAST_NAMES,
  VIETNAMESE_MIDDLE_NAMES,
  VIETNAMESE_FIRST_NAMES,
  VIET_ENGLISH_NAMES,
  VIETNAMESE_LOCATIONS,
  PERSONAS,
  PERSONA_DISTRIBUTION,
  PERSONA_TOPIC_PREFERENCE,
  BIO_TEMPLATES,
  TOPIC_WEIGHTS,
  POST_TEMPLATES,
  TRADING_VARIABLES,
  CRYSTAL_VARIABLES,
  LOA_VARIABLES,
  COMMENT_TEMPLATES,
  COMMENT_EMOJIS,
  COMMENT_TYPE_DISTRIBUTION,
  REPLY_TEMPLATES,
  getRandomItem,
  getRandomItems,
  getRandomNumber,
  getRandomFloat,
  fillTemplate,
  generateVietnameseName,
  generateBio,
  getPersonaByDistribution,
  getTopicByDistribution,
};
