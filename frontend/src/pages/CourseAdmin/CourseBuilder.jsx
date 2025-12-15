/**
 * CourseBuilder - Create/Edit Course
 * Matching mobile CourseBuilderScreen design
 * Fields: Title, Description, Thumbnail, Price, Duration, Shopify Product, Publish Status
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Image,
  X,
  Loader2,
  AlertCircle,
  Check,
  BookOpen,
  DollarSign,
  Clock,
  Link,
  ChevronRight,
  Trash2,
  Search,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { shopifyService } from '../../services/shopify';
import './CourseBuilder.css';

export default function CourseBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, profile, canCreateCourse, canEditCourse } = useAuth();
  const isEditing = !!courseId;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Debug log
  console.log('[CourseBuilder] Render:', { user: !!user, profile, isEditing, canCreate: profile ? canCreateCourse() : 'no profile' });

  // Show message if no profile yet - DISABLED FOR DEBUG
  // if (!user) {
  //   return (
  //     <div className="course-builder-page">
  //       <div className="builder-error">
  //         <AlertCircle size={48} />
  //         <h2>Vui lòng đăng nhập</h2>
  //         <p style={{ color: 'var(--text-muted)' }}>Bạn cần đăng nhập để tạo khóa học</p>
  //         <button onClick={() => navigate('/login')} className="btn-back-admin">
  //           Đăng nhập
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Form state - matching mobile fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    price: '',
    membership_duration_days: '',
    shopify_product_id: '',
    is_free_preview: false,
    is_published: false,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Shopify products state
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Check access on mount - DISABLED FOR DEBUG
  // useEffect(() => {
  //   if (profile !== null) {
  //     if (!isEditing && !canCreateCourse()) {
  //       console.log('[CourseBuilder] No permission to create, redirecting...');
  //       navigate('/courses/admin');
  //       return;
  //     }
  //   }
  // }, [profile, isEditing, canCreateCourse, navigate]);

  // Load Shopify products
  useEffect(() => {
    loadShopifyProducts();
  }, []);

  const loadShopifyProducts = async () => {
    try {
      setLoadingProducts(true);
      console.log('[CourseBuilder] Loading products from Shopify Edge Function...');

      // Use shopifyService to fetch products via Edge Function (same as mobile)
      // This syncs products to shopify_products table automatically
      const products = await shopifyService.getProducts(100, true);

      if (products && products.length > 0) {
        // Map to format expected by product picker
        const mappedProducts = products.map(p => ({
          id: p.shopify_product_id || p.id,
          title: p.title,
          handle: p.handle,
          images: p.image_url ? [{ src: p.image_url }] : (p.images || []),
          variants: p.variants || [{ price: p.price?.toString() || '0' }],
          price: p.price,
          tags: p.tags || [],
        }));

        console.log('[CourseBuilder] ✅ Loaded', mappedProducts.length, 'products from Shopify');
        setShopifyProducts(mappedProducts);
      } else {
        console.warn('[CourseBuilder] ⚠️ No products returned from Shopify');
        setShopifyProducts([]);
      }
    } catch (error) {
      console.error('[CourseBuilder] ❌ Load products error:', error);
      setShopifyProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Get selected product info
  const getSelectedProductInfo = () => {
    if (!formData.shopify_product_id) return null;
    return shopifyProducts.find(p => {
      const pId = p.id?.toString() || '';
      return pId === formData.shopify_product_id || p.id === formData.shopify_product_id;
    });
  };

  // Filter products by search
  const getFilteredProducts = () => {
    if (!productSearchQuery.trim()) return shopifyProducts;
    const query = productSearchQuery.toLowerCase().trim();
    return shopifyProducts.filter(p =>
      p.title?.toLowerCase().includes(query)
    );
  };

  // Fetch course for editing - only run once when courseId changes
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('[CourseBuilder] Fetching course:', courseId);
        const course = await courseService.getCourseDetail(courseId);

        if (!course) {
          setError('Không tìm thấy khóa học');
          setIsLoading(false);
          return;
        }

        console.log('[CourseBuilder] Course loaded:', course.title);

        setFormData({
          title: course.title || '',
          description: course.description || '',
          thumbnail_url: course.thumbnail_url || '',
          price: course.price?.toString() || '',
          membership_duration_days: course.membership_duration_days?.toString() || '',
          shopify_product_id: course.shopify_product_id || '',
          is_free_preview: course.tier_required === 'FREE' || !course.shopify_product_id,
          is_published: course.is_published || false,
        });

        if (course.thumbnail_url) {
          setThumbnailPreview(course.thumbnail_url);
        }
      } catch (err) {
        console.error('[CourseBuilder] Error:', err);
        setError('Không thể tải thông tin khóa học');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]); // Only depend on courseId, not on profile/canEditCourse

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, thumbnail: 'Vui lòng chọn file ảnh' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, thumbnail: 'Kích thước ảnh tối đa 5MB' }));
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, thumbnail: null }));
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setFormData(prev => ({ ...prev, thumbnail_url: '' }));
  };

  // Validate form - only title and description required
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên khóa học';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả khóa học';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async (continueToModules = false) => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        thumbnail_url: formData.thumbnail_url,
        price: formData.price ? parseFloat(formData.price) : null,
        membership_duration_days: formData.membership_duration_days ? parseInt(formData.membership_duration_days) : null,
        shopify_product_id: formData.shopify_product_id || null,
        tier_required: (!formData.shopify_product_id && formData.is_free_preview) ? 'FREE' : null,
        is_published: formData.is_published,
      };

      let savedCourseId = courseId;

      if (thumbnailFile) {
        const thumbnailUrl = await courseService.uploadThumbnail(thumbnailFile);
        courseData.thumbnail_url = thumbnailUrl;
      }

      if (isEditing) {
        const updateResult = await courseService.updateCourse(courseId, courseData);
        if (!updateResult.success) {
          throw new Error(updateResult.error || 'Không thể cập nhật khóa học');
        }
        setSuccessMessage('Đã lưu thay đổi');
      } else {
        const result = await courseService.createCourse(courseData, user.id);
        if (!result.success) {
          throw new Error(result.error || 'Không thể tạo khóa học');
        }
        savedCourseId = result.data?.id;
        setSuccessMessage('Đã tạo khóa học');
      }

      setTimeout(() => setSuccessMessage(''), 2000);

      if (continueToModules && savedCourseId) {
        navigate(`/courses/admin/edit/${savedCourseId}/modules`);
      } else if (!isEditing && savedCourseId) {
        navigate(`/courses/admin/edit/${savedCourseId}`, { replace: true });
      }
    } catch (err) {
      console.error('[CourseBuilder] Save error:', err);
      setError(err.message || 'Không thể lưu khóa học');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="course-builder-page">
        <div className="builder-loading">
          <Loader2 size={48} className="loading-spinner-icon" />
          <p>Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !formData.title) {
    return (
      <div className="course-builder-page">
        <div className="builder-error">
          <AlertCircle size={48} />
          <h2>{error}</h2>
          <button onClick={() => navigate('/courses/admin')} className="btn-back-admin">
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const selectedProduct = getSelectedProductInfo();

  return (
    <div className="course-builder-page">
      {/* Header */}
      <div className="builder-header">
        <button className="btn-back" onClick={() => navigate('/courses/admin')}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <h1 className="builder-title">
          <BookOpen size={28} />
          {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        </h1>

        <div className="builder-actions">
          {isEditing && (
            <button
              className="btn-preview"
              onClick={() => window.open(`/courses/${courseId}?preview=admin`, '_blank')}
              title="Xem trước khóa học (chế độ Admin Preview)"
            >
              <Eye size={18} />
              Xem trước
            </button>
          )}
          <button
            className="btn-save"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 size={18} className="loading-spinner-icon" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            className="btn-save-continue"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu & Thêm nội dung'}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="message-success">
          <Check size={18} />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="message-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Form */}
      <div className="builder-form">
        <div className="form-grid">
          {/* Left Column - Main Info */}
          <div className="form-column">
            {/* Section: Thông tin cơ bản */}
            <div className="form-section">
              <h3 className="section-title">Thông tin cơ bản</h3>

              {/* Title */}
              <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
                <label className="form-label">Tên khóa học *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: Trading Cơ Bản cho Người Mới"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              {/* Description */}
              <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-textarea"
                  placeholder="Mô tả ngắn về khóa học..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                />
                {errors.description && <span className="form-error">{errors.description}</span>}
              </div>
            </div>

            {/* Section: Giá & Quyền truy cập */}
            <div className="form-section">
              <h3 className="section-title">Giá & Quyền truy cập</h3>

              {/* Access Type Info */}
              <div className="form-group">
                <label className="form-label">Quyền truy cập</label>
                <div className="access-info-card">
                  {formData.shopify_product_id ? (
                    <>
                      <div className="access-info-row">
                        <span className="access-badge access-badge-paid">YÊU CẦU MUA</span>
                        <span className="access-info-text">User phải mua sản phẩm Shopify để truy cập</span>
                      </div>
                      <p className="access-info-note">
                        Khi user thanh toán sản phẩm Shopify đã link, hệ thống sẽ tự động cấp quyền truy cập khóa học.
                      </p>
                    </>
                  ) : (
                    <>
                      <label className="free-preview-toggle" onClick={() => handleChange('is_free_preview', !formData.is_free_preview)}>
                        <div className={`checkbox ${formData.is_free_preview ? 'checked' : ''}`}>
                          {formData.is_free_preview && <Check size={14} />}
                        </div>
                        <span>Khóa học miễn phí (FREE)</span>
                      </label>
                      <p className="access-info-note">
                        {formData.is_free_preview
                          ? '✅ Tất cả user đều có thể truy cập khóa học này'
                          : '⚠️ Chọn sản phẩm Shopify bên dưới để kiểm soát quyền truy cập'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="form-group">
                <label className="form-label">Giá (VNĐ)</label>
                <div className="input-with-icon">
                  <DollarSign size={20} className="input-icon" />
                  <input
                    type="text"
                    className="form-input has-icon"
                    placeholder="0 = Miễn phí"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="form-group">
                <label className="form-label">Thời hạn (ngày)</label>
                <div className="input-with-icon">
                  <Clock size={20} className="input-icon" />
                  <input
                    type="text"
                    className="form-input has-icon"
                    placeholder="Để trống = Vĩnh viễn"
                    value={formData.membership_duration_days}
                    onChange={(e) => handleChange('membership_duration_days', e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              {/* Shopify Product Picker */}
              <div className="form-group">
                <label className="form-label">Shopify Product</label>
                <button
                  type="button"
                  className="product-picker-btn"
                  onClick={() => {
                    setProductSearchQuery('');
                    setShowProductPicker(true);
                  }}
                >
                  <Link size={20} className="picker-icon" />
                  {selectedProduct ? (
                    <div className="selected-product-info">
                      {(selectedProduct.images?.[0]?.src || selectedProduct.image_url) && (
                        <img src={selectedProduct.images?.[0]?.src || selectedProduct.image_url} alt="" className="selected-product-image" />
                      )}
                      <span className="selected-product-text">{selectedProduct.title}</span>
                    </div>
                  ) : (
                    <span className="picker-placeholder">
                      {loadingProducts ? 'Đang tải sản phẩm...' : 'Chọn sản phẩm Shopify'}
                    </span>
                  )}
                  <ChevronRight size={20} className="picker-chevron" />
                </button>
                {formData.shopify_product_id && (
                  <button
                    type="button"
                    className="clear-product-btn"
                    onClick={() => handleChange('shopify_product_id', '')}
                  >
                    <Trash2 size={16} />
                    Bỏ chọn
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Thumbnail & Status */}
          <div className="form-column form-column-right">
            {/* Thumbnail */}
            <div className={`form-group ${errors.thumbnail ? 'has-error' : ''}`}>
              <label className="form-label">Thumbnail</label>
              <div className="thumbnail-upload">
                {thumbnailPreview ? (
                  <div className="thumbnail-preview">
                    <img src={thumbnailPreview} alt="Course thumbnail" />
                    <button
                      type="button"
                      className="btn-remove-thumbnail"
                      onClick={removeThumbnail}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="thumbnail-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      hidden
                    />
                    <Image size={48} />
                    <span className="dropzone-text">Nhấn để tải ảnh lên</span>
                    <span className="dropzone-hint">PNG, JPG tối đa 5MB</span>
                  </label>
                )}
              </div>
              {/* URL input */}
              <div className="thumbnail-url-section">
                <span className="thumbnail-url-label">hoặc nhập URL</span>
                <input
                  type="text"
                  className="form-input thumbnail-url-input"
                  placeholder="https://..."
                  value={formData.thumbnail_url}
                  onChange={(e) => {
                    handleChange('thumbnail_url', e.target.value);
                    if (e.target.value) {
                      setThumbnailPreview(e.target.value);
                    }
                  }}
                />
              </div>
              {errors.thumbnail && <span className="form-error">{errors.thumbnail}</span>}
            </div>

            {/* Publish Status */}
            <div className="form-group">
              <label className="form-label">Trạng thái xuất bản</label>
              <div className="publish-toggle">
                <label className={`toggle-option ${!formData.is_published ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="publish"
                    checked={!formData.is_published}
                    onChange={() => handleChange('is_published', false)}
                  />
                  <span>Bản nháp</span>
                </label>
                <label className={`toggle-option ${formData.is_published ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="publish"
                    checked={formData.is_published}
                    onChange={() => handleChange('is_published', true)}
                  />
                  <span>Xuất bản</span>
                </label>
              </div>
              <p className="form-hint">
                {formData.is_published
                  ? 'Khóa học sẽ hiển thị cho học viên'
                  : 'Khóa học chỉ hiển thị với bạn'}
              </p>
            </div>

            {/* Tips Card */}
            <div className="tips-card">
              <h4>Mẹo tạo khóa học hay</h4>
              <ul>
                <li>Đặt tên ngắn gọn, dễ hiểu</li>
                <li>Mô tả rõ ràng lợi ích học viên nhận được</li>
                <li>Chia khóa học thành các module nhỏ</li>
                <li>Sử dụng ảnh bìa chất lượng cao</li>
                <li>Thêm video và bài tập thực hành</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Shopify Product Picker Modal */}
      {showProductPicker && (
        <div className="modal-overlay" onClick={() => setShowProductPicker(false)}>
          <div className="modal-content product-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chọn sản phẩm Shopify</h3>
              <button className="modal-close" onClick={() => setShowProductPicker(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="product-search">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="product-search-input"
              />
            </div>

            {/* Products List */}
            <div className="product-list">
              {loadingProducts ? (
                <div className="product-list-loading">
                  <Loader2 size={32} className="loading-spinner-icon" />
                  <span>Đang tải sản phẩm...</span>
                </div>
              ) : getFilteredProducts().length === 0 ? (
                <div className="product-list-empty">
                  <span>Không tìm thấy sản phẩm</span>
                </div>
              ) : (
                getFilteredProducts().map((product) => {
                  const productId = product.id?.toString() || product.id;
                  const isSelected = productId === formData.shopify_product_id;
                  return (
                    <button
                      key={product.id}
                      className={`product-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        handleChange('shopify_product_id', productId);
                        // Auto-fill price from selected product
                        const productPrice = product.price || product.variants?.[0]?.price;
                        if (productPrice) {
                          handleChange('price', Math.round(parseFloat(productPrice)).toString());
                        }
                        setShowProductPicker(false);
                      }}
                    >
                      {(product.images?.[0]?.src || product.image_url) ? (
                        <img src={product.images?.[0]?.src || product.image_url} alt="" className="product-item-image" />
                      ) : (
                        <div className="product-item-image-placeholder">
                          <Image size={24} />
                        </div>
                      )}
                      <div className="product-item-info">
                        <span className="product-item-title">{product.title}</span>
                        <span className="product-item-price">
                          {product.price
                            ? `${parseFloat(product.price).toLocaleString('vi-VN')}đ`
                            : (product.variants?.[0]?.price
                              ? `${parseFloat(product.variants[0].price).toLocaleString('vi-VN')}đ`
                              : 'N/A')}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="product-item-check">
                          <Check size={18} />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
