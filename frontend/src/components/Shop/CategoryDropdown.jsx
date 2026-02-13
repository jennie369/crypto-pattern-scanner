import React, { useState } from 'react';
import { ChevronDown, Package, Sparkles, BookOpen, TrendingUp, FileText, Check } from 'lucide-react';
import './CategoryDropdown.css';

const CategoryDropdown = ({ categories, selectedCategory, onSelectCategory }) => {
  const [isOpen, setIsOpen] = useState(false);

  const categoryIcons = {
    'all': Package,
    'crystals': Sparkles,
    'courses': BookOpen,
    'tools': TrendingUp,
    'books': FileText,
  };

  const getCategoryIcon = (id) => {
    const Icon = categoryIcons[id] || Package;
    return <Icon size={18} />;
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="category-dropdown-container">
      <button
        className="category-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-category">
          {getCategoryIcon(selectedCategory)}
          <span>{selectedCategoryData?.label || 'Tất Cả'}</span>
        </div>
        <ChevronDown
          size={20}
          className={`chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="category-dropdown-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="category-dropdown-menu">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-option ${selectedCategory === category.id ? 'active' : ''
                  }`}
                onClick={() => {
                  onSelectCategory(category.id);
                  setIsOpen(false);
                }}
              >
                {getCategoryIcon(category.id)}
                <span>{category.label}</span>
                {selectedCategory === category.id && (
                  <span className="check-mark">
                    <Check size={16} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryDropdown;
