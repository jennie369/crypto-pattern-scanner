/**
 * Gemral Chatbot Service
 * I Ching & Tarot reading for trading guidance
 */

import { supabase } from '../lib/supabaseClient';

// I Ching Hexagrams (64 hexagrams - simplified for demo)
const iChingHexagrams = [
  {
    number: 1,
    name: 'Càn',
    chinese: '乾',
    meaning: 'The Creative',
    interpretation: 'Thời điểm mạnh mẽ, sáng tạo. Hãy chủ động và dẫn dắt.',
    trading: 'Xu hướng tăng mạnh. Thị trường bullish. Nên tích cực long position.',
    advice: 'Đây là lúc để hành động quyết đoán. Năng lượng dương cực cao.'
  },
  {
    number: 2,
    name: 'Khôn',
    chinese: '坤',
    meaning: 'The Receptive',
    interpretation: 'Thời điểm nhận, chờ đợi. Hãy kiên nhẫn và tiếp nhận.',
    trading: 'Thị trường đang tích lũy. Nên quan sát và chờ tín hiệu rõ ràng.',
    advice: 'Đừng vội vàng. Hãy lắng nghe và học hỏi.'
  },
  {
    number: 3,
    name: 'Truân',
    chinese: '屯',
    meaning: 'Difficulty at the Beginning',
    interpretation: 'Khởi đầu khó khăn nhưng sẽ dần khắc phục.',
    trading: 'Thị trường biến động. Cần quản lý risk cẩn thận.',
    advice: 'Kiên nhẫn vượt qua giai đoạn khó khăn ban đầu.'
  },
  {
    number: 4,
    name: 'Mông',
    chinese: '蒙',
    meaning: 'Youthful Folly',
    interpretation: 'Cần học hỏi và phát triển trí tuệ.',
    trading: 'Chưa phải lúc để trade lớn. Hãy học và rèn luyện thêm.',
    advice: 'Tìm kiếm guidance từ người có kinh nghiệm.'
  },
  {
    number: 5,
    name: 'Nhu',
    chinese: '需',
    meaning: 'Waiting',
    interpretation: 'Chờ đợi đúng thời điểm.',
    trading: 'Đừng FOMO. Chờ setup hoàn hảo.',
    advice: 'Sự kiên nhẫn sẽ mang lại thành công.'
  },
  {
    number: 6,
    name: 'Tụng',
    chinese: '訟',
    meaning: 'Conflict',
    interpretation: 'Xung đột, tranh chấp. Cần tránh tranh cãi gay gắt.',
    trading: 'Thị trường có tín hiệu mâu thuẫn. BTC có thể sideway. Không nên vào lệnh lớn.',
    advice: 'Hãy tìm cách hòa giải và thỏa hiệp. Tránh FOMO và quyết định vội vàng.'
  },
  {
    number: 7,
    name: 'Sư',
    chinese: '師',
    meaning: 'The Army',
    interpretation: 'Đội quân, kỷ luật, tổ chức. Cần có kế hoạch rõ ràng.',
    trading: 'Cần chiến lược rõ ràng và kỷ luật nghiêm ngặt. Quản lý risk như quân đội.',
    advice: 'Hãy có kế hoạch rõ ràng và kỷ luật. Lãnh đạo với trách nhiệm.'
  },
  {
    number: 8,
    name: 'Tỷ',
    chinese: '比',
    meaning: 'Union',
    interpretation: 'Đoàn kết, hợp tác, liên minh. Sức mạnh từ sự đoàn kết.',
    trading: 'Hãy theo dõi các trader giỏi, tham gia cộng đồng. Học hỏi từ tập thể.',
    advice: 'Sức mạnh nằm ở sự đoàn kết. Hãy xây dựng mối quan hệ tốt đẹp.'
  },
  {
    number: 9,
    name: 'Tiểu Súc',
    chinese: '小畜',
    meaning: 'Small Accumulation',
    interpretation: 'Tích lũy nhỏ, từng bước tiến. Kiên nhẫn tích lũy.',
    trading: 'DCA (Dollar Cost Average) là chiến lược tốt. Tích lũy từng ít một.',
    advice: 'Hãy kiên nhẫn tích lũy. Những bước nhỏ sẽ dẫn đến thành công lớn.'
  },
  {
    number: 10,
    name: 'Lý',
    chinese: '履',
    meaning: 'Treading Carefully',
    interpretation: 'Cẩn trọng, đi đúng đường. Thận trọng trong mọi hành động.',
    trading: 'Hãy cẩn thận với mỗi lệnh. Leverage thấp, stoploss chặt chẽ.',
    advice: 'Hãy thận trọng trong mọi hành động. Giữ vững nguyên tắc của bạn.'
  },
  {
    number: 11,
    name: 'Thái',
    chinese: '泰',
    meaning: 'Peace',
    interpretation: 'Thịnh vượng, hòa hợp, thuận lợi. Thời điểm tốt đẹp.',
    trading: 'Thị trường bullish mạnh. Mọi setup đều thuận lợi. Hãy tận dụng.',
    advice: 'Thời điểm tốt đẹp. Hãy tận dụng cơ hội và chia sẻ thành công.'
  },
  {
    number: 12,
    name: 'Bĩ',
    chinese: '否',
    meaning: 'Standstill',
    interpretation: 'Tắc nghẽn, khó khăn, đình trệ. Không nên hành động.',
    trading: 'Thị trường bearish hoặc sideway tẻ nhạt. Cash is king. Bảo toàn vốn.',
    advice: 'Hãy kiên nhẫn chờ đợi. Không nên hành động khi thời điểm chưa thuận.'
  },
  {
    number: 13,
    name: 'Đồng Nhân',
    chinese: '同人',
    meaning: 'Fellowship',
    interpretation: 'Bạn bè, hợp tác, cộng đồng. Thành công từ đoàn kết.',
    trading: 'Hợp tác với trader khác, chia sẻ analysis. Social trading có thể có lợi.',
    advice: 'Hãy mở lòng và hợp tác. Thành công đến từ sự đoàn kết.'
  },
  {
    number: 14,
    name: 'Đại Hữu',
    chinese: '大有',
    meaning: 'Great Possession',
    interpretation: 'Tài sản lớn, thịnh vượng, dồi dào. Thời kỳ giàu có.',
    trading: 'Portfolio đang ở đỉnh cao. Hãy take profit một phần và chia sẻ kiến thức.',
    advice: 'Thời kỳ thịnh vượng. Hãy biết ơn và chia sẻ với người khác.'
  },
  {
    number: 15,
    name: 'Khiêm',
    chinese: '謙',
    meaning: 'Modesty',
    interpretation: 'Khiêm tốn, hạ mình, từ tốn. Khiêm tốn là sức mạnh.',
    trading: 'Đừng kiêu ngạo khi thắng. Thị trường luôn dạy bài học khiêm tốn.',
    advice: 'Khiêm tốn là sức mạnh. Hãy lắng nghe và học hỏi từ người khác.'
  },
  {
    number: 16,
    name: 'Dự',
    chinese: '豫',
    meaning: 'Enthusiasm',
    interpretation: 'Nhiệt tình, hào hứng, vui vẻ. Năng lượng tích cực.',
    trading: 'Tâm lý thị trường tích cực. FOMO có thể xuất hiện. Vẫn cần kỷ luật.',
    advice: 'Hãy tận hưởng niềm vui. Năng lượng tích cực thu hút may mắn.'
  },
  {
    number: 17,
    name: 'Tùy',
    chinese: '隨',
    meaning: 'Following',
    interpretation: 'Theo đuổi, thích nghi, linh hoạt. Cần thay đổi hướng đi.',
    trading: 'Follow the trend. Đừng chống lại thị trường. Theo dòng chảy tự nhiên.',
    advice: 'Hãy linh hoạt thích nghi. Đôi khi cần thay đổi hướng đi.'
  },
  {
    number: 18,
    name: 'Cổ',
    chinese: '蠱',
    meaning: 'Work on Decay',
    interpretation: 'Sửa chữa, cải thiện, khắc phục. Đối diện với vấn đề.',
    trading: 'Review và fix các lỗi trong trading system. Cải thiện chiến lược.',
    advice: 'Thời điểm sửa sai và cải thiện. Hãy đối diện với vấn đề.'
  },
  {
    number: 19,
    name: 'Lâm',
    chinese: '臨',
    meaning: 'Approach',
    interpretation: 'Tiếp cận, lãnh đạo, chăm sóc. Tiến lên với trách nhiệm.',
    trading: 'Thời điểm để lead, không follow. Có thể vào vị thế sớm hơn đám đông.',
    advice: 'Hãy tiến lên với trách nhiệm. Người khác đang tin tưởng vào bạn.'
  },
  {
    number: 20,
    name: 'Quan',
    chinese: '觀',
    meaning: 'Contemplation',
    interpretation: 'Quan sát, suy ngẫm, hiểu biết. Quan sát kỹ trước hành động.',
    trading: 'Chưa phải lúc trade. Hãy quan sát thị trường, học hỏi pattern.',
    advice: 'Hãy quan sát kỹ trước khi hành động. Sự hiểu biết sâu sắc là chìa khóa.'
  },
  {
    number: 21,
    name: 'Phệ Hạp',
    chinese: '噬嗑',
    meaning: 'Biting Through',
    interpretation: 'Cắn đứt, giải quyết, xử lý. Quyết đoán xử lý vấn đề.',
    trading: 'Cut loss quyết đoán. Đừng để lỗ nhỏ thành lỗ lớn. Discipline is key.',
    advice: 'Hãy quyết đoán xử lý vấn đề. Công lý cần được thực thi.'
  },
  {
    number: 22,
    name: 'Bí',
    chinese: '賁',
    meaning: 'Grace',
    interpretation: 'Trang trí, vẻ đẹp, nghệ thuật. Chú ý đến hình thức.',
    trading: 'Chart pattern đẹp, setup đẹp. Nhưng đừng quên fundamentals.',
    advice: 'Hãy chú ý đến hình thức. Vẻ đẹp bên ngoài cũng quan trọng.'
  },
  {
    number: 23,
    name: 'Bác',
    chinese: '剝',
    meaning: 'Splitting Apart',
    interpretation: 'Tróc lột, suy thoái, rụng rơi. Thời kỳ khó khăn.',
    trading: 'Downtrend mạnh. Hãy bảo toàn vốn. Không revenge trade.',
    advice: 'Thời kỳ khó khăn. Hãy bảo toàn sức lực và chờ thời.'
  },
  {
    number: 24,
    name: 'Phục',
    chinese: '復',
    meaning: 'Return',
    interpretation: 'Trở lại, tái sinh, phục hồi. Ánh sáng trở lại.',
    trading: 'Market reversal. Cơ hội mua đáy sau downtrend. Nhưng cần confirm.',
    advice: 'Ánh sáng trở lại sau bóng tối. Hãy bắt đầu lại với hy vọng.'
  },
  {
    number: 25,
    name: 'Vô Vọng',
    chinese: '無妄',
    meaning: 'Innocence',
    interpretation: 'Chân thật, không giả tạo, tự nhiên. Sống chân thật.',
    trading: 'Đừng dùng tricks, scams, pump dump. Trade với integrity.',
    advice: 'Hãy sống chân thật với chính mình. Đừng cố tạo ra điều gì giả tạo.'
  },
  {
    number: 26,
    name: 'Đại Súc',
    chinese: '大畜',
    meaning: 'Great Accumulation',
    interpretation: 'Tích lũy lớn, kiềm chế, dự trữ. Chuẩn bị cho tương lai.',
    trading: 'Accumulation phase. Whale đang mua âm thầm. Hãy DCA.',
    advice: 'Hãy tích lũy sức mạnh. Thời điểm để chuẩn bị cho tương lai.'
  },
  {
    number: 27,
    name: 'Di',
    chinese: '頤',
    meaning: 'Nourishment',
    interpretation: 'Nuôi dưỡng, ăn uống, chăm sóc. Chú ý sức khỏe.',
    trading: 'Nuôi dưỡng portfolio. Không over-trade. Take care of mental health.',
    advice: 'Hãy chú ý đến sức khỏe thể chất và tinh thần. Nuôi dưỡng bản thân.'
  },
  {
    number: 28,
    name: 'Đại Quá',
    chinese: '大過',
    meaning: 'Great Excess',
    interpretation: 'Vượt quá, quá tải, thái quá. Cần cân bằng.',
    trading: 'Over-leveraged, over-traded. Cần giảm position size và nghỉ ngơi.',
    advice: 'Hãy cẩn thận với sự thái quá. Cần cân bằng và điều độ.'
  },
  {
    number: 29,
    name: 'Khảm',
    chinese: '坎',
    meaning: 'The Abysmal Water',
    interpretation: 'Nước, nguy hiểm, thử thách. Thận trọng trong nguy hiểm.',
    trading: 'Thị trường nguy hiểm, nhiều trap. Giảm leverage, tăng stoploss.',
    advice: 'Hãy thận trọng trong nguy hiểm. Giữ vững niềm tin để vượt qua.'
  },
  {
    number: 30,
    name: 'Ly',
    chinese: '離',
    meaning: 'The Clinging Fire',
    interpretation: 'Lửa, sáng tỏ, rực rỡ. Sự rõ ràng đang đến.',
    trading: 'Setup rõ ràng, breakout confirmed. Có thể tăng position size.',
    advice: 'Hãy tỏa sáng bản chất của bạn. Sự rõ ràng đang đến.'
  },
  {
    number: 31,
    name: 'Hàm',
    chinese: '咸',
    meaning: 'Influence',
    interpretation: 'Cảm ứng, thu hút, tình yêu. Mở lòng với tình cảm.',
    trading: 'Market sentiment tích cực. Social volume tăng. Có thể là top signal.',
    advice: 'Hãy mở lòng với tình cảm. Sự thu hút lẫn nhau là tự nhiên.'
  },
  {
    number: 32,
    name: 'Hằng',
    chinese: '恆',
    meaning: 'Duration',
    interpretation: 'Bền vững, kiên định, lâu dài. Kiên trì và nhất quán.',
    trading: 'Duy trì kỷ luật trading hàng ngày. Consistency > big wins.',
    advice: 'Hãy kiên trì và nhất quán. Thành công đến từ sự kiên định.'
  },
  {
    number: 33,
    name: 'Độn',
    chinese: '遯',
    meaning: 'Retreat',
    interpretation: 'Rút lui, né tránh, nghỉ ngơi. Rút lui là khôn ngoan.',
    trading: 'Market top. Hãy take profit và đứng ngoài. Preserve capital.',
    advice: 'Đôi khi rút lui là khôn ngoan. Hãy bảo toàn sức lực.'
  },
  {
    number: 34,
    name: 'Đại Tráng',
    chinese: '大壯',
    meaning: 'Great Power',
    interpretation: 'Sức mạnh lớn, hùng mạnh, quyền lực. Sức mạnh ở đỉnh cao.',
    trading: 'Strong momentum. Trend mạnh. Có thể swing trade với position lớn hơn.',
    advice: 'Sức mạnh của bạn đang ở đỉnh cao. Hãy sử dụng khôn ngoan.'
  },
  {
    number: 35,
    name: 'Tấn',
    chinese: '晉',
    meaning: 'Progress',
    interpretation: 'Tiến lên, phát triển, thăng tiến. Thuận lợi để tiến lên.',
    trading: 'Uptrend rõ ràng. Mỗi pullback là cơ hội mua thêm. Add to winners.',
    advice: 'Thời điểm thuận lợi để tiến lên. Hãy nắm bắt cơ hội.'
  },
  {
    number: 36,
    name: 'Minh Di',
    chinese: '明夷',
    meaning: 'Darkening of the Light',
    interpretation: 'Ánh sáng che giấu, khó khăn tạm thời. Kiên nhẫn trong bóng tối.',
    trading: 'Bear market. Hãy kiên nhẫn, đừng panic sell. Accumulate quality.',
    advice: 'Hãy kiên nhẫn trong bóng tối. Ánh sáng sẽ trở lại.'
  },
  {
    number: 37,
    name: 'Gia Nhân',
    chinese: '家人',
    meaning: 'The Family',
    interpretation: 'Gia đình, người thân, tình cảm. Chú trọng gia đình.',
    trading: 'Đừng để trading ảnh hưởng gia đình. Balance life. Family first.',
    advice: 'Hãy chú trọng gia đình và người thân. Hạnh phúc bắt đầu từ nhà.'
  },
  {
    number: 38,
    name: 'Khuê',
    chinese: '睽',
    meaning: 'Opposition',
    interpretation: 'Đối lập, khác biệt, xa cách. Chấp nhận sự khác biệt.',
    trading: 'Divergence giữa indicators. Tín hiệu mâu thuẫn. Cẩn thận.',
    advice: 'Hãy chấp nhận sự khác biệt. Tìm điểm chung để hòa giải.'
  },
  {
    number: 39,
    name: 'Kiển',
    chinese: '蹇',
    meaning: 'Obstruction',
    interpretation: 'Trở ngại, khó khăn, cản trở. Kiên nhẫn đối diện trở ngại.',
    trading: 'Nhiều resistance levels. Breakout khó. Hãy kiên nhẫn hoặc đổi coin.',
    advice: 'Hãy kiên nhẫn đối diện trở ngại. Tìm cách khác thay vì cứng nhắc.'
  },
  {
    number: 40,
    name: 'Giải',
    chinese: '解',
    meaning: 'Deliverance',
    interpretation: 'Giải thoát, cởi trói, tự do. Thời điểm giải tỏa.',
    trading: 'Breakout thành công. Giải thoát khỏi consolidation. Trend mới bắt đầu.',
    advice: 'Thời điểm giải tỏa. Hãy buông bỏ những gì không còn phục vụ bạn.'
  },
  {
    number: 41,
    name: 'Tổn',
    chinese: '損',
    meaning: 'Decrease',
    interpretation: 'Giảm bớt, hy sinh, mất mát. Hy sinh nhỏ cho lợi ích lớn.',
    trading: 'Cut losing positions. Giảm portfolio để focus vào best setups.',
    advice: 'Đôi khi cần hy sinh nhỏ để đạt được điều lớn lao hơn.'
  },
  {
    number: 42,
    name: 'Ích',
    chinese: '益',
    meaning: 'Increase',
    interpretation: 'Lợi ích, tăng thêm, phát triển. Thời kỳ tăng trưởng.',
    trading: 'Portfolio growth phase. Compound gains. Reinvest profits wisely.',
    advice: 'Thời kỳ tăng trưởng. Hãy chia sẻ lợi ích với người khác.'
  },
  {
    number: 43,
    name: 'Quyết',
    chinese: '夬',
    meaning: 'Breakthrough',
    interpretation: 'Quyết đoán, đột phá, kiên quyết. Tạo ra bước đột phá.',
    trading: 'Major breakout. All time high. Hãy quyết đoán take profit theo kế hoạch.',
    advice: 'Hãy quyết đoán hành động. Đã đến lúc tạo ra bước đột phá.'
  },
  {
    number: 44,
    name: 'Cấu',
    chinese: '姤',
    meaning: 'Coming to Meet',
    interpretation: 'Gặp gỡ, tình cờ, duyên số. Cẩn thận với cuộc gặp gỡ.',
    trading: 'Có thể gặp scam project, rugpull. DYOR carefully. Not all opportunities are good.',
    advice: 'Hãy cẩn thận với những cuộc gặp gỡ. Không phải mọi duyên đều tốt.'
  },
  {
    number: 45,
    name: 'Tụy',
    chinese: '萃',
    meaning: 'Gathering Together',
    interpretation: 'Tập hợp, hội họp, đoàn tụ. Tập hợp sức mạnh.',
    trading: 'Accumulation by whales. Volume tăng dần. Chuẩn bị cho big move.',
    advice: 'Thời điểm tập hợp sức mạnh. Hãy xây dựng cộng đồng vững chắc.'
  },
  {
    number: 46,
    name: 'Thăng',
    chinese: '升',
    meaning: 'Pushing Upward',
    interpretation: 'Thăng tiến, đi lên, phát triển. Con đường đi lên mở ra.',
    trading: 'Steady uptrend. Higher highs, higher lows. Perfect for trend following.',
    advice: 'Con đường đi lên đang mở ra. Hãy từng bước tiến lên vững chắc.'
  },
  {
    number: 47,
    name: 'Khốn',
    chinese: '困',
    meaning: 'Oppression',
    interpretation: 'Khó khăn, túng quẫn, mệt mỏi. Giữ vững tinh thần.',
    trading: 'Portfolio down big. Đừng panic. Rest, recharge, comeback stronger.',
    advice: 'Hãy giữ vững tinh thần trong khó khăn. Nghỉ ngơi để phục hồi.'
  },
  {
    number: 48,
    name: 'Tỉnh',
    chinese: '井',
    meaning: 'The Well',
    interpretation: 'Giếng nước, nguồn lực, nền tảng. Chăm sóc nguồn lực.',
    trading: 'Preserve capital. Đó là nguồn nước sinh mệnh của trader. Protect it.',
    advice: 'Hãy chăm sóc nguồn lực của bạn. Nền tảng vững chắc là quan trọng.'
  },
  {
    number: 49,
    name: 'Cách',
    chinese: '革',
    meaning: 'Revolution',
    interpretation: 'Thay đổi, cách mạng, đổi mới. Dũng cảm đổi mới.',
    trading: 'Thay đổi strategy nếu không hiệu quả. Adapt or die. Evolution is key.',
    advice: 'Thời điểm cần thay đổi lớn. Hãy dũng cảm đổi mới.'
  },
  {
    number: 50,
    name: 'Đỉnh',
    chinese: '鼎',
    meaning: 'The Cauldron',
    interpretation: 'Nồi đỉnh, nuôi dưỡng, biến đổi. Như vàng luyện trong lửa.',
    trading: 'Thử thách làm trader mạnh mẽ hơn. Market cycles temper you.',
    advice: 'Hãy biến đổi và nâng cao. Như vàng luyện trong lửa.'
  },
  {
    number: 51,
    name: 'Chấn',
    chinese: '震',
    meaning: 'The Arousing Thunder',
    interpretation: 'Sấm sét, chấn động, đột ngột. Bình tĩnh trước biến cố.',
    trading: 'Flash crash, breaking news. Stay calm. Không panic. Kiểm tra stoploss.',
    advice: 'Hãy bình tĩnh trước biến cố. Sau cơn bão là bình yên.'
  },
  {
    number: 52,
    name: 'Cấn',
    chinese: '艮',
    meaning: 'Keeping Still',
    interpretation: 'Núi, dừng lại, yên tĩnh. Không làm gì là khôn ngoan.',
    trading: 'Flat market. No clear trend. Best action is no action. Cash gang.',
    advice: 'Hãy dừng lại và suy ngẫm. Đôi khi không làm gì là khôn ngoan.'
  },
  {
    number: 53,
    name: 'Tiệm',
    chinese: '漸',
    meaning: 'Gradual Progress',
    interpretation: 'Tiến dần, từ từ, ổn định. Tiến bộ từng bước.',
    trading: 'Slow and steady wins. Đừng FOMO vào pump. Consistent small gains > big risks.',
    advice: 'Hãy tiến bộ từng bước. Sự vội vàng sẽ dẫn đến sai lầm.'
  },
  {
    number: 54,
    name: 'Qui Muội',
    chinese: '歸妹',
    meaning: 'The Marrying Maiden',
    interpretation: 'Gả con gái, cam chịu, thích nghi. Chấp nhận hoàn cảnh.',
    trading: 'Accept market conditions as they are. Đừng fight the Fed. Flow with market.',
    advice: 'Hãy chấp nhận hoàn cảnh. Đôi khi cần thích nghi thay vì chống lại.'
  },
  {
    number: 55,
    name: 'Phong',
    chinese: '豐',
    meaning: 'Abundance',
    interpretation: 'Phong phú, dồi dào, cao điểm. Biết ơn và chia sẻ.',
    trading: 'Peak of bull market. Euphoria. Đây là lúc để take profit, không FOMO.',
    advice: 'Đỉnh cao đang đến. Hãy biết ơn và chia sẻ sự phong phú.'
  },
  {
    number: 56,
    name: 'Lữ',
    chinese: '旅',
    meaning: 'The Wanderer',
    interpretation: 'Đi du lịch, lưu lạc, tạm trú. Linh hoạt và thích nghi.',
    trading: 'Trade multiple coins, timeframes. Đừng marry your bags. Be flexible.',
    advice: 'Hãy linh hoạt và thích nghi. Cuộc hành trình là bài học.'
  },
  {
    number: 57,
    name: 'Tốn',
    chinese: '巽',
    meaning: 'The Gentle Wind',
    interpretation: 'Gió, nhẹ nhàng, thâm nhập. Nhẹ nhàng nhưng kiên trì.',
    trading: 'Small positions, frequent trades. Grind slowly. Patience and persistence.',
    advice: 'Hãy nhẹ nhàng nhưng kiên trì. Như gió xuyên qua khe hở.'
  },
  {
    number: 58,
    name: 'Đoài',
    chinese: '兌',
    meaning: 'The Joyous Lake',
    interpretation: 'Hồ, vui vẻ, giao tiếp. Mở lòng giao tiếp.',
    trading: 'Share profits, help community. Trading is better when shared. Joy attracts luck.',
    advice: 'Hãy mở lòng giao tiếp. Niềm vui chia sẻ là niềm vui nhân đôi.'
  },
  {
    number: 59,
    name: 'Hoán',
    chinese: '渙',
    meaning: 'Dispersion',
    interpretation: 'Tan rã, giải tán, buông bỏ. Sự linh hoạt mang tự do.',
    trading: 'Diversify. Đừng all-in một coin. Spread risk. Buông bỏ ego trades.',
    advice: 'Hãy buông bỏ những gì cứng nhắc. Sự linh hoạt mang lại tự do.'
  },
  {
    number: 60,
    name: 'Tiết',
    chinese: '節',
    meaning: 'Limitation',
    interpretation: 'Tiết chế, giới hạn, kỷ luật. Cân bằng mang hài hòa.',
    trading: 'Risk management. Không trade quá 2-3% account mỗi lệnh. Discipline wins.',
    advice: 'Hãy có kỷ luật và tiết chế. Sự cân bằng mang lại hài hòa.'
  },
  {
    number: 61,
    name: 'Trung Phu',
    chinese: '中孚',
    meaning: 'Inner Truth',
    interpretation: 'Chân thành, trung thực, nội tâm. Sự trung thực tạo niềm tin.',
    trading: 'Trade với integrity. Journal honestly. Admit mistakes. Truth leads to growth.',
    advice: 'Hãy sống chân thành. Sự trung thực tạo nên niềm tin.'
  },
  {
    number: 62,
    name: 'Tiểu Quá',
    chinese: '小過',
    meaning: 'Small Exceeding',
    interpretation: 'Vượt nhỏ, chi tiết, cẩn thận. Chú ý đến chi tiết nhỏ.',
    trading: 'Details matter. Check fees, slippage, tax. Small things compound over time.',
    advice: 'Hãy chú ý đến chi tiết nhỏ. Thành công nằm ở sự tỉ mỉ.'
  },
  {
    number: 63,
    name: 'Ký Tế',
    chinese: '既濟',
    meaning: 'After Completion',
    interpretation: 'Hoàn thành, thành công, cân bằng. Giữ vững để hoàn tất.',
    trading: 'Trade plan executed perfectly. Target hit. Giờ là lúc take profit và rest.',
    advice: 'Thành công đang ở rất gần. Hãy giữ vững để hoàn tất.'
  },
  {
    number: 64,
    name: 'Vị Tế',
    chinese: '未濟',
    meaning: 'Before Completion',
    interpretation: 'Chưa hoàn thành, tiềm năng, khởi đầu. Tiếp tục với hy vọng.',
    trading: 'Journey continues. Market never ends. Always learning, always growing. Keep going.',
    advice: 'Hành trình chưa kết thúc. Hãy tiếp tục với hy vọng và kiên trì.'
  }
];

// Tarot Cards (Major Arcana)
const tarotCards = [
  {
    number: 0,
    name: 'The Fool',
    vietnamese: 'Kẻ Khờ Dại',
    upright: 'Khởi đầu mới, tự do, vô tư',
    reversed: 'Liều lĩnh, thiếu chuẩn bị',
    trading: 'Cơ hội mới xuất hiện. Có thể thử nghiệm chiến lược mới nhưng với vốn nhỏ.',
    advice: 'Hãy mở lòng với những khả năng mới, nhưng đừng bỏ qua rủi ro.'
  },
  {
    number: 1,
    name: 'The Magician',
    vietnamese: 'Nhà Ảo Thuật',
    upright: 'Kỹ năng, quyền lực, hành động',
    reversed: 'Lừa dối, thao túng',
    trading: 'Bạn có đủ công cụ để thành công. Hãy sử dụng kỹ năng của mình.',
    advice: 'Tập trung vào việc áp dụng kiến thức đã học.'
  },
  {
    number: 2,
    name: 'The High Priestess',
    vietnamese: 'Nữ Tư Tế',
    upright: 'Trực giác, bí mật, tiềm thức',
    reversed: 'Thiếu sự rõ ràng, bỏ qua trực giác',
    trading: 'Hãy tin vào trực giác của bạn. Thông tin ẩn có thể quan trọng.',
    advice: 'Lắng nghe tiếng nói bên trong. Thiền định trước khi giao dịch.'
  },
  {
    number: 3,
    name: 'The Empress',
    vietnamese: 'Nữ Hoàng',
    upright: 'Sự phồn thịnh, sáng tạo, nuôi dưỡng',
    reversed: 'Phụ thuộc, sự thiếu hụt',
    trading: 'Thị trường đang trong giai đoạn growth. Hãy nuôi dưỡng portfolio.',
    advice: 'Đầu tư vào tương lai. Tạo ra giá trị lâu dài.'
  },
  {
    number: 4,
    name: 'The Emperor',
    vietnamese: 'Hoàng Đế',
    upright: 'Cấu trúc, quyền lực, kỷ luật',
    reversed: 'Độc đoán, thiếu linh hoạt',
    trading: 'Cần kỷ luật và tuân thủ chiến lược. Đừng trade cảm tính.',
    advice: 'Xây dựng hệ thống và tuân theo nó nghiêm ngặt.'
  },
  {
    number: 5,
    name: 'The Hierophant',
    vietnamese: 'Thầy Tu',
    upright: 'Truyền thống, giáo dục, hệ thống niềm tin',
    reversed: 'Phá vỡ truyền thống, tư duy mới',
    trading: 'Theo các phương pháp đã được kiểm chứng. Đừng nghĩ mình thông minh hơn thị trường.',
    advice: 'Học từ những trader thành công.'
  },
  {
    number: 6,
    name: 'The Lovers',
    vietnamese: 'Người Yêu',
    upright: 'Lựa chọn, sự hòa hợp, quan hệ',
    reversed: 'Mất cân bằng, lựa chọn sai',
    trading: 'Cần đưa ra quyết định quan trọng. Cân nhắc kỹ risk/reward.',
    advice: 'Chọn con đường phù hợp với giá trị của bạn.'
  },
  {
    number: 7,
    name: 'The Chariot',
    vietnamese: 'Xe Ngựa',
    upright: 'Chiến thắng, ý chí, kiểm soát',
    reversed: 'Mất kiểm soát, thiếu định hướng',
    trading: 'Momentum mạnh. Hãy ride the trend nhưng đừng quên stoploss.',
    advice: 'Kiểm soát cảm xúc và duy trì kỷ luật.'
  },
  {
    number: 8,
    name: 'Strength',
    vietnamese: 'Sức Mạnh',
    upright: 'Can đảm, kiên nhẫn, lòng thương',
    reversed: 'Yếu đuối, tự ti, thiếu kiểm soát',
    trading: 'Cần sức mạnh tinh thần để hold qua volatility.',
    advice: 'Kiên nhẫn và can đảm trong trading.'
  },
  {
    number: 9,
    name: 'The Hermit',
    vietnamese: 'Ẩn Sĩ',
    upright: 'Tìm kiếm nội tại, sự cô độc, hướng dẫn',
    reversed: 'Cô lập, lạc lõng',
    trading: 'Thời gian để review và học hỏi. Đừng trade khi chưa rõ ràng.',
    advice: 'Tìm kiếm sự thật bên trong. Thiền định và tự phản tỉnh.'
  },
  {
    number: 10,
    name: 'Wheel of Fortune',
    vietnamese: 'Bánh Xe May Mắn',
    upright: 'Chu kỳ, thay đổi, số mệnh',
    reversed: 'Không may mắn, kháng cự thay đổi',
    trading: 'Thị trường có chu kỳ. Hiểu và tận dụng cycle.',
    advice: 'Chấp nhận sự thay đổi. Không gì là vĩnh cửu.'
  },
  {
    number: 11,
    name: 'Justice',
    vietnamese: 'Công Lý',
    suit: 'major',
    upright: 'Công bằng, cân bằng, chân lý, karma, trách nhiệm',
    reversed: 'Bất công, mất cân bằng, trốn tránh trách nhiệm',
    trading: 'Thị trường đang tìm sự cân bằng sau biến động. Price action phản ánh đúng giá trị. Hãy trade công bằng.',
    advice: 'Hành động với integrity. Những gì bạn làm sẽ quay lại với bạn (karma).'
  },
  {
    number: 12,
    name: 'The Hanged Man',
    vietnamese: 'Người Treo Ngược',
    suit: 'major',
    upright: 'Buông bỏ, góc nhìn mới, hy sinh, chờ đợi',
    reversed: 'Trì hoãn, kháng cự, vô ích',
    trading: 'Đôi khi cần ngừng trade và nhìn từ góc độ khác. Thị trường đang test patience.',
    advice: 'Buông bỏ ego. Perspective mới có thể mở ra giải pháp.'
  },
  {
    number: 13,
    name: 'Death',
    vietnamese: 'Cái Chết',
    suit: 'major',
    upright: 'Kết thúc, chuyển hóa, thay đổi, khởi đầu mới',
    reversed: 'Kháng cự thay đổi, không thể buông bỏ, đình trệ',
    trading: 'Một cycle kết thúc, cycle mới bắt đầu. Bear to bull hoặc ngược lại. Embrace change.',
    advice: 'Đừng sợ endings. Chúng là khởi đầu của something new.'
  },
  {
    number: 14,
    name: 'Temperance',
    vietnamese: 'Tiết Chế',
    suit: 'major',
    upright: 'Cân bằng, hòa hợp, kiên nhẫn, hòa giải',
    reversed: 'Mất cân bằng, thái quá, thiếu kiên nhẫn',
    trading: 'Balance là chìa khóa. Đừng over-leverage, over-trade. Moderation in all things.',
    advice: 'Hãy kiên nhẫn và cân bằng trong mọi quyết định.'
  },
  {
    number: 15,
    name: 'The Devil',
    vietnamese: 'Ác Quỷ',
    suit: 'major',
    upright: 'Ràng buộc, nghiện ngập, vật chất, bóng tối',
    reversed: 'Giải thoát, giác ngộ, phá vỡ ràng buộc',
    trading: 'Trading addiction, gambling, FOMO. Hãy recognize unhealthy patterns và break free.',
    advice: 'Nhận ra những gì đang giữ bạn lại. Bạn có quyền tự do.'
  },
  {
    number: 16,
    name: 'The Tower',
    vietnamese: 'Tháp',
    suit: 'major',
    upright: 'Biến động đột ngột, sụp đổ, giác ngộ, hỗn loạn',
    reversed: 'Tránh thảm họa, sợ thay đổi, chậm chạp',
    trading: 'Black swan event. Market crash. Foundation cũ sụp đổ nhưng mở đường cho rebuild stronger.',
    advice: 'Sau destruction là construction. Stay calm trong chaos.'
  },
  {
    number: 17,
    name: 'The Star',
    vietnamese: 'Ngôi Sao',
    suit: 'major',
    upright: 'Hy vọng, niềm tin, hồi sinh, tâm linh',
    reversed: 'Tuyệt vọng, thiếu tin tưởng, mất phương hướng',
    trading: 'Sau bear market là recovery. Light at end of tunnel. Have faith.',
    advice: 'Giữ vững hy vọng và niềm tin. Tương lai tươi sáng hơn bạn nghĩ.'
  },
  {
    number: 18,
    name: 'The Moon',
    vietnamese: 'Mặt Trăng',
    suit: 'major',
    upright: 'Ảo tưởng, trực giác, sợ hãi, tiềm thức',
    reversed: 'Giải phóng sợ hãi, sự rõ ràng, hiểu biết',
    trading: 'FUD, manipulation, fake news. Trust your intuition. Not everything is as it seems.',
    advice: 'Phân biệt giữa fear và intuition. Follow inner wisdom.'
  },
  {
    number: 19,
    name: 'The Sun',
    vietnamese: 'Mặt Trời',
    suit: 'major',
    upright: 'Thành công, niềm vui, tích cực, sinh lực',
    reversed: 'Quá lạc quan, chán nản tạm thời',
    trading: 'Bull market euphoria. Everything pumping. Perfect time nhưng đừng quá greedy.',
    advice: 'Tận hưởng thành công nhưng stay humble. Peak có thể gần.'
  },
  {
    number: 20,
    name: 'Judgement',
    vietnamese: 'Phán Xét',
    suit: 'major',
    upright: 'Tái sinh, phản ánh, đánh giá, tha thứ',
    reversed: 'Nghi ngờ bản thân, thiếu tự nhận thức',
    trading: 'Review past trades. Learn from mistakes. Forgive yourself and evolve.',
    advice: 'Đánh giá lại journey. Release guilt. Move forward wiser.'
  },
  {
    number: 21,
    name: 'The World',
    vietnamese: 'Thế Giới',
    suit: 'major',
    upright: 'Hoàn thành, thành tựu, chu kỳ kết thúc, trọn vẹn',
    reversed: 'Chưa hoàn thành, trì hoãn, thiếu đóng góp',
    trading: 'Target đạt. Cycle complete. Time to celebrate và prepare for next journey.',
    advice: 'Hãy tự hào với những gì đã đạt được. New adventures await.'
  },
  // Minor Arcana - Wands
  {
    number: null,
    name: 'Ace of Wands',
    vietnamese: 'Át Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Khởi đầu mới, cảm hứng, tiềm năng sáng tạo',
    reversed: 'Thiếu định hướng, chậm chễ, cơ hội bị mất',
    trading: 'New trade opportunity! Fresh idea, new coin. Energy cao để enter position.',
    advice: 'Seize the moment. Trust creative instinct nhưng verify with analysis.'
  },
  {
    number: null,
    name: 'Two of Wands',
    vietnamese: 'Hai Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Lập kế hoạch tương lai, quyết định, khám phá',
    reversed: 'Thiếu kế hoạch, sợ hãi, không chắc chắn',
    trading: 'Plan your trades. Hai con đường trước mặt. Research và choose wisely.',
    advice: 'Map out strategy trước khi commit. Vision is important.'
  },
  {
    number: null,
    name: 'Three of Wands',
    vietnamese: 'Ba Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Mở rộng, tiến bộ, tầm nhìn dài hạn',
    reversed: 'Cản trở, chậm trễ, thiếu tầm nhìn',
    trading: 'Expansion phase. Portfolio growing. Long-term vision paying off.',
    advice: 'Think big. Opportunities beyond current scope đang chờ.'
  },
  {
    number: null,
    name: 'Four of Wands',
    vietnamese: 'Bốn Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Ăn mừng, hòa hợp, cộng đồng, ổn định',
    reversed: 'Không ổn định, thiếu hỗ trợ, bất hòa',
    trading: 'Milestone reached! Celebrate wins với community. Stable foundation built.',
    advice: 'Share success với những người support bạn. Joy multiplies when shared.'
  },
  {
    number: null,
    name: 'Five of Wands',
    vietnamese: 'Năm Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Cạnh tranh, xung đột, thách thức',
    reversed: 'Tránh xung đột, hòa giải, hợp tác',
    trading: 'Market competition. Many traders fighting for same opportunity. Stay focused.',
    advice: 'Channel competitive energy constructively. Not every battle is worth fighting.'
  },
  {
    number: null,
    name: 'Six of Wands',
    vietnamese: 'Sáu Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Thành công công khai, công nhận, chiến thắng',
    reversed: 'Thất bại, thiếu công nhận, kiêu ngạo',
    trading: 'Public win! Portfolio all-time high. Recognition from peers. Enjoy nhưng stay humble.',
    advice: 'Celebrate thành công nhưng remember - markets are humbling.'
  },
  {
    number: null,
    name: 'Seven of Wands',
    vietnamese: 'Bảy Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Bảo vệ lập trường, thách thức, kiên trì',
    reversed: 'Chịu thua, thiếu năng lượng, choáng ngợp',
    trading: 'Defend your thesis. FUD everywhere nhưng conviction solid. Hold the line.',
    advice: 'Stand your ground khi bạn đúng. Kiên trì sẽ thắng.'
  },
  {
    number: null,
    name: 'Eight of Wands',
    vietnamese: 'Tám Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Chuyển động nhanh, hành động, tin tức',
    reversed: 'Chậm trễ, chờ đợi, mất kiên nhẫn',
    trading: 'Fast price action! News catalyst. Quick decisions needed. Momentum strong.',
    advice: 'Act fast nhưng đừng reckless. Speed with precision.'
  },
  {
    number: null,
    name: 'Nine of Wands',
    vietnamese: 'Chín Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Kiên cường, bền bỉ, sẵn sàng',
    reversed: 'Kiệt sức, hoang tưởng, cứng đầu',
    trading: 'Battle-tested trader. Scars from past losses nhưng stronger. Ready for anything.',
    advice: 'Persistence through difficulty builds character. Almost there.'
  },
  {
    number: null,
    name: 'Ten of Wands',
    vietnamese: 'Mười Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Gánh nặng, trách nhiệm quá tải, căng thẳng',
    reversed: 'Buông bỏ gánh nặng, ủy thác, giải thoát',
    trading: 'Too many positions, too much responsibility. Simplify. Cut losers.',
    advice: 'Delegate hoặc eliminate. Không cần carry everything alone.'
  },
  {
    number: null,
    name: 'Page of Wands',
    vietnamese: 'Hầu Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Khám phá, nhiệt huyết, tin tức tốt',
    reversed: 'Thiếu định hướng, chần chừ, tin xấu',
    trading: 'Beginner enthusiasm. New strategy to explore. Good news incoming.',
    advice: 'Stay curious và eager to learn. Fresh perspective valuable.'
  },
  {
    number: null,
    name: 'Knight of Wands',
    vietnamese: 'Kỵ Sĩ Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Hành động, phiêu lưu, năng lượng',
    reversed: 'Bốc đồng, vội vàng, thiếu kế hoạch',
    trading: 'Aggressive trader. High energy nhưng có thể impulsive. Risk of overtrading.',
    advice: 'Channel enthusiasm với discipline. Passion + Plan = Success.'
  },
  {
    number: null,
    name: 'Queen of Wands',
    vietnamese: 'Nữ Hoàng Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Tự tin, độc lập, quyến rũ, quyết đoán',
    reversed: 'Ghen tuông, không an toàn, ích kỷ',
    trading: 'Confident trader. Independent analysis. Charismatic leader. Trust yourself.',
    advice: 'Lead với confidence nhưng remain open to collaboration.'
  },
  {
    number: null,
    name: 'King of Wands',
    vietnamese: 'Vua Quyền',
    suit: 'wands',
    element: 'fire',
    upright: 'Lãnh đạo tự nhiên, tầm nhìn, kinh doanh',
    reversed: 'Bạo quyền, thao túng, thiếu tôn trọng',
    trading: 'Visionary trader. Big picture thinker. Natural leader. Execute với authority.',
    advice: 'Lead boldly nhưng không arrogant. Vision must serve others too.'
  },
  // Minor Arcana - Cups
  {
    number: null,
    name: 'Ace of Cups',
    vietnamese: 'Át Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Tình yêu mới, cảm xúc, trực giác, sáng tạo',
    reversed: 'Cảm xúc bị chặn, mất niềm tin, ích kỷ',
    trading: 'Emotional connection với project. Follow heart nhưng verify with brain.',
    advice: 'New emotional beginning. Trust feelings nhưng balance with logic.'
  },
  {
    number: null,
    name: 'Two of Cups',
    vietnamese: 'Hai Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Mối quan hệ, hợp tác, tình yêu lãng mạn',
    reversed: 'Bất hòa, chia ly, mất cân bằng',
    trading: 'Partnership opportunity. Collaboration với trader khác. Mutual benefit.',
    advice: 'Seek win-win relationships. Together stronger than alone.'
  },
  {
    number: null,
    name: 'Three of Cups',
    vietnamese: 'Ba Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Ăn mừng, tình bạn, cộng đồng',
    reversed: 'Cô lập, khuyết điểm, bất hòa',
    trading: 'Community celebration. Trading group success. Social connections valuable.',
    advice: 'Celebrate với friends. Community support matters.'
  },
  {
    number: null,
    name: 'Four of Cups',
    vietnamese: 'Bốn Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Thiền định, trầm tư, đánh giá lại',
    reversed: 'Giác ngộ, chấp nhận, hành động',
    trading: 'Meditation needed. So many options feel overwhelming. Step back và reflect.',
    advice: 'Take break. Clarity comes from stillness.'
  },
  {
    number: null,
    name: 'Five of Cups',
    vietnamese: 'Năm Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Mất mát, hối tiếc, đau khổ, thất vọng',
    reversed: 'Chữa lành, chấp nhận, tiến lên',
    trading: 'Loss hurts. Rekt. Mourning needed nhưng đừng dwell too long. Learn và move on.',
    advice: 'Grieve losses nhưng see what remains. Not all is lost.'
  },
  {
    number: null,
    name: 'Six of Cups',
    vietnamese: 'Sáu Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Kỷ niệm, hoài niệm, ngây thơ, quá khứ',
    reversed: 'Sống trong quá khứ, không thực tế',
    trading: 'Nostalgia for past gains. Remember old wins nhưng focus on present opportunities.',
    advice: 'Learn from past nhưng đừng live there. Present matters most.'
  },
  {
    number: null,
    name: 'Seven of Cups',
    vietnamese: 'Bảy Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Nhiều lựa chọn, ảo tưởng, mơ mộng',
    reversed: 'Quyết định, tập trung, thực tế',
    trading: 'Too many altcoins. Analysis paralysis. Illusions vs reality. Focus!',
    advice: 'Not all shiny objects are gold. Choose wisely.'
  },
  {
    number: null,
    name: 'Eight of Cups',
    vietnamese: 'Tám Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Rời bỏ, tìm kiếm ý nghĩa, buông bỏ',
    reversed: 'Né tránh, sợ hãi, ngồi yên',
    trading: 'Leave losing position. Walk away from dead project. Search for better opportunity.',
    advice: 'Sometimes walking away is strongest move. Seek deeper meaning.'
  },
  {
    number: null,
    name: 'Nine of Cups',
    vietnamese: 'Chín Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Mãn nguyện, hài lòng, ước mơ thành hiện thực',
    reversed: 'Tham lam, không hài lòng, ích kỷ',
    trading: 'Wish fulfilled! Target hit. Portfolio goals achieved. Satisfaction earned.',
    advice: 'Enjoy contentment. You deserve this moment of happiness.'
  },
  {
    number: null,
    name: 'Ten of Cups',
    vietnamese: 'Mười Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Hạnh phúc, hòa hợp gia đình, trọn vẹn',
    reversed: 'Gia đình bất hòa, giá trị sai lệch',
    trading: 'Complete emotional fulfillment. Trading success supporting family. Life balance achieved.',
    advice: 'This is what it is all about. Family và happiness first.'
  },
  {
    number: null,
    name: 'Page of Cups',
    vietnamese: 'Hầu Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Tin tức tốt, sáng tạo, trực giác',
    reversed: 'Chưa trưởng thành, cảm xúc, tin xấu',
    trading: 'Good news about emotional investment. Creative trading idea. Trust intuition.',
    advice: 'Stay open to messages from universe. Creativity flows.'
  },
  {
    number: null,
    name: 'Knight of Cups',
    vietnamese: 'Kỵ Sĩ Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Lãng mạn, quyến rũ, lý tưởng hóa',
    reversed: 'Không thực tế, thất vọng, khí chất',
    trading: 'Romantic view of project. Idealistic về potential. Careful of bias.',
    advice: 'Follow heart nhưng keep feet on ground. Balance emotion với reality.'
  },
  {
    number: null,
    name: 'Queen of Cups',
    vietnamese: 'Nữ Hoàng Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Nhân từ, trực giác, chăm sóc, cảm xúc',
    reversed: 'Cảm xúc bất ổn, phụ thuộc, thiếu biên giới',
    trading: 'Intuitive trader. Emotional intelligence high. Nurture portfolio wisely.',
    advice: 'Trust deep intuition. Compassion is strength, not weakness.'
  },
  {
    number: null,
    name: 'King of Cups',
    vietnamese: 'Vua Chén',
    suit: 'cups',
    element: 'water',
    upright: 'Cân bằng cảm xúc, kiểm soát, khôn ngoan',
    reversed: 'Thao túng cảm xúc, lạnh lùng, kiềm chế',
    trading: 'Emotionally mature trader. Master of feelings. Wise counsel từ experience.',
    advice: 'Lead với emotional wisdom. Balance head và heart perfectly.'
  },
  // Minor Arcana - Swords
  {
    number: null,
    name: 'Ace of Swords',
    vietnamese: 'Át Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Rõ ràng tinh thần, chân lý, công lý, đột phá',
    reversed: 'Nhầm lẫn, bất công, thiếu rõ ràng',
    trading: 'Mental clarity! Breakthrough understanding. Truth revealed. Clear analysis.',
    advice: 'Cut through confusion với sharp logic. Truth is power.'
  },
  {
    number: null,
    name: 'Two of Swords',
    vietnamese: 'Hai Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Quyết định khó khăn, bế tắc, thăng bằng',
    reversed: 'Nhầm lẫn, thông tin, tiến triển',
    trading: 'Difficult choice. Long hay short? Hai options equally valid. Need more info.',
    advice: 'Remove blindfold. Gather data trước khi decide.'
  },
  {
    number: null,
    name: 'Three of Swords',
    vietnamese: 'Ba Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Đau khổ, chia ly, thất vọng, đau buồn',
    reversed: 'Chữa lành, tha thứ, phục hồi',
    trading: 'Heartbreak trade. Major loss. Emotional pain. Betrayal by project hoặc self.',
    advice: 'Pain is real. Allow grief. Healing takes time.'
  },
  {
    number: null,
    name: 'Four of Swords',
    vietnamese: 'Bốn Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Nghỉ ngơi, phục hồi, thiền định',
    reversed: 'Kiệt sức, căng thẳng, cần nghỉ ngơi',
    trading: 'Mental rest required. Step away from charts. Recovery time. No trading.',
    advice: 'Rest is productive. Mind needs recovery như body.'
  },
  {
    number: null,
    name: 'Five of Swords',
    vietnamese: 'Năm Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Xung đột, thua cuộc, bất công',
    reversed: 'Hòa giải, tha thứ, tiến lên',
    trading: 'Pyrrhic victory. Win nhưng at what cost? Consider if battle was worth it.',
    advice: 'Not all wins are worth the damage. Choose battles wisely.'
  },
  {
    number: null,
    name: 'Six of Swords',
    vietnamese: 'Sáu Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Chuyển đổi, di chuyển, phục hồi',
    reversed: 'Kẹt lại, kháng cự thay đổi, trì hoãn',
    trading: 'Transition period. Moving from bad market to better. Slow recovery.',
    advice: 'Progress is progress, even if slow. Keep moving forward.'
  },
  {
    number: null,
    name: 'Seven of Swords',
    vietnamese: 'Bảy Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Lừa dối, chiến lược, trốn tránh',
    reversed: 'Bị phát hiện, lương tâm, thành thật',
    trading: 'Watch for scams. Deception in market. Hoặc you are being strategic? Ethics matter.',
    advice: 'Strategy is smart but deception has consequences. Integrity first.'
  },
  {
    number: null,
    name: 'Eight of Swords',
    vietnamese: 'Tám Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Bị giam tâm trí, hạn chế, sợ hãi',
    reversed: 'Giải thoát, tự do, vượt qua',
    trading: 'Mental prison. Trapped by fear, limiting beliefs. Ropes loose - can escape.',
    advice: 'Giới hạn mostly in mind. You are freer than you think.'
  },
  {
    number: null,
    name: 'Nine of Swords',
    vietnamese: 'Chín Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Lo lắng, sợ hãi, ác mộng',
    reversed: 'Phục hồi, hy vọng, tìm ra giải pháp',
    trading: 'Anxiety extreme. Cannot sleep vì portfolio. Fear overwhelming. Seek help.',
    advice: 'Anxiety lies. Talk to someone. You are not alone.'
  },
  {
    number: null,
    name: 'Ten of Swords',
    vietnamese: 'Mười Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Kết thúc đau đớn, thất bại, đáy',
    reversed: 'Phục hồi, tái sinh, bắt đầu mới',
    trading: 'Rock bottom. Complete rekt. Worst case happened. But... this IS the bottom.',
    advice: 'Darkest before dawn. Nowhere to go but up. Rise again.'
  },
  {
    number: null,
    name: 'Page of Swords',
    vietnamese: 'Hầu Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Tò mò, tin tức, giao tiếp',
    reversed: 'Tin đồn, gián điệp, thiếu kế hoạch',
    trading: 'New information. Curious researcher. Question everything. Verify facts.',
    advice: 'Stay curious và skeptical. Not all news is true.'
  },
  {
    number: null,
    name: 'Knight of Swords',
    vietnamese: 'Kỵ Sĩ Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Hành động nhanh, quyết đoán, táo bạo',
    reversed: 'Bốc đồng, vội vàng, thiếu suy nghĩ',
    trading: 'Aggressive quick trades. Decisive action. Risk of rushing. Slow down.',
    advice: 'Decisiveness good nhưng do not rush. Think then act fast.'
  },
  {
    number: null,
    name: 'Queen of Swords',
    vietnamese: 'Nữ Hoàng Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Rõ ràng, độc lập, công bằng',
    reversed: 'Lạnh lùng, đắng cay, tàn nhẫn',
    trading: 'Clear-minded trader. Independent analysis. Fair but firm. No BS.',
    advice: 'Speak truth với compassion. Clarity without cruelty.'
  },
  {
    number: null,
    name: 'King of Swords',
    vietnamese: 'Vua Kiếm',
    suit: 'swords',
    element: 'air',
    upright: 'Trí tuệ, logic, công lý, chân lý',
    reversed: 'Thao túng, độc đoán, thiếu từ bi',
    trading: 'Intellectual mastery. Logic supreme. Fair judgment. Wise decisions.',
    advice: 'Lead với wisdom và fairness. Logic tempered by compassion.'
  },
  // Minor Arcana - Pentacles
  {
    number: null,
    name: 'Ace of Pentacles',
    vietnamese: 'Át Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Cơ hội mới, thịnh vượng, biểu hiện',
    reversed: 'Cơ hội mất, thiếu kế hoạch, khan hiếm',
    trading: 'Solid opportunity. Real value project. Financial beginning. Long-term potential.',
    advice: 'Plant seeds now. Tangible results coming with patience.'
  },
  {
    number: null,
    name: 'Two of Pentacles',
    vietnamese: 'Hai Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Cân bằng, linh hoạt, ưu tiên',
    reversed: 'Mất cân bằng, quá tải, lộn xộn',
    trading: 'Juggling multiple positions. Balance needed. Adapt to changes. Manage well.',
    advice: 'Flexibility key. Prioritize what matters. Flow với changes.'
  },
  {
    number: null,
    name: 'Three of Pentacles',
    vietnamese: 'Ba Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Hợp tác, kỹ năng, làm việc nhóm',
    reversed: 'Thiếu hợp tác, kỹ năng kém, bất hòa',
    trading: 'Team work. Skilled collaboration. Building something real. Quality matters.',
    advice: 'Mastery through practice. Collaborate với skilled people.'
  },
  {
    number: null,
    name: 'Four of Pentacles',
    vietnamese: 'Bốn Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'An toàn tài chính, tiết kiệm, kiểm soát',
    reversed: 'Tham lam, vật chất, bỏn xẻn',
    trading: 'Holding too tight. Security > growth. Fear of loss preventing gain.',
    advice: 'Security important nhưng do not become greedy. Share và flow.'
  },
  {
    number: null,
    name: 'Five of Pentacles',
    vietnamese: 'Năm Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Khó khăn tài chính, thiếu thốn, lo lắng',
    reversed: 'Phục hồi tài chính, phát triển, hy vọng',
    trading: 'Financial hardship. Portfolio down. Feel left out. Help available if ask.',
    advice: 'Tough times temporary. Reach out for support. Not alone.'
  },
  {
    number: null,
    name: 'Six of Pentacles',
    vietnamese: 'Sáu Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Hào phóng, từ thiện, chia sẻ',
    reversed: 'Ích kỷ, nợ nần, bất công',
    trading: 'Give back to community. Share profits. Charitable với knowledge. Generosity flows both ways.',
    advice: 'What goes around comes around. Give from abundance.'
  },
  {
    number: null,
    name: 'Seven of Pentacles',
    vietnamese: 'Bảy Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Kiên nhẫn, đầu tư dài hạn, đánh giá',
    reversed: 'Thiếu kiên nhẫn, kết quả kém, lãng phí',
    trading: 'Long-term hold. Patience testing. Assess progress. Stay the course.',
    advice: 'Harvest takes time. Evaluate nhưng do not abandon prematurely.'
  },
  {
    number: null,
    name: 'Eight of Pentacles',
    vietnamese: 'Tám Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Học hỏi, chăm chỉ, kỹ năng, cải thiện',
    reversed: 'Thiếu tập trung, hoàn hảo, lãng phí thời gian',
    trading: 'Master the craft. Study charts. Practice strategy. Continuous improvement.',
    advice: 'Excellence through repetition. Keep learning và practicing.'
  },
  {
    number: null,
    name: 'Nine of Pentacles',
    vietnamese: 'Chín Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Độc lập, thịnh vượng, xa xỉ, tự lực',
    reversed: 'Quá phụ thuộc, nợ nần, thiếu kỷ luật',
    trading: 'Self-made success. Financial independence. Luxury earned. Enjoy fruits.',
    advice: 'You built this. Enjoy refined life. Independence is sweet.'
  },
  {
    number: null,
    name: 'Ten of Pentacles',
    vietnamese: 'Mười Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Gia đình, thịnh vượng, di sản, ổn định',
    reversed: 'Mất mát tài chính, gia đình bất hòa',
    trading: 'Generational wealth. Legacy building. Family prosperity. Long-term stability achieved.',
    advice: 'Build legacy. Think generations. Wealth that lasts.'
  },
  {
    number: null,
    name: 'Page of Pentacles',
    vietnamese: 'Hầu Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Cơ hội mới, học hỏi, biểu hiện',
    reversed: 'Thiếu tiến bộ, trì hoãn, không thực tế',
    trading: 'New learning opportunity. Study fundamentals. Practical approach. Beginner mindset.',
    advice: 'Stay grounded và curious. Learn the basics well.'
  },
  {
    number: null,
    name: 'Knight of Pentacles',
    vietnamese: 'Kỵ Sĩ Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Chăm chỉ, trách nhiệm, ổn định',
    reversed: 'Lười biếng, nhàm chán, thiếu trách nhiệm',
    trading: 'Reliable steady trader. Slow but sure. Responsible decisions. Hard work.',
    advice: 'Consistency beats brilliance. Keep showing up.'
  },
  {
    number: null,
    name: 'Queen of Pentacles',
    vietnamese: 'Nữ Hoàng Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Nuôi dưỡng, thực tế, thịnh vượng',
    reversed: 'Vật chất hóa, phụ thuộc, kiểm soát',
    trading: 'Nurturing trader. Practical approach. Grows wealth steadily. Cares for portfolio.',
    advice: 'Practical magic. Nurture investments như garden.'
  },
  {
    number: null,
    name: 'King of Pentacles',
    vietnamese: 'Vua Tiền',
    suit: 'pentacles',
    element: 'earth',
    upright: 'Thịnh vượng, kinh doanh, lãnh đạo',
    reversed: 'Tham lam, vật chất, cứng nhắc',
    trading: 'Master of wealth. Business acumen. Successful empire builder. Wise với money.',
    advice: 'Lead với stability. Wealth is tool, not goal. Use wisely.'
  }
];

// Helper Functions
/**
 * Get I Ching hexagram by number
 */
export const getHexagramByNumber = (number) => {
  return iChingHexagrams.find(h => h.number === number);
};

/**
 * Get random I Ching hexagram
 */
export const getRandomHexagram = () => {
  const index = Math.floor(Math.random() * iChingHexagrams.length);
  return iChingHexagrams[index];
};

/**
 * Get Tarot card by name
 */
export const getTarotCardByName = (name) => {
  return tarotCards.find(c => c.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get random Tarot card
 */
export const getRandomTarotCard = () => {
  const index = Math.floor(Math.random() * tarotCards.length);
  return tarotCards[index];
};

/**
 * Get Tarot cards by suit
 */
export const getTarotCardsBySuit = (suit) => {
  return tarotCards.filter(c => c.suit === suit);
};

/**
 * Perform 3-card Tarot spread
 */
export const getThreeCardSpread = () => {
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
  return {
    past: shuffled[0],
    present: shuffled[1],
    future: shuffled[2]
  };
};

/**
 * Validate data integrity (for development/testing)
 */
export const validateChatbotData = () => {
  const results = {
    iching: {
      total: iChingHexagrams.length,
      expected: 64,
      valid: true,
      missing: [],
      duplicates: []
    },
    tarot: {
      total: tarotCards.length,
      expected: 78,
      major: tarotCards.filter(c => c.suit === 'major' || c.number !== null).length,
      wands: tarotCards.filter(c => c.suit === 'wands').length,
      cups: tarotCards.filter(c => c.suit === 'cups').length,
      swords: tarotCards.filter(c => c.suit === 'swords').length,
      pentacles: tarotCards.filter(c => c.suit === 'pentacles').length,
      valid: true
    }
  };

  // Validate I Ching
  const numbers = iChingHexagrams.map(h => h.number);
  const uniqueNumbers = new Set(numbers);

  if (numbers.length !== uniqueNumbers.size) {
    results.iching.valid = false;
    results.iching.duplicates = numbers.filter((n, i) => numbers.indexOf(n) !== i);
  }

  for (let i = 1; i <= 64; i++) {
    if (!iChingHexagrams.find(h => h.number === i)) {
      results.iching.missing.push(i);
      results.iching.valid = false;
    }
  }

  // Validate Tarot
  if (results.tarot.total !== 78) results.tarot.valid = false;
  if (results.tarot.major !== 22) results.tarot.valid = false;
  if (results.tarot.wands !== 14) results.tarot.valid = false;
  if (results.tarot.cups !== 14) results.tarot.valid = false;
  if (results.tarot.swords !== 14) results.tarot.valid = false;
  if (results.tarot.pentacles !== 14) results.tarot.valid = false;

  return results;
};

export class ChatbotService {
  constructor() {
    this.conversationHistory = [];
    this.userId = null;
    this.userTier = 'FREE';
  }

  /**
   * Set user info for API calls
   */
  setUserInfo(userId, userTier) {
    this.userId = userId;
    this.userTier = userTier || 'FREE';
    console.log('✅ ChatbotService user info set:', { userId, userTier });
  }

  /**
   * Get I Ching reading
   */
  async getIChingReading(question) {
    // Generate random hexagram (simulating coin toss)
    const hexagram = iChingHexagrams[Math.floor(Math.random() * iChingHexagrams.length)];

    return {
      type: 'iching',
      question,
      hexagram,
      reading: `
🔮 **Quẻ ${hexagram.number}: ${hexagram.name} (${hexagram.chinese})**

**Ý Nghĩa:** ${hexagram.interpretation}

**Trong Trading:** ${hexagram.trading}

**Lời Khuyên:** ${hexagram.advice}

---
*Lưu ý: Đây là công cụ tham khảo. Luôn kết hợp với phân tích kỹ thuật.*
      `.trim(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get Tarot reading (single card or 3-card spread)
   */
  async getTarotReading(question, spreadType = 'single') {
    let cards = [];

    if (spreadType === 'single') {
      cards = [tarotCards[Math.floor(Math.random() * tarotCards.length)]];
    } else if (spreadType === 'three') {
      // Past, Present, Future spread
      const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
      cards = shuffled.slice(0, 3);
    }

    let reading = `🃏 **Tarot Reading**\n\n**Câu Hỏi:** ${question}\n\n`;

    if (spreadType === 'single') {
      const card = cards[0];
      const isReversed = Math.random() > 0.5;

      reading += `
**${card.number}. ${card.name}** (${card.vietnamese})
${isReversed ? '🔄 *Reversed*' : '✨ *Upright*'}

**Ý Nghĩa:** ${isReversed ? card.reversed : card.upright}

**Trong Trading:** ${card.trading}

**Lời Khuyên:** ${card.advice}
      `.trim();
    } else {
      reading += `**📍 Past - Present - Future Spread**\n\n`;

      const positions = ['Quá Khứ', 'Hiện Tại', 'Tương Lai'];
      cards.forEach((card, index) => {
        const isReversed = Math.random() > 0.5;
        reading += `
**${positions[index]}:** ${card.name} (${card.vietnamese})
${isReversed ? '🔄 Reversed' : '✨ Upright'}
${isReversed ? card.reversed : card.upright}

`;
      });
    }

    return {
      type: 'tarot',
      question,
      spreadType,
      cards,
      reading,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get local response based on keywords (LAYER 1 - No API call)
   * Returns null if no match found, then will use AI API
   */
  getLocalResponse(message) {
    const msg = message.toLowerCase();

    // I Ching detection
    if (msg.includes('i ching') || msg.includes('kinh dịch') || msg.includes('xem quẻ') || msg.includes('quẻ')) {
      return this.getLocalIChingReading();
    }

    // Tarot detection
    if (msg.includes('tarot') || msg.includes('trải bài') || msg.includes('đọc bài')) {
      return this.getLocalTarotReading();
    }

    // Trading issues - loss streak
    if (msg.includes('loss') || msg.includes('thua') || msg.includes('lỗ') || msg.includes('loss streak')) {
      return {
        type: 'consulting',
        response: '📉 **Loss Streak - Phân Tích và Giải Pháp**\n\n' +
                  '**Nguyên nhân:**\n' +
                  '• Revenge trading sau khi thua\n' +
                  '• FOMO vào lệnh không setup\n' +
                  '• Không có stoploss rõ ràng\n' +
                  '• Trade quá nhiều, overtrading\n\n' +
                  '**Giải pháp:**\n' +
                  '1. DỪNG TRADE 24-48h để clear head\n' +
                  '2. Review lại journal, tìm pattern sai\n' +
                  '3. Giảm position size xuống 50%\n' +
                  '4. Chỉ trade khi có setup A+ (80% win rate)\n' +
                  '5. Thiền định 10 phút trước mỗi session\n\n' +
                  '💡 Tip: Loss streak là phần của trading. Trader giỏi quản lý tốt, không để nó thành disaster.',
        useLocal: true
      };
    }

    // FOMO issues
    if (msg.includes('fomo') || msg.includes('sợ lỡ')) {
      return {
        type: 'consulting',
        response: '😰 **FOMO - Fear of Missing Out**\n\n' +
                  '**Tại sao bạn FOMO:**\n' +
                  '• Thấy người khác lãi → Tự ti → Vào lệnh\n' +
                  '• Candle xanh liên tiếp → Sợ lỡ sóng\n' +
                  '• Không tin vào plan của mình\n\n' +
                  '**Giải pháp:**\n' +
                  '1. Nhắc nhở: "Thị trường luôn có cơ hội mới"\n' +
                  '2. Chỉ vào lệnh khi có 3 confirmation\n' +
                  '3. Set alert thay vì stare màn hình\n' +
                  '4. Journal mỗi lần FOMO → Nhận ra pattern\n' +
                  '5. Thiền định với crystal Black Tourmaline\n\n' +
                  '💎 **Đá phù hợp:** Black Tourmaline (Điện Khí Thạch) - Block năng lượng tiêu cực, giảm anxiety',
        useLocal: true
      };
    }

    // TIER info request
    if (msg.includes('tier') || msg.includes('upgrade') || msg.includes('gói') || msg.includes('nâng cấp')) {
      return {
        type: 'tier-info',
        response: '⭐ **3 TIERS - GEM TRADING ACADEMY**\n\n' +
                  '💎 **TIER 1 - Pattern Scanner Pro**\n' +
                  'Giá: 7.000.000đ\n' +
                  'Win rate: 65-70%\n' +
                  'Công cụ: Scanner cơ bản, 1-2 timeframe\n\n' +
                  '🚀 **TIER 2 - Frequency Trading Master** ⭐ BEST VALUE\n' +
                  'Giá: 21.000.000đ\n' +
                  'Win rate: 70-75%, lãi 80-150%/năm\n' +
                  'Công cụ: Multi-timeframe, backtesting, AI prediction\n' +
                  'Bonus: 1-on-1 coaching\n\n' +
                  '👑 **TIER 3 - Elite Trader VIP**\n' +
                  'Giá: 49.000.000đ\n' +
                  'Win rate: 75-80%+\n' +
                  'Công cụ: Toàn bộ tools + Whale tracker + News sentiment\n' +
                  'Bonus: Private community, weekly group call\n\n' +
                  '🎁 Tất cả TIER đều có: Lifetime access + Free updates\n\n' +
                  '[Xem chi tiết và đăng ký](/pricing)',
        useLocal: true
      };
    }

    // Crystal recommendations
    if (msg.includes('crystal') || msg.includes('đá') || msg.includes('thạch anh')) {
      let crystalInfo = '';

      if (msg.includes('focus') || msg.includes('tập trung')) {
        crystalInfo = '💜 **Amethyst (Tím Anh)**\nGiá: 500.000đ\nTác dụng: Tăng focus, calm mind, giảm stress\nChakra: Third Eye\nPhù hợp: Trader cần tập trung analyze chart';
      } else if (msg.includes('tiền') || msg.includes('giàu') || msg.includes('wealth')) {
        crystalInfo = '💛 **Citrine (Thạch Anh Vàng)**\nGiá: 700.000đ\nTác dụng: Manifest wealth, attract abundance\nChakra: Solar Plexus\nPhù hợp: Trader muốn attract lợi nhuận';
      } else if (msg.includes('anxiety') || msg.includes('sợ') || msg.includes('lo âu')) {
        crystalInfo = '🖤 **Black Tourmaline (Điện Khí Thạch)**\nGiá: 600.000đ\nTác dụng: Block negative energy, grounding, anti-FOMO\nChakra: Root\nPhù hợp: Trader hay FOMO và anxiety';
      } else {
        crystalInfo = '💎 **Crystal Recommendations:**\n\n' +
                     '• Amethyst: Focus & Clarity\n' +
                     '• Citrine: Wealth & Abundance\n' +
                     '• Black Tourmaline: Anti-FOMO\n' +
                     '• Rose Quartz: Emotional balance\n' +
                     '• Clear Quartz: Amplify energy\n\n' +
                     'Bạn cần giúp đỡ gì cụ thể? (focus, wealth, anxiety)';
      }

      return {
        type: 'crystal',
        response: crystalInfo,
        useLocal: true
      };
    }

    // Return null if no keyword match → Will use AI
    return null;
  }

  /**
   * Get local I Ching reading (random hexagram)
   */
  getLocalIChingReading() {
    const randomIndex = Math.floor(Math.random() * iChingHexagrams.length);
    const hexagram = iChingHexagrams[randomIndex];

    // Generate random lines (1 = solid, 0 = broken)
    const lines = Array.from({ length: 6 }, () => Math.random() > 0.5 ? 1 : 0);

    return {
      type: 'iching',
      response: `🔮 **Quẻ I Ching của bạn: ${hexagram.chinese} ${hexagram.name}**\n\n` +
                `**Ý nghĩa:** ${hexagram.interpretation}\n\n` +
                `**Trading Insight:**\n${hexagram.trading}\n\n` +
                `**Lời khuyên:**\n${hexagram.advice}`,
      hexagram: {
        number: hexagram.number,
        name: hexagram.name,
        chinese: hexagram.chinese,
        vietnamese: hexagram.meaning,
        lines: lines
      },
      useLocal: true
    };
  }

  /**
   * Get local Tarot reading (random card)
   */
  getLocalTarotReading() {
    const randomIndex = Math.floor(Math.random() * tarotCards.length);
    const card = tarotCards[randomIndex];

    return {
      type: 'tarot',
      response: `🔮 **Lá Tarot của bạn: ${card.name}**\n\n` +
                `**Ý nghĩa:** ${card.meaning}\n\n` +
                `**Ngược:** ${card.reversed}\n\n` +
                `**Trading Context:**\n${card.trading}`,
      card: {
        name: card.name,
        vietnamese: card.vietnamese,
        type: card.type,
        suit: card.suit || 'Major Arcana',
        meaning: card.meaning
      },
      useLocal: true
    };
  }

  /**
   * Chat with Gemral using Gemini AI (general questions)
   */
  async chatWithMaster(message, conversationHistory = []) {
    try {
      console.log('🔍 Calling Gemini edge function with:', {
        message: message.substring(0, 50),
        userId: this.userId,
        userTier: this.userTier,
        historyLength: conversationHistory.length
      });

      // Call Gemini edge function
      const { data, error } = await supabase.functions.invoke('chatbot-gemini', {
        body: {
          message,
          conversationHistory: conversationHistory.slice(-10), // Last 10 messages
          userId: this.userId,
          userTier: this.userTier || 'FREE'
        }
      });

      console.log('📥 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Gemini API error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return {
          type: 'chat',
          response: this.getFallbackResponse(message),
          timestamp: new Date().toISOString(),
          fallback: true
        };
      }

      return {
        type: 'chat',
        response: data.response,
        conversationId: data.conversationId,
        tokensUsed: data.tokensUsed,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Chat with Master error:', error);
      return {
        type: 'chat',
        response: this.getFallbackResponse(message),
        timestamp: new Date().toISOString(),
        fallback: true
      };
    }
  }

  /**
   * Fallback response when Gemini API fails
   */
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
      return '📊 Gemral đang phân tích BTC...\n\nHiện tại hệ thống đang bận. Vui lòng thử lại sau ít phút hoặc liên hệ support qua Telegram. 🙏';
    }

    if (lowerMessage.includes('eth') || lowerMessage.includes('ethereum')) {
      return '📊 Gemral đang phân tích ETH...\n\nHệ thống gặp sự cố tạm thời. Vui lòng thử lại sau. 🙏';
    }

    if (lowerMessage.includes('trade') || lowerMessage.includes('trading')) {
      return '📈 Về trading:\n\n• Luôn set stoploss trước khi vào lệnh\n• Position size = 1-2% tài khoản\n• Chỉ trade khi có setup rõ ràng\n\n💡 Hệ thống GEM đang bận, vui lòng thử lại sau.';
    }

    return '🙏 Xin lỗi, hệ thống GEM đang bận xử lý các yêu cầu khác.\n\nVui lòng thử lại sau giây lát hoặc liên hệ support để được hỗ trợ ngay.';
  }

  /**
   * Save chat history to database
   */
  async saveChatHistory(userId, chatData) {
    const { error } = await supabase
      .from('chatbot_history')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        type: chatData.type,
        question: chatData.question || chatData.message,
        response: chatData.reading || chatData.response,
        metadata: chatData,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  /**
   * Get user's chat history
   */
  async getChatHistory(userId, limit = 50) {
    const { data, error } = await supabase
      .from('chatbot_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Check usage limits based on tier
   */
  async checkUsageLimit(userId, userTier) {
    console.log('🔍 DEBUG checkUsageLimit - userId:', userId);
    console.log('🔍 DEBUG checkUsageLimit - userTier:', userTier);
    console.log('🔍 DEBUG checkUsageLimit - userTier type:', typeof userTier);

    // Map tier names to limits
    // NEW PRICING (Nov 2025):
    // FREE: 5/day, PRO: 15/day (39k), PREMIUM: 50/day (59k), VIP: Unlimited (99k)
    const tierLimits = {
      'free': 5,
      'FREE': 5,
      'pro': 15,
      'PRO': 15,
      'TIER1': 15,
      'tier1': 15,
      'premium': 50,
      'PREMIUM': 50,
      'TIER2': 50,
      'tier2': 50,
      'vip': Infinity,
      'VIP': Infinity,
      'TIER3': Infinity,
      'tier3': Infinity
    };

    const dailyLimit = tierLimits[userTier] || tierLimits['free'];
    console.log('🔍 DEBUG checkUsageLimit - dailyLimit:', dailyLimit);
    console.log('🔍 DEBUG checkUsageLimit - is Infinity?:', dailyLimit === Infinity);

    if (dailyLimit === Infinity) {
      console.log('🔍 DEBUG checkUsageLimit - Returning unlimited access!');
      return { allowed: true, remaining: Infinity, limit: Infinity };
    }

    // Count today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('chatbot_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());

    if (error) throw error;

    const remaining = dailyLimit - (count || 0);

    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: dailyLimit
    };
  }

  /**
   * Delete chat history entry
   */
  async deleteHistory(historyId, userId) {
    const { error } = await supabase
      .from('chatbot_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}

export const chatbotService = new ChatbotService();
