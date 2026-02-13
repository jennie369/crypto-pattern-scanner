/**
 * Gemral Help Center - Articles Data
 * Mock data cho Help Center với 5 categories và 5 articles
 */

// ═══════════════════════════════════════════════════════════
// HELP CATEGORIES
// ═══════════════════════════════════════════════════════════
export const HELP_CATEGORIES = [
  {
    id: 'gems',
    name: 'Gems & Tài Sản',
    icon: 'Diamond',
    color: '#00F0FF',
    description: 'Tìm hiểu về Gems - tiền tệ của Gemral',
    articleCount: 1,
  },
  {
    id: 'earnings',
    name: 'Thu Nhập',
    icon: 'DollarSign',
    color: '#3AF7A6',
    description: 'Các cách kiếm tiền trên Gemral',
    articleCount: 1,
  },
  {
    id: 'boost',
    name: 'Boost & Quảng Bá',
    icon: 'Rocket',
    color: '#FFBD59',
    description: 'Tăng reach cho bài viết của bạn',
    articleCount: 1,
  },
  {
    id: 'affiliate',
    name: 'Affiliate Marketing',
    icon: 'Link',
    color: '#6A5BFF',
    description: 'Kiếm hoa hồng từ affiliate',
    articleCount: 1,
  },
  {
    id: 'dashboard',
    name: 'Dashboard & Widgets',
    icon: 'LayoutDashboard',
    color: '#FF6B6B',
    description: 'Theo dõi metrics quan trọng',
    articleCount: 1,
  },
];

// ═══════════════════════════════════════════════════════════
// HELP ARTICLES
// ═══════════════════════════════════════════════════════════
export const HELP_ARTICLES = {
  // ────────────────────────────────────────────────────────
  // GEMS ARTICLE
  // ────────────────────────────────────────────────────────
  'gems-huong-dan-day-du': {
    id: 'gems-huong-dan-day-du',
    title: 'Gems - Hướng Dẫn Đầy Đủ',
    slug: 'gems-huong-dan-day-du',
    categoryId: 'gems',
    excerpt: 'Tất cả những gì bạn cần biết về Gems - tiền tệ của Gemral. Từ cách kiếm, cách dùng, đến các mẹo tối ưu hóa.',
    metadata: {
      readTime: '10 phút',
      difficulty: 'Dễ',
      views: 0,
      helpful: 0,
      lastUpdated: '2024-11-28',
    },
    content: {
      blocks: [
        {
          type: 'heading',
          level: 1,
          content: 'Gems Là Gì?',
        },
        {
          type: 'paragraph',
          content: 'Gems là tiền tệ nội bộ của Gemral - nền tảng kết hợp giao dịch và tâm linh. Không giống các mạng xã hội khác chỉ có "likes" vô nghĩa, Gems có giá trị thực sự:\n\n• 1 Gem = 1.000 VNĐ (cố định)\n• Có thể quy đổi thành tiền thật\n• Dùng để tip creators, mua services',
        },
        {
          type: 'callout',
          style: 'info',
          title: 'Tại sao dùng Gems thay vì tiền thật?',
          content: '• Thanh toán nhanh gọn, không cần nhập thẻ mỗi lần\n• Tích lũy từ nhiều nguồn nhỏ (tips, rewards)\n• Gamification: Cảm giác "earn" thú vị hơn\n• Tránh phí giao dịch nhỏ lẻ',
        },
        {
          type: 'heading',
          level: 2,
          content: 'Cách Kiếm Gems',
        },
        {
          type: 'table',
          title: 'Tất cả cách kiếm Gems',
          headers: ['Cách kiếm', 'Số Gems', 'Tần suất', 'Ghi chú'],
          rows: [
            ['Daily Check-in', '5-50 Gems', 'Mỗi ngày', 'Streak 7 ngày = bonus 100 Gems'],
            ['Post hay (viral)', '10-100+ Gems', 'Khi đạt milestones', '100 likes = 10 Gems'],
            ['Nhận tip từ followers', 'Tùy người gửi', 'Bất cứ lúc nào', 'Bạn nhận 90%, Gemral 10%'],
            ['Hoàn thành tasks', '20-200 Gems', 'Theo event', 'Các challenges, quests'],
            ['Referral', '500 Gems', 'Khi bạn mới upgrade TIER', 'Một lần/người'],
            ['Trading rewards', '50-500 Gems', 'Hàng tuần', 'Top traders tuần'],
            ['Mua Gems', 'Tùy gói', 'Bất cứ lúc nào', 'Bonus khi mua gói lớn'],
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Cách Sử Dụng Gems',
        },
        {
          type: 'list',
          title: 'Dùng Gems làm gì?',
          items: [
            'Tip creators yêu thích (tối thiểu 10 Gems)',
            'Boost bài viết lên Trending (từ 100 Gems)',
            'Mua khóa học trên Gemral Academy',
            'Đăng ký TIER (upgrade tài khoản)',
            'Mua sản phẩm trên Shop (nếu seller chấp nhận)',
            'Tham gia events đặc biệt',
            'Quy đổi ra tiền thật (tối thiểu 500 Gems)',
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Cách Mua Gems',
        },
        {
          type: 'steps',
          items: [
            {
              number: 1,
              title: 'Vào trang Gems',
              description: 'Từ màn hình chính, nhấn vào icon Gems ở header hoặc vào Tài Sản → Gems',
            },
            {
              number: 2,
              title: 'Chọn gói muốn mua',
              description: 'Xem các gói có sẵn, so sánh bonus để chọn gói phù hợp',
              tips: ['Gói 500K trở lên có bonus 10%', 'Gói 1 triệu bonus 15%'],
            },
            {
              number: 3,
              title: 'Thanh toán',
              description: 'Hỗ trợ: Momo, ZaloPay, Banking, Thẻ Visa/Mastercard',
            },
            {
              number: 4,
              title: 'Nhận Gems',
              description: 'Gems được cộng ngay vào tài khoản sau khi thanh toán thành công',
            },
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Rút Gems Ra Tiền Thật',
        },
        {
          type: 'callout',
          style: 'warning',
          title: 'Điều kiện rút tiền',
          content: '• Tối thiểu 500 Gems (500.000đ)\n• Tài khoản đã verify CMND/CCCD\n• Không có vi phạm pending\n• Có thông tin ngân hàng/ví điện tử',
        },
        {
          type: 'steps',
          items: [
            {
              number: 1,
              title: 'Vào Tài Sản → Rút tiền',
              description: 'Hoặc: Gems → Rút về ví',
            },
            {
              number: 2,
              title: 'Chọn phương thức',
              description: 'Ngân hàng (0% phí, 1-3 ngày) hoặc Momo/ZaloPay (0% phí, 24h)',
            },
            {
              number: 3,
              title: 'Nhập số Gems muốn rút',
              description: 'Tối thiểu 500 Gems. Hệ thống tự tính số tiền nhận được',
            },
            {
              number: 4,
              title: 'Xác nhận OTP',
              description: 'Nhập mã OTP gửi về email/SMS',
            },
            {
              number: 5,
              title: 'Chờ xử lý',
              description: 'Ngân hàng: 1-3 ngày làm việc. Ví điện tử: Trong 24h',
            },
          ],
        },
        {
          type: 'faq',
          items: [
            {
              question: 'Gems có hết hạn không?',
              answer: 'KHÔNG! Gems không bao giờ hết hạn. Bạn có thể giữ Gems bao lâu tùy thích.',
            },
            {
              question: 'Có thể chuyển Gems cho người khác không?',
              answer: 'CÓ! Bạn có thể tip (tặng) Gems cho bất kỳ user nào. Vào profile họ → Tip → Nhập số Gems.',
            },
            {
              question: 'Gems có bị mất khi đổi thiết bị không?',
              answer: 'KHÔNG! Gems được lưu trên tài khoản của bạn, không phải trên thiết bị. Đăng nhập tài khoản ở bất cứ đâu đều thấy Gems.',
            },
            {
              question: 'Tại sao tôi không rút được tiền?',
              answer: 'Kiểm tra: Đã verify CMND/CCCD chưa? Số Gems có đủ 500 không? Có vi phạm pending không? Thông tin ngân hàng đúng chưa?',
            },
            {
              question: 'Mua Gems có hoàn tiền được không?',
              answer: 'KHÔNG. Gems đã mua không thể hoàn tiền. Hãy cân nhắc kỹ trước khi mua.',
            },
          ],
        },
        {
          type: 'related_articles',
          articles: [
            {
              title: 'Cách Boost Bài Viết Hiệu Quả',
              slug: 'boost-bai-viet-huong-dan',
            },
            {
              title: 'Thu Nhập Trên Gemral',
              slug: 'thu-nhap-tong-hop',
            },
          ],
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // THU NHẬP ARTICLE
  // ────────────────────────────────────────────────────────
  'thu-nhap-tong-hop': {
    id: 'thu-nhap-tong-hop',
    title: 'Thu Nhập Trên Gemral - Tổng Hợp Tất Cả Cách Kiếm Tiền',
    slug: 'thu-nhap-tong-hop',
    categoryId: 'earnings',
    excerpt: 'Hướng dẫn chi tiết tất cả các cách kiếm tiền trên Gemral: từ tips, affiliate, đến bán khóa học. Kèm ví dụ thu nhập thực tế.',
    metadata: {
      readTime: '12 phút',
      difficulty: 'Trung bình',
      views: 0,
      helpful: 0,
      lastUpdated: '2024-11-28',
    },
    content: {
      blocks: [
        {
          type: 'heading',
          level: 1,
          content: 'Tổng Quan Thu Nhập Trên Gemral',
        },
        {
          type: 'paragraph',
          content: 'Gemral không chỉ là nơi học trading và kết nối cộng đồng - đây còn là nền tảng giúp bạn KIẾM TIỀN THẬT từ nội dung và expertise của mình.',
        },
        {
          type: 'table',
          title: 'So sánh các nguồn thu',
          headers: ['Nguồn thu', 'Thu nhập tiềm năng', 'Độ khó', 'Phù hợp với'],
          rows: [
            ['Tips từ followers', '500K - 5M/tháng', 'Dễ', 'Ai cũng có thể bắt đầu'],
            ['Affiliate Marketing', '2M - 20M/tháng', 'Trung bình', 'Có audience, biết marketing'],
            ['Bán khóa học', '5M - 50M+/tháng', 'Khó', 'Experts, có knowledge'],
            ['Brand Partnerships', '5M - 100M+/deal', 'Khó', 'KOLs, có following lớn'],
            ['Referral Program', '500K - 2M/tháng', 'Dễ', 'Có network, active community'],
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Nhận Tips Từ Followers',
        },
        {
          type: 'paragraph',
          content: 'Cách đơn giản nhất để bắt đầu kiếm tiền. Khi bạn tạo nội dung hay, followers có thể gửi Gems cho bạn như lời cảm ơn.',
        },
        {
          type: 'callout',
          style: 'success',
          title: 'Ví dụ thực tế',
          content: '• Trader chia sẻ setup hay → Nhận 50-200 Gems/bài\n• Review đá crystal chi tiết → 100-500 Gems\n• Giải đáp thắc mắc trong comments → 20-50 Gems',
        },
        {
          type: 'list',
          title: 'Cách tăng tips:',
          items: [
            'Tạo nội dung có giá trị thực sự',
            'Chia sẻ kiến thức độc quyền',
            'Tương tác nhiều với followers',
            'Cảm ơn người đã tip (public shoutout)',
            'Tạo exclusive content cho top tippers',
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Affiliate Marketing',
        },
        {
          type: 'paragraph',
          content: 'Kiếm hoa hồng khi giới thiệu sản phẩm trên Gemral Shop hoặc từ partners. Đây là nguồn thu nhập thụ động - link của bạn tiếp tục kiếm tiền ngay cả khi bạn ngủ!',
        },
        {
          type: 'table',
          title: 'Tỷ lệ hoa hồng',
          headers: ['Danh mục', 'Tỷ lệ HH', 'Ví dụ'],
          rows: [
            ['YinYangMasters - Đá phong thủy', '10-20%', 'Đá 500K → HH 50-100K'],
            ['Gemral Academy - Khóa học', '30%', 'Khóa 990K → HH 297K'],
            ['Partner - Thời trang', '5-10%', 'Áo 299K → HH 15-30K'],
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Referral Program',
        },
        {
          type: 'paragraph',
          content: 'Mời bạn bè tham gia Gemral và nhận thưởng khi họ upgrade TIER. Hệ thống 4 cấp với thu nhập từ cả team của bạn.',
        },
        {
          type: 'table',
          title: 'Commission structure',
          headers: ['Cấp', 'Commission', 'Ví dụ (F1 mua TIER 2)'],
          rows: [
            ['Cấp 1 (F1)', '50%', '10.5M VND'],
            ['Cấp 2 (F2)', '25%', '5.25M VND'],
            ['Cấp 3 (F3)', '15%', '3.15M VND'],
            ['Cấp 4 (F4)', '10%', '2.1M VND'],
          ],
        },
        {
          type: 'faq',
          items: [
            {
              question: 'Cần bao nhiêu followers để bắt đầu kiếm tiền?',
              answer: 'Không cần số lượng cụ thể! Với tips, bạn có thể nhận ngay từ follower đầu tiên. Với affiliate, cần 100+ followers để đăng ký.',
            },
            {
              question: 'Thu nhập có bị đánh thuế không?',
              answer: 'CÓ. Thu nhập từ Gemral là thu nhập cá nhân, bạn có trách nhiệm khai thuế theo quy định. Gemral không khấu trừ thuế thay bạn.',
            },
            {
              question: 'Tôi có thể làm nhiều nguồn thu cùng lúc không?',
              answer: 'CHẮC CHẮN! Các nguồn thu không loại trừ nhau. Bạn có thể vừa nhận tips, vừa làm affiliate, vừa có referral.',
            },
          ],
        },
        {
          type: 'related_articles',
          articles: [
            {
              title: 'Affiliate Marketing Chi Tiết',
              slug: 'affiliate-marketing-huong-dan-chi-tiet',
            },
            {
              title: 'Gems - Hướng Dẫn Đầy Đủ',
              slug: 'gems-huong-dan-day-du',
            },
          ],
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // BOOST ARTICLE
  // ────────────────────────────────────────────────────────
  'boost-bai-viet-huong-dan': {
    id: 'boost-bai-viet-huong-dan',
    title: 'Boost Bài Viết - Tăng Reach Lên Gấp 10 Lần',
    slug: 'boost-bai-viet-huong-dan',
    categoryId: 'boost',
    excerpt: 'Hướng dẫn chi tiết cách boost bài viết trên Gemral: chọn bài nào để boost, cài đặt targeting, tối ưu ngân sách.',
    metadata: {
      readTime: '8 phút',
      difficulty: 'Trung bình',
      views: 0,
      helpful: 0,
      lastUpdated: '2024-11-28',
    },
    content: {
      blocks: [
        {
          type: 'heading',
          level: 1,
          content: 'Boost Là Gì?',
        },
        {
          type: 'paragraph',
          content: 'Boost là tính năng trả phí để tăng reach (số người xem) cho bài viết của bạn. Thay vì chờ organic reach, Boost đẩy bài viết đến đúng đối tượng bạn muốn.',
        },
        {
          type: 'callout',
          style: 'info',
          title: 'Khi nào nên Boost?',
          content: '• Bài viết hay nhưng chưa viral\n• Muốn quảng bá sản phẩm/dịch vụ\n• Xây dựng personal brand\n• Event sắp diễn ra\n• Bài viết quan trọng cần nhiều người thấy',
        },
        {
          type: 'heading',
          level: 2,
          content: 'Cách Boost Bài Viết',
        },
        {
          type: 'steps',
          items: [
            {
              number: 1,
              title: 'Chọn bài viết muốn boost',
              description: 'Vào profile → Chọn bài viết → Nhấn icon "Boost" (biểu tượng rocket)',
              tips: ['Chọn bài đã có engagement tốt', 'Nội dung phải tuân thủ Community Guidelines'],
            },
            {
              number: 2,
              title: 'Cài đặt mục tiêu',
              description: 'Chọn mục tiêu:\n• Reach: Càng nhiều người xem càng tốt\n• Engagement: Tập trung vào likes, comments\n• Followers: Thu hút người theo dõi mới',
            },
            {
              number: 3,
              title: 'Chọn đối tượng (Targeting)',
              description: 'Ai sẽ thấy bài viết của bạn?\n• Tất cả (Recommended)\n• Custom: Chọn theo sở thích, vị trí, độ tuổi',
            },
            {
              number: 4,
              title: 'Đặt ngân sách',
              description: 'Chọn số Gems muốn chi:\n• 100 Gems: ~500 reach\n• 500 Gems: ~3,000 reach\n• 1,000 Gems: ~7,000 reach',
            },
            {
              number: 5,
              title: 'Xác nhận và thanh toán',
              description: 'Review lại cài đặt → Nhấn "Boost ngay" → Gems được trừ',
            },
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Chi Phí Boost',
        },
        {
          type: 'table',
          title: 'Bảng giá Boost',
          headers: ['Gói', 'Gems', 'Reach dự kiến', 'Giá VND'],
          rows: [
            ['Basic', '100', '500-1,000', '100,000đ'],
            ['Standard', '500', '2,500-5,000', '500,000đ'],
            ['Pro', '1,000', '5,000-10,000', '1,000,000đ'],
            ['Premium', '2,500', '15,000-25,000', '2,500,000đ'],
            ['Custom', 'Tùy chọn', 'Tùy ngân sách', 'Tùy chọn'],
          ],
        },
        {
          type: 'callout',
          style: 'success',
          title: 'Tips tối ưu ngân sách',
          content: '• Bắt đầu nhỏ (100-200 Gems) để test\n• Boost bài đã có engagement cao\n• Chọn thời điểm peak hours (19h-22h)\n• Target đúng đối tượng',
        },
        {
          type: 'faq',
          items: [
            {
              question: 'Boost có hoàn tiền không?',
              answer: 'KHÔNG. Gems đã dùng để boost không thể hoàn lại. Hãy cân nhắc kỹ trước khi boost.',
            },
            {
              question: 'Bài boost có được đánh dấu quảng cáo không?',
              answer: 'CÓ. Bài boost sẽ có nhãn "Được tài trợ" nhỏ để tuân thủ quy định minh bạch.',
            },
            {
              question: 'Tôi có thể dừng boost giữa chừng không?',
              answer: 'CÓ, nhưng Gems đã chi sẽ không được hoàn lại. Chỉ phần còn lại mới được trả.',
            },
          ],
        },
        {
          type: 'related_articles',
          articles: [
            {
              title: 'Gems - Hướng Dẫn Đầy Đủ',
              slug: 'gems-huong-dan-day-du',
            },
            {
              title: 'Thu Nhập Trên Gemral',
              slug: 'thu-nhap-tong-hop',
            },
          ],
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // AFFILIATE ARTICLE
  // ────────────────────────────────────────────────────────
  'affiliate-marketing-huong-dan-chi-tiet': {
    id: 'affiliate-marketing-huong-dan-chi-tiet',
    title: 'Affiliate Marketing - Kiếm Hoa Hồng Từ Sản Phẩm Yêu Thích',
    slug: 'affiliate-marketing-huong-dan-chi-tiet',
    categoryId: 'affiliate',
    excerpt: 'Hướng dẫn từ A-Z về Affiliate trên Gemral: Cách đăng ký, tạo link, tracking đơn hàng, và nhận hoa hồng.',
    metadata: {
      readTime: '15 phút',
      difficulty: 'Trung bình',
      views: 0,
      helpful: 0,
      lastUpdated: '2024-11-28',
    },
    content: {
      blocks: [
        {
          type: 'heading',
          level: 1,
          content: 'Affiliate Marketing Trên Gemral Là Gì?',
        },
        {
          type: 'paragraph',
          content: 'Affiliate (Tiếp thị liên kết) là hình thức bạn kiếm hoa hồng khi giới thiệu sản phẩm. Đơn giản:\n\n1. Bạn chọn sản phẩm từ YinYangMasters, Gemral Academy, hoặc partners\n2. Tạo link tracking đặc biệt của riêng bạn\n3. Chia sẻ link trên mạng xã hội, bài viết\n4. Ai mua qua link của bạn → Bạn nhận hoa hồng',
        },
        {
          type: 'heading',
          level: 2,
          content: 'Tỷ Lệ Hoa Hồng',
        },
        {
          type: 'table',
          headers: ['Danh mục', 'Tỷ lệ HH', 'Ví dụ sản phẩm', 'Ví dụ HH'],
          rows: [
            ['YinYangMasters - Đá phong thủy', '10-20%', 'Đá thạch anh 500K', '50K - 100K'],
            ['YinYangMasters - Vòng tay', '15-25%', 'Vòng tay Tỳ Hưu 800K', '120K - 200K'],
            ['Gemral Academy - Khóa học', '30%', 'Khóa crypto 990K', '297K'],
            ['Partner - Thời trang', '5-10%', 'Áo thun 299K', '15K - 30K'],
            ['Partner - Mỹ phẩm', '8-15%', 'Serum 450K', '36K - 68K'],
            ['Partner - Sách', '10-20%', 'Sách self-help 150K', '15K - 30K'],
          ],
        },
        {
          type: 'callout',
          style: 'success',
          title: 'Thu nhập tiềm năng',
          content: 'Ví dụ thực tế:\n\nTháng 1: 5 đơn đá × 500K × 15% = 375K\nTháng 3: 20 đơn đá × 500K × 15% = 1,500K\nTháng 6: 50 đơn = 3,750K + 30 khóa học = 8,910K = Tổng 12,660,000đ',
        },
        {
          type: 'heading',
          level: 2,
          content: 'Cách Đăng Ký Affiliate',
        },
        {
          type: 'steps',
          items: [
            {
              number: 1,
              title: 'Kiểm tra điều kiện',
              description: 'Yêu cầu:\n• Tài khoản từ 7 ngày trở lên\n• Có ít nhất 100 followers\n• Không vi phạm Community Guidelines\n• Có thông tin thanh toán',
              tips: ['Nếu chưa đủ followers, focus vào tạo nội dung chất lượng trước'],
            },
            {
              number: 2,
              title: 'Mở trang Affiliate',
              description: 'Vào: Tài Sản → Affiliate Marketing',
            },
            {
              number: 3,
              title: 'Nhấn "Đăng ký Affiliate"',
              description: 'Đọc và đồng ý với:\n• Điều khoản Affiliate\n• Chính sách hoa hồng\n• Quy định về quảng bá',
            },
            {
              number: 4,
              title: 'Điền thông tin',
              description: 'Form yêu cầu:\n• Họ tên đầy đủ\n• Số CMND/CCCD\n• Email\n• Số điện thoại\n• Thông tin thanh toán (Ngân hàng/Momo)',
              tips: ['Thông tin phải chính xác để nhận được tiền'],
            },
            {
              number: 5,
              title: 'Chờ phê duyệt',
              description: 'Gemral sẽ review trong 1-3 ngày làm việc',
            },
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Cách Tạo Link Affiliate',
        },
        {
          type: 'steps',
          items: [
            {
              number: 1,
              title: 'Browse sản phẩm',
              description: 'Vào tab Shop → Xem sản phẩm. Products có nhãn "Affiliate" là có chương trình',
              tips: ['Chọn sản phẩm bạn thực sự dùng/thích'],
            },
            {
              number: 2,
              title: 'Tạo link',
              description: 'Trên trang sản phẩm → Nhấn nút "Tạo link Affiliate"',
            },
            {
              number: 3,
              title: 'Tùy chỉnh link (Optional)',
              description: 'Bạn có thể rút gọn link hoặc thêm UTM parameters để track chi tiết',
            },
            {
              number: 4,
              title: 'Copy & chia sẻ',
              description: 'Nhấn "Copy link" → Chia sẻ ở bài đăng, Instagram, Facebook, TikTok...',
              tips: ['Đặt link ở vị trí dễ thấy', 'Dùng call-to-action rõ ràng'],
            },
          ],
        },
        {
          type: 'callout',
          style: 'warning',
          title: 'Quy định quan trọng',
          content: 'NGHIÊM CẤM:\n• Tự click link của mình\n• Spam link nhiều nơi\n• Mua fake traffic\n• Misleading/false claims\n\nVI PHẠM → Mất hoa hồng + ban tài khoản',
        },
        {
          type: 'faq',
          items: [
            {
              question: 'Cookie tracking kéo dài bao lâu?',
              answer: '30 ngày. Trong 30 ngày kể từ khi click, nếu khách mua → bạn được hoa hồng.',
            },
            {
              question: 'Tôi có được hoa hồng nếu khách mua nhiều sản phẩm?',
              answer: 'CÓ! Hoa hồng tính trên TOÀN BỘ đơn hàng, không chỉ sản phẩm trong link.',
            },
            {
              question: 'Khách trả hàng thì sao?',
              answer: 'Nếu khách return trong thời gian guarantee, hoa hồng bị trừ lại.',
            },
          ],
        },
        {
          type: 'related_articles',
          articles: [
            {
              title: 'Thu Nhập Trên Gemral',
              slug: 'thu-nhap-tong-hop',
            },
            {
              title: 'Dashboard Creator',
              slug: 'dashboard-creator-huong-dan',
            },
          ],
        },
      ],
    },
  },

  // ────────────────────────────────────────────────────────
  // DASHBOARD ARTICLE
  // ────────────────────────────────────────────────────────
  'dashboard-creator-huong-dan': {
    id: 'dashboard-creator-huong-dan',
    title: 'Dashboard Creator - Theo Dõi Mọi Metrics Quan Trọng',
    slug: 'dashboard-creator-huong-dan',
    categoryId: 'dashboard',
    excerpt: 'Tùy chỉnh dashboard của bạn với widgets theo dõi Gems, thu nhập, followers, engagement. Data-driven để grow nhanh hơn!',
    metadata: {
      readTime: '8 phút',
      difficulty: 'Dễ',
      views: 0,
      helpful: 0,
      lastUpdated: '2024-11-28',
    },
    content: {
      blocks: [
        {
          type: 'heading',
          level: 1,
          content: 'Dashboard Creator Là Gì?',
        },
        {
          type: 'paragraph',
          content: 'Dashboard là trung tâm điều khiển của Creator - nơi bạn thấy tất cả metrics quan trọng trong một màn hình. Giống như bảng taplo của xe, giúp bạn:\n\n• Biết account đang growth hay decline\n• Spot trends sớm\n• Make data-driven decisions\n• Track KPIs hàng ngày',
        },
        {
          type: 'heading',
          level: 2,
          content: 'Cách Mở Dashboard',
        },
        {
          type: 'steps',
          items: [
            {
              number: 1,
              title: 'Vào tab Tài Sản',
              description: 'Từ màn hình chính → Tab "Tài Sản" ở menu dưới',
            },
            {
              number: 2,
              title: 'Chọn "Dashboard"',
              description: 'Ở đầu danh sách → Icon Dashboard',
            },
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'Các Widgets Có Sẵn',
        },
        {
          type: 'heading',
          level: 3,
          content: '1. Gems Widget',
        },
        {
          type: 'paragraph',
          content: 'Hiển thị:\n• Số Gems hiện tại\n• Gems thu/chi hôm nay\n• Biểu đồ 7 ngày\n• Quick actions: Mua Gems, Xem lịch sử',
        },
        {
          type: 'heading',
          level: 3,
          content: '2. Thu Nhập Widget',
        },
        {
          type: 'paragraph',
          content: 'Hiển thị:\n• Thu nhập tháng này\n• So sánh vs tháng trước (% tăng/giảm)\n• Breakdown theo nguồn: Gift, Affiliate, Khóa học, Brand deals\n• Quick action: Rút tiền',
        },
        {
          type: 'heading',
          level: 3,
          content: '3. Followers Widget',
        },
        {
          type: 'paragraph',
          content: 'Hiển thị:\n• Tổng followers\n• Followers mới hôm nay\n• Follower growth rate (7/30 ngày)\n• Demographics: Giới tính, độ tuổi, location',
        },
        {
          type: 'heading',
          level: 3,
          content: '4. Engagement Widget',
        },
        {
          type: 'paragraph',
          content: 'Metrics:\n• Engagement rate trung bình\n• Total likes, comments, shares tuần này\n• Best time to post (dựa trên data của bạn)',
        },
        {
          type: 'heading',
          level: 2,
          content: 'Tùy Chỉnh Dashboard',
        },
        {
          type: 'steps',
          items: [
            {
              number: 1,
              title: 'Enter edit mode',
              description: 'Nhấn icon Settings ở góc trên phải → "Chỉnh sửa Dashboard"',
            },
            {
              number: 2,
              title: 'Thêm/xóa widgets',
              description: 'Nhấn + để thêm widget mới. Nhấn X trên widget để xóa.',
            },
            {
              number: 3,
              title: 'Sắp xếp layout',
              description: 'Long press widget → Drag to reorder. Đặt widgets quan trọng lên trên.',
            },
            {
              number: 4,
              title: 'Lưu layout',
              description: 'Nhấn "Lưu" → Layout được save',
            },
          ],
        },
        {
          type: 'heading',
          level: 2,
          content: 'KPIs Quan Trọng Nhất',
        },
        {
          type: 'table',
          headers: ['KPI', 'Công thức', 'Benchmark tốt', 'Cách improve'],
          rows: [
            ['Follower Growth Rate', '(New / Total) × 100', '5-10% monthly', 'Post consistently'],
            ['Engagement Rate', '(Likes+Comments+Shares) / Followers × 100', '5-10%', 'Create engaging content'],
            ['Avg. Views per Post', 'Total views / Posts', '3-5x followers', 'Post at optimal times'],
            ['Revenue per Follower', 'Total revenue / Followers', '$0.5-2 monthly', 'Diversify income'],
          ],
        },
        {
          type: 'faq',
          items: [
            {
              question: 'Dữ liệu update bao lâu 1 lần?',
              answer: 'Real-time widgets update ngay. Analytics widgets update mỗi 15 phút. Reports update mỗi giờ.',
            },
            {
              question: 'Tôi có thể export data không?',
              answer: 'CÓ! Mobile: Export CSV cơ bản. Web: Export CSV, PDF, Excel.',
            },
            {
              question: 'Dashboard có lưu history không?',
              answer: 'CÓ. 90 ngày gần nhất: Full detailed data. Trên 90 ngày: Daily aggregated data.',
            },
          ],
        },
        {
          type: 'related_articles',
          articles: [
            {
              title: 'Thu Nhập Trên Gemral',
              slug: 'thu-nhap-tong-hop',
            },
            {
              title: 'Gems - Hướng Dẫn Đầy Đủ',
              slug: 'gems-huong-dan-day-du',
            },
          ],
        },
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Get articles by category ID
 * @param {string} categoryId
 * @returns {Array} List of articles
 */
export const getArticlesByCategory = (categoryId) => {
  return Object.values(HELP_ARTICLES).filter(
    (article) => article.categoryId === categoryId
  );
};

/**
 * Get article by slug
 * @param {string} slug
 * @returns {Object|null} Article or null
 */
export const getArticleBySlug = (slug) => {
  return HELP_ARTICLES[slug] || null;
};

/**
 * Search articles by query
 * @param {string} query
 * @returns {Array} Matching articles
 */
export const searchArticles = (query) => {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  return Object.values(HELP_ARTICLES).filter((article) => {
    return (
      article.title.toLowerCase().includes(lowerQuery) ||
      article.excerpt.toLowerCase().includes(lowerQuery)
    );
  });
};

/**
 * Get all articles as array
 * @returns {Array} All articles
 */
export const getAllArticles = () => {
  return Object.values(HELP_ARTICLES);
};

/**
 * Get category by ID
 * @param {string} categoryId
 * @returns {Object|null} Category or null
 */
export const getCategoryById = (categoryId) => {
  return HELP_CATEGORIES.find((cat) => cat.id === categoryId) || null;
};

export default {
  HELP_CATEGORIES,
  HELP_ARTICLES,
  getArticlesByCategory,
  getArticleBySlug,
  searchArticles,
  getAllArticles,
  getCategoryById,
};
