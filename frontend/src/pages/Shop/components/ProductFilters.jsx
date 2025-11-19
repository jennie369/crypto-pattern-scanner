import React from 'react';
import { Search } from 'lucide-react';
import CategoryDropdown from '../../../components/Shop/CategoryDropdown';

const ProductFilters = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  priceRanges
}) => {
  const sortOptions = [
    { id: 'featured', label: 'Nổi Bật' },
    { id: 'name', label: 'Tên A-Z' },
    { id: 'price-asc', label: 'Giá Thấp → Cao' },
    { id: 'price-desc', label: 'Giá Cao → Thấp' }
  ];

  return (
    <div className="product-filters-section">
      {/* Search Bar */}
      <div className="filter-search-bar">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Filters Row */}
      <div className="filters-row">
        {/* Category Dropdown */}
        <div className="filter-item">
          <label className="filter-label">Danh Mục</label>
          <CategoryDropdown
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
          />
        </div>

        {/* Price Range */}
        <div className="filter-item">
          <label className="filter-label">Khoảng Giá</label>
          <select
            value={priceRanges?.selected || 'all'}
            onChange={(e) => priceRanges?.onChange(e.target.value)}
            className="filter-select"
          >
            {(priceRanges?.options || []).map(range => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="filter-item">
          <label className="filter-label">Sắp Xếp</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
