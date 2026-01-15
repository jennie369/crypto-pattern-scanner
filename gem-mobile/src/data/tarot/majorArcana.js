/**
 * TAROT MAJOR ARCANA - 22 LÁ BÀI
 * Dữ liệu chi tiết cho GEM Master Tarot Reading
 * Bao gồm: upright/reversed, crystals, affirmations
 */

export const MAJOR_ARCANA = [
  // ===== 0. THE FOOL =====
  {
    id: 0,
    name: 'The Fool',
    vietnameseName: 'Kẻ Khờ',
    element: 'Air',
    planet: 'Uranus',
    zodiac: null,
    keywords: ['khởi đầu mới', 'ngây thơ', 'tự do', 'phiêu lưu', 'tiềm năng'],

    upright: {
      overview: 'The Fool đại diện cho sự khởi đầu mới, bước nhảy vọt của niềm tin. Bạn đang ở ngưỡng cửa của một cuộc phiêu lưu thú vị, hãy tin vào bản năng và dám mạo hiểm.',
      career: {
        reading: 'Đây là thời điểm tuyệt vời để bắt đầu con đường sự nghiệp mới, startup hoặc dự án sáng tạo. Đừng để sợ hãi cản trở bạn.',
        actionSteps: ['Đăng ký khóa học hoặc chứng chỉ mới', 'Tìm kiếm cơ hội trong lĩnh vực bạn đam mê', 'Networking với người mới']
      },
      finance: {
        reading: 'Thời điểm mở rộng tầm nhìn tài chính, có thể xem xét đầu tư mới. Tuy nhiên, hãy cẩn thận không đặt tất cả trứng vào một giỏ.',
        actionSteps: ['Nghiên cứu cơ hội đầu tư mới', 'Lập quỹ dự phòng cho rủi ro', 'Học hỏi từ những nhà đầu tư có kinh nghiệm']
      },
      love: {
        reading: 'Mở lòng đón nhận tình yêu mới hoặc làm mới mối quan hệ hiện tại. Hãy spontaneous và vui vẻ trong tình cảm.',
        actionSteps: ['Thử những trải nghiệm mới cùng đối phương', 'Bỏ qua những kỳ vọng cứng nhắc', 'Tận hưởng khoảnh khắc hiện tại']
      },
      health: {
        reading: 'Bắt đầu lối sống mới lành mạnh hơn. Đây là thời điểm tốt để thử những phương pháp wellness mới.',
        actionSteps: ['Thử một môn thể thao mới', 'Bắt đầu thói quen thiền định', 'Khám phá chế độ ăn uống lành mạnh']
      },
      spiritual: {
        reading: 'Bạn đang bắt đầu hành trình tâm thức mới. Hãy cởi mở với những bài học và trải nghiệm mà vũ trụ gửi đến.',
        actionSteps: ['Bắt đầu viết nhật ký tâm thức', 'Tham gia workshop hoặc khóa tu', 'Khám phá những triết lý mới']
      }
    },

    reversed: {
      overview: 'The Fool ngược cảnh báo về sự liều lĩnh thiếu suy nghĩ, không tính toán rủi ro. Bạn có thể đang bỏ lỡ cơ hội vì sợ hãi hoặc đang quá bất cẩn.',
      warning: 'Đừng đưa ra quyết định quan trọng khi chưa đủ thông tin. Sự ngây thơ có thể dẫn đến hậu quả không mong muốn.',
      advice: 'Cân bằng giữa mạo hiểm và thận trọng. Lắng nghe lời khuyên từ người có kinh nghiệm trước khi hành động.'
    },

    crystals: [
      { name: 'Clear Quartz', vietnameseName: 'Thạch Anh Trắng', reason: 'Khuếch đại năng lượng mới, làm sáng tỏ con đường', shopHandle: 'clear-quartz' },
      { name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Mang lại may mắn cho khởi đầu mới', shopHandle: 'citrine' },
      { name: 'Aventurine', vietnameseName: 'Aventurine Xanh', reason: 'Thu hút cơ hội và vận may', shopHandle: 'green-aventurine' }
    ],

    affirmations: [
      'Tôi tin tưởng vào hành trình của mình',
      'Mỗi bước đi là một khởi đầu mới đầy tiềm năng',
      'Tôi cởi mở đón nhận những điều kỳ diệu của cuộc sống',
      'Tôi dũng cảm theo đuổi giấc mơ của mình'
    ]
  },

  // ===== 1. THE MAGICIAN =====
  {
    id: 1,
    name: 'The Magician',
    vietnameseName: 'Nhà Ảo Thuật',
    element: 'Air',
    planet: 'Mercury',
    zodiac: null,
    keywords: ['sức mạnh ý chí', 'biểu hiện', 'nguồn lực', 'kỹ năng', 'hành động'],

    upright: {
      overview: 'The Magician cho thấy bạn có đủ mọi nguồn lực cần thiết để biến ước mơ thành hiện thực. Đây là thời điểm của sức mạnh ý chí và khả năng manifestation.',
      career: {
        reading: 'Bạn có tất cả kỹ năng cần thiết để thành công. Hãy tự tin thể hiện năng lực và nắm bắt cơ hội.',
        actionSteps: ['Trình bày ý tưởng với cấp trên', 'Hoàn thiện portfolio hoặc CV', 'Đàm phán để có điều kiện tốt hơn']
      },
      finance: {
        reading: 'Thời điểm tốt để thực hiện kế hoạch tài chính. Bạn có khả năng biến ý tưởng thành lợi nhuận.',
        actionSteps: ['Lập kế hoạch đầu tư chi tiết', 'Đa dạng hóa nguồn thu nhập', 'Áp dụng kiến thức tài chính đã học']
      },
      love: {
        reading: 'Bạn có sức hút mạnh mẽ. Hãy chủ động trong tình cảm và thể hiện sự quan tâm một cách chân thành.',
        actionSteps: ['Chủ động tạo dựng mối quan hệ', 'Thể hiện sự quan tâm bằng hành động', 'Giao tiếp rõ ràng về mong muốn']
      },
      health: {
        reading: 'Bạn có năng lượng và động lực để cải thiện sức khỏe. Mind-body connection rất mạnh mẽ.',
        actionSteps: ['Visualization cho mục tiêu sức khỏe', 'Kết hợp nhiều phương pháp wellness', 'Tin tưởng vào khả năng tự chữa lành']
      },
      spiritual: {
        reading: 'Bạn đang kết nối với nguồn năng lượng vũ trụ. Thực hành manifestation sẽ mang lại kết quả tốt.',
        actionSteps: ['Thực hành Law of Attraction', 'Tạo altar hoặc không gian thiêng liêng', 'Làm việc với các nguyên tố (đất, nước, lửa, gió)']
      }
    },

    reversed: {
      overview: 'The Magician ngược cho thấy năng lượng bị phân tán, thiếu tập trung hoặc sử dụng sai mục đích. Có thể có sự thao túng hoặc lừa dối.',
      warning: 'Cẩn thận với những người có vẻ quá tốt để là thật. Kiểm tra lại động cơ của bản thân và người khác.',
      advice: 'Tập trung năng lượng vào một mục tiêu cụ thể. Đảm bảo bạn sử dụng kỹ năng cho mục đích tốt.'
    },

    crystals: [
      { name: 'Tiger Eye', vietnameseName: 'Mắt Hổ', reason: 'Tăng cường ý chí và sự tập trung', shopHandle: 'tiger-eye' },
      { name: 'Carnelian', vietnameseName: 'Carnelian', reason: 'Kích thích sự sáng tạo và hành động', shopHandle: 'carnelian' },
      { name: 'Labradorite', vietnameseName: 'Labradorite', reason: 'Kết nối với năng lượng huyền bí', shopHandle: 'labradorite' }
    ],

    affirmations: [
      'Tôi có đủ mọi nguồn lực cần thiết để thành công',
      'Ý chí của tôi mạnh mẽ và rõ ràng',
      'Tôi biến ý tưởng thành hiện thực',
      'Năng lượng của tôi tạo ra điều kỳ diệu'
    ]
  },

  // ===== 2. THE HIGH PRIESTESS =====
  {
    id: 2,
    name: 'The High Priestess',
    vietnameseName: 'Nữ Tư Tế',
    element: 'Water',
    planet: 'Moon',
    zodiac: null,
    keywords: ['trực giác', 'bí ẩn', 'tiềm thức', 'nữ tính thiêng liêng', 'tri thức ẩn giấu'],

    upright: {
      overview: 'The High Priestess kêu gọi bạn lắng nghe trực giác và khám phá thế giới nội tâm. Câu trả lời bạn tìm kiếm nằm bên trong.',
      career: {
        reading: 'Tin vào trực giác khi đưa ra quyết định nghề nghiệp. Có thể có thông tin quan trọng chưa được tiết lộ.',
        actionSteps: ['Quan sát kỹ môi trường làm việc', 'Tin vào cảm giác về người và tình huống', 'Đợi thêm thông tin trước khi quyết định lớn']
      },
      finance: {
        reading: 'Không vội vàng đầu tư. Hãy nghiên cứu kỹ và tin vào trực giác về những cơ hội.',
        actionSteps: ['Nghiên cứu sâu trước khi đầu tư', 'Lắng nghe cảm giác về các giao dịch', 'Tìm kiếm thông tin ẩn hoặc chưa công bố']
      },
      love: {
        reading: 'Khám phá chiều sâu cảm xúc trong mối quan hệ. Có thể có những điều chưa được nói ra.',
        actionSteps: ['Lắng nghe điều đối phương không nói', 'Tin vào trực giác về mối quan hệ', 'Tạo không gian cho sự thân mật tinh thần']
      },
      health: {
        reading: 'Chú ý đến những tín hiệu từ cơ thể. Sức khỏe hormone và chu kỳ cần được quan tâm.',
        actionSteps: ['Theo dõi chu kỳ cơ thể', 'Thực hành thiền định thường xuyên', 'Khám phá các phương pháp chữa lành toàn diện']
      },
      spiritual: {
        reading: 'Bạn đang được mời gọi đi sâu hơn vào hành trình tâm thức. Thực hành với mặt trăng và nước sẽ có lợi.',
        actionSteps: ['Thực hành moon rituals', 'Phát triển khả năng psychic', 'Ghi chép và phân tích giấc mơ']
      }
    },

    reversed: {
      overview: 'The High Priestess ngược cho thấy bạn đang bỏ qua trực giác hoặc có bí mật đang được che giấu.',
      warning: 'Đừng để người khác thao túng hoặc giấu giếm thông tin quan trọng. Tin vào bản năng của bạn.',
      advice: 'Dành thời gian yên tĩnh để kết nối lại với trực giác. Đừng ép buộc câu trả lời - hãy để nó tự đến.'
    },

    crystals: [
      { name: 'Moonstone', vietnameseName: 'Đá Mặt Trăng', reason: 'Tăng cường trực giác và kết nối với năng lượng mặt trăng', shopHandle: 'moonstone' },
      { name: 'Amethyst', vietnameseName: 'Thạch Anh Tím', reason: 'Mở third eye và phát triển tâm thức', shopHandle: 'amethyst' },
      { name: 'Lapis Lazuli', vietnameseName: 'Thanh Kim Thạch', reason: 'Tiếp cận tri thức ẩn giấu', shopHandle: 'lapis-lazuli' }
    ],

    affirmations: [
      'Tôi tin tưởng vào trực giác của mình',
      'Tri thức bên trong tôi là nguồn hướng dẫn đáng tin cậy',
      'Tôi kết nối sâu sắc với tiềm thức',
      'Bí ẩn của vũ trụ đang dần hé lộ với tôi'
    ]
  },

  // ===== 3. THE EMPRESS =====
  {
    id: 3,
    name: 'The Empress',
    vietnameseName: 'Hoàng Hậu',
    element: 'Earth',
    planet: 'Venus',
    zodiac: null,
    keywords: ['sung túc', 'nuôi dưỡng', 'sáng tạo', 'nữ tính', 'thiên nhiên'],

    upright: {
      overview: 'The Empress đại diện cho sự sung túc, sinh sôi và nuôi dưỡng. Đây là thời điểm của sự phát triển, sáng tạo và tận hưởng vẻ đẹp cuộc sống.',
      career: {
        reading: 'Các dự án sáng tạo sẽ flourish. Môi trường làm việc nuôi dưỡng và hỗ trợ sự phát triển.',
        actionSteps: ['Theo đuổi dự án sáng tạo', 'Tạo môi trường làm việc thoải mái', 'Mentoring hoặc hỗ trợ đồng nghiệp']
      },
      finance: {
        reading: 'Thời kỳ sung túc và tăng trưởng. Các khoản đầu tư sẽ sinh lợi.',
        actionSteps: ['Đầu tư vào tài sản sinh lợi', 'Tận hưởng thành quả lao động', 'Chia sẻ sự sung túc với người thân']
      },
      love: {
        reading: 'Tình yêu đang nở rộ. Có thể có tin vui về thai nghén hoặc mối quan hệ mới.',
        actionSteps: ['Thể hiện tình yêu qua sự chăm sóc', 'Tạo không gian lãng mạn', 'Đón nhận tình yêu vô điều kiện']
      },
      health: {
        reading: 'Thời điểm tốt cho sức khỏe sinh sản và hormone. Kết nối với thiên nhiên mang lại sức sống.',
        actionSteps: ['Dành thời gian trong thiên nhiên', 'Chăm sóc sức khỏe nữ tính', 'Thử aromatherapy và liệu pháp tự nhiên']
      },
      spiritual: {
        reading: 'Kết nối với năng lượng Mẹ Trái Đất. Thực hành với thiên nhiên sẽ mang lại bình an.',
        actionSteps: ['Thực hành grounding/earthing', 'Làm vườn hoặc chăm sóc cây cối', 'Tôn vinh các chu kỳ tự nhiên']
      }
    },

    reversed: {
      overview: 'The Empress ngược cho thấy sự mất cân bằng trong việc cho-nhận, creative block hoặc thiếu tự chăm sóc.',
      warning: 'Đừng bỏ bê bản thân khi chăm sóc người khác. Sự phụ thuộc cảm xúc có thể là vấn đề.',
      advice: 'Dành thời gian cho self-care. Kết nối lại với sự sáng tạo và vẻ đẹp trong cuộc sống.'
    },

    crystals: [
      { name: 'Rose Quartz', vietnameseName: 'Thạch Anh Hồng', reason: 'Mở rộng tình yêu và sự nuôi dưỡng', shopHandle: 'rose-quartz' },
      { name: 'Jade', vietnameseName: 'Ngọc Bích', reason: 'Thu hút sự sung túc và may mắn', shopHandle: 'jade' },
      { name: 'Malachite', vietnameseName: 'Malachite', reason: 'Kết nối với năng lượng Trái Đất', shopHandle: 'malachite' }
    ],

    affirmations: [
      'Tôi xứng đáng được nuôi dưỡng và yêu thương',
      'Sự sung túc chảy đến tôi dễ dàng',
      'Tôi sáng tạo vẻ đẹp trong mọi khía cạnh cuộc sống',
      'Tôi kết nối sâu sắc với Mẹ Thiên Nhiên'
    ]
  },

  // ===== 4. THE EMPEROR =====
  {
    id: 4,
    name: 'The Emperor',
    vietnameseName: 'Hoàng Đế',
    element: 'Fire',
    planet: null,
    zodiac: 'Aries',
    keywords: ['quyền lực', 'cấu trúc', 'kỷ luật', 'lãnh đạo', 'cha'],

    upright: {
      overview: 'The Emperor đại diện cho quyền lực, cấu trúc và kỷ luật. Đây là thời điểm để thiết lập trật tự, đặt ranh giới và đảm nhận vai trò lãnh đạo.',
      career: {
        reading: 'Bạn được công nhận là người có thẩm quyền. Thời điểm tốt để lãnh đạo hoặc được thăng tiến.',
        actionSteps: ['Đảm nhận vai trò lãnh đạo', 'Thiết lập quy trình và hệ thống', 'Đặt mục tiêu rõ ràng cho team']
      },
      finance: {
        reading: 'Quản lý tài chính một cách có kỷ luật. Lập kế hoạch dài hạn và tuân thủ nó.',
        actionSteps: ['Lập ngân sách chi tiết', 'Xây dựng danh mục đầu tư có cấu trúc', 'Tìm hiểu về quản lý tài sản']
      },
      love: {
        reading: 'Ổn định và cam kết trong mối quan hệ. Có thể cần cân bằng giữa kiểm soát và cho phép.',
        actionSteps: ['Thể hiện sự bảo vệ và chăm sóc', 'Đặt ranh giới lành mạnh', 'Cam kết lâu dài với đối phương']
      },
      health: {
        reading: 'Kỷ luật trong việc chăm sóc sức khỏe. Thể dục và chế độ ăn có cấu trúc sẽ hiệu quả.',
        actionSteps: ['Lập lịch tập luyện cố định', 'Tuân thủ chế độ ăn uống', 'Khám sức khỏe định kỳ']
      },
      spiritual: {
        reading: 'Xây dựng thực hành tâm thức có cấu trúc. Kỷ luật trong thiền định mang lại kết quả.',
        actionSteps: ['Thiết lập routine thiền định cố định', 'Học hỏi từ các thầy/sư phụ', 'Xây dựng không gian thiêng liêng cá nhân']
      }
    },

    reversed: {
      overview: 'The Emperor ngược cho thấy sự lạm quyền, thiếu linh hoạt hoặc vấn đề với hình tượng người cha.',
      warning: 'Cẩn thận với xu hướng kiểm soát quá mức. Quyền lực cần đi kèm trách nhiệm.',
      advice: 'Cân bằng giữa kỷ luật và linh hoạt. Lắng nghe góc nhìn của người khác trước khi quyết định.'
    },

    crystals: [
      { name: 'Red Jasper', vietnameseName: 'Jasper Đỏ', reason: 'Củng cố ý chí và sức mạnh lãnh đạo', shopHandle: 'red-jasper' },
      { name: 'Pyrite', vietnameseName: 'Pyrite', reason: 'Thu hút sự thành công và quyền lực', shopHandle: 'pyrite' },
      { name: 'Hematite', vietnameseName: 'Hematite', reason: 'Grounding và bảo vệ', shopHandle: 'hematite' }
    ],

    affirmations: [
      'Tôi là người lãnh đạo công bằng và sáng suốt',
      'Tôi xây dựng nền tảng vững chắc cho tương lai',
      'Kỷ luật của tôi mang lại tự do',
      'Tôi cân bằng giữa quyền lực và lòng nhân ái'
    ]
  },

  // ===== 5. THE HIEROPHANT =====
  {
    id: 5,
    name: 'The Hierophant',
    vietnameseName: 'Giáo Hoàng',
    element: 'Earth',
    planet: null,
    zodiac: 'Taurus',
    keywords: ['truyền thống', 'tâm thức', 'giáo dục', 'hướng dẫn', 'đức tin'],

    upright: {
      overview: 'The Hierophant đại diện cho truyền thống, tri thức thiêng liêng và sự hướng dẫn từ người thầy. Đây là thời điểm để học hỏi từ truyền thống và tìm kiếm mentor.',
      career: {
        reading: 'Học hỏi từ người có kinh nghiệm. Các tổ chức truyền thống hoặc giáo dục sẽ mang lại cơ hội.',
        actionSteps: ['Tìm mentor trong ngành', 'Tham gia đào tạo chính thức', 'Tôn trọng văn hóa công ty']
      },
      finance: {
        reading: 'Tuân theo những nguyên tắc tài chính đã được chứng minh. Tham khảo chuyên gia tài chính.',
        actionSteps: ['Tham khảo cố vấn tài chính', 'Đầu tư theo phương pháp đã được kiểm chứng', 'Học hỏi từ người thành công']
      },
      love: {
        reading: 'Mối quan hệ dựa trên giá trị chung và cam kết. Có thể liên quan đến hôn nhân hoặc các nghi lễ truyền thống.',
        actionSteps: ['Thảo luận về giá trị và niềm tin chung', 'Xem xét các cam kết chính thức', 'Tham gia tư vấn hôn nhân nếu cần']
      },
      health: {
        reading: 'Tin tưởng vào các phương pháp y học đã được chứng minh. Tìm kiếm chuyên gia y tế đáng tin.',
        actionSteps: ['Khám bác sĩ định kỳ', 'Tuân thủ hướng dẫn y tế', 'Kết hợp y học cổ truyền và hiện đại']
      },
      spiritual: {
        reading: 'Tìm kiếm sự hướng dẫn từ các tradition tâm thức. Học hỏi từ các vị thầy sẽ có lợi.',
        actionSteps: ['Khám phá một truyền thống tâm thức cụ thể', 'Tìm thầy hoặc cộng đồng tâm thức', 'Nghiên cứu kinh điển và văn bản thiêng liêng']
      }
    },

    reversed: {
      overview: 'The Hierophant ngược cho thấy sự nổi loạn chống lại truyền thống, hoặc những giáo điều cứng nhắc đang hạn chế bạn.',
      warning: 'Đừng tuân theo một cách mù quáng. Cũng đừng phủ nhận hoàn toàn giá trị của truyền thống.',
      advice: 'Tìm sự cân bằng giữa tôn trọng truyền thống và phát triển con đường riêng của bạn.'
    },

    crystals: [
      { name: 'Lapis Lazuli', vietnameseName: 'Thanh Kim Thạch', reason: 'Kết nối với tri thức thiêng liêng', shopHandle: 'lapis-lazuli' },
      { name: 'Blue Sapphire', vietnameseName: 'Saphire Xanh', reason: 'Trí tuệ và đức tin', shopHandle: 'blue-sapphire' },
      { name: 'Turquoise', vietnameseName: 'Ngọc Lam', reason: 'Bảo vệ và hướng dẫn tâm thức', shopHandle: 'turquoise' }
    ],

    affirmations: [
      'Tôi cởi mở đón nhận sự hướng dẫn từ người thầy',
      'Trí tuệ của truyền thống soi sáng con đường tôi',
      'Tôi tìm thấy ý nghĩa trong các nghi lễ thiêng liêng',
      'Tôi kết nối với cộng đồng chia sẻ giá trị của tôi'
    ]
  },

  // ===== 6. THE LOVERS =====
  {
    id: 6,
    name: 'The Lovers',
    vietnameseName: 'Đôi Tình Nhân',
    element: 'Air',
    planet: null,
    zodiac: 'Gemini',
    keywords: ['tình yêu', 'lựa chọn', 'hài hòa', 'kết nối', 'giá trị'],

    upright: {
      overview: 'The Lovers đại diện cho tình yêu, sự hài hòa và những lựa chọn quan trọng. Đây là thời điểm của sự kết nối sâu sắc và quyết định dựa trên giá trị.',
      career: {
        reading: 'Đối tác kinh doanh hài hòa hoặc lựa chọn nghề nghiệp quan trọng. Hãy chọn con đường phù hợp với giá trị của bạn.',
        actionSteps: ['Đánh giá partnerships hiện tại', 'Chọn công việc phù hợp với đam mê', 'Xây dựng mối quan hệ làm việc tốt đẹp']
      },
      finance: {
        reading: 'Quyết định tài chính quan trọng cần được cân nhắc kỹ. Hợp tác tài chính có thể có lợi.',
        actionSteps: ['Thảo luận tài chính với đối tác', 'Chọn đầu tư phù hợp với giá trị', 'Cân nhắc kỹ các lựa chọn lớn']
      },
      love: {
        reading: 'Tình yêu nở rộ, sự kết nối tâm hồn. Mối quan hệ đang ở giai đoạn đặc biệt.',
        actionSteps: ['Thể hiện tình yêu chân thành', 'Đưa ra cam kết nếu đã sẵn sàng', 'Nuôi dưỡng sự gắn kết tâm hồn']
      },
      health: {
        reading: 'Sức khỏe được hỗ trợ bởi mối quan hệ tích cực. Cân bằng cơ thể-tâm trí quan trọng.',
        actionSteps: ['Tập luyện cùng partner', 'Chăm sóc sức khỏe tinh thần', 'Duy trì cân bằng công việc-cuộc sống']
      },
      spiritual: {
        reading: 'Sự kết nối với vũ trụ và với người khác. Twin flame hoặc soulmate có thể xuất hiện.',
        actionSteps: ['Khám phá sacred sexuality', 'Thực hành loving-kindness meditation', 'Tìm hiểu về soulmate connections']
      }
    },

    reversed: {
      overview: 'The Lovers ngược cho thấy sự mất cân bằng trong mối quan hệ, khó khăn trong việc đưa ra quyết định, hoặc xung đột giá trị.',
      warning: 'Đừng đưa ra lựa chọn vội vàng dựa trên cảm xúc nhất thời. Xung đột nội tâm cần được giải quyết.',
      advice: 'Làm rõ giá trị cốt lõi của bạn trước khi đưa ra quyết định quan trọng. Giao tiếp thẳng thắn trong mối quan hệ.'
    },

    crystals: [
      { name: 'Rose Quartz', vietnameseName: 'Thạch Anh Hồng', reason: 'Mở rộng tình yêu vô điều kiện', shopHandle: 'rose-quartz' },
      { name: 'Rhodonite', vietnameseName: 'Rhodonite', reason: 'Chữa lành trái tim và cân bằng cảm xúc', shopHandle: 'rhodonite' },
      { name: 'Emerald', vietnameseName: 'Ngọc Lục Bảo', reason: 'Tình yêu chân thành và lòng trung thành', shopHandle: 'emerald' }
    ],

    affirmations: [
      'Tôi xứng đáng được yêu thương sâu sắc',
      'Tôi đưa ra lựa chọn phù hợp với giá trị của mình',
      'Tình yêu của tôi thuần khiết và chân thành',
      'Tôi thu hút những mối quan hệ lành mạnh'
    ]
  },

  // ===== 7. THE CHARIOT =====
  {
    id: 7,
    name: 'The Chariot',
    vietnameseName: 'Cỗ Xe',
    element: 'Water',
    planet: null,
    zodiac: 'Cancer',
    keywords: ['chiến thắng', 'quyết tâm', 'kiểm soát', 'tiến về phía trước', 'ý chí'],

    upright: {
      overview: 'The Chariot đại diện cho sự chiến thắng thông qua ý chí và quyết tâm. Bạn có khả năng vượt qua mọi trở ngại và tiến về phía trước.',
      career: {
        reading: 'Chiến thắng trong công việc đang đến. Sự kiên trì sẽ được đền đáp xứng đáng.',
        actionSteps: ['Tập trung vào mục tiêu chính', 'Vượt qua trở ngại bằng quyết tâm', 'Lãnh đạo dự án với sự tự tin']
      },
      finance: {
        reading: 'Tiến bộ tài chính thông qua nỗ lực kiên trì. Thời điểm tốt để theo đuổi mục tiêu tài chính.',
        actionSteps: ['Đặt mục tiêu tài chính rõ ràng', 'Tiến về phía trước mặc dù khó khăn', 'Kiểm soát chi tiêu một cách kỷ luật']
      },
      love: {
        reading: 'Vượt qua thử thách trong mối quan hệ. Cả hai cùng hướng về một phía sẽ chiến thắng.',
        actionSteps: ['Làm việc cùng nhau như một team', 'Vượt qua khác biệt bằng sự tôn trọng', 'Di chuyển về phía trước cùng nhau']
      },
      health: {
        reading: 'Sức mạnh ý chí giúp vượt qua vấn đề sức khỏe. Thể thao và vận động có lợi.',
        actionSteps: ['Đặt mục tiêu fitness cụ thể', 'Kiên trì với kế hoạch chữa trị', 'Tham gia thể thao đối kháng hoặc đua xe']
      },
      spiritual: {
        reading: 'Làm chủ cảm xúc và bản năng. Hợp nhất các mặt đối lập trong bản thân.',
        actionSteps: ['Thực hành kiểm soát cảm xúc', 'Cân bằng logic và trực giác', 'Thiền định để hợp nhất bản ngã']
      }
    },

    reversed: {
      overview: 'The Chariot ngược cho thấy mất kiểm soát, thiếu phương hướng hoặc sự hung hăng quá mức.',
      warning: 'Đừng ép buộc kết quả. Kiểm soát quá mức có thể dẫn đến thất bại.',
      advice: 'Đánh giá lại phương hướng và động lực. Có thể cần nghỉ ngơi trước khi tiếp tục.'
    },

    crystals: [
      { name: 'Black Onyx', vietnameseName: 'Onyx Đen', reason: 'Tăng cường ý chí và sự tập trung', shopHandle: 'black-onyx' },
      { name: 'Tiger Eye', vietnameseName: 'Mắt Hổ', reason: 'Sức mạnh và sự quyết đoán', shopHandle: 'tiger-eye' },
      { name: 'Chrysocolla', vietnameseName: 'Chrysocolla', reason: 'Cân bằng cảm xúc trong khi tiến về phía trước', shopHandle: 'chrysocolla' }
    ],

    affirmations: [
      'Tôi kiểm soát hướng đi của cuộc đời mình',
      'Ý chí của tôi mạnh mẽ và kiên định',
      'Tôi vượt qua mọi trở ngại trên đường đi',
      'Chiến thắng là đích đến của tôi'
    ]
  },

  // ===== 8. STRENGTH =====
  {
    id: 8,
    name: 'Strength',
    vietnameseName: 'Sức Mạnh',
    element: 'Fire',
    planet: null,
    zodiac: 'Leo',
    keywords: ['sức mạnh nội tâm', 'lòng dũng cảm', 'kiên nhẫn', 'từ bi', 'làm chủ bản thân'],

    upright: {
      overview: 'Strength đại diện cho sức mạnh nội tâm, lòng dũng cảm dịu dàng và khả năng làm chủ bản năng. Sức mạnh thực sự đến từ lòng từ bi.',
      career: {
        reading: 'Vượt qua thử thách bằng sức mạnh tinh thần. Lãnh đạo bằng lòng tốt sẽ chiến thắng.',
        actionSteps: ['Đối mặt với thử thách bằng sự bình tĩnh', 'Lãnh đạo bằng tấm gương', 'Kiên nhẫn với những khó khăn']
      },
      finance: {
        reading: 'Sự kiên nhẫn trong đầu tư sẽ được đền đáp. Đừng để cảm xúc chi phối quyết định tài chính.',
        actionSteps: ['Kiên nhẫn với các khoản đầu tư dài hạn', 'Kiểm soát cảm xúc khi thị trường biến động', 'Tin tưởng vào chiến lược của mình']
      },
      love: {
        reading: 'Tình yêu dựa trên sự tôn trọng và kiên nhẫn. Sự dịu dàng chiến thắng sự cứng rắn.',
        actionSteps: ['Đối xử nhẹ nhàng với đối phương', 'Kiên nhẫn với những khác biệt', 'Yêu thương vô điều kiện']
      },
      health: {
        reading: 'Sức mạnh tinh thần hỗ trợ sức khỏe thể chất. Yoga và các bài tập nhẹ nhàng có lợi.',
        actionSteps: ['Thực hành yoga hoặc tai chi', 'Nuôi dưỡng sức mạnh tinh thần', 'Đối mặt với bệnh tật bằng thái độ tích cực']
      },
      spiritual: {
        reading: 'Làm chủ những cảm xúc và bản năng thấp hơn. Sức mạnh tâm thức thực sự là sự từ bi.',
        actionSteps: ['Thực hành self-compassion', 'Làm việc với inner animal/shadow self', 'Phát triển lòng kiên nhẫn vô hạn']
      }
    },

    reversed: {
      overview: 'Strength ngược cho thấy sự tự nghi ngờ, thiếu tự tin hoặc mất kiểm soát cảm xúc.',
      warning: 'Đừng để sợ hãi hoặc tức giận kiểm soát bạn. Sức mạnh thô bạo không phải là câu trả lời.',
      advice: 'Tìm lại sự tự tin bằng cách kết nối với sức mạnh nội tâm. Đối xử tốt với bản thân trước.'
    },

    crystals: [
      { name: 'Sunstone', vietnameseName: 'Đá Mặt Trời', reason: 'Sức mạnh và sự tự tin', shopHandle: 'sunstone' },
      { name: 'Carnelian', vietnameseName: 'Carnelian', reason: 'Dũng cảm và năng lượng', shopHandle: 'carnelian' },
      { name: 'Peridot', vietnameseName: 'Peridot', reason: 'Sức mạnh nội tâm và sự cân bằng', shopHandle: 'peridot' }
    ],

    affirmations: [
      'Sức mạnh của tôi đến từ bên trong',
      'Tôi đối mặt với thử thách bằng lòng dũng cảm dịu dàng',
      'Lòng từ bi là sức mạnh lớn nhất của tôi',
      'Tôi làm chủ cảm xúc và bản năng của mình'
    ]
  },

  // ===== 9. THE HERMIT =====
  {
    id: 9,
    name: 'The Hermit',
    vietnameseName: 'Ẩn Sĩ',
    element: 'Earth',
    planet: null,
    zodiac: 'Virgo',
    keywords: ['nội tâm', 'cô độc', 'tìm kiếm', 'trí tuệ', 'hướng dẫn'],

    upright: {
      overview: 'The Hermit kêu gọi bạn rút lui khỏi thế giới bên ngoài để tìm kiếm trí tuệ bên trong. Đây là thời điểm của sự suy ngẫm và tự khám phá.',
      career: {
        reading: 'Thời điểm để suy ngẫm về hướng đi sự nghiệp. Làm việc độc lập hoặc nghiên cứu sâu có lợi.',
        actionSteps: ['Dành thời gian suy ngẫm về sự nghiệp', 'Làm việc trên các dự án cá nhân', 'Tìm kiếm mentor hoặc làm mentor']
      },
      finance: {
        reading: 'Nghiên cứu kỹ trước khi đầu tư. Không vội vàng theo đám đông.',
        actionSteps: ['Nghiên cứu độc lập trước khi đầu tư', 'Tránh quyết định theo đám đông', 'Tìm kiếm lời khuyên từ người có kinh nghiệm']
      },
      love: {
        reading: 'Thời gian một mình để hiểu rõ bản thân. Nếu đang trong mối quan hệ, cần không gian riêng.',
        actionSteps: ['Dành thời gian cho bản thân', 'Suy ngẫm về những gì bạn thực sự muốn', 'Tôn trọng nhu cầu không gian của mình và đối phương']
      },
      health: {
        reading: 'Nghỉ ngơi và phục hồi. Retreat hoặc detox có thể có lợi.',
        actionSteps: ['Tham gia silent retreat', 'Thực hành digital detox', 'Dành thời gian trong tự nhiên một mình']
      },
      spiritual: {
        reading: 'Hành trình tìm kiếm nội tâm sâu sắc. Thiền định và cô độc mang lại giác ngộ.',
        actionSteps: ['Thiền định trong im lặng', 'Viết nhật ký tâm thức', 'Tìm kiếm hướng dẫn từ bên trong']
      }
    },

    reversed: {
      overview: 'The Hermit ngược cho thấy sự cô lập quá mức, từ chối lời khuyên hoặc cảm giác lạc lõng.',
      warning: 'Đừng cô lập bản thân đến mức mất kết nối với thế giới. Sự cô đơn kéo dài không lành mạnh.',
      advice: 'Tìm sự cân bằng giữa thời gian một mình và kết nối xã hội. Chia sẻ trí tuệ của bạn với người khác.'
    },

    crystals: [
      { name: 'Amethyst', vietnameseName: 'Thạch Anh Tím', reason: 'Hỗ trợ thiền định và trí tuệ tâm thức', shopHandle: 'amethyst' },
      { name: 'Smoky Quartz', vietnameseName: 'Thạch Anh Khói', reason: 'Grounding trong thời gian cô độc', shopHandle: 'smoky-quartz' },
      { name: 'Blue Kyanite', vietnameseName: 'Kyanite Xanh', reason: 'Kết nối với higher self', shopHandle: 'blue-kyanite' }
    ],

    affirmations: [
      'Trong im lặng, tôi tìm thấy trí tuệ',
      'Tôi tin tưởng vào hành trình nội tâm của mình',
      'Sự cô độc là món quà để tự khám phá',
      'Ánh sáng bên trong tôi soi đường cho tôi'
    ]
  },

  // ===== 10. WHEEL OF FORTUNE =====
  {
    id: 10,
    name: 'Wheel of Fortune',
    vietnameseName: 'Bánh Xe Vận Mệnh',
    element: 'Fire',
    planet: 'Jupiter',
    zodiac: null,
    keywords: ['chu kỳ', 'vận mệnh', 'may mắn', 'thay đổi', 'karma'],

    upright: {
      overview: 'Wheel of Fortune báo hiệu sự thay đổi vận mệnh, những chu kỳ mới bắt đầu. May mắn đang đến, hãy nắm bắt cơ hội.',
      career: {
        reading: 'Cơ hội mới xuất hiện, bước ngoặt trong sự nghiệp. Đây là thời điểm may mắn.',
        actionSteps: ['Nắm bắt cơ hội khi nó đến', 'Chuẩn bị cho sự thay đổi', 'Tin vào vận may của mình']
      },
      finance: {
        reading: 'Vận may tài chính đang thay đổi theo hướng tích cực. Có thể có windfall hoặc cơ hội đầu tư tốt.',
        actionSteps: ['Sẵn sàng cho cơ hội bất ngờ', 'Đa dạng hóa để giảm rủi ro', 'Tin vào chu kỳ tài chính']
      },
      love: {
        reading: 'Bước ngoặt trong tình yêu. Số phận đang sắp xếp những cuộc gặp gỡ quan trọng.',
        actionSteps: ['Mở lòng đón nhận tình yêu mới', 'Tin vào duyên số', 'Chấp nhận thay đổi trong mối quan hệ']
      },
      health: {
        reading: 'Sức khỏe đang cải thiện. Chu kỳ mới của sức sống bắt đầu.',
        actionSteps: ['Bắt đầu thói quen sức khỏe mới', 'Tin vào khả năng phục hồi', 'Đón nhận thay đổi tích cực']
      },
      spiritual: {
        reading: 'Bài học karma đang được hoàn thành. Cánh cửa mới mở ra trong hành trình tâm thức.',
        actionSteps: ['Suy ngẫm về các bài học cuộc sống', 'Tin vào kế hoạch của vũ trụ', 'Thực hành gratitude']
      }
    },

    reversed: {
      overview: 'Wheel of Fortune ngược cho thấy vận xui, sự kháng cự thay đổi hoặc bài học karma chưa được học.',
      warning: 'Đừng cố kiểm soát điều không thể kiểm soát. Kháng cự thay đổi chỉ gây thêm khó khăn.',
      advice: 'Chấp nhận rằng có những thứ nằm ngoài tầm kiểm soát. Học bài học để bánh xe quay theo hướng tốt.'
    },

    crystals: [
      { name: 'Labradorite', vietnameseName: 'Labradorite', reason: 'Hỗ trợ trong thời kỳ thay đổi', shopHandle: 'labradorite' },
      { name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Thu hút may mắn và thịnh vượng', shopHandle: 'citrine' },
      { name: 'Green Aventurine', vietnameseName: 'Aventurine Xanh', reason: 'Vận may và cơ hội', shopHandle: 'green-aventurine' }
    ],

    affirmations: [
      'Tôi đón nhận những thay đổi của cuộc sống',
      'Vận may đang quay về phía tôi',
      'Mọi trải nghiệm đều là bài học quý giá',
      'Tôi tin tưởng vào chu kỳ của vũ trụ'
    ]
  },

  // ===== 11. JUSTICE =====
  {
    id: 11,
    name: 'Justice',
    vietnameseName: 'Công Lý',
    element: 'Air',
    planet: null,
    zodiac: 'Libra',
    keywords: ['công bằng', 'sự thật', 'luật pháp', 'cân bằng', 'trách nhiệm'],

    upright: {
      overview: 'Justice đại diện cho sự công bằng, trung thực và chịu trách nhiệm cho hành động của mình. Sự thật sẽ được phơi bày.',
      career: {
        reading: 'Công bằng trong công việc. Các vấn đề pháp lý hoặc hợp đồng sẽ được giải quyết tốt đẹp.',
        actionSteps: ['Hành động trung thực và đạo đức', 'Xem xét kỹ hợp đồng', 'Đối xử công bằng với mọi người']
      },
      finance: {
        reading: 'Quyết định tài chính công bằng. Các vấn đề pháp lý về tài sản sẽ được giải quyết.',
        actionSteps: ['Minh bạch trong giao dịch', 'Giải quyết tranh chấp tài chính', 'Cân nhắc hậu quả dài hạn']
      },
      love: {
        reading: 'Cân bằng trong mối quan hệ. Sự thật và trung thực là nền tảng.',
        actionSteps: ['Thành thật với đối phương', 'Tìm sự cân bằng cho-nhận', 'Giải quyết bất công trong mối quan hệ']
      },
      health: {
        reading: 'Cân bằng trong lối sống. Chú ý đến các vấn đề về thận, lưng dưới.',
        actionSteps: ['Tìm sự cân bằng trong chế độ ăn uống và tập luyện', 'Giải quyết các vấn đề sức khỏe đang trì hoãn', 'Nghe lời bác sĩ']
      },
      spiritual: {
        reading: 'Karma đang được cân bằng. Hành động của bạn sẽ mang lại kết quả xứng đáng.',
        actionSteps: ['Suy ngẫm về karma của mình', 'Sửa chữa những sai lầm trong quá khứ', 'Sống đúng với giá trị của mình']
      }
    },

    reversed: {
      overview: 'Justice ngược cho thấy sự bất công, thiếu trung thực hoặc tránh né trách nhiệm.',
      warning: 'Sự thật sẽ được phơi bày dù bạn có che giấu. Đừng đổ lỗi cho người khác về vấn đề của mình.',
      advice: 'Đối mặt với sự thật, dù có khó khăn. Chịu trách nhiệm cho hành động của mình.'
    },

    crystals: [
      { name: 'Bloodstone', vietnameseName: 'Huyết Thạch', reason: 'Công lý và dũng cảm', shopHandle: 'bloodstone' },
      { name: 'Black Tourmaline', vietnameseName: 'Tourmaline Đen', reason: 'Bảo vệ và sự thật', shopHandle: 'black-tourmaline' },
      { name: 'Blue Lace Agate', vietnameseName: 'Mã Não Xanh', reason: 'Giao tiếp trung thực', shopHandle: 'blue-lace-agate' }
    ],

    affirmations: [
      'Tôi sống đúng với sự thật',
      'Công bằng đến với tôi theo cách xứng đáng',
      'Tôi chịu trách nhiệm cho hành động của mình',
      'Sự cân bằng là nền tảng cuộc sống của tôi'
    ]
  },

  // ===== 12. THE HANGED MAN =====
  {
    id: 12,
    name: 'The Hanged Man',
    vietnameseName: 'Người Bị Treo',
    element: 'Water',
    planet: 'Neptune',
    zodiac: null,
    keywords: ['hy sinh', 'góc nhìn mới', 'buông bỏ', 'chờ đợi', 'giác ngộ'],

    upright: {
      overview: 'The Hanged Man kêu gọi bạn tạm dừng, nhìn mọi thứ từ góc độ khác. Đôi khi buông bỏ là cách để tiến về phía trước.',
      career: {
        reading: 'Tạm dừng để suy ngẫm về hướng đi. Góc nhìn mới về sự nghiệp sẽ xuất hiện.',
        actionSteps: ['Tạm dừng và suy ngẫm', 'Xem xét vấn đề từ góc độ khác', 'Chấp nhận thời gian chờ đợi']
      },
      finance: {
        reading: 'Không phải lúc để hành động tài chính. Chờ đợi kiên nhẫn sẽ được đền đáp.',
        actionSteps: ['Tạm hoãn quyết định đầu tư lớn', 'Xem xét lại chiến lược tài chính', 'Học cách buông bỏ attachment vào tiền']
      },
      love: {
        reading: 'Nhìn mối quan hệ từ góc độ khác. Có thể cần hy sinh hoặc buông bỏ một điều gì đó.',
        actionSteps: ['Lắng nghe quan điểm của đối phương', 'Buông bỏ kỳ vọng cứng nhắc', 'Chấp nhận sự khác biệt']
      },
      health: {
        reading: 'Thời gian nghỉ ngơi và phục hồi. Đôi khi không làm gì là cách chữa lành tốt nhất.',
        actionSteps: ['Nghỉ ngơi và phục hồi', 'Thực hành restorative yoga', 'Chấp nhận quá trình chữa lành cần thời gian']
      },
      spiritual: {
        reading: 'Giác ngộ thông qua buông bỏ. Nhìn thế giới bằng con mắt mới.',
        actionSteps: ['Thực hành surrender', 'Thiền định về sự vô thường', 'Tìm kiếm ý nghĩa trong thử thách']
      }
    },

    reversed: {
      overview: 'The Hanged Man ngược cho thấy sự kháng cự thay đổi, hy sinh vô ích hoặc bị mắc kẹt.',
      warning: 'Đừng hy sinh bản thân một cách vô nghĩa. Sự chống đối chỉ kéo dài đau khổ.',
      advice: 'Học cách buông bỏ. Nếu đang mắc kẹt, hãy tìm cách nhìn vấn đề từ góc độ khác.'
    },

    crystals: [
      { name: 'Aquamarine', vietnameseName: 'Ngọc Biển', reason: 'Buông bỏ và chấp nhận', shopHandle: 'aquamarine' },
      { name: 'Lepidolite', vietnameseName: 'Lepidolite', reason: 'Bình tĩnh trong thời gian chờ đợi', shopHandle: 'lepidolite' },
      { name: 'Blue Topaz', vietnameseName: 'Topaz Xanh', reason: 'Góc nhìn mới và trí tuệ', shopHandle: 'blue-topaz' }
    ],

    affirmations: [
      'Tôi buông bỏ những gì không còn phục vụ tôi',
      'Trong sự chờ đợi, tôi tìm thấy trí tuệ',
      'Tôi nhìn thế giới bằng con mắt mới',
      'Sự hy sinh của tôi mang lại ý nghĩa'
    ]
  },

  // ===== 13. DEATH =====
  {
    id: 13,
    name: 'Death',
    vietnameseName: 'Cái Chết',
    element: 'Water',
    planet: null,
    zodiac: 'Scorpio',
    keywords: ['kết thúc', 'chuyển hóa', 'tái sinh', 'buông bỏ', 'thay đổi sâu sắc'],

    upright: {
      overview: 'Death không có nghĩa là cái chết vật lý, mà là sự kết thúc và tái sinh. Một chương mới bắt đầu khi chương cũ khép lại.',
      career: {
        reading: 'Kết thúc một giai đoạn sự nghiệp, bắt đầu giai đoạn mới. Thay đổi này cần thiết cho sự phát triển.',
        actionSteps: ['Chấp nhận kết thúc của một giai đoạn', 'Buông bỏ công việc không còn phù hợp', 'Đón nhận sự thay đổi nghề nghiệp']
      },
      finance: {
        reading: 'Thay đổi lớn về tài chính. Kết thúc một cách quản lý tiền cũ, bắt đầu cách mới.',
        actionSteps: ['Loại bỏ thói quen tài chính xấu', 'Chấp nhận thay đổi về thu nhập', 'Tái cấu trúc tài chính']
      },
      love: {
        reading: 'Chuyển hóa trong mối quan hệ hoặc kết thúc một mối quan hệ cũ để mở đường cho điều mới.',
        actionSteps: ['Buông bỏ mối quan hệ không lành mạnh', 'Cho phép mối quan hệ hiện tại transform', 'Chấp nhận sự thay đổi trong tình cảm']
      },
      health: {
        reading: 'Thay đổi lớn về lối sống. Bỏ những thói quen xấu để tái sinh sức khỏe.',
        actionSteps: ['Từ bỏ thói quen có hại', 'Detox cơ thể và tâm trí', 'Bắt đầu lối sống hoàn toàn mới']
      },
      spiritual: {
        reading: 'Ego death và tái sinh tâm thức. Sự chuyển hóa sâu sắc đang diễn ra.',
        actionSteps: ['Thực hành shadow work', 'Buông bỏ identity cũ', 'Đón nhận sự tái sinh tâm thức']
      }
    },

    reversed: {
      overview: 'Death ngược cho thấy sự kháng cự thay đổi tất yếu, bám víu vào quá khứ.',
      warning: 'Đừng cố giữ lại những gì cần phải đi. Sự kháng cự chỉ kéo dài đau khổ.',
      advice: 'Chấp nhận rằng mọi thứ đều có chu kỳ. Buông bỏ để có thể tiến về phía trước.'
    },

    crystals: [
      { name: 'Black Obsidian', vietnameseName: 'Obsidian Đen', reason: 'Giải phóng và chuyển hóa', shopHandle: 'black-obsidian' },
      { name: 'Moldavite', vietnameseName: 'Moldavite', reason: 'Thay đổi nhanh chóng và mạnh mẽ', shopHandle: 'moldavite' },
      { name: 'Apache Tears', vietnameseName: 'Nước Mắt Apache', reason: 'Chữa lành sự mất mát', shopHandle: 'apache-tears' }
    ],

    affirmations: [
      'Tôi buông bỏ những gì không còn phục vụ tôi',
      'Mỗi kết thúc là một khởi đầu mới',
      'Tôi chấp nhận sự chuyển hóa trong cuộc sống',
      'Tôi tái sinh mạnh mẽ hơn từ những thay đổi'
    ]
  },

  // ===== 14. TEMPERANCE =====
  {
    id: 14,
    name: 'Temperance',
    vietnameseName: 'Sự Điều Độ',
    element: 'Fire',
    planet: null,
    zodiac: 'Sagittarius',
    keywords: ['cân bằng', 'kiên nhẫn', 'điều độ', 'hòa hợp', 'mục đích'],

    upright: {
      overview: 'Temperance kêu gọi sự cân bằng, điều độ và kiên nhẫn. Hòa trộn các yếu tố khác nhau để tạo nên điều tốt đẹp.',
      career: {
        reading: 'Cân bằng công việc và cuộc sống. Hợp tác hài hòa mang lại kết quả tốt.',
        actionSteps: ['Tìm cân bằng work-life', 'Hợp tác với người có kỹ năng bổ sung', 'Kiên nhẫn với tiến trình']
      },
      finance: {
        reading: 'Quản lý tài chính cân bằng. Không quá tiết kiệm cũng không quá hoang phí.',
        actionSteps: ['Lập ngân sách cân bằng', 'Đa dạng hóa đầu tư', 'Kiên nhẫn với mục tiêu dài hạn']
      },
      love: {
        reading: 'Hài hòa trong mối quan hệ. Cho và nhận cân bằng.',
        actionSteps: ['Tìm điểm chung với đối phương', 'Hòa giải những khác biệt', 'Thực hành kiên nhẫn trong tình yêu']
      },
      health: {
        reading: 'Sức khỏe tốt nhờ lối sống cân bằng. Điều độ trong ăn uống và tập luyện.',
        actionSteps: ['Duy trì chế độ ăn uống cân bằng', 'Tập thể dục vừa phải đều đặn', 'Cân bằng nghỉ ngơi và hoạt động']
      },
      spiritual: {
        reading: 'Hợp nhất các khía cạnh của bản thân. Kết nối với thiên thần hộ mệnh.',
        actionSteps: ['Thực hành mindfulness', 'Tích hợp shadow và light', 'Làm việc với thiên thần']
      }
    },

    reversed: {
      overview: 'Temperance ngược cho thấy sự mất cân bằng, thiếu kiên nhẫn hoặc thái quá.',
      warning: 'Tránh thái cực trong mọi việc. Thiếu kiên nhẫn có thể phá hỏng kết quả.',
      advice: 'Tìm lại sự cân bằng. Học cách chờ đợi và tin tưởng vào quá trình.'
    },

    crystals: [
      { name: 'Amethyst', vietnameseName: 'Thạch Anh Tím', reason: 'Cân bằng và bình tĩnh', shopHandle: 'amethyst' },
      { name: 'Sodalite', vietnameseName: 'Sodalite', reason: 'Hài hòa logic và trực giác', shopHandle: 'sodalite' },
      { name: 'Angelite', vietnameseName: 'Angelite', reason: 'Kết nối với thiên thần', shopHandle: 'angelite' }
    ],

    affirmations: [
      'Tôi sống trong sự cân bằng và hài hòa',
      'Kiên nhẫn là sức mạnh của tôi',
      'Tôi hòa trộn các yếu tố để tạo nên điều tốt đẹp',
      'Sự điều độ mang lại bình an cho tôi'
    ]
  },

  // ===== 15. THE DEVIL =====
  {
    id: 15,
    name: 'The Devil',
    vietnameseName: 'Ác Quỷ',
    element: 'Earth',
    planet: null,
    zodiac: 'Capricorn',
    keywords: ['ràng buộc', 'nghiện ngập', 'bóng tối', 'dục vọng', 'ảo tưởng'],

    upright: {
      overview: 'The Devil đại diện cho những ràng buộc, nghiện ngập và bóng tối trong tâm hồn. Bạn đang bị kìm hãm bởi những gì bạn nghĩ không thể thoát ra.',
      career: {
        reading: 'Cảm giác bị mắc kẹt trong công việc. Có thể có môi trường làm việc độc hại.',
        actionSteps: ['Nhận ra bạn có quyền lựa chọn', 'Đối mặt với sợ hãi về sự thay đổi', 'Thoát khỏi môi trường độc hại']
      },
      finance: {
        reading: 'Bị trói buộc bởi nợ hoặc thói quen tài chính xấu. Có thể có tham lam hoặc nghiện mua sắm.',
        actionSteps: ['Nhận ra các thói quen tài chính độc hại', 'Lập kế hoạch trả nợ', 'Kiểm soát impulse spending']
      },
      love: {
        reading: 'Mối quan hệ có thể có yếu tố độc hại, phụ thuộc không lành mạnh.',
        actionSteps: ['Nhận ra các mẫu hình quan hệ độc hại', 'Đặt ranh giới lành mạnh', 'Tìm kiếm hỗ trợ nếu cần']
      },
      health: {
        reading: 'Nghiện ngập hoặc thói quen có hại cho sức khỏe. Shadow work cần thiết.',
        actionSteps: ['Đối mặt với các addiction', 'Tìm kiếm hỗ trợ chuyên môn', 'Làm việc với shadow self']
      },
      spiritual: {
        reading: 'Đối mặt với bóng tối bên trong. Shadow integration là chìa khóa để giải phóng.',
        actionSteps: ['Thực hành shadow work', 'Đối mặt với sợ hãi và dục vọng', 'Nhận ra ảo tưởng đang kìm hãm bạn']
      }
    },

    reversed: {
      overview: 'The Devil ngược cho thấy sự giải phóng khỏi ràng buộc, vượt qua nghiện ngập.',
      warning: 'Quá trình giải phóng có thể khó khăn. Đừng quay lại các mẫu hình cũ.',
      advice: 'Tiếp tục con đường giải phóng. Bạn có sức mạnh để thoát khỏi những gì đang kìm hãm.'
    },

    crystals: [
      { name: 'Black Tourmaline', vietnameseName: 'Tourmaline Đen', reason: 'Bảo vệ và giải phóng năng lượng tiêu cực', shopHandle: 'black-tourmaline' },
      { name: 'Smoky Quartz', vietnameseName: 'Thạch Anh Khói', reason: 'Transmute năng lượng tiêu cực', shopHandle: 'smoky-quartz' },
      { name: 'Jet', vietnameseName: 'Jet', reason: 'Bảo vệ khỏi năng lượng tiêu cực', shopHandle: 'jet' }
    ],

    affirmations: [
      'Tôi có quyền lực để giải phóng bản thân',
      'Tôi nhận ra và vượt qua những ràng buộc của mình',
      'Bóng tối là phần của tôi mà tôi đang hợp nhất',
      'Tôi chọn tự do thay vì sợ hãi'
    ]
  },

  // ===== 16. THE TOWER =====
  {
    id: 16,
    name: 'The Tower',
    vietnameseName: 'Tháp',
    element: 'Fire',
    planet: 'Mars',
    zodiac: null,
    keywords: ['sụp đổ', 'thức tỉnh', 'thay đổi đột ngột', 'giải phóng', 'sự thật'],

    upright: {
      overview: 'The Tower báo hiệu sự sụp đổ đột ngột, nhưng cần thiết để xây dựng lại tốt hơn. Sự thật được phơi bày, dù đau đớn.',
      career: {
        reading: 'Thay đổi đột ngột trong sự nghiệp - có thể mất việc, thay đổi công ty hoặc ngành nghề.',
        actionSteps: ['Chuẩn bị cho thay đổi bất ngờ', 'Xem đây là cơ hội để bắt đầu lại', 'Không bám víu vào cái cũ']
      },
      finance: {
        reading: 'Biến động tài chính lớn. Có thể có mất mát nhưng cũng là cơ hội tái cấu trúc.',
        actionSteps: ['Chuẩn bị quỹ dự phòng', 'Đánh giá lại chiến lược tài chính', 'Học từ những sai lầm']
      },
      love: {
        reading: 'Sự thật được phơi bày trong mối quan hệ. Có thể có chia tay hoặc thay đổi lớn.',
        actionSteps: ['Đối mặt với sự thật về mối quan hệ', 'Chấp nhận thay đổi cần thiết', 'Xây dựng lại trên nền tảng mới']
      },
      health: {
        reading: 'Wake-up call về sức khỏe. Có thể có vấn đề sức khỏe đột ngột cần chú ý.',
        actionSteps: ['Chú ý đến các dấu hiệu cảnh báo', 'Thay đổi lối sống ngay lập tức', 'Khám sức khỏe toàn diện']
      },
      spiritual: {
        reading: 'Dark night of the soul dẫn đến thức tỉnh. Ego đang sụp đổ để cho higher self emerge.',
        actionSteps: ['Chấp nhận quá trình breakdown to breakthrough', 'Tin vào sự tái sinh tâm thức', 'Buông bỏ niềm tin không còn phục vụ']
      }
    },

    reversed: {
      overview: 'The Tower ngược cho thấy sự kháng cự thay đổi tất yếu hoặc thảm họa được ngăn chặn.',
      warning: 'Đừng bỏ qua các dấu hiệu cảnh báo. Sự sụp đổ có thể bị trì hoãn nhưng không tránh khỏi nếu không thay đổi.',
      advice: 'Chủ động thay đổi trước khi bị ép buộc. Đối mặt với sự thật sớm hơn ít đau đớn hơn.'
    },

    crystals: [
      { name: 'Obsidian', vietnameseName: 'Obsidian', reason: 'Phá vỡ ảo tưởng và bảo vệ', shopHandle: 'obsidian' },
      { name: 'Malachite', vietnameseName: 'Malachite', reason: 'Chuyển hóa và bảo vệ qua thay đổi', shopHandle: 'malachite' },
      { name: 'Fire Agate', vietnameseName: 'Mã Não Lửa', reason: 'Sức mạnh qua biến động', shopHandle: 'fire-agate' }
    ],

    affirmations: [
      'Tôi tin rằng sự sụp đổ mở đường cho điều tốt đẹp hơn',
      'Tôi đón nhận sự thức tỉnh, dù đau đớn',
      'Từ đống tro tàn, tôi xây dựng lại mạnh mẽ hơn',
      'Thay đổi đột ngột là cơ hội của tôi'
    ]
  },

  // ===== 17. THE STAR =====
  {
    id: 17,
    name: 'The Star',
    vietnameseName: 'Ngôi Sao',
    element: 'Air',
    planet: null,
    zodiac: 'Aquarius',
    keywords: ['hy vọng', 'cảm hứng', 'chữa lành', 'thanh thản', 'hướng dẫn'],

    upright: {
      overview: 'The Star mang đến hy vọng, sự chữa lành và cảm hứng. Sau bóng tối là ánh sáng, đây là thời điểm của sự phục hồi.',
      career: {
        reading: 'Hy vọng mới trong sự nghiệp. Cảm hứng sáng tạo và tầm nhìn cho tương lai.',
        actionSteps: ['Theo đuổi đam mê và ước mơ', 'Chia sẻ tài năng với thế giới', 'Tin vào tương lai tươi sáng']
      },
      finance: {
        reading: 'Triển vọng tài chính tích cực. Đầu tư với tầm nhìn dài hạn sẽ có lợi.',
        actionSteps: ['Đặt mục tiêu tài chính lạc quan', 'Đầu tư vào tương lai', 'Tin vào sự thịnh vượng sẽ đến']
      },
      love: {
        reading: 'Tình yêu chữa lành và hy vọng. Mối quan hệ mang lại cảm hứng.',
        actionSteps: ['Mở lòng với tình yêu', 'Chữa lành những vết thương cũ', 'Tin vào soulmate']
      },
      health: {
        reading: 'Thời kỳ phục hồi và chữa lành. Sức khỏe cải thiện, tinh thần lạc quan.',
        actionSteps: ['Tin vào quá trình chữa lành', 'Thực hành self-care với tình yêu', 'Kết nối với thiên nhiên để phục hồi']
      },
      spiritual: {
        reading: 'Kết nối với nguồn năng lượng vũ trụ. Cosmic guidance đang đến với bạn.',
        actionSteps: ['Thực hành star gazing', 'Làm việc với energy của các ngôi sao', 'Tin vào sự hướng dẫn của vũ trụ']
      }
    },

    reversed: {
      overview: 'The Star ngược cho thấy mất hy vọng, thiếu niềm tin hoặc disconnect với nguồn cảm hứng.',
      warning: 'Đừng để tuyệt vọng chiếm lấy bạn. Ánh sáng vẫn còn, chỉ là bạn chưa thấy.',
      advice: 'Tìm lại hy vọng bằng cách kết nối với những điều đơn giản mang lại niềm vui. Đừng từ bỏ ước mơ.'
    },

    crystals: [
      { name: 'Aquamarine', vietnameseName: 'Ngọc Biển', reason: 'Chữa lành và bình an', shopHandle: 'aquamarine' },
      { name: 'Blue Lace Agate', vietnameseName: 'Mã Não Xanh', reason: 'Thanh thản và hy vọng', shopHandle: 'blue-lace-agate' },
      { name: 'Celestite', vietnameseName: 'Celestite', reason: 'Kết nối với năng lượng thiên thể', shopHandle: 'celestite' }
    ],

    affirmations: [
      'Hy vọng soi sáng con đường của tôi',
      'Tôi được chữa lành và phục hồi mỗi ngày',
      'Các ngôi sao hướng dẫn tôi đến đích',
      'Tôi là ánh sáng trong bóng tối'
    ]
  },

  // ===== 18. THE MOON =====
  {
    id: 18,
    name: 'The Moon',
    vietnameseName: 'Mặt Trăng',
    element: 'Water',
    planet: null,
    zodiac: 'Pisces',
    keywords: ['ảo tưởng', 'trực giác', 'tiềm thức', 'sợ hãi', 'giấc mơ'],

    upright: {
      overview: 'The Moon đại diện cho thế giới tiềm thức, giấc mơ và những nỗi sợ ẩn giấu. Mọi thứ không như vẻ bề ngoài.',
      career: {
        reading: 'Có thể có sự lừa dối hoặc thông tin không rõ ràng. Tin vào trực giác nhưng kiểm chứng thông tin.',
        actionSteps: ['Kiểm tra kỹ thông tin và hợp đồng', 'Tin vào trực giác về người và tình huống', 'Đợi sự rõ ràng trước khi quyết định']
      },
      finance: {
        reading: 'Không phải lúc tốt để đưa ra quyết định tài chính lớn. Có thể có lừa đảo hoặc thông tin sai lệch.',
        actionSteps: ['Không đầu tư khi chưa rõ ràng', 'Cẩn thận với những offer quá tốt', 'Tin vào trực giác về giao dịch']
      },
      love: {
        reading: 'Cảm xúc phức tạp và có thể có sự hiểu lầm. Không phải mọi thứ được nói ra.',
        actionSteps: ['Lắng nghe trực giác về mối quan hệ', 'Đợi sự rõ ràng trước khi kết luận', 'Khám phá những cảm xúc ẩn giấu']
      },
      health: {
        reading: 'Chú ý đến giấc mơ và tín hiệu từ tiềm thức. Vấn đề tâm lý có thể ảnh hưởng sức khỏe.',
        actionSteps: ['Phân tích giấc mơ', 'Chăm sóc sức khỏe tinh thần', 'Thực hành moon rituals']
      },
      spiritual: {
        reading: 'Thời điểm để khám phá tiềm thức và làm việc với giấc mơ. Psychic abilities tăng cường.',
        actionSteps: ['Ghi chép và phân tích giấc mơ', 'Thực hành với năng lượng mặt trăng', 'Khám phá tiềm thức']
      }
    },

    reversed: {
      overview: 'The Moon ngược cho thấy sự thật đang dần lộ ra, vượt qua sợ hãi hoặc ảo tưởng tan biến.',
      warning: 'Đừng để anxiety kiểm soát bạn. Sự rõ ràng đang đến.',
      advice: 'Đối mặt với nỗi sợ để vượt qua. Sự thật sẽ mang lại sự giải thoát.'
    },

    crystals: [
      { name: 'Moonstone', vietnameseName: 'Đá Mặt Trăng', reason: 'Kết nối với năng lượng mặt trăng và trực giác', shopHandle: 'moonstone' },
      { name: 'Labradorite', vietnameseName: 'Labradorite', reason: 'Bảo vệ và phát triển psychic abilities', shopHandle: 'labradorite' },
      { name: 'Black Pearl', vietnameseName: 'Ngọc Trai Đen', reason: 'Chữa lành cảm xúc sâu thẳm', shopHandle: 'black-pearl' }
    ],

    affirmations: [
      'Tôi tin vào trực giác của mình',
      'Tôi đối mặt với nỗi sợ và vượt qua chúng',
      'Tiềm thức của tôi là nguồn trí tuệ',
      'Tôi tìm thấy ánh sáng trong bóng tối'
    ]
  },

  // ===== 19. THE SUN =====
  {
    id: 19,
    name: 'The Sun',
    vietnameseName: 'Mặt Trời',
    element: 'Fire',
    planet: 'Sun',
    zodiac: null,
    keywords: ['niềm vui', 'thành công', 'sinh lực', 'sự rõ ràng', 'hạnh phúc'],

    upright: {
      overview: 'The Sun là lá bài tích cực nhất trong Tarot. Niềm vui, thành công và sức sống tràn đầy. Mọi thứ rõ ràng và tươi sáng.',
      career: {
        reading: 'Thành công trong sự nghiệp, được công nhận và đánh giá cao. Thời kỳ tỏa sáng.',
        actionSteps: ['Tỏa sáng và thể hiện bản thân', 'Đón nhận thành công', 'Chia sẻ niềm vui với đồng nghiệp']
      },
      finance: {
        reading: 'Thịnh vượng và sung túc. Đầu tư thành công, tài chính ổn định.',
        actionSteps: ['Tận hưởng thành quả lao động', 'Đầu tư với sự tự tin', 'Chia sẻ sự thịnh vượng']
      },
      love: {
        reading: 'Tình yêu rực rỡ và hạnh phúc. Mối quan hệ tràn đầy niềm vui.',
        actionSteps: ['Tận hưởng tình yêu', 'Ăn mừng mối quan hệ', 'Lan tỏa hạnh phúc']
      },
      health: {
        reading: 'Sức khỏe tốt, năng lượng dồi dào. Vitamin D và ánh nắng có lợi.',
        actionSteps: ['Dành thời gian ngoài trời', 'Tận hưởng hoạt động thể chất', 'Lan tỏa năng lượng tích cực']
      },
      spiritual: {
        reading: 'Giác ngộ và sự rõ ràng tâm thức. Kết nối với inner child và niềm vui thuần khiết.',
        actionSteps: ['Kết nối với inner child', 'Thực hành joy meditation', 'Lan tỏa ánh sáng cho người khác']
      }
    },

    reversed: {
      overview: 'The Sun ngược cho thấy niềm vui tạm thời bị che mờ, thiếu sự rõ ràng hoặc quá tự tin.',
      warning: 'Đừng để ego hoặc sự kiêu ngạo che mờ ánh sáng của bạn.',
      advice: 'Tìm lại niềm vui đơn giản. Ánh mặt trời luôn ở đó, chỉ cần bạn nhìn thấy.'
    },

    crystals: [
      { name: 'Citrine', vietnameseName: 'Thạch Anh Vàng', reason: 'Năng lượng mặt trời và niềm vui', shopHandle: 'citrine' },
      { name: 'Sunstone', vietnameseName: 'Đá Mặt Trời', reason: 'Sinh lực và sự lạc quan', shopHandle: 'sunstone' },
      { name: 'Amber', vietnameseName: 'Hổ Phách', reason: 'Năng lượng ấm áp và chữa lành', shopHandle: 'amber' }
    ],

    affirmations: [
      'Tôi tỏa sáng với ánh sáng của riêng mình',
      'Niềm vui là trạng thái tự nhiên của tôi',
      'Tôi đón nhận thành công và hạnh phúc',
      'Ánh mặt trời bên trong tôi soi sáng thế giới'
    ]
  },

  // ===== 20. JUDGEMENT =====
  {
    id: 20,
    name: 'Judgement',
    vietnameseName: 'Sự Phán Xét',
    element: 'Fire',
    planet: 'Pluto',
    zodiac: null,
    keywords: ['phán xét', 'tái sinh', 'tiếng gọi', 'sự đánh giá', 'giải thoát'],

    upright: {
      overview: 'Judgement kêu gọi bạn đánh giá lại cuộc sống, đáp lại tiếng gọi cao hơn. Thời điểm của sự tái sinh và giải thoát karma.',
      career: {
        reading: 'Được đánh giá và công nhận cho nỗ lực. Tiếng gọi cho sứ mệnh cao hơn trong sự nghiệp.',
        actionSteps: ['Đánh giá lại hướng đi sự nghiệp', 'Đáp lại tiếng gọi của đam mê', 'Chấp nhận cơ hội được công nhận']
      },
      finance: {
        reading: 'Đánh giá lại tình hình tài chính và đưa ra quyết định quan trọng.',
        actionSteps: ['Review tổng thể tài chính', 'Giải quyết các vấn đề tài chính tồn đọng', 'Đưa ra quyết định dứt khoát']
      },
      love: {
        reading: 'Đánh giá lại mối quan hệ. Quyết định quan trọng về tương lai cần được đưa ra.',
        actionSteps: ['Đánh giá trung thực mối quan hệ', 'Tha thứ cho quá khứ', 'Đưa ra quyết định về tương lai']
      },
      health: {
        reading: 'Tái sinh sức khỏe. Có thể cần đánh giá lại lối sống và thói quen.',
        actionSteps: ['Đánh giá toàn diện sức khỏe', 'Quyết tâm thay đổi thói quen', 'Đón nhận sự tái sinh']
      },
      spiritual: {
        reading: 'Thức tỉnh tâm thức và đáp lại tiếng gọi của linh hồn. Karma đang được giải quyết.',
        actionSteps: ['Lắng nghe tiếng gọi của linh hồn', 'Giải quyết karma còn tồn đọng', 'Chuẩn bị cho sự thức tỉnh lớn']
      }
    },

    reversed: {
      overview: 'Judgement ngược cho thấy sự tự phán xét quá khắt khe, từ chối tiếng gọi hoặc sợ thay đổi.',
      warning: 'Đừng quá khắt khe với bản thân. Đừng bỏ qua tiếng gọi của linh hồn.',
      advice: 'Tha thứ cho bản thân và người khác. Đáp lại tiếng gọi trước khi quá muộn.'
    },

    crystals: [
      { name: 'Clear Quartz', vietnameseName: 'Thạch Anh Trắng', reason: 'Sự rõ ràng và tái sinh', shopHandle: 'clear-quartz' },
      { name: 'Moldavite', vietnameseName: 'Moldavite', reason: 'Chuyển hóa và thức tỉnh', shopHandle: 'moldavite' },
      { name: 'Kyanite', vietnameseName: 'Kyanite', reason: 'Kết nối với higher self', shopHandle: 'kyanite' }
    ],

    affirmations: [
      'Tôi đáp lại tiếng gọi của linh hồn mình',
      'Tôi tha thứ cho bản thân và người khác',
      'Tôi sẵn sàng cho sự tái sinh',
      'Tôi đánh giá cuộc sống với sự trung thực và lòng từ bi'
    ]
  },

  // ===== 21. THE WORLD =====
  {
    id: 21,
    name: 'The World',
    vietnameseName: 'Thế Giới',
    element: 'Earth',
    planet: 'Saturn',
    zodiac: null,
    keywords: ['hoàn thành', 'tích hợp', 'thành tựu', 'chu kỳ kết thúc', 'toàn vẹn'],

    upright: {
      overview: 'The World là lá bài hoàn thành trong Major Arcana. Một chu kỳ kết thúc viên mãn, thành tựu lớn và sự toàn vẹn.',
      career: {
        reading: 'Hoàn thành mục tiêu sự nghiệp lớn. Được công nhận toàn cầu hoặc thành tựu quan trọng.',
        actionSteps: ['Ăn mừng thành tựu', 'Hoàn thành các dự án còn dang dở', 'Chuẩn bị cho chu kỳ mới']
      },
      finance: {
        reading: 'Đạt được mục tiêu tài chính. Sự thịnh vượng toàn diện và ổn định.',
        actionSteps: ['Ăn mừng thành công tài chính', 'Đa dạng hóa và bảo vệ tài sản', 'Chia sẻ sự thịnh vượng']
      },
      love: {
        reading: 'Mối quan hệ hoàn thiện và trọn vẹn. Có thể có hôn nhân hoặc cam kết lớn.',
        actionSteps: ['Ăn mừng tình yêu', 'Cam kết cho tương lai', 'Du lịch hoặc trải nghiệm mới cùng nhau']
      },
      health: {
        reading: 'Sức khỏe toàn diện và cân bằng. Holistic wellness đạt được.',
        actionSteps: ['Duy trì sự cân bằng đạt được', 'Tích hợp mind-body-spirit', 'Du lịch chữa lành']
      },
      spiritual: {
        reading: 'Hoàn thành một giai đoạn tiến hóa tâm thức. Sự tích hợp và toàn vẹn đạt được.',
        actionSteps: ['Ăn mừng hành trình tâm thức', 'Chia sẻ trí tuệ với người khác', 'Chuẩn bị cho level tiếp theo']
      }
    },

    reversed: {
      overview: 'The World ngược cho thấy sự chậm trễ trong việc hoàn thành, thiếu closure hoặc cảm giác không trọn vẹn.',
      warning: 'Đừng bỏ cuộc khi gần đến đích. Hoàn thành những gì đã bắt đầu.',
      advice: 'Tìm kiếm closure cho những việc còn dang dở. Sự hoàn thành đang ở gần.'
    },

    crystals: [
      { name: 'Lapis Lazuli', vietnameseName: 'Thanh Kim Thạch', reason: 'Trí tuệ và sự hoàn thiện', shopHandle: 'lapis-lazuli' },
      { name: 'Fluorite', vietnameseName: 'Fluorite', reason: 'Sự tích hợp và toàn vẹn', shopHandle: 'fluorite' },
      { name: 'Super Seven', vietnameseName: 'Super Seven', reason: 'Sự hoàn hảo và tiến hóa', shopHandle: 'super-seven' }
    ],

    affirmations: [
      'Tôi hoàn thành mọi thứ tôi bắt đầu',
      'Tôi trọn vẹn và toàn diện',
      'Tôi ăn mừng thành tựu của mình',
      'Mỗi kết thúc là khởi đầu của điều tuyệt vời hơn'
    ]
  }
];

// Helper function để lấy lá bài theo ID
export const getMajorArcanaCard = (id) => {
  return MAJOR_ARCANA.find(card => card.id === id);
};

// Helper function để lấy lá bài theo tên
export const getMajorArcanaByName = (name) => {
  return MAJOR_ARCANA.find(card =>
    card.name.toLowerCase() === name.toLowerCase() ||
    card.vietnameseName.toLowerCase() === name.toLowerCase()
  );
};

// Helper function để lấy random card
export const getRandomMajorArcana = () => {
  const randomIndex = Math.floor(Math.random() * MAJOR_ARCANA.length);
  return MAJOR_ARCANA[randomIndex];
};

// Export default
export default MAJOR_ARCANA;
