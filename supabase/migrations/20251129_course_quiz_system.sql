-- ========================================
-- GEM Platform - Course Quiz System Migration
-- Adds quiz tables, content JSONB, and reviews
-- Date: 2025-11-29
-- ========================================

-- ========================================
-- ALTER: Add content_blocks to course_lessons
-- For hybrid content (video + text/images)
-- ========================================
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]';
COMMENT ON COLUMN course_lessons.content_blocks IS 'JSONB array of content blocks for article/text lessons. Format: [{type, ...data}]';

-- ========================================
-- TABLE: quizzes
-- Quiz metadata linked to lessons
-- ========================================
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    -- Quiz Info
    title TEXT NOT NULL,
    description TEXT,

    -- Settings
    passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
    time_limit_minutes INTEGER, -- NULL = no limit
    max_attempts INTEGER DEFAULT 3, -- NULL = unlimited

    -- Options
    shuffle_questions BOOLEAN DEFAULT true,
    shuffle_options BOOLEAN DEFAULT false,
    show_answers_after BOOLEAN DEFAULT true,
    show_explanations BOOLEAN DEFAULT true,
    allow_review BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id);

COMMENT ON TABLE quizzes IS 'Quiz metadata for quiz-type lessons';

-- ========================================
-- TABLE: quiz_questions
-- Individual questions within quizzes
-- ========================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,

    -- Question content
    question_text TEXT NOT NULL,
    question_image TEXT, -- Optional image URL

    -- Question type
    question_type TEXT DEFAULT 'multiple_choice'
        CHECK (question_type IN ('multiple_choice', 'multiple_select', 'true_false', 'fill_blank')),

    -- Options (JSONB for flexibility)
    -- Format: [{ id: 'a', text: 'Option text', is_correct: true/false }]
    options JSONB NOT NULL DEFAULT '[]',

    -- For fill_blank type: correct answers (can have multiple accepted answers)
    correct_answers JSONB DEFAULT '[]', -- ['answer1', 'answer2']

    -- Explanation shown after answer
    explanation TEXT,

    -- Scoring
    points INTEGER DEFAULT 1 CHECK (points >= 0),

    -- Ordering
    order_index INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON quiz_questions(quiz_id, order_index);

COMMENT ON TABLE quiz_questions IS 'Quiz questions with support for multiple types';

-- ========================================
-- TABLE: quiz_attempts
-- User quiz attempt history
-- ========================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    -- Attempt info
    attempt_number INTEGER DEFAULT 1,

    -- Answers submitted
    -- Format: { question_id: selected_option_id OR [selected_ids] OR 'text_answer' }
    answers JSONB NOT NULL DEFAULT '{}',

    -- Results
    score INTEGER DEFAULT 0,
    max_score INTEGER NOT NULL,
    score_percentage DECIMAL(5,2) DEFAULT 0,
    passed BOOLEAN DEFAULT false,

    -- Timing
    time_spent_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Graded answers with correct/incorrect status
    -- Format: [{ question_id, selected, correct, is_correct: true/false }]
    graded_answers JSONB DEFAULT '[]'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_attempts_passed ON quiz_attempts(user_id, quiz_id, passed);

COMMENT ON TABLE quiz_attempts IS 'User quiz attempt history with graded results';

-- ========================================
-- TABLE: course_reviews
-- User ratings and reviews for courses
-- ========================================
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    -- Rating (1-5 stars)
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

    -- Review text (optional)
    review_text TEXT,

    -- Verification
    is_verified BOOLEAN DEFAULT false, -- true if user completed course

    -- Engagement
    helpful_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_course ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON course_reviews(course_id, rating);

COMMENT ON TABLE course_reviews IS 'Course ratings and reviews from users';

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on new tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- Quizzes: Anyone can view (part of course content)
CREATE POLICY "Anyone can view quizzes"
ON quizzes FOR SELECT
USING (true);

-- Quiz Questions: Anyone can view
CREATE POLICY "Anyone can view quiz questions"
ON quiz_questions FOR SELECT
USING (true);

-- Quiz Attempts: Users can only see/create their own
CREATE POLICY "Users can view own quiz attempts"
ON quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quiz attempts"
ON quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts"
ON quiz_attempts FOR UPDATE
USING (auth.uid() = user_id);

-- Course Reviews: Anyone can view, users can manage their own
CREATE POLICY "Anyone can view course reviews"
ON course_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create own reviews"
ON course_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON course_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON course_reviews FOR DELETE
USING (auth.uid() = user_id);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function: Get user's attempt count for a quiz
CREATE OR REPLACE FUNCTION get_user_quiz_attempt_count(p_user_id UUID, p_quiz_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM quiz_attempts
    WHERE user_id = p_user_id AND quiz_id = p_quiz_id AND completed_at IS NOT NULL;

    RETURN v_count;
END;
$$;

-- Function: Check if user can retake quiz
CREATE OR REPLACE FUNCTION can_retake_quiz(p_user_id UUID, p_quiz_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_max_attempts INTEGER;
    v_current_attempts INTEGER;
BEGIN
    -- Get max attempts for quiz
    SELECT max_attempts INTO v_max_attempts
    FROM quizzes
    WHERE id = p_quiz_id;

    -- If no limit, always can retake
    IF v_max_attempts IS NULL THEN
        RETURN true;
    END IF;

    -- Count current attempts
    v_current_attempts := get_user_quiz_attempt_count(p_user_id, p_quiz_id);

    RETURN v_current_attempts < v_max_attempts;
END;
$$;

-- Function: Get user's best quiz score
CREATE OR REPLACE FUNCTION get_best_quiz_score(p_user_id UUID, p_quiz_id UUID)
RETURNS TABLE(score INTEGER, max_score INTEGER, percentage DECIMAL, passed BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        qa.score,
        qa.max_score,
        qa.score_percentage,
        qa.passed
    FROM quiz_attempts qa
    WHERE qa.user_id = p_user_id
      AND qa.quiz_id = p_quiz_id
      AND qa.completed_at IS NOT NULL
    ORDER BY qa.score_percentage DESC
    LIMIT 1;
END;
$$;

-- Function: Update course average rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    v_avg_rating DECIMAL(2,1);
BEGIN
    -- Calculate new average rating
    SELECT ROUND(AVG(rating)::DECIMAL, 1) INTO v_avg_rating
    FROM course_reviews
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id);

    -- Update course rating
    UPDATE courses
    SET rating = v_avg_rating
    WHERE id = COALESCE(NEW.course_id, OLD.course_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger: Auto-update course rating on review changes
DROP TRIGGER IF EXISTS trigger_update_course_rating ON course_reviews;
CREATE TRIGGER trigger_update_course_rating
AFTER INSERT OR UPDATE OR DELETE ON course_reviews
FOR EACH ROW
EXECUTE FUNCTION update_course_rating();

-- ========================================
-- SAMPLE QUIZ DATA (for testing)
-- ========================================
/*
-- Sample quiz for Trading Cơ Bản course
INSERT INTO quizzes (lesson_id, course_id, title, description, passing_score, time_limit_minutes, max_attempts)
VALUES (
    'lesson-1-1',
    'course-trading-basics',
    'Kiểm tra: Crypto là gì?',
    'Kiểm tra kiến thức về cryptocurrency cơ bản',
    70,
    10,
    3
);

-- Sample questions
INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index)
SELECT
    id,
    'Bitcoin được tạo ra vào năm nào?',
    'multiple_choice',
    '[
        {"id": "a", "text": "2007", "is_correct": false},
        {"id": "b", "text": "2008", "is_correct": false},
        {"id": "c", "text": "2009", "is_correct": true},
        {"id": "d", "text": "2010", "is_correct": false}
    ]'::jsonb,
    'Bitcoin được tạo ra vào năm 2009 bởi Satoshi Nakamoto',
    1
FROM quizzes WHERE lesson_id = 'lesson-1-1';

INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, explanation, order_index)
SELECT
    id,
    'Blockchain là một cơ sở dữ liệu tập trung',
    'true_false',
    '[
        {"id": "true", "text": "Đúng", "is_correct": false},
        {"id": "false", "text": "Sai", "is_correct": true}
    ]'::jsonb,
    'Blockchain là cơ sở dữ liệu phi tập trung (decentralized), không phải tập trung',
    2
FROM quizzes WHERE lesson_id = 'lesson-1-1';
*/

-- ========================================
-- COMMENTS
-- ========================================
COMMENT ON FUNCTION get_user_quiz_attempt_count IS 'Returns the number of completed quiz attempts by a user';
COMMENT ON FUNCTION can_retake_quiz IS 'Checks if user has attempts remaining for a quiz';
COMMENT ON FUNCTION get_best_quiz_score IS 'Returns the best quiz score for a user';
COMMENT ON FUNCTION update_course_rating IS 'Auto-updates course average rating when reviews change';
