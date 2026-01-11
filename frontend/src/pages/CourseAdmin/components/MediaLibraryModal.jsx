/**
 * MediaLibraryModal - Browse all course images
 * Search, filter, pagination, select to insert
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
  User,
} from 'lucide-react';
import { courseImageService } from '../../../services/courseImageService';
import { useAuth } from '../../../contexts/AuthContext';

// Design Tokens
const COLORS = {
  bgDark: '#0a0a0f',
  bgCard: 'rgba(255, 255, 255, 0.03)',
  bgOverlay: 'rgba(0, 0, 0, 0.8)',
  burgundy: '#9C0612',
  gold: '#FFBD59',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#22c55e',
  error: '#ef4444',
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.bgOverlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
    boxSizing: 'border-box',
  },
  modal: {
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    backgroundColor: COLORS.bgDark,
    borderRadius: '16px',
    border: `1px solid ${COLORS.border}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  closeButton: {
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    minHeight: '44px',
  },
  searchBar: {
    padding: '12px 20px',
    borderBottom: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    outline: 'none',
    minHeight: '44px',
    boxSizing: 'border-box',
  },
  searchIcon: {
    position: 'absolute',
    left: '36px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: COLORS.textMuted,
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '16px',
    minHeight: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
  },
  imageCard: {
    position: 'relative',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  imageCardSelected: {
    borderColor: COLORS.gold,
    borderWidth: '2px',
  },
  imageWrapper: {
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  selectedBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    backgroundColor: COLORS.gold,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.bgDark,
  },
  cardInfo: {
    padding: '10px',
  },
  positionId: {
    color: COLORS.gold,
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileName: {
    color: COLORS.textMuted,
    fontSize: '11px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderTop: `1px solid ${COLORS.border}`,
    flexShrink: 0,
    gap: '12px',
    flexWrap: 'wrap',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pageButton: {
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textSecondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    minHeight: '44px',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    color: COLORS.textMuted,
    fontSize: '13px',
    padding: '0 8px',
  },
  selectButton: {
    padding: '12px 24px',
    backgroundColor: COLORS.burgundy,
    border: 'none',
    borderRadius: '8px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    minHeight: '44px',
    flex: '1 1 auto',
    maxWidth: '200px',
  },
  selectButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    color: COLORS.textMuted,
  },
};

const ITEMS_PER_PAGE = 20;

export default function MediaLibraryModal({ isOpen, onClose, onSelect }) {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.is_admin;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('my'); // 'my' or 'all' (admin only)

  // Fetch images - uses getMyImages for users, getAllImagesAdmin for admin in 'all' mode
  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      if (isAdmin && viewMode === 'all') {
        result = await courseImageService.getAllImagesAdmin({
          limit: ITEMS_PER_PAGE,
          offset: page * ITEMS_PER_PAGE,
          search,
        });
      } else {
        result = await courseImageService.getMyImages({
          limit: ITEMS_PER_PAGE,
          offset: page * ITEMS_PER_PAGE,
          search,
        });
      }
      setImages(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('[MediaLibrary] Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, isAdmin, viewMode]);

  // Fetch when modal opens or params change
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen, fetchImages]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(null);
      setPage(0);
    }
  }, [isOpen]);

  // Search handler with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle select
  const handleSelect = () => {
    if (selectedImage) {
      onSelect?.(selectedImage);
      onClose?.();
    }
  };

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            <ImageIcon size={20} />
            Thư viện hình ảnh
            <span style={{ fontSize: '12px', color: COLORS.textMuted, fontWeight: '400', marginLeft: '8px' }}>
              ({viewMode === 'my' ? 'Ảnh của tôi' : 'Tất cả'})
            </span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Admin toggle: My Images vs All */}
            {isAdmin && (
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                <button
                  style={{
                    padding: '8px 12px',
                    background: viewMode === 'my' ? COLORS.burgundy : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: viewMode === 'my' ? COLORS.textPrimary : COLORS.textMuted,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={() => { setViewMode('my'); setPage(0); }}
                >
                  <User size={14} />
                  Ảnh của tôi
                </button>
                <button
                  style={{
                    padding: '8px 12px',
                    background: viewMode === 'all' ? COLORS.burgundy : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: viewMode === 'all' ? COLORS.textPrimary : COLORS.textMuted,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={() => { setViewMode('all'); setPage(0); }}
                >
                  <Users size={14} />
                  Tất cả
                </button>
              </div>
            )}
            <button style={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ ...styles.searchBar, position: 'relative' }}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên file hoặc position ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Content */}
        <div style={styles.content}>
          {loading ? (
            <div style={styles.loadingState}>
              <Loader2 size={24} className="animate-spin" />
              <span style={{ marginLeft: '8px' }}>Đang tải...</span>
            </div>
          ) : images.length === 0 ? (
            <div style={styles.emptyState}>
              <ImageIcon size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>
                {search ? 'Không tìm thấy hình ảnh' : 'Chưa có hình ảnh nào'}
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {images.map((image) => (
                <div
                  key={image.id}
                  style={{
                    ...styles.imageCard,
                    ...(selectedImage?.id === image.id ? styles.imageCardSelected : {}),
                  }}
                  onClick={() => setSelectedImage(image)}
                >
                  <div style={styles.imageWrapper}>
                    <img
                      src={image.image_url}
                      alt={image.alt_text || image.position_id}
                      style={styles.image}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  {selectedImage?.id === image.id && (
                    <div style={styles.selectedBadge}>
                      <Check size={14} />
                    </div>
                  )}
                  <div style={styles.cardInfo}>
                    <div style={styles.positionId}>{image.position_id}</div>
                    <div style={styles.fileName}>{image.file_name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.pagination}>
            <button
              style={{
                ...styles.pageButton,
                ...(hasPrev ? {} : styles.pageButtonDisabled),
              }}
              onClick={() => hasPrev && setPage(page - 1)}
              disabled={!hasPrev}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={styles.pageInfo}>
              Trang {page + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              style={{
                ...styles.pageButton,
                ...(hasNext ? {} : styles.pageButtonDisabled),
              }}
              onClick={() => hasNext && setPage(page + 1)}
              disabled={!hasNext}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            style={{
              ...styles.selectButton,
              ...(selectedImage ? {} : styles.selectButtonDisabled),
            }}
            onClick={handleSelect}
            disabled={!selectedImage}
          >
            Chọn hình ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
