-- Goal Scenarios Database for Vision Board
-- Contains pre-defined scenarios with affirmations and action plans by life area
-- Created: 2025-12-03

-- Table: goal_scenarios
-- Stores predefined scenarios for each life area with affirmations and action plans
CREATE TABLE IF NOT EXISTS goal_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Life Area Category
  life_area VARCHAR(50) NOT NULL,  -- 'finance', 'relationships', 'career', 'health', 'personal', 'spiritual'

  -- Scenario Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'target',

  -- Affirmations for this scenario (stored as JSONB array)
  affirmations JSONB NOT NULL DEFAULT '[]',

  -- Action Plan steps (stored as JSONB array)
  action_steps JSONB NOT NULL DEFAULT '[]',

  -- Metadata
  difficulty VARCHAR(20) DEFAULT 'medium',  -- 'easy', 'medium', 'hard'
  duration_days INT DEFAULT 30,  -- Recommended duration
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookup by life_area
CREATE INDEX IF NOT EXISTS idx_goal_scenarios_life_area ON goal_scenarios(life_area);
CREATE INDEX IF NOT EXISTS idx_goal_scenarios_active ON goal_scenarios(is_active);

-- Enable RLS
ALTER TABLE goal_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read active scenarios
CREATE POLICY "Anyone can read active scenarios"
  ON goal_scenarios
  FOR SELECT
  USING (is_active = TRUE);

-- RLS Policy: Only admins can insert/update/delete
CREATE POLICY "Only admins can modify scenarios"
  ON goal_scenarios
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = TRUE OR profiles.role = 'admin')
    )
  );

-- Insert 50 scenarios across 6 life areas

-- ==================== FINANCE (Tài chính) - 10 scenarios ====================
INSERT INTO goal_scenarios (life_area, title, description, icon, affirmations, action_steps, difficulty, duration_days, sort_order) VALUES

('finance', 'Tự do tài chính', 'Đạt được sự độc lập tài chính và không còn lo lắng về tiền bạc', 'wallet',
'["Tiền đến với tôi dễ dàng và dồi dào", "Tôi là nam châm thu hút tài lộc", "Mỗi ngày tôi càng giàu có hơn", "Tôi xứng đáng được sống trong sự sung túc"]'::jsonb,
'["Lập kế hoạch chi tiêu hàng tháng", "Tiết kiệm ít nhất 20% thu nhập", "Học về đầu tư cơ bản", "Tạo nguồn thu nhập thụ động", "Theo dõi chi tiêu hàng ngày"]'::jsonb,
'medium', 90, 1),

('finance', 'Kiếm thêm thu nhập', 'Tăng thu nhập bằng nhiều nguồn khác nhau', 'trending-up',
'["Tôi có khả năng tạo ra nhiều nguồn thu nhập", "Cơ hội kiếm tiền luôn đến với tôi", "Tôi biết cách biến kỹ năng thành tiền bạc", "Mọi công việc tôi làm đều sinh lời"]'::jsonb,
'["Liệt kê kỹ năng có thể kiếm tiền", "Tìm hiểu freelance phù hợp", "Dành 2 giờ/ngày cho công việc phụ", "Xây dựng portfolio cá nhân", "Networking với người trong ngành"]'::jsonb,
'easy', 30, 2),

('finance', 'Thoát nợ', 'Trả hết nợ và sống cuộc sống không nợ nần', 'shield',
'["Tôi có khả năng trả hết mọi khoản nợ", "Mỗi ngày tôi tiến gần hơn đến tự do tài chính", "Tôi kiểm soát được tài chính của mình", "Nợ không định nghĩa giá trị của tôi"]'::jsonb,
'["Liệt kê tất cả các khoản nợ", "Áp dụng phương pháp snowball/avalanche", "Cắt giảm chi tiêu không cần thiết", "Tìm cách tăng thu nhập để trả nợ", "Không tạo thêm nợ mới"]'::jsonb,
'hard', 180, 3),

('finance', 'Đầu tư thông minh', 'Học cách đầu tư và làm tiền sinh tiền', 'chart-bar',
'["Tôi là nhà đầu tư thông minh", "Tiền của tôi luôn làm việc cho tôi", "Tôi đưa ra quyết định đầu tư sáng suốt", "Mỗi khoản đầu tư đều mang lại lợi nhuận"]'::jsonb,
'["Học về các loại hình đầu tư", "Bắt đầu với số vốn nhỏ", "Đa dạng hóa danh mục đầu tư", "Theo dõi thị trường hàng ngày", "Tham gia cộng đồng đầu tư"]'::jsonb,
'hard', 90, 4),

('finance', 'Quỹ khẩn cấp', 'Xây dựng quỹ dự phòng 6 tháng chi tiêu', 'piggy-bank',
'["Tôi luôn có đủ tiền cho mọi tình huống", "Quỹ khẩn cấp của tôi ngày càng lớn", "Tôi chuẩn bị tốt cho tương lai", "An toàn tài chính là ưu tiên của tôi"]'::jsonb,
'["Tính chi tiêu trung bình hàng tháng", "Mở tài khoản tiết kiệm riêng", "Tự động chuyển 10% lương vào quỹ", "Không sử dụng quỹ cho chi tiêu thường", "Kiểm tra quỹ hàng tháng"]'::jsonb,
'easy', 180, 5),

('finance', 'Khởi nghiệp', 'Bắt đầu kinh doanh riêng', 'rocket',
'["Tôi có khả năng xây dựng doanh nghiệp thành công", "Ý tưởng của tôi có giá trị", "Tôi là doanh nhân giỏi", "Thành công trong kinh doanh là định mệnh của tôi"]'::jsonb,
'["Nghiên cứu thị trường", "Lập kế hoạch kinh doanh", "Tìm nguồn vốn khởi nghiệp", "Xây dựng MVP", "Tìm khách hàng đầu tiên"]'::jsonb,
'hard', 90, 6),

('finance', 'Mua nhà', 'Sở hữu ngôi nhà mơ ước', 'home',
'["Ngôi nhà mơ ước đang chờ đợi tôi", "Tôi xứng đáng có một mái ấm của riêng mình", "Mỗi ngày tôi tiến gần hơn đến mục tiêu mua nhà", "Vũ trụ đang sắp xếp để tôi có ngôi nhà hoàn hảo"]'::jsonb,
'["Tìm hiểu giá nhà trong khu vực mong muốn", "Lập kế hoạch tiết kiệm cho tiền cọc", "Cải thiện điểm tín dụng", "Tìm hiểu các gói vay ngân hàng", "Đi xem nhà mẫu"]'::jsonb,
'hard', 365, 7),

('finance', 'Nghỉ hưu sớm', 'Đạt FIRE (Financial Independence Retire Early)', 'sunset',
'["Tôi đang xây dựng tự do tài chính", "Nghỉ hưu sớm là mục tiêu có thể đạt được", "Mỗi ngày tôi tiến gần hơn đến cuộc sống tự do", "Tôi sống cuộc đời theo cách tôi muốn"]'::jsonb,
'["Tính số tiền cần cho FIRE", "Tăng tỷ lệ tiết kiệm lên 50%+", "Đầu tư dài hạn", "Cắt giảm chi phí cố định", "Theo dõi net worth hàng tháng"]'::jsonb,
'hard', 365, 8),

('finance', 'Chi tiêu có ý thức', 'Kiểm soát chi tiêu và sống trong ngân sách', 'credit-card',
'["Tôi chi tiêu có ý thức và thông minh", "Tiền của tôi phục vụ mục tiêu của tôi", "Tôi phân biệt được muốn và cần", "Mỗi đồng tiền đều được sử dụng có giá trị"]'::jsonb,
'["Theo dõi chi tiêu 7 ngày liên tiếp", "Phân loại chi tiêu cần thiết vs muốn", "Áp dụng quy tắc 50/30/20", "Chờ 24h trước khi mua đồ không cần", "Review ngân sách hàng tuần"]'::jsonb,
'easy', 30, 9),

('finance', 'Tặng và chia sẻ', 'Trở thành người cho đi và đóng góp cho cộng đồng', 'heart',
'["Cho đi là nhận lại gấp bội", "Tôi có đủ để chia sẻ với người khác", "Sự hào phóng thu hút thêm sự sung túc", "Đóng góp cho cộng đồng mang lại ý nghĩa cho cuộc sống"]'::jsonb,
'["Dành 10% thu nhập để cho đi", "Tình nguyện 4 giờ/tháng", "Hỗ trợ 1 tổ chức từ thiện", "Giúp đỡ người thân khi có thể", "Chia sẻ kiến thức với người khác"]'::jsonb,
'easy', 30, 10),

-- ==================== RELATIONSHIPS (Mối quan hệ) - 10 scenarios ====================

('relationships', 'Thu hút tình yêu đích thực', 'Tìm và thu hút người bạn đời phù hợp', 'heart',
'["Tôi xứng đáng có tình yêu đích thực", "Người phù hợp đang tìm đến tôi", "Tôi mở lòng đón nhận tình yêu", "Tình yêu tràn đầy trong cuộc sống của tôi"]'::jsonb,
'["Yêu thương bản thân trước", "Mở rộng vòng tròn xã hội", "Rõ ràng về điều mình muốn ở bạn đời", "Tham gia các hoạt động yêu thích", "Thực hành cởi mở và chân thành"]'::jsonb,
'medium', 90, 1),

('relationships', 'Cải thiện mối quan hệ hiện tại', 'Làm sâu sắc và cải thiện mối quan hệ với người yêu/vợ chồng', 'users',
'["Mối quan hệ của tôi ngày càng bền chặt", "Tôi và đối tác hiểu nhau sâu sắc", "Tình yêu của chúng tôi phát triển mỗi ngày", "Chúng tôi cùng nhau vượt qua mọi thử thách"]'::jsonb,
'["Dành quality time mỗi ngày", "Lắng nghe chủ động", "Thể hiện tình cảm thường xuyên", "Giải quyết xung đột một cách lành mạnh", "Cùng nhau đặt mục tiêu"]'::jsonb,
'medium', 60, 2),

('relationships', 'Hàn gắn gia đình', 'Cải thiện mối quan hệ với bố mẹ và anh chị em', 'home',
'["Gia đình tôi là nguồn sức mạnh", "Tôi yêu thương và tha thứ cho gia đình", "Mối quan hệ gia đình của tôi ngày càng tốt đẹp", "Tôi trân trọng những gì gia đình mang lại"]'::jsonb,
'["Gọi điện cho gia đình mỗi tuần", "Viết thư tha thứ (không cần gửi)", "Tham gia bữa cơm gia đình", "Chia sẻ cảm xúc một cách cởi mở", "Tạo những kỷ niệm mới cùng nhau"]'::jsonb,
'medium', 60, 3),

('relationships', 'Xây dựng tình bạn chất lượng', 'Tìm và nuôi dưỡng những tình bạn sâu sắc', 'users',
'["Tôi thu hút những người bạn tốt", "Tôi là người bạn đáng tin cậy", "Tình bạn của tôi mang lại niềm vui và hỗ trợ", "Tôi xứng đáng có những mối quan hệ chất lượng"]'::jsonb,
'["Chủ động liên lạc với bạn bè", "Tham gia nhóm/cộng đồng mới", "Lắng nghe và hỗ trợ bạn bè", "Sắp xếp gặp mặt định kỳ", "Là người bạn mà mình muốn có"]'::jsonb,
'easy', 30, 4),

('relationships', 'Đặt ranh giới lành mạnh', 'Học cách nói không và bảo vệ năng lượng bản thân', 'shield',
'["Tôi có quyền đặt ranh giới", "Nói không là yêu thương bản thân", "Ranh giới của tôi được tôn trọng", "Tôi bảo vệ năng lượng của mình"]'::jsonb,
'["Nhận diện các mối quan hệ tiêu cực", "Học cách nói không lịch sự", "Giảm thời gian với người tiêu cực", "Giao tiếp nhu cầu rõ ràng", "Không cảm thấy tội lỗi khi từ chối"]'::jsonb,
'medium', 30, 5),

('relationships', 'Chữa lành sau chia tay', 'Hồi phục và tiến về phía trước sau mối quan hệ kết thúc', 'heart',
'["Tôi xứng đáng được yêu thương", "Mỗi kết thúc là một khởi đầu mới", "Tôi mạnh mẽ và có khả năng hồi phục", "Trái tim tôi đang lành lại mỗi ngày"]'::jsonb,
'["Cho phép bản thân buồn", "Viết nhật ký cảm xúc", "Tập trung vào phát triển bản thân", "Không theo dõi mạng xã hội người cũ", "Tìm hỗ trợ từ bạn bè/chuyên gia"]'::jsonb,
'medium', 60, 6),

('relationships', 'Giao tiếp hiệu quả', 'Cải thiện kỹ năng giao tiếp trong các mối quan hệ', 'message-circle',
'["Tôi giao tiếp rõ ràng và tự tin", "Tôi lắng nghe để hiểu", "Giao tiếp của tôi xây dựng cầu nối", "Tôi diễn đạt cảm xúc một cách lành mạnh"]'::jsonb,
'["Thực hành lắng nghe chủ động", "Sử dụng câu I thay vì You", "Hỏi để hiểu không phải để phản bác", "Kiểm soát cảm xúc khi giao tiếp", "Tránh giả định và hỏi rõ ràng"]'::jsonb,
'easy', 30, 7),

('relationships', 'Xây dựng network chuyên nghiệp', 'Mở rộng và nuôi dưỡng mạng lưới quan hệ công việc', 'briefcase',
'["Network của tôi là tài sản quý giá", "Tôi kết nối với những người thành công", "Cơ hội đến từ các mối quan hệ", "Tôi mang lại giá trị cho network của mình"]'::jsonb,
'["Tham dự 1 event networking/tháng", "Cập nhật LinkedIn thường xuyên", "Follow up sau mỗi cuộc gặp", "Giới thiệu người này với người kia", "Chia sẻ kiến thức và tài nguyên"]'::jsonb,
'medium', 60, 8),

('relationships', 'Tha thứ và buông bỏ', 'Giải phóng bản thân khỏi oán giận và tổn thương', 'feather',
'["Tôi chọn tha thứ để tự do", "Buông bỏ là món quà cho chính mình", "Tôi không để quá khứ định nghĩa tương lai", "Trái tim tôi nhẹ nhàng và bình an"]'::jsonb,
'["Viết thư tha thứ cho người đã làm tổn thương", "Thiền về sự tha thứ", "Thực hành loving-kindness meditation", "Nhận ra tha thứ là cho mình", "Tìm bài học từ mỗi trải nghiệm"]'::jsonb,
'hard', 60, 9),

('relationships', 'Trở thành người lãnh đạo', 'Phát triển kỹ năng lãnh đạo và ảnh hưởng tích cực', 'crown',
'["Tôi là người lãnh đạo tự nhiên", "Tôi truyền cảm hứng cho người khác", "Sự hiện diện của tôi mang lại giá trị", "Tôi dẫn dắt bằng tấm gương"]'::jsonb,
'["Đọc sách về leadership", "Thực hành đưa ra quyết định", "Mentor/hướng dẫn người khác", "Nhận feedback và cải thiện", "Phát triển emotional intelligence"]'::jsonb,
'hard', 90, 10),

-- ==================== CAREER (Sự nghiệp) - 10 scenarios ====================

('career', 'Thăng tiến trong công việc', 'Đạt vị trí cao hơn trong công ty hiện tại', 'trending-up',
'["Tôi xứng đáng được thăng tiến", "Công sức của tôi được ghi nhận", "Thành công trong sự nghiệp là tự nhiên với tôi", "Cơ hội thăng tiến đang đến"]'::jsonb,
'["Gặp sếp discuss về career path", "Tình nguyện nhận dự án quan trọng", "Phát triển kỹ năng cần cho vị trí mới", "Xây dựng mối quan hệ với lãnh đạo", "Document thành tích của mình"]'::jsonb,
'medium', 90, 1),

('career', 'Chuyển đổi ngành nghề', 'Thành công chuyển sang lĩnh vực công việc mới', 'refresh-cw',
'["Tôi có khả năng học bất cứ điều gì", "Chuyển đổi là cơ hội phát triển", "Kinh nghiệm cũ là tài sản cho công việc mới", "Tôi sẵn sàng cho thử thách mới"]'::jsonb,
'["Nghiên cứu ngành muốn chuyển", "Học kỹ năng cần thiết", "Networking với người trong ngành mới", "Làm dự án side project", "Cập nhật CV và portfolio"]'::jsonb,
'hard', 180, 2),

('career', 'Cân bằng công việc - cuộc sống', 'Đạt work-life balance lành mạnh', 'scale',
'["Tôi xứng đáng có cuộc sống cân bằng", "Công việc phục vụ cuộc sống không phải ngược lại", "Tôi đặt ranh giới lành mạnh với công việc", "Nghỉ ngơi là phần quan trọng của thành công"]'::jsonb,
'["Đặt giờ kết thúc công việc cố định", "Không check email sau giờ làm", "Dành thời gian cho sở thích", "Sử dụng hết ngày nghỉ phép", "Từ chối công việc ngoài giờ khi cần"]'::jsonb,
'medium', 30, 3),

('career', 'Phát triển kỹ năng chuyên môn', 'Trở thành chuyên gia trong lĩnh vực của mình', 'award',
'["Tôi là chuyên gia trong lĩnh vực của mình", "Kiến thức của tôi ngày càng sâu rộng", "Tôi luôn học hỏi và phát triển", "Chuyên môn của tôi mang lại giá trị"]'::jsonb,
'["Học 1 kỹ năng mới mỗi quý", "Đọc sách/tài liệu chuyên ngành", "Tham gia khóa học/workshop", "Thực hành kỹ năng mới trong công việc", "Chia sẻ kiến thức với đồng nghiệp"]'::jsonb,
'medium', 90, 4),

('career', 'Tìm công việc mơ ước', 'Landing được công việc lý tưởng', 'briefcase',
'["Công việc mơ ước đang tìm đến tôi", "Tôi là ứng viên hoàn hảo", "Mọi cơ hội đều mở ra cho tôi", "Thành công trong phỏng vấn là tự nhiên với tôi"]'::jsonb,
'["Định nghĩa rõ công việc mơ ước", "Tối ưu CV và LinkedIn", "Apply 5-10 việc mỗi tuần", "Chuẩn bị kỹ cho phỏng vấn", "Follow up sau mỗi phỏng vấn"]'::jsonb,
'medium', 60, 5),

('career', 'Xây dựng personal brand', 'Trở thành người có ảnh hưởng trong ngành', 'star',
'["Thương hiệu cá nhân của tôi mạnh mẽ", "Tôi được biết đến là chuyên gia", "Tiếng nói của tôi có trọng lượng", "Cơ hội tự tìm đến tôi"]'::jsonb,
'["Viết bài chia sẻ kiến thức", "Active trên LinkedIn/Twitter", "Nói chuyện tại events", "Tạo content giá trị đều đặn", "Networking với influencers trong ngành"]'::jsonb,
'hard', 180, 6),

('career', 'Làm việc từ xa hiệu quả', 'Thành công với công việc remote', 'laptop',
'["Tôi làm việc hiệu quả ở bất cứ đâu", "Self-discipline là thế mạnh của tôi", "Remote work mang lại tự do cho tôi", "Tôi quản lý thời gian xuất sắc"]'::jsonb,
'["Tạo không gian làm việc riêng", "Đặt lịch làm việc cố định", "Sử dụng tools quản lý công việc", "Giao tiếp proactive với team", "Tách biệt rõ giờ làm và nghỉ"]'::jsonb,
'easy', 30, 7),

('career', 'Đàm phán lương', 'Tăng lương và thu nhập xứng đáng', 'dollar-sign',
'["Tôi xứng đáng được trả lương cao", "Giá trị của tôi được công nhận", "Tôi tự tin đàm phán cho quyền lợi", "Thu nhập của tôi phản ánh năng lực"]'::jsonb,
'["Nghiên cứu mức lương thị trường", "Document thành tích của mình", "Luyện tập đàm phán", "Chọn thời điểm phù hợp", "Chuẩn bị backup plan"]'::jsonb,
'medium', 30, 8),

('career', 'Vượt qua burnout', 'Phục hồi và phòng ngừa kiệt sức công việc', 'battery-charging',
'["Tôi lắng nghe cơ thể và tâm trí", "Nghỉ ngơi là đầu tư cho hiệu suất", "Tôi đặt giới hạn lành mạnh", "Sức khỏe quan trọng hơn công việc"]'::jsonb,
'["Nhận diện dấu hiệu burnout", "Nghỉ ngơi đúng cách", "Delegation và say no", "Tìm lại đam mê trong công việc", "Xây dựng routine phục hồi"]'::jsonb,
'medium', 60, 9),

('career', 'Làm việc với sếp khó', 'Quản lý mối quan hệ với cấp trên hiệu quả', 'users',
'["Tôi giao tiếp hiệu quả với mọi người", "Tôi hiểu và thích nghi với nhiều phong cách", "Mọi thử thách là cơ hội học hỏi", "Tôi tập trung vào những gì kiểm soát được"]'::jsonb,
'["Tìm hiểu phong cách làm việc của sếp", "Giao tiếp rõ ràng và proactive", "Document công việc và thành tích", "Seek feedback thường xuyên", "Build support network"]'::jsonb,
'hard', 60, 10),

-- ==================== HEALTH (Sức khỏe) - 10 scenarios ====================

('health', 'Giảm cân lành mạnh', 'Đạt cân nặng lý tưởng một cách bền vững', 'activity',
'["Cơ thể tôi ngày càng khỏe mạnh", "Tôi yêu thương và chăm sóc cơ thể mình", "Mỗi lựa chọn lành mạnh đưa tôi đến mục tiêu", "Tôi tự hào về sự thay đổi của mình"]'::jsonb,
'["Ăn 80% thực phẩm tự nhiên", "Tập thể dục 30 phút/ngày", "Uống 2 lít nước/ngày", "Ngủ 7-8 tiếng/đêm", "Theo dõi tiến trình hàng tuần"]'::jsonb,
'medium', 90, 1),

('health', 'Xây dựng thói quen tập luyện', 'Duy trì routine tập thể dục đều đặn', 'dumbbell',
'["Tập thể dục là món quà cho cơ thể", "Tôi yêu thích vận động", "Cơ thể tôi ngày càng mạnh mẽ", "Tập luyện là phần tự nhiên của ngày"]'::jsonb,
'["Chọn hình thức tập phù hợp", "Đặt lịch tập cố định", "Tìm workout buddy", "Track tiến trình", "Reward khi đạt milestone"]'::jsonb,
'easy', 30, 2),

('health', 'Ngủ ngon hơn', 'Cải thiện chất lượng giấc ngủ', 'moon',
'["Tôi ngủ sâu và hồi phục đầy đủ", "Giấc ngủ của tôi chất lượng và đủ giấc", "Cơ thể tôi biết cách thư giãn", "Mỗi sáng tôi thức dậy tràn đầy năng lượng"]'::jsonb,
'["Ngủ và dậy cùng giờ mỗi ngày", "Không screen 1h trước ngủ", "Tạo routine trước ngủ", "Giữ phòng ngủ tối và mát", "Không caffeine sau 2pm"]'::jsonb,
'easy', 30, 3),

('health', 'Ăn uống lành mạnh', 'Xây dựng chế độ ăn cân bằng và bổ dưỡng', 'apple',
'["Tôi nạp năng lượng từ thực phẩm lành mạnh", "Cơ thể tôi được nuôi dưỡng đúng cách", "Tôi chọn thực phẩm tốt cho sức khỏe", "Mỗi bữa ăn là cơ hội chăm sóc bản thân"]'::jsonb,
'["Meal prep vào chủ nhật", "Ăn nhiều rau và protein", "Giảm đường và thực phẩm chế biến", "Ăn chậm và mindful", "Học về dinh dưỡng cơ bản"]'::jsonb,
'medium', 60, 4),

('health', 'Giảm stress', 'Quản lý căng thẳng hiệu quả', 'wind',
'["Tôi bình tĩnh trước mọi tình huống", "Stress không kiểm soát được tôi", "Tôi có nhiều cách để thư giãn", "Tâm trí tôi yên bình và rõ ràng"]'::jsonb,
'["Thiền 10 phút mỗi sáng", "Tập hít thở sâu khi căng thẳng", "Viết nhật ký về lo lắng", "Hạn chế nguồn stress có thể", "Tìm hoạt động giải stress"]'::jsonb,
'medium', 30, 5),

('health', 'Tăng năng lượng', 'Có nhiều năng lượng hơn mỗi ngày', 'zap',
'["Tôi tràn đầy năng lượng mỗi ngày", "Cơ thể tôi hoạt động ở trạng thái tối ưu", "Tôi có năng lượng cho mọi việc quan trọng", "Mỗi sáng tôi thức dậy hứng khởi"]'::jsonb,
'["Ngủ đủ giấc", "Ăn đúng bữa và đủ chất", "Vận động đều đặn", "Hạn chế caffeine", "Quản lý năng lượng theo nhịp sinh học"]'::jsonb,
'easy', 30, 6),

('health', 'Sức khỏe tâm thần', 'Chăm sóc sức khỏe tinh thần và cảm xúc', 'brain',
'["Tôi quan tâm đến sức khỏe tâm thần", "Tìm kiếm sự giúp đỡ là dũng cảm", "Tâm trí tôi là ưu tiên", "Tôi xứng đáng được hạnh phúc"]'::jsonb,
'["Thực hành mindfulness hàng ngày", "Nói chuyện với người tin tưởng", "Viết nhật ký cảm xúc", "Tìm chuyên gia khi cần", "Làm những việc mang lại niềm vui"]'::jsonb,
'medium', 60, 7),

('health', 'Cai thuốc/rượu', 'Từ bỏ thói quen có hại cho sức khỏe', 'x-circle',
'["Tôi mạnh mẽ hơn addiction", "Mỗi ngày không dùng là chiến thắng", "Tôi chọn sức khỏe", "Cơ thể tôi đang hồi phục"]'::jsonb,
'["Set ngày bắt đầu cai", "Tìm support group", "Nhận diện triggers", "Tìm hoạt động thay thế", "Khen thưởng mỗi milestone"]'::jsonb,
'hard', 90, 8),

('health', 'Linh hoạt cơ thể', 'Cải thiện độ dẻo dai và linh hoạt', 'move',
'["Cơ thể tôi linh hoạt và mạnh mẽ", "Mỗi ngày tôi dẻo dai hơn", "Tôi di chuyển dễ dàng và thoải mái", "Cơ thể tôi biết cách thư giãn"]'::jsonb,
'["Stretch 10 phút mỗi sáng", "Tập yoga 2-3 lần/tuần", "Đi bộ sau mỗi giờ ngồi", "Foam rolling", "Tập các tư thế basic"]'::jsonb,
'easy', 30, 9),

('health', 'Chạy marathon', 'Hoàn thành cuộc chạy marathon đầu tiên', 'running',
'["Tôi là runner", "Cơ thể tôi có thể chạy xa", "Mỗi bước chạy đưa tôi đến mục tiêu", "Tôi sẽ hoàn thành marathon"]'::jsonb,
'["Theo training plan 16-20 tuần", "Tăng quãng đường từ từ", "Cross-training", "Dinh dưỡng cho runner", "Rest và recovery đúng cách"]'::jsonb,
'hard', 180, 10),

-- ==================== PERSONAL (Phát triển bản thân) - 5 scenarios ====================

('personal', 'Học kỹ năng mới', 'Master một kỹ năng mới trong năm', 'book-open',
'["Tôi học nhanh và hiệu quả", "Mọi kỹ năng đều có thể học được", "Tôi cam kết với sự phát triển", "Học hỏi là niềm vui của tôi"]'::jsonb,
'["Chọn kỹ năng muốn học", "Tìm tài nguyên học tập", "Dành 30 phút/ngày để học", "Thực hành thường xuyên", "Tìm mentor hoặc cộng đồng"]'::jsonb,
'medium', 90, 1),

('personal', 'Đọc sách nhiều hơn', 'Đọc 24 cuốn sách trong năm', 'book',
'["Tôi yêu thích đọc sách", "Mỗi cuốn sách mở ra thế giới mới", "Đọc sách là đầu tư cho bản thân", "Kiến thức từ sách thay đổi cuộc đời tôi"]'::jsonb,
'["Đọc 20 trang/ngày", "Mang theo sách khi ra ngoài", "Tham gia book club", "Đặt mục tiêu 2 cuốn/tháng", "Ghi chép điều học được"]'::jsonb,
'easy', 365, 2),

('personal', 'Phát triển EQ', 'Nâng cao trí tuệ cảm xúc', 'heart',
'["Tôi hiểu và quản lý cảm xúc tốt", "EQ cao giúp tôi thành công", "Tôi đồng cảm với người khác", "Cảm xúc là nguồn thông tin quý giá"]'::jsonb,
'["Nhận diện cảm xúc hàng ngày", "Thực hành empathy", "Phản ứng thay vì react", "Học về communication", "Xây dựng self-awareness"]'::jsonb,
'medium', 90, 3),

('personal', 'Vượt qua sợ hãi', 'Đối mặt và vượt qua nỗi sợ', 'shield',
'["Tôi dũng cảm đối mặt với sợ hãi", "Sợ hãi không kiểm soát được tôi", "Mỗi lần vượt qua sợ, tôi mạnh mẽ hơn", "Tôi chọn dũng cảm mỗi ngày"]'::jsonb,
'["Liệt kê những nỗi sợ", "Đối mặt sợ nhỏ trước", "Visualize thành công", "Hành động dù sợ", "Celebrate mỗi chiến thắng"]'::jsonb,
'hard', 60, 4),

('personal', 'Sống có mục đích', 'Tìm và sống theo purpose của mình', 'compass',
'["Tôi sống có mục đích và ý nghĩa", "Purpose của tôi rõ ràng", "Mỗi ngày tôi sống aligned với giá trị", "Cuộc sống của tôi có ý nghĩa"]'::jsonb,
'["Khám phá giá trị cốt lõi", "Viết vision statement", "Đặt câu hỏi Ikigai", "Align hành động với purpose", "Review và điều chỉnh thường xuyên"]'::jsonb,
'hard', 90, 5),

-- ==================== SPIRITUAL (Tâm linh) - 5 scenarios ====================

('spiritual', 'Thiền định hàng ngày', 'Xây dựng thói quen thiền đều đặn', 'sun',
'["Tôi tìm thấy bình an trong thiền định", "Tâm trí tôi yên tĩnh và rõ ràng", "Thiền là phần tự nhiên của ngày", "Tôi kết nối với bản thân sâu sắc"]'::jsonb,
'["Thiền 5 phút mỗi sáng", "Tăng dần lên 20 phút", "Sử dụng app hướng dẫn", "Tạo không gian thiền", "Không phán xét khi tâm trí lang thang"]'::jsonb,
'easy', 30, 1),

('spiritual', 'Thực hành biết ơn', 'Sống trong sự biết ơn mỗi ngày', 'heart',
'["Tôi biết ơn mọi điều trong cuộc sống", "Gratitude thu hút thêm điều tốt đẹp", "Tôi nhìn thấy phước lành khắp nơi", "Cuộc sống của tôi tràn đầy điều để biết ơn"]'::jsonb,
'["Viết 3 điều biết ơn mỗi sáng", "Nói cảm ơn thường xuyên hơn", "Gratitude jar", "Viết thư cảm ơn người quan trọng", "Tìm điều tốt trong thử thách"]'::jsonb,
'easy', 30, 2),

('spiritual', 'Kết nối với tự nhiên', 'Dành thời gian với thiên nhiên thường xuyên', 'tree',
'["Thiên nhiên chữa lành và nạp năng lượng cho tôi", "Tôi là một phần của tự nhiên", "Tôi tìm thấy bình an trong thiên nhiên", "Kết nối với tự nhiên nuôi dưỡng tâm hồn"]'::jsonb,
'["Đi bộ ngoài trời 30 phút/ngày", "Chăm sóc cây xanh", "Picnic cuối tuần", "Earthing/grounding", "Quan sát thiên nhiên mindfully"]'::jsonb,
'easy', 30, 3),

('spiritual', 'Chữa lành nội tâm', 'Làm việc với inner child và trauma', 'feather',
'["Tôi xứng đáng được chữa lành", "Inner child của tôi được yêu thương", "Tôi giải phóng những tổn thương cũ", "Mỗi ngày tôi nhẹ nhàng hơn"]'::jsonb,
'["Journaling về childhood", "Inner child meditation", "Tìm therapist nếu cần", "Self-compassion practice", "Viết thư cho inner child"]'::jsonb,
'hard', 90, 4),

('spiritual', 'Manifestation', 'Thực hành luật hấp dẫn và manifestation', 'sparkles',
'["Tôi là đồng sáng tạo với vũ trụ", "Thoughts become things", "Tôi thu hút điều tôi tập trung vào", "Manifestation của tôi đang trở thành hiện thực"]'::jsonb,
'["Viết vision board", "Visualize mục tiêu mỗi ngày", "Affirmations sáng tối", "Sống như đã có", "Buông bỏ attachment với kết quả"]'::jsonb,
'medium', 60, 5);

-- Grant access
GRANT SELECT ON goal_scenarios TO authenticated;
GRANT SELECT ON goal_scenarios TO anon;
