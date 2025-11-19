import React, { useState } from 'react';
import {
  ArrowRight, ArrowLeft, Sparkles, Frown, Wind, Search, Rocket,
  Moon, HeartCrack, Target, Zap, Heart, Smile, GraduationCap,
  TrendingUp, HelpCircle, Gem, PartyPopper, Waves, Flame,
  Flower2, Mountain, BookOpen, Crown, DollarSign, Check, Star,
  ShoppingCart, ExternalLink
} from 'lucide-react';
import './Section2_Quiz.css';

export default function Section2_Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    {
      id: 1,
      question: "Bạn cảm thấy thế nào về tình trạng hiện tại của mình?",
      options: [
        { icon: <Frown size={32} />, text: "Mệt mỏi, stress, cảm giác bế tắc", value: "stressed" },
        { icon: <Wind size={32} />, text: "Thiếu ổn định, tâm trạng thất thường", value: "unstable" },
        { icon: <Search size={32} />, text: "Đang tìm kiếm hướng đi mới", value: "searching" },
        { icon: <Rocket size={32} />, text: "Tràn đầy năng lượng, muốn đột phá", value: "ambitious" }
      ]
    },
    {
      id: 2,
      question: "Điều gì khiến bạn cảm thấy khó chịu nhất hiện tại?",
      options: [
        { icon: <Moon size={32} />, text: "Mất ngủ, nghỉ ngơi không đủ", value: "stressed" },
        { icon: <HeartCrack size={32} />, text: "Mối quan hệ căng thẳng", value: "unstable" },
        { icon: <Target size={32} />, text: "Thiếu định hướng rõ ràng", value: "searching" },
        { icon: <Zap size={32} />, text: "Không có vấn đề lớn, chỉ muốn tốt hơn", value: "ambitious" }
      ]
    },
    {
      id: 3,
      question: "Bạn muốn cải thiện điều gì nhất trong 3 tháng tới?",
      options: [
        { icon: <Heart size={32} />, text: "Sức khỏe tinh thần, giảm stress", value: "stressed" },
        { icon: <Smile size={32} />, text: "Tâm trạng ổn định hơn", value: "unstable" },
        { icon: <GraduationCap size={32} />, text: "Tìm được passion và mục tiêu", value: "searching" },
        { icon: <TrendingUp size={32} />, text: "Tăng năng suất và thành công", value: "ambitious" }
      ]
    },
    {
      id: 4,
      question: "Môi trường làm việc/sống của bạn hiện tại như thế nào?",
      options: [
        { icon: <Wind size={32} />, text: "Lộn xộn, thiếu trật tự", value: "stressed" },
        { icon: <Frown size={32} />, text: "Bình thường nhưng thiếu năng lượng", value: "unstable" },
        { icon: <HelpCircle size={32} />, text: "Chưa phản ánh được cá tính", value: "searching" },
        { icon: <Sparkles size={32} />, text: "Đẹp nhưng muốn nâng cấp", value: "ambitious" }
      ]
    },
    {
      id: 5,
      question: "Bạn tin vào năng lượng và tần số không gian ở mức nào?",
      options: [
        { icon: <Heart size={32} />, text: "Rất tin, đang cần giải pháp ngay", value: "stressed" },
        { icon: <HelpCircle size={32} />, text: "Tin nhưng chưa thử nghiêm túc", value: "unstable" },
        { icon: <Sparkles size={32} />, text: "Tò mò, muốn khám phá thêm", value: "searching" },
        { icon: <Gem size={32} />, text: "Đã có kinh nghiệm, muốn nâng cao", value: "ambitious" }
      ]
    }
  ];

  const results = {
    stressed: {
      title: "Bạn Cần Bình Yên Và Thư Giãn",
      titleIcon: <Heart size={24} />,
      description: "Bạn đang trong giai đoạn căng thẳng, cần không gian giúp xoa dịu tâm trí và phục hồi năng lượng.",
      recommendation: "Chúng tôi khuyên bạn bắt đầu với:",
      products: [
        {
          image: <Gem size={48} />,
          name: "Thạch Anh Tím (Amethyst)",
          price: "850,000đ",
          description: "Giảm stress, cải thiện giấc ngủ",
          link: "/shop?category=crystals"
        },
        {
          image: <Waves size={48} />,
          name: "Aquamarine",
          price: "1,200,000đ",
          description: "Mang lại bình yên nội tâm",
          link: "/shop?category=crystals"
        },
        {
          image: <Flame size={48} />,
          name: "Set Meditation Starter",
          price: "2,500,000đ",
          description: "Bộ thiền định cơ bản hoàn chỉnh",
          link: "/shop?category=crystals"
        }
      ],
      cta: "Xem Bộ Sưu Tập Thư Giãn"
    },
    unstable: {
      title: "Bạn Cần Ổn Định Và Cân Bằng",
      titleIcon: <Heart size={24} />,
      description: "Tâm trạng thất thường cho thấy bạn cần điều chỉnh năng lượng để đạt được sự hài hòa.",
      recommendation: "Chúng tôi khuyên bạn bắt đầu với:",
      products: [
        {
          image: <Flower2 size={48} />,
          name: "Thạch Anh Hồng (Rose Quartz)",
          price: "750,000đ",
          description: "Cân bằng cảm xúc, yêu thương bản thân",
          link: "/shop?category=crystals"
        },
        {
          image: <Mountain size={48} />,
          name: "Hematite",
          price: "680,000đ",
          description: "Ổn định năng lượng, grounding",
          link: "/shop?category=crystals"
        },
        {
          image: <Flower2 size={48} />,
          name: "Green Jade",
          price: "950,000đ",
          description: "Hài hòa tâm - thân - khí",
          link: "/shop?category=crystals"
        }
      ],
      cta: "Xem Bộ Sưu Tập Cân Bằng"
    },
    searching: {
      title: "Bạn Đang Tìm Kiếm Định Hướng",
      titleIcon: <Search size={24} />,
      description: "Bạn ở giai đoạn khám phá bản thân. Cần công cụ giúp kết nối với trực giác và tìm ra con đường phù hợp.",
      recommendation: "Chúng tôi khuyên bạn bắt đầu với:",
      products: [
        {
          image: <Sparkles size={48} />,
          name: "Lapis Lazuli",
          price: "1,500,000đ",
          description: "Khai mở trí tuệ, tìm chân lý",
          link: "/shop?category=crystals"
        },
        {
          image: <Sparkles size={48} />,
          name: "Clear Quartz",
          price: "650,000đ",
          description: "Tăng cường trực giác và năng lượng",
          link: "/shop?category=crystals"
        },
        {
          image: <BookOpen size={48} />,
          name: "Khóa Học 'Tìm Mục Đích'",
          price: "4,900,000đ",
          description: "Workshop 21 ngày tìm passion",
          link: "/shop?category=courses"
        }
      ],
      cta: "Xem Bộ Sưu Tập Khám Phá"
    },
    ambitious: {
      title: "Bạn Sẵn Sàng Bứt Phá",
      titleIcon: <Rocket size={24} />,
      description: "Năng lượng cao, tham vọng lớn. Bạn cần công cụ cao cấp để tối ưu hóa và đạt đỉnh cao.",
      recommendation: "Chúng tôi khuyên bạn bắt đầu với:",
      products: [
        {
          image: <Crown size={48} />,
          name: "Citrine (Thạch Anh Vàng)",
          price: "1,800,000đ",
          description: "Thu hút thịnh vượng và giàu có",
          link: "/shop?category=crystals"
        },
        {
          image: <DollarSign size={48} />,
          name: "Pyrite (Vàng Fool)",
          price: "1,200,000đ",
          description: "Tăng may mắn tài chính",
          link: "/shop?category=crystals"
        },
        {
          image: <TrendingUp size={48} />,
          name: "VIP Trading Course",
          price: "9,900,000đ",
          description: "Chiến lược đầu tư chuyên sâu",
          link: "/shop?category=courses"
        }
      ],
      cta: "Xem Bộ Sưu Tập Elite"
    }
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const goNext = () => {
    if (currentQuestion === 5) {
      setShowResult(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goBack = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(1);
    setAnswers({});
    setShowResult(false);
  };

  // Calculate result based on most common answer
  const getResult = () => {
    const answerCounts = Object.values(answers).reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    const mostCommon = Object.keys(answerCounts).reduce((a, b) =>
      answerCounts[a] > answerCounts[b] ? a : b
    );

    return results[mostCommon];
  };

  return (
    <section className="quiz-section">
      <div className="quiz-container">

        {!showResult ? (
          <>
            {/* Quiz Header */}
            <div className="quiz-header">
              <p className="quiz-eyebrow">KHÁM PHÁ BẢN THÂN</p>
              <h2 className="quiz-title">
                Bạn Đang Cần Gì Nhất<br />
                Để <span className="gradient-text">Chuyển Hóa Năng Lượng</span>?
              </h2>
              <p className="quiz-subtitle">Trả lời 5 câu hỏi nhanh để nhận gợi ý phù hợp</p>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(currentQuestion / 5) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text">Câu hỏi {currentQuestion}/5</p>
            </div>

            {/* Question Card */}
            <QuestionCard
              question={questions[currentQuestion - 1]}
              selectedAnswer={answers[currentQuestion]}
              onAnswer={handleAnswer}
            />

            {/* Navigation */}
            <div className="quiz-nav">
              {currentQuestion > 1 && (
                <button className="btn-back" onClick={goBack}>
                  <ArrowLeft size={20} />
                  <span>Quay lại</span>
                </button>
              )}
              <button
                className="btn-next"
                onClick={goNext}
                disabled={!answers[currentQuestion]}
              >
                <span>{currentQuestion === 5 ? 'Xem Kết Quả' : 'Tiếp theo'}</span>
                {currentQuestion === 5 ? <Sparkles size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>
          </>
        ) : (
          <ResultCard result={getResult()} onReset={resetQuiz} />
        )}

      </div>
    </section>
  );
}

// Sub-components
function QuestionCard({ question, selectedAnswer, onAnswer }) {
  return (
    <div className="question-card">
      <h3 className="question-text">{question.question}</h3>

      <div className="options-grid">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`answer-option ${selectedAnswer === option.value ? 'selected' : ''}`}
            onClick={() => onAnswer(option.value)}
          >
            <div className="option-emoji">{option.icon}</div>
            <div className="option-text">{option.text}</div>
            {selectedAnswer === option.value && (
              <div className="selected-indicator"><Check size={20} /></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result, onReset }) {
  return (
    <div className="result-card">
      <div className="result-header">
        <div className="result-icon"><PartyPopper size={48} /></div>
        <h2 className="result-title">
          {result.title} {result.titleIcon}
        </h2>
        <p className="result-description">{result.description}</p>
      </div>

      <div className="result-body">
        <p className="result-recommendation">{result.recommendation}</p>

        <div className="products-grid">
          {result.products.map((product, index) => (
            <ProductRecommendationCard key={index} product={product} />
          ))}
        </div>

        <div className="result-actions">
          <button className="btn-cta-primary">
            <span>{result.cta}</span>
            <ArrowRight size={20} />
          </button>
          <button className="btn-cta-secondary" onClick={onReset}>
            Làm Lại Quiz
          </button>
        </div>
      </div>

      {/* Social Proof */}
      <div className="result-social-proof">
        <div className="proof-item">
          <span className="proof-number">2,847</span>
          <span className="proof-label">người đã tìm thấy đáp án</span>
        </div>
        <div className="proof-divider">•</div>
        <div className="proof-item">
          <span className="proof-number">
            4.9<Star size={16} style={{display: 'inline', verticalAlign: 'middle', marginLeft: '4px'}} fill="#FFBD59" color="#FFBD59" />
          </span>
          <span className="proof-label">độ chính xác</span>
        </div>
      </div>
    </div>
  );
}

function ProductRecommendationCard({ product }) {
  return (
    <div className="product-recommendation-card">
      <div className="product-image-container">
        <div className="product-image-placeholder">{product.image}</div>
      </div>

      <div className="product-card-content">
        <h4 className="product-card-name">{product.name}</h4>
        <p className="product-card-price">{product.price}</p>
        <p className="product-card-description">{product.description}</p>

        <a href={product.link} className="btn-view-product">
          <ShoppingCart size={16} />
          <span>Xem Sản Phẩm</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
