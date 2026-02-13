/**
 * GEM Mobile - I Ching 64 Hexagrams Data
 * Complete data with detailed interpretations for each hexagram
 * Format: overview, 5 domains (career/finance/love/health/spiritual), crystals, affirmations, 6 lines
 */

export const HEXAGRAMS = {
  1: {
    id: 1,
    name: 'Càn',
    chineseName: '乾',
    unicode: '䷀',
    element: 'Kim',
    nature: 'Dương',
    image: 'Trời',
    lines: [1, 1, 1, 1, 1, 1],

    overview: {
      meaning: `Quẻ Càn là quẻ đầu tiên trong Kinh Dịch, đại diện cho năng lượng sáng tạo nguyên thủy, sức mạnh của Trời, tinh thần dương cương thuần khiết. Đây là quẻ của sự khởi đầu mạnh mẽ, của ý chí kiên định và hành động quyết đoán. Khi bốc được quẻ Càn, bạn đang ở trong giai đoạn năng lượng dồi dào, có khả năng tạo ra những thay đổi lớn trong cuộc sống.`,
      keywords: ['Sáng tạo', 'Mạnh mẽ', 'Khởi đầu', 'Lãnh đạo', 'Quyết đoán'],
      overallAdvice: 'Đây là thời điểm để hành động, không phải chờ đợi. Hãy tin vào sức mạnh nội tại của bạn và tiến về phía trước.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Trong công việc, quẻ Càn báo hiệu thời điểm thuận lợi để khởi nghiệp hoặc mở rộng kinh doanh, đề xuất ý tưởng mới với cấp trên, nhận thêm trách nhiệm lãnh đạo, và đàm phán tăng lương hoặc thăng chức. Tự tin là tốt, nhưng tránh kiêu ngạo. Lắng nghe ý kiến người khác dù bạn là người ra quyết định.`,
        actionSteps: [
          'Lập kế hoạch cụ thể cho mục tiêu nghề nghiệp trong 3-6 tháng tới',
          'Chủ động đề xuất dự án mới hoặc cải tiến quy trình',
          'Xây dựng network với những người có ảnh hưởng trong ngành',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Về tài chính, quẻ Càn mang năng lượng tích cực. Thời điểm tốt để bắt đầu kế hoạch tiết kiệm/đầu tư mới. Có thể có cơ hội kiếm thêm thu nhập. Quyết định tài chính nên dựa trên logic, không cảm xúc. Tránh đầu tư mạo hiểm quá mức dù đang tự tin cao. Quẻ Càn khuyến khích hành động, nhưng là hành động có chiến lược.`,
        actionSteps: [
          'Review lại portfolio đầu tư và rebalance nếu cần',
          'Tìm hiểu thêm 1 kênh đầu tư mới (crypto, cổ phiếu, bất động sản)',
          'Set up automatic savings 20% thu nhập',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Trong tình cảm, quẻ Càn khuyên bạn chủ động. Nếu độc thân, đây là lúc tự tin tiếp cận người mình thích. Nếu có đôi, thể hiện tình cảm mạnh mẽ, lên kế hoạch cho tương lai. Trong gia đình, đảm nhận vai trò người dẫn dắt, bảo vệ. Mạnh mẽ nhưng không áp đặt. Lắng nghe đối phương, không chỉ nói về mình.`,
        actionSteps: [
          'Nếu độc thân: Tham gia 1 hoạt động xã hội mới để mở rộng circle',
          'Nếu có đôi: Plan 1 date đặc biệt trong tuần này',
          'Gọi điện hoặc gặp mặt người thân lâu không liên lạc',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Về sức khỏe, năng lượng Càn rất mạnh. Năng lượng thể chất đang ở mức cao. Tốt cho việc bắt đầu routine tập luyện mới. Tâm trí minh mẫn, quyết đoán. Đừng đốt cháy giai đoạn. Nghỉ ngơi đủ để duy trì năng lượng lâu dài.`,
        actionSteps: [
          'Bắt đầu hoặc tăng cường routine tập thể dục',
          'Thức dậy sớm hơn 30 phút để thiền hoặc tập thể dục',
          'Uống đủ 2L nước mỗi ngày',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Về mặt tâm thức, Càn tượng trưng cho sự giác ngộ. Kết nối mạnh với năng lượng vũ trụ. Thời điểm tốt để đặt intentions, manifesting. Ý chí mạnh mẽ giúp vượt qua thử thách. Đây là lúc để nhìn nhận bản thân như một người sáng tạo cuộc sống, không phải nạn nhân của hoàn cảnh.`,
        actionSteps: [
          'Viết ra 3 điều bạn muốn manifest trong 30 ngày tới',
          'Thiền 10 phút mỗi sáng với focus vào năng lượng tích cực',
          'Journaling: Viết về vision của bạn cho cuộc sống lý tưởng',
        ],
      },
    },

    crystals: [
      {
        name: 'Citrine',
        vietnameseName: 'Thạch Anh Vàng',
        reason: 'Tăng cường năng lượng dương, thu hút thành công và thịnh vượng',
        usage: 'Đặt ở góc Đông Nam (góc tài lộc) hoặc mang theo khi làm việc',
        shopHandle: 'citrine-natural',
      },
      {
        name: 'Tiger Eye',
        vietnameseName: 'Mắt Hổ',
        reason: 'Tự tin, quyết đoán, bảo vệ khỏi năng lượng tiêu cực',
        usage: 'Đeo như vòng tay hoặc để trên bàn làm việc',
        shopHandle: 'tiger-eye-bracelet',
      },
      {
        name: 'Clear Quartz',
        vietnameseName: 'Thạch Anh Trắng',
        reason: 'Khuếch đại năng lượng, tăng sự minh mẫn',
        usage: 'Cầm khi thiền hoặc đặt trên bàn làm việc',
        shopHandle: 'clear-quartz-point',
      },
    ],

    affirmations: [
      'Tôi có sức mạnh vô hạn để tạo ra cuộc sống mình mong muốn',
      'Mỗi ngày, tôi đang trở nên mạnh mẽ hơn và tự tin hơn',
      'Vũ trụ ủng hộ mọi hành động tích cực của tôi',
      'Tôi là người lãnh đạo cuộc sống của chính mình',
    ],

    lineInterpretations: {
      1: {
        text: 'Tiềm long vật dụng',
        meaning: 'Rồng còn ẩn mình, chưa phải lúc hành động',
        advice: 'Tích lũy kiến thức và nguồn lực. Thời cơ chưa đến nhưng đang đến gần.',
      },
      2: {
        text: 'Hiện long tại điền',
        meaning: 'Rồng xuất hiện trên cánh đồng. Bắt đầu được người khác nhận ra',
        advice: 'Tìm một mentor hoặc người hướng dẫn. Network và xây dựng uy tín.',
      },
      3: {
        text: 'Quân tử chung nhật kiền kiền',
        meaning: 'Người quân tử suốt ngày cần mẫn',
        advice: 'Làm việc chăm chỉ nhưng cẩn thận. Đề phòng nguy hiểm tiềm ẩn.',
      },
      4: {
        text: 'Hoặc dược tại uyên',
        meaning: 'Có thể nhảy lên từ vực sâu',
        advice: 'Thử nghiệm và linh hoạt. Cơ hội đang đến, sẵn sàng nắm bắt.',
      },
      5: {
        text: 'Phi long tại thiên',
        meaning: 'Rồng bay trên trời',
        advice: 'Thời điểm đạt đỉnh cao. Tận dụng vị thế nhưng giữ khiêm tốn.',
      },
      6: {
        text: 'Kháng long hữu hối',
        meaning: 'Rồng quá cao sẽ hối hận',
        advice: 'Đừng kiêu ngạo. Biết điểm dừng, tránh đi quá xa.',
      },
    },
  },

  2: {
    id: 2,
    name: 'Khôn',
    chineseName: '坤',
    unicode: '䷁',
    element: 'Thổ',
    nature: 'Âm',
    image: 'Đất',
    lines: [0, 0, 0, 0, 0, 0],

    overview: {
      meaning: `Quẻ Khôn đại diện cho năng lượng tiếp nhận, nuôi dưỡng như Đất Mẹ. Đây là quẻ của sự kiên nhẫn, khiêm tốn và hỗ trợ. Khôn không có nghĩa là yếu đuối mà là sức mạnh của sự mềm mại, khả năng thích ứng và nuôi dưỡng. Khi bốc được quẻ này, hãy học cách lắng nghe, hỗ trợ và kiên nhẫn chờ đợi.`,
      keywords: ['Tiếp nhận', 'Nuôi dưỡng', 'Kiên nhẫn', 'Khiêm tốn', 'Hỗ trợ'],
      overallAdvice: 'Đây là lúc để lắng nghe và hỗ trợ thay vì dẫn dắt. Sức mạnh nằm trong sự kiên nhẫn và khiêm tốn.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Trong công việc, quẻ Khôn khuyên bạn đóng vai trò hỗ trợ. Không phải lúc để chủ động đề xuất ý tưởng mới. Hãy là người hỗ trợ đắc lực cho team, lắng nghe và thực hiện tốt nhiệm vụ được giao. Thời điểm này phù hợp để học hỏi, tích lũy kinh nghiệm hơn là thể hiện.`,
        actionSteps: [
          'Tập trung hoàn thành tốt công việc hiện tại',
          'Hỗ trợ đồng nghiệp khi họ cần',
          'Học hỏi từ cấp trên và những người có kinh nghiệm',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Về tài chính, Khôn khuyên bạn bảo thủ và tiết kiệm. Không phải lúc để đầu tư mạo hiểm. Giữ tiền an toàn, tích lũy dần. Tránh các quyết định tài chính lớn. Hãy để tiền sinh lời ổn định thay vì tìm kiếm lợi nhuận nhanh.`,
        actionSteps: [
          'Ưu tiên tiết kiệm hơn đầu tư',
          'Review chi tiêu và cắt giảm những khoản không cần thiết',
          'Tránh cho vay tiền hoặc đầu tư rủi ro cao',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Trong tình cảm, Khôn nhắc nhở bạn về giá trị của sự lắng nghe và thấu hiểu. Nếu độc thân, hãy để tình yêu đến tự nhiên thay vì chủ động tìm kiếm. Nếu có đôi, đây là lúc để hỗ trợ đối phương, lắng nghe họ và nuôi dưỡng mối quan hệ.`,
        actionSteps: [
          'Thực hành lắng nghe chủ động trong các cuộc trò chuyện',
          'Hỗ trợ người thân khi họ cần mà không đợi được nhờ',
          'Thể hiện tình yêu qua hành động chăm sóc nhỏ',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Về sức khỏe, Khôn khuyên bạn nghỉ ngơi và phục hồi. Không nên tập luyện quá sức. Ưu tiên các hoạt động nhẹ nhàng như yoga, đi bộ. Chú ý đến dinh dưỡng và giấc ngủ. Đây là thời điểm để cơ thể hồi phục.`,
        actionSteps: [
          'Ngủ đủ 7-8 tiếng mỗi đêm',
          'Thực hành yoga hoặc stretching nhẹ nhàng',
          'Ăn thực phẩm nuôi dưỡng cơ thể, tránh đồ ăn nhanh',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Về tâm thức, Khôn dạy về sự tiếp nhận và buông bỏ ego. Hãy mở lòng đón nhận hướng dẫn từ vũ trụ thay vì cố kiểm soát mọi thứ. Thực hành thiền định, kết nối với năng lượng Đất Mẹ. Học cách tin tưởng vào quá trình.`,
        actionSteps: [
          'Thực hành thiền grounding - kết nối với đất',
          'Buông bỏ nhu cầu kiểm soát, tin vào divine timing',
          'Viết nhật ký biết ơn mỗi tối trước khi ngủ',
        ],
      },
    },

    crystals: [
      {
        name: 'Rose Quartz',
        vietnameseName: 'Thạch Anh Hồng',
        reason: 'Tình yêu vô điều kiện, nuôi dưỡng và chữa lành',
        usage: 'Đặt trong phòng ngủ hoặc đeo như trang sức',
        shopHandle: 'rose-quartz-heart',
      },
      {
        name: 'Moonstone',
        vietnameseName: 'Đá Mặt Trăng',
        reason: 'Năng lượng âm, trực giác và cảm xúc cân bằng',
        usage: 'Đeo vào những ngày trăng tròn để khuếch đại năng lượng',
        shopHandle: 'moonstone-pendant',
      },
      {
        name: 'Black Tourmaline',
        vietnameseName: 'Tourmaline Đen',
        reason: 'Bảo vệ và grounding, kết nối với năng lượng đất',
        usage: 'Đặt ở 4 góc nhà hoặc mang theo khi ra ngoài',
        shopHandle: 'black-tourmaline-raw',
      },
    ],

    affirmations: [
      'Tôi tiếp nhận mọi điều tốt đẹp vũ trụ gửi đến',
      'Sự kiên nhẫn của tôi sẽ được đền đáp xứng đáng',
      'Tôi nuôi dưỡng bản thân và những người xung quanh',
      'Tôi tin tưởng vào quá trình và divine timing',
    ],

    lineInterpretations: {
      1: {
        text: 'Lý sương kiên băng chí',
        meaning: 'Đạp lên sương, biết rằng băng cứng sẽ đến',
        advice: 'Nhận ra dấu hiệu sớm. Chuẩn bị cho những thay đổi sắp tới.',
      },
      2: {
        text: 'Trực phương đại',
        meaning: 'Thẳng thắn, vuông vức và lớn lao',
        advice: 'Giữ sự chính trực. Đức hạnh sẽ được công nhận.',
      },
      3: {
        text: 'Hàm chương khả trinh',
        meaning: 'Giữ vẻ đẹp bên trong, có thể kiên định',
        advice: 'Ẩn giấu tài năng, chờ thời cơ. Đừng vội phô trương.',
      },
      4: {
        text: 'Quát nang vô cữu vô dự',
        meaning: 'Túi buộc chặt, không lỗi không khen',
        advice: 'Giữ im lặng và thận trọng. Không nói quá nhiều.',
      },
      5: {
        text: 'Hoàng thường nguyên cát',
        meaning: 'Váy vàng, cực kỳ tốt lành',
        advice: 'Đức hạnh được công nhận. Thời điểm may mắn.',
      },
      6: {
        text: 'Long chiến vu dã',
        meaning: 'Rồng chiến đấu trên cánh đồng',
        advice: 'Xung đột có thể xảy ra. Giữ cân bằng âm dương.',
      },
    },
  },

  3: {
    id: 3,
    name: 'Truân',
    chineseName: '屯',
    unicode: '䷂',
    element: 'Thủy',
    nature: 'Âm',
    image: 'Sấm dưới Nước',
    lines: [1, 0, 0, 0, 1, 0],

    overview: {
      meaning: `Quẻ Truân tượng trưng cho khó khăn ban đầu, như mầm cây đang cố gắng đâm xuyên qua đất. Đây là giai đoạn khởi đầu đầy thử thách nhưng cũng đầy tiềm năng. Mọi thứ mới bắt đầu đều khó khăn, nhưng kiên trì sẽ thành công. Cần sự kiên nhẫn và nỗ lực không ngừng.`,
      keywords: ['Khó khăn', 'Khởi đầu', 'Kiên trì', 'Tiềm năng', 'Nỗ lực'],
      overallAdvice: 'Đây là giai đoạn khó khăn nhưng đừng bỏ cuộc. Mọi khởi đầu đều gian nan. Kiên trì và tìm kiếm sự giúp đỡ.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Công việc đang gặp trở ngại. Dự án mới có thể chậm tiến độ. Đừng nản lòng, đây chỉ là giai đoạn khó khăn ban đầu. Tìm kiếm mentor hoặc người hướng dẫn. Không nên thay đổi công việc lúc này. Tập trung vào việc xây dựng nền tảng vững chắc.`,
        actionSteps: [
          'Chia nhỏ mục tiêu lớn thành các bước nhỏ có thể thực hiện',
          'Tìm mentor hoặc người đi trước để học hỏi',
          'Kiên nhẫn với tiến độ chậm, đừng bỏ cuộc',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Tài chính có thể gặp khó khăn tạm thời. Tránh đầu tư lớn lúc này. Tập trung vào việc ổn định thu nhập hiện tại. Cần lập kế hoạch tài chính cẩn thận. Tiết kiệm dự phòng cho tình huống xấu.`,
        actionSteps: [
          'Lập quỹ dự phòng khẩn cấp (3-6 tháng chi tiêu)',
          'Tránh các quyết định đầu tư lớn',
          'Review và cắt giảm chi tiêu không cần thiết',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Mối quan hệ mới có thể gặp trở ngại. Nếu đang theo đuổi ai đó, hãy kiên nhẫn. Nếu có đôi, có thể có những hiểu lầm nhỏ. Đây không phải lúc để đưa ra quyết định lớn như cầu hôn hoặc chia tay.`,
        actionSteps: [
          'Kiên nhẫn trong tình cảm, không vội vàng',
          'Giải quyết hiểu lầm bằng giao tiếp cởi mở',
          'Cho mối quan hệ thời gian để phát triển tự nhiên',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Sức khỏe cần được chú ý. Có thể cảm thấy mệt mỏi hoặc stress. Đừng ép bản thân quá sức. Nghỉ ngơi đầy đủ và ăn uống lành mạnh. Nếu có vấn đề sức khỏe, hãy đi khám sớm.`,
        actionSteps: [
          'Đi khám tổng quát nếu có triệu chứng bất thường',
          'Giảm căng thẳng bằng thiền hoặc yoga',
          'Ngủ đủ giấc và tránh thức khuya',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Đây là thời điểm thử thách tâm thức. Những khó khăn giúp bạn trưởng thành. Hãy xem đây là bài học từ vũ trụ. Tìm kiếm ý nghĩa trong thử thách. Đức tin sẽ giúp bạn vượt qua.`,
        actionSteps: [
          'Xem khó khăn như cơ hội học hỏi và trưởng thành',
          'Thực hành lòng biết ơn dù trong hoàn cảnh khó khăn',
          'Kết nối với cộng đồng tâm thức để được hỗ trợ',
        ],
      },
    },

    crystals: [
      {
        name: 'Smoky Quartz',
        vietnameseName: 'Thạch Anh Khói',
        reason: 'Giúp vượt qua khó khăn, grounding và bảo vệ',
        usage: 'Mang theo khi đối mặt thử thách hoặc thiền định',
        shopHandle: 'smoky-quartz-point',
      },
      {
        name: 'Carnelian',
        vietnameseName: 'Mã Não Đỏ',
        reason: 'Tăng cường dũng khí, động lực và sự kiên trì',
        usage: 'Đeo như trang sức hoặc để trong túi',
        shopHandle: 'carnelian-tumbled',
      },
      {
        name: 'Garnet',
        vietnameseName: 'Ngọc Hồng Lựu',
        reason: 'Năng lượng và sức mạnh để vượt qua trở ngại',
        usage: 'Đeo như vòng tay hoặc nhẫn',
        shopHandle: 'garnet-bracelet',
      },
    ],

    affirmations: [
      'Mọi khó khăn đều là cơ hội để tôi trưởng thành',
      'Tôi có đủ sức mạnh để vượt qua mọi thử thách',
      'Kiên trì của tôi sẽ được đền đáp xứng đáng',
      'Sau cơn mưa, trời lại sáng',
    ],

    lineInterpretations: {
      1: {
        text: 'Bàn hoàn',
        meaning: 'Đi vòng vo, chưa thể tiến thẳng',
        advice: 'Đừng vội vàng. Cần thời gian chuẩn bị.',
      },
      2: {
        text: 'Truân như chiên như',
        meaning: 'Khó khăn như đang xoay vòng',
        advice: 'Chờ đợi, không hành động vội. Sẽ có người giúp đỡ.',
      },
      3: {
        text: 'Tức lộc vô ngu',
        meaning: 'Săn hươu mà không có người dẫn đường',
        advice: 'Đừng hành động một mình. Tìm kiếm hướng dẫn.',
      },
      4: {
        text: 'Thừa mã ban như',
        meaning: 'Cưỡi ngựa đi từ từ',
        advice: 'Tiến từng bước nhỏ. Có người đồng hành.',
      },
      5: {
        text: 'Truân kỳ cao',
        meaning: 'Khó khăn trong việc ban ơn',
        advice: 'Hành động nhỏ có thể, hành động lớn cần thận trọng.',
      },
      6: {
        text: 'Thừa mã ban như',
        meaning: 'Cưỡi ngựa quay vòng, nước mắt như mưa',
        advice: 'Thời điểm cực kỳ khó khăn. Giữ vững niềm tin.',
      },
    },
  },

  4: {
    id: 4,
    name: 'Mông',
    chineseName: '蒙',
    unicode: '䷃',
    element: 'Thủy',
    nature: 'Âm',
    image: 'Núi trên Nước',
    lines: [0, 1, 0, 0, 0, 1],

    overview: {
      meaning: `Quẻ Mông tượng trưng cho sự non trẻ, thiếu kinh nghiệm như đứa trẻ cần được dạy dỗ. Đây là quẻ về học hỏi, giáo dục và sự khiêm tốn của người chưa biết. Quan trọng là nhận ra mình cần học hỏi và tìm thầy để dẫn dắt.`,
      keywords: ['Học hỏi', 'Non trẻ', 'Khiêm tốn', 'Giáo dục', 'Hướng dẫn'],
      overallAdvice: 'Hãy khiêm tốn thừa nhận những gì mình chưa biết. Tìm thầy, tìm sách, và chăm chỉ học hỏi.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Đây là thời điểm để học hỏi chứ không phải thể hiện. Nếu là người mới, hãy khiêm tốn học từ đồng nghiệp. Nếu là người có kinh nghiệm, có thể có lĩnh vực mới bạn cần học. Tham gia khóa học, đọc sách, tìm mentor.`,
        actionSteps: [
          'Đăng ký một khóa học nâng cao kỹ năng',
          'Tìm mentor trong lĩnh vực bạn muốn phát triển',
          'Đọc sách chuyên môn ít nhất 30 phút mỗi ngày',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Bạn cần học thêm về tài chính trước khi đầu tư. Đừng đầu tư vào những gì mình không hiểu. Tham gia khóa học về đầu tư, đọc sách tài chính. Hỏi ý kiến chuyên gia trước khi quyết định.`,
        actionSteps: [
          'Học về quản lý tài chính cá nhân',
          'Tìm hiểu kỹ trước khi đầu tư bất kỳ thứ gì',
          'Tham khảo ý kiến chuyên gia tài chính',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Trong tình cảm, bạn có thể thiếu kinh nghiệm hoặc đang đối mặt tình huống mới. Học cách yêu thương đúng cách. Lắng nghe lời khuyên từ người có kinh nghiệm. Đừng vội vàng cam kết khi chưa hiểu rõ.`,
        actionSteps: [
          'Đọc sách về giao tiếp và quan hệ',
          'Lắng nghe lời khuyên từ bạn bè đáng tin cậy',
          'Học cách thể hiện tình cảm đúng cách',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Bạn có thể cần học thêm về sức khỏe của bản thân. Tìm hiểu về dinh dưỡng, tập luyện phù hợp với cơ thể. Tham khảo bác sĩ hoặc huấn luyện viên. Đừng tự chẩn đoán hoặc tự điều trị.`,
        actionSteps: [
          'Đi khám tổng quát và hỏi bác sĩ về chế độ phù hợp',
          'Học về dinh dưỡng cơ bản',
          'Tìm huấn luyện viên nếu muốn tập gym',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Con đường tâm thức cần có thầy dẫn dắt. Đừng tự mình mò mẫm. Tìm người hướng dẫn đáng tin cậy, tham gia cộng đồng tâm thức. Học hỏi với tâm mở và khiêm tốn.`,
        actionSteps: [
          'Tìm thầy hoặc cộng đồng tâm thức phù hợp',
          'Đọc kinh điển với tâm mở',
          'Thực hành hàng ngày dưới sự hướng dẫn',
        ],
      },
    },

    crystals: [
      {
        name: 'Lapis Lazuli',
        vietnameseName: 'Thanh Kim Thạch',
        reason: 'Trí tuệ, kiến thức và sự thật',
        usage: 'Đeo khi học tập hoặc cần sự sáng suốt',
        shopHandle: 'lapis-lazuli-pendant',
      },
      {
        name: 'Fluorite',
        vietnameseName: 'Huỳnh Thạch',
        reason: 'Tập trung, ghi nhớ và học hỏi',
        usage: 'Đặt trên bàn học hoặc bàn làm việc',
        shopHandle: 'fluorite-cluster',
      },
      {
        name: 'Sodalite',
        vietnameseName: 'Sodalite',
        reason: 'Tư duy logic, trực giác và học hỏi',
        usage: 'Mang theo khi học hoặc họp quan trọng',
        shopHandle: 'sodalite-tumbled',
      },
    ],

    affirmations: [
      'Tôi là học trò chăm chỉ của cuộc sống',
      'Mỗi ngày tôi học được điều mới',
      'Sự khiêm tốn mở ra cánh cửa trí tuệ',
      'Thầy xuất hiện khi trò sẵn sàng',
    ],

    lineInterpretations: {
      1: {
        text: 'Phát mông',
        meaning: 'Mở mang sự ngu muội',
        advice: 'Cần kỷ luật để học. Đặt ra quy tắc cho bản thân.',
      },
      2: {
        text: 'Bao mông cát',
        meaning: 'Bao dung người non nớt, tốt lành',
        advice: 'Kiên nhẫn với bản thân và người khác. Từ bi.',
      },
      3: {
        text: 'Vật dụng thủ nữ',
        meaning: 'Đừng lấy người phụ nữ chỉ vì nhan sắc',
        advice: 'Đừng bị lừa bởi vẻ bề ngoài. Nhìn vào bản chất.',
      },
      4: {
        text: 'Khốn mông lận',
        meaning: 'Bị mắc kẹt trong sự ngu muội',
        advice: 'Đang xa rời thực tế. Cần quay lại học cơ bản.',
      },
      5: {
        text: 'Đồng mông cát',
        meaning: 'Sự ngây thơ của trẻ thơ, tốt lành',
        advice: 'Giữ tâm hồn trẻ thơ, ham học hỏi.',
      },
      6: {
        text: 'Kích mông',
        meaning: 'Đánh tan sự ngu muội',
        advice: 'Đôi khi cần biện pháp mạnh để học bài. Kỷ luật.',
      },
    },
  },

  5: {
    id: 5,
    name: 'Nhu',
    chineseName: '需',
    unicode: '䷄',
    element: 'Thủy',
    nature: 'Dương',
    image: 'Nước trên Trời',
    lines: [1, 1, 1, 0, 1, 0],

    overview: {
      meaning: `Quẻ Nhu tượng trưng cho sự chờ đợi có ý nghĩa. Như mây tụ trên trời sẽ có mưa, nhưng cần kiên nhẫn. Đây là quẻ về timing - biết khi nào nên hành động và khi nào nên chờ. Thời cơ chưa đến, chờ đợi là khôn ngoan.`,
      keywords: ['Chờ đợi', 'Kiên nhẫn', 'Thời cơ', 'Nuôi dưỡng', 'Chuẩn bị'],
      overallAdvice: 'Đừng vội vàng hành động. Thời cơ chưa chín muồi. Hãy chuẩn bị và kiên nhẫn chờ đợi.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Dự án hoặc cơ hội bạn đang chờ sẽ đến, nhưng chưa phải lúc này. Thay vì sốt ruột, hãy dùng thời gian để chuẩn bị kỹ hơn. Nâng cao kỹ năng, mở rộng network. Khi thời cơ đến, bạn sẽ sẵn sàng.`,
        actionSteps: [
          'Dùng thời gian chờ đợi để nâng cao kỹ năng',
          'Xây dựng network và mối quan hệ',
          'Chuẩn bị portfolio hoặc hồ sơ sẵn sàng',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Cơ hội đầu tư sẽ đến, nhưng chưa phải ngay bây giờ. Tích lũy vốn và kiến thức trong khi chờ đợi. Không nên mạo hiểm lúc này. Khi thời cơ đến, bạn sẽ có đủ nguồn lực.`,
        actionSteps: [
          'Tiếp tục tiết kiệm và tích lũy vốn',
          'Nghiên cứu các cơ hội đầu tư tiềm năng',
          'Không FOMO, không vội vàng mua bán',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Nếu đang chờ đợi tình yêu, hãy kiên nhẫn. Người phù hợp sẽ xuất hiện đúng lúc. Nếu đang trong mối quan hệ, đây là lúc nuôi dưỡng chứ không phải thúc đẩy tiến xa hơn.`,
        actionSteps: [
          'Tập trung vào việc hoàn thiện bản thân',
          'Không ép buộc mối quan hệ phát triển nhanh',
          'Nuôi dưỡng tình cảm bằng những hành động nhỏ hàng ngày',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Đây là thời điểm để chăm sóc và nuôi dưỡng cơ thể. Ăn uống đầy đủ dinh dưỡng, nghỉ ngơi hợp lý. Tránh các hoạt động quá sức. Dành thời gian cho việc phục hồi.`,
        actionSteps: [
          'Ăn uống đủ chất, ưu tiên thực phẩm tự nhiên',
          'Nghỉ ngơi đầy đủ, tránh thức khuya',
          'Tập thể dục nhẹ nhàng, không quá sức',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Đây là thời kỳ chuẩn bị tâm thức. Tích lũy năng lượng, thiền định, và nuôi dưỡng tâm hồn. Sự giác ngộ sẽ đến khi bạn sẵn sàng. Tin tưởng vào divine timing.`,
        actionSteps: [
          'Thiền định đều đặn mỗi ngày',
          'Đọc sách tâm thức để nuôi dưỡng tâm hồn',
          'Tin vào timing của vũ trụ',
        ],
      },
    },

    crystals: [
      {
        name: 'Aquamarine',
        vietnameseName: 'Ngọc Biển',
        reason: 'Sự bình tĩnh và kiên nhẫn trong chờ đợi',
        usage: 'Đeo khi cần sự bình tĩnh và kiên nhẫn',
        shopHandle: 'aquamarine-pendant',
      },
      {
        name: 'Blue Lace Agate',
        vietnameseName: 'Mã Não Xanh Lơ',
        reason: 'Sự thanh thản và giảm lo lắng',
        usage: 'Mang theo khi cảm thấy sốt ruột',
        shopHandle: 'blue-lace-agate-tumbled',
      },
      {
        name: 'Celestite',
        vietnameseName: 'Thiên Thanh Thạch',
        reason: 'Kết nối tâm thức và sự an bình',
        usage: 'Đặt trong phòng thiền hoặc phòng ngủ',
        shopHandle: 'celestite-cluster',
      },
    ],

    affirmations: [
      'Tôi tin tưởng vào divine timing của vũ trụ',
      'Mọi thứ đến đúng lúc khi tôi sẵn sàng',
      'Chờ đợi là một phần của hành trình',
      'Tôi sử dụng thời gian chờ đợi một cách khôn ngoan',
    ],

    lineInterpretations: {
      1: {
        text: 'Nhu vu giao',
        meaning: 'Chờ đợi ở ngoại ô',
        advice: 'Vẫn còn xa đích đến. Kiên nhẫn và bền bỉ.',
      },
      2: {
        text: 'Nhu vu sa',
        meaning: 'Chờ đợi trên bãi cát',
        advice: 'Có thể có lời bàn tán. Giữ bình tĩnh.',
      },
      3: {
        text: 'Nhu vu nê',
        meaning: 'Chờ đợi trong bùn lầy',
        advice: 'Tình huống khó khăn. Cẩn thận có thể bị tấn công.',
      },
      4: {
        text: 'Nhu vu huyết',
        meaning: 'Chờ đợi trong máu',
        advice: 'Nguy hiểm cận kề. Thuận theo hoàn cảnh.',
      },
      5: {
        text: 'Nhu vu tửu thực',
        meaning: 'Chờ đợi với rượu và đồ ăn',
        advice: 'Thời điểm tốt. Vui vẻ và kiên nhẫn chờ đợi.',
      },
      6: {
        text: 'Nhập vu huyệt',
        meaning: 'Bước vào hang động',
        advice: 'Khách không mời đến. Đối xử tử tế sẽ tốt lành.',
      },
    },
  },

  6: {
    id: 6,
    name: 'Tụng',
    chineseName: '訟',
    unicode: '䷅',
    element: 'Kim',
    nature: 'Dương',
    image: 'Trời trên Nước',
    lines: [0, 1, 0, 1, 1, 1],

    overview: {
      meaning: `Quẻ Tụng tượng trưng cho xung đột và tranh chấp. Trời và Nước đi ngược hướng nhau. Đây là quẻ cảnh báo về mâu thuẫn, kiện tụng hoặc bất đồng. Tốt nhất là tìm cách hòa giải thay vì leo thang xung đột.`,
      keywords: ['Xung đột', 'Tranh chấp', 'Mâu thuẫn', 'Hòa giải', 'Cẩn trọng'],
      overallAdvice: 'Tránh xung đột nếu có thể. Nếu đang có tranh chấp, tìm người trung gian hòa giải. Không nên kiên quyết đến cùng.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Có thể có xung đột với đồng nghiệp hoặc cấp trên. Đừng để ego lấn át lý trí. Tìm cách thỏa hiệp thay vì đối đầu. Nếu có vấn đề hợp đồng, hãy cẩn thận và tìm sự tư vấn.`,
        actionSteps: [
          'Giữ bình tĩnh trong các cuộc tranh luận',
          'Tìm điểm chung thay vì nhấn mạnh sự khác biệt',
          'Tham khảo ý kiến người có kinh nghiệm hoặc luật sư nếu cần',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Có thể có tranh chấp về tiền bạc. Tránh cho vay hoặc đầu tư chung với người khác lúc này. Nếu có vấn đề về hợp đồng tài chính, hãy cẩn thận xem xét. Không nên kiện tụng vì sẽ tốn kém.`,
        actionSteps: [
          'Đọc kỹ mọi hợp đồng trước khi ký',
          'Tránh cho vay tiền lúc này',
          'Giải quyết tranh chấp bằng thương lượng',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Có thể có mâu thuẫn trong mối quan hệ. Đừng để cãi vã nhỏ trở thành vấn đề lớn. Lắng nghe đối phương thay vì chỉ muốn thắng cuộc. Tìm cách hòa giải thay vì đổ lỗi.`,
        actionSteps: [
          'Lắng nghe trước khi phản ứng',
          'Tìm điểm thỏa hiệp trong mâu thuẫn',
          'Không nhắc lại lỗi lầm quá khứ',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Stress từ xung đột có thể ảnh hưởng sức khỏe. Chú ý đến huyết áp, tim mạch. Tìm cách giải tỏa stress. Không để mâu thuẫn ảnh hưởng đến giấc ngủ.`,
        actionSteps: [
          'Thực hành các kỹ thuật giảm stress',
          'Tránh đồ uống có caffeine khi đang căng thẳng',
          'Tập thể dục để giải tỏa năng lượng tiêu cực',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Xung đột bên ngoài phản ánh mâu thuẫn bên trong. Hãy nhìn vào bản thân để hiểu nguyên nhân. Học cách buông bỏ ego và tha thứ. Xung đột là cơ hội để trưởng thành tâm thức.`,
        actionSteps: [
          'Thiền định về lòng tha thứ',
          'Xem xét phần nào của mình trong xung đột',
          'Thực hành buông bỏ sự tức giận',
        ],
      },
    },

    crystals: [
      {
        name: 'Amethyst',
        vietnameseName: 'Thạch Anh Tím',
        reason: 'Bình tĩnh, giảm xung đột và giận dữ',
        usage: 'Mang theo khi phải đối mặt tranh chấp',
        shopHandle: 'amethyst-cluster',
      },
      {
        name: 'Lepidolite',
        vietnameseName: 'Lepidolite',
        reason: 'Giảm stress và lo lắng',
        usage: 'Để trong túi hoặc dưới gối',
        shopHandle: 'lepidolite-tumbled',
      },
      {
        name: 'Blue Kyanite',
        vietnameseName: 'Kyanite Xanh',
        reason: 'Giao tiếp hòa bình, giải quyết xung đột',
        usage: 'Đeo khi cần giao tiếp khó khăn',
        shopHandle: 'blue-kyanite-blade',
      },
    ],

    affirmations: [
      'Tôi chọn hòa bình thay vì đúng sai',
      'Tôi giải quyết xung đột bằng sự hiểu biết',
      'Tha thứ giải phóng tôi khỏi gánh nặng',
      'Tôi lắng nghe để hiểu, không phải để đáp trả',
    ],

    lineInterpretations: {
      1: {
        text: 'Bất vĩnh sở sự',
        meaning: 'Không kéo dài vụ việc',
        advice: 'Dừng lại sớm, có lời bàn tán nhưng cuối cùng tốt lành.',
      },
      2: {
        text: 'Bất khắc tụng',
        meaning: 'Không thể thắng kiện',
        advice: 'Rút lui, về nhà. Tránh được tai họa.',
      },
      3: {
        text: 'Thực cựu đức',
        meaning: 'Sống bằng đức cũ',
        advice: 'Giữ những gì mình có. Có nguy hiểm nhưng cuối cùng tốt.',
      },
      4: {
        text: 'Bất khắc tụng',
        meaning: 'Không thể thắng kiện',
        advice: 'Quay về với mệnh. Thay đổi thái độ, an bình.',
      },
      5: {
        text: 'Tụng nguyên cát',
        meaning: 'Kiện tụng, cực kỳ tốt lành',
        advice: 'Có người công bằng phân xử. Kết quả tốt.',
      },
      6: {
        text: 'Hoặc tích chi bàn đái',
        meaning: 'Có thể được ban đai ngọc',
        advice: 'Thắng nhưng không bền. Được sẽ mất.',
      },
    },
  },

  7: {
    id: 7,
    name: 'Sư',
    chineseName: '師',
    unicode: '䷆',
    element: 'Thổ',
    nature: 'Âm',
    image: 'Đất chứa Nước',
    lines: [0, 1, 0, 0, 0, 0],

    overview: {
      meaning: `Quẻ Sư tượng trưng cho quân đội, kỷ luật và lãnh đạo có tổ chức. Như nước ẩn trong đất, sức mạnh tiềm ẩn cần được tổ chức và dẫn dắt đúng cách. Đây là quẻ về leadership, discipline và teamwork.`,
      keywords: ['Kỷ luật', 'Lãnh đạo', 'Tổ chức', 'Chiến lược', 'Team'],
      overallAdvice: 'Cần có kỷ luật và tổ chức tốt. Tìm người lãnh đạo có năng lực hoặc trở thành người lãnh đạo tốt.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Đây là thời điểm cần kỷ luật và tổ chức trong công việc. Nếu lãnh đạo team, hãy dẫn dắt bằng ví dụ. Chiến lược và kế hoạch rõ ràng là chìa khóa thành công. Cần sự đoàn kết của cả nhóm.`,
        actionSteps: [
          'Lập kế hoạch chi tiết cho dự án',
          'Phân công nhiệm vụ rõ ràng cho từng thành viên',
          'Giữ kỷ luật trong công việc hàng ngày',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Tài chính cần được quản lý có kỷ luật. Lập ngân sách và tuân thủ nghiêm ngặt. Không đầu tư theo cảm tính. Chiến lược dài hạn quan trọng hơn lợi nhuận ngắn hạn.`,
        actionSteps: [
          'Lập và tuân thủ ngân sách hàng tháng',
          'Xây dựng chiến lược đầu tư dài hạn',
          'Đánh giá lại portfolio định kỳ',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Trong tình cảm, cần sự cam kết và "kỷ luật" để duy trì mối quan hệ. Đừng để cảm xúc nhất thời phá hỏng. Làm việc nhóm với partner để xây dựng tương lai.`,
        actionSteps: [
          'Cam kết với mối quan hệ một cách nghiêm túc',
          'Lập kế hoạch tương lai cùng partner',
          'Giữ lời hứa và sự nhất quán',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Sức khỏe cần có routine và kỷ luật. Lập lịch tập luyện và tuân thủ. Ăn uống có kế hoạch. Không để cảm xúc ảnh hưởng đến thói quen lành mạnh.`,
        actionSteps: [
          'Lập lịch tập thể dục cố định',
          'Meal prep để kiểm soát dinh dưỡng',
          'Ngủ đúng giờ mỗi ngày',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Con đường tâm thức cần kỷ luật và thực hành đều đặn. Thiền định, tụng kinh hoặc yoga cần được thực hành hàng ngày. Tìm cộng đồng tu tập để hỗ trợ lẫn nhau.`,
        actionSteps: [
          'Thiền định mỗi ngày cùng một giờ',
          'Tham gia group tu tập hoặc sangha',
          'Giữ kỷ luật trong thực hành tâm thức',
        ],
      },
    },

    crystals: [
      {
        name: 'Hematite',
        vietnameseName: 'Huyết Thạch',
        reason: 'Grounding, kỷ luật và sức mạnh ý chí',
        usage: 'Đeo như vòng tay để tăng kỷ luật',
        shopHandle: 'hematite-bracelet',
      },
      {
        name: 'Red Jasper',
        vietnameseName: 'Jasper Đỏ',
        reason: 'Sức mạnh, quyết tâm và lãnh đạo',
        usage: 'Mang theo khi cần dẫn dắt người khác',
        shopHandle: 'red-jasper-tumbled',
      },
      {
        name: 'Obsidian',
        vietnameseName: 'Hắc Diện Thạch',
        reason: 'Bảo vệ và quyết đoán',
        usage: 'Để trên bàn làm việc hoặc mang theo',
        shopHandle: 'obsidian-sphere',
      },
    ],

    affirmations: [
      'Tôi lãnh đạo bằng sự chính trực và gương mẫu',
      'Kỷ luật tự giác đưa tôi đến thành công',
      'Tôi xây dựng đội ngũ mạnh mẽ và đoàn kết',
      'Chiến lược và kế hoạch dẫn lối cho hành động',
    ],

    lineInterpretations: {
      1: {
        text: 'Sư xuất dĩ luật',
        meaning: 'Quân đội xuất phát có kỷ luật',
        advice: 'Khởi đầu có trật tự. Kỷ luật từ đầu.',
      },
      2: {
        text: 'Tại sư trung cát',
        meaning: 'Ở trong quân, tốt lành',
        advice: 'Vị trí trung tâm. Được vua tin tưởng.',
      },
      3: {
        text: 'Sư hoặc dư thi',
        meaning: 'Quân có thể có thi thể',
        advice: 'Nguy hiểm, có thể thất bại. Cẩn thận.',
      },
      4: {
        text: 'Sư tả thứ',
        meaning: 'Quân doanh ở bên trái',
        advice: 'Rút lui có trật tự. Không có lỗi.',
      },
      5: {
        text: 'Điền hữu cầm',
        meaning: 'Trong ruộng có thú để bắt',
        advice: 'Có người để dẫn dắt. Nhiệm vụ rõ ràng.',
      },
      6: {
        text: 'Đại quân hữu mệnh',
        meaning: 'Đại tướng có mệnh lệnh',
        advice: 'Thành công. Nhưng đừng dùng kẻ tiểu nhân.',
      },
    },
  },

  8: {
    id: 8,
    name: 'Tỷ',
    chineseName: '比',
    unicode: '䷇',
    element: 'Thủy',
    nature: 'Âm',
    image: 'Nước trên Đất',
    lines: [0, 0, 0, 0, 1, 0],

    overview: {
      meaning: `Quẻ Tỷ tượng trưng cho sự đoàn kết, liên minh và hỗ trợ lẫn nhau. Như nước trên đất nuôi dưỡng vạn vật, con người cần hợp tác và hỗ trợ nhau. Đây là quẻ về partnership, alliance và community.`,
      keywords: ['Đoàn kết', 'Hợp tác', 'Liên minh', 'Hỗ trợ', 'Cộng đồng'],
      overallAdvice: 'Đây là lúc để tìm kiếm đồng minh và xây dựng mối quan hệ hợp tác. Không ai thành công một mình.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Thành công đến từ sự hợp tác. Tìm kiếm partner hoặc mentor. Xây dựng team mạnh. Gia nhập hiệp hội ngành nghề. Network là chìa khóa mở cánh cửa cơ hội.`,
        actionSteps: [
          'Tham gia các hiệp hội hoặc nhóm chuyên nghiệp',
          'Tìm mentor hoặc partner kinh doanh',
          'Xây dựng mối quan hệ win-win với đồng nghiệp',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Hợp tác đầu tư có thể mang lại lợi ích. Tìm partner có cùng vision. Tuy nhiên, cẩn thận chọn đúng người. Đa dạng hóa bằng cách hợp tác với nhiều nguồn.`,
        actionSteps: [
          'Cân nhắc đầu tư cùng partner đáng tin cậy',
          'Tham gia investment club hoặc community',
          'Chia sẻ kiến thức và học hỏi từ người khác',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Đây là thời điểm tốt để xây dựng mối quan hệ sâu sắc. Nếu độc thân, có thể gặp được ai đó qua bạn bè. Nếu có đôi, tăng cường sự gắn kết và hỗ trợ lẫn nhau.`,
        actionSteps: [
          'Dành thời gian chất lượng với người thân',
          'Tham gia hoạt động cộng đồng cùng partner',
          'Hỗ trợ nhau vượt qua khó khăn',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Tập thể dục cùng bạn bè hoặc group sẽ hiệu quả hơn. Tìm workout buddy hoặc tham gia lớp tập. Sự hỗ trợ từ cộng đồng giúp duy trì động lực.`,
        actionSteps: [
          'Tìm workout buddy hoặc tham gia lớp tập nhóm',
          'Tham gia cộng đồng sức khỏe online',
          'Chia sẻ mục tiêu sức khỏe với người thân',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Con đường tâm thức cần sangha (cộng đồng). Tham gia nhóm thiền, lớp yoga hoặc cộng đồng tâm thức. Năng lượng tập thể mạnh hơn cá nhân.`,
        actionSteps: [
          'Tham gia nhóm thiền hoặc tu tập',
          'Tìm thầy và bạn đạo',
          'Phục vụ cộng đồng như một phần của thực hành',
        ],
      },
    },

    crystals: [
      {
        name: 'Amazonite',
        vietnameseName: 'Amazonite',
        reason: 'Harmony, giao tiếp và hợp tác',
        usage: 'Đeo khi cần làm việc nhóm',
        shopHandle: 'amazonite-tumbled',
      },
      {
        name: 'Rhodonite',
        vietnameseName: 'Rhodonite',
        reason: 'Tình bạn, lòng vị tha và hỗ trợ',
        usage: 'Mang theo khi gặp gỡ bạn bè hoặc đối tác',
        shopHandle: 'rhodonite-heart',
      },
      {
        name: 'Green Aventurine',
        vietnameseName: 'Aventurine Xanh',
        reason: 'May mắn trong hợp tác và kinh doanh',
        usage: 'Đeo khi ký kết hợp đồng hoặc gặp đối tác',
        shopHandle: 'green-aventurine-bracelet',
      },
    ],

    affirmations: [
      'Tôi thu hút những người đồng điệu và hỗ trợ',
      'Hợp tác mang lại sức mạnh và thành công',
      'Tôi là một phần của cộng đồng yêu thương',
      'Cho đi và nhận lại đều là hạnh phúc',
    ],

    lineInterpretations: {
      1: {
        text: 'Hữu phu tỷ chi',
        meaning: 'Có lòng thành thì đoàn kết',
        advice: 'Chân thành là nền tảng. Cuối cùng có điều tốt đẹp.',
      },
      2: {
        text: 'Tỷ chi tự nội',
        meaning: 'Đoàn kết từ bên trong',
        advice: 'Giữ chính trực. Đoàn kết tự bên trong.',
      },
      3: {
        text: 'Tỷ chi phỉ nhân',
        meaning: 'Đoàn kết với người không phải',
        advice: 'Cẩn thận chọn đồng minh. Có thể chọn sai.',
      },
      4: {
        text: 'Ngoại tỷ chi',
        meaning: 'Đoàn kết với người bên ngoài',
        advice: 'Hợp tác với người ngoài nhóm. Tốt lành.',
      },
      5: {
        text: 'Hiển tỷ',
        meaning: 'Đoàn kết rõ ràng',
        advice: 'Lãnh đạo đoàn kết đúng cách. Không ép buộc.',
      },
      6: {
        text: 'Tỷ chi vô thủ',
        meaning: 'Đoàn kết không có đầu',
        advice: 'Thiếu lãnh đạo. Cần tìm người dẫn dắt.',
      },
    },
  },

  // Tiếp tục với các quẻ từ 9-64...
  // Vì file quá dài, tôi sẽ tạo thêm phần còn lại

  9: {
    id: 9,
    name: 'Tiểu Súc',
    chineseName: '小畜',
    unicode: '䷈',
    element: 'Mộc',
    nature: 'Dương',
    image: 'Gió trên Trời',
    lines: [1, 1, 1, 0, 1, 1],

    overview: {
      meaning: `Quẻ Tiểu Súc tượng trưng cho sự tích lũy nhỏ, như gió nhẹ có thể cản mây nhưng không đủ mạnh để tạo mưa. Đây là giai đoạn tích lũy từng chút một, chưa đến lúc hành động lớn. Kiên nhẫn tích góp sẽ dần có kết quả.`,
      keywords: ['Tích lũy', 'Kiên nhẫn', 'Từng bước', 'Chuẩn bị', 'Tiết chế'],
      overallAdvice: 'Tích lũy từng chút một. Chưa phải lúc cho hành động lớn. Kiên nhẫn và tiết chế.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Tiến bộ chậm nhưng đều đặn. Không nên vội vàng thăng tiến hay đổi việc. Tích lũy kinh nghiệm và kỹ năng. Mỗi ngày học hỏi thêm một chút.`,
        actionSteps: [
          'Học thêm một kỹ năng mới mỗi tháng',
          'Ghi chú và reflect về công việc hàng ngày',
          'Xây dựng portfolio dần dần',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Tiết kiệm từng đồng. Đầu tư nhỏ đều đặn (DCA). Không mong lợi nhuận lớn ngay. Tích tiểu thành đại. Kiểm soát chi tiêu chặt chẽ.`,
        actionSteps: [
          'Áp dụng phương pháp DCA đầu tư đều đặn',
          'Tiết kiệm 10-20% thu nhập hàng tháng',
          'Cắt giảm chi tiêu không cần thiết',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Xây dựng tình cảm từ những điều nhỏ. Không nên vội vàng cam kết lớn. Những cử chỉ yêu thương nhỏ hàng ngày quan trọng hơn lời hứa to lớn.`,
        actionSteps: [
          'Thể hiện tình yêu qua những việc nhỏ hàng ngày',
          'Không vội tiến đến bước tiếp theo',
          'Trân trọng những khoảnh khắc bình thường',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Thay đổi lối sống từng chút một. Không cần biến đổi hoàn toàn ngay. Thêm một thói quen lành mạnh mỗi tuần. Tiến bộ nhỏ tích lũy thành kết quả lớn.`,
        actionSteps: [
          'Thêm 10 phút đi bộ mỗi ngày',
          'Thay thế một thói quen xấu bằng thói quen tốt',
          'Uống thêm 1 ly nước mỗi ngày',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Tu tập từng ngày một chút. Không cần tu khổ hạnh ngay. 5 phút thiền mỗi ngày tốt hơn 1 giờ mỗi tháng. Kiên trì là chìa khóa.`,
        actionSteps: [
          'Thiền 5-10 phút mỗi sáng',
          'Đọc 1 trang sách tâm thức mỗi ngày',
          'Thực hành chánh niệm trong sinh hoạt',
        ],
      },
    },

    crystals: [
      {
        name: 'Green Jade',
        vietnameseName: 'Ngọc Bích',
        reason: 'Tích lũy và thịnh vượng dần dần',
        usage: 'Đeo như trang sức hoặc để trong ví',
        shopHandle: 'green-jade-pendant',
      },
      {
        name: 'Peridot',
        vietnameseName: 'Olivine',
        reason: 'Kiên nhẫn và tích cực',
        usage: 'Đeo khi cần sự kiên nhẫn',
        shopHandle: 'peridot-ring',
      },
      {
        name: 'Malachite',
        vietnameseName: 'Khổng Tước Thạch',
        reason: 'Chuyển đổi và phát triển từ từ',
        usage: 'Đặt trên bàn làm việc',
        shopHandle: 'malachite-tumbled',
      },
    ],

    affirmations: [
      'Mỗi bước nhỏ đều đưa tôi gần đến mục tiêu',
      'Tôi kiên nhẫn tích lũy từng ngày',
      'Tiến bộ nhỏ tích lũy thành thành công lớn',
      'Tôi trân trọng hành trình, không chỉ đích đến',
    ],

    lineInterpretations: {
      1: {
        text: 'Phục tự đạo',
        meaning: 'Quay về con đường của mình',
        advice: 'Giữ hướng đi. Không có lỗi.',
      },
      2: {
        text: 'Khiên phục',
        meaning: 'Kéo quay về',
        advice: 'Tốt lành. Được người khác giúp quay về đúng đường.',
      },
      3: {
        text: 'Dư thuyết bức',
        meaning: 'Bánh xe tuột trục',
        advice: 'Xung đột với partner. Cẩn thận.',
      },
      4: {
        text: 'Hữu phu',
        meaning: 'Có lòng thành',
        advice: 'Chân thành thì thoát khỏi lo lắng.',
      },
      5: {
        text: 'Hữu phu loan như',
        meaning: 'Có lòng thành và ràng buộc',
        advice: 'Chia sẻ thịnh vượng với láng giềng.',
      },
      6: {
        text: 'Ký vũ ký xử',
        meaning: 'Mưa đã rơi, đã dừng',
        advice: 'Mục tiêu gần đạt được. Nhưng đừng vội.',
      },
    },
  },

  10: {
    id: 10,
    name: 'Lý',
    chineseName: '履',
    unicode: '䷉',
    element: 'Kim',
    nature: 'Dương',
    image: 'Trời trên Hồ',
    lines: [1, 1, 0, 1, 1, 1],

    overview: {
      meaning: `Quẻ Lý tượng trưng cho cách cư xử đúng đắn, như đi trên đường nguy hiểm mà vẫn an toàn. Đây là quẻ về conduct, manners và treading carefully. Dù hoàn cảnh khó khăn, cư xử đúng cách sẽ đưa bạn vượt qua.`,
      keywords: ['Cư xử', 'Cẩn trọng', 'Phép tắc', 'An toàn', 'Đúng đắn'],
      overallAdvice: 'Hành xử đúng cách dù trong hoàn cảnh khó khăn. Giữ phép tắc và sự khiêm tốn sẽ giúp bạn an toàn.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Cẩn thận trong cách cư xử nơi công sở. Có thể đang trong tình huống nhạy cảm với cấp trên. Giữ phép tắc, khiêm tốn nhưng không hèn nhát. Đúng đắn sẽ được công nhận.`,
        actionSteps: [
          'Giữ professional trong mọi tình huống',
          'Cẩn thận lời nói và hành động với cấp trên',
          'Làm đúng việc dù có thể không được ưa',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Cẩn thận với các quyết định tài chính. Tuân thủ luật pháp và đạo đức trong kinh doanh. Không tham lam, không liều lĩnh. An toàn là ưu tiên.`,
        actionSteps: [
          'Tuân thủ luật thuế và quy định tài chính',
          'Không tham gia các scheme bất hợp pháp',
          'Đánh giá rủi ro kỹ trước khi đầu tư',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Cư xử đúng mực trong tình cảm. Tôn trọng đối phương và gia đình họ. Đừng vội vàng hay thiếu tôn trọng. Lễ nghĩa tạo nên sự tin tưởng.`,
        actionSteps: [
          'Tôn trọng ranh giới của đối phương',
          'Cư xử đúng mực khi gặp gia đình',
          'Giữ lời hứa và sự nhất quán',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Cẩn thận với sức khỏe, đặc biệt là tai nạn. Chú ý khi đi lại, lái xe. Không mạo hiểm với các hoạt động nguy hiểm. An toàn là trên hết.`,
        actionSteps: [
          'Cẩn thận khi tham gia giao thông',
          'Tránh các hoạt động mạo hiểm không cần thiết',
          'Kiểm tra sức khỏe định kỳ',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Con đường tâm thức cần sự kính trọng và khiêm tốn. Tôn kính thầy, tôn trọng truyền thống. Không kiêu ngạo dù có tiến bộ. Đi từng bước chắc chắn.`,
        actionSteps: [
          'Giữ sự kính trọng với thầy và truyền thống',
          'Không khoe khoang sự tiến bộ tâm thức',
          'Thực hành với sự khiêm tốn',
        ],
      },
    },

    crystals: [
      {
        name: 'Blue Sapphire',
        vietnameseName: 'Sapphire Xanh',
        reason: 'Trí tuệ, đạo đức và cư xử đúng đắn',
        usage: 'Đeo khi cần đưa ra quyết định quan trọng',
        shopHandle: 'blue-sapphire-ring',
      },
      {
        name: 'Black Onyx',
        vietnameseName: 'Mã Não Đen',
        reason: 'Bảo vệ và kỷ luật bản thân',
        usage: 'Đeo như trang sức bảo vệ',
        shopHandle: 'black-onyx-pendant',
      },
      {
        name: 'Snowflake Obsidian',
        vietnameseName: 'Obsidian Bông Tuyết',
        reason: 'Cân bằng và sự thuần khiết',
        usage: 'Mang theo khi trong tình huống khó khăn',
        shopHandle: 'snowflake-obsidian-tumbled',
      },
    ],

    affirmations: [
      'Tôi cư xử đúng đắn trong mọi hoàn cảnh',
      'Sự khiêm tốn và phép tắc bảo vệ tôi',
      'Tôi đi trên con đường chính đạo',
      'Đạo đức là kim chỉ nam cho mọi hành động',
    ],

    lineInterpretations: {
      1: {
        text: 'Tố lý vãng',
        meaning: 'Đi đơn giản, không có lỗi',
        advice: 'Giữ sự đơn giản. Tiến lên không vấn đề.',
      },
      2: {
        text: 'Lý đạo thản thản',
        meaning: 'Đường đi bằng phẳng',
        advice: 'Người ẩn sĩ, con đường an bình.',
      },
      3: {
        text: 'Diểu năng thị',
        meaning: 'Người mù có thể thấy',
        advice: 'Quá tự tin. Có nguy hiểm. Cẩn thận.',
      },
      4: {
        text: 'Lý hổ vĩ',
        meaning: 'Đạp lên đuôi hổ',
        advice: 'Nguy hiểm nhưng cẩn thận thì cuối cùng tốt.',
      },
      5: {
        text: 'Quyết lý',
        meaning: 'Đi quyết đoán',
        advice: 'Cần quyết đoán. Nhưng vẫn cảnh giác.',
      },
      6: {
        text: 'Thị lý khảo tường',
        meaning: 'Xem xét con đường, kiểm tra điềm lành',
        advice: 'Nhìn lại hành trình. Nếu tốt, đại cát.',
      },
    },
  },

  11: {
    id: 11,
    name: 'Thái',
    chineseName: '泰',
    unicode: '䷊',
    element: 'Thổ',
    nature: 'Dương',
    image: 'Đất trên Trời',
    lines: [1, 1, 1, 0, 0, 0],

    overview: {
      meaning: `Quẻ Thái tượng trưng cho sự hòa hợp và thịnh vượng tột độ. Trời và Đất giao hòa, vạn vật sinh sôi. Đây là quẻ cực kỳ may mắn, báo hiệu thời kỳ thuận lợi, mọi việc hanh thông. Âm dương cân bằng, trên dưới hòa hợp.`,
      keywords: ['Thịnh vượng', 'Hòa hợp', 'May mắn', 'Hanh thông', 'Cân bằng'],
      overallAdvice: 'Đây là thời điểm tốt nhất. Tận dụng cơ hội, nhưng nhớ rằng cực thịnh rồi sẽ suy. Chuẩn bị cho tương lai.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Sự nghiệp đang ở thời kỳ hoàng kim. Mọi dự án thuận lợi, cấp trên ủng hộ, đồng nghiệp hợp tác. Đây là lúc để mở rộng, đề xuất ý tưởng lớn. Tuy nhiên, đừng quên chuẩn bị cho giai đoạn tiếp theo.`,
        actionSteps: [
          'Tận dụng thời cơ để đề xuất dự án lớn',
          'Xây dựng nền tảng vững chắc cho tương lai',
          'Chia sẻ thành công với team',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Tài chính đang ở mức tốt nhất. Thu nhập ổn định hoặc tăng, đầu tư có lợi nhuận. Đây là thời điểm tốt để đầu tư mở rộng. Tuy nhiên, nên để dành một phần cho thời kỳ khó khăn.`,
        actionSteps: [
          'Đầu tư mở rộng trong lĩnh vực quen thuộc',
          'Duy trì quỹ dự phòng 6-12 tháng',
          'Chia sẻ thịnh vượng với người cần',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Tình cảm viên mãn, gia đình hạnh phúc. Nếu độc thân, đây là thời điểm tuyệt vời để gặp người phù hợp. Nếu có đôi, mối quan hệ đang ở đỉnh cao. Kết hôn, sinh con đều thuận lợi.`,
        actionSteps: [
          'Tận hưởng hạnh phúc hiện tại',
          'Cam kết sâu hơn nếu đã sẵn sàng',
          'Tri ân người thân và gia đình',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Sức khỏe tốt, năng lượng dồi dào. Đây là thời điểm tốt để duy trì và củng cố. Tiếp tục thói quen lành mạnh. Tuy nhiên, đừng chủ quan, vẫn cần chăm sóc bản thân.`,
        actionSteps: [
          'Duy trì routine tập luyện hiện tại',
          'Kiểm tra sức khỏe định kỳ',
          'Tận hưởng hoạt động outdoor',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Tâm thức an lạc, cảm giác kết nối với vũ trụ. Đây là thời điểm tốt để thiền định, tu tập. Chia sẻ năng lượng tích cực với người khác. Lòng biết ơn nhân đôi phước lành.`,
        actionSteps: [
          'Thực hành lòng biết ơn mỗi ngày',
          'Chia sẻ năng lượng tích cực với người xung quanh',
          'Đi từ thiện hoặc volunteer',
        ],
      },
    },

    crystals: [
      {
        name: 'Citrine',
        vietnameseName: 'Thạch Anh Vàng',
        reason: 'Thịnh vượng và năng lượng tích cực',
        usage: 'Đặt ở góc tài lộc hoặc đeo như trang sức',
        shopHandle: 'citrine-natural',
      },
      {
        name: 'Pyrite',
        vietnameseName: 'Pyrite',
        reason: 'Thu hút thịnh vượng và may mắn',
        usage: 'Đặt trên bàn làm việc',
        shopHandle: 'pyrite-cube',
      },
      {
        name: 'Sunstone',
        vietnameseName: 'Đá Mặt Trời',
        reason: 'Niềm vui, thịnh vượng và năng lượng dương',
        usage: 'Đeo khi cần năng lượng tích cực',
        shopHandle: 'sunstone-pendant',
      },
    ],

    affirmations: [
      'Tôi đang sống trong thời kỳ thịnh vượng nhất',
      'Mọi điều tốt đẹp đang đến với tôi',
      'Tôi biết ơn và chia sẻ phước lành của mình',
      'Hòa hợp và cân bằng là nền tảng cuộc sống tôi',
    ],

    lineInterpretations: {
      1: {
        text: 'Bạt mao nhự',
        meaning: 'Nhổ cỏ tranh kéo theo cả rễ',
        advice: 'Hành động kéo theo nhiều điều tốt. Tiến lên.',
      },
      2: {
        text: 'Bao hoang',
        meaning: 'Bao dung sự hoang dã',
        advice: 'Rộng lượng và bao dung. Được thiên hạ tin.',
      },
      3: {
        text: 'Vô bình bất bỉ',
        meaning: 'Không có bằng phẳng mà không nghiêng',
        advice: 'Thịnh rồi sẽ suy. Chuẩn bị tinh thần.',
      },
      4: {
        text: 'Phiên phiên',
        meaning: 'Bay lượn',
        advice: 'Chân thành với láng giềng. Không cần giàu có.',
      },
      5: {
        text: 'Đế ất quy muội',
        meaning: 'Vua gả em gái',
        advice: 'Hạnh phúc lớn lao. Nguyên cát.',
      },
      6: {
        text: 'Thành phục vu hoàng',
        meaning: 'Thành trở về hào',
        advice: 'Thời kỳ thịnh sắp qua. Đừng dùng binh.',
      },
    },
  },

  12: {
    id: 12,
    name: 'Bĩ',
    chineseName: '否',
    unicode: '䷋',
    element: 'Kim',
    nature: 'Âm',
    image: 'Trời trên Đất',
    lines: [0, 0, 0, 1, 1, 1],

    overview: {
      meaning: `Quẻ Bĩ là đối lập của Thái, tượng trưng cho sự bế tắc và chia cách. Trời và Đất không giao hòa, vạn vật không sinh. Đây là giai đoạn khó khăn, giao tiếp bị cản trở, công việc đình trệ. Tuy nhiên, sau bĩ sẽ thái.`,
      keywords: ['Bế tắc', 'Khó khăn', 'Chia cách', 'Kiên nhẫn', 'Chờ đợi'],
      overallAdvice: 'Đây là giai đoạn bế tắc. Giữ vững tinh thần, không hành động vội vàng. Thời gian sẽ thay đổi mọi thứ.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Công việc gặp trở ngại, dự án bị đình trệ. Cấp trên không ủng hộ, đồng nghiệp thiếu hợp tác. Không nên khởi sự mới hoặc đề xuất ý tưởng lúc này. Giữ vững vị trí hiện tại và chờ thời cơ.`,
        actionSteps: [
          'Giữ vững công việc hiện tại, không nhảy việc',
          'Không đề xuất dự án mới lúc này',
          'Dùng thời gian để học hỏi và chuẩn bị',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Tài chính gặp khó khăn hoặc đình trệ. Tránh đầu tư lớn, giữ tiền an toàn. Không cho vay hoặc vay mượn. Tiết kiệm và sống giản dị để vượt qua giai đoạn này.`,
        actionSteps: [
          'Tiết kiệm tối đa, cắt giảm chi tiêu',
          'Không đầu tư mới, giữ tiền mặt',
          'Tránh các giao dịch lớn',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Tình cảm gặp khó khăn, giao tiếp bị cản trở. Có thể có hiểu lầm hoặc xa cách. Không nên quyết định lớn như kết hôn hoặc chia tay lúc này. Kiên nhẫn và cho nhau thời gian.`,
        actionSteps: [
          'Cho nhau không gian và thời gian',
          'Không đưa ra quyết định lớn',
          'Tập trung vào bản thân',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Sức khỏe có thể yếu đi, năng lượng thấp. Chú ý nghỉ ngơi và bảo vệ sức khỏe. Tránh các hoạt động tiêu hao năng lượng. Nếu có bệnh, cần điều trị sớm.`,
        actionSteps: [
          'Nghỉ ngơi đầy đủ',
          'Ăn uống bổ dưỡng',
          'Khám bệnh nếu có triệu chứng',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Giai đoạn này là thử thách tâm thức. Giữ vững niềm tin dù hoàn cảnh khó khăn. Đây là cơ hội để nhìn lại bản thân, thanh lọc và chuẩn bị cho giai đoạn mới.`,
        actionSteps: [
          'Thiền định để giữ tâm an',
          'Buông bỏ những gì không còn phục vụ bạn',
          'Tin vào chu kỳ - sau bĩ sẽ thái',
        ],
      },
    },

    crystals: [
      {
        name: 'Black Tourmaline',
        vietnameseName: 'Tourmaline Đen',
        reason: 'Bảo vệ khỏi năng lượng tiêu cực',
        usage: 'Mang theo hoặc đặt ở cửa',
        shopHandle: 'black-tourmaline-raw',
      },
      {
        name: 'Shungite',
        vietnameseName: 'Shungite',
        reason: 'Thanh lọc và bảo vệ',
        usage: 'Đặt gần thiết bị điện tử hoặc mang theo',
        shopHandle: 'shungite-pyramid',
      },
      {
        name: 'Jet',
        vietnameseName: 'Hắc Ngọc',
        reason: 'Bảo vệ trong thời kỳ khó khăn',
        usage: 'Đeo như trang sức',
        shopHandle: 'jet-pendant',
      },
    ],

    affirmations: [
      'Sau cơn mưa, trời lại sáng',
      'Tôi vượt qua mọi khó khăn với sự kiên nhẫn',
      'Mọi bế tắc đều là tạm thời',
      'Tôi tin vào chu kỳ của cuộc sống',
    ],

    lineInterpretations: {
      1: {
        text: 'Bạt mao nhự',
        meaning: 'Nhổ cỏ tranh kéo theo cả rễ',
        advice: 'Giữ vững lập trường. Kiên trì là cát.',
      },
      2: {
        text: 'Bao thừa',
        meaning: 'Bao dung và chịu đựng',
        advice: 'Kiểu người tiểu nhân phải chịu đựng để tiến.',
      },
      3: {
        text: 'Bao tu',
        meaning: 'Chứa đựng sự hổ thẹn',
        advice: 'Nhận ra sai lầm. Cơ hội sửa chữa.',
      },
      4: {
        text: 'Hữu mệnh vô cữu',
        meaning: 'Có mệnh lệnh, không có lỗi',
        advice: 'Hành động theo thiên mệnh. Phước đến.',
      },
      5: {
        text: 'Hưu bĩ',
        meaning: 'Dừng sự bế tắc',
        advice: 'Bế tắc sắp kết thúc. Đại nhân cát.',
      },
      6: {
        text: 'Khuynh bĩ',
        meaning: 'Lật đổ sự bế tắc',
        advice: 'Bĩ cực thái lai. Trước khó sau dễ.',
      },
    },
  },

  13: {
    id: 13,
    name: 'Đồng Nhân',
    chineseName: '同人',
    unicode: '䷌',
    element: 'Hỏa',
    nature: 'Dương',
    image: 'Trời có Lửa',
    lines: [1, 0, 1, 1, 1, 1],

    overview: {
      meaning: `Quẻ Đồng Nhân tượng trưng cho sự đoàn kết, hợp tác và tình bạn. Như lửa bốc lên trời, ánh sáng chiếu xa rộng. Đây là quẻ về community, teamwork và friendship. Tìm kiếm những người cùng chí hướng.`,
      keywords: ['Đoàn kết', 'Tình bạn', 'Hợp tác', 'Cộng đồng', 'Cùng chí hướng'],
      overallAdvice: 'Tìm kiếm những người cùng chí hướng. Hợp tác sẽ mang lại thành công. Tránh phe phái và tự cao.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Thành công đến từ teamwork. Tìm kiếm đồng nghiệp cùng chí hướng. Tham gia các nhóm chuyên môn hoặc hiệp hội. Mở rộng network. Dự án nhóm sẽ thành công hơn làm một mình.`,
        actionSteps: [
          'Xây dựng team với những người cùng vision',
          'Tham gia hiệp hội ngành nghề',
          'Mở rộng professional network',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Đầu tư cùng nhóm có thể có lợi. Tham gia investment club hoặc partnership. Chia sẻ kiến thức và cơ hội với người đáng tin. Tuy nhiên, cần chọn đúng partner.`,
        actionSteps: [
          'Tìm hiểu về investment club',
          'Chia sẻ kiến thức tài chính với bạn bè',
          'Cân nhắc partnership đầu tư với người tin tưởng',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Tình bạn có thể phát triển thành tình yêu. Tìm người đồng điệu về tâm hồn và giá trị. Mối quan hệ cần xây dựng trên nền tảng tình bạn và sự tôn trọng lẫn nhau.`,
        actionSteps: [
          'Tham gia hoạt động cộng đồng để gặp người mới',
          'Xây dựng tình bạn trước khi yêu',
          'Tìm người cùng giá trị và mục tiêu',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Tập thể dục nhóm mang lại nhiều lợi ích. Tham gia lớp fitness, yoga hoặc running club. Sự đồng hành của người khác tạo động lực. Social connection tốt cho sức khỏe tinh thần.`,
        actionSteps: [
          'Tham gia lớp tập nhóm',
          'Tìm workout buddy',
          'Tham gia cộng đồng sức khỏe',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Tu tập trong cộng đồng sangha. Tìm nhóm thiền hoặc yoga cùng chí hướng. Năng lượng tập thể mạnh mẽ hơn cá nhân. Chia sẻ hành trình tâm thức với người khác.`,
        actionSteps: [
          'Tham gia sangha hoặc nhóm tu tập',
          'Chia sẻ kinh nghiệm tâm thức',
          'Phục vụ cộng đồng như một thực hành',
        ],
      },
    },

    crystals: [
      {
        name: 'Blue Lace Agate',
        vietnameseName: 'Mã Não Xanh Lơ',
        reason: 'Giao tiếp và hòa hợp trong nhóm',
        usage: 'Đeo khi họp nhóm hoặc giao tiếp',
        shopHandle: 'blue-lace-agate-tumbled',
      },
      {
        name: 'Chrysocolla',
        vietnameseName: 'Chrysocolla',
        reason: 'Hợp tác và hiểu biết lẫn nhau',
        usage: 'Đeo khi làm việc nhóm',
        shopHandle: 'chrysocolla-pendant',
      },
      {
        name: 'Larimar',
        vietnameseName: 'Larimar',
        reason: 'Hòa bình và kết nối',
        usage: 'Mang theo khi gặp gỡ bạn mới',
        shopHandle: 'larimar-pendant',
      },
    ],

    affirmations: [
      'Tôi thu hút những người cùng chí hướng',
      'Hợp tác và đoàn kết là sức mạnh của tôi',
      'Tôi là một phần của cộng đồng yêu thương',
      'Cùng nhau chúng ta mạnh mẽ hơn',
    ],

    lineInterpretations: {
      1: {
        text: 'Đồng nhân vu môn',
        meaning: 'Đồng tâm ở cửa',
        advice: 'Bắt đầu đoàn kết từ gần. Không có lỗi.',
      },
      2: {
        text: 'Đồng nhân vu tông',
        meaning: 'Đồng tâm trong tông tộc',
        advice: 'Chỉ đoàn kết với người nhà. Hạn chế.',
      },
      3: {
        text: 'Phục nhung vu mãng',
        meaning: 'Phục binh trong rừng rậm',
        advice: 'Nghi ngờ và không tin tưởng. 3 năm không thành.',
      },
      4: {
        text: 'Thừa kỳ dung',
        meaning: 'Leo lên thành',
        advice: 'Không thể tấn công. Quay về là cát.',
      },
      5: {
        text: 'Đồng nhân tiên hiệu thế',
        meaning: 'Đồng tâm trước khóc sau cười',
        advice: 'Khó khăn ban đầu nhưng thành công cuối cùng.',
      },
      6: {
        text: 'Đồng nhân vu giao',
        meaning: 'Đồng tâm ngoài ngoại ô',
        advice: 'Không hối hận nhưng chưa hoàn hảo.',
      },
    },
  },

  14: {
    id: 14,
    name: 'Đại Hữu',
    chineseName: '大有',
    unicode: '䷍',
    element: 'Hỏa',
    nature: 'Dương',
    image: 'Lửa trên Trời',
    lines: [1, 1, 1, 1, 0, 1],

    overview: {
      meaning: `Quẻ Đại Hữu tượng trưng cho sự giàu có và thịnh vượng lớn. Mặt trời chiếu sáng trên cao, vạn vật được nuôi dưỡng. Đây là quẻ về abundance, wealth và blessings. Sở hữu nhiều nhưng cần biết chia sẻ.`,
      keywords: ['Giàu có', 'Thịnh vượng', 'Dồi dào', 'Phước lành', 'Chia sẻ'],
      overallAdvice: 'Đây là thời kỳ dồi dào. Sử dụng tài nguyên một cách khôn ngoan và chia sẻ với người khác.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Sự nghiệp thành công, được công nhận. Có thể có thăng chức, tăng lương hoặc phần thưởng. Đây là lúc để mở rộng ảnh hưởng. Tuy nhiên, cần khiêm tốn và chia sẻ thành công với team.`,
        actionSteps: [
          'Nhận lãnh trách nhiệm lớn hơn',
          'Chia sẻ thành công với team',
          'Mentor cho người đi sau',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Tài chính dồi dào, thu nhập cao. Đầu tư có lợi nhuận tốt. Đây là thời điểm để đa dạng hóa và mở rộng portfolio. Tuy nhiên, nên để dành và làm từ thiện.`,
        actionSteps: [
          'Đa dạng hóa đầu tư',
          'Để dành cho tương lai',
          'Từ thiện hoặc chia sẻ với người cần',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Tình cảm viên mãn, gia đình hạnh phúc. Có nhiều tình yêu để cho và nhận. Mối quan hệ sung túc về cả vật chất lẫn tinh thần. Chia sẻ hạnh phúc với người thân.`,
        actionSteps: [
          'Thể hiện tình yêu một cách rộng rãi',
          'Tổ chức gathering gia đình',
          'Chia sẻ hạnh phúc với bạn bè',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Sức khỏe tốt, năng lượng tràn đầy. Tận hưởng cơ thể khỏe mạnh. Có thể đầu tư vào các hoạt động nâng cao sức khỏe như spa, retreat. Chia sẻ bí quyết sức khỏe với người khác.`,
        actionSteps: [
          'Đầu tư vào wellness',
          'Tham gia retreat hoặc khóa học sức khỏe',
          'Chia sẻ lifestyle lành mạnh',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Tâm thức phong phú, kết nối mạnh với nguồn năng lượng cao hơn. Đây là lúc để chia sẻ ánh sáng với người khác. Giảng dạy, viết sách hoặc mentor về tâm thức.`,
        actionSteps: [
          'Chia sẻ hiểu biết tâm thức',
          'Mentor hoặc hướng dẫn người khác',
          'Đóng góp cho cộng đồng tâm thức',
        ],
      },
    },

    crystals: [
      {
        name: 'Citrine',
        vietnameseName: 'Thạch Anh Vàng',
        reason: 'Thịnh vượng và abundance',
        usage: 'Đặt ở góc tài lộc hoặc trong ví',
        shopHandle: 'citrine-natural',
      },
      {
        name: 'Golden Tiger Eye',
        vietnameseName: 'Mắt Hổ Vàng',
        reason: 'Giàu có và tự tin',
        usage: 'Đeo như vòng tay hoặc nhẫn',
        shopHandle: 'golden-tiger-eye-bracelet',
      },
      {
        name: 'Amber',
        vietnameseName: 'Hổ Phách',
        reason: 'Năng lượng mặt trời và thịnh vượng',
        usage: 'Đeo như trang sức',
        shopHandle: 'amber-pendant',
      },
    ],

    affirmations: [
      'Tôi sống trong sự dồi dào và thịnh vượng',
      'Tôi chia sẻ phước lành của mình với thế giới',
      'Càng cho đi, tôi càng nhận được nhiều hơn',
      'Tôi biết ơn mọi điều tốt đẹp trong cuộc sống',
    ],

    lineInterpretations: {
      1: {
        text: 'Vô giao hại',
        meaning: 'Không giao thiệp với điều hại',
        advice: 'Tránh xa điều xấu. Không có lỗi.',
      },
      2: {
        text: 'Đại xa dĩ tải',
        meaning: 'Xe lớn để chở',
        advice: 'Có khả năng lớn để mang vác. Không lỗi.',
      },
      3: {
        text: 'Công dụng hưởng vu thiên tử',
        meaning: 'Dâng hiến cho thiên tử',
        advice: 'Chia sẻ với người trên. Tiểu nhân không làm được.',
      },
      4: {
        text: 'Phỉ kỳ bàng',
        meaning: 'Không phải sự phô trương',
        advice: 'Không khoe khoang. Không lỗi.',
      },
      5: {
        text: 'Quyết phu giao như',
        meaning: 'Lòng thành và oai nghiêm',
        advice: 'Chân thành được tôn trọng. Cát.',
      },
      6: {
        text: 'Tự thiên hựu chi',
        meaning: 'Trời phù hộ',
        advice: 'Được trời giúp đỡ. Cát, không gì không lợi.',
      },
    },
  },

  15: {
    id: 15,
    name: 'Khiêm',
    chineseName: '謙',
    unicode: '䷎',
    element: 'Thổ',
    nature: 'Âm',
    image: 'Núi trong Đất',
    lines: [0, 0, 1, 0, 0, 0],

    overview: {
      meaning: `Quẻ Khiêm tượng trưng cho sự khiêm tốn. Núi cao mà ẩn trong đất, không phô trương. Đây là quẻ duy nhất trong Kinh Dịch mà tất cả 6 hào đều tốt. Khiêm tốn là đức hạnh cao quý nhất.`,
      keywords: ['Khiêm tốn', 'Đức hạnh', 'Ẩn giấu', 'Không phô trương', 'Tôn trọng'],
      overallAdvice: 'Khiêm tốn là chìa khóa thành công. Dù có tài năng, đừng khoe khoang. Sự khiêm nhường được người khác tôn trọng.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Thành công đến từ sự khiêm tốn. Dù có năng lực, đừng tự cao. Lắng nghe đồng nghiệp, tôn trọng cấp trên và cấp dưới. Làm việc chăm chỉ mà không khoe khoang.`,
        actionSteps: [
          'Lắng nghe nhiều hơn nói',
          'Công nhận đóng góp của người khác',
          'Không nhận hết công lao về mình',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Sống giản dị dù có tiền. Không phô trương sự giàu có. Đầu tư thầm lặng, không khoe lợi nhuận. Chia sẻ với người cần một cách kín đáo.`,
        actionSteps: [
          'Sống dưới mức thu nhập',
          'Không khoe khoang về tài sản',
          'Âm thầm giúp đỡ người cần',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Khiêm tốn trong tình yêu. Không tự cao hoặc đòi hỏi. Tôn trọng đối phương. Lắng nghe và thấu hiểu thay vì chỉ muốn được hiểu.`,
        actionSteps: [
          'Lắng nghe đối phương nhiều hơn',
          'Không tự cao trong mối quan hệ',
          'Phục vụ với lòng khiêm nhường',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Sức khỏe ổn định với lối sống giản dị. Không cần chế độ cực đoan. Ăn uống đơn giản, tập luyện vừa phải. Tâm an thì thân khỏe.`,
        actionSteps: [
          'Sống giản dị và điều độ',
          'Tập luyện vừa phải',
          'Giữ tâm an bình',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Khiêm tốn là đức hạnh tâm thức cao nhất. Buông bỏ ego, không khoe khoang về sự tiến bộ tâm thức. Tu trong đời thường, không cần phô trương.`,
        actionSteps: [
          'Tu tập trong im lặng',
          'Không khoe khoang về tâm thức',
          'Phục vụ mà không cần công nhận',
        ],
      },
    },

    crystals: [
      {
        name: 'Blue Calcite',
        vietnameseName: 'Calcite Xanh',
        reason: 'Khiêm tốn và bình an nội tâm',
        usage: 'Thiền định với đá này',
        shopHandle: 'blue-calcite-raw',
      },
      {
        name: 'Howlite',
        vietnameseName: 'Howlite',
        reason: 'Kiên nhẫn và khiêm nhường',
        usage: 'Đeo khi cần giữ bình tĩnh',
        shopHandle: 'howlite-bracelet',
      },
      {
        name: 'Snow Quartz',
        vietnameseName: 'Thạch Anh Tuyết',
        reason: 'Sự thuần khiết và khiêm tốn',
        usage: 'Đặt trong phòng thiền',
        shopHandle: 'snow-quartz-sphere',
      },
    ],

    affirmations: [
      'Sự khiêm tốn là sức mạnh thật sự của tôi',
      'Tôi học hỏi từ tất cả mọi người',
      'Tôi phục vụ mà không cần công nhận',
      'Càng khiêm tốn, tôi càng được tôn trọng',
    ],

    lineInterpretations: {
      1: {
        text: 'Khiêm khiêm quân tử',
        meaning: 'Khiêm tốn lại khiêm tốn',
        advice: 'Cực kỳ khiêm nhường. Có thể vượt sông lớn.',
      },
      2: {
        text: 'Minh khiêm',
        meaning: 'Khiêm tốn lan tỏa',
        advice: 'Tiếng tốt lan xa. Trinh cát.',
      },
      3: {
        text: 'Lao khiêm quân tử',
        meaning: 'Người quân tử siêng năng và khiêm tốn',
        advice: 'Làm việc chăm chỉ và khiêm nhường. Thành công.',
      },
      4: {
        text: 'Vô bất lợi',
        meaning: 'Không gì không có lợi',
        advice: 'Khiêm tốn đúng lúc đúng chỗ. Lợi.',
      },
      5: {
        text: 'Bất phú',
        meaning: 'Không giàu',
        advice: 'Dùng khiêm tốn để cai trị. Lợi về mọi mặt.',
      },
      6: {
        text: 'Minh khiêm',
        meaning: 'Khiêm tốn lan tỏa',
        advice: 'Khiêm tốn được công nhận. Dùng để hành quân.',
      },
    },
  },

  16: {
    id: 16,
    name: 'Dự',
    chineseName: '豫',
    unicode: '䷏',
    element: 'Mộc',
    nature: 'Dương',
    image: 'Sấm từ Đất',
    lines: [0, 0, 0, 1, 0, 0],

    overview: {
      meaning: `Quẻ Dự tượng trưng cho niềm vui, sự hào hứng và chuẩn bị. Sấm vang từ đất, đánh thức vạn vật. Đây là quẻ về enthusiasm, preparation và celebration. Thời điểm tốt để bắt đầu điều mới.`,
      keywords: ['Hào hứng', 'Niềm vui', 'Chuẩn bị', 'Khởi đầu', 'Celebration'],
      overallAdvice: 'Tận hưởng niềm vui và hào hứng. Sử dụng năng lượng này để khởi đầu điều mới. Chuẩn bị kỹ cho hành động.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Thời điểm hào hứng trong sự nghiệp. Có thể có dự án mới thú vị hoặc cơ hội mới. Sử dụng năng lượng tích cực để inspire team. Chuẩn bị kỹ trước khi hành động.`,
        actionSteps: [
          'Bắt đầu dự án mới với đam mê',
          'Truyền cảm hứng cho team',
          'Chuẩn bị kế hoạch trước khi hành động',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Cơ hội tài chính mới có thể xuất hiện. Chuẩn bị sẵn sàng để nắm bắt. Tuy nhiên, đừng để sự hào hứng làm mất lý trí. Nghiên cứu kỹ trước khi đầu tư.`,
        actionSteps: [
          'Chuẩn bị vốn cho cơ hội mới',
          'Nghiên cứu trước khi đầu tư',
          'Đừng FOMO vì quá hào hứng',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Tình cảm vui vẻ, tràn đầy năng lượng. Thời điểm tốt để tổ chức tiệc, đi du lịch cùng nhau. Nếu độc thân, có thể gặp người mới trong các buổi party hoặc event.`,
        actionSteps: [
          'Tổ chức hoạt động vui chơi cùng nhau',
          'Tham gia các event xã hội',
          'Thể hiện niềm vui và năng lượng tích cực',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Năng lượng cao, tinh thần phấn chấn. Tận dụng thời điểm này để tập luyện. Tham gia các hoạt động vui nhộn như nhảy, aerobic. Nhưng đừng quá sức vì hào hứng.`,
        actionSteps: [
          'Tham gia các lớp fitness vui nhộn',
          'Tận hưởng hoạt động outdoor',
          'Cân bằng giữa vui chơi và nghỉ ngơi',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Tâm thức cũng cần niềm vui. Đừng quá nghiêm túc trong tu tập. Tham gia các buổi lễ, ceremonies với lòng hoan hỷ. Ăn mừng hành trình tâm thức.`,
        actionSteps: [
          'Tham gia ceremonies hoặc lễ hội tâm thức',
          'Tìm niềm vui trong thực hành',
          'Chia sẻ niềm vui tâm thức',
        ],
      },
    },

    crystals: [
      {
        name: 'Orange Calcite',
        vietnameseName: 'Calcite Cam',
        reason: 'Niềm vui, sáng tạo và năng lượng',
        usage: 'Đặt ở nơi làm việc sáng tạo',
        shopHandle: 'orange-calcite-raw',
      },
      {
        name: 'Carnelian',
        vietnameseName: 'Mã Não Đỏ',
        reason: 'Hào hứng, đam mê và động lực',
        usage: 'Đeo khi cần năng lượng',
        shopHandle: 'carnelian-tumbled',
      },
      {
        name: 'Sunstone',
        vietnameseName: 'Đá Mặt Trời',
        reason: 'Niềm vui và năng lượng tích cực',
        usage: 'Đeo khi cần nâng cao tinh thần',
        shopHandle: 'sunstone-pendant',
      },
    ],

    affirmations: [
      'Tôi tận hưởng niềm vui trong cuộc sống',
      'Năng lượng tích cực tràn đầy trong tôi',
      'Tôi chuẩn bị sẵn sàng cho mọi cơ hội',
      'Niềm vui là một phần quan trọng của hành trình',
    ],

    lineInterpretations: {
      1: {
        text: 'Minh dự',
        meaning: 'Khoe khoang về sự vui vẻ',
        advice: 'Đừng khoe khoang. Có thể gặp rắc rối.',
      },
      2: {
        text: 'Giới vu thạch',
        meaning: 'Vững chắc như đá',
        advice: 'Biết dừng lại đúng lúc. Trinh cát.',
      },
      3: {
        text: 'Hu dự hối',
        meaning: 'Nhìn lên với sự háo hức',
        advice: 'Chậm trễ sẽ hối hận. Hành động ngay.',
      },
      4: {
        text: 'Do dự đại hữu đắc',
        meaning: 'Nguồn của niềm vui, thu hoạch lớn',
        advice: 'Thành công lớn. Bạn bè tụ tập.',
      },
      5: {
        text: 'Trinh tật',
        meaning: 'Kiên định trong bệnh',
        advice: 'Có khó khăn nhưng không chết. Kiên trì.',
      },
      6: {
        text: 'Minh dự',
        meaning: 'Niềm vui trong bóng tối',
        advice: 'Vui chơi quá đà. Nhưng biết thay đổi thì không lỗi.',
      },
    },
  },

  17: {
    id: 17,
    name: 'Tùy',
    chineseName: '隨',
    unicode: '䷐',
    element: 'Kim',
    nature: 'Dương',
    image: 'Hồ có Sấm',
    lines: [1, 0, 0, 1, 1, 0],

    overview: {
      meaning: `Quẻ Tùy tượng trưng cho sự theo đuổi, thích ứng và đi theo. Sấm dưới hồ, năng lượng tàng ẩn. Đây là quẻ về following, adapting và going with the flow. Biết khi nào dẫn dắt và khi nào đi theo.`,
      keywords: ['Theo đuổi', 'Thích ứng', 'Linh hoạt', 'Đi theo dòng', 'Thuận theo'],
      overallAdvice: 'Đây là lúc để theo dòng chảy, thích ứng với hoàn cảnh. Không phải lúc để dẫn dắt mà là lúc để học hỏi và đi theo.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Đây là thời điểm để đi theo và học hỏi. Theo dõi mentor, làm theo hướng dẫn của cấp trên. Thích ứng với thay đổi trong công việc. Không phải lúc để nổi bật mà là lúc để hòa nhập.`,
        actionSteps: [
          'Học hỏi từ mentor và cấp trên',
          'Thích ứng với thay đổi trong công ty',
          'Đi theo trend của ngành',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Theo dõi thị trường và đi theo trend. Không phải lúc để đầu tư ngược dòng. Theo dõi các chuyên gia và học hỏi chiến lược của họ. Linh hoạt thay đổi khi thị trường thay đổi.`,
        actionSteps: [
          'Theo dõi market trend',
          'Học từ các investor thành công',
          'Linh hoạt điều chỉnh strategy',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Trong tình cảm, học cách đi theo và hỗ trợ đối phương. Không phải lúc nào cũng cần dẫn dắt. Thích ứng với nhu cầu của người yêu. Linh hoạt trong mối quan hệ.`,
        actionSteps: [
          'Hỗ trợ kế hoạch của đối phương',
          'Thích ứng với thay đổi trong mối quan hệ',
          'Đôi khi để người khác quyết định',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Lắng nghe cơ thể và đi theo nhu cầu của nó. Không ép buộc theo routine cứng nhắc. Nếu cơ thể cần nghỉ, hãy nghỉ. Thích ứng với nhịp sinh học tự nhiên.`,
        actionSteps: [
          'Lắng nghe tín hiệu từ cơ thể',
          'Thích ứng với nhịp sinh học',
          'Linh hoạt trong routine tập luyện',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Đi theo hướng dẫn của thầy. Thuận theo con đường được chỉ dẫn. Tin vào process và đừng vội. Đôi khi surrender và để vũ trụ dẫn dắt.`,
        actionSteps: [
          'Theo hướng dẫn của thầy',
          'Surrender và tin tưởng',
          'Đi theo inner guidance',
        ],
      },
    },

    crystals: [
      {
        name: 'Labradorite',
        vietnameseName: 'Labradorite',
        reason: 'Thích ứng và transformation',
        usage: 'Đeo khi cần linh hoạt',
        shopHandle: 'labradorite-pendant',
      },
      {
        name: 'Moonstone',
        vietnameseName: 'Đá Mặt Trăng',
        reason: 'Đi theo dòng chảy và trực giác',
        usage: 'Đeo vào ngày trăng mới',
        shopHandle: 'moonstone-pendant',
      },
      {
        name: 'Aquamarine',
        vietnameseName: 'Ngọc Biển',
        reason: 'Linh hoạt như nước',
        usage: 'Đeo khi cần thích ứng',
        shopHandle: 'aquamarine-pendant',
      },
    ],

    affirmations: [
      'Tôi linh hoạt và thích ứng với mọi hoàn cảnh',
      'Tôi biết khi nào cần dẫn và khi nào cần theo',
      'Tôi tin vào dòng chảy của cuộc sống',
      'Tôi học hỏi từ tất cả mọi người',
    ],

    lineInterpretations: {
      1: {
        text: 'Quan hữu du',
        meaning: 'Công việc thay đổi',
        advice: 'Thay đổi là tốt. Ra ngoài có công.',
      },
      2: {
        text: 'Hệ tiểu tử',
        meaning: 'Buộc vào đứa trẻ nhỏ',
        advice: 'Đừng bỏ người lớn để theo trẻ con.',
      },
      3: {
        text: 'Hệ trượng phu',
        meaning: 'Buộc vào người đàn ông',
        advice: 'Theo người đáng theo. Bỏ nhỏ lấy lớn.',
      },
      4: {
        text: 'Tùy hữu hoạch',
        meaning: 'Theo và thu hoạch',
        advice: 'Theo đuổi có kết quả. Nhưng cần chính đạo.',
      },
      5: {
        text: 'Phu vu gia',
        meaning: 'Thành tín với điều tốt',
        advice: 'Tin vào điều thiện. Cát.',
      },
      6: {
        text: 'Câu hệ chi',
        meaning: 'Bị buộc chặt',
        advice: 'Bị ràng buộc. Vua tế ở núi Tây.',
      },
    },
  },

  18: {
    id: 18,
    name: 'Cổ',
    chineseName: '蠱',
    unicode: '䷑',
    element: 'Mộc',
    nature: 'Âm',
    image: 'Núi trên Gió',
    lines: [0, 1, 1, 0, 0, 1],

    overview: {
      meaning: `Quẻ Cổ tượng trưng cho sự thối nát cần được sửa chữa. Như sâu bọ trong bát, những vấn đề cũ cần được giải quyết. Đây là quẻ về repair, correction và renovation. Dọn dẹp những gì đã hư hỏng.`,
      keywords: ['Sửa chữa', 'Dọn dẹp', 'Cải cách', 'Đổi mới', 'Khắc phục'],
      overallAdvice: 'Đây là lúc để sửa chữa những sai lầm, dọn dẹp những gì đã cũ nát. Đối mặt với vấn đề thay vì trốn tránh.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Công việc có vấn đề cần được sửa chữa. Có thể có legacy issues hoặc quy trình cũ không còn hiệu quả. Đây là lúc để cải cách, đổi mới. Dọn dẹp những gì không còn hoạt động.`,
        actionSteps: [
          'Xác định và sửa chữa các vấn đề tồn đọng',
          'Cải cách quy trình không còn hiệu quả',
          'Dọn dẹp technical debt',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Tài chính có thể có vấn đề cần giải quyết. Review lại portfolio, cắt bỏ những đầu tư không hiệu quả. Trả nợ cũ. Dọn dẹp tài chính trước khi đầu tư mới.`,
        actionSteps: [
          'Review và dọn dẹp portfolio',
          'Trả hết nợ xấu',
          'Sửa chữa credit score nếu cần',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Mối quan hệ có vấn đề cần được giải quyết. Không thể tiếp tục bỏ qua. Đối thoại thẳng thắn về những gì không ổn. Sửa chữa hoặc kết thúc, nhưng đừng để thối rữa.`,
        actionSteps: [
          'Đối mặt với vấn đề trong mối quan hệ',
          'Nói chuyện thẳng thắn với đối phương',
          'Sửa chữa hoặc đưa ra quyết định',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Có thể có vấn đề sức khỏe cần được giải quyết. Đừng bỏ qua triệu chứng. Đi khám và điều trị sớm. Dọn dẹp những thói quen xấu ảnh hưởng sức khỏe.`,
        actionSteps: [
          'Đi khám những vấn đề đã bỏ qua',
          'Từ bỏ thói quen xấu',
          'Detox cơ thể và tinh thần',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Có những vấn đề tâm lý hoặc karma cũ cần được giải quyết. Đối mặt với bóng tối của bản thân. Shadow work là cần thiết lúc này. Chữa lành vết thương cũ.`,
        actionSteps: [
          'Thực hành shadow work',
          'Chữa lành trauma cũ',
          'Tha thứ cho bản thân và người khác',
        ],
      },
    },

    crystals: [
      {
        name: 'Smoky Quartz',
        vietnameseName: 'Thạch Anh Khói',
        reason: 'Thanh lọc và giải phóng năng lượng cũ',
        usage: 'Thiền định để release',
        shopHandle: 'smoky-quartz-point',
      },
      {
        name: 'Apache Tears',
        vietnameseName: 'Nước Mắt Apache',
        reason: 'Chữa lành và giải phóng đau buồn',
        usage: 'Mang theo khi cần chữa lành',
        shopHandle: 'apache-tears-tumbled',
      },
      {
        name: 'Black Obsidian',
        vietnameseName: 'Obsidian Đen',
        reason: 'Shadow work và sự thật',
        usage: 'Thiền định để nhìn rõ vấn đề',
        shopHandle: 'black-obsidian-sphere',
      },
    ],

    affirmations: [
      'Tôi đối mặt và giải quyết mọi vấn đề tồn đọng',
      'Tôi dọn dẹp để tạo không gian cho điều mới',
      'Tôi chữa lành những vết thương cũ',
      'Từ đổ nát, tôi xây dựng nền móng mới',
    ],

    lineInterpretations: {
      1: {
        text: 'Cán phụ chi cổ',
        meaning: 'Sửa chữa lỗi của cha',
        advice: 'Tiếp nối công việc cha. Không lỗi, dù nguy.',
      },
      2: {
        text: 'Cán mẫu chi cổ',
        meaning: 'Sửa chữa lỗi của mẹ',
        advice: 'Cần mềm mỏng. Không nên quá cứng nhắc.',
      },
      3: {
        text: 'Cán phụ chi cổ',
        meaning: 'Sửa chữa lỗi của cha',
        advice: 'Có chút hối hận nhưng không lỗi lớn.',
      },
      4: {
        text: 'Du phụ chi cổ',
        meaning: 'Dung thứ lỗi của cha',
        advice: 'Nếu tiếp tục dung thứ sẽ thấy xấu hổ.',
      },
      5: {
        text: 'Cán phụ chi cổ',
        meaning: 'Sửa chữa lỗi của cha',
        advice: 'Được khen ngợi vì sửa chữa.',
      },
      6: {
        text: 'Bất sự vương hầu',
        meaning: 'Không phục vụ vương hầu',
        advice: 'Rời bỏ thế sự. Theo đuổi điều cao thượng.',
      },
    },
  },

  19: {
    id: 19,
    name: 'Lâm',
    chineseName: '臨',
    unicode: '䷒',
    element: 'Thổ',
    nature: 'Dương',
    image: 'Đất trên Hồ',
    lines: [1, 1, 0, 0, 0, 0],

    overview: {
      meaning: `Quẻ Lâm tượng trưng cho sự đến gần, giám sát và ảnh hưởng. Như đất bao quanh hồ, năng lượng dương đang tăng lên. Đây là quẻ về approaching, supervision và influence. Thời cơ thuận lợi đang đến gần.`,
      keywords: ['Đến gần', 'Giám sát', 'Ảnh hưởng', 'Tiếp cận', 'Thuận lợi'],
      overallAdvice: 'Thời cơ tốt đang đến. Hãy tiếp cận với thái độ đúng đắn. Ảnh hưởng tích cực đến người khác.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Cơ hội sự nghiệp đang đến gần. Có thể được giao nhiệm vụ giám sát hoặc lãnh đạo. Ảnh hưởng của bạn đang tăng lên. Sử dụng vị thế này một cách có trách nhiệm.`,
        actionSteps: [
          'Chuẩn bị cho cơ hội lãnh đạo',
          'Giám sát với lòng nhân từ',
          'Sử dụng ảnh hưởng để giúp đỡ team',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Cơ hội tài chính đang đến. Giám sát chặt chẽ các khoản đầu tư. Thời điểm tốt để tiếp cận các cơ hội mới. Tuy nhiên, cần nhớ rằng sau thịnh có suy.`,
        actionSteps: [
          'Nắm bắt cơ hội đang đến',
          'Giám sát portfolio chặt chẽ',
          'Chuẩn bị cho cả thịnh và suy',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Tình yêu đang đến gần. Nếu độc thân, có thể gặp được ai đó. Nếu có đôi, mối quan hệ đang tiến triển tốt. Tiếp cận với tình yêu chân thành.`,
        actionSteps: [
          'Mở lòng đón nhận tình yêu',
          'Tiếp cận người mình thích',
          'Đưa mối quan hệ lên level mới',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Sức khỏe đang cải thiện. Năng lượng tăng dần. Tuy nhiên, cần duy trì và không chủ quan. Giám sát các chỉ số sức khỏe thường xuyên.`,
        actionSteps: [
          'Duy trì momentum tốt',
          'Theo dõi các chỉ số sức khỏe',
          'Tiếp tục chế độ lành mạnh',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Sự giác ngộ đang đến gần. Tâm thức phát triển. Có thể được giao vai trò hướng dẫn người khác. Sử dụng ảnh hưởng tâm thức một cách có trách nhiệm.`,
        actionSteps: [
          'Mở lòng đón nhận sự giác ngộ',
          'Hướng dẫn người khác với lòng từ bi',
          'Tiếp tục tu tập đều đặn',
        ],
      },
    },

    crystals: [
      {
        name: 'Green Aventurine',
        vietnameseName: 'Aventurine Xanh',
        reason: 'May mắn và cơ hội đang đến',
        usage: 'Đeo khi đi gặp gỡ hoặc phỏng vấn',
        shopHandle: 'green-aventurine-bracelet',
      },
      {
        name: 'Jade',
        vietnameseName: 'Ngọc Bích',
        reason: 'Thu hút may mắn và thịnh vượng',
        usage: 'Đeo như bùa may mắn',
        shopHandle: 'jade-pendant',
      },
      {
        name: 'Peridot',
        vietnameseName: 'Olivine',
        reason: 'Đón nhận cơ hội mới',
        usage: 'Đeo khi bắt đầu điều mới',
        shopHandle: 'peridot-ring',
      },
    ],

    affirmations: [
      'Cơ hội tốt đang đến với tôi',
      'Tôi sẵn sàng đón nhận điều tốt đẹp',
      'Tôi ảnh hưởng tích cực đến người xung quanh',
      'Thời cơ thuận lợi là của tôi',
    ],

    lineInterpretations: {
      1: {
        text: 'Hàm lâm',
        meaning: 'Cảm ứng mà đến',
        advice: 'Đến đúng cách. Trinh cát.',
      },
      2: {
        text: 'Hàm lâm cát',
        meaning: 'Cảm ứng mà đến, cát',
        advice: 'Đến một cách hòa hợp. Tốt lành.',
      },
      3: {
        text: 'Cam lâm',
        meaning: 'Đến một cách ngọt ngào',
        advice: 'Quá dễ dãi không tốt. Cần điều chỉnh.',
      },
      4: {
        text: 'Chí lâm',
        meaning: 'Đạt được sự tiếp cận',
        advice: 'Thành công trong tiếp cận. Không lỗi.',
      },
      5: {
        text: 'Tri lâm',
        meaning: 'Đến với trí tuệ',
        advice: 'Tiếp cận với sự khôn ngoan. Đại quân cát.',
      },
      6: {
        text: 'Đôn lâm',
        meaning: 'Đến một cách thành thật',
        advice: 'Đến với lòng thành. Cát, không lỗi.',
      },
    },
  },

  20: {
    id: 20,
    name: 'Quan',
    chineseName: '觀',
    unicode: '䷓',
    element: 'Mộc',
    nature: 'Âm',
    image: 'Gió trên Đất',
    lines: [0, 0, 0, 0, 1, 1],

    overview: {
      meaning: `Quẻ Quan tượng trưng cho sự quan sát, chiêm ngưỡng và làm gương. Gió thổi trên đất, ảnh hưởng đến vạn vật. Đây là quẻ về observation, contemplation và being a role model. Quan sát kỹ trước khi hành động.`,
      keywords: ['Quan sát', 'Chiêm ngưỡng', 'Làm gương', 'Suy ngẫm', 'Nhìn nhận'],
      overallAdvice: 'Quan sát kỹ trước khi hành động. Suy ngẫm sâu sắc. Hành động của bạn đang được người khác nhìn vào làm gương.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Đây là thời điểm để quan sát và học hỏi. Theo dõi thị trường, đối thủ và xu hướng. Người khác cũng đang nhìn vào bạn. Hành xử như một role model.`,
        actionSteps: [
          'Quan sát và phân tích thị trường',
          'Học hỏi từ best practices',
          'Làm gương cho team',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Quan sát thị trường trước khi đầu tư. Phân tích kỹ lưỡng. Không vội vàng hành động. Học từ những nhà đầu tư thành công.`,
        actionSteps: [
          'Quan sát và phân tích trước khi đầu tư',
          'Học từ các case study thành công',
          'Không FOMO, kiên nhẫn chờ thời cơ',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Quan sát và hiểu đối phương trước khi cam kết. Nhìn nhận mối quan hệ một cách khách quan. Hành động của bạn ảnh hưởng đến người thân.`,
        actionSteps: [
          'Quan sát và lắng nghe đối phương',
          'Nhìn nhận mối quan hệ khách quan',
          'Làm gương tốt cho con cháu',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Quan sát cơ thể và tín hiệu của nó. Theo dõi các triệu chứng. Suy ngẫm về lối sống và thói quen. Điều chỉnh dựa trên quan sát.`,
        actionSteps: [
          'Theo dõi các tín hiệu từ cơ thể',
          'Ghi chép nhật ký sức khỏe',
          'Điều chỉnh dựa trên quan sát',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Thời điểm để thiền quán và suy ngẫm. Quan sát tâm mình. Chiêm ngưỡng sự vĩ đại của vũ trụ. Tu tập bằng cách làm gương.`,
        actionSteps: [
          'Thiền quán sâu sắc',
          'Quan sát tâm và cảm xúc',
          'Sống là tu, làm gương cho người khác',
        ],
      },
    },

    crystals: [
      {
        name: 'Amethyst',
        vietnameseName: 'Thạch Anh Tím',
        reason: 'Trực giác và suy ngẫm',
        usage: 'Thiền định với đá này',
        shopHandle: 'amethyst-cluster',
      },
      {
        name: 'Lapis Lazuli',
        vietnameseName: 'Thanh Kim Thạch',
        reason: 'Trí tuệ và nhìn thấu',
        usage: 'Đeo khi cần quan sát sâu sắc',
        shopHandle: 'lapis-lazuli-pendant',
      },
      {
        name: 'Iolite',
        vietnameseName: 'Iolite',
        reason: 'Tầm nhìn và quan sát',
        usage: 'Đeo khi cần perspective rõ ràng',
        shopHandle: 'iolite-pendant',
      },
    ],

    affirmations: [
      'Tôi quan sát kỹ trước khi hành động',
      'Tôi sống làm gương cho người khác',
      'Sự suy ngẫm sâu sắc dẫn đến hành động khôn ngoan',
      'Tôi nhìn thấy bức tranh lớn của cuộc sống',
    ],

    lineInterpretations: {
      1: {
        text: 'Đồng quan',
        meaning: 'Quan sát như trẻ con',
        advice: 'Quan sát non nớt. Cần học thêm.',
      },
      2: {
        text: 'Khuy quan',
        meaning: 'Nhìn qua khe hở',
        advice: 'Chỉ thấy một phần. Cần nhìn rộng hơn.',
      },
      3: {
        text: 'Quan ngã sanh',
        meaning: 'Quan sát đời sống của mình',
        advice: 'Tự quan sát bản thân. Tiến hay lùi tùy mình.',
      },
      4: {
        text: 'Quan quốc chi quang',
        meaning: 'Quan sát ánh sáng của quốc gia',
        advice: 'Đáng được trọng dụng. Có thể phục vụ vua.',
      },
      5: {
        text: 'Quan ngã sanh',
        meaning: 'Quan sát đời sống của mình',
        advice: 'Quân tử tự quan sát. Không lỗi.',
      },
      6: {
        text: 'Quan kỳ sanh',
        meaning: 'Quan sát cuộc sống người khác',
        advice: 'Quan sát với tư cách người ngoài cuộc. Không lỗi.',
      },
    },
  },

  21: {
    id: 21,
    name: 'Phệ Hạp',
    chineseName: '噬嗑',
    unicode: '䷔',
    element: 'Hỏa',
    nature: 'Dương',
    image: 'Lửa có Sấm',
    lines: [1, 0, 0, 1, 0, 1],

    overview: {
      meaning: `Quẻ Phệ Hạp tượng trưng cho việc cắn đứt trở ngại, như nhai và nuốt thức ăn. Sấm và Lửa cùng hành động mạnh mẽ. Đây là quẻ về justice, law và breaking through obstacles. Cần hành động quyết đoán để vượt qua trở ngại.`,
      keywords: ['Công lý', 'Quyết đoán', 'Vượt qua', 'Phán xét', 'Hành động'],
      overallAdvice: 'Hành động quyết đoán để vượt qua trở ngại. Công lý cần được thực thi. Không né tránh vấn đề.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Cần hành động quyết đoán để giải quyết vấn đề công việc. Nếu có xung đột, cần phán xét công bằng. Đừng né tránh những quyết định khó khăn. Công lý phải được thực thi.`,
        actionSteps: [
          'Đối mặt với vấn đề trực diện',
          'Đưa ra quyết định công bằng',
          'Không để vấn đề kéo dài',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Cần quyết đoán trong tài chính. Nếu có nợ xấu, cần cut loss. Nếu có tranh chấp tài chính, giải quyết dứt điểm. Không để vấn đề tài chính kéo dài.`,
        actionSteps: [
          'Cut loss với đầu tư xấu',
          'Giải quyết tranh chấp tài chính',
          'Đưa ra quyết định dứt khoát',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Nếu có vấn đề trong mối quan hệ, cần giải quyết dứt điểm. Không né tránh xung đột. Nói thẳng nói thật. Đôi khi cần quyết định khó khăn để tiến lên.`,
        actionSteps: [
          'Đối mặt với vấn đề trong quan hệ',
          'Nói chuyện thẳng thắn',
          'Đưa ra quyết định cần thiết',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Nếu có vấn đề sức khỏe, cần điều trị quyết liệt. Không chần chừ hoặc trì hoãn. Có thể cần phẫu thuật hoặc can thiệp mạnh. Hành động ngay.`,
        actionSteps: [
          'Đi khám và điều trị ngay',
          'Không trì hoãn điều trị',
          'Tuân thủ phác đồ điều trị',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Cần cắt đứt những ràng buộc tiêu cực. Đối mặt với bóng tối bên trong. Hành động quyết đoán trong tu tập. Không né tránh những bài học khó khăn.`,
        actionSteps: [
          'Cắt đứt các mối quan hệ độc hại',
          'Đối mặt với shadow self',
          'Tu tập quyết liệt',
        ],
      },
    },

    crystals: [
      {
        name: 'Red Jasper',
        vietnameseName: 'Jasper Đỏ',
        reason: 'Sức mạnh và quyết đoán',
        usage: 'Đeo khi cần đưa ra quyết định khó',
        shopHandle: 'red-jasper-tumbled',
      },
      {
        name: 'Bloodstone',
        vietnameseName: 'Huyết Ngọc',
        reason: 'Can đảm và công lý',
        usage: 'Mang theo khi đối mặt thử thách',
        shopHandle: 'bloodstone-tumbled',
      },
      {
        name: 'Garnet',
        vietnameseName: 'Ngọc Hồng Lựu',
        reason: 'Hành động và đam mê',
        usage: 'Đeo khi cần năng lượng hành động',
        shopHandle: 'garnet-bracelet',
      },
    ],

    affirmations: [
      'Tôi đối mặt và vượt qua mọi trở ngại',
      'Tôi hành động quyết đoán khi cần',
      'Công lý và sự thật được thực thi qua tôi',
      'Tôi không né tránh những quyết định khó khăn',
    ],

    lineInterpretations: {
      1: {
        text: 'Lũ hiệu diệt chỉ',
        meaning: 'Bị cùm chân, mất ngón chân',
        advice: 'Trừng phạt nhẹ ngăn chặn lỗi lớn. Không lỗi.',
      },
      2: {
        text: 'Phệ phu diệt tị',
        meaning: 'Cắn da thịt, mất mũi',
        advice: 'Hình phạt vừa phải. Không lỗi.',
      },
      3: {
        text: 'Phệ tích nhục',
        meaning: 'Cắn thịt khô',
        advice: 'Gặp chút độc. Có lỗi nhỏ, không lớn.',
      },
      4: {
        text: 'Phệ kiền tư',
        meaning: 'Cắn thịt khô có xương',
        advice: 'Khó khăn. Cần kiên trì. Lợi.',
      },
      5: {
        text: 'Phệ kiền nhục',
        meaning: 'Cắn thịt khô',
        advice: 'Được vàng. Cảnh giác thì không lỗi.',
      },
      6: {
        text: 'Hà hiệu diệt nhĩ',
        meaning: 'Mang gông, mất tai',
        advice: 'Không nghe lời. Chịu hình phạt nặng.',
      },
    },
  },

  22: {
    id: 22,
    name: 'Bí',
    chineseName: '賁',
    unicode: '䷕',
    element: 'Hỏa',
    nature: 'Âm',
    image: 'Núi có Lửa',
    lines: [1, 0, 1, 0, 0, 1],

    overview: {
      meaning: `Quẻ Bí tượng trưng cho vẻ đẹp, trang trí và grace. Như lửa chiếu sáng núi, làm đẹp cho cảnh quan. Đây là quẻ về beauty, elegance và refinement. Tuy nhiên, vẻ đẹp bề ngoài cần đi với nội dung bên trong.`,
      keywords: ['Vẻ đẹp', 'Trang trí', 'Thanh lịch', 'Grace', 'Tinh tế'],
      overallAdvice: 'Chú trọng vẻ đẹp và hình thức, nhưng đừng quên nội dung. Vẻ đẹp bên ngoài cần đi với đức hạnh bên trong.',
    },

    interpretations: {
      career: {
        title: 'Sự Nghiệp & Công Việc',
        reading: `Chú ý đến hình ảnh và presentation. Làm đẹp profile, portfolio. Tuy nhiên, nội dung vẫn là quan trọng nhất. Marketing tốt nhưng sản phẩm phải chất lượng.`,
        actionSteps: [
          'Cải thiện personal branding',
          'Làm đẹp portfolio và CV',
          'Cân bằng giữa hình thức và nội dung',
        ],
      },
      finance: {
        title: 'Tài Chính & Đầu Tư',
        reading: `Có thể chi tiêu cho vẻ đẹp và trang trí. Đầu tư vào hình ảnh có thể có lợi. Tuy nhiên, không nên chỉ nhìn vào vẻ bề ngoài khi đầu tư. Phân tích kỹ fundamentals.`,
        actionSteps: [
          'Đầu tư vào hình ảnh cá nhân',
          'Không bị lừa bởi vẻ bề ngoài',
          'Phân tích kỹ trước khi đầu tư',
        ],
      },
      love: {
        title: 'Tình Cảm & Mối Quan Hệ',
        reading: `Chú ý đến vẻ bề ngoài và romantic gestures. Tuy nhiên, tình yêu thật sự cần hơn vẻ đẹp. Đẹp bên ngoài cần đi với đẹp tâm hồn.`,
        actionSteps: [
          'Chăm chút ngoại hình',
          'Tạo romantic atmosphere',
          'Nhưng đừng quên chân thành',
        ],
      },
      health: {
        title: 'Sức Khỏe & Năng Lượng',
        reading: `Chăm sóc vẻ đẹp bên ngoài. Skincare, grooming, fitness để đẹp. Tuy nhiên, sức khỏe bên trong mới quan trọng nhất. Balance là key.`,
        actionSteps: [
          'Chăm sóc da và ngoại hình',
          'Tập thể dục để body đẹp',
          'Không quên sức khỏe bên trong',
        ],
      },
      spiritual: {
        title: 'Tâm Thức & Phát Triển Bản Thân',
        reading: `Vẻ đẹp tâm thức đến từ bên trong. Đừng chạy theo hình thức tu tập. Trang trí bàn thờ đẹp là tốt, nhưng lòng thành mới quan trọng.`,
        actionSteps: [
          'Tu tập với lòng thành',
          'Tạo không gian thiền đẹp',
          'Nhưng đừng chạy theo hình thức',
        ],
      },
    },

    crystals: [
      {
        name: 'Rose Quartz',
        vietnameseName: 'Thạch Anh Hồng',
        reason: 'Vẻ đẹp và tình yêu',
        usage: 'Đặt trong phòng để tăng vẻ đẹp',
        shopHandle: 'rose-quartz-heart',
      },
      {
        name: 'Opal',
        vietnameseName: 'Opal',
        reason: 'Vẻ đẹp lung linh và sáng tạo',
        usage: 'Đeo như trang sức đẹp',
        shopHandle: 'opal-pendant',
      },
      {
        name: 'Pink Tourmaline',
        vietnameseName: 'Tourmaline Hồng',
        reason: 'Vẻ đẹp và elegance',
        usage: 'Đeo để tăng sức hút',
        shopHandle: 'pink-tourmaline-pendant',
      },
    ],

    affirmations: [
      'Tôi tỏa sáng từ bên trong và bên ngoài',
      'Vẻ đẹp của tôi đến từ tâm hồn',
      'Tôi trang trí cuộc sống với sự thanh lịch',
      'Tôi là tác phẩm nghệ thuật sống động',
    ],

    lineInterpretations: {
      1: {
        text: 'Bí kỳ chỉ',
        meaning: 'Trang trí ngón chân',
        advice: 'Bỏ xe, đi bộ. Khiêm nhường là đẹp.',
      },
      2: {
        text: 'Bí kỳ tu',
        meaning: 'Trang trí bộ râu',
        advice: 'Làm đẹp cùng người trên. Hỗ trợ.',
      },
      3: {
        text: 'Bí như nhu như',
        meaning: 'Trang trí và sáng bóng',
        advice: 'Trinh vĩnh thì cát. Giữ lâu dài.',
      },
      4: {
        text: 'Bí như bạch mã',
        meaning: 'Trang trí như ngựa trắng',
        advice: 'Không phải kẻ cướp, là người mai mối.',
      },
      5: {
        text: 'Bí vu khâu viên',
        meaning: 'Trang trí vườn đồi',
        advice: 'Vải lụa ít ỏi. Xấu hổ nhưng cuối cùng cát.',
      },
      6: {
        text: 'Bạch bí',
        meaning: 'Trang trí trắng đơn giản',
        advice: 'Đơn giản là đẹp nhất. Không lỗi.',
      },
    },
  },

  23: {
    id: 23,
    name: 'Bác',
    chineseName: '剝',
    unicode: '䷖',
    element: 'Thổ',
    nature: 'Âm',
    image: 'Núi trên Đất',
    lines: [0, 0, 0, 0, 0, 1],
    overview: {
      meaning: `Quẻ Bác tượng trưng cho sự sụp đổ, bào mòn dần dần. Núi đổ xuống đất, nền móng lung lay. Đây là thời kỳ suy thoái, cần thu mình và chờ đợi.`,
      keywords: ['Sụp đổ', 'Suy thoái', 'Bào mòn', 'Thu mình', 'Chờ đợi'],
      overallAdvice: 'Đây không phải thời điểm hành động. Thu mình, bảo toàn lực lượng và chờ thời cơ mới.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Sự nghiệp đang gặp khó khăn. Giữ vững vị trí, không mở rộng.', actionSteps: ['Bảo vệ công việc hiện tại', 'Không nhảy việc lúc này', 'Tích lũy kỹ năng'] },
      finance: { title: 'Tài Chính', reading: 'Tài chính có thể bị ảnh hưởng. Tiết kiệm và tránh đầu tư rủi ro.', actionSteps: ['Tiết kiệm tối đa', 'Tránh đầu tư mới', 'Giữ tiền mặt an toàn'] },
      love: { title: 'Tình Cảm', reading: 'Mối quan hệ có thể gặp sóng gió. Kiên nhẫn và không đưa ra quyết định lớn.', actionSteps: ['Kiên nhẫn với đối phương', 'Không chia tay vội vàng', 'Cho nhau không gian'] },
      health: { title: 'Sức Khỏe', reading: 'Sức khỏe cần được chú ý đặc biệt. Nghỉ ngơi và bảo vệ cơ thể.', actionSteps: ['Nghỉ ngơi đầy đủ', 'Ăn uống bổ dưỡng', 'Tránh hoạt động quá sức'] },
      spiritual: { title: 'Tâm Thức', reading: 'Giai đoạn thanh lọc và buông bỏ. Để cho những gì cũ rơi đi.', actionSteps: ['Buông bỏ những gì không còn phục vụ', 'Thiền định và tĩnh tâm', 'Tin vào chu kỳ mới'] },
    },
    crystals: [
      { name: 'Black Tourmaline', vietnameseName: 'Tourmaline Đen', reason: 'Bảo vệ trong thời kỳ khó khăn', usage: 'Mang theo để bảo vệ', shopHandle: 'black-tourmaline-raw' },
    ],
    affirmations: ['Tôi vượt qua mọi thử thách', 'Sau sụp đổ là xây dựng mới', 'Tôi tin vào chu kỳ của cuộc sống'],
    lineInterpretations: { 1: { text: 'Bác sàng dĩ túc', meaning: 'Bào mòn giường từ chân', advice: 'Nguy hiểm bắt đầu. Cảnh giác.' }, 2: { text: 'Bác sàng dĩ biện', meaning: 'Bào mòn giường từ cạnh', advice: 'Nguy hiểm gia tăng. Tiếp tục cảnh giác.' }, 3: { text: 'Bác chi', meaning: 'Bào mòn', advice: 'Thoát khỏi tình huống xấu. Không lỗi.' }, 4: { text: 'Bác sàng dĩ phu', meaning: 'Bào mòn giường đến da', advice: 'Rất nguy hiểm. Xui xẻo.' }, 5: { text: 'Quán ngư', meaning: 'Cá được xâu lại', advice: 'Được người trên che chở. Tốt.' }, 6: { text: 'Thạc quả bất thực', meaning: 'Quả lớn không ăn', advice: 'Giữ được nguyên vẹn. Cuối cùng tốt.' } },
  },

  24: {
    id: 24,
    name: 'Phục',
    chineseName: '復',
    unicode: '䷗',
    element: 'Thổ',
    nature: 'Dương',
    image: 'Sấm trong Đất',
    lines: [1, 0, 0, 0, 0, 0],
    overview: {
      meaning: `Quẻ Phục tượng trưng cho sự trở lại, hồi phục. Sau mùa đông dài, xuân lại đến. Năng lượng dương bắt đầu quay trở lại từ đáy.`,
      keywords: ['Trở lại', 'Hồi phục', 'Khởi đầu mới', 'Hy vọng', 'Tái sinh'],
      overallAdvice: 'Thời kỳ tối tăm đã qua. Năng lượng mới đang quay trở lại. Hãy đón nhận với lòng biết ơn.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Sự nghiệp đang hồi phục. Cơ hội mới bắt đầu xuất hiện.', actionSteps: ['Đón nhận cơ hội mới', 'Bắt đầu lại với năng lượng mới', 'Học từ thất bại trước'] },
      finance: { title: 'Tài Chính', reading: 'Tài chính bắt đầu cải thiện. Thời điểm tốt để bắt đầu lại.', actionSteps: ['Bắt đầu tiết kiệm lại', 'Cân nhắc đầu tư nhỏ', 'Xây dựng nền tảng tài chính mới'] },
      love: { title: 'Tình Cảm', reading: 'Tình yêu có thể quay trở lại. Có thể gặp lại người cũ hoặc tình mới.', actionSteps: ['Mở lòng đón nhận', 'Cho mối quan hệ cơ hội thứ hai', 'Bắt đầu mới với bài học cũ'] },
      health: { title: 'Sức Khỏe', reading: 'Sức khỏe đang hồi phục. Năng lượng quay trở lại.', actionSteps: ['Bắt đầu tập luyện nhẹ nhàng', 'Nuôi dưỡng cơ thể', 'Không vội vàng'] },
      spiritual: { title: 'Tâm Thức', reading: 'Tâm thức được tái sinh. Hy vọng và niềm tin quay trở lại.', actionSteps: ['Đón nhận năng lượng mới', 'Bắt đầu thực hành lại', 'Tri ân hành trình đã qua'] },
    },
    crystals: [
      { name: 'Sunstone', vietnameseName: 'Đá Mặt Trời', reason: 'Năng lượng mới và hy vọng', usage: 'Đeo khi cần năng lượng mới', shopHandle: 'sunstone-pendant' },
    ],
    affirmations: ['Tôi đang hồi phục và mạnh mẽ hơn', 'Mỗi ngày là một khởi đầu mới', 'Ánh sáng luôn quay trở lại'],
    lineInterpretations: { 1: { text: 'Bất viễn phục', meaning: 'Trở lại không xa', advice: 'Nhận ra sai lầm sớm. Đại cát.' }, 2: { text: 'Hưu phục', meaning: 'Trở lại tốt đẹp', advice: 'Theo người tốt để trở lại. Cát.' }, 3: { text: 'Tần phục', meaning: 'Trở lại nhiều lần', advice: 'Hay sai lầm nhưng không lỗi lớn.' }, 4: { text: 'Trung hàng độc phục', meaning: 'Đi giữa đàn một mình quay lại', advice: 'Có chủ kiến. Không lỗi.' }, 5: { text: 'Đôn phục', meaning: 'Thành thật trở lại', advice: 'Tự xét mình. Không hối hận.' }, 6: { text: 'Mê phục', meaning: 'Mê muội trở lại', advice: 'Lạc lối. Gặp họa. Cần 10 năm để phục hồi.' } },
  },

  25: {
    id: 25,
    name: 'Vô Vọng',
    chineseName: '無妄',
    unicode: '䷘',
    element: 'Kim',
    nature: 'Dương',
    image: 'Trời có Sấm',
    lines: [1, 0, 0, 1, 1, 1],
    overview: {
      meaning: `Quẻ Vô Vọng tượng trưng cho sự chân thật, không có ý đồ xấu. Hành động theo bản năng tự nhiên, không tính toán.`,
      keywords: ['Chân thật', 'Tự nhiên', 'Không mong cầu', 'Vô tư', 'Thuần khiết'],
      overallAdvice: 'Hành động với lòng chân thành, không tính toán. Điều tốt đến khi ta không mong cầu.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Làm việc với lòng chân thành, không tính toán. Thành công đến tự nhiên.', actionSteps: ['Làm việc với đam mê thực sự', 'Không tính toán quá nhiều', 'Để kết quả đến tự nhiên'] },
      finance: { title: 'Tài Chính', reading: 'Đừng chạy theo tiền. Làm tốt công việc, tiền sẽ đến.', actionSteps: ['Tập trung vào giá trị', 'Không tham lam', 'Để tài lộc đến tự nhiên'] },
      love: { title: 'Tình Cảm', reading: 'Yêu chân thành, không tính toán. Tình yêu thật đến khi ta không tìm kiếm.', actionSteps: ['Yêu vì yêu', 'Không tính toán trong tình cảm', 'Chân thành với cảm xúc'] },
      health: { title: 'Sức Khỏe', reading: 'Sống tự nhiên, cơ thể sẽ khỏe. Không ép buộc bản thân.', actionSteps: ['Sống theo nhịp tự nhiên', 'Ăn ngủ điều độ', 'Không cực đoan'] },
      spiritual: { title: 'Tâm Thức', reading: 'Tu tập tự nhiên, không gượng ép. Đạo ở trong đời thường.', actionSteps: ['Tu trong đời sống', 'Không chạy theo hình thức', 'Sống chân thật'] },
    },
    crystals: [
      { name: 'Clear Quartz', vietnameseName: 'Thạch Anh Trắng', reason: 'Sự thuần khiết và chân thật', usage: 'Thiền định với đá này', shopHandle: 'clear-quartz-point' },
    ],
    affirmations: ['Tôi sống chân thật với bản thân', 'Điều tốt đến khi tôi không mong cầu', 'Tự nhiên là đẹp nhất'],
    lineInterpretations: { 1: { text: 'Vô vọng vãng', meaning: 'Không vọng động mà đi', advice: 'Hành động chân thành. Cát.' }, 2: { text: 'Bất canh hoạch', meaning: 'Không cày mà gặt', advice: 'Làm vì đúng, không vì lợi.' }, 3: { text: 'Vô vọng chi tai', meaning: 'Tai họa không ngờ', advice: 'Họa từ bên ngoài đến. Không phải lỗi mình.' }, 4: { text: 'Khả trinh', meaning: 'Có thể giữ chính', advice: 'Giữ vững lập trường. Không lỗi.' }, 5: { text: 'Vô vọng chi tật', meaning: 'Bệnh không ngờ', advice: 'Bệnh tự khỏi. Không cần thuốc.' }, 6: { text: 'Vô vọng hành', meaning: 'Hành động không vọng', advice: 'Không nên hành động. Sẽ có tai họa.' } },
  },

  26: {
    id: 26,
    name: 'Đại Súc',
    chineseName: '大畜',
    unicode: '䷙',
    element: 'Thổ',
    nature: 'Dương',
    image: 'Núi chứa Trời',
    lines: [1, 1, 1, 0, 0, 1],
    overview: {
      meaning: `Quẻ Đại Súc tượng trưng cho sự tích lũy lớn, nuôi dưỡng tài năng. Núi chứa đựng năng lượng của Trời.`,
      keywords: ['Tích lũy', 'Nuôi dưỡng', 'Kiềm chế', 'Đợi thời', 'Tiềm năng'],
      overallAdvice: 'Đây là thời điểm để tích lũy và nuôi dưỡng. Chưa phải lúc để bộc lộ hết sức mạnh.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Thời điểm tích lũy kiến thức và kỹ năng. Chưa vội thể hiện.', actionSteps: ['Tích lũy kinh nghiệm', 'Học hỏi không ngừng', 'Đợi thời cơ chín muồi'] },
      finance: { title: 'Tài Chính', reading: 'Tích lũy tài sản. Thời điểm tốt để tiết kiệm và đầu tư dài hạn.', actionSteps: ['Tiết kiệm đều đặn', 'Đầu tư dài hạn', 'Tích lũy tài sản'] },
      love: { title: 'Tình Cảm', reading: 'Nuôi dưỡng tình cảm. Xây dựng nền tảng vững chắc.', actionSteps: ['Đầu tư thời gian cho mối quan hệ', 'Xây dựng niềm tin', 'Kiên nhẫn với tình yêu'] },
      health: { title: 'Sức Khỏe', reading: 'Tích lũy năng lượng. Nghỉ ngơi và nuôi dưỡng cơ thể.', actionSteps: ['Ăn uống bổ dưỡng', 'Ngủ đủ giấc', 'Tích lũy sức khỏe'] },
      spiritual: { title: 'Tâm Thức', reading: 'Tích lũy đức hạnh và trí tuệ. Tu tập đều đặn.', actionSteps: ['Tu tập hàng ngày', 'Tích đức', 'Nuôi dưỡng tâm thức'] },
    },
    crystals: [
      { name: 'Green Jade', vietnameseName: 'Ngọc Bích', reason: 'Tích lũy và thịnh vượng', usage: 'Đeo như bùa may mắn', shopHandle: 'green-jade-pendant' },
    ],
    affirmations: ['Tôi tích lũy mỗi ngày', 'Tiềm năng của tôi đang được nuôi dưỡng', 'Thời cơ sẽ đến khi tôi sẵn sàng'],
    lineInterpretations: { 1: { text: 'Hữu lệ', meaning: 'Có nguy hiểm', advice: 'Dừng lại là tốt. Đừng tiến.' }, 2: { text: 'Dư thuyết phức', meaning: 'Xe bị tháo bánh', advice: 'Bị kiềm chế. Chờ đợi.' }, 3: { text: 'Lương mã trục', meaning: 'Ngựa tốt đuổi theo', advice: 'Theo đuổi với kiên trì. Tốt.' }, 4: { text: 'Đồng ngưu chi cốc', meaning: 'Tấm chắn sừng bò', advice: 'Ngăn ngừa từ đầu. Đại cát.' }, 5: { text: 'Trư trĩ chi nha', meaning: 'Răng heo rừng', advice: 'Kiềm chế sức mạnh. Cát.' }, 6: { text: 'Hà thiên chi cù', meaning: 'Con đường của trời', advice: 'Thông suốt. Đại hanh.' } },
  },

  27: {
    id: 27,
    name: 'Di',
    chineseName: '頤',
    unicode: '䷚',
    element: 'Thổ',
    nature: 'Âm',
    image: 'Núi dưới Sấm',
    lines: [1, 0, 0, 0, 0, 1],
    overview: {
      meaning: `Quẻ Di tượng trưng cho sự nuôi dưỡng, như miệng ăn nuôi thân. Cần biết nuôi dưỡng thân và tâm đúng cách.`,
      keywords: ['Nuôi dưỡng', 'Dinh dưỡng', 'Chăm sóc', 'Tiết độ', 'Cân bằng'],
      overallAdvice: 'Chú ý đến những gì bạn nuôi dưỡng cho thân và tâm. Ăn uống, nói năng đều cần tiết độ.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Nuôi dưỡng kỹ năng và mối quan hệ. Chăm sóc career.', actionSteps: ['Học hỏi liên tục', 'Nuôi dưỡng network', 'Chăm sóc công việc'] },
      finance: { title: 'Tài Chính', reading: 'Nuôi dưỡng tài sản. Chi tiêu hợp lý, tiết kiệm có kế hoạch.', actionSteps: ['Chi tiêu hợp lý', 'Nuôi dưỡng savings', 'Đầu tư vào bản thân'] },
      love: { title: 'Tình Cảm', reading: 'Nuôi dưỡng tình yêu bằng hành động và lời nói. Chăm sóc mối quan hệ.', actionSteps: ['Nói lời yêu thương', 'Hành động chăm sóc', 'Nuôi dưỡng tình cảm mỗi ngày'] },
      health: { title: 'Sức Khỏe', reading: 'Ăn uống đúng cách là nền tảng sức khỏe. Chú ý dinh dưỡng.', actionSteps: ['Ăn uống lành mạnh', 'Nhai kỹ', 'Tránh ăn quá nhiều'] },
      spiritual: { title: 'Tâm Thức', reading: 'Nuôi dưỡng tâm hồn bằng sách, thiền, và tư tưởng tốt.', actionSteps: ['Đọc sách tâm thức', 'Thiền định', 'Tránh thông tin tiêu cực'] },
    },
    crystals: [
      { name: 'Green Aventurine', vietnameseName: 'Aventurine Xanh', reason: 'Nuôi dưỡng và tăng trưởng', usage: 'Đeo để thu hút may mắn', shopHandle: 'green-aventurine-bracelet' },
    ],
    affirmations: ['Tôi nuôi dưỡng thân tâm đúng cách', 'Tôi chọn những gì tốt cho mình', 'Dinh dưỡng là nền tảng sức khỏe'],
    lineInterpretations: { 1: { text: 'Xá nhĩ linh quy', meaning: 'Bỏ rùa linh của mình', advice: 'Có mà không dùng. Nhìn người khác mà thèm.' }, 2: { text: 'Điên di', meaning: 'Nuôi dưỡng ngược', advice: 'Đi sai hướng. Không thể tiến.' }, 3: { text: 'Phất di', meaning: 'Không nuôi dưỡng', advice: 'Xa rời đạo nuôi dưỡng. 10 năm không dùng.' }, 4: { text: 'Điên di cát', meaning: 'Nuôi dưỡng ngược, cát', advice: 'Tìm kiếm sự giúp đỡ. Tốt.' }, 5: { text: 'Phất kinh', meaning: 'Không theo thường', advice: 'Đi ngược quy tắc. Không thể vượt sông.' }, 6: { text: 'Do di', meaning: 'Nguồn nuôi dưỡng', advice: 'Là nguồn nuôi dưỡng. Đại cát.' } },
  },

  28: {
    id: 28,
    name: 'Đại Quá',
    chineseName: '大過',
    unicode: '䷛',
    element: 'Kim',
    nature: 'Dương',
    image: 'Hồ ngập Gỗ',
    lines: [0, 1, 1, 1, 1, 0],
    overview: {
      meaning: `Quẻ Đại Quá tượng trưng cho sự quá mức, như cây cong vì trĩu quả. Cần hành động đặc biệt trong tình huống đặc biệt.`,
      keywords: ['Quá mức', 'Đặc biệt', 'Áp lực', 'Vượt qua', 'Can đảm'],
      overallAdvice: 'Tình huống bất thường cần giải pháp bất thường. Hành động can đảm nhưng cẩn thận.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Áp lực công việc có thể quá lớn. Cần giải quyết tình huống đặc biệt.', actionSteps: ['Đối mặt với áp lực', 'Tìm giải pháp sáng tạo', 'Không né tránh trách nhiệm'] },
      finance: { title: 'Tài Chính', reading: 'Có thể có tình huống tài chính bất thường. Cần hành động quyết đoán.', actionSteps: ['Xử lý khủng hoảng tài chính', 'Đưa ra quyết định quan trọng', 'Không để vấn đề kéo dài'] },
      love: { title: 'Tình Cảm', reading: 'Mối quan hệ có thể gặp khủng hoảng. Cần can đảm đối mặt.', actionSteps: ['Đối mặt với vấn đề', 'Nói chuyện thẳng thắn', 'Đưa ra quyết định cần thiết'] },
      health: { title: 'Sức Khỏe', reading: 'Cơ thể có thể đang quá sức. Cần nghỉ ngơi và phục hồi.', actionSteps: ['Nghỉ ngơi ngay', 'Giảm áp lực', 'Chăm sóc đặc biệt'] },
      spiritual: { title: 'Tâm Thức', reading: 'Thử thách tâm thức lớn. Cần can đảm và đức tin.', actionSteps: ['Giữ vững niềm tin', 'Đối mặt với thử thách', 'Vượt qua giới hạn bản thân'] },
    },
    crystals: [
      { name: 'Tiger Eye', vietnameseName: 'Mắt Hổ', reason: 'Can đảm và sức mạnh', usage: 'Đeo khi đối mặt thử thách', shopHandle: 'tiger-eye-bracelet' },
    ],
    affirmations: ['Tôi can đảm đối mặt với thử thách', 'Tình huống đặc biệt cần hành động đặc biệt', 'Tôi vượt qua mọi giới hạn'],
    lineInterpretations: { 1: { text: 'Tịch dụng bạch mao', meaning: 'Lót bằng cỏ trắng', advice: 'Cẩn thận quá mức. Không lỗi.' }, 2: { text: 'Khô dương sanh đề', meaning: 'Cây khô mọc mầm', advice: 'Phục hồi bất ngờ. Tốt.' }, 3: { text: 'Đống não', meaning: 'Xà nhà cong', advice: 'Quá sức. Có nguy hiểm.' }, 4: { text: 'Đống long cát', meaning: 'Xà nhà cao, cát', advice: 'Được nâng đỡ. Tốt nhưng có thể xấu hổ.' }, 5: { text: 'Khô dương sanh hoa', meaning: 'Cây khô nở hoa', advice: 'Quá muộn. Không khen không chê.' }, 6: { text: 'Quá thiệp diệt đính', meaning: 'Lội nước quá đầu', advice: 'Quá mức. Có họa nhưng không lỗi.' } },
  },

  29: {
    id: 29,
    name: 'Tập Khảm',
    chineseName: '坎',
    unicode: '䷜',
    element: 'Thủy',
    nature: 'Âm',
    image: 'Nước chồng Nước',
    lines: [0, 1, 0, 0, 1, 0],
    overview: {
      meaning: `Quẻ Khảm tượng trưng cho hiểm nguy và nước. Như vực sâu chồng vực sâu, nguy hiểm lớn. Nhưng nước cũng là nguồn sống.`,
      keywords: ['Nguy hiểm', 'Thử thách', 'Kiên trì', 'Vượt khó', 'Sâu thẳm'],
      overallAdvice: 'Đây là giai đoạn nguy hiểm. Giữ vững lòng tin và kiên trì vượt qua như nước chảy không ngừng.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Công việc gặp nhiều trở ngại. Kiên trì như nước.', actionSteps: ['Giữ vững lập trường', 'Kiên trì không bỏ cuộc', 'Tìm đường đi quanh chướng ngại'] },
      finance: { title: 'Tài Chính', reading: 'Tài chính gặp khó khăn. Cần cẩn thận và kiên nhẫn.', actionSteps: ['Cẩn thận với tiền bạc', 'Tránh rủi ro', 'Kiên nhẫn vượt qua'] },
      love: { title: 'Tình Cảm', reading: 'Tình cảm gặp thử thách lớn. Cần lòng tin và kiên trì.', actionSteps: ['Tin tưởng vào nhau', 'Kiên trì qua khó khăn', 'Không bỏ cuộc'] },
      health: { title: 'Sức Khỏe', reading: 'Sức khỏe có thể gặp vấn đề. Cần chú ý đặc biệt.', actionSteps: ['Đi khám ngay', 'Theo dõi chặt chẽ', 'Không chủ quan'] },
      spiritual: { title: 'Tâm Thức', reading: 'Đây là thử thách tâm thức sâu sắc. Đức tin được thử nghiệm.', actionSteps: ['Giữ vững niềm tin', 'Thiền định trong khó khăn', 'Học bài học từ thử thách'] },
    },
    crystals: [
      { name: 'Black Obsidian', vietnameseName: 'Obsidian Đen', reason: 'Bảo vệ và vượt qua nguy hiểm', usage: 'Mang theo để bảo vệ', shopHandle: 'black-obsidian-sphere' },
    ],
    affirmations: ['Tôi như nước, vượt qua mọi chướng ngại', 'Nguy hiểm rèn luyện tôi mạnh mẽ hơn', 'Tôi tin vào khả năng vượt khó của mình'],
    lineInterpretations: { 1: { text: 'Tập khảm', meaning: 'Vào hố chồng hố', advice: 'Nguy hiểm chồng nguy hiểm. Xui.' }, 2: { text: 'Khảm hữu hiểm', meaning: 'Hố có nguy hiểm', advice: 'Chỉ đạt được một phần. Cầu nhỏ được.' }, 3: { text: 'Lai chi khảm khảm', meaning: 'Đến và đi đều hố', advice: 'Đừng hành động. Chờ đợi.' }, 4: { text: 'Tôn tửu quỹ nhị', meaning: 'Rượu và đồ ăn', advice: 'Thành thật và đơn giản. Cuối cùng không lỗi.' }, 5: { text: 'Khảm bất doanh', meaning: 'Hố không đầy', advice: 'Chưa hoàn tất nhưng không lỗi.' }, 6: { text: 'Hệ dụng huy mặc', meaning: 'Buộc bằng dây thừng', advice: 'Bị giam cầm. 3 năm không thoát. Xui.' } },
  },

  30: {
    id: 30,
    name: 'Ly',
    chineseName: '離',
    unicode: '䷝',
    element: 'Hỏa',
    nature: 'Âm',
    image: 'Lửa chồng Lửa',
    lines: [1, 0, 1, 1, 0, 1],
    overview: {
      meaning: `Quẻ Ly tượng trưng cho lửa, ánh sáng và sự phụ thuộc. Lửa cần nhiên liệu để cháy, cần biết nương tựa đúng chỗ.`,
      keywords: ['Ánh sáng', 'Rực rỡ', 'Phụ thuộc', 'Soi sáng', 'Gắn kết'],
      overallAdvice: 'Tỏa sáng như lửa nhưng biết phụ thuộc vào điều đúng đắn. Soi sáng cho mình và người khác.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Sự nghiệp có thể tỏa sáng. Gắn kết với đúng người, đúng công ty.', actionSteps: ['Thể hiện tài năng', 'Gắn kết với mentor tốt', 'Tỏa sáng đúng nơi'] },
      finance: { title: 'Tài Chính', reading: 'Tài chính có thể cải thiện. Đầu tư vào những gì bền vững.', actionSteps: ['Đầu tư khôn ngoan', 'Gắn kết với nguồn thu nhập ổn định', 'Sáng suốt trong tài chính'] },
      love: { title: 'Tình Cảm', reading: 'Tình yêu rực rỡ. Gắn kết với người phù hợp.', actionSteps: ['Thể hiện tình yêu', 'Gắn kết sâu sắc', 'Soi sáng cho nhau'] },
      health: { title: 'Sức Khỏe', reading: 'Năng lượng tốt nhưng cần nuôi dưỡng. Như lửa cần củi.', actionSteps: ['Nuôi dưỡng năng lượng', 'Ăn uống đủ chất', 'Không để cháy sáng rồi tắt'] },
      spiritual: { title: 'Tâm Thức', reading: 'Ánh sáng tâm thức đang tỏa sáng. Soi sáng cho bản thân và người khác.', actionSteps: ['Chia sẻ ánh sáng', 'Gắn kết với nguồn tâm thức', 'Thiền định với lửa'] },
    },
    crystals: [
      { name: 'Fire Opal', vietnameseName: 'Opal Lửa', reason: 'Năng lượng và ánh sáng', usage: 'Đeo khi cần tỏa sáng', shopHandle: 'fire-opal-pendant' },
    ],
    affirmations: ['Tôi tỏa sáng như lửa', 'Tôi gắn kết với những điều tốt đẹp', 'Ánh sáng của tôi soi sáng cho mọi người'],
    lineInterpretations: { 1: { text: 'Lý thác nhiên', meaning: 'Bước đi lộn xộn', advice: 'Cẩn thận ngay từ đầu. Tránh lỗi.' }, 2: { text: 'Hoàng ly', meaning: 'Lửa vàng', advice: 'Trung đạo. Đại cát.' }, 3: { text: 'Nhật trắc chi ly', meaning: 'Lửa của mặt trời lặn', advice: 'Không ca hát thì buồn. Tuổi già.' }, 4: { text: 'Đột như kỳ lai', meaning: 'Đến đột ngột', advice: 'Cháy rồi tắt. Không bền.' }, 5: { text: 'Xuất thế đà nhược', meaning: 'Nước mắt như mưa', advice: 'Lo âu nhưng cuối cùng cát.' }, 6: { text: 'Vương dụng xuất chinh', meaning: 'Vua dùng để chinh phạt', advice: 'Thắng lợi. Bắt được thủ lĩnh. Không lỗi.' } },
  },

  31: {
    id: 31,
    name: 'Hàm',
    chineseName: '咸',
    unicode: '䷞',
    element: 'Kim',
    nature: 'Dương',
    image: 'Hồ trên Núi',
    lines: [0, 0, 1, 1, 1, 0],
    overview: {
      meaning: `Quẻ Hàm tượng trưng cho sự cảm ứng, thu hút lẫn nhau. Như hồ trên núi, mềm trên cứng, âm dương tương tác.`,
      keywords: ['Cảm ứng', 'Thu hút', 'Tương tác', 'Kết nối', 'Yêu thương'],
      overallAdvice: 'Mở lòng cảm nhận và kết nối với người khác. Sự chân thành tạo ra cảm ứng.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Cảm ứng tốt với đồng nghiệp và khách hàng. Networking thuận lợi.', actionSteps: ['Mở rộng network', 'Lắng nghe và cảm nhận', 'Kết nối chân thành'] },
      finance: { title: 'Tài Chính', reading: 'Thu hút cơ hội tài chính. Cảm nhận thị trường.', actionSteps: ['Cảm nhận xu hướng thị trường', 'Thu hút cơ hội', 'Kết nối với investor'] },
      love: { title: 'Tình Cảm', reading: 'Đây là quẻ của tình yêu và hôn nhân. Thu hút và kết nối mạnh mẽ.', actionSteps: ['Mở lòng đón nhận tình yêu', 'Cảm nhận đối phương', 'Thể hiện tình cảm chân thành'] },
      health: { title: 'Sức Khỏe', reading: 'Lắng nghe cơ thể. Cảm nhận những tín hiệu từ bên trong.', actionSteps: ['Lắng nghe cơ thể', 'Cảm nhận năng lượng', 'Cân bằng âm dương'] },
      spiritual: { title: 'Tâm Thức', reading: 'Cảm ứng với năng lượng vũ trụ. Kết nối tâm thức sâu sắc.', actionSteps: ['Thiền định để cảm ứng', 'Kết nối với vũ trụ', 'Mở chakra tim'] },
    },
    crystals: [
      { name: 'Rose Quartz', vietnameseName: 'Thạch Anh Hồng', reason: 'Tình yêu và cảm ứng', usage: 'Đeo để thu hút tình yêu', shopHandle: 'rose-quartz-heart' },
    ],
    affirmations: ['Tôi mở lòng đón nhận tình yêu', 'Tôi cảm ứng với những điều tốt đẹp', 'Kết nối chân thành là sức mạnh của tôi'],
    lineInterpretations: { 1: { text: 'Hàm kỳ mỗi', meaning: 'Cảm ứng ở ngón chân', advice: 'Cảm ứng yếu. Chỉ mới bắt đầu.' }, 2: { text: 'Hàm kỳ phì', meaning: 'Cảm ứng ở bắp chân', advice: 'Muốn hành động nhưng chờ đợi là tốt.' }, 3: { text: 'Hàm kỳ cổ', meaning: 'Cảm ứng ở đùi', advice: 'Đi theo người khác. Xấu hổ nếu tiến.' }, 4: { text: 'Trinh cát', meaning: 'Giữ chính thì cát', advice: 'Hối hận mất đi. Bạn bè theo.' }, 5: { text: 'Hàm kỳ mai', meaning: 'Cảm ứng ở lưng', advice: 'Không hối hận.' }, 6: { text: 'Hàm kỳ phụ giáp thiệt', meaning: 'Cảm ứng ở má và lưỡi', advice: 'Chỉ nói suông. Không có hành động.' } },
  },

  32: {
    id: 32,
    name: 'Hằng',
    chineseName: '恆',
    unicode: '䷟',
    element: 'Mộc',
    nature: 'Âm',
    image: 'Sấm có Gió',
    lines: [0, 1, 1, 1, 0, 0],
    overview: {
      meaning: `Quẻ Hằng tượng trưng cho sự bền bỉ, kiên trì và lâu dài. Như gió và sấm cùng tồn tại, sự ổn định trong thay đổi.`,
      keywords: ['Bền bỉ', 'Kiên trì', 'Lâu dài', 'Ổn định', 'Nhất quán'],
      overallAdvice: 'Kiên trì với những gì đúng đắn. Sự bền bỉ mang lại thành công lâu dài.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Kiên trì với con đường đã chọn. Thành công đến từ sự bền bỉ.', actionSteps: ['Kiên trì với mục tiêu', 'Không thay đổi liên tục', 'Xây dựng sự nghiệp lâu dài'] },
      finance: { title: 'Tài Chính', reading: 'Đầu tư dài hạn. Kiên trì với chiến lược đã chọn.', actionSteps: ['Đầu tư dài hạn', 'Kiên trì với kế hoạch', 'Không panic sell'] },
      love: { title: 'Tình Cảm', reading: 'Tình yêu cần sự bền bỉ. Hôn nhân và cam kết lâu dài.', actionSteps: ['Cam kết lâu dài', 'Kiên nhẫn với nhau', 'Xây dựng tình yêu bền vững'] },
      health: { title: 'Sức Khỏe', reading: 'Duy trì thói quen lành mạnh lâu dài. Kiên trì tập luyện.', actionSteps: ['Duy trì routine', 'Tập thể dục đều đặn', 'Không bỏ cuộc'] },
      spiritual: { title: 'Tâm Thức', reading: 'Kiên trì tu tập. Đạo không có shortcut.', actionSteps: ['Tu tập hàng ngày', 'Kiên trì không gián đoạn', 'Bền bỉ trên con đường'] },
    },
    crystals: [
      { name: 'Hematite', vietnameseName: 'Huyết Thạch', reason: 'Grounding và kiên trì', usage: 'Đeo để tăng sự bền bỉ', shopHandle: 'hematite-bracelet' },
    ],
    affirmations: ['Tôi kiên trì với những gì đúng đắn', 'Sự bền bỉ là sức mạnh của tôi', 'Thành công đến từ sự nhất quán'],
    lineInterpretations: { 1: { text: 'Tuấn hằng', meaning: 'Đào sâu sự bền bỉ', advice: 'Muốn quá nhanh. Không có lợi.' }, 2: { text: 'Hối vong', meaning: 'Hối hận mất đi', advice: 'Giữ mực trung. Tốt.' }, 3: { text: 'Bất hằng kỳ đức', meaning: 'Không giữ đức hạnh', advice: 'Không nhất quán. Xấu hổ.' }, 4: { text: 'Điền vô cầm', meaning: 'Ruộng không có thú', advice: 'Sai vị trí. Không được gì.' }, 5: { text: 'Hằng kỳ đức', meaning: 'Giữ đức hạnh', advice: 'Đàn bà thì cát. Đàn ông thì hung.' }, 6: { text: 'Chấn hằng', meaning: 'Chấn động sự bền bỉ', advice: 'Không yên. Xui.' } },
  },

  33: {
    id: 33,
    name: 'Độn',
    chineseName: '遯',
    unicode: '䷠',
    element: 'Kim',
    nature: 'Dương',
    image: 'Trời có Núi',
    lines: [0, 0, 1, 1, 1, 1],
    overview: {
      meaning: `Quẻ Độn tượng trưng cho sự lui về, rút lui chiến lược. Biết khi nào nên tiến, khi nào nên lui.`,
      keywords: ['Rút lui', 'Lui về', 'Chiến lược', 'Bảo toàn', 'Khôn ngoan'],
      overallAdvice: 'Đây là lúc nên rút lui. Rút lui chiến lược không phải hèn nhát mà là khôn ngoan.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Có thể cần rút lui khỏi dự án hoặc công việc. Bảo toàn lực lượng.', actionSteps: ['Cân nhắc rút lui', 'Bảo toàn nguồn lực', 'Đợi thời cơ tốt hơn'] },
      finance: { title: 'Tài Chính', reading: 'Rút khỏi đầu tư xấu. Bảo toàn vốn.', actionSteps: ['Cut loss khi cần', 'Rút khỏi thị trường xấu', 'Bảo toàn vốn'] },
      love: { title: 'Tình Cảm', reading: 'Có thể cần khoảng cách. Rút lui để suy nghĩ.', actionSteps: ['Cho nhau không gian', 'Rút lui để nhìn nhận', 'Không ép buộc'] },
      health: { title: 'Sức Khỏe', reading: 'Rút lui để nghỉ ngơi. Cơ thể cần hồi phục.', actionSteps: ['Nghỉ ngơi hoàn toàn', 'Rút lui khỏi stress', 'Chăm sóc bản thân'] },
      spiritual: { title: 'Tâm Thức', reading: 'Ẩn tu. Rút lui khỏi thế tục để tu tập.', actionSteps: ['Ẩn cư tu tập', 'Rút lui khỏi ồn ào', 'Thiền định trong im lặng'] },
    },
    crystals: [
      { name: 'Smoky Quartz', vietnameseName: 'Thạch Anh Khói', reason: 'Bảo vệ khi rút lui', usage: 'Mang theo để bảo vệ', shopHandle: 'smoky-quartz-point' },
    ],
    affirmations: ['Rút lui là chiến lược khôn ngoan', 'Tôi biết khi nào cần dừng lại', 'Bảo toàn lực lượng cho ngày mai'],
    lineInterpretations: { 1: { text: 'Độn vĩ', meaning: 'Rút lui sau cùng', advice: 'Nguy hiểm. Đừng đi đâu.' }, 2: { text: 'Chấp chi dụng hoàng ngưu chi cách', meaning: 'Buộc bằng da bò vàng', advice: 'Giữ chặt. Không ai buông ra được.' }, 3: { text: 'Hệ độn', meaning: 'Rút lui bị ràng buộc', advice: 'Có bệnh. Nuôi người giúp thì cát.' }, 4: { text: 'Hảo độn', meaning: 'Rút lui đẹp', advice: 'Quân tử cát. Tiểu nhân không.' }, 5: { text: 'Gia độn', meaning: 'Rút lui tốt đẹp', advice: 'Kiên định thì cát.' }, 6: { text: 'Phì độn', meaning: 'Rút lui sung túc', advice: 'Không gì không lợi.' } },
  },

  34: {
    id: 34,
    name: 'Đại Tráng',
    chineseName: '大壯',
    unicode: '䷡',
    element: 'Mộc',
    nature: 'Dương',
    image: 'Sấm trên Trời',
    lines: [1, 1, 1, 1, 0, 0],
    overview: {
      meaning: `Quẻ Đại Tráng tượng trưng cho sức mạnh lớn lao. Như sấm vang trên trời, quyền lực và năng lượng mạnh mẽ.`,
      keywords: ['Sức mạnh', 'Quyền lực', 'Mạnh mẽ', 'Năng lượng', 'Chính đạo'],
      overallAdvice: 'Sức mạnh lớn cần đi đôi với đạo đức. Dùng sức mạnh đúng cách, theo chính đạo.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Sức mạnh và quyền lực trong công việc. Dùng đúng cách.', actionSteps: ['Sử dụng quyền lực đúng đắn', 'Dẫn dắt với đạo đức', 'Không lạm quyền'] },
      finance: { title: 'Tài Chính', reading: 'Sức mạnh tài chính. Có thể đầu tư mạnh tay nhưng cần cẩn thận.', actionSteps: ['Đầu tư tự tin', 'Không quá mạo hiểm', 'Dùng tiền đúng cách'] },
      love: { title: 'Tình Cảm', reading: 'Tình yêu mạnh mẽ. Nhưng đừng áp đặt hoặc kiểm soát.', actionSteps: ['Yêu mạnh mẽ nhưng tôn trọng', 'Không áp đặt', 'Cân bằng sức mạnh'] },
      health: { title: 'Sức Khỏe', reading: 'Năng lượng dồi dào. Tập luyện mạnh nhưng đừng quá sức.', actionSteps: ['Tập luyện với năng lượng', 'Không quá sức', 'Cân bằng nghỉ ngơi'] },
      spiritual: { title: 'Tâm Thức', reading: 'Sức mạnh tâm thức. Dùng để giúp đỡ, không để phô trương.', actionSteps: ['Dùng sức mạnh để phục vụ', 'Không kiêu ngạo', 'Tu tập với năng lượng'] },
    },
    crystals: [
      { name: 'Red Jasper', vietnameseName: 'Jasper Đỏ', reason: 'Sức mạnh và năng lượng', usage: 'Đeo khi cần sức mạnh', shopHandle: 'red-jasper-tumbled' },
    ],
    affirmations: ['Sức mạnh của tôi đi đôi với đạo đức', 'Tôi dùng quyền lực để giúp đỡ', 'Năng lượng mạnh mẽ chảy trong tôi'],
    lineInterpretations: { 1: { text: 'Tráng vu chỉ', meaning: 'Mạnh ở ngón chân', advice: 'Tiến lên sẽ xui. Có lòng tin.' }, 2: { text: 'Trinh cát', meaning: 'Giữ chính thì cát', advice: 'Tốt.' }, 3: { text: 'Tiểu nhân dụng tráng', meaning: 'Tiểu nhân dùng sức mạnh', advice: 'Nguy hiểm như dê húc rào.' }, 4: { text: 'Trinh cát hối vong', meaning: 'Giữ chính cát, hối hận mất', advice: 'Tiến được. Rào đã mở.' }, 5: { text: 'Táng dương vu dị', meaning: 'Mất dê dễ dàng', advice: 'Dễ mất. Không hối hận.' }, 6: { text: 'Đề dương xúc phiên', meaning: 'Dê đực húc rào', advice: 'Không thể tiến, không thể lui. Khó khăn nhưng cuối cùng cát.' } },
  },

  35: {
    id: 35,
    name: 'Tấn',
    chineseName: '晉',
    unicode: '䷢',
    element: 'Hỏa',
    nature: 'Âm',
    image: 'Lửa trên Đất',
    lines: [0, 0, 0, 1, 0, 1],
    overview: {
      meaning: `Quẻ Tấn tượng trưng cho sự thăng tiến, tiến bộ. Như mặt trời mọc trên đất, ánh sáng lan tỏa.`,
      keywords: ['Thăng tiến', 'Tiến bộ', 'Phát triển', 'Công nhận', 'Thành công'],
      overallAdvice: 'Đây là thời kỳ thăng tiến. Tiến lên với sự sáng suốt và chính trực.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Thăng tiến trong sự nghiệp. Được công nhận và đề bạt.', actionSteps: ['Tận dụng cơ hội thăng tiến', 'Thể hiện năng lực', 'Giữ đạo đức'] },
      finance: { title: 'Tài Chính', reading: 'Tài chính tiến triển tốt. Đầu tư sinh lợi.', actionSteps: ['Mở rộng đầu tư', 'Thu hoạch lợi nhuận', 'Tiếp tục phát triển'] },
      love: { title: 'Tình Cảm', reading: 'Tình yêu tiến triển. Mối quan hệ lên level mới.', actionSteps: ['Đưa mối quan hệ lên tầm cao', 'Cam kết sâu hơn', 'Phát triển cùng nhau'] },
      health: { title: 'Sức Khỏe', reading: 'Sức khỏe cải thiện. Năng lượng tăng dần.', actionSteps: ['Tiếp tục phát triển sức khỏe', 'Nâng cao mục tiêu fitness', 'Duy trì đà tiến bộ'] },
      spiritual: { title: 'Tâm Thức', reading: 'Tiến bộ trên con đường tâm thức. Giác ngộ dần dần.', actionSteps: ['Tiếp tục tu tập', 'Nâng cao hiểu biết', 'Chia sẻ ánh sáng'] },
    },
    crystals: [
      { name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Thành công và thăng tiến', usage: 'Đeo khi cần thăng tiến', shopHandle: 'citrine-natural' },
    ],
    affirmations: ['Tôi đang thăng tiến mỗi ngày', 'Thành công đến với tôi tự nhiên', 'Ánh sáng của tôi tỏa sáng xa rộng'],
    lineInterpretations: { 1: { text: 'Tấn như thôi như', meaning: 'Tiến và lui', advice: 'Giữ chính thì cát. Không tin cũng không lỗi.' }, 2: { text: 'Tấn như sầu như', meaning: 'Tiến mà lo âu', advice: 'Kiên định thì cát. Được phúc từ tổ tiên.' }, 3: { text: 'Chúng doãn', meaning: 'Mọi người đồng ý', advice: 'Hối hận mất đi.' }, 4: { text: 'Tấn như thạc thử', meaning: 'Tiến như chuột lớn', advice: 'Kiên định sẽ nguy.' }, 5: { text: 'Hối vong', meaning: 'Hối hận mất đi', advice: 'Không lo được mất. Tiến thì cát, không gì không lợi.' }, 6: { text: 'Tấn kỳ giác', meaning: 'Tiến với sừng', advice: 'Dùng để trừng phạt. Nguy nhưng cát. Không lỗi, có xấu hổ.' } },
  },

  36: {
    id: 36,
    name: 'Minh Di',
    chineseName: '明夷',
    unicode: '䷣',
    element: 'Thổ',
    nature: 'Âm',
    image: 'Đất trên Lửa',
    lines: [1, 0, 1, 0, 0, 0],
    overview: {
      meaning: `Quẻ Minh Di tượng trưng cho ánh sáng bị che khuất. Mặt trời chìm dưới đất, thời kỳ đen tối.`,
      keywords: ['Che khuất', 'Đen tối', 'Ẩn náu', 'Kiên nhẫn', 'Bảo vệ'],
      overallAdvice: 'Đây là thời kỳ khó khăn. Giấu ánh sáng, bảo vệ bản thân và chờ đợi.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Công việc gặp khó khăn. Giấu tài năng, không phô trương.', actionSteps: ['Giữ low profile', 'Không đối đầu trực tiếp', 'Chờ thời cơ tốt hơn'] },
      finance: { title: 'Tài Chính', reading: 'Tài chính khó khăn. Giữ tiền an toàn, không đầu tư mạo hiểm.', actionSteps: ['Bảo vệ tài sản', 'Không phô trương giàu có', 'Tiết kiệm trong im lặng'] },
      love: { title: 'Tình Cảm', reading: 'Tình cảm gặp trở ngại. Kiên nhẫn và bảo vệ mối quan hệ.', actionSteps: ['Bảo vệ tình yêu', 'Không công khai quá nhiều', 'Kiên nhẫn chờ đợi'] },
      health: { title: 'Sức Khỏe', reading: 'Sức khỏe có thể yếu. Nghỉ ngơi và bảo vệ cơ thể.', actionSteps: ['Nghỉ ngơi đầy đủ', 'Không hoạt động quá sức', 'Bảo vệ sức khỏe'] },
      spiritual: { title: 'Tâm Thức', reading: 'Thời kỳ thử thách tâm thức. Giữ ánh sáng bên trong.', actionSteps: ['Tu tập trong im lặng', 'Giữ đức tin', 'Chờ đợi ánh sáng trở lại'] },
    },
    crystals: [
      { name: 'Black Tourmaline', vietnameseName: 'Tourmaline Đen', reason: 'Bảo vệ trong thời kỳ tối tăm', usage: 'Mang theo để bảo vệ', shopHandle: 'black-tourmaline-raw' },
    ],
    affirmations: ['Ánh sáng bên trong tôi không bao giờ tắt', 'Tôi kiên nhẫn chờ đợi bình minh', 'Đêm tối rồi sẽ qua'],
    lineInterpretations: { 1: { text: 'Minh di vu phi', meaning: 'Ánh sáng bị thương khi bay', advice: 'Cánh rũ xuống. Quân tử đi, 3 ngày không ăn.' }, 2: { text: 'Minh di', meaning: 'Ánh sáng bị thương', advice: 'Bị thương ở đùi trái. Cứu được bằng ngựa mạnh. Cát.' }, 3: { text: 'Minh di vu nam thú', meaning: 'Ánh sáng bị thương khi đi nam', advice: 'Bắt được thủ lĩnh lớn. Không thể vội.' }, 4: { text: 'Nhập vu tả phúc', meaning: 'Vào bên trái bụng', advice: 'Biết được ý đồ. Rời khỏi cổng.' }, 5: { text: 'Cơ tử chi minh di', meaning: 'Cơ Tử bị thương ánh sáng', advice: 'Lợi kiên định.' }, 6: { text: 'Bất minh hối', meaning: 'Không sáng mà tối', advice: 'Lên trời rồi xuống đất.' } },
  },

  37: {
    id: 37,
    name: 'Gia Nhân',
    chineseName: '家人',
    unicode: '䷤',
    element: 'Mộc',
    nature: 'Âm',
    image: 'Gió từ Lửa',
    lines: [1, 0, 1, 0, 1, 1],
    overview: {
      meaning: `Quẻ Gia Nhân tượng trưng cho gia đình và nội bộ. Gió từ lửa, ảnh hưởng lan tỏa từ trong ra ngoài.`,
      keywords: ['Gia đình', 'Nội bộ', 'Trật tự', 'Vai trò', 'Hòa hợp'],
      overallAdvice: 'Chú trọng gia đình và nội bộ. Mỗi người có vai trò, giữ trật tự là cơ sở thành công.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Chú trọng nội bộ công ty. Xây dựng team như gia đình.', actionSteps: ['Xây dựng team tốt', 'Giữ trật tự nội bộ', 'Phân công vai trò rõ ràng'] },
      finance: { title: 'Tài Chính', reading: 'Quản lý tài chính gia đình. Mỗi người có trách nhiệm.', actionSteps: ['Lập ngân sách gia đình', 'Phân công quản lý tài chính', 'Tiết kiệm cho gia đình'] },
      love: { title: 'Tình Cảm', reading: 'Gia đình là ưu tiên. Xây dựng tổ ấm hạnh phúc.', actionSteps: ['Đầu tư cho gia đình', 'Giữ hòa hợp trong nhà', 'Tôn trọng vai trò mỗi người'] },
      health: { title: 'Sức Khỏe', reading: 'Sức khỏe gia đình là quan trọng. Chăm sóc cả nhà.', actionSteps: ['Chăm sóc sức khỏe gia đình', 'Ăn uống cùng nhau', 'Tập thể dục gia đình'] },
      spiritual: { title: 'Tâm Thức', reading: 'Tu tập trong gia đình. Gia đình là đạo tràng.', actionSteps: ['Tu tập cùng gia đình', 'Giữ hòa khí trong nhà', 'Làm gương cho con cháu'] },
    },
    crystals: [
      { name: 'Rhodonite', vietnameseName: 'Rhodonite', reason: 'Hòa hợp và yêu thương gia đình', usage: 'Đặt trong nhà', shopHandle: 'rhodonite-heart' },
    ],
    affirmations: ['Gia đình là nền tảng của tôi', 'Tôi yêu thương và được yêu thương', 'Hòa hợp trong nhà là hạnh phúc lớn nhất'],
    lineInterpretations: { 1: { text: 'Nhàn hữu gia', meaning: 'Giữ gia đình có trật tự', advice: 'Phòng ngừa từ đầu. Không hối hận.' }, 2: { text: 'Vô du toại', meaning: 'Không đi đâu để thành', advice: 'Ở trong, lo việc bếp núc. Kiên định cát.' }, 3: { text: 'Gia nhân hát hát', meaning: 'Người nhà la hét', advice: 'Nghiêm khắc quá. Nhưng tốt hơn vui vẻ quá.' }, 4: { text: 'Phú gia', meaning: 'Gia đình giàu có', advice: 'Đại cát.' }, 5: { text: 'Vương giả hữu gia', meaning: 'Vua có gia đình', advice: 'Không lo. Cát.' }, 6: { text: 'Hữu phu uy như', meaning: 'Có lòng thành và oai nghiêm', advice: 'Cuối cùng cát.' } },
  },

  38: {
    id: 38,
    name: 'Khuê',
    chineseName: '睽',
    unicode: '䷥',
    element: 'Hỏa',
    nature: 'Âm',
    image: 'Lửa trên Hồ',
    lines: [1, 1, 0, 1, 0, 1],
    overview: {
      meaning: `Quẻ Khuê tượng trưng cho sự đối lập, khác biệt. Lửa và nước đi ngược chiều, nhưng có thể bổ sung cho nhau.`,
      keywords: ['Đối lập', 'Khác biệt', 'Bổ sung', 'Hiểu lầm', 'Hòa giải'],
      overallAdvice: 'Đối mặt với sự khác biệt. Tìm điểm chung trong khác biệt, hòa giải mâu thuẫn.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Có thể có bất đồng với đồng nghiệp. Tìm cách hòa giải.', actionSteps: ['Lắng nghe góc nhìn khác', 'Tìm điểm chung', 'Hòa giải bất đồng'] },
      finance: { title: 'Tài Chính', reading: 'Có thể có tranh chấp tài chính. Giải quyết bằng thương lượng.', actionSteps: ['Thương lượng thay vì đối đầu', 'Tìm giải pháp win-win', 'Hòa giải tranh chấp'] },
      love: { title: 'Tình Cảm', reading: 'Có sự khác biệt trong quan điểm. Cần thấu hiểu và hòa giải.', actionSteps: ['Lắng nghe đối phương', 'Tôn trọng sự khác biệt', 'Tìm điểm chung'] },
      health: { title: 'Sức Khỏe', reading: 'Cơ thể có thể mất cân bằng. Cần điều hòa.', actionSteps: ['Cân bằng âm dương', 'Điều hòa cơ thể', 'Không cực đoan'] },
      spiritual: { title: 'Tâm Thức', reading: 'Đối mặt với mâu thuẫn nội tâm. Hòa giải bên trong.', actionSteps: ['Hòa giải nội tâm', 'Chấp nhận các mặt đối lập', 'Tìm sự cân bằng'] },
    },
    crystals: [
      { name: 'Ametrine', vietnameseName: 'Ametrine', reason: 'Cân bằng đối lập', usage: 'Thiền định với đá này', shopHandle: 'ametrine-pendant' },
    ],
    affirmations: ['Tôi tìm điểm chung trong khác biệt', 'Đối lập có thể bổ sung cho nhau', 'Hòa giải mang lại hòa bình'],
    lineInterpretations: { 1: { text: 'Hối vong', meaning: 'Hối hận mất đi', advice: 'Mất ngựa nhưng không đuổi. Tự nó quay về.' }, 2: { text: 'Ngộ chủ vu hạng', meaning: 'Gặp chủ ở ngõ hẻm', advice: 'Gặp được trong hoàn cảnh bất ngờ. Không lỗi.' }, 3: { text: 'Kiến dư duệ', meaning: 'Thấy xe bị kéo', advice: 'Bò bị kéo, người bị xâm. Khởi đầu xấu, kết thúc tốt.' }, 4: { text: 'Khuê cô', meaning: 'Đối lập cô đơn', advice: 'Gặp người tốt. Cùng chí hướng. Không lỗi.' }, 5: { text: 'Hối vong', meaning: 'Hối hận mất đi', advice: 'Đồng chí cắn da. Đi thì có gì lỗi?' }, 6: { text: 'Khuê cô', meaning: 'Đối lập cô đơn', advice: 'Thấy heo với bùn, xe chở quỷ. Hiểu lầm rồi hiểu. Mưa rồi cát.' } },
  },

  39: {
    id: 39,
    name: 'Kiển',
    chineseName: '蹇',
    unicode: '䷦',
    element: 'Thủy',
    nature: 'Âm',
    image: 'Nước trên Núi',
    lines: [0, 0, 1, 0, 1, 0],
    overview: {
      meaning: `Quẻ Kiển tượng trưng cho khó khăn, trở ngại như đi đường núi hiểm. Tiến khó, lui cũng khó.`,
      keywords: ['Khó khăn', 'Trở ngại', 'Kiên nhẫn', 'Chờ đợi', 'Tìm giúp đỡ'],
      overallAdvice: 'Đây là thời kỳ khó khăn. Không nên cố tiến một mình. Tìm kiếm sự giúp đỡ.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Công việc gặp nhiều trở ngại. Cần tìm người giúp đỡ.', actionSteps: ['Tìm mentor hoặc đồng minh', 'Không cố một mình', 'Kiên nhẫn vượt qua'] },
      finance: { title: 'Tài Chính', reading: 'Tài chính gặp khó khăn. Tìm sự hỗ trợ nếu cần.', actionSteps: ['Tìm nguồn hỗ trợ', 'Không mạo hiểm', 'Kiên nhẫn chờ thời'] },
      love: { title: 'Tình Cảm', reading: 'Tình cảm gặp trở ngại. Cần sự kiên nhẫn và hỗ trợ lẫn nhau.', actionSteps: ['Hỗ trợ nhau vượt khó', 'Kiên nhẫn với tình yêu', 'Tìm người tư vấn'] },
      health: { title: 'Sức Khỏe', reading: 'Sức khỏe có vấn đề. Cần tìm bác sĩ giỏi.', actionSteps: ['Đi khám chuyên gia', 'Không tự điều trị', 'Kiên nhẫn phục hồi'] },
      spiritual: { title: 'Tâm Thức', reading: 'Con đường tâm thức gặp trở ngại. Cần thầy hướng dẫn.', actionSteps: ['Tìm thầy chỉ dẫn', 'Không tự mình mò mẫm', 'Kiên trì tu tập'] },
    },
    crystals: [
      { name: 'Labradorite', vietnameseName: 'Labradorite', reason: 'Vượt qua khó khăn', usage: 'Đeo khi gặp trở ngại', shopHandle: 'labradorite-pendant' },
    ],
    affirmations: ['Tôi tìm được sự giúp đỡ khi cần', 'Kiên nhẫn giúp tôi vượt qua', 'Mọi khó khăn đều qua đi'],
    lineInterpretations: { 1: { text: 'Vãng kiển lai dự', meaning: 'Đi khó, về được khen', advice: 'Đừng đi. Chờ đợi.' }, 2: { text: 'Vương thần kiển kiển', meaning: 'Bề tôi vua gặp khó chồng khó', advice: 'Vì vua không vì mình.' }, 3: { text: 'Vãng kiển lai phản', meaning: 'Đi khó, về vui', advice: 'Ở nhà được người trong nhà vui.' }, 4: { text: 'Vãng kiển lai liên', meaning: 'Đi khó, về kết nối', advice: 'Kết nối với người khác.' }, 5: { text: 'Đại kiển bằng lai', meaning: 'Khó lớn, bạn đến', advice: 'Bạn bè đến giúp.' }, 6: { text: 'Vãng kiển lai thạc', meaning: 'Đi khó, về lớn', advice: 'Tìm người lớn để giúp. Cát.' } },
  },

  40: {
    id: 40,
    name: 'Giải',
    chineseName: '解',
    unicode: '䷧',
    element: 'Mộc',
    nature: 'Dương',
    image: 'Sấm có Mưa',
    lines: [0, 1, 0, 1, 0, 0],
    overview: {
      meaning: `Quẻ Giải tượng trưng cho sự giải thoát, tháo gỡ. Như sấm kèm mưa giải tỏa không khí ngột ngạt.`,
      keywords: ['Giải thoát', 'Tháo gỡ', 'Nhẹ nhõm', 'Tha thứ', 'Bắt đầu mới'],
      overallAdvice: 'Khó khăn đã qua. Giải thoát và tha thứ. Bắt đầu lại với tâm nhẹ nhàng.',
    },
    interpretations: {
      career: { title: 'Sự Nghiệp', reading: 'Khó khăn công việc được giải quyết. Bắt đầu giai đoạn mới.', actionSteps: ['Giải quyết vấn đề tồn đọng', 'Bắt đầu mới', 'Không níu kéo quá khứ'] },
      finance: { title: 'Tài Chính', reading: 'Vấn đề tài chính được tháo gỡ. Nhẹ nhõm hơn.', actionSteps: ['Trả hết nợ', 'Bắt đầu lại', 'Học từ sai lầm'] },
      love: { title: 'Tình Cảm', reading: 'Mâu thuẫn được giải quyết. Tha thứ và bắt đầu lại.', actionSteps: ['Tha thứ cho nhau', 'Giải quyết hiểu lầm', 'Bắt đầu lại tình yêu'] },
      health: { title: 'Sức Khỏe', reading: 'Sức khỏe hồi phục. Cơ thể được giải tỏa.', actionSteps: ['Nghỉ ngơi hồi phục', 'Giải tỏa stress', 'Bắt đầu lối sống mới'] },
      spiritual: { title: 'Tâm Thức', reading: 'Giải thoát tâm thức. Buông bỏ gánh nặng.', actionSteps: ['Buông bỏ quá khứ', 'Tha thứ cho mình và người', 'Nhẹ nhàng bước tiếp'] },
    },
    crystals: [
      { name: 'Lepidolite', vietnameseName: 'Lepidolite', reason: 'Giải tỏa và nhẹ nhõm', usage: 'Mang theo để giảm stress', shopHandle: 'lepidolite-tumbled' },
    ],
    affirmations: ['Tôi được giải thoát khỏi gánh nặng', 'Tha thứ mang lại tự do', 'Tôi bắt đầu lại với tâm nhẹ nhàng'],
    lineInterpretations: { 1: { text: 'Vô cữu', meaning: 'Không có lỗi', advice: 'Tốt. Không lỗi.' }, 2: { text: 'Điền hoạch tam hồ', meaning: 'Săn được 3 con cáo', advice: 'Được mũi tên vàng. Kiên định cát.' }, 3: { text: 'Phụ thả thừa', meaning: 'Gánh nặng trên vai', advice: 'Tự mời kẻ cướp. Xấu hổ.' }, 4: { text: 'Giải nhi mỗi', meaning: 'Giải thoát ngón chân', advice: 'Bạn đến với lòng thành.' }, 5: { text: 'Quân tử duy hữu giải', meaning: 'Quân tử có sự giải thoát', advice: 'Cát. Có lòng thành với tiểu nhân.' }, 6: { text: 'Công dụng xạ chuẩn', meaning: 'Công dùng để bắn chim ưng', advice: 'Bắn hạ chim trên thành cao. Không gì không lợi.' } },
  },

  41: { id: 41, name: 'Tổn', chineseName: '損', unicode: '䷨', element: 'Thổ', nature: 'Âm', image: 'Núi dưới Hồ', lines: [1, 1, 0, 0, 0, 1], overview: { meaning: 'Quẻ Tổn tượng trưng cho sự giảm bớt, hy sinh. Giảm cái thấp để tăng cái cao. Đây là sự hy sinh có ý nghĩa.', keywords: ['Giảm bớt', 'Hy sinh', 'Đơn giản hóa', 'Buông bỏ', 'Cho đi'], overallAdvice: 'Biết giảm bớt để tăng trưởng. Hy sinh nhỏ để đạt được lớn. Đơn giản hóa cuộc sống.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Cần giảm bớt những gì không cần thiết. Tập trung vào điều quan trọng.', actionSteps: ['Loại bỏ công việc không hiệu quả', 'Tập trung vào core tasks', 'Đơn giản hóa quy trình'] }, finance: { title: 'Tài Chính', reading: 'Cắt giảm chi tiêu không cần thiết. Đầu tư có chọn lọc.', actionSteps: ['Cắt giảm chi tiêu', 'Đầu tư có mục đích', 'Sống đơn giản hơn'] }, love: { title: 'Tình Cảm', reading: 'Hy sinh cho người yêu. Cho đi nhiều hơn nhận lại.', actionSteps: ['Hy sinh cho người thân', 'Giảm đòi hỏi', 'Cho đi với tình yêu'] }, health: { title: 'Sức Khỏe', reading: 'Giảm những gì có hại. Detox cơ thể và tâm trí.', actionSteps: ['Giảm đồ ăn không lành mạnh', 'Detox định kỳ', 'Đơn giản hóa lối sống'] }, spiritual: { title: 'Tâm Thức', reading: 'Buông bỏ ego và ham muốn. Đơn giản hóa tâm hồn.', actionSteps: ['Buông bỏ attachment', 'Sống đơn giản', 'Cho đi không cầu nhận'] } }, crystals: [{ name: 'Howlite', vietnameseName: 'Howlite', reason: 'Buông bỏ và đơn giản', usage: 'Thiền định với đá này', shopHandle: 'howlite-bracelet' }], affirmations: ['Tôi buông bỏ những gì không cần thiết', 'Hy sinh nhỏ mang lại điều lớn', 'Đơn giản là hạnh phúc'], lineInterpretations: { 1: { text: 'Dĩ sự thiên vãng', meaning: 'Bỏ việc mình để giúp người', advice: 'Không lỗi. Nhưng cần cân nhắc.' }, 2: { text: 'Lợi trinh', meaning: 'Lợi cho kiên định', advice: 'Không giảm mà tăng.' }, 3: { text: 'Tam nhân hành', meaning: '3 người đi thì giảm 1', advice: 'Một người đi thì có bạn.' }, 4: { text: 'Tổn kỳ tật', meaning: 'Giảm bệnh của mình', advice: 'Mau chóng vui vẻ. Không lỗi.' }, 5: { text: 'Hoặc ích chi', meaning: 'Có thể được tăng', advice: 'Được tặng rùa. Đại cát.' }, 6: { text: 'Phất tổn ích chi', meaning: 'Không giảm mà tăng', advice: 'Không lỗi. Lợi có nơi đi.' } } },

  42: { id: 42, name: 'Ích', chineseName: '益', unicode: '䷩', element: 'Mộc', nature: 'Dương', image: 'Gió có Sấm', lines: [1, 0, 0, 0, 1, 1], overview: { meaning: 'Quẻ Ích tượng trưng cho sự tăng trưởng, lợi ích. Giảm cái cao để tăng cái thấp, như mưa ban phước xuống đất.', keywords: ['Tăng trưởng', 'Lợi ích', 'Phát triển', 'Ban phước', 'Mở rộng'], overallAdvice: 'Đây là thời kỳ tăng trưởng. Nắm bắt cơ hội và hành động.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Sự nghiệp tăng trưởng. Cơ hội mở rộng.', actionSteps: ['Nắm bắt cơ hội', 'Mở rộng kinh doanh', 'Đầu tư vào phát triển'] }, finance: { title: 'Tài Chính', reading: 'Tài chính tăng trưởng. Thời điểm tốt để đầu tư.', actionSteps: ['Đầu tư mạnh dạn', 'Mở rộng nguồn thu', 'Nắm bắt cơ hội'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu phát triển. Mối quan hệ ngày càng tốt.', actionSteps: ['Đầu tư cho tình yêu', 'Mở rộng gia đình', 'Phát triển cùng nhau'] }, health: { title: 'Sức Khỏe', reading: 'Sức khỏe cải thiện. Năng lượng tăng lên.', actionSteps: ['Tăng cường tập luyện', 'Bổ sung dinh dưỡng', 'Phát triển sức khỏe'] }, spiritual: { title: 'Tâm Thức', reading: 'Tâm thức phát triển mạnh. Đây là thời kỳ thuận lợi.', actionSteps: ['Mở rộng hiểu biết', 'Phát triển tâm thức', 'Chia sẻ với người khác'] } }, crystals: [{ name: 'Green Aventurine', vietnameseName: 'Aventurine Xanh', reason: 'Tăng trưởng và may mắn', usage: 'Đeo để thu hút may mắn', shopHandle: 'green-aventurine-bracelet' }], affirmations: ['Tôi đang tăng trưởng mỗi ngày', 'Cơ hội đến với tôi', 'Tôi phát triển không ngừng'], lineInterpretations: { 1: { text: 'Lợi dụng vi đại tác', meaning: 'Lợi cho việc lớn', advice: 'Đại cát. Không lỗi.' }, 2: { text: 'Hoặc ích chi', meaning: 'Có thể được tăng', advice: 'Được tặng rùa. Vua dâng lên Thượng đế. Cát.' }, 3: { text: 'Ích chi dụng hung sự', meaning: 'Tăng bằng việc xấu', advice: 'Không lỗi nếu thành thật.' }, 4: { text: 'Trung hàng', meaning: 'Đi giữa', advice: 'Lợi cho việc dời đô.' }, 5: { text: 'Hữu phu huệ tâm', meaning: 'Có lòng thành và từ bi', advice: 'Đại cát.' }, 6: { text: 'Mạc ích chi', meaning: 'Không được tăng', advice: 'Có người đánh. Tâm không kiên định. Xui.' } } },

  43: { id: 43, name: 'Quải', chineseName: '夬', unicode: '䷪', element: 'Kim', nature: 'Dương', image: 'Hồ trên Trời', lines: [1, 1, 1, 1, 1, 0], overview: { meaning: 'Quẻ Quải tượng trưng cho sự quyết định, cắt đứt. Như nước tràn đê, cần hành động quyết đoán.', keywords: ['Quyết định', 'Cắt đứt', 'Quyết đoán', 'Loại bỏ', 'Đột phá'], overallAdvice: 'Đây là lúc cần quyết định dứt khoát. Cắt đứt những gì không còn phục vụ.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Cần đưa ra quyết định quan trọng. Cắt đứt những gì cản trở.', actionSteps: ['Đưa ra quyết định', 'Cắt đứt dự án không hiệu quả', 'Hành động quyết đoán'] }, finance: { title: 'Tài Chính', reading: 'Quyết định tài chính quan trọng. Cut loss khi cần.', actionSteps: ['Quyết định dứt khoát', 'Cut loss', 'Không do dự'] }, love: { title: 'Tình Cảm', reading: 'Có thể cần quyết định về mối quan hệ. Cắt đứt nếu cần.', actionSteps: ['Đưa ra quyết định', 'Không kéo dài đau khổ', 'Dứt khoát'] }, health: { title: 'Sức Khỏe', reading: 'Cắt bỏ thói quen xấu. Quyết tâm thay đổi.', actionSteps: ['Cắt bỏ addiction', 'Quyết tâm thay đổi', 'Không trì hoãn'] }, spiritual: { title: 'Tâm Thức', reading: 'Cắt đứt ràng buộc. Giải thoát khỏi attachment.', actionSteps: ['Cắt đứt attachment', 'Quyết tâm tu tập', 'Buông bỏ hoàn toàn'] } }, crystals: [{ name: 'Black Obsidian', vietnameseName: 'Obsidian Đen', reason: 'Cắt đứt và quyết đoán', usage: 'Thiền định khi cần quyết định', shopHandle: 'black-obsidian-sphere' }], affirmations: ['Tôi quyết định dứt khoát', 'Tôi cắt đứt những gì không còn phục vụ', 'Tôi hành động quyết đoán'], lineInterpretations: { 1: { text: 'Tráng vu tiền chỉ', meaning: 'Mạnh ở ngón chân trước', advice: 'Đi không thắng. Có lỗi.' }, 2: { text: 'Dịch hiệu', meaning: 'Kêu gọi cảnh giác', advice: 'Không sợ dù đêm có binh.' }, 3: { text: 'Tráng vu quốn', meaning: 'Mạnh ở gò má', advice: 'Có xui. Quân tử quyết quyết.' }, 4: { text: 'Đồn vô phu', meaning: 'Mông không da', advice: 'Đi khó. Nghe lời thì hối hận mất.' }, 5: { text: 'Hiền lục quyết quyết', meaning: 'Cây rau sam quyết quyết', advice: 'Trung đạo không lỗi.' }, 6: { text: 'Vô hiệu', meaning: 'Không kêu', advice: 'Cuối cùng có xui.' } } },

  44: { id: 44, name: 'Cấu', chineseName: '姤', unicode: '䷫', element: 'Kim', nature: 'Âm', image: 'Trời dưới Gió', lines: [0, 1, 1, 1, 1, 1], overview: { meaning: 'Quẻ Cấu tượng trưng cho sự gặp gỡ, tiếp cận. Như gió thổi khắp nơi, gặp mọi thứ trên đường.', keywords: ['Gặp gỡ', 'Tiếp cận', 'Cơ hội', 'Cám dỗ', 'Cảnh giác'], overallAdvice: 'Gặp gỡ có thể là cơ hội hoặc cám dỗ. Cần sáng suốt phân biệt.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Có thể gặp cơ hội hoặc người quan trọng. Cảnh giác với cám dỗ.', actionSteps: ['Nắm bắt cơ hội tốt', 'Cảnh giác với cám dỗ', 'Phân biệt đúng sai'] }, finance: { title: 'Tài Chính', reading: 'Có thể gặp cơ hội đầu tư. Cẩn thận với scam.', actionSteps: ['Đánh giá cơ hội kỹ', 'Cảnh giác với lừa đảo', 'Không tham lam'] }, love: { title: 'Tình Cảm', reading: 'Có thể gặp người mới. Cẩn thận với người không phù hợp.', actionSteps: ['Gặp gỡ với sự sáng suốt', 'Không vội vàng cam kết', 'Tìm hiểu kỹ'] }, health: { title: 'Sức Khỏe', reading: 'Có thể gặp vấn đề sức khỏe mới. Cảnh giác và phòng ngừa.', actionSteps: ['Kiểm tra sức khỏe', 'Phòng bệnh', 'Cảnh giác triệu chứng'] }, spiritual: { title: 'Tâm Thức', reading: 'Gặp gỡ thầy hoặc đường lối mới. Cẩn thận với tà đạo.', actionSteps: ['Phân biệt chánh tà', 'Tìm thầy đúng', 'Không mê tín'] } }, crystals: [{ name: 'Amethyst', vietnameseName: 'Thạch Anh Tím', reason: 'Sáng suốt và phân biệt', usage: 'Đeo khi gặp gỡ người mới', shopHandle: 'amethyst-cluster' }], affirmations: ['Tôi sáng suốt trong mọi gặp gỡ', 'Tôi phân biệt cơ hội và cám dỗ', 'Tôi cảnh giác nhưng không sợ hãi'], lineInterpretations: { 1: { text: 'Hệ vu kim nị', meaning: 'Buộc vào then cửa kim loại', advice: 'Kiên định cát. Đi có xui.' }, 2: { text: 'Bao hữu ngư', meaning: 'Gói có cá', advice: 'Không lỗi. Không lợi cho khách.' }, 3: { text: 'Đồn vô phu', meaning: 'Mông không da', advice: 'Đi khó. Nguy nhưng không lỗi lớn.' }, 4: { text: 'Bao vô ngư', meaning: 'Gói không có cá', advice: 'Có xui.' }, 5: { text: 'Dĩ kỷ bao qua', meaning: 'Lấy liễu bọc dưa', advice: 'Giấu vẻ đẹp. Có từ trời rơi xuống.' }, 6: { text: 'Cấu kỳ giác', meaning: 'Gặp ở sừng', advice: 'Xấu hổ. Không lỗi.' } } },

  45: { id: 45, name: 'Tụy', chineseName: '萃', unicode: '䷬', element: 'Kim', nature: 'Âm', image: 'Hồ trên Đất', lines: [0, 0, 0, 1, 1, 0], overview: { meaning: 'Quẻ Tụy tượng trưng cho sự tập hợp, hội tụ. Nước tụ lại thành hồ trên đất.', keywords: ['Tập hợp', 'Hội tụ', 'Đoàn kết', 'Tụ họp', 'Cộng đồng'], overallAdvice: 'Đây là thời điểm để tập hợp lực lượng, hội tụ người cùng chí hướng.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Tập hợp team tốt. Hội tụ nguồn lực.', actionSteps: ['Xây dựng team', 'Hội tụ talent', 'Tập hợp nguồn lực'] }, finance: { title: 'Tài Chính', reading: 'Tập hợp vốn. Hội tụ cơ hội đầu tư.', actionSteps: ['Gom vốn', 'Hội tụ nguồn thu', 'Tập trung đầu tư'] }, love: { title: 'Tình Cảm', reading: 'Sum họp gia đình. Hội tụ người thân.', actionSteps: ['Tổ chức reunion', 'Tập hợp gia đình', 'Gắn kết mối quan hệ'] }, health: { title: 'Sức Khỏe', reading: 'Tập hợp năng lượng. Hội tụ sức khỏe.', actionSteps: ['Tích lũy năng lượng', 'Tập trung chăm sóc', 'Hội tụ sức mạnh'] }, spiritual: { title: 'Tâm Thức', reading: 'Tập hợp sangha. Hội tụ năng lượng tâm thức.', actionSteps: ['Tham gia cộng đồng', 'Hội tụ năng lượng', 'Tu tập nhóm'] } }, crystals: [{ name: 'Amazonite', vietnameseName: 'Amazonite', reason: 'Hài hòa và tập hợp', usage: 'Đeo khi làm việc nhóm', shopHandle: 'amazonite-tumbled' }], affirmations: ['Tôi thu hút người cùng chí hướng', 'Đoàn kết là sức mạnh', 'Hội tụ mang lại thành công'], lineInterpretations: { 1: { text: 'Hữu phu bất chung', meaning: 'Có lòng thành không đến cuối', advice: 'Hỗn loạn. Kêu cứu. Cười rồi không lo.' }, 2: { text: 'Dẫn cát', meaning: 'Kéo theo, cát', advice: 'Không lỗi. Thành thật thì cát.' }, 3: { text: 'Tụy như ta như', meaning: 'Tụ và than', advice: 'Không gì lợi. Đi không lỗi, có xấu hổ.' }, 4: { text: 'Đại cát vô cữu', meaning: 'Đại cát không lỗi', advice: 'Tốt.' }, 5: { text: 'Tụy hữu vị', meaning: 'Tụ có vị trí', advice: 'Không lỗi. Không tin cũng kiên định.' }, 6: { text: 'Tề tư', meaning: 'Than thở', advice: 'Không lỗi.' } } },

  46: { id: 46, name: 'Thăng', chineseName: '升', unicode: '䷭', element: 'Mộc', nature: 'Âm', image: 'Đất có Cây', lines: [0, 1, 1, 0, 0, 0], overview: { meaning: 'Quẻ Thăng tượng trưng cho sự thăng lên, phát triển. Như cây mọc từ đất vươn lên cao.', keywords: ['Thăng tiến', 'Phát triển', 'Vươn lên', 'Tiến bộ', 'Tăng trưởng'], overallAdvice: 'Đây là thời kỳ thăng tiến. Vươn lên từng bước vững chắc.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Thăng tiến trong sự nghiệp. Vươn lên vị trí mới.', actionSteps: ['Nắm cơ hội thăng tiến', 'Phát triển kỹ năng', 'Vươn lên từng bước'] }, finance: { title: 'Tài Chính', reading: 'Tài chính tăng trưởng. Thu nhập tăng lên.', actionSteps: ['Tăng thu nhập', 'Đầu tư phát triển', 'Vươn lên giàu có'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu phát triển. Mối quan hệ nâng tầm.', actionSteps: ['Phát triển tình yêu', 'Nâng cấp mối quan hệ', 'Vươn lên cùng nhau'] }, health: { title: 'Sức Khỏe', reading: 'Sức khỏe cải thiện dần. Năng lượng tăng lên.', actionSteps: ['Phát triển sức khỏe', 'Nâng cao thể lực', 'Tiến bộ từng ngày'] }, spiritual: { title: 'Tâm Thức', reading: 'Tâm thức thăng hoa. Vươn lên giác ngộ.', actionSteps: ['Nâng cao tu tập', 'Vươn lên giác ngộ', 'Phát triển tâm thức'] } }, crystals: [{ name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Thăng tiến và thành công', usage: 'Đeo khi cần thăng tiến', shopHandle: 'citrine-natural' }], affirmations: ['Tôi đang vươn lên mỗi ngày', 'Thăng tiến là con đường của tôi', 'Tôi phát triển không ngừng'], lineInterpretations: { 1: { text: 'Doãn thăng', meaning: 'Thăng với lòng thành', advice: 'Đại cát.' }, 2: { text: 'Phu nãi lợi dụng thiền', meaning: 'Thành thật thì lợi tế lễ', advice: 'Không lỗi.' }, 3: { text: 'Thăng hư ấp', meaning: 'Thăng lên thành trống', advice: 'Không có trở ngại.' }, 4: { text: 'Vương dụng hưởng vu kỳ sơn', meaning: 'Vua tế ở núi Kỳ', advice: 'Cát, không lỗi.' }, 5: { text: 'Trinh cát', meaning: 'Kiên định cát', advice: 'Thăng bậc.' }, 6: { text: 'Minh thăng', meaning: 'Thăng trong tối', advice: 'Lợi cho kiên trì không ngừng.' } } },

  47: { id: 47, name: 'Khốn', chineseName: '困', unicode: '䷮', element: 'Kim', nature: 'Âm', image: 'Hồ không có Nước', lines: [0, 1, 0, 1, 1, 0], overview: { meaning: 'Quẻ Khốn tượng trưng cho sự khốn khó, bế tắc. Như hồ cạn nước, đang trong tình huống khó khăn.', keywords: ['Khốn khó', 'Bế tắc', 'Kiệt sức', 'Kiên nhẫn', 'Chờ đợi'], overallAdvice: 'Đây là thời kỳ khó khăn. Giữ vững tinh thần, kiên nhẫn chờ đợi.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Sự nghiệp gặp khó khăn. Kiên nhẫn và giữ vững.', actionSteps: ['Giữ vững công việc', 'Không hành động vội', 'Chờ thời cơ'] }, finance: { title: 'Tài Chính', reading: 'Tài chính khó khăn. Tiết kiệm và cầm cự.', actionSteps: ['Tiết kiệm tối đa', 'Không mạo hiểm', 'Cầm cự qua khó khăn'] }, love: { title: 'Tình Cảm', reading: 'Tình cảm gặp thử thách. Kiên nhẫn với nhau.', actionSteps: ['Hỗ trợ nhau', 'Kiên nhẫn qua khó', 'Không bỏ cuộc'] }, health: { title: 'Sức Khỏe', reading: 'Sức khỏe yếu. Nghỉ ngơi và bảo trọng.', actionSteps: ['Nghỉ ngơi đầy đủ', 'Không gắng sức', 'Chờ hồi phục'] }, spiritual: { title: 'Tâm Thức', reading: 'Giai đoạn thử thách tâm thức. Giữ vững niềm tin.', actionSteps: ['Giữ vững đức tin', 'Kiên trì tu tập', 'Chờ đợi ánh sáng'] } }, crystals: [{ name: 'Smoky Quartz', vietnameseName: 'Thạch Anh Khói', reason: 'Vượt qua khó khăn', usage: 'Mang theo để được bảo vệ', shopHandle: 'smoky-quartz-point' }], affirmations: ['Tôi vượt qua mọi khó khăn', 'Khốn khó rèn luyện ý chí', 'Sau cơn mưa trời lại sáng'], lineInterpretations: { 1: { text: 'Đồn khốn vu chất mộc', meaning: 'Mông khốn trên gốc cây', advice: 'Vào hang tối. 3 năm không thấy.' }, 2: { text: 'Khốn vu tửu thực', meaning: 'Khốn trong rượu ăn', advice: 'Có tin từ người trên. Dâng tế lợi.' }, 3: { text: 'Khốn vu thạch', meaning: 'Khốn trên đá', advice: 'Bám vào gai. Vào nhà không thấy vợ.' }, 4: { text: 'Lai từ từ', meaning: 'Đến chậm chậm', advice: 'Khốn ở xe vàng. Xấu hổ nhưng có kết.' }, 5: { text: 'Dị tị', meaning: 'Cắt mũi', advice: 'Khốn vì người trên. Từ từ có vui.' }, 6: { text: 'Khốn vu cát lũy', meaning: 'Khốn trong dây leo', advice: 'Hối hận thì tiến được.' } } },

  48: { id: 48, name: 'Tỉnh', chineseName: '井', unicode: '䷯', element: 'Thủy', nature: 'Âm', image: 'Nước trên Gỗ', lines: [0, 1, 1, 0, 1, 0], overview: { meaning: 'Quẻ Tỉnh tượng trưng cho giếng nước, nguồn sống không đổi. Dù thành phố thay đổi, giếng vẫn ở đó.', keywords: ['Nguồn sống', 'Bền vững', 'Không đổi', 'Nuôi dưỡng', 'Phục vụ'], overallAdvice: 'Giữ vững nguồn gốc và giá trị cốt lõi. Phục vụ không mong nhận lại.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Giữ vững giá trị cốt lõi. Phục vụ với lòng thành.', actionSteps: ['Giữ vững giá trị', 'Phục vụ khách hàng', 'Không thay đổi core values'] }, finance: { title: 'Tài Chính', reading: 'Xây dựng nguồn thu bền vững. Không đuổi theo tiền.', actionSteps: ['Xây dựng passive income', 'Tạo nguồn thu ổn định', 'Không chạy theo đồng tiền'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu bền vững như giếng. Nuôi dưỡng không ngừng.', actionSteps: ['Nuôi dưỡng tình yêu', 'Giữ vững cam kết', 'Phục vụ với tình yêu'] }, health: { title: 'Sức Khỏe', reading: 'Nuôi dưỡng sức khỏe từ nguồn. Uống đủ nước.', actionSteps: ['Uống đủ nước', 'Nuôi dưỡng từ gốc', 'Chăm sóc cơ bản'] }, spiritual: { title: 'Tâm Thức', reading: 'Kết nối với nguồn tâm thức. Phục vụ vô điều kiện.', actionSteps: ['Kết nối nguồn', 'Phục vụ vô điều kiện', 'Giữ vững tu tập'] } }, crystals: [{ name: 'Aquamarine', vietnameseName: 'Ngọc Biển', reason: 'Nguồn sống và làm sạch', usage: 'Thiền định với đá này', shopHandle: 'aquamarine-pendant' }], affirmations: ['Tôi là nguồn năng lượng tích cực', 'Tôi phục vụ với lòng thành', 'Giá trị cốt lõi không thay đổi'], lineInterpretations: { 1: { text: 'Tỉnh nê bất thực', meaning: 'Bùn giếng không ăn được', advice: 'Giếng cũ không có chim.' }, 2: { text: 'Tỉnh cốc xạ phụ', meaning: 'Hang giếng bắn cá', advice: 'Thùng rò rỉ.' }, 3: { text: 'Tỉnh tê bất thực', meaning: 'Giếng sạch không dùng', advice: 'Tâm đau. Có thể dùng.' }, 4: { text: 'Tỉnh thậm', meaning: 'Lót giếng', advice: 'Không lỗi.' }, 5: { text: 'Tỉnh liệt', meaning: 'Giếng trong', advice: 'Uống từ nguồn lạnh.' }, 6: { text: 'Tỉnh thâu vật mạc', meaning: 'Giếng thu không che', advice: 'Có lòng thành. Đại cát.' } } },

  49: { id: 49, name: 'Cách', chineseName: '革', unicode: '䷰', element: 'Kim', nature: 'Dương', image: 'Hồ có Lửa', lines: [1, 0, 1, 1, 1, 0], overview: { meaning: 'Quẻ Cách tượng trưng cho cách mạng, đổi mới. Lửa dưới nước, sự biến đổi triệt để.', keywords: ['Cách mạng', 'Đổi mới', 'Biến đổi', 'Thay da đổi thịt', 'Cải cách'], overallAdvice: 'Đây là thời kỳ cần đổi mới triệt để. Thay đổi để tiến lên.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Cần cách mạng trong công việc. Đổi mới hoàn toàn.', actionSteps: ['Đổi mới cách làm', 'Thay đổi triệt để', 'Cải cách quy trình'] }, finance: { title: 'Tài Chính', reading: 'Đổi mới chiến lược tài chính. Thay đổi hoàn toàn.', actionSteps: ['Đổi chiến lược', 'Thay đổi portfolio', 'Cải cách tài chính'] }, love: { title: 'Tình Cảm', reading: 'Đổi mới mối quan hệ. Thay đổi cách yêu.', actionSteps: ['Đổi mới tình yêu', 'Thay đổi cách giao tiếp', 'Cải cách mối quan hệ'] }, health: { title: 'Sức Khỏe', reading: 'Đổi mới lối sống. Thay đổi triệt để thói quen.', actionSteps: ['Đổi mới lifestyle', 'Thay đổi chế độ ăn', 'Cải cách thói quen'] }, spiritual: { title: 'Tâm Thức', reading: 'Đổi mới tâm thức. Thay đổi cách tu tập.', actionSteps: ['Đổi mới tu tập', 'Thay đổi perspective', 'Cải cách tâm thức'] } }, crystals: [{ name: 'Fire Agate', vietnameseName: 'Mã Não Lửa', reason: 'Biến đổi và đổi mới', usage: 'Đeo khi cần thay đổi', shopHandle: 'fire-agate-pendant' }], affirmations: ['Tôi đổi mới để tiến lên', 'Thay đổi là con đường phát triển', 'Tôi sẵn sàng cách mạng bản thân'], lineInterpretations: { 1: { text: 'Củng dụng hoàng ngưu chi cách', meaning: 'Buộc bằng da bò vàng', advice: 'Không đổi.' }, 2: { text: 'Dĩ nhật nãi cách chi', meaning: 'Đến ngày rồi mới đổi', advice: 'Cát. Tiến không lỗi.' }, 3: { text: 'Chinh hung', meaning: 'Tiến là xui', advice: 'Kiên định nguy. Cách ngôn 3 lần rồi tin.' }, 4: { text: 'Hối vong', meaning: 'Hối hận mất đi', advice: 'Có lòng thành. Đổi mệnh. Cát.' }, 5: { text: 'Đại nhân hổ biến', meaning: 'Người lớn đổi như hổ', advice: 'Chưa chiêm mà có lòng thành.' }, 6: { text: 'Quân tử báo biến', meaning: 'Quân tử đổi như beo', advice: 'Tiểu nhân đổi mặt. An cư cát.' } } },

  50: { id: 50, name: 'Đỉnh', chineseName: '鼎', unicode: '䷱', element: 'Hỏa', nature: 'Âm', image: 'Lửa trên Gỗ', lines: [0, 1, 1, 1, 0, 1], overview: { meaning: 'Quẻ Đỉnh tượng trưng cho cái đỉnh (vạc), biểu tượng của văn minh và nuôi dưỡng. Lửa nấu thức ăn trong đỉnh.', keywords: ['Nuôi dưỡng', 'Văn minh', 'Cấu trúc', 'Ổn định', 'Phát triển'], overallAdvice: 'Xây dựng nền tảng vững chắc. Nuôi dưỡng văn hóa và giá trị.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Xây dựng sự nghiệp vững chắc. Cấu trúc tổ chức tốt.', actionSteps: ['Xây dựng cấu trúc', 'Nuôi dưỡng team', 'Tạo nền tảng vững'] }, finance: { title: 'Tài Chính', reading: 'Xây dựng nền tảng tài chính. Ổn định và phát triển.', actionSteps: ['Xây nền tảng tài chính', 'Cấu trúc đầu tư', 'Nuôi dưỡng tài sản'] }, love: { title: 'Tình Cảm', reading: 'Xây dựng gia đình vững chắc. Nuôi dưỡng tình yêu.', actionSteps: ['Xây dựng tổ ấm', 'Nuôi dưỡng tình cảm', 'Tạo nền tảng gia đình'] }, health: { title: 'Sức Khỏe', reading: 'Xây dựng sức khỏe vững chắc. Nuôi dưỡng cơ thể.', actionSteps: ['Xây dựng thể lực', 'Nuôi dưỡng sức khỏe', 'Ăn uống bổ dưỡng'] }, spiritual: { title: 'Tâm Thức', reading: 'Xây dựng nền tảng tâm thức. Tu tập có cấu trúc.', actionSteps: ['Xây dựng tu tập', 'Nuôi dưỡng tâm thức', 'Tạo thói quen thiền'] } }, crystals: [{ name: 'Pyrite', vietnameseName: 'Pyrite', reason: 'Ổn định và thịnh vượng', usage: 'Đặt trên bàn làm việc', shopHandle: 'pyrite-cube' }], affirmations: ['Tôi xây dựng nền tảng vững chắc', 'Tôi nuôi dưỡng những gì quý giá', 'Ổn định là nền tảng phát triển'], lineInterpretations: { 1: { text: 'Đỉnh điên chỉ', meaning: 'Đỉnh lật chân', advice: 'Lợi cho việc bỏ cái xấu. Lấy thiếp vì con. Không lỗi.' }, 2: { text: 'Đỉnh hữu thực', meaning: 'Đỉnh có thức ăn', advice: 'Đối thủ ghen tỵ. Không đến được. Cát.' }, 3: { text: 'Đỉnh nhĩ cách', meaning: 'Tai đỉnh thay đổi', advice: 'Không ăn được. Mưa rồi hối hận hết. Cuối cùng cát.' }, 4: { text: 'Đỉnh chiết túc', meaning: 'Đỉnh gãy chân', advice: 'Đổ thức ăn. Xấu hổ. Xui.' }, 5: { text: 'Đỉnh hoàng nhĩ', meaning: 'Đỉnh tai vàng', advice: 'Có khoen vàng. Lợi kiên định.' }, 6: { text: 'Đỉnh ngọc huyền', meaning: 'Đỉnh có khoen ngọc', advice: 'Đại cát. Không gì không lợi.' } } },

  51: { id: 51, name: 'Chấn', chineseName: '震', unicode: '䷲', element: 'Mộc', nature: 'Dương', image: 'Sấm chồng Sấm', lines: [1, 0, 0, 1, 0, 0], overview: { meaning: 'Quẻ Chấn tượng trưng cho sấm sét, chấn động. Sự thức tỉnh và khởi đầu mạnh mẽ.', keywords: ['Chấn động', 'Thức tỉnh', 'Khởi đầu', 'Sức mạnh', 'Bất ngờ'], overallAdvice: 'Sấm sét đánh thức mọi thứ. Đón nhận thay đổi bất ngờ với lòng can đảm.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Có thể có thay đổi bất ngờ. Thức tỉnh và hành động.', actionSteps: ['Sẵn sàng cho thay đổi', 'Thức tỉnh và hành động', 'Đón nhận bất ngờ'] }, finance: { title: 'Tài Chính', reading: 'Có thể có biến động. Chuẩn bị và phản ứng nhanh.', actionSteps: ['Chuẩn bị cho biến động', 'Phản ứng nhanh', 'Không hoảng loạn'] }, love: { title: 'Tình Cảm', reading: 'Có thể có bất ngờ trong tình yêu. Thức tỉnh cảm xúc.', actionSteps: ['Đón nhận bất ngờ', 'Thức tỉnh tình yêu', 'Sẵn sàng thay đổi'] }, health: { title: 'Sức Khỏe', reading: 'Có thể có shock hoặc bất ngờ. Giữ bình tĩnh.', actionSteps: ['Giữ bình tĩnh', 'Chăm sóc tim mạch', 'Không sợ hãi'] }, spiritual: { title: 'Tâm Thức', reading: 'Giác ngộ bất ngờ. Thức tỉnh tâm thức.', actionSteps: ['Đón nhận giác ngộ', 'Thức tỉnh ý thức', 'Tu tập với năng lượng'] } }, crystals: [{ name: 'Carnelian', vietnameseName: 'Mã Não Đỏ', reason: 'Năng lượng và khởi đầu', usage: 'Đeo khi cần can đảm', shopHandle: 'carnelian-tumbled' }], affirmations: ['Tôi sẵn sàng cho mọi thay đổi', 'Sấm sét thức tỉnh sức mạnh trong tôi', 'Tôi can đảm đón nhận bất ngờ'], lineInterpretations: { 1: { text: 'Chấn lai hịch hịch', meaning: 'Sấm đến rầm rầm', advice: 'Sau đó cười nói. Cát.' }, 2: { text: 'Chấn lai lệ', meaning: 'Sấm đến nguy', advice: 'Mất tiền. Đi lên núi. 7 ngày được lại.' }, 3: { text: 'Chấn tô tô', meaning: 'Sấm run rẩy', advice: 'Sấm hành động không tai họa.' }, 4: { text: 'Chấn toại nê', meaning: 'Sấm rơi vào bùn', advice: 'Không được.' }, 5: { text: 'Chấn vãng lai lệ', meaning: 'Sấm đi lại nguy', advice: 'Ý vô tang. Có việc.' }, 6: { text: 'Chấn sách sách', meaning: 'Sấm run run', advice: 'Nhìn xung quanh sợ. Tiến xui. Không đến mình thì không lỗi.' } } },

  52: { id: 52, name: 'Cấn', chineseName: '艮', unicode: '䷳', element: 'Thổ', nature: 'Âm', image: 'Núi chồng Núi', lines: [0, 0, 1, 0, 0, 1], overview: { meaning: 'Quẻ Cấn tượng trưng cho núi, sự dừng lại. Biết khi nào nên dừng, khi nào nên đi.', keywords: ['Dừng lại', 'Tĩnh lặng', 'Chiêm nghiệm', 'Giới hạn', 'Cân bằng'], overallAdvice: 'Đây là lúc cần dừng lại, chiêm nghiệm. Biết dừng là trí tuệ.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Cần dừng lại suy nghĩ. Không vội vàng hành động.', actionSteps: ['Dừng lại chiêm nghiệm', 'Không hành động vội', 'Suy nghĩ kỹ trước khi làm'] }, finance: { title: 'Tài Chính', reading: 'Dừng giao dịch, nghỉ ngơi. Không đầu tư lúc này.', actionSteps: ['Dừng giao dịch', 'Không đầu tư mới', 'Nghỉ ngơi tài chính'] }, love: { title: 'Tình Cảm', reading: 'Dừng lại để suy nghĩ. Cho nhau không gian.', actionSteps: ['Dừng tranh cãi', 'Cho không gian', 'Suy nghĩ về mối quan hệ'] }, health: { title: 'Sức Khỏe', reading: 'Nghỉ ngơi hoàn toàn. Dừng mọi hoạt động quá sức.', actionSteps: ['Nghỉ ngơi hoàn toàn', 'Không gắng sức', 'Thiền định tĩnh tâm'] }, spiritual: { title: 'Tâm Thức', reading: 'Thiền định và tĩnh lặng. Dừng mọi hoạt động.', actionSteps: ['Thiền định sâu', 'Im lặng tuyệt đối', 'Dừng tâm'] } }, crystals: [{ name: 'Jasper', vietnameseName: 'Jasper', reason: 'Grounding và ổn định', usage: 'Thiền định với đá này', shopHandle: 'red-jasper-tumbled' }], affirmations: ['Tôi biết khi nào cần dừng lại', 'Tĩnh lặng mang lại trí tuệ', 'Dừng lại để tiến xa hơn'], lineInterpretations: { 1: { text: 'Cấn kỳ chỉ', meaning: 'Dừng ở ngón chân', advice: 'Không lỗi. Lợi kiên định.' }, 2: { text: 'Cấn kỳ phì', meaning: 'Dừng ở bắp chân', advice: 'Không cứu được. Tâm không vui.' }, 3: { text: 'Cấn kỳ hạn', meaning: 'Dừng ở eo', advice: 'Nguy. Tim nóng.' }, 4: { text: 'Cấn kỳ thân', meaning: 'Dừng ở thân', advice: 'Không lỗi.' }, 5: { text: 'Cấn kỳ phụ', meaning: 'Dừng ở má', advice: 'Lời có thứ tự. Hối hận mất.' }, 6: { text: 'Đôn cấn', meaning: 'Dừng chắc chắn', advice: 'Cát.' } } },

  53: { id: 53, name: 'Tiệm', chineseName: '漸', unicode: '䷴', element: 'Mộc', nature: 'Âm', image: 'Gỗ trên Núi', lines: [0, 0, 1, 0, 1, 1], overview: { meaning: 'Quẻ Tiệm tượng trưng cho sự tiến triển từ từ. Như cây mọc trên núi, phát triển chậm nhưng bền vững.', keywords: ['Từ từ', 'Dần dần', 'Bền vững', 'Tiến triển', 'Kiên nhẫn'], overallAdvice: 'Tiến triển từ từ, từng bước một. Không vội vàng sẽ bền vững.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Tiến triển từ từ trong sự nghiệp. Kiên nhẫn phát triển.', actionSteps: ['Tiến từng bước', 'Không vội thăng tiến', 'Phát triển bền vững'] }, finance: { title: 'Tài Chính', reading: 'Tài chính tăng trưởng từ từ. Đầu tư dài hạn.', actionSteps: ['Đầu tư dài hạn', 'Không đòi lợi nhanh', 'Tích lũy dần dần'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu phát triển từ từ. Không vội vàng cam kết.', actionSteps: ['Phát triển từ từ', 'Không vội vàng', 'Xây dựng dần dần'] }, health: { title: 'Sức Khỏe', reading: 'Sức khỏe cải thiện từ từ. Kiên nhẫn phục hồi.', actionSteps: ['Hồi phục từ từ', 'Không gấp gáp', 'Chăm sóc đều đặn'] }, spiritual: { title: 'Tâm Thức', reading: 'Tu tập từng bước. Giác ngộ dần dần.', actionSteps: ['Tu tập đều đặn', 'Tiến bộ từ từ', 'Kiên nhẫn trên đường'] } }, crystals: [{ name: 'Green Jade', vietnameseName: 'Ngọc Bích', reason: 'Kiên nhẫn và bền vững', usage: 'Đeo để tăng kiên nhẫn', shopHandle: 'green-jade-pendant' }], affirmations: ['Tôi tiến triển từng bước vững chắc', 'Kiên nhẫn mang lại thành công', 'Chậm mà chắc'], lineInterpretations: { 1: { text: 'Hồng tiệm vu can', meaning: 'Ngỗng dần đến bờ', advice: 'Tiểu tử nguy. Có lời. Không lỗi.' }, 2: { text: 'Hồng tiệm vu bàn', meaning: 'Ngỗng dần đến đá', advice: 'Ăn uống vui vẻ. Cát.' }, 3: { text: 'Hồng tiệm vu lục', meaning: 'Ngỗng dần đến đất', advice: 'Chồng đi không về. Vợ có thai không nuôi. Hung.' }, 4: { text: 'Hồng tiệm vu mộc', meaning: 'Ngỗng dần đến cây', advice: 'Có thể được cành. Không lỗi.' }, 5: { text: 'Hồng tiệm vu lăng', meaning: 'Ngỗng dần đến gò', advice: 'Vợ 3 năm không có thai. Cuối cùng không ai thắng. Cát.' }, 6: { text: 'Hồng tiệm vu lục', meaning: 'Ngỗng dần đến mây', advice: 'Lông có thể dùng làm đồ trang trí. Cát.' } } },

  54: { id: 54, name: 'Quy Muội', chineseName: '歸妹', unicode: '䷵', element: 'Kim', nature: 'Âm', image: 'Sấm trên Hồ', lines: [1, 1, 0, 1, 0, 0], overview: { meaning: 'Quẻ Quy Muội tượng trưng cho cô gái về nhà chồng, mối quan hệ phụ thuộc.', keywords: ['Kết hôn', 'Phụ thuộc', 'Cam kết', 'Quan hệ', 'Hy sinh'], overallAdvice: 'Cẩn thận với các cam kết. Đừng vội vàng hoặc chấp nhận vị trí thấp kém.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Có thể bị đặt vào vị trí phụ. Cẩn thận với cam kết.', actionSteps: ['Cẩn thận với hợp đồng', 'Không chấp nhận vị trí thấp', 'Đàm phán tốt hơn'] }, finance: { title: 'Tài Chính', reading: 'Không phải lúc đầu tư lớn. Cẩn thận với partnership.', actionSteps: ['Không đầu tư lớn', 'Cẩn thận với partnership', 'Đọc kỹ hợp đồng'] }, love: { title: 'Tình Cảm', reading: 'Có thể có hôn nhân hoặc cam kết. Nhưng cần cẩn thận.', actionSteps: ['Cân nhắc kỹ cam kết', 'Không vội vàng', 'Đảm bảo bình đẳng'] }, health: { title: 'Sức Khỏe', reading: 'Cẩn thận với sức khỏe. Không phụ thuộc quá nhiều vào thuốc.', actionSteps: ['Không phụ thuộc thuốc', 'Tự chăm sóc bản thân', 'Tìm cân bằng'] }, spiritual: { title: 'Tâm Thức', reading: 'Cẩn thận với sự phụ thuộc tâm thức. Giữ độc lập.', actionSteps: ['Không phụ thuộc mù quáng', 'Giữ độc lập tư duy', 'Cân bằng'] } }, crystals: [{ name: 'Moonstone', vietnameseName: 'Đá Mặt Trăng', reason: 'Cân bằng nữ tính', usage: 'Đeo để cân bằng', shopHandle: 'moonstone-pendant' }], affirmations: ['Tôi chọn các mối quan hệ cân bằng', 'Tôi không chấp nhận vị trí thấp kém', 'Tôi cam kết với sự bình đẳng'], lineInterpretations: { 1: { text: 'Quy muội dĩ đệ', meaning: 'Em gái về nhà chồng như em', advice: 'Có thể đi. Cát.' }, 2: { text: 'Diểu năng thị', meaning: 'Mắt mờ có thể thấy', advice: 'Lợi cho người ẩn dật.' }, 3: { text: 'Quy muội dĩ tu', meaning: 'Em gái về với đợi', advice: 'Quay lại làm em.' }, 4: { text: 'Quy muội khiên kỳ', meaning: 'Em gái trễ hạn', advice: 'Chờ đợi có thời.' }, 5: { text: 'Đế ất quy muội', meaning: 'Vua gả em gái', advice: 'Trăng gần rằm. Cát.' }, 6: { text: 'Nữ thừa khuông vô thực', meaning: 'Phụ nữ mang rổ không có gì', advice: 'Không lợi.' } } },

  55: { id: 55, name: 'Phong', chineseName: '豐', unicode: '䷶', element: 'Hỏa', nature: 'Âm', image: 'Sấm có Lửa', lines: [1, 0, 1, 1, 0, 0], overview: { meaning: 'Quẻ Phong tượng trưng cho sự sung túc, dồi dào. Như mặt trời ở đỉnh cao nhất.', keywords: ['Sung túc', 'Dồi dào', 'Đỉnh cao', 'Thịnh vượng', 'Rực rỡ'], overallAdvice: 'Đây là đỉnh cao của sự thịnh vượng. Tận hưởng nhưng nhớ rằng sau cực thịnh có suy.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Sự nghiệp ở đỉnh cao. Tận hưởng thành công.', actionSteps: ['Tận hưởng thành công', 'Chuẩn bị cho tương lai', 'Không kiêu ngạo'] }, finance: { title: 'Tài Chính', reading: 'Tài chính dồi dào. Thịnh vượng tột đỉnh.', actionSteps: ['Tận hưởng thịnh vượng', 'Để dành cho tương lai', 'Chia sẻ với người khác'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu viên mãn. Hạnh phúc tột đỉnh.', actionSteps: ['Tận hưởng hạnh phúc', 'Tri ân người thân', 'Giữ gìn tình yêu'] }, health: { title: 'Sức Khỏe', reading: 'Sức khỏe tốt nhất. Năng lượng dồi dào.', actionSteps: ['Tận hưởng sức khỏe', 'Duy trì thói quen', 'Không chủ quan'] }, spiritual: { title: 'Tâm Thức', reading: 'Tâm thức sung mãn. Giác ngộ rực rỡ.', actionSteps: ['Tận hưởng ánh sáng', 'Chia sẻ với người khác', 'Không tự mãn'] } }, crystals: [{ name: 'Sunstone', vietnameseName: 'Đá Mặt Trời', reason: 'Thịnh vượng và rực rỡ', usage: 'Đeo khi ở đỉnh cao', shopHandle: 'sunstone-pendant' }], affirmations: ['Tôi tận hưởng sự dồi dào của cuộc sống', 'Tôi biết ơn mọi phước lành', 'Tôi chia sẻ thịnh vượng của mình'], lineInterpretations: { 1: { text: 'Ngộ kỳ phối chủ', meaning: 'Gặp được chủ phối', advice: 'Tuy cùng đẳng cấp. 10 ngày không lỗi.' }, 2: { text: 'Phong kỳ bội', meaning: 'Sung túc đến che', advice: 'Nhật trung thấy Đẩu. Nghi ngờ. Có tin cát.' }, 3: { text: 'Phong kỳ phái', meaning: 'Sung túc đến rèm', advice: 'Nhật trung thấy mờ. Gãy tay phải. Không lỗi.' }, 4: { text: 'Phong kỳ bội', meaning: 'Sung túc đến che', advice: 'Nhật trung thấy Đẩu. Gặp chủ. Cát.' }, 5: { text: 'Lai chương', meaning: 'Đến sáng chói', advice: 'Có khánh. Cát.' }, 6: { text: 'Phong kỳ ốc', meaning: 'Sung túc đến nhà', advice: 'Che nhà. Nhìn vào không có người. 3 năm không thấy. Xui.' } } },

  56: { id: 56, name: 'Lữ', chineseName: '旅', unicode: '䷷', element: 'Hỏa', nature: 'Âm', image: 'Lửa trên Núi', lines: [0, 0, 1, 1, 0, 1], overview: { meaning: 'Quẻ Lữ tượng trưng cho hành trình, du lịch. Như lửa trên núi, di chuyển không ngừng.', keywords: ['Du hành', 'Di chuyển', 'Tạm bợ', 'Thay đổi', 'Khám phá'], overallAdvice: 'Đây là thời kỳ di chuyển, không ổn định. Hành xử như khách, khiêm tốn và cẩn thận.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Có thể có di chuyển công tác. Không ổn định lâu dài.', actionSteps: ['Sẵn sàng di chuyển', 'Linh hoạt thích ứng', 'Không gắn bó quá'] }, finance: { title: 'Tài Chính', reading: 'Tài chính không ổn định. Giữ tiền linh hoạt.', actionSteps: ['Giữ tiền mặt', 'Không đầu tư cố định', 'Linh hoạt tài chính'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu có thể xa cách. Mối quan hệ tạm bợ.', actionSteps: ['Giữ liên lạc', 'Không đòi hỏi cam kết', 'Chấp nhận khoảng cách'] }, health: { title: 'Sức Khỏe', reading: 'Cẩn thận khi di chuyển. Giữ sức khỏe khi đi xa.', actionSteps: ['Mang theo thuốc', 'Cẩn thận ăn uống', 'Nghỉ ngơi đủ'] }, spiritual: { title: 'Tâm Thức', reading: 'Hành trình tâm thức. Khám phá nơi mới.', actionSteps: ['Khám phá đường mới', 'Học hỏi từ nhiều nguồn', 'Không gắn bó'] } }, crystals: [{ name: 'Turquoise', vietnameseName: 'Ngọc Lam', reason: 'Bảo vệ khi du hành', usage: 'Mang theo khi đi xa', shopHandle: 'turquoise-pendant' }], affirmations: ['Tôi an toàn trên mọi hành trình', 'Tôi linh hoạt và thích ứng', 'Du hành mở rộng tâm trí tôi'], lineInterpretations: { 1: { text: 'Lữ toả toả', meaning: 'Du hành vụn vặt', advice: 'Tự mình tìm họa.' }, 2: { text: 'Lữ tức thứ', meaning: 'Du hành đến quán trọ', advice: 'Có tiền. Được tớ trẻ kiên định.' }, 3: { text: 'Lữ phần kỳ thứ', meaning: 'Du hành đốt quán trọ', advice: 'Mất tớ trẻ. Kiên định nguy.' }, 4: { text: 'Lữ vu xử', meaning: 'Du hành đến nơi', advice: 'Được tiền rìu. Tâm không vui.' }, 5: { text: 'Xạ trĩ', meaning: 'Bắn chim trĩ', advice: 'Một mũi tên mất. Cuối cùng được khen.' }, 6: { text: 'Điểu phần kỳ sào', meaning: 'Chim đốt tổ', advice: 'Du hành trước cười sau khóc. Mất bò dễ. Xui.' } } },

  57: { id: 57, name: 'Tốn', chineseName: '巽', unicode: '䷸', element: 'Mộc', nature: 'Âm', image: 'Gió chồng Gió', lines: [0, 1, 1, 0, 1, 1], overview: { meaning: 'Quẻ Tốn tượng trưng cho gió, sự nhẹ nhàng và thấm nhuần. Gió đi vào mọi ngõ ngách.', keywords: ['Nhẹ nhàng', 'Thấm nhuần', 'Mềm mỏng', 'Ảnh hưởng', 'Kiên trì'], overallAdvice: 'Hành động nhẹ nhàng nhưng kiên trì. Như gió, mềm mại nhưng đi đến mọi nơi.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Tiếp cận mềm mỏng. Ảnh hưởng từ từ.', actionSteps: ['Tiếp cận nhẹ nhàng', 'Kiên trì không ép', 'Ảnh hưởng từ từ'] }, finance: { title: 'Tài Chính', reading: 'Tích lũy từ từ. Không mạo hiểm.', actionSteps: ['Tích lũy dần dần', 'Không đầu cơ', 'Kiên nhẫn'] }, love: { title: 'Tình Cảm', reading: 'Tiếp cận nhẹ nhàng. Từ từ chiếm cảm tình.', actionSteps: ['Nhẹ nhàng tiếp cận', 'Không ép buộc', 'Kiên nhẫn'] }, health: { title: 'Sức Khỏe', reading: 'Điều trị nhẹ nhàng. Phương pháp tự nhiên.', actionSteps: ['Dùng phương pháp nhẹ', 'Không cực đoan', 'Kiên trì điều trị'] }, spiritual: { title: 'Tâm Thức', reading: 'Tu tập nhẹ nhàng. Thấm nhuần từ từ.', actionSteps: ['Tu tập nhẹ nhàng', 'Không gượng ép', 'Thấm nhuần dần'] } }, crystals: [{ name: 'Selenite', vietnameseName: 'Selenite', reason: 'Nhẹ nhàng và thanh lọc', usage: 'Thiền định với đá này', shopHandle: 'selenite-wand' }], affirmations: ['Tôi nhẹ nhàng nhưng kiên trì', 'Như gió, tôi đi đến mọi nơi', 'Mềm mại nhưng không yếu đuối'], lineInterpretations: { 1: { text: 'Tiến thoái', meaning: 'Tiến rồi lùi', advice: 'Lợi cho sự kiên định của võ sĩ.' }, 2: { text: 'Tốn tại sàng hạ', meaning: 'Gió dưới giường', advice: 'Dùng sử vu. Cát không lỗi.' }, 3: { text: 'Tần tốn', meaning: 'Gió liên tục', advice: 'Xấu hổ.' }, 4: { text: 'Hối vong', meaning: 'Hối hận mất đi', advice: 'Săn được 3 loại.' }, 5: { text: 'Trinh cát hối vong', meaning: 'Kiên định cát, hối hận mất', advice: 'Không gì không lợi. Không có đầu có cuối.' }, 6: { text: 'Tốn tại sàng hạ', meaning: 'Gió dưới giường', advice: 'Mất tiền rìu. Kiên định xui.' } } },

  58: { id: 58, name: 'Đoài', chineseName: '兌', unicode: '䷹', element: 'Kim', nature: 'Dương', image: 'Hồ chồng Hồ', lines: [1, 1, 0, 1, 1, 0], overview: { meaning: 'Quẻ Đoài tượng trưng cho hồ nước, niềm vui và sự giao tiếp. Hai hồ kết nối, chia sẻ.', keywords: ['Vui vẻ', 'Giao tiếp', 'Chia sẻ', 'Kết nối', 'Hài lòng'], overallAdvice: 'Đây là thời kỳ vui vẻ và kết nối. Chia sẻ niềm vui với người khác.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Giao tiếp tốt mang lại thành công. Hợp tác vui vẻ.', actionSteps: ['Giao tiếp tích cực', 'Hợp tác với người khác', 'Chia sẻ thành công'] }, finance: { title: 'Tài Chính', reading: 'Tài chính thuận lợi. Chia sẻ và kết nối.', actionSteps: ['Chia sẻ kiến thức', 'Kết nối với người khác', 'Vui vẻ với tiền'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu vui vẻ. Giao tiếp tốt với nhau.', actionSteps: ['Vui vẻ với nhau', 'Giao tiếp cởi mở', 'Chia sẻ niềm vui'] }, health: { title: 'Sức Khỏe', reading: 'Sức khỏe tốt. Tâm trạng vui vẻ.', actionSteps: ['Cười nhiều hơn', 'Giao tiếp xã hội', 'Vui vẻ sống'] }, spiritual: { title: 'Tâm Thức', reading: 'Tâm thức vui vẻ. Chia sẻ với cộng đồng.', actionSteps: ['Tu tập vui vẻ', 'Chia sẻ kinh nghiệm', 'Kết nối tâm thức'] } }, crystals: [{ name: 'Blue Lace Agate', vietnameseName: 'Mã Não Xanh Lơ', reason: 'Giao tiếp và vui vẻ', usage: 'Đeo khi giao tiếp', shopHandle: 'blue-lace-agate-tumbled' }], affirmations: ['Niềm vui tỏa ra từ tôi', 'Giao tiếp mang lại kết nối', 'Tôi chia sẻ hạnh phúc của mình'], lineInterpretations: { 1: { text: 'Hòa đoài', meaning: 'Hài hòa vui vẻ', advice: 'Cát.' }, 2: { text: 'Phu đoài', meaning: 'Thành thật vui vẻ', advice: 'Cát. Hối hận mất.' }, 3: { text: 'Lai đoài', meaning: 'Đến vui vẻ', advice: 'Xui.' }, 4: { text: 'Thương đoài vị ninh', meaning: 'Bàn vui chưa yên', advice: 'Có bệnh. Vui thì có mừng.' }, 5: { text: 'Phu vu bác', meaning: 'Tin vào sự bóc lột', advice: 'Có nguy.' }, 6: { text: 'Dẫn đoài', meaning: 'Kéo dài vui vẻ', advice: 'Chưa chiếm.' } } },

  59: { id: 59, name: 'Hoán', chineseName: '渙', unicode: '䷺', element: 'Thủy', nature: 'Âm', image: 'Gió trên Nước', lines: [0, 1, 0, 0, 1, 1], overview: { meaning: 'Quẻ Hoán tượng trưng cho sự phân tán, tan rã. Gió thổi trên nước, làm tan đám mây.', keywords: ['Phân tán', 'Tan rã', 'Giải tỏa', 'Chia sẻ', 'Mở rộng'], overallAdvice: 'Phân tán những gì tích tụ. Chia sẻ và lan tỏa năng lượng.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Có thể cần phân tán, mở rộng. Đừng tập trung quá.', actionSteps: ['Mở rộng thị trường', 'Phân tán rủi ro', 'Đừng bỏ trứng một giỏ'] }, finance: { title: 'Tài Chính', reading: 'Đa dạng hóa đầu tư. Phân tán portfolio.', actionSteps: ['Đa dạng hóa', 'Phân tán rủi ro', 'Không tập trung quá'] }, love: { title: 'Tình Cảm', reading: 'Có thể có khoảng cách. Chia sẻ và mở lòng.', actionSteps: ['Chia sẻ cảm xúc', 'Mở lòng với nhau', 'Đừng giữ trong lòng'] }, health: { title: 'Sức Khỏe', reading: 'Giải tỏa năng lượng tích tụ. Thở sâu và thư giãn.', actionSteps: ['Giải tỏa stress', 'Thở sâu', 'Thư giãn cơ thể'] }, spiritual: { title: 'Tâm Thức', reading: 'Lan tỏa ánh sáng. Chia sẻ với mọi người.', actionSteps: ['Lan tỏa tình yêu', 'Chia sẻ kiến thức', 'Mở rộng ảnh hưởng'] } }, crystals: [{ name: 'Clear Quartz', vietnameseName: 'Thạch Anh Trắng', reason: 'Lan tỏa và thanh lọc', usage: 'Thiền định với đá này', shopHandle: 'clear-quartz-point' }], affirmations: ['Tôi lan tỏa năng lượng tích cực', 'Chia sẻ làm tăng gấp đôi', 'Tôi mở rộng ảnh hưởng tốt'], lineInterpretations: { 1: { text: 'Dụng chửng mã tráng', meaning: 'Dùng ngựa mạnh cứu', advice: 'Cát.' }, 2: { text: 'Hoán bôn kỳ kỷ', meaning: 'Tan chạy về chỗ dựa', advice: 'Hối hận mất.' }, 3: { text: 'Hoán kỳ cung', meaning: 'Tan thân mình', advice: 'Không hối hận.' }, 4: { text: 'Hoán kỳ quần', meaning: 'Tan đàn', advice: 'Đại cát. Tan có gò. Ngoài suy nghĩ thường.' }, 5: { text: 'Hoán hãn kỳ đại hiệu', meaning: 'Tan mồ hôi, kêu lớn', advice: 'Vua ở. Không lỗi.' }, 6: { text: 'Hoán kỳ huyết', meaning: 'Tan máu', advice: 'Đi xa. Không lỗi.' } } },

  60: { id: 60, name: 'Tiết', chineseName: '節', unicode: '䷻', element: 'Thủy', nature: 'Âm', image: 'Nước trên Hồ', lines: [1, 1, 0, 0, 1, 0], overview: { meaning: 'Quẻ Tiết tượng trưng cho sự tiết chế, giới hạn. Hồ chứa nước có bờ, biết giới hạn.', keywords: ['Tiết chế', 'Giới hạn', 'Điều độ', 'Kỷ luật', 'Cân bằng'], overallAdvice: 'Biết giới hạn và tiết chế. Điều độ trong mọi việc.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Cần tiết chế trong công việc. Đừng làm quá sức.', actionSteps: ['Biết giới hạn', 'Không làm quá', 'Work-life balance'] }, finance: { title: 'Tài Chính', reading: 'Tiết kiệm và tiết chế chi tiêu. Sống trong ngân sách.', actionSteps: ['Tiết kiệm', 'Sống theo ngân sách', 'Không tiêu quá mức'] }, love: { title: 'Tình Cảm', reading: 'Tiết chế cảm xúc. Không quá đòi hỏi.', actionSteps: ['Tiết chế đòi hỏi', 'Cho không gian', 'Biết điểm dừng'] }, health: { title: 'Sức Khỏe', reading: 'Ăn uống điều độ. Tập luyện vừa phải.', actionSteps: ['Ăn uống điều độ', 'Tập vừa phải', 'Ngủ đúng giờ'] }, spiritual: { title: 'Tâm Thức', reading: 'Tu tập có kỷ luật. Tiết chế ham muốn.', actionSteps: ['Kỷ luật tu tập', 'Tiết chế ham muốn', 'Điều độ'] } }, crystals: [{ name: 'Fluorite', vietnameseName: 'Huỳnh Thạch', reason: 'Kỷ luật và tập trung', usage: 'Đặt trên bàn làm việc', shopHandle: 'fluorite-cluster' }], affirmations: ['Tôi biết giới hạn của mình', 'Điều độ mang lại cân bằng', 'Tôi tiết chế trong mọi việc'], lineInterpretations: { 1: { text: 'Bất xuất hộ đình', meaning: 'Không ra khỏi cửa sân', advice: 'Không lỗi.' }, 2: { text: 'Bất xuất môn đình', meaning: 'Không ra khỏi cửa', advice: 'Xui.' }, 3: { text: 'Bất tiết nhược', meaning: 'Không tiết chế', advice: 'Sẽ than. Không lỗi.' }, 4: { text: 'An tiết', meaning: 'Tiết chế an bình', advice: 'Hanh.' }, 5: { text: 'Cam tiết', meaning: 'Tiết chế ngọt ngào', advice: 'Cát. Đi được khen.' }, 6: { text: 'Khổ tiết', meaning: 'Tiết chế đắng', advice: 'Kiên định xui. Hối hận mất.' } } },

  61: { id: 61, name: 'Trung Phu', chineseName: '中孚', unicode: '䷼', element: 'Mộc', nature: 'Dương', image: 'Gió trên Hồ', lines: [1, 1, 0, 0, 1, 1], overview: { meaning: 'Quẻ Trung Phu tượng trưng cho lòng thành bên trong. Gió trên hồ, cảm ứng từ tâm.', keywords: ['Lòng thành', 'Chân thật', 'Tin cậy', 'Đáng tin', 'Trung thực'], overallAdvice: 'Hành động với lòng thành. Sự chân thật cảm hóa được mọi người.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Lòng thành mang lại thành công. Đáng tin cậy.', actionSteps: ['Hành động chân thật', 'Giữ lời hứa', 'Xây dựng uy tín'] }, finance: { title: 'Tài Chính', reading: 'Giao dịch với lòng thành. Uy tín là vốn.', actionSteps: ['Giữ uy tín', 'Không gian dối', 'Thành thật trong giao dịch'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu chân thành. Tin tưởng lẫn nhau.', actionSteps: ['Thành thật với nhau', 'Xây dựng niềm tin', 'Không giấu diếm'] }, health: { title: 'Sức Khỏe', reading: 'Lắng nghe cơ thể thật sự. Không tự dối.', actionSteps: ['Thật sự lắng nghe cơ thể', 'Không tự dối', 'Chân thật với sức khỏe'] }, spiritual: { title: 'Tâm Thức', reading: 'Tu tập với lòng thành. Không giả tạo.', actionSteps: ['Tu tập chân thành', 'Không phô trương', 'Thật sự thực hành'] } }, crystals: [{ name: 'Lapis Lazuli', vietnameseName: 'Thanh Kim Thạch', reason: 'Sự thật và trí tuệ', usage: 'Đeo khi cần sự thật', shopHandle: 'lapis-lazuli-pendant' }], affirmations: ['Lòng thành là sức mạnh của tôi', 'Tôi sống chân thật mỗi ngày', 'Sự thật cảm hóa mọi người'], lineInterpretations: { 1: { text: 'Ngu cát', meaning: 'Chuẩn bị cát', advice: 'Có khác sẽ không yên.' }, 2: { text: 'Minh hạc tại âm', meaning: 'Hạc kêu trong bóng tối', advice: 'Con theo hòa. Có cái đẹp chia sẻ.' }, 3: { text: 'Đắc địch', meaning: 'Có kẻ địch', advice: 'Hoặc trống, hoặc ngừng, hoặc khóc, hoặc ca.' }, 4: { text: 'Nguyệt cơ vọng', meaning: 'Trăng gần rằm', advice: 'Ngựa mất bạn. Không lỗi.' }, 5: { text: 'Hữu phu loan như', meaning: 'Có lòng thành liên kết', advice: 'Không lỗi.' }, 6: { text: 'Hàn âm đăng vu thiên', meaning: 'Tiếng gà lên trời', advice: 'Kiên định xui.' } } },

  62: { id: 62, name: 'Tiểu Quá', chineseName: '小過', unicode: '䷽', element: 'Mộc', nature: 'Âm', image: 'Sấm trên Núi', lines: [0, 0, 1, 1, 0, 0], overview: { meaning: 'Quẻ Tiểu Quá tượng trưng cho sự quá mức nhỏ. Như chim bay qua, vượt quá một chút.', keywords: ['Quá mức nhỏ', 'Thận trọng', 'Khiêm tốn', 'Giữ mức thấp', 'Cẩn thận'], overallAdvice: 'Đây là lúc cần cẩn thận, giữ ở mức thấp. Không phải lúc cho hành động lớn.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Làm việc nhỏ, không làm việc lớn. Cẩn thận.', actionSteps: ['Làm việc nhỏ', 'Không mạo hiểm lớn', 'Giữ low profile'] }, finance: { title: 'Tài Chính', reading: 'Không đầu tư lớn. Tiết kiệm nhỏ.', actionSteps: ['Tiết kiệm nhỏ', 'Không đầu tư lớn', 'Cẩn thận chi tiêu'] }, love: { title: 'Tình Cảm', reading: 'Cử chỉ nhỏ quan trọng. Không đại sự.', actionSteps: ['Quan tâm nhỏ', 'Không hứa lớn', 'Cẩn thận lời nói'] }, health: { title: 'Sức Khỏe', reading: 'Chú ý những điều nhỏ. Phòng bệnh hơn chữa bệnh.', actionSteps: ['Chú ý chi tiết nhỏ', 'Phòng bệnh', 'Không chủ quan'] }, spiritual: { title: 'Tâm Thức', reading: 'Tu tập trong việc nhỏ. Đạo ở đời thường.', actionSteps: ['Tu trong việc nhỏ', 'Không cầu cao siêu', 'Khiêm tốn tu tập'] } }, crystals: [{ name: 'Obsidian', vietnameseName: 'Obsidian', reason: 'Bảo vệ và cẩn thận', usage: 'Mang theo để bảo vệ', shopHandle: 'black-obsidian-sphere' }], affirmations: ['Tôi cẩn thận trong mọi việc', 'Việc nhỏ làm nên việc lớn', 'Khiêm tốn là sức mạnh'], lineInterpretations: { 1: { text: 'Phi điểu dĩ hung', meaning: 'Chim bay mang điềm xấu', advice: 'Có xui.' }, 2: { text: 'Quá kỳ tổ', meaning: 'Qua tổ tiên', advice: 'Gặp bà không gặp ông. Không đến vua, gặp bề tôi. Không lỗi.' }, 3: { text: 'Phất quá phòng chi', meaning: 'Không quá phòng bị', advice: 'Theo mà đánh. Xui.' }, 4: { text: 'Vô cữu', meaning: 'Không lỗi', advice: 'Gặp không quá. Đi nguy. Phải răn. Không dùng kiên định.' }, 5: { text: 'Mật vân bất vũ', meaning: 'Mây dày không mưa', advice: 'Từ phương Tây. Công bắn được trong hang.' }, 6: { text: 'Phất ngộ quá chi', meaning: 'Không gặp mà qua', advice: 'Chim bay lưới. Xui. Họa tai.' } } },

  63: { id: 63, name: 'Ký Tế', chineseName: '既濟', unicode: '䷾', element: 'Thủy', nature: 'Âm', image: 'Nước trên Lửa', lines: [1, 0, 1, 0, 1, 0], overview: { meaning: 'Quẻ Ký Tế tượng trưng cho sự hoàn thành. Nước trên lửa, đúng vị trí, mọi thứ hoàn tất.', keywords: ['Hoàn thành', 'Hoàn hảo', 'Cân bằng', 'Thành công', 'Kết thúc'], overallAdvice: 'Mọi thứ đã hoàn thành. Nhưng sau hoàn thành có sự xuống dốc. Cẩn thận duy trì.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Dự án hoàn thành. Nhưng cần duy trì thành quả.', actionSteps: ['Hoàn thành dự án', 'Duy trì thành quả', 'Chuẩn bị cho giai đoạn mới'] }, finance: { title: 'Tài Chính', reading: 'Mục tiêu tài chính đạt được. Duy trì và bảo vệ.', actionSteps: ['Bảo vệ thành quả', 'Không tự mãn', 'Duy trì kỷ luật'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu viên mãn. Nhưng cần duy trì.', actionSteps: ['Duy trì tình yêu', 'Không tự mãn', 'Tiếp tục chăm sóc'] }, health: { title: 'Sức Khỏe', reading: 'Sức khỏe tốt. Duy trì thói quen.', actionSteps: ['Duy trì thói quen', 'Không chủ quan', 'Tiếp tục chăm sóc'] }, spiritual: { title: 'Tâm Thức', reading: 'Đạt được mức độ cao. Nhưng cần tiếp tục.', actionSteps: ['Duy trì tu tập', 'Không tự mãn', 'Tiếp tục phát triển'] } }, crystals: [{ name: 'Ametrine', vietnameseName: 'Ametrine', reason: 'Cân bằng hoàn hảo', usage: 'Thiền định với đá này', shopHandle: 'ametrine-pendant' }], affirmations: ['Tôi đã hoàn thành và đang duy trì', 'Thành công cần được bảo vệ', 'Tôi tiếp tục phát triển'], lineInterpretations: { 1: { text: 'Duệ kỳ luân', meaning: 'Kéo bánh xe', advice: 'Ướt đuôi. Không lỗi.' }, 2: { text: 'Phụ táng kỳ phất', meaning: 'Vợ mất rèm', advice: 'Đừng đuổi. 7 ngày được.' }, 3: { text: 'Cao tông phạt quỷ phương', meaning: 'Cao Tông đánh Quỷ Phương', advice: '3 năm mới thắng. Tiểu nhân không dùng.' }, 4: { text: 'Nhu hữu y', meaning: 'Vải có lót', advice: 'Cả ngày cảnh giác.' }, 5: { text: 'Đông lân sát ngưu', meaning: 'Láng giềng Đông giết bò', advice: 'Không bằng láng giềng Tây tế lễ nhỏ. Thật sự nhận phúc.' }, 6: { text: 'Nhu kỳ thủ', meaning: 'Ướt đầu', advice: 'Nguy.' } } },

  64: { id: 64, name: 'Vị Tế', chineseName: '未濟', unicode: '䷿', element: 'Hỏa', nature: 'Dương', image: 'Lửa trên Nước', lines: [0, 1, 0, 1, 0, 1], overview: { meaning: 'Quẻ Vị Tế tượng trưng cho sự chưa hoàn thành. Lửa trên nước, chưa đúng vị trí, còn phải làm.', keywords: ['Chưa xong', 'Tiếp tục', 'Tiềm năng', 'Cơ hội', 'Phát triển'], overallAdvice: 'Mọi thứ chưa hoàn thành nhưng đầy tiềm năng. Tiếp tục nỗ lực.' }, interpretations: { career: { title: 'Sự Nghiệp', reading: 'Công việc chưa xong nhưng có tiềm năng. Tiếp tục.', actionSteps: ['Tiếp tục nỗ lực', 'Không bỏ cuộc', 'Phát triển tiềm năng'] }, finance: { title: 'Tài Chính', reading: 'Mục tiêu tài chính chưa đạt nhưng có cơ hội. Kiên trì.', actionSteps: ['Kiên trì theo đuổi', 'Không bỏ cuộc', 'Phát triển cơ hội'] }, love: { title: 'Tình Cảm', reading: 'Tình yêu đang phát triển. Còn nhiều để khám phá.', actionSteps: ['Tiếp tục phát triển', 'Không vội kết luận', 'Khám phá cùng nhau'] }, health: { title: 'Sức Khỏe', reading: 'Sức khỏe đang cải thiện. Tiếp tục nỗ lực.', actionSteps: ['Tiếp tục chăm sóc', 'Không bỏ cuộc', 'Kiên trì tập luyện'] }, spiritual: { title: 'Tâm Thức', reading: 'Con đường tâm thức còn dài. Tiếp tục tu tập.', actionSteps: ['Tiếp tục tu tập', 'Không tự mãn', 'Hành trình còn dài'] } }, crystals: [{ name: 'Labradorite', vietnameseName: 'Labradorite', reason: 'Tiềm năng và transformation', usage: 'Đeo khi cần động lực', shopHandle: 'labradorite-pendant' }], affirmations: ['Hành trình của tôi vẫn tiếp tục', 'Tiềm năng vô hạn đang chờ tôi', 'Mỗi bước là một tiến bộ'], lineInterpretations: { 1: { text: 'Nhu kỳ vĩ', meaning: 'Ướt đuôi', advice: 'Xấu hổ.' }, 2: { text: 'Duệ kỳ luân', meaning: 'Kéo bánh xe', advice: 'Kiên định cát.' }, 3: { text: 'Vị tế', meaning: 'Chưa hoàn thành', advice: 'Tiến xui. Lợi vượt sông lớn.' }, 4: { text: 'Trinh cát hối vong', meaning: 'Kiên định cát, hối hận mất', advice: 'Chấn động đánh Quỷ Phương. 3 năm được thưởng đất lớn.' }, 5: { text: 'Trinh cát', meaning: 'Kiên định cát', advice: 'Không hối hận. Ánh sáng quân tử. Có lòng thành. Cát.' }, 6: { text: 'Hữu phu vu ẩm tửu', meaning: 'Có lòng thành khi uống rượu', advice: 'Không lỗi. Nếu ướt đầu thì mất lòng thành.' } } },
};

// Helper function để lấy quẻ theo ID
export const getHexagram = (id) => HEXAGRAMS[id] || null;

// Helper function để lấy random quẻ
export const getRandomHexagram = () => {
  const ids = Object.keys(HEXAGRAMS);
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  return HEXAGRAMS[randomId];
};

// Export default
export default HEXAGRAMS;
