import React from 'react';
import { Sparkles, BookOpen, TrendingUp, FileText, Gem, Book, BarChart3, BookText } from 'lucide-react';

const CategoryGrid = ({ selectedCategory, onSelectCategory }) => {
  const categories = [
    {
      id: 'crystals',
      label: 'Đá Quý & Pha Lê',
      icon: Sparkles,
      description: 'Năng lượng tinh thần',
      color: '#1E3A8A',
      image: Gem
    },
    {
      id: 'courses',
      label: 'Khóa Học Trading',
      icon: BookOpen,
      description: 'Chiến lược đầu tư',
      color: '#2563EB',
      image: Book
    },
    {
      id: 'tools',
      label: 'Công Cụ Trading',
      icon: TrendingUp,
      description: 'Phân tích chuyên sâu',
      color: '#0ECB81',
      image: BarChart3
    },
    {
      id: 'books',
      label: 'Sách & Tài Liệu',
      icon: FileText,
      description: 'Kiến thức nền tảng',
      color: '#F59E0B',
      image: BookText
    }
  ];

  return (
    <div className="category-grid-section">
      <div className="section-header">
        <h2 className="section-title">Danh Mục Sản Phẩm</h2>
        <p className="section-subtitle">Lựa chọn danh mục phù hợp với bạn</p>
      </div>

      <div className="category-grid">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;

          return (
            <div
              key={category.id}
              className={`category-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(category.id)}
              style={{
                '--category-color': category.color
              }}
            >
              <div className="category-icon-wrapper">
                <category.image className="category-emoji" size={32} strokeWidth={1.5} />
                <Icon className="category-icon-svg" size={24} />
              </div>

              <h3 className="category-name">{category.label}</h3>
              <p className="category-description">{category.description}</p>

              <div className="category-arrow">→</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryGrid;
