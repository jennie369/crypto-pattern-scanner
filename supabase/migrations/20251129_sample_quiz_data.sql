-- ========================================
-- GEM Platform - Sample Course & Quiz Data
-- Run AFTER 20251129_course_quiz_system.sql
-- Date: 2025-11-29
-- ========================================

-- ========================================
-- STEP 1: Insert Course Data
-- ========================================

-- Course 1: Trading Cơ Bản
INSERT INTO courses (id, title, description, thumbnail_url, instructor_name, instructor_avatar, duration_hours, total_lessons, tier_required, price, rating, students_count, is_published)
VALUES (
    'course-trading-basics',
    'Trading Cơ Bản',
    'Học cách giao dịch crypto từ A-Z. Khóa học này sẽ giúp bạn hiểu được các khái niệm cơ bản về thị trường crypto, cách đọc biểu đồ, và các chiến lược giao dịch đơn giản nhưng hiệu quả.',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'Gemral',
    'https://ui-avatars.com/api/?name=GEM+Master&background=6A5BFF&color=fff&size=200',
    10,
    12,
    'FREE',
    0,
    4.8,
    1250,
    true
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_published = EXCLUDED.is_published;

-- ========================================
-- STEP 2: Insert Modules for Trading Cơ Bản
-- ========================================

-- Module 1: Giới Thiệu Về Crypto
INSERT INTO course_modules (id, course_id, title, description, order_index)
VALUES (
    'module-1',
    'course-trading-basics',
    'Giới Thiệu Về Crypto',
    'Tìm hiểu về cryptocurrency và blockchain technology',
    1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Module 2: Đọc Hiểu Biểu Đồ
INSERT INTO course_modules (id, course_id, title, description, order_index)
VALUES (
    'module-2',
    'course-trading-basics',
    'Đọc Hiểu Biểu Đồ',
    'Học cách đọc và phân tích biểu đồ giá',
    2
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- Module 3: Chiến Lược Giao Dịch
INSERT INTO course_modules (id, course_id, title, description, order_index)
VALUES (
    'module-3',
    'course-trading-basics',
    'Chiến Lược Giao Dịch',
    'Các chiến lược giao dịch hiệu quả',
    3
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- ========================================
-- STEP 3: Insert Lessons
-- ========================================

-- Module 1 Lessons
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, duration_minutes, video_url, order_index)
VALUES
    ('lesson-1-1', 'module-1', 'course-trading-basics', 'Crypto là gì?', 'Tìm hiểu về cryptocurrency và blockchain technology', 'video', 15, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
    ('lesson-1-2', 'module-1', 'course-trading-basics', 'Tại sao nên đầu tư Crypto?', 'Những lý do khiến crypto trở thành kênh đầu tư hấp dẫn', 'video', 12, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),
    ('lesson-1-3', 'module-1', 'course-trading-basics', 'Các loại Crypto phổ biến', 'Bitcoin, Ethereum, và các altcoins quan trọng', 'video', 20, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- Module 2 Lessons
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, duration_minutes, video_url, order_index)
VALUES
    ('lesson-2-1', 'module-2', 'course-trading-basics', 'Candlestick là gì?', 'Hiểu cách đọc nến Nhật Bản', 'video', 18, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
    ('lesson-2-2', 'module-2', 'course-trading-basics', 'Support và Resistance', 'Xác định các vùng hỗ trợ và kháng cự', 'video', 25, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),
    ('lesson-2-3', 'module-2', 'course-trading-basics', 'Các mẫu hình nến quan trọng', 'Doji, Hammer, Engulfing và các patterns khác', 'video', 30, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- Module 3 Lessons
INSERT INTO course_lessons (id, module_id, course_id, title, description, type, duration_minutes, video_url, order_index)
VALUES
    ('lesson-3-1', 'module-3', 'course-trading-basics', 'Quản lý vốn', 'Cách quản lý rủi ro và bảo toàn vốn', 'video', 22, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1),
    ('lesson-3-2', 'module-3', 'course-trading-basics', 'Entry và Exit points', 'Xác định điểm vào và thoát lệnh', 'video', 28, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2),
    ('lesson-3-3', 'module-3', 'course-trading-basics', 'Stop Loss và Take Profit', 'Đặt SL/TP để bảo vệ tài khoản', 'video', 20, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- ========================================
-- STEP 4: Insert Quizzes
-- ========================================

-- QUIZ 1: Trading Cơ Bản - Crypto là gì?
INSERT INTO quizzes (lesson_id, course_id, title, description, passing_score, time_limit_minutes, max_attempts, shuffle_questions, shuffle_options, show_answers_after, show_explanations)
VALUES (
    'lesson-1-1',
    'course-trading-basics',
    'Kiểm tra: Crypto là gì?',
    'Kiểm tra kiến thức về cryptocurrency cơ bản sau khi xem video bài 1',
    70,
    10,
    3,
    true,
    true,
    true,
    true
) ON CONFLICT (lesson_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- QUIZ 2: Candlestick
INSERT INTO quizzes (lesson_id, course_id, title, description, passing_score, time_limit_minutes, max_attempts, shuffle_questions, shuffle_options, show_answers_after, show_explanations)
VALUES (
    'lesson-2-1',
    'course-trading-basics',
    'Kiểm tra: Candlestick là gì?',
    'Kiểm tra kiến thức về nến Nhật Bản và cách đọc biểu đồ',
    70,
    8,
    3,
    true,
    true,
    true,
    true
) ON CONFLICT (lesson_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- QUIZ 3: Quản Lý Vốn
INSERT INTO quizzes (lesson_id, course_id, title, description, passing_score, time_limit_minutes, max_attempts, shuffle_questions, shuffle_options, show_answers_after, show_explanations)
VALUES (
    'lesson-3-1',
    'course-trading-basics',
    'Kiểm tra: Quản Lý Vốn',
    'Kiểm tra kiến thức về quản lý rủi ro và bảo toàn vốn',
    70,
    10,
    3,
    true,
    true,
    true,
    true
) ON CONFLICT (lesson_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- ========================================
-- STEP 5: Insert Quiz Questions
-- ========================================

-- Questions for Quiz 1 (Crypto là gì?)
DO $$
DECLARE
    quiz_uuid UUID;
BEGIN
    SELECT id INTO quiz_uuid FROM quizzes WHERE lesson_id = 'lesson-1-1';

    IF quiz_uuid IS NOT NULL THEN
        -- Delete existing questions for this quiz (to allow re-running)
        DELETE FROM quiz_questions WHERE quiz_id = quiz_uuid;

        -- Question 1: Multiple Choice
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Bitcoin được tạo ra vào năm nào?',
            'multiple_choice',
            '[
                {"id": "a", "text": "2007", "is_correct": false},
                {"id": "b", "text": "2008", "is_correct": false},
                {"id": "c", "text": "2009", "is_correct": true},
                {"id": "d", "text": "2010", "is_correct": false}
            ]'::jsonb,
            'Bitcoin được tạo ra vào ngày 3 tháng 1 năm 2009 bởi một người hoặc nhóm người dưới bí danh Satoshi Nakamoto. Đây là cryptocurrency đầu tiên trên thế giới.',
            1,
            1
        );

        -- Question 2: True/False
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Blockchain là một cơ sở dữ liệu tập trung (centralized)',
            'true_false',
            '[
                {"id": "true", "text": "Đúng", "is_correct": false},
                {"id": "false", "text": "Sai", "is_correct": true}
            ]'::jsonb,
            'Blockchain là cơ sở dữ liệu phi tập trung (decentralized). Dữ liệu được lưu trữ và xác minh bởi nhiều nodes trên toàn mạng lưới, không có một điểm kiểm soát trung tâm.',
            1,
            2
        );

        -- Question 3: Multiple Choice
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Ai là người sáng tạo ra Bitcoin?',
            'multiple_choice',
            '[
                {"id": "a", "text": "Vitalik Buterin", "is_correct": false},
                {"id": "b", "text": "Satoshi Nakamoto", "is_correct": true},
                {"id": "c", "text": "Charlie Lee", "is_correct": false},
                {"id": "d", "text": "Elon Musk", "is_correct": false}
            ]'::jsonb,
            'Bitcoin được tạo ra bởi Satoshi Nakamoto. Vitalik Buterin là người sáng tạo Ethereum, Charlie Lee tạo ra Litecoin.',
            1,
            3
        );

        -- Question 4: Multiple Select
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Những đặc điểm nào sau đây đúng với cryptocurrency? (Chọn tất cả đáp án đúng)',
            'multiple_select',
            '[
                {"id": "a", "text": "Phi tập trung", "is_correct": true},
                {"id": "b", "text": "Được kiểm soát bởi ngân hàng trung ương", "is_correct": false},
                {"id": "c", "text": "Sử dụng công nghệ blockchain", "is_correct": true},
                {"id": "d", "text": "Có thể giao dịch 24/7", "is_correct": true}
            ]'::jsonb,
            'Cryptocurrency là phi tập trung (không bị kiểm soát bởi ngân hàng trung ương), sử dụng công nghệ blockchain, và có thể giao dịch 24/7 không giống như thị trường chứng khoán truyền thống.',
            2,
            4
        );

        -- Question 5: Fill in Blank
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answers, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Công nghệ nền tảng của Bitcoin được gọi là ___________',
            'fill_blank',
            '[]'::jsonb,
            '["blockchain", "Blockchain", "BLOCKCHAIN", "block chain"]'::jsonb,
            'Blockchain (chuỗi khối) là công nghệ sổ cái phân tán làm nền tảng cho Bitcoin và hầu hết các cryptocurrency khác.',
            1,
            5
        );
    END IF;
END $$;

-- Questions for Quiz 2 (Candlestick)
DO $$
DECLARE
    quiz_uuid UUID;
BEGIN
    SELECT id INTO quiz_uuid FROM quizzes WHERE lesson_id = 'lesson-2-1';

    IF quiz_uuid IS NOT NULL THEN
        -- Delete existing questions for this quiz
        DELETE FROM quiz_questions WHERE quiz_id = quiz_uuid;

        -- Question 1
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Nến xanh (bullish candle) cho thấy điều gì?',
            'multiple_choice',
            '[
                {"id": "a", "text": "Giá đóng cửa thấp hơn giá mở cửa", "is_correct": false},
                {"id": "b", "text": "Giá đóng cửa cao hơn giá mở cửa", "is_correct": true},
                {"id": "c", "text": "Giá không thay đổi", "is_correct": false},
                {"id": "d", "text": "Volume giao dịch cao", "is_correct": false}
            ]'::jsonb,
            'Nến xanh (bullish) có giá đóng cửa cao hơn giá mở cửa, cho thấy phe mua chiếm ưu thế trong phiên giao dịch đó.',
            1,
            1
        );

        -- Question 2
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Bóng nến (shadow/wick) cho biết thông tin gì?',
            'multiple_choice',
            '[
                {"id": "a", "text": "Giá cao nhất và thấp nhất trong phiên", "is_correct": true},
                {"id": "b", "text": "Chỉ giá mở cửa", "is_correct": false},
                {"id": "c", "text": "Chỉ giá đóng cửa", "is_correct": false},
                {"id": "d", "text": "Volume giao dịch", "is_correct": false}
            ]'::jsonb,
            'Bóng nến (shadow/wick) thể hiện mức giá cao nhất (bóng trên) và thấp nhất (bóng dưới) mà giá đã chạm trong phiên giao dịch.',
            1,
            2
        );

        -- Question 3
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Mẫu nến Doji cho thấy điều gì?',
            'multiple_choice',
            '[
                {"id": "a", "text": "Xu hướng tăng mạnh", "is_correct": false},
                {"id": "b", "text": "Xu hướng giảm mạnh", "is_correct": false},
                {"id": "c", "text": "Sự do dự giữa mua và bán", "is_correct": true},
                {"id": "d", "text": "Volume giao dịch thấp", "is_correct": false}
            ]'::jsonb,
            'Nến Doji có giá mở cửa và đóng cửa gần như bằng nhau, cho thấy sự cân bằng giữa phe mua và bán, thường báo hiệu sự do dự hoặc có thể đảo chiều.',
            1,
            3
        );

        -- Question 4: True/False
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Nến búa (Hammer) xuất hiện ở đáy xu hướng giảm thường là tín hiệu đảo chiều tăng',
            'true_false',
            '[
                {"id": "true", "text": "Đúng", "is_correct": true},
                {"id": "false", "text": "Sai", "is_correct": false}
            ]'::jsonb,
            'Nến búa (Hammer) với bóng dưới dài xuất hiện ở đáy xu hướng giảm là một trong những tín hiệu đảo chiều tăng (bullish reversal) phổ biến nhất.',
            1,
            4
        );
    END IF;
END $$;

-- Questions for Quiz 3 (Quản Lý Vốn)
DO $$
DECLARE
    quiz_uuid UUID;
BEGIN
    SELECT id INTO quiz_uuid FROM quizzes WHERE lesson_id = 'lesson-3-1';

    IF quiz_uuid IS NOT NULL THEN
        -- Delete existing questions for this quiz
        DELETE FROM quiz_questions WHERE quiz_id = quiz_uuid;

        -- Question 1
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Theo nguyên tắc quản lý vốn, mỗi lệnh nên rủi ro bao nhiêu phần trăm tài khoản?',
            'multiple_choice',
            '[
                {"id": "a", "text": "10-20%", "is_correct": false},
                {"id": "b", "text": "5-10%", "is_correct": false},
                {"id": "c", "text": "1-2%", "is_correct": true},
                {"id": "d", "text": "50%", "is_correct": false}
            ]'::jsonb,
            'Quy tắc 1-2% là nguyên tắc vàng trong quản lý vốn. Mỗi lệnh chỉ nên rủi ro 1-2% tổng tài khoản để bảo vệ vốn khỏi những chuỗi thua lỗ.',
            1,
            1
        );

        -- Question 2
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Risk/Reward ratio 1:3 có nghĩa là gì?',
            'multiple_choice',
            '[
                {"id": "a", "text": "Rủi ro 3 đồng để có thể lời 1 đồng", "is_correct": false},
                {"id": "b", "text": "Rủi ro 1 đồng để có thể lời 3 đồng", "is_correct": true},
                {"id": "c", "text": "Win rate 30%", "is_correct": false},
                {"id": "d", "text": "Win rate 75%", "is_correct": false}
            ]'::jsonb,
            'Risk/Reward 1:3 nghĩa là với mỗi đơn vị rủi ro, bạn có thể kiếm được 3 đơn vị lợi nhuận. Đây là tỷ lệ lý tưởng cho trading.',
            1,
            2
        );

        -- Question 3: Multiple Select
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Những yếu tố nào sau đây là quan trọng trong quản lý vốn? (Chọn tất cả đáp án đúng)',
            'multiple_select',
            '[
                {"id": "a", "text": "Đặt Stop Loss cho mọi lệnh", "is_correct": true},
                {"id": "b", "text": "Không bao giờ rủi ro quá 2% mỗi lệnh", "is_correct": true},
                {"id": "c", "text": "All-in vào một lệnh khi chắc chắn", "is_correct": false},
                {"id": "d", "text": "Có kế hoạch trading rõ ràng", "is_correct": true}
            ]'::jsonb,
            'Quản lý vốn hiệu quả bao gồm: luôn đặt Stop Loss, tuân thủ quy tắc 1-2%, và có kế hoạch trading rõ ràng. Không bao giờ "all-in" vào một lệnh.',
            2,
            3
        );

        -- Question 4
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Nếu bạn có tài khoản $10,000 và tuân theo quy tắc 2%, số tiền rủi ro tối đa cho mỗi lệnh là bao nhiêu?',
            'multiple_choice',
            '[
                {"id": "a", "text": "$100", "is_correct": false},
                {"id": "b", "text": "$200", "is_correct": true},
                {"id": "c", "text": "$500", "is_correct": false},
                {"id": "d", "text": "$1,000", "is_correct": false}
            ]'::jsonb,
            '$10,000 x 2% = $200. Với quy tắc 2%, bạn chỉ nên rủi ro tối đa $200 cho mỗi lệnh giao dịch.',
            1,
            4
        );

        -- Question 5: True/False
        INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, points, order_index)
        VALUES (
            quiz_uuid,
            'Leverage (đòn bẩy) cao giúp kiếm nhiều tiền hơn mà không tăng rủi ro',
            'true_false',
            '[
                {"id": "true", "text": "Đúng", "is_correct": false},
                {"id": "false", "text": "Sai", "is_correct": true}
            ]'::jsonb,
            'SAI! Leverage cao làm tăng cả lợi nhuận tiềm năng VÀ rủi ro. Với leverage 10x, một biến động 10% có thể khiến bạn mất toàn bộ vốn.',
            1,
            5
        );
    END IF;
END $$;

-- ========================================
-- SUMMARY
-- ========================================
-- This seed file creates:
-- 1 Course: Trading Cơ Bản
-- 3 Modules with 9 Lessons total
-- 3 Quizzes with 14 Questions total
--
-- Question types used:
-- - multiple_choice: 9 questions
-- - true_false: 3 questions
-- - multiple_select: 2 questions (with 2 points each)
-- - fill_blank: 1 question

SELECT 'Sample course and quiz data inserted successfully!' as status;
