/**
 * 64 Quẻ Kinh Dịch - Knowledge Base cho Trading
 * ĐẦY ĐỦ 64 QUẺ với trading interpretation
 */

export const HEXAGRAM_DATABASE = {
  1: { number: 1, name: 'Càn', chinese: '乾', meaning: 'Thuần Càn - Trời', lines: [1,1,1,1,1,1], essence: 'Sức mạnh sáng tạo, năng lượng thuần dương.', trading: { trend: 'UPTREND MẠNH', signal: 'Xu hướng tăng mạnh, momentum cao', action: ['Giữ vững vị thế long', 'Không chốt non', 'Đợi dấu hiệu đảo chiều'] } },
  2: { number: 2, name: 'Khôn', chinese: '坤', meaning: 'Thuần Khôn - Đất', lines: [0,0,0,0,0,0], essence: 'Tiếp nhận, thuận theo, không chủ động.', trading: { trend: 'CHỜ ĐỢI', signal: 'Sideway, chờ tín hiệu từ thị trường', action: ['Không mở vị thế mới', 'Quan sát', 'Để thị trường dẫn dắt'] } },
  3: { number: 3, name: 'Truân', chinese: '屯', meaning: 'Thủy Lôi Truân - Khó khăn ban đầu', lines: [0,1,0,1,0,0], essence: 'Khởi đầu gian nan, cần kiên nhẫn.', trading: { trend: 'TÍCH LŨY', signal: 'Thị trường đang hình thành đáy', action: ['DCA từ từ', 'Không all-in', 'Kiên nhẫn chờ breakout'] } },
  4: { number: 4, name: 'Mông', chinese: '蒙', meaning: 'Sơn Thủy Mông - Chưa rõ ràng', lines: [0,0,1,0,1,0], essence: 'Thiếu kinh nghiệm, cần học hỏi.', trading: { trend: 'KHÔNG RÕ RÀNG', signal: 'Thị trường nhiễu, không có xu hướng', action: ['Không giao dịch', 'Nghiên cứu thêm', 'Chờ tín hiệu rõ'] } },
  5: { number: 5, name: 'Nhu', chinese: '需', meaning: 'Thủy Thiên Nhu - Chờ đợi', lines: [0,1,0,1,1,1], essence: 'Kiên nhẫn chờ thời cơ đúng.', trading: { trend: 'CHỜ THỜI CƠ', signal: 'Setup đang hình thành, chưa đủ điều kiện', action: ['Đặt alert', 'Chuẩn bị kế hoạch', 'Không FOMO vào sớm'] } },
  6: { number: 6, name: 'Tụng', chinese: '訟', meaning: 'Thiên Thủy Tụng - Tranh chấp', lines: [1,1,1,0,1,0], essence: 'Xung đột, không nên cố thắng.', trading: { trend: 'VOLATILITY CAO', signal: 'Bull và Bear đang giằng co', action: ['Giảm size', 'SL chặt', 'Tránh revenge trading'] } },
  7: { number: 7, name: 'Sư', chinese: '師', meaning: 'Địa Thủy Sư - Đội quân', lines: [0,0,0,0,1,0], essence: 'Kỷ luật, tổ chức, tuân theo quy tắc.', trading: { trend: 'THEO KỶ LUẬT', signal: 'Tuân thủ chiến lược', action: ['Không phá vỡ rule', 'Theo kế hoạch', 'Quản lý vốn chặt'] } },
  8: { number: 8, name: 'Tỷ', chinese: '比', meaning: 'Thủy Địa Tỷ - Liên kết', lines: [0,1,0,0,0,0], essence: 'Hợp tác, kết nối với người khác.', trading: { trend: 'THEO SMART MONEY', signal: 'Theo dõi cá voi, dòng tiền lớn', action: ['Check whale activity', 'Không đi ngược dòng', 'Follow the trend'] } },
  9: { number: 9, name: 'Tiểu Súc', chinese: '小畜', meaning: 'Phong Thiên Tiểu Súc', lines: [1,1,0,1,1,1], essence: 'Tích lũy nhỏ, chờ thời.', trading: { trend: 'TÍCH LŨY NHỎ', signal: 'Range nhỏ, chờ breakout', action: ['Giữ vị thế nhỏ', 'Đợi volume tăng', 'Scalp trong range'] } },
  10: { number: 10, name: 'Lý', chinese: '履', meaning: 'Thiên Trạch Lý - Bước đi', lines: [1,1,1,0,1,1], essence: 'Cẩn trọng từng bước.', trading: { trend: 'THẬN TRỌNG', signal: 'Thị trường nhạy cảm, đi từng bước', action: ['Size nhỏ', 'Từng bước một', 'Không vội vàng'] } },
  11: { number: 11, name: 'Thái', chinese: '泰', meaning: 'Địa Thiên Thái - Thái hòa', lines: [0,0,0,1,1,1], essence: 'Thịnh vượng, cân bằng, thuận lợi.', trading: { trend: 'BULL MARKET', signal: 'Xu hướng tăng ổn định', action: ['Giữ long', 'Trailing stop', 'Tận hưởng xu hướng'] } },
  12: { number: 12, name: 'Bĩ', chinese: '否', meaning: 'Thiên Địa Bĩ - Bế tắc', lines: [1,1,1,0,0,0], essence: 'Bế tắc, không thông.', trading: { trend: 'BEAR MARKET', signal: 'Xu hướng giảm', action: ['Không mua mới', 'Hedge hoặc cash', 'Chờ reversal signal'] } },
  13: { number: 13, name: 'Đồng Nhân', chinese: '同人', meaning: 'Thiên Hỏa Đồng Nhân', lines: [1,1,1,1,0,1], essence: 'Đồng lòng, hợp tác.', trading: { trend: 'FOLLOW COMMUNITY', signal: 'Theo consensus của cộng đồng', action: ['Xem sentiment', 'Không đi ngược dòng lớn', 'Trade theo xu hướng chung'] } },
  14: { number: 14, name: 'Đại Hữu', chinese: '大有', meaning: 'Hỏa Thiên Đại Hữu', lines: [1,0,1,1,1,1], essence: 'Sở hữu lớn, thành công.', trading: { trend: 'TAKE PROFIT', signal: 'Đỉnh có thể gần, lợi nhuận đã lớn', action: ['Chốt một phần', 'Di chuyển SL lên hòa vốn', 'Không tham lam'] } },
  15: { number: 15, name: 'Khiêm', chinese: '謙', meaning: 'Địa Sơn Khiêm - Khiêm tốn', lines: [0,0,0,0,0,1], essence: 'Khiêm nhường, không kiêu ngạo.', trading: { trend: 'QUẢN LÝ RỦI RO', signal: 'Không overtrade', action: ['Giảm leverage', 'Không flex', 'Tôn trọng thị trường'] } },
  16: { number: 16, name: 'Dự', chinese: '豫', meaning: 'Lôi Địa Dự - Hoan hỉ', lines: [1,0,0,0,0,0], essence: 'Vui vẻ, thuận lợi.', trading: { trend: 'MOMENTUM TĂNG', signal: 'Năng lượng thị trường tích cực', action: ['Entry theo momentum', 'Đừng chống lại trend', 'Tận dụng sóng'] } },
  17: { number: 17, name: 'Tùy', chinese: '隨', meaning: 'Trạch Lôi Tùy - Theo dõi', lines: [0,1,1,1,0,0], essence: 'Thuận theo, linh hoạt.', trading: { trend: 'FOLLOW TREND', signal: 'Theo xu hướng, không dự đoán', action: ['Không đoán đỉnh/đáy', 'Theo trend hiện tại', 'Linh hoạt thay đổi'] } },
  18: { number: 18, name: 'Cổ', chinese: '蠱', meaning: 'Sơn Phong Cổ - Sửa chữa', lines: [0,0,1,1,1,0], essence: 'Sửa chữa sai lầm.', trading: { trend: 'FIX MISTAKES', signal: 'Cần review và sửa chiến lược', action: ['Review journal', 'Fix lỗi trading', 'Không lặp lại sai lầm'] } },
  19: { number: 19, name: 'Lâm', chinese: '臨', meaning: 'Địa Trạch Lâm - Tiếp cận', lines: [0,0,0,0,1,1], essence: 'Cơ hội đang đến gần.', trading: { trend: 'CƠ HỘI ĐẾN', signal: 'Setup sắp hình thành', action: ['Chuẩn bị entry', 'Canh mua', 'Đợi xác nhận'] } },
  20: { number: 20, name: 'Quán', chinese: '觀', meaning: 'Phong Địa Quán - Chiêm ngưỡng', lines: [1,1,0,0,0,0], essence: 'Quan sát, không hành động.', trading: { trend: 'QUAN SÁT', signal: 'Chỉ xem, không trade', action: ['Không vào lệnh', 'Phân tích kỹ', 'Ghi chú pattern'] } },
  21: { number: 21, name: 'Phệ Hạp', chinese: '噬嗑', meaning: 'Hỏa Lôi Phệ Hạp', lines: [1,0,1,1,0,0], essence: 'Quyết đoán, xử lý vấn đề.', trading: { trend: 'QUYẾT ĐOÁN', signal: 'Cần ra quyết định nhanh', action: ['Không do dự', 'Entry/exit dứt khoát', 'Cut loss ngay nếu sai'] } },
  22: { number: 22, name: 'Bí', chinese: '賁', meaning: 'Sơn Hỏa Bí - Trang sức', lines: [0,0,1,1,0,1], essence: 'Vẻ đẹp bên ngoài, cần nhìn sâu.', trading: { trend: 'CẢNH GIÁC', signal: 'Chart đẹp nhưng cần xác nhận', action: ['Không trade theo chart đẹp', 'Check volume', 'Verify signal'] } },
  23: { number: 23, name: 'Bác', chinese: '剝', meaning: 'Sơn Địa Bác - Bóc lột', lines: [0,0,1,0,0,0], essence: 'Suy thoái, mất mát.', trading: { trend: 'DOWNTREND', signal: 'Xu hướng giảm mạnh', action: ['Không long', 'Có thể short nhẹ', 'Bảo toàn vốn'] } },
  24: { number: 24, name: 'Phục', chinese: '復', meaning: 'Địa Lôi Phục - Phục hồi', lines: [0,0,0,1,0,0], essence: 'Quay về, hồi phục.', trading: { trend: 'REVERSAL', signal: 'Đáy đang hình thành', action: ['Theo dõi volume', 'Chuẩn bị long nhẹ', 'Đợi xác nhận'] } },
  25: { number: 25, name: 'Vô Vọng', chinese: '无妄', meaning: 'Thiên Lôi Vô Vọng', lines: [1,1,1,1,0,0], essence: 'Chân thành, không mong cầu.', trading: { trend: 'KHÔNG KỲ VỌNG', signal: 'Trade không kỳ vọng', action: ['Không đặt target quá xa', 'Chấp nhận kết quả', 'Trade theo system'] } },
  26: { number: 26, name: 'Đại Súc', chinese: '大畜', meaning: 'Sơn Thiên Đại Súc', lines: [0,0,1,1,1,1], essence: 'Tích lũy lớn.', trading: { trend: 'TÍCH LŨY LỚN', signal: 'Accumulation zone lớn', action: ['DCA mạnh', 'Giữ dài hạn', 'Đợi big move'] } },
  27: { number: 27, name: 'Di', chinese: '頤', meaning: 'Sơn Lôi Di - Nuôi dưỡng', lines: [0,0,1,1,0,0], essence: 'Chăm sóc, dưỡng nuôi.', trading: { trend: 'BẢO TOÀN VỐN', signal: 'Chăm sóc portfolio', action: ['Không mạo hiểm', 'Bảo vệ lợi nhuận', 'Nuôi dưỡng account'] } },
  28: { number: 28, name: 'Đại Quá', chinese: '大過', meaning: 'Trạch Phong Đại Quá', lines: [0,1,1,1,1,0], essence: 'Quá tải, cần giảm.', trading: { trend: 'OVEREXTENDED', signal: 'Thị trường đã đi quá xa', action: ['Chốt lời', 'Không FOMO', 'Cẩn thận pullback'] } },
  29: { number: 29, name: 'Khảm', chinese: '坎', meaning: 'Thuần Khảm - Hiểm nguy', lines: [0,1,0,0,1,0], essence: 'Nguy hiểm, cẩn trọng.', trading: { trend: 'NGUY HIỂM', signal: 'Thị trường rất rủi ro', action: ['Không giao dịch', 'SL chặt nếu có vị thế', 'Cash is king'] } },
  30: { number: 30, name: 'Ly', chinese: '離', meaning: 'Thuần Ly - Lửa sáng', lines: [1,0,1,1,0,1], essence: 'Sáng tỏ, minh mẫn.', trading: { trend: 'PHÂN TÍCH KỸ', signal: 'Cần nhìn rõ chart', action: ['Review phân tích', 'Check multiple TF', 'Không FOMO'] } },
  31: { number: 31, name: 'Hàm', chinese: '咸', meaning: 'Trạch Sơn Hàm - Cảm ứng', lines: [0,1,1,0,0,1], essence: 'Cảm ứng, tương tác.', trading: { trend: 'SENTIMENT', signal: 'Thị trường nhạy cảm với tin', action: ['Theo dõi news', 'Check social sentiment', 'React nhanh'] } },
  32: { number: 32, name: 'Hằng', chinese: '恆', meaning: 'Lôi Phong Hằng - Bền vững', lines: [1,0,0,1,1,0], essence: 'Kiên định, không thay đổi.', trading: { trend: 'GIỮ VỮNG', signal: 'Giữ chiến lược không đổi', action: ['Không đổi plan', 'Kiên nhẫn', 'Trust the process'] } },
  33: { number: 33, name: 'Độn', chinese: '遯', meaning: 'Thiên Sơn Độn - Rút lui', lines: [1,1,1,0,0,1], essence: 'Rút lui khôn ngoan.', trading: { trend: 'EXIT', signal: 'Nên thoát khỏi thị trường', action: ['Chốt toàn bộ', 'Ra tiền mặt', 'Chờ cơ hội mới'] } },
  34: { number: 34, name: 'Đại Tráng', chinese: '大壯', meaning: 'Lôi Thiên Đại Tráng', lines: [1,0,0,1,1,1], essence: 'Sức mạnh lớn.', trading: { trend: 'STRONG MOMENTUM', signal: 'Momentum rất mạnh', action: ['Ride the wave', 'Không chống trend', 'Tăng size nếu đúng'] } },
  35: { number: 35, name: 'Tấn', chinese: '晉', meaning: 'Hỏa Địa Tấn - Tiến bước', lines: [1,0,1,0,0,0], essence: 'Tiến lên, phát triển.', trading: { trend: 'UPTREND', signal: 'Xu hướng tăng rõ ràng', action: ['Long theo trend', 'Trailing stop', 'Mua thêm khi pullback'] } },
  36: { number: 36, name: 'Minh Di', chinese: '明夷', meaning: 'Địa Hỏa Minh Di', lines: [0,0,0,1,0,1], essence: 'Ánh sáng bị che, ẩn mình.', trading: { trend: 'ẨN MÌNH', signal: 'Không để lộ position', action: ['Trade im lặng', 'Không khoe P/L', 'Bảo vệ lợi nhuận'] } },
  37: { number: 37, name: 'Gia Nhân', chinese: '家人', meaning: 'Phong Hỏa Gia Nhân', lines: [1,1,0,1,0,1], essence: 'Gia đình, nội bộ.', trading: { trend: 'QUẢN LÝ NỘI BỘ', signal: 'Tập trung vào portfolio', action: ['Review positions', 'Rebalance', 'Quản lý risk'] } },
  38: { number: 38, name: 'Khuê', chinese: '睽', meaning: 'Hỏa Trạch Khuê - Đối lập', lines: [1,0,1,0,1,1], essence: 'Mâu thuẫn, bất đồng.', trading: { trend: 'MIXED SIGNALS', signal: 'Các indicator mâu thuẫn', action: ['Không vào lệnh', 'Đợi confluence', 'Tránh overtrading'] } },
  39: { number: 39, name: 'Kiển', chinese: '蹇', meaning: 'Thủy Sơn Kiển - Khó khăn', lines: [0,1,0,0,0,1], essence: 'Trở ngại, chậm tiến.', trading: { trend: 'KHÓ KHĂN', signal: 'Thị trường khó trade', action: ['Giảm size', 'Đợi thị trường dễ hơn', 'Không ép'] } },
  40: { number: 40, name: 'Giải', chinese: '解', meaning: 'Lôi Thủy Giải - Giải thoát', lines: [1,0,0,0,1,0], essence: 'Giải thoát, thoát khỏi.', trading: { trend: 'BREAKOUT', signal: 'Sắp thoát khỏi range', action: ['Chuẩn bị entry', 'Đợi volume confirm', 'Trade breakout'] } },
  41: { number: 41, name: 'Tổn', chinese: '損', meaning: 'Sơn Trạch Tổn - Giảm bớt', lines: [0,0,1,0,1,1], essence: 'Giảm bớt, hy sinh.', trading: { trend: 'CẮT LỖ', signal: 'Cần cut loss', action: ['Chấp nhận thua', 'Cut sớm', 'Bảo toàn vốn còn lại'] } },
  42: { number: 42, name: 'Ích', chinese: '益', meaning: 'Phong Lôi Ích - Tăng thêm', lines: [1,1,0,1,0,0], essence: 'Gia tăng, lợi ích.', trading: { trend: 'TĂNG VỊ THẾ', signal: 'Có thể add thêm vị thế', action: ['Tăng size nếu đúng trend', 'Pyramid', 'Nhưng giữ risk management'] } },
  43: { number: 43, name: 'Quải', chinese: '夬', meaning: 'Trạch Thiên Quải - Quyết đoán', lines: [0,1,1,1,1,1], essence: 'Quyết định dứt khoát.', trading: { trend: 'QUYẾT ĐỊNH', signal: 'Cần quyết định ngay', action: ['Không do dự', 'Entry hoặc exit', 'Dứt khoát'] } },
  44: { number: 44, name: 'Cấu', chinese: '姤', meaning: 'Thiên Phong Cấu - Gặp gỡ', lines: [1,1,1,1,1,0], essence: 'Gặp gỡ bất ngờ.', trading: { trend: 'TIN BẤT NGỜ', signal: 'Có thể có tin bất ngờ', action: ['Cẩn thận overnight', 'Giảm exposure', 'Set alert'] } },
  45: { number: 45, name: 'Tụy', chinese: '萃', meaning: 'Trạch Địa Tụy - Tụ họp', lines: [0,1,1,0,0,0], essence: 'Tập hợp, hội tụ.', trading: { trend: 'CONSOLIDATION', signal: 'Tích lũy, chuẩn bị move', action: ['Đợi breakout', 'Canh entry', 'Volume quan trọng'] } },
  46: { number: 46, name: 'Thăng', chinese: '升', meaning: 'Địa Phong Thăng - Đi lên', lines: [0,0,0,1,1,0], essence: 'Đi lên, thăng tiến.', trading: { trend: 'UPTREND BẮT ĐẦU', signal: 'Xu hướng tăng mới', action: ['Entry long', 'Mua dần', 'Theo trend mới'] } },
  47: { number: 47, name: 'Khốn', chinese: '困', meaning: 'Trạch Thủy Khốn - Khốn khó', lines: [0,1,1,0,1,0], essence: 'Khó khăn, thiếu thốn.', trading: { trend: 'KHÓ KHĂN', signal: 'Tài khoản hoặc thị trường khó', action: ['Nghỉ ngơi', 'Không trade', 'Chờ điều kiện tốt hơn'] } },
  48: { number: 48, name: 'Tỉnh', chinese: '井', meaning: 'Thủy Phong Tỉnh - Giếng', lines: [0,1,0,1,1,0], essence: 'Nước giếng không cạn, nhưng cần gìn giữ.', trading: { trend: 'SIDEWAY - TÍCH LŨY', signal: 'Thị trường đi ngang', action: ['Không vội vàng', 'Tích lũy dần', 'Chờ breakout'] } },
  49: { number: 49, name: 'Cách', chinese: '革', meaning: 'Trạch Hỏa Cách - Thay đổi', lines: [0,1,1,1,0,1], essence: 'Cách mạng, thay đổi lớn.', trading: { trend: 'BREAKOUT', signal: 'Sắp có biến động lớn', action: ['Chuẩn bị cả 2 hướng', 'Đặt pending orders', 'Theo dõi volume'] } },
  50: { number: 50, name: 'Đỉnh', chinese: '鼎', meaning: 'Hỏa Phong Đỉnh - Vạc', lines: [1,0,1,1,1,0], essence: 'Ổn định, đạt đỉnh cao.', trading: { trend: 'GẦN ĐỈNH', signal: 'Có thể đang gần đỉnh', action: ['Chốt lời từng phần', 'Trailing stop', 'Cẩn trọng FOMO'] } },
  51: { number: 51, name: 'Chấn', chinese: '震', meaning: 'Thuần Chấn - Sấm sét', lines: [1,0,0,1,0,0], essence: 'Chấn động, bất ngờ.', trading: { trend: 'VOLATILITY SHOCK', signal: 'Tin tức lớn, biến động đột ngột', action: ['Giảm size', 'Không leverage cao', 'Bình tĩnh quan sát'] } },
  52: { number: 52, name: 'Cấn', chinese: '艮', meaning: 'Thuần Cấn - Núi', lines: [0,0,1,0,0,1], essence: 'Dừng lại, tĩnh lặng.', trading: { trend: 'ĐỨNG NGOÀI', signal: 'Không phải thời điểm trade', action: ['Không trade', 'Nghỉ ngơi', 'Chờ setup rõ ràng'] } },
  53: { number: 53, name: 'Tiệm', chinese: '漸', meaning: 'Phong Sơn Tiệm - Tiến dần', lines: [1,1,0,0,0,1], essence: 'Tiến dần, từng bước.', trading: { trend: 'TỪNG BƯỚC', signal: 'Mua/bán từ từ', action: ['DCA', 'Không all-in', 'Kiên nhẫn'] } },
  54: { number: 54, name: 'Quy Muội', chinese: '歸妹', meaning: 'Lôi Trạch Quy Muội', lines: [1,0,0,0,1,1], essence: 'Quan hệ không cân bằng.', trading: { trend: 'CẢNH BÁO', signal: 'Risk/Reward không tốt', action: ['Không vào lệnh', 'Tìm setup tốt hơn', 'Đợi R:R tốt'] } },
  55: { number: 55, name: 'Phong', chinese: '豐', meaning: 'Lôi Hỏa Phong - Dồi dào', lines: [1,0,0,1,0,1], essence: 'Thịnh vượng, nhưng không kéo dài.', trading: { trend: 'ĐỈNH CHU KỲ', signal: 'Đang ở đỉnh', action: ['Chốt lời phần lớn', 'Không tham', 'Chuẩn bị correction'] } },
  56: { number: 56, name: 'Lữ', chinese: '旅', meaning: 'Hỏa Sơn Lữ - Lữ khách', lines: [1,0,1,0,0,1], essence: 'Di chuyển, tạm thời.', trading: { trend: 'SCALP/DAY TRADE', signal: 'Không giữ vị thế dài', action: ['Trade ngắn hạn', 'Chốt lời nhanh', 'Không swing'] } },
  57: { number: 57, name: 'Tốn', chinese: '巽', meaning: 'Thuần Tốn - Gió', lines: [1,1,0,1,1,0], essence: 'Nhẹ nhàng, thuận theo.', trading: { trend: 'ĐIỀU CHỈNH NHẸ', signal: 'Pullback nhẹ trong trend', action: ['Buy the dip', 'Không panic', 'Theo trend chính'] } },
  58: { number: 58, name: 'Đoài', chinese: '兌', meaning: 'Thuần Đoài - Vui vẻ', lines: [0,1,1,0,1,1], essence: 'Vui vẻ, hài lòng.', trading: { trend: 'TÍCH CỰC', signal: 'Sentiment tích cực', action: ['Theo momentum', 'Đừng chống trend', 'Enjoy the ride'] } },
  59: { number: 59, name: 'Hoán', chinese: '渙', meaning: 'Phong Thủy Hoán - Tan rã', lines: [1,1,0,0,1,0], essence: 'Phân tán, tan rã.', trading: { trend: 'SELL OFF', signal: 'Bán tháo, phân phối', action: ['Không bắt dao', 'Chờ stabilize', 'Cash hoặc short nhẹ'] } },
  60: { number: 60, name: 'Tiết', chinese: '節', meaning: 'Thủy Trạch Tiết - Tiết chế', lines: [0,1,0,0,1,1], essence: 'Tiết chế, giới hạn.', trading: { trend: 'KIỀM CHẾ', signal: 'Cần giới hạn risk', action: ['Giảm size', 'Set max loss', 'Không overtrade'] } },
  61: { number: 61, name: 'Trung Phu', chinese: '中孚', meaning: 'Phong Trạch Trung Phu', lines: [1,1,0,0,1,1], essence: 'Trung thành, tin tưởng.', trading: { trend: 'TIN TƯỞNG SYSTEM', signal: 'Theo đúng chiến lược', action: ['Trust the process', 'Không đổi plan', 'Kiên nhẫn'] } },
  62: { number: 62, name: 'Tiểu Quá', chinese: '小過', meaning: 'Lôi Sơn Tiểu Quá', lines: [1,0,0,0,0,1], essence: 'Đi quá nhưng ít.', trading: { trend: 'ĐIỀU CHỈNH NHỎ', signal: 'Pullback nhỏ', action: ['Không panic', 'Có thể add nhẹ', 'Giữ vững'] } },
  63: { number: 63, name: 'Ký Tế', chinese: '既濟', meaning: 'Thủy Hỏa Ký Tế', lines: [0,1,0,1,0,1], essence: 'Đã hoàn thành.', trading: { trend: 'ĐÓNG VỊ THẾ', signal: 'Mục tiêu đã đạt', action: ['Chốt lời', 'Nghỉ ngơi', 'Review kết quả'] } },
  64: { number: 64, name: 'Vị Tế', chinese: '未濟', meaning: 'Hỏa Thủy Vị Tế', lines: [1,0,1,0,1,0], essence: 'Chưa xong, còn tiềm năng.', trading: { trend: 'TIẾP TỤC', signal: 'Xu hướng chưa xong', action: ['Giữ vị thế', 'Trailing stop', 'Đợi target tiếp'] } },
};

// Get hexagram by number
export const getHexagramByNumber = (number) => {
  return HEXAGRAM_DATABASE[number] || null;
};

// Get trading interpretation formatted
export const getTradingInterpretation = (hexagram) => {
  if (!hexagram || !hexagram.trading) return null;

  const { trend, signal, action } = hexagram.trading;

  return {
    trend,
    signal,
    actionList: action,
    formatted: `→ ${signal}\n${action.map(a => `→ ${a}`).join('\n')}`,
  };
};

// Get all hexagrams as array
export const getAllHexagrams = () => {
  return Object.values(HEXAGRAM_DATABASE).sort((a, b) => a.number - b.number);
};

export default HEXAGRAM_DATABASE;
