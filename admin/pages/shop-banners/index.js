/**
 * Shop Banners Management Page
 * Manage carousel banners, promo bars, featured products, and section banners
 */

import React, { useState, useEffect, useCallback } from 'react';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge, { getStatusFromDates } from '../../components/common/StatusBadge';
import ImageUploader from '../../components/media/ImageUploader';
import DeepLinkPicker from '../../components/media/DeepLinkPicker';
import ColorPicker from '../../components/common/ColorPicker';
import * as bannerService from '../../services/bannerService';

const TABS = [
  { id: 'carousel', label: 'Carousel Banners', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'promo', label: 'Promo Bar', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  { id: 'featured', label: 'Featured Products', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { id: 'sections', label: 'Section Banners', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
];

export default function ShopBannersPage() {
  const [activeTab, setActiveTab] = useState('carousel');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  // Data states
  const [carouselBanners, setCarouselBanners] = useState([]);
  const [promoBars, setPromoBars] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [sectionBanners, setSectionBanners] = useState([]);

  // Form state
  const [formData, setFormData] = useState({});

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bannersRes, promosRes, productsRes, sectionsRes, statsRes] = await Promise.all([
        bannerService.getAllShopBanners(),
        bannerService.getAllPromoBars(),
        bannerService.getAllFeaturedProducts(),
        bannerService.getAllSectionBanners(),
        bannerService.getAllBannerStats(),
      ]);

      setCarouselBanners(bannersRes.data || []);
      setPromoBars(promosRes.data || []);
      setFeaturedProducts(productsRes.data || []);
      setSectionBanners(sectionsRes.data || []);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle create new
  const handleCreate = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData(activeTab));
    setShowEditor(true);
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowEditor(true);
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (activeTab === 'carousel') {
        result = editingItem
          ? await bannerService.updateShopBanner(editingItem.id, formData)
          : await bannerService.createShopBanner(formData);
      } else if (activeTab === 'promo') {
        result = editingItem
          ? await bannerService.updatePromoBar(editingItem.id, formData)
          : await bannerService.createPromoBar(formData);
      } else if (activeTab === 'featured') {
        result = editingItem
          ? await bannerService.updateFeaturedProduct(editingItem.id, formData)
          : await bannerService.createFeaturedProduct(formData);
      } else if (activeTab === 'sections') {
        result = await bannerService.upsertSectionBanner(formData.section_id, formData);
      }

      if (result?.success) {
        setShowEditor(false);
        loadData();
      } else {
        alert(result?.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteModal.item) return;

    setLoading(true);
    try {
      let result;

      if (activeTab === 'carousel') {
        result = await bannerService.deleteShopBanner(deleteModal.item.id);
      } else if (activeTab === 'promo') {
        result = await bannerService.deletePromoBar(deleteModal.item.id);
      } else if (activeTab === 'featured') {
        result = await bannerService.deleteFeaturedProduct(deleteModal.item.id);
      }

      if (result?.success) {
        setDeleteModal({ open: false, item: null });
        loadData();
      } else {
        alert(result?.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (item) => {
    try {
      let result;
      const newActive = !item.is_active;

      if (activeTab === 'carousel') {
        result = await bannerService.toggleBannerActive(item.id, newActive);
      } else if (activeTab === 'promo') {
        result = await bannerService.togglePromoBarActive(item.id, newActive);
      } else if (activeTab === 'featured') {
        result = await bannerService.toggleFeaturedProductActive(item.id, newActive);
      } else if (activeTab === 'sections') {
        result = await bannerService.toggleSectionBannerActive(item.section_id, newActive);
      }

      if (result?.success) {
        loadData();
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  // Get default form data
  const getDefaultFormData = (tab) => {
    switch (tab) {
      case 'carousel':
        return {
          title: '',
          subtitle: '',
          description: '',
          image_url: '',
          link_type: 'none',
          link_value: '',
          is_active: true,
          start_date: '',
          end_date: '',
          background_color: '#1a0b2e',
          text_color: '#FFFFFF',
          display_order: 0,
        };
      case 'promo':
        return {
          message: '',
          voucher_code: '',
          link_text: '',
          link_url: '',
          is_active: true,
          start_date: '',
          end_date: '',
          background_color: '#FF4757',
          text_color: '#FFFFFF',
          display_order: 0,
        };
      case 'featured':
        return {
          title: '',
          subtitle: '',
          description: '',
          price: '',
          original_price: '',
          currency: 'VND',
          image_url: '',
          badge_text: '',
          badge_color: '#FF4757',
          background_gradient_start: '#1a0b2e',
          background_gradient_end: '#2d1b4e',
          accent_color: '#FFD700',
          text_color: '#FFFFFF',
          link_type: 'product',
          link_value: '',
          cta_text: 'Xem ngay',
          layout_style: 'card',
          show_price: true,
          show_badge: true,
          show_description: true,
          is_active: true,
          start_date: '',
          end_date: '',
          display_order: 0,
        };
      case 'sections':
        return {
          section_id: '',
          title: '',
          subtitle: '',
          image_url: '',
          background_color: '#1a0b2e',
          text_color: '#FFFFFF',
          is_active: true,
        };
      default:
        return {};
    }
  };

  // Render stats
  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Banners"
          value={stats.total?.banners || 0}
          icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          loading={loading}
        />
        <StatsCard
          title="Active"
          value={stats.total?.active || 0}
          changeType="positive"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="Total Views"
          value={(stats.carousel?.totalViews || 0).toLocaleString()}
          icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          loading={loading}
        />
        <StatsCard
          title="CTR"
          value={`${stats.carousel?.ctr || 0}%`}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          loading={loading}
        />
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'carousel':
        return renderCarouselTab();
      case 'promo':
        return renderPromoTab();
      case 'featured':
        return renderFeaturedTab();
      case 'sections':
        return renderSectionsTab();
      default:
        return null;
    }
  };

  // Carousel tab
  const renderCarouselTab = () => {
    const columns = [
      {
        key: 'image_url',
        title: 'Preview',
        render: (value) => (
          <div className="w-24 h-14 bg-gray-700 rounded overflow-hidden">
            {value && <img src={value} alt="Banner" className="w-full h-full object-cover" />}
          </div>
        ),
      },
      {
        key: 'title',
        title: 'Title',
        sortable: true,
        render: (value, row) => (
          <div>
            <div className="font-medium text-white">{value || 'Untitled'}</div>
            {row.subtitle && <div className="text-sm text-gray-400">{row.subtitle}</div>}
          </div>
        ),
      },
      {
        key: 'link_type',
        title: 'Link',
        render: (value, row) => (
          <div className="text-sm">
            <span className="text-gray-400 capitalize">{value || 'none'}</span>
            {row.link_value && <div className="text-xs text-gray-500 truncate max-w-[150px]">{row.link_value}</div>}
          </div>
        ),
      },
      {
        key: 'is_active',
        title: 'Status',
        render: (value, row) => (
          <StatusBadge status={getStatusFromDates(value, row.start_date, row.end_date)} />
        ),
      },
      {
        key: 'display_order',
        title: 'Order',
        sortable: true,
        render: (value) => <span className="text-gray-400">#{value}</span>,
      },
      {
        key: 'actions',
        title: '',
        render: (_, row) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleActive(row); }}
              className={`p-1 transition-colors ${row.is_active ? 'text-green-500 hover:text-green-400' : 'text-gray-500 hover:text-gray-400'}`}
              title={row.is_active ? 'Deactivate' : 'Activate'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={row.is_active ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'} />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: row }); }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ];

    return (
      <DataTable
        columns={columns}
        data={carouselBanners}
        loading={loading}
        onRowClick={handleEdit}
        emptyMessage="No carousel banners found. Create your first banner!"
      />
    );
  };

  // Promo bar tab
  const renderPromoTab = () => {
    const columns = [
      {
        key: 'message',
        title: 'Message',
        render: (value, row) => (
          <div className="flex items-center space-x-3">
            <div
              className="w-3 h-8 rounded"
              style={{ backgroundColor: row.background_color }}
            />
            <div className="text-white">{value}</div>
          </div>
        ),
      },
      {
        key: 'voucher_code',
        title: 'Voucher',
        render: (value) => value ? (
          <code className="px-2 py-1 bg-gray-700 rounded text-amber-500 text-sm">{value}</code>
        ) : <span className="text-gray-500">-</span>,
      },
      {
        key: 'link_text',
        title: 'Link',
        render: (value, row) => value ? (
          <span className="text-blue-400 text-sm">{value}</span>
        ) : <span className="text-gray-500">-</span>,
      },
      {
        key: 'is_active',
        title: 'Status',
        render: (value, row) => (
          <StatusBadge status={getStatusFromDates(value, row.start_date, row.end_date)} />
        ),
      },
      {
        key: 'actions',
        title: '',
        render: (_, row) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleActive(row); }}
              className={`p-1 transition-colors ${row.is_active ? 'text-green-500 hover:text-green-400' : 'text-gray-500 hover:text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill={row.is_active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: row }); }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ];

    return (
      <DataTable
        columns={columns}
        data={promoBars}
        loading={loading}
        onRowClick={handleEdit}
        emptyMessage="No promo bars found. Create your first promo bar!"
      />
    );
  };

  // Featured products tab
  const renderFeaturedTab = () => {
    const columns = [
      {
        key: 'image_url',
        title: 'Image',
        render: (value) => (
          <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden">
            {value && <img src={value} alt="Product" className="w-full h-full object-cover" />}
          </div>
        ),
      },
      {
        key: 'title',
        title: 'Product',
        sortable: true,
        render: (value, row) => (
          <div>
            <div className="font-medium text-white">{value}</div>
            {row.badge_text && (
              <span
                className="inline-block mt-1 px-2 py-0.5 rounded text-xs text-white"
                style={{ backgroundColor: row.badge_color }}
              >
                {row.badge_text}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'price',
        title: 'Price',
        render: (value, row) => (
          <div className="text-sm">
            {value ? (
              <>
                <div className="text-amber-500 font-medium">
                  {Number(value).toLocaleString()} {row.currency}
                </div>
                {row.original_price && (
                  <div className="text-gray-500 line-through text-xs">
                    {Number(row.original_price).toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-500">-</span>
            )}
          </div>
        ),
      },
      {
        key: 'cta_text',
        title: 'CTA',
        render: (value) => <span className="text-gray-400">{value || 'Xem ngay'}</span>,
      },
      {
        key: 'is_active',
        title: 'Status',
        render: (value, row) => (
          <StatusBadge status={getStatusFromDates(value, row.start_date, row.end_date)} />
        ),
      },
      {
        key: 'actions',
        title: '',
        render: (_, row) => (
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleActive(row); }}
              className={`p-1 transition-colors ${row.is_active ? 'text-green-500' : 'text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill={row.is_active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, item: row }); }}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ];

    return (
      <DataTable
        columns={columns}
        data={featuredProducts}
        loading={loading}
        onRowClick={handleEdit}
        emptyMessage="No featured products found. Create your first featured product!"
      />
    );
  };

  // Section banners tab
  const renderSectionsTab = () => {
    const sections = ['manifest', 'courses', 'shop', 'scanner', 'visionboard'];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((sectionId) => {
          const banner = sectionBanners.find(b => b.section_id === sectionId);
          return (
            <div
              key={sectionId}
              className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-amber-500/50 transition-all cursor-pointer"
              onClick={() => {
                setEditingItem(banner);
                setFormData(banner || { ...getDefaultFormData('sections'), section_id: sectionId });
                setShowEditor(true);
              }}
            >
              <div className="aspect-video bg-gray-700 relative">
                {banner?.image_url ? (
                  <img src={banner.image_url} alt={sectionId} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={banner?.is_active ? 'active' : 'inactive'} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white capitalize">{sectionId}</h3>
                {banner?.title && <p className="text-sm text-gray-400 mt-1">{banner.title}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render editor modal
  const renderEditor = () => {
    if (!showEditor) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
            <h2 className="text-xl font-semibold text-white">
              {editingItem ? 'Edit' : 'Create'} {TABS.find(t => t.id === activeTab)?.label.replace(/s$/, '')}
            </h2>
            <button
              onClick={() => setShowEditor(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {activeTab === 'carousel' && renderCarouselForm()}
            {activeTab === 'promo' && renderPromoForm()}
            {activeTab === 'featured' && renderFeaturedForm()}
            {activeTab === 'sections' && renderSectionForm()}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                <span>{editingItem ? 'Save Changes' : 'Create'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Carousel form
  const renderCarouselForm = () => (
    <>
      <ImageUploader
        label="Banner Image"
        value={formData.image_url}
        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
        aspectRatio="16/9"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Banner title..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Optional subtitle..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          placeholder="Optional description..."
        />
      </div>

      <DeepLinkPicker
        linkType={formData.link_type}
        linkValue={formData.link_value}
        onLinkTypeChange={(type) => setFormData(prev => ({ ...prev, link_type: type }))}
        onLinkValueChange={(value) => setFormData(prev => ({ ...prev, link_value: value }))}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ColorPicker
          label="Background Color"
          value={formData.background_color || '#1a0b2e'}
          onChange={(color) => setFormData(prev => ({ ...prev, background_color: color }))}
        />
        <ColorPicker
          label="Text Color"
          value={formData.text_color || '#FFFFFF'}
          onChange={(color) => setFormData(prev => ({ ...prev, text_color: color }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
          <input
            type="datetime-local"
            value={formData.start_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
          <input
            type="datetime-local"
            value={formData.end_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-700"
          />
          <span className="ml-2 text-gray-300">Active</span>
        </label>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Display Order:</label>
          <input
            type="number"
            value={formData.display_order || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
            className="w-20 bg-gray-700 text-white rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
            min="0"
          />
        </div>
      </div>
    </>
  );

  // Promo bar form
  const renderPromoForm = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
        <input
          type="text"
          value={formData.message || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Flash Sale - 50% off all courses!"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Voucher Code</label>
          <input
            type="text"
            value={formData.voucher_code || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, voucher_code: e.target.value.toUpperCase() }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            placeholder="SALE50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Link Text</label>
          <input
            type="text"
            value={formData.link_text || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, link_text: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Shop Now"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Link URL</label>
        <input
          type="url"
          value={formData.link_url || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ColorPicker
          label="Background Color"
          value={formData.background_color || '#FF4757'}
          onChange={(color) => setFormData(prev => ({ ...prev, background_color: color }))}
        />
        <ColorPicker
          label="Text Color"
          value={formData.text_color || '#FFFFFF'}
          onChange={(color) => setFormData(prev => ({ ...prev, text_color: color }))}
        />
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
        <div
          className="py-2 px-4 rounded-lg text-center"
          style={{ backgroundColor: formData.background_color, color: formData.text_color }}
        >
          {formData.message || 'Your promo message here'}
          {formData.voucher_code && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-sm">{formData.voucher_code}</span>
          )}
          {formData.link_text && (
            <span className="ml-2 underline cursor-pointer">{formData.link_text}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
          <input
            type="datetime-local"
            value={formData.start_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
          <input
            type="datetime-local"
            value={formData.end_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-700"
        />
        <span className="ml-2 text-gray-300">Active</span>
      </label>
    </>
  );

  // Featured product form
  const renderFeaturedForm = () => (
    <>
      <ImageUploader
        label="Product Image"
        value={formData.image_url}
        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
        aspectRatio="1/1"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Product name..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Optional subtitle..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          placeholder="Product description..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="499000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Original Price</label>
          <input
            type="number"
            value={formData.original_price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="999000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
          <select
            value={formData.currency || 'VND'}
            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Badge Text</label>
          <input
            type="text"
            value={formData.badge_text || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="HOT SALE"
          />
        </div>
        <ColorPicker
          label="Badge Color"
          value={formData.badge_color || '#FF4757'}
          onChange={(color) => setFormData(prev => ({ ...prev, badge_color: color }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">CTA Text</label>
        <input
          type="text"
          value={formData.cta_text || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Xem ngay"
        />
      </div>

      <DeepLinkPicker
        linkType={formData.link_type}
        linkValue={formData.link_value}
        onLinkTypeChange={(type) => setFormData(prev => ({ ...prev, link_type: type }))}
        onLinkValueChange={(value) => setFormData(prev => ({ ...prev, link_value: value }))}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
          <input
            type="datetime-local"
            value={formData.start_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
          <input
            type="datetime-local"
            value={formData.end_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-700"
          />
          <span className="ml-2 text-gray-300">Active</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.show_price}
            onChange={(e) => setFormData(prev => ({ ...prev, show_price: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-700"
          />
          <span className="ml-2 text-gray-300">Show Price</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.show_badge}
            onChange={(e) => setFormData(prev => ({ ...prev, show_badge: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-700"
          />
          <span className="ml-2 text-gray-300">Show Badge</span>
        </label>
      </div>
    </>
  );

  // Section banner form
  const renderSectionForm = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Section</label>
        <select
          value={formData.section_id || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, section_id: e.target.value }))}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
          disabled={!!editingItem}
        >
          <option value="">Select a section...</option>
          <option value="manifest">Manifest</option>
          <option value="courses">Courses</option>
          <option value="shop">Shop</option>
          <option value="scanner">Scanner</option>
          <option value="visionboard">Vision Board</option>
        </select>
      </div>

      <ImageUploader
        label="Section Banner Image"
        value={formData.image_url}
        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
        aspectRatio="21/9"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Section title..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Optional subtitle..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ColorPicker
          label="Background Color"
          value={formData.background_color || '#1a0b2e'}
          onChange={(color) => setFormData(prev => ({ ...prev, background_color: color }))}
        />
        <ColorPicker
          label="Text Color"
          value={formData.text_color || '#FFFFFF'}
          onChange={(color) => setFormData(prev => ({ ...prev, text_color: color }))}
        />
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-700"
        />
        <span className="ml-2 text-gray-300">Active</span>
      </label>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shop Banners</h1>
          <p className="text-gray-400 mt-1">Manage banners, promo bars, and featured products</p>
        </div>
        {activeTab !== 'sections' && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Stats */}
      {renderStats()}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500 text-gray-900'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Editor Modal */}
      {renderEditor()}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
