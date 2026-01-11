/**
 * DraggableBlockEditor - WYSIWYG editor with drag-and-drop block reordering
 * Features:
 * - Drag and drop blocks to reorder
 * - Click on links/buttons to edit their href
 * - Paste/drop URLs onto links to update them
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  GripVertical, Trash2, Copy, ChevronUp, ChevronDown, Link2, X, Check, ExternalLink,
  Maximize2, Lock, Unlock, AlignLeft, AlignCenter, AlignRight, Settings,
  Plus, ChevronRight, ChevronDown as ChevronDownIcon, Layout, Type, Image, List, Quote,
  Square, Layers, AlertCircle, Info, CheckCircle, Star, MessageSquare, FileText,
  Box, Grid, Columns, Minus, Table, Code, Video, Bookmark, Award, Target, Zap,
  ShoppingBag, CreditCard, Tag, Package, Circle
} from 'lucide-react';
import DOMPurify from 'dompurify';
import './ResizableBlock.css';

// ═══════════════════════════════════════════════════════════
// TOOLBOX COMPONENT TEMPLATES
// ═══════════════════════════════════════════════════════════

const TOOLBOX_CATEGORIES = [
  {
    id: 'components',
    label: '📦 Components',
    icon: Box,
    collapsed: false,
    items: [
      {
        id: 'info-card',
        label: 'Info Card',
        icon: Info,
        description: 'Thẻ thông tin với icon',
        html: `<div class="info-card" style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(106, 91, 255, 0.05)); border-left: 4px solid #00F0FF; border-radius: 8px; padding: 0.5rem; margin: 0.75rem 0;">
  <p style="margin: 0; color: #E8E8E8; font-size: 15px; line-height: 1.6;">💡 <strong style="color: #00F0FF;">Lưu ý:</strong> Nội dung thông tin quan trọng cần người dùng biết.</p>
</div>`,
      },
      {
        id: 'warning-card',
        label: 'Warning Card',
        icon: AlertCircle,
        description: 'Thẻ cảnh báo',
        html: `<div class="highlight-box warning" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(156, 6, 18, 0.05)); border-left: 4px solid #EF4444; border-radius: 8px; padding: 0.5rem; margin: 0.75rem 0;">
  <p style="margin: 0; color: #E8E8E8; font-size: 15px; line-height: 1.6;">⚠️ <strong style="color: #EF4444;">Quan trọng:</strong> Nội dung cảnh báo người dùng cần chú ý.</p>
</div>`,
      },
      {
        id: 'success-card',
        label: 'Success Card',
        icon: CheckCircle,
        description: 'Thẻ thành công',
        html: `<div class="highlight-box tip" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-left: 4px solid #10B981; border-radius: 8px; padding: 0.5rem; margin: 0.75rem 0;">
  <p style="margin: 0; color: #E8E8E8; font-size: 15px; line-height: 1.6;">✅ <strong style="color: #10B981;">Hoàn thành:</strong> Nội dung thông báo thành công.</p>
</div>`,
      },
      {
        id: 'tip-card',
        label: 'Tip Card',
        icon: Zap,
        description: 'Thẻ mẹo/tip',
        html: `<div class="highlight-box" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.05)); border-left: 4px solid #A855F7; border-radius: 8px; padding: 0.5rem; margin: 0.75rem 0;">
  <p style="margin: 0; color: #E8E8E8; font-size: 15px; line-height: 1.6;">💡 <strong style="color: #c084fc;">Mẹo hay:</strong> Chia sẻ mẹo hữu ích cho người học.</p>
</div>`,
      },
      {
        id: 'numbered-step',
        label: 'Numbered Step',
        icon: Target,
        description: 'Bước có số thứ tự',
        html: `<div style="position: relative; padding-left: 52px; margin: 0.75rem 0;">
  <div style="position: absolute; left: 0; top: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #00F0FF, #6A5BFF); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 1rem;">1</div>
  <div class="step-title" style="font-weight: 700; color: #fff; font-size: 1rem; margin-bottom: 4px;">Tiêu đề bước</div>
  <div class="step-desc" style="color: #E8E8E8; font-size: 0.9rem; line-height: 1.5;">Mô tả chi tiết cho bước này. Giải thích rõ ràng những gì cần làm.</div>
</div>`,
      },
      {
        id: 'quote-block',
        label: 'Quote Block',
        icon: Quote,
        description: 'Khối trích dẫn',
        html: `<blockquote style="background: linear-gradient(135deg, rgba(156, 6, 18, 0.15), rgba(120, 5, 14, 0.1)); border-left: 4px solid #9C0612; padding: 0.75rem 1rem; margin: 0.75rem 0; border-radius: 0 8px 8px 0;">
  <p style="margin: 0 0 8px 0; color: #fff; font-size: 15px; font-style: italic; line-height: 1.6;">"Trích dẫn nổi bật hoặc câu nói quan trọng cần nhấn mạnh."</p>
  <cite style="color: #FFBD59; font-size: 13px; font-style: normal;">— Tác giả</cite>
</blockquote>`,
      },
      {
        id: 'feature-item',
        label: 'Feature Item',
        icon: Star,
        description: 'Mục tính năng với icon',
        html: `<div class="key-points" style="position: relative; padding-left: 1.25rem; margin: 0.5rem 0; color: #E8E8E8; line-height: 1.6;">
  <span style="position: absolute; left: 0; color: #10B981; font-weight: bold;">✓</span>
  <strong style="color: #FFBD59;">Tính năng nổi bật:</strong> Mô tả ngắn về tính năng này.
</div>`,
      },
    ],
  },
  {
    id: 'sections',
    label: '📐 Sections',
    icon: Layout,
    collapsed: true,
    items: [
      {
        id: 'hero-section',
        label: 'Hero Section',
        icon: Layers,
        description: 'Section hero với tiêu đề lớn',
        html: `<section class="content-section" style="text-align: center; padding: 1.5rem 0; margin: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
  <h2 class="section-title" style="font-size: clamp(1.2rem, 4vw, 1.5rem); font-weight: 700; color: #FFBD59; text-transform: uppercase; margin-bottom: 0.75rem;">Tiêu đề Section</h2>
  <p style="margin: 0 auto; color: rgba(255,255,255,0.8); font-size: 0.95rem; line-height: 1.6;">Mô tả ngắn gọn về nội dung chính của section này.</p>
</section>`,
      },
      {
        id: 'divider-section',
        label: 'Divider',
        icon: Minus,
        description: 'Đường phân cách',
        html: `<div style="display: flex; align-items: center; gap: 12px; margin: 1rem 0;">
  <div style="flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(255,189,89,0.5), transparent);"></div>
  <span style="color: #FFBD59; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">✦</span>
  <div style="flex: 1; height: 1px; background: linear-gradient(to left, transparent, rgba(255,189,89,0.5), transparent);"></div>
</div>`,
      },
      {
        id: 'two-column',
        label: '2 Columns',
        icon: Columns,
        description: 'Layout 2 cột',
        html: `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0.75rem 0;">
  <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.08);">
    <h4 style="margin: 0 0 6px 0; color: #FFBD59; font-size: 0.9rem;">Cột 1</h4>
    <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Nội dung cột trái.</p>
  </div>
  <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.08);">
    <h4 style="margin: 0 0 6px 0; color: #FFBD59; font-size: 0.9rem;">Cột 2</h4>
    <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 0.85rem;">Nội dung cột phải.</p>
  </div>
</div>`,
      },
      {
        id: 'three-column',
        label: '3 Columns',
        icon: Grid,
        description: 'Layout 3 cột',
        html: `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 0.75rem 0;">
  <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.75rem; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
    <span style="font-size: 1.5rem; display: block; margin-bottom: 4px;">📊</span>
    <strong style="color: #fff; font-size: 0.8rem;">Mục 1</strong>
  </div>
  <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.75rem; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
    <span style="font-size: 1.5rem; display: block; margin-bottom: 4px;">📈</span>
    <strong style="color: #fff; font-size: 0.8rem;">Mục 2</strong>
  </div>
  <div style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.75rem; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
    <span style="font-size: 1.5rem; display: block; margin-bottom: 4px;">📉</span>
    <strong style="color: #fff; font-size: 0.8rem;">Mục 3</strong>
  </div>
</div>`,
      },
      {
        id: 'cta-section',
        label: 'CTA Section',
        icon: Zap,
        description: 'Call to Action',
        html: `<div style="background: linear-gradient(135deg, #FFBD59, #FF9500); border-radius: 12px; padding: 1rem; margin: 0.75rem 0; text-align: center;">
  <h3 style="margin: 0 0 8px 0; color: #000; font-size: 1rem; font-weight: 700;">Hành động ngay!</h3>
  <p style="margin: 0 0 12px 0; color: rgba(0,0,0,0.7); font-size: 0.85rem;">Mô tả lý do tại sao người dùng nên hành động.</p>
  <a href="#" style="display: inline-block; background: #000; color: #FFBD59; padding: 8px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.85rem;">Bắt đầu →</a>
</div>`,
      },
    ],
  },
  {
    id: 'content',
    label: '📝 Content',
    icon: FileText,
    collapsed: true,
    items: [
      {
        id: 'heading-h2',
        label: 'Heading H2',
        icon: Type,
        description: 'Tiêu đề cấp 2',
        html: `<h2 class="section-title" style="font-size: 1.2rem; font-weight: 700; color: #FFBD59; text-transform: uppercase; margin: 1rem 0 0.75rem 0; padding-bottom: 0.5rem; border-bottom: 2px solid #FFBD59; display: flex; align-items: center; gap: 0.5rem;"><span style="font-size: 1.3rem;">🎯</span> Tiêu đề Section</h2>`,
      },
      {
        id: 'heading-h3',
        label: 'Heading H3',
        icon: Type,
        description: 'Tiêu đề cấp 3',
        html: `<h3 style="color: #fff; font-size: 1rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0;">Tiêu đề phụ</h3>`,
      },
      {
        id: 'paragraph',
        label: 'Paragraph',
        icon: FileText,
        description: 'Đoạn văn bản',
        html: `<p style="color: #E8E8E8; font-size: 15px; line-height: 1.6; margin: 0.5rem 0;">Đoạn văn bản mô tả nội dung. Có thể thêm <strong style="color: #FFBD59;">text quan trọng</strong> để tạo điểm nhấn.</p>`,
      },
      {
        id: 'bullet-list',
        label: 'Bullet List',
        icon: List,
        description: 'Danh sách bullet',
        html: `<ul class="key-points" style="list-style: none; margin: 0.5rem 0; padding: 0;">
  <li style="position: relative; padding-left: 1.25rem; margin-bottom: 0.5rem; color: #E8E8E8;"><span style="position: absolute; left: 0; color: #10B981; font-weight: bold;">✓</span>Mục đầu tiên trong danh sách</li>
  <li style="position: relative; padding-left: 1.25rem; margin-bottom: 0.5rem; color: #E8E8E8;"><span style="position: absolute; left: 0; color: #10B981; font-weight: bold;">✓</span>Mục thứ hai trong danh sách</li>
  <li style="position: relative; padding-left: 1.25rem; margin-bottom: 0.5rem; color: #E8E8E8;"><span style="position: absolute; left: 0; color: #10B981; font-weight: bold;">✓</span>Mục thứ ba trong danh sách</li>
</ul>`,
      },
      {
        id: 'numbered-list',
        label: 'Numbered List',
        icon: List,
        description: 'Danh sách số',
        html: `<ol style="margin: 0.5rem 0; padding-left: 1.25rem; color: #E8E8E8;">
  <li style="margin-bottom: 0.5rem; line-height: 1.5;">Bước một - Thực hiện việc này</li>
  <li style="margin-bottom: 0.5rem; line-height: 1.5;">Bước hai - Tiếp tục với việc kia</li>
  <li style="margin-bottom: 0.5rem; line-height: 1.5;">Bước ba - Hoàn thành công việc</li>
</ol>`,
      },
      {
        id: 'code-block',
        label: 'Code Block',
        icon: Code,
        description: 'Khối code',
        html: `<pre style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.75rem; margin: 0.5rem 0; overflow-x: auto;"><code style="color: #4ade80; font-family: monospace; font-size: 0.85rem;">// Code example
const example = "Hello World";
console.log(example);</code></pre>`,
      },
      {
        id: 'table-simple',
        label: 'Simple Table',
        icon: Table,
        description: 'Bảng đơn giản',
        html: `<div class="table-container" style="width: 100%; overflow-x: auto; margin: 0.5rem 0;">
  <table style="width: 100%; min-width: 300px; border-collapse: collapse; font-size: 0.85rem;">
    <thead>
      <tr style="background: rgba(255,189,89,0.1);">
        <th style="padding: 0.5rem; text-align: left; color: #FFBD59; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08);">Cột 1</th>
        <th style="padding: 0.5rem; text-align: left; color: #FFBD59; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08);">Cột 2</th>
        <th style="padding: 0.5rem; text-align: left; color: #FFBD59; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08);">Cột 3</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 0.5rem; color: #E8E8E8;">Dữ liệu 1</td>
        <td style="padding: 0.5rem; color: #E8E8E8;">Dữ liệu 2</td>
        <td style="padding: 0.5rem; color: #E8E8E8;">Dữ liệu 3</td>
      </tr>
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 0.5rem; color: #E8E8E8;">Dữ liệu 4</td>
        <td style="padding: 0.5rem; color: #E8E8E8;">Dữ liệu 5</td>
        <td style="padding: 0.5rem; color: #E8E8E8;">Dữ liệu 6</td>
      </tr>
    </tbody>
  </table>
</div>`,
      },
    ],
  },
  {
    id: 'placeholders',
    label: '🔲 Placeholders',
    icon: Square,
    collapsed: true,
    items: [
      {
        id: 'image-placeholder',
        label: 'Image Placeholder',
        icon: Image,
        description: 'Vị trí cho hình ảnh - sẽ được thay thế hoàn toàn',
        html: `<div class="image-placeholder" style="margin: 1rem auto; padding: 1.5rem 1rem; width: 100%; max-width: 800px; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.15); border-radius: 12px; text-align: center; min-height: 80px; box-sizing: border-box;">
  <span style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 8px;">🖼️</span>
  <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 13px;">Kéo thả hình ảnh vào đây</p>
</div>`,
      },
      {
        id: 'video-placeholder',
        label: 'Video Placeholder',
        icon: Video,
        description: 'Vị trí cho video - sẽ được thay thế',
        html: `<div class="video-placeholder" style="margin: 1rem auto; padding: 1.5rem 1rem; width: 100%; max-width: 800px; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.15); border-radius: 12px; text-align: center; min-height: 80px; box-sizing: border-box;">
  <span style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 8px;">🎬</span>
  <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 13px;">Vị trí cho video embed</p>
</div>`,
      },
      {
        id: 'content-placeholder',
        label: 'Content Placeholder',
        icon: FileText,
        description: 'Vị trí cho nội dung',
        html: `<div class="content-placeholder" style="margin: 1rem auto; padding: 1rem; width: 100%; max-width: 800px; background: rgba(255,189,89,0.02); border: 2px dashed rgba(255,189,89,0.2); border-radius: 12px; text-align: center; box-sizing: border-box;">
  <span style="font-size: 1.5rem; opacity: 0.3; display: block; margin-bottom: 8px;">📝</span>
  <p style="margin: 0; color: rgba(255,189,89,0.4); font-size: 13px;">Thêm nội dung tại đây</p>
</div>`,
      },
      {
        id: 'empty-card',
        label: 'Empty Card',
        icon: Square,
        description: 'Card trống để tùy chỉnh',
        html: `<div class="empty-card" style="margin: 1rem auto; padding: 1rem; width: 100%; max-width: 800px; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; box-sizing: border-box;">
  <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 14px;">Nội dung card - chỉnh sửa theo ý muốn</p>
</div>`,
      },
      // ═══ CIRCLE PLACEHOLDERS - For Testimonials ═══
      {
        id: 'circle-placeholder-lg',
        label: 'Avatar Tròn (Lớn)',
        icon: Circle,
        description: 'Avatar tròn 200px - cho testimonials',
        html: `<div class="circle-placeholder circle-lg" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 200px; height: 200px; background: rgba(255,255,255,0.02); border: 3px dashed rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer;">
  <span style="font-size: 3rem; opacity: 0.3;">👤</span>
</div>`,
      },
      {
        id: 'circle-placeholder-md',
        label: 'Avatar Tròn (Vừa)',
        icon: Circle,
        description: 'Avatar tròn 150px - cho testimonials',
        html: `<div class="circle-placeholder circle-md" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 150px; height: 150px; background: rgba(255,255,255,0.02); border: 3px dashed rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer;">
  <span style="font-size: 2.5rem; opacity: 0.3;">👤</span>
</div>`,
      },
      {
        id: 'circle-placeholder-sm',
        label: 'Avatar Tròn (Nhỏ)',
        icon: Circle,
        description: 'Avatar tròn 100px - cho testimonials',
        html: `<div class="circle-placeholder circle-sm" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100px; height: 100px; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer;">
  <span style="font-size: 2rem; opacity: 0.3;">👤</span>
</div>`,
      },
      // ═══ BANNER PLACEHOLDERS - 16:9 Ratio ═══
      {
        id: 'banner-placeholder-lg',
        label: 'Banner 16:9 (Lớn)',
        icon: Image,
        description: 'Banner 800x450 - tỷ lệ 16:9',
        html: `<div class="banner-placeholder banner-lg" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 800px; aspect-ratio: 16/9; background: linear-gradient(135deg, rgba(255,189,89,0.05), rgba(0,217,255,0.05)); border: 3px dashed rgba(255,189,89,0.3); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 3rem; opacity: 0.3; margin-bottom: 8px;">🖼️</span>
  <p style="margin: 0; color: rgba(255,189,89,0.5); font-size: 14px; font-weight: 500;">Banner 16:9 (800px)</p>
</div>`,
      },
      {
        id: 'banner-placeholder-md',
        label: 'Banner 16:9 (Vừa)',
        icon: Image,
        description: 'Banner 600x338 - tỷ lệ 16:9',
        html: `<div class="banner-placeholder banner-md" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 600px; aspect-ratio: 16/9; background: linear-gradient(135deg, rgba(255,189,89,0.05), rgba(0,217,255,0.05)); border: 3px dashed rgba(255,189,89,0.3); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 8px;">🖼️</span>
  <p style="margin: 0; color: rgba(255,189,89,0.5); font-size: 13px; font-weight: 500;">Banner 16:9 (600px)</p>
</div>`,
      },
      {
        id: 'banner-placeholder-sm',
        label: 'Banner 16:9 (Nhỏ)',
        icon: Image,
        description: 'Banner 400x225 - tỷ lệ 16:9',
        html: `<div class="banner-placeholder banner-sm" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 400px; aspect-ratio: 16/9; background: linear-gradient(135deg, rgba(255,189,89,0.05), rgba(0,217,255,0.05)); border: 2px dashed rgba(255,189,89,0.3); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 2rem; opacity: 0.3; margin-bottom: 6px;">🖼️</span>
  <p style="margin: 0; color: rgba(255,189,89,0.5); font-size: 12px; font-weight: 500;">Banner 16:9 (400px)</p>
</div>`,
      },
      // ═══ VERTICAL PLACEHOLDERS - 9:16 Ratio ═══
      {
        id: 'vertical-placeholder-lg',
        label: 'Dọc 9:16 (Lớn)',
        icon: Image,
        description: 'Hình dọc 450x800 - tỷ lệ 9:16',
        html: `<div class="vertical-placeholder vertical-lg" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 450px; aspect-ratio: 9/16; background: linear-gradient(135deg, rgba(106,91,255,0.08), rgba(0,240,255,0.05)); border: 3px dashed rgba(106,91,255,0.4); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 3rem; opacity: 0.3; margin-bottom: 8px;">📱</span>
  <p style="margin: 0; color: rgba(106,91,255,0.6); font-size: 14px; font-weight: 500;">Dọc 9:16 (450px)</p>
</div>`,
      },
      {
        id: 'vertical-placeholder-md',
        label: 'Dọc 9:16 (Vừa)',
        icon: Image,
        description: 'Hình dọc 338x600 - tỷ lệ 9:16',
        html: `<div class="vertical-placeholder vertical-md" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 338px; aspect-ratio: 9/16; background: linear-gradient(135deg, rgba(106,91,255,0.08), rgba(0,240,255,0.05)); border: 3px dashed rgba(106,91,255,0.4); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 8px;">📱</span>
  <p style="margin: 0; color: rgba(106,91,255,0.6); font-size: 13px; font-weight: 500;">Dọc 9:16 (338px)</p>
</div>`,
      },
      {
        id: 'vertical-placeholder-sm',
        label: 'Dọc 9:16 (Nhỏ)',
        icon: Image,
        description: 'Hình dọc 225x400 - tỷ lệ 9:16',
        html: `<div class="vertical-placeholder vertical-sm" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 225px; aspect-ratio: 9/16; background: linear-gradient(135deg, rgba(106,91,255,0.08), rgba(0,240,255,0.05)); border: 2px dashed rgba(106,91,255,0.4); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 2rem; opacity: 0.3; margin-bottom: 6px;">📱</span>
  <p style="margin: 0; color: rgba(106,91,255,0.6); font-size: 12px; font-weight: 500;">Dọc 9:16 (225px)</p>
</div>`,
      },
      // ═══ SQUARE PLACEHOLDERS - 1:1 Ratio ═══
      {
        id: 'square-placeholder-lg',
        label: 'Vuông 1:1 (Lớn)',
        icon: Image,
        description: 'Hình vuông 500x500',
        html: `<div class="square-placeholder square-lg" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 500px; aspect-ratio: 1/1; background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,240,255,0.05)); border: 3px dashed rgba(16,185,129,0.4); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 3rem; opacity: 0.3; margin-bottom: 8px;">⬜</span>
  <p style="margin: 0; color: rgba(16,185,129,0.6); font-size: 14px; font-weight: 500;">Vuông 1:1 (500px)</p>
</div>`,
      },
      {
        id: 'square-placeholder-md',
        label: 'Vuông 1:1 (Vừa)',
        icon: Image,
        description: 'Hình vuông 350x350',
        html: `<div class="square-placeholder square-md" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 350px; aspect-ratio: 1/1; background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,240,255,0.05)); border: 3px dashed rgba(16,185,129,0.4); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 8px;">⬜</span>
  <p style="margin: 0; color: rgba(16,185,129,0.6); font-size: 13px; font-weight: 500;">Vuông 1:1 (350px)</p>
</div>`,
      },
      {
        id: 'square-placeholder-sm',
        label: 'Vuông 1:1 (Nhỏ)',
        icon: Image,
        description: 'Hình vuông 200x200',
        html: `<div class="square-placeholder square-sm" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; max-width: 200px; aspect-ratio: 1/1; background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,240,255,0.05)); border: 2px dashed rgba(16,185,129,0.4); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box;">
  <span style="font-size: 2rem; opacity: 0.3; margin-bottom: 6px;">⬜</span>
  <p style="margin: 0; color: rgba(16,185,129,0.6); font-size: 12px; font-weight: 500;">Vuông 1:1 (200px)</p>
</div>`,
      },
      // ═══ BACKGROUND PLACEHOLDERS ═══
      {
        id: 'background-placeholder-lg',
        label: 'Background (Lớn)',
        icon: Image,
        description: 'Section background với overlay - Full width',
        html: `<div class="background-placeholder background-lg" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; min-height: 400px; background: linear-gradient(135deg, rgba(156,6,18,0.15), rgba(74,26,79,0.2)); border: 3px dashed rgba(156,6,18,0.4); border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.3); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%);"></div>
  <span style="font-size: 3rem; opacity: 0.4; margin-bottom: 8px; position: relative; z-index: 1;">🎨</span>
  <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500; position: relative; z-index: 1;">Background Section (Full)</p>
  <p style="margin: 4px 0 0; color: rgba(255,255,255,0.5); font-size: 12px; position: relative; z-index: 1;">Kéo thả hình ảnh để làm background</p>
</div>`,
      },
      {
        id: 'background-placeholder-md',
        label: 'Background (Vừa)',
        icon: Image,
        description: 'Section background với overlay - Medium',
        html: `<div class="background-placeholder background-md" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; min-height: 300px; background: linear-gradient(135deg, rgba(156,6,18,0.15), rgba(74,26,79,0.2)); border: 3px dashed rgba(156,6,18,0.4); border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.3); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%);"></div>
  <span style="font-size: 2.5rem; opacity: 0.4; margin-bottom: 8px; position: relative; z-index: 1;">🎨</span>
  <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; position: relative; z-index: 1;">Background Section (Vừa)</p>
  <p style="margin: 4px 0 0; color: rgba(255,255,255,0.5); font-size: 11px; position: relative; z-index: 1;">Kéo thả hình ảnh</p>
</div>`,
      },
      {
        id: 'background-placeholder-sm',
        label: 'Background (Nhỏ)',
        icon: Image,
        description: 'Section background với overlay - Small',
        html: `<div class="background-placeholder background-sm" style="margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; width: 100%; min-height: 200px; background: linear-gradient(135deg, rgba(156,6,18,0.15), rgba(74,26,79,0.2)); border: 2px dashed rgba(156,6,18,0.4); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.3); transition: all 0.3s ease; cursor: pointer; box-sizing: border-box; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%);"></div>
  <span style="font-size: 2rem; opacity: 0.4; margin-bottom: 6px; position: relative; z-index: 1;">🎨</span>
  <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 500; position: relative; z-index: 1;">Background (Nhỏ)</p>
</div>`,
      },
      {
        id: 'spacer',
        label: 'Spacer',
        icon: Minus,
        description: 'Khoảng trống',
        html: `<div style="height: 1rem; margin: 0.25rem 0;"></div>`,
      },
    ],
  },
  {
    id: 'products',
    label: '🛍️ Sản Phẩm',
    icon: ShoppingBag,
    collapsed: false,
    items: [
      {
        id: 'product-picker',
        label: 'Chọn Sản Phẩm',
        icon: ShoppingBag,
        description: 'Mở modal chọn sản phẩm từ Shop',
        isSpecial: true, // Flag to trigger ProductPickerModal
        action: 'openProductPicker',
        html: '', // Will be generated by ProductPickerModal
      },
      {
        id: 'product-card',
        label: 'Product Card',
        icon: CreditCard,
        description: 'Card sản phẩm mẫu',
        html: `<div class="product-recommend-card" data-product-id="sample" data-product-handle="sample-product" data-deeplink="gem://shop/product/sample" onclick="window.handleProductClick && window.handleProductClick(this)" style="background: linear-gradient(135deg, rgba(106, 91, 255, 0.1), rgba(0, 240, 255, 0.05)); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.75rem; margin: 0.75rem 0; cursor: pointer; transition: all 0.2s ease;">
  <div style="display: flex; gap: 12px; align-items: center;">
    <div style="width: 70px; height: 70px; background: rgba(255,255,255,0.05); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); flex-shrink: 0;">🛍️</div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 3px;">Tên Sản Phẩm</div>
      <div style="font-size: 11px; color: rgba(255,255,255,0.5); margin-bottom: 4px;">GEM Store</div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 15px; font-weight: 700; color: #FFBD59;">450,000₫</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.4); text-decoration: line-through;">550,000₫</span>
        <span style="background: #EF4444; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: 600; color: #fff;">-18%</span>
      </div>
    </div>
    <div style="color: #00F0FF; font-size: 18px; flex-shrink: 0;">→</div>
  </div>
</div>`,
      },
      {
        id: 'product-banner',
        label: 'Product Banner',
        icon: Tag,
        description: 'Banner sản phẩm nổi bật',
        html: `<div class="product-recommend-banner" data-product-id="sample" data-product-handle="sample-product" data-deeplink="gem://shop/product/sample" onclick="window.handleProductClick && window.handleProductClick(this)" style="background: linear-gradient(135deg, #6A5BFF, #00F0FF); border-radius: 12px; padding: 1rem; margin: 0.75rem 0; cursor: pointer; position: relative; overflow: hidden;">
  <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
    <div style="flex: 1; min-width: 0;">
      <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.8); margin-bottom: 4px;">🛍️ SẢN PHẨM KHUYÊN DÙNG</div>
      <div style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px;">Tên Sản Phẩm Nổi Bật</div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 16px; font-size: 14px; font-weight: 600; color: #FFBD59;">450,000₫</span>
        <span style="background: #EF4444; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; color: #fff;">-18%</span>
      </div>
    </div>
    <div style="width: 80px; height: 80px; background: rgba(0,0,0,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); flex-shrink: 0;">🖼️</div>
  </div>
</div>`,
      },
      {
        id: 'product-inline',
        label: 'Product Inline',
        icon: Type,
        description: 'Inline product link',
        html: `<span class="product-recommend-inline" data-product-id="sample" data-product-handle="sample-product" data-deeplink="gem://shop/product/sample" onclick="window.handleProductClick && window.handleProductClick(this)" style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, rgba(106, 91, 255, 0.2), rgba(0, 240, 255, 0.1)); padding: 4px 12px; border-radius: 20px; cursor: pointer; color: #00F0FF; font-weight: 500; border: 1px solid rgba(0, 240, 255, 0.3);">🛍️ Tên Sản Phẩm <span style="color: #FFBD59; font-weight: 600;">450,000₫</span></span>`,
      },
      {
        id: 'product-grid',
        label: 'Product Grid 2x2',
        icon: Grid,
        description: 'Lưới 4 sản phẩm',
        html: `<div class="product-recommend-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 0.75rem 0;">
  <div class="product-recommend-grid-item" data-product-id="1" data-deeplink="gem://shop/product/product-1" onclick="window.handleProductClick && window.handleProductClick(this)" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; cursor: pointer;">
    <div style="width: 100%; aspect-ratio: 1; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3);">🖼️</div>
    <div style="padding: 8px;">
      <div style="font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Sản phẩm 1</div>
      <div style="font-size: 14px; font-weight: 700; color: #FFBD59;">300,000₫</div>
    </div>
  </div>
  <div class="product-recommend-grid-item" data-product-id="2" data-deeplink="gem://shop/product/product-2" onclick="window.handleProductClick && window.handleProductClick(this)" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; cursor: pointer;">
    <div style="width: 100%; aspect-ratio: 1; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3);">🖼️</div>
    <div style="padding: 8px;">
      <div style="font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Sản phẩm 2</div>
      <div style="font-size: 14px; font-weight: 700; color: #FFBD59;">450,000₫</div>
    </div>
  </div>
</div>`,
      },
    ],
  },
];

// Text color palette for highlighting
const TEXT_COLORS = [
  { name: 'Trắng', value: '#FFFFFF' },
  { name: 'Vàng Gold', value: '#FFBD59' },
  { name: 'Đỏ Burgundy', value: '#9C0612' },
  { name: 'Xanh dương', value: '#60a5fa' },
  { name: 'Xanh lá', value: '#4ade80' },
  { name: 'Tím', value: '#c084fc' },
  { name: 'Cam', value: '#fb923c' },
  { name: 'Hồng', value: '#f472b6' },
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Đỏ', value: '#ef4444' },
  { name: 'Xám', value: 'rgba(255,255,255,0.5)' },
  { name: 'Mặc định', value: 'inherit' },
];

// Background highlight colors
const HIGHLIGHT_COLORS = [
  { name: 'Vàng', value: 'rgba(255,189,89,0.3)' },
  { name: 'Xanh', value: 'rgba(59,130,246,0.3)' },
  { name: 'Xanh lá', value: 'rgba(34,197,94,0.3)' },
  { name: 'Tím', value: 'rgba(168,85,247,0.3)' },
  { name: 'Đỏ', value: 'rgba(239,68,68,0.3)' },
  { name: 'Cam', value: 'rgba(249,115,22,0.3)' },
  { name: 'Hồng', value: 'rgba(236,72,153,0.3)' },
  { name: 'Không', value: 'transparent' },
];

// Design tokens
const COLORS = {
  bgDark: '#0a0a0f',
  bgCard: 'rgba(255, 255, 255, 0.05)',
  bgOverlay: 'rgba(0, 0, 0, 0.9)',
  burgundy: '#9C0612',
  gold: '#FFBD59',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  border: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(255, 255, 255, 0.2)',
  success: '#22c55e',
  error: '#ef4444',
  dragOver: 'rgba(255, 189, 89, 0.15)',
  selected: 'rgba(156, 6, 18, 0.2)',
  dragging: 'rgba(255, 189, 89, 0.1)',
};

/**
 * Generate unique block ID
 */
let blockIdCounter = 0;
function generateBlockId() {
  blockIdCounter++;
  return `block-${blockIdCounter}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Check if element is a styled card/box
 * AGGRESSIVE detection - checks inline styles, class names, AND structure
 */
function isStyledCard(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

  const style = element.getAttribute('style') || '';
  const className = typeof element.className === 'string'
    ? element.className
    : (element.getAttribute('class') || '');
  const classLower = className.toLowerCase();

  // 1. Check inline styles for visual card indicators
  const hasBackground = /background(-color)?:\s*(?!none|transparent|inherit)/.test(style) ||
                        style.includes('linear-gradient') ||
                        style.includes('radial-gradient') ||
                        style.includes('rgb') ||
                        style.includes('#');
  const hasBorderRadius = style.includes('border-radius');
  const hasBoxShadow = style.includes('box-shadow');
  const hasBorder = /border:\s*(?!none|0)/.test(style) || style.includes('border-color');
  const hasPadding = /padding:\s*(?!0)/.test(style);

  // 2. Check class names for card patterns
  const hasCardClass = /\b(card|box|panel|callout|alert|notice|tip|warning|info|hero|banner|section|container|wrapper|content|block|item|module|widget)\b/.test(classLower);

  // 3. Check structure - DIV with heading and content is likely a card
  const tagName = element.tagName;
  if (tagName === 'DIV' || tagName === 'SECTION' || tagName === 'ARTICLE') {
    const hasHeading = element.querySelector('h1, h2, h3, h4, h5, h6');
    const hasContent = element.querySelector('p, ul, ol, div');
    const isStructuredCard = hasHeading && hasContent;

    // If has both heading and content, treat as card
    if (isStructuredCard) return true;
  }

  // 4. Return true if has visual styling
  return hasBackground || (hasBorderRadius && (hasBoxShadow || hasBorder)) ||
         (hasPadding && (hasBorder || hasBorderRadius)) || hasCardClass;
}

/**
 * Create a block object from element
 */
function createBlockFromElement(element, blockType = 'element') {
  const isCard = isStyledCard(element);

  // Parse data-width/height as numbers to preserve resize state
  const dataWidth = element.getAttribute('data-width');
  const dataHeight = element.getAttribute('data-height');
  const dataMobileWidth = element.getAttribute('data-mobile-width');

  return {
    id: generateBlockId(),
    type: isCard ? 'card' : blockType,
    html: element.outerHTML,
    tagName: element.tagName,
    innerText: element.textContent?.substring(0, 80) || '',
    // Web editor dimensions (pixels)
    width: dataWidth ? parseInt(dataWidth, 10) : 'auto',
    height: dataHeight ? parseInt(dataHeight, 10) : 'auto',
    // Mobile preview width (percentage, independent from web)
    mobileWidth: dataMobileWidth ? parseInt(dataMobileWidth, 10) : 100,
    isCard: isCard,
  };
}

/**
 * Parse HTML string into blocks
 * RECURSIVE: Unwrap plain DIVs, keep styled cards together
 */
function parseHtmlToBlocks(html) {
  if (!html || typeof html !== 'string') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstChild;

  if (!container) return [];

  const blocks = [];
  blockIdCounter = 0;

  // Recursive function to process nodes
  function processNode(node, depth = 0) {
    if (depth > 10) return; // Safety limit

    // Handle text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        blocks.push({
          id: generateBlockId(),
          type: 'text',
          html: `<p>${text}</p>`,
          tagName: 'P',
          innerText: text.substring(0, 80),
          width: 'auto',
          height: 'auto',
          isCard: false,
        });
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node;
    const tagName = element.tagName;

    // Skip empty elements
    if (!element.innerHTML?.trim()) return;

    // 1. Styled cards - keep as one block (don't unwrap)
    if (isStyledCard(element)) {
      blocks.push(createBlockFromElement(element, 'card'));
      return;
    }

    // 2. Plain DIVs/SPANs without styling - UNWRAP and process children
    if ((tagName === 'DIV' || tagName === 'SPAN') && element.children.length > 0) {
      Array.from(element.childNodes).forEach(child => processNode(child, depth + 1));
      return;
    }

    // 3. Content elements - create individual blocks
    let blockType = 'element';
    if (['IMG', 'VIDEO', 'IFRAME', 'CANVAS', 'SVG'].includes(tagName)) {
      blockType = 'media';
    } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'BLOCKQUOTE'].includes(tagName)) {
      blockType = 'content';
    } else if (['UL', 'OL'].includes(tagName)) {
      blockType = 'list';
    } else if (['TABLE'].includes(tagName)) {
      blockType = 'table';
    } else if (['HR'].includes(tagName)) {
      blockType = 'divider';
    } else if (['FIGURE'].includes(tagName)) {
      blockType = 'figure';
    }

    blocks.push(createBlockFromElement(element, blockType));
  }

  // Process top-level children
  Array.from(container.childNodes).forEach(node => processNode(node, 0));

  console.log('[PARSE] Created', blocks.length, 'blocks:', blocks.map(b => ({ type: b.type, tag: b.tagName, text: b.innerText?.substring(0, 30) })));

  return blocks;
}

/**
 * Convert blocks array back to HTML string
 * PRESERVES original styles and adds resize dimensions
 */
function blocksToHtml(blocks) {
  console.log('[blocksToHtml] Converting', blocks.length, 'blocks');

  return blocks.map(block => {
    const hasCustomWidth = typeof block.width === 'number';
    const hasCustomHeight = typeof block.height === 'number';

    console.log('[blocksToHtml] Block', block.id, '- width:', block.width, 'height:', block.height,
      'hasCustomWidth:', hasCustomWidth, 'hasCustomHeight:', hasCustomHeight);

    // If no custom dimensions, return original HTML unchanged
    if (!hasCustomWidth && !hasCustomHeight) {
      return block.html;
    }

    // Parse and modify
    const parser = new DOMParser();
    const doc = parser.parseFromString(block.html, 'text/html');
    const el = doc.body.firstChild;

    if (!el || el.nodeType !== Node.ELEMENT_NODE) {
      return block.html;
    }

    // Get existing style and REMOVE old width/height to avoid duplicates
    let existingStyle = el.getAttribute('style') || '';
    // Remove existing width, height, max-width, overflow, box-sizing rules
    // Use word boundary to avoid partial matches
    existingStyle = existingStyle
      .replace(/\bwidth\s*:\s*[^;]+;?/gi, '')
      .replace(/\bheight\s*:\s*[^;]+;?/gi, '')
      .replace(/\bmax-width\s*:\s*[^;]+;?/gi, '')
      .replace(/\boverflow\s*:\s*[^;]+;?/gi, '')
      .replace(/\bbox-sizing\s*:\s*[^;]+;?/gi, '')
      .replace(/\s*;\s*;+/g, ';')  // Clean up multiple semicolons
      .replace(/^\s*;\s*/g, '')     // Remove leading semicolon
      .replace(/\s*;\s*$/g, '')     // Remove trailing semicolon
      .trim();

    // Build new style additions
    let styleAdditions = '';

    // Save web width as data attribute (for editor display)
    if (hasCustomWidth) {
      el.setAttribute('data-width', block.width);
    }

    // Mobile width: use mobileWidth property (independent from web width)
    const mobileWidth = typeof block.mobileWidth === 'number' ? block.mobileWidth : 100;
    el.setAttribute('data-mobile-width', mobileWidth);
    console.log('[blocksToHtml] Mobile width:', mobileWidth, '%', '| Web width:', block.width);

    if (mobileWidth >= 100) {
      // Full width: break out of body padding to use full screen width
      // Also reduce internal padding for cards/tables to maximize content space
      styleAdditions += `width: calc(100% + 32px); margin-left: -16px; margin-right: -16px; padding-left: 8px !important; padding-right: 8px !important; box-sizing: border-box; `;
    } else {
      styleAdditions += `width: ${mobileWidth}%; box-sizing: border-box; `;
    }

    if (hasCustomHeight) {
      el.setAttribute('data-height', block.height);
      styleAdditions += `height: auto; `;  // Use auto height for mobile, let content flow
    }

    // Combine cleaned existing style with new additions
    const finalStyle = existingStyle
      ? `${existingStyle}; ${styleAdditions}`
      : styleAdditions;

    el.setAttribute('style', finalStyle);

    const output = el.outerHTML;
    console.log('[blocksToHtml] Block with custom size - style:', finalStyle.substring(0, 100) + '...');
    return output;
  }).join('\n');
}

/**
 * Get block type label based on block type and tag
 */
function getBlockLabel(block) {
  // Use block type first
  if (block.type === 'card' || block.isCard) {
    return '📦 Card';
  }
  if (block.type === 'media') {
    return '🖼️ Media';
  }

  const tagMap = {
    'H1': 'H1',
    'H2': 'H2',
    'H3': 'H3',
    'H4': 'H4',
    'H5': 'H5',
    'H6': 'H6',
    'P': 'Paragraph',
    'DIV': 'Section',
    'UL': 'List',
    'OL': 'Numbered List',
    'BLOCKQUOTE': 'Quote',
    'TABLE': 'Table',
    'IMG': 'Image',
    'VIDEO': 'Video',
    'PRE': 'Code',
    'FIGURE': 'Figure',
    'SECTION': 'Section',
    'ARTICLE': 'Article',
    'HEADER': 'Header',
    'FOOTER': 'Footer',
    'NAV': 'Navigation',
    'ASIDE': 'Aside',
    'SPAN': 'Text',
    'A': 'Link',
    'BUTTON': 'Button',
  };
  return tagMap[block.tagName] || block.tagName;
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    // Also accept relative paths
    return string.startsWith('/') || string.startsWith('#') || string.startsWith('mailto:');
  }
}

/**
 * Link Editor Modal - Inline popup to edit links
 */
function LinkEditorModal({ linkElement, position, onSave, onClose }) {
  const [url, setUrl] = useState(linkElement?.getAttribute('href') || '');
  const [text, setText] = useState(linkElement?.textContent || '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    onSave(url, text);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle paste in URL field
  const handlePaste = async (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (isValidUrl(pastedText)) {
      setUrl(pastedText);
    } else {
      setUrl(pastedText);
    }
  };

  // Handle drop in URL field
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
    if (droppedText && isValidUrl(droppedText)) {
      setUrl(droppedText);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 10000,
        backgroundColor: COLORS.bgOverlay,
        border: `1px solid ${COLORS.gold}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: '320px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.gold }}>
          <Link2 size={16} />
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Chỉnh sửa Link</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: COLORS.textMuted,
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px', display: 'block' }}>
          URL (paste hoặc drop link vào đây)
        </label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com hoặc /path/to/page"
          style={{
            width: '100%',
            padding: '8px 10px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            color: COLORS.textPrimary,
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px', display: 'block' }}>
          Text hiển thị
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nội dung link"
          style={{
            width: '100%',
            padding: '8px 10px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            color: COLORS.textPrimary,
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              color: COLORS.textSecondary,
              fontSize: '12px',
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={12} />
            Test
          </a>
        )}
        <button
          onClick={onClose}
          style={{
            padding: '6px 12px',
            backgroundColor: 'transparent',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            color: COLORS.textSecondary,
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '6px 12px',
            backgroundColor: COLORS.gold,
            border: 'none',
            borderRadius: '6px',
            color: '#000',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Check size={14} />
          Lưu
        </button>
      </div>
    </div>
  );
}

/**
 * Main DraggableBlockEditor component
 */
export default function DraggableBlockEditor({
  html,
  onChange,
  onSaveToUndo,
  className = '',
  placeholder = 'Nội dung trống. Thêm nội dung từ Code mode.',
}) {
  const [blocks, setBlocks] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverPosition, setDragOverPosition] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Link editor state
  const [editingLink, setEditingLink] = useState(null);
  const [linkEditorPosition, setLinkEditorPosition] = useState({ top: 0, left: 0 });
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);

  // Resize state
  const [resizingIndex, setResizingIndex] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartDimensions, setResizeStartDimensions] = useState({ width: 0, height: 0 });
  const [aspectLocked, setAspectLocked] = useState({});
  const [blockAlignments, setBlockAlignments] = useState({});
  const [showBlockSettings, setShowBlockSettings] = useState({});
  const [snappedRatio, setSnappedRatio] = useState(null); // Track when snapping occurs

  // Toolbox state
  const [toolboxExpanded, setToolboxExpanded] = useState(true);
  const [toolboxCategories, setToolboxCategories] = useState(
    TOOLBOX_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: !cat.collapsed }), {})
  );
  const [draggingToolboxItem, setDraggingToolboxItem] = useState(null);
  const [toolboxDropZoneActive, setToolboxDropZoneActive] = useState(false);
  const [toolboxInsertIndex, setToolboxInsertIndex] = useState(null);

  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState('text'); // 'text' or 'highlight'

  const containerRef = useRef(null);
  const blockRefs = useRef({});
  const lastGeneratedHtml = useRef(null); // Store last HTML we generated to detect our own updates
  const blocksRef = useRef(blocks); // Keep latest blocks for event handlers

  // Keep blocksRef in sync with blocks state
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Parse HTML to blocks when html changes (but skip if it's our own update)
  useEffect(() => {
    // Compare with last generated HTML to detect our own updates
    if (html === lastGeneratedHtml.current) {
      console.log('[PARSE EFFECT] SKIPPING - this is our own HTML update');
      return;
    }
    console.log('[PARSE EFFECT] Running parse (external HTML change)...');
    const parsed = parseHtmlToBlocks(html);
    setBlocks(parsed);
  }, [html]);

  // Update parent when blocks change
  const updateHtml = useCallback((newBlocks) => {
    const newHtml = blocksToHtml(newBlocks);
    lastGeneratedHtml.current = newHtml; // Remember this HTML so we can skip re-parsing it
    // Log width style to verify it's being included
    const widthMatch = newHtml.match(/width:\s*\d+%/);
    console.log('[updateHtml] Generated HTML with width:', widthMatch?.[0] || 'none', 'length:', newHtml.length);
    onChange(newHtml);
  }, [onChange]);

  // Drag handlers - using native HTML5 drag and drop
  const handleDragStart = useCallback((e, index) => {
    // Set data first
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.setData('application/x-block-drag', 'true');

    // Set drag image to the whole block
    const blockElement = blockRefs.current[index];
    if (blockElement) {
      const rect = blockElement.getBoundingClientRect();
      e.dataTransfer.setDragImage(blockElement, rect.width / 2, 20);
    }

    setDraggingIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingIndex(null);
    setDragOverIndex(null);
    setDragOverPosition(null);
  }, []);

  // Auto-scroll when dragging near edges
  const autoScrollRef = useRef(null);
  const performAutoScroll = useCallback((e) => {
    const scrollContainer = containerRef.current?.closest('.fullscreen-block-editor') ||
                           containerRef.current?.closest('.editor-content-panel') ||
                           containerRef.current?.parentElement;
    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollSpeed = 15;
    const edgeThreshold = 60; // pixels from edge to trigger scroll

    // Clear existing scroll interval
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }

    // Check if near top edge
    if (e.clientY < containerRect.top + edgeThreshold) {
      autoScrollRef.current = setInterval(() => {
        scrollContainer.scrollTop -= scrollSpeed;
      }, 16);
    }
    // Check if near bottom edge
    else if (e.clientY > containerRect.bottom - edgeThreshold) {
      autoScrollRef.current = setInterval(() => {
        scrollContainer.scrollTop += scrollSpeed;
      }, 16);
    }
  }, []);

  // Clear auto-scroll on drag end
  useEffect(() => {
    if (draggingIndex === null && draggingToolboxItem === null) {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    }
  }, [draggingIndex, draggingToolboxItem]);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is a block drag (not a file or external drag)
    if (!e.dataTransfer.types.includes('application/x-block-drag')) {
      return;
    }

    e.dataTransfer.dropEffect = 'move';

    // Auto-scroll when near edges
    performAutoScroll(e);

    if (draggingIndex === null || draggingIndex === index) {
      return;
    }

    // Determine if dropping above or below
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'above' : 'below';

    setDragOverIndex(index);
    setDragOverPosition(position);
  }, [draggingIndex, performAutoScroll]);

  const handleDragLeave = useCallback((e) => {
    const relatedTarget = e.relatedTarget;
    const currentTarget = e.currentTarget;

    if (!currentTarget.contains(relatedTarget)) {
      setDragOverIndex(null);
      setDragOverPosition(null);
    }
  }, []);

  const handleDrop = useCallback((e, toIndex) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is a block drag
    if (!e.dataTransfer.types.includes('application/x-block-drag')) {
      return;
    }

    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (isNaN(fromIndex) || fromIndex === toIndex) {
      handleDragEnd();
      return;
    }

    onSaveToUndo?.();

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);

    // Calculate insert position
    let insertIndex = toIndex;
    if (dragOverPosition === 'below') {
      insertIndex = fromIndex < toIndex ? toIndex : toIndex + 1;
    } else {
      insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    }

    // Ensure valid index
    insertIndex = Math.max(0, Math.min(insertIndex, newBlocks.length));

    newBlocks.splice(insertIndex, 0, movedBlock);
    setBlocks(newBlocks);
    updateHtml(newBlocks);
    setSelectedIndex(insertIndex);
    handleDragEnd();
  }, [blocks, dragOverPosition, handleDragEnd, onSaveToUndo, updateHtml]);

  // Block actions
  const handleSelect = (index) => {
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  const handleDelete = (index) => {
    onSaveToUndo?.();
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    updateHtml(newBlocks);
    setSelectedIndex(null);
  };

  const handleDuplicate = (index) => {
    onSaveToUndo?.();
    const blockToDuplicate = blocks[index];
    const newBlock = {
      ...blockToDuplicate,
      id: `block-dup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    updateHtml(newBlocks);
    setSelectedIndex(index + 1);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    onSaveToUndo?.();
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
    updateHtml(newBlocks);
    setSelectedIndex(index - 1);
  };

  const handleMoveDown = (index) => {
    if (index === blocks.length - 1) return;
    onSaveToUndo?.();
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
    updateHtml(newBlocks);
    setSelectedIndex(index + 1);
  };

  const handleContentChange = (index, newHtml) => {
    onSaveToUndo?.();
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], html: newHtml };
    setBlocks(newBlocks);
    updateHtml(newBlocks);
  };

  // ═══════════════════════════════════════════════════════════
  // TOOLBOX HANDLERS - Drag from toolbox to add new blocks
  // ═══════════════════════════════════════════════════════════

  // Toggle toolbox category
  const toggleToolboxCategory = (categoryId) => {
    setToolboxCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  // Handle drag start from toolbox item
  const handleToolboxDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-toolbox-item', JSON.stringify(item));
    e.dataTransfer.setData('text/plain', item.label);
    setDraggingToolboxItem(item);
  };

  // Handle drag end from toolbox
  const handleToolboxDragEnd = () => {
    setDraggingToolboxItem(null);
    setToolboxDropZoneActive(false);
    setToolboxInsertIndex(null);
  };

  // Handle drag over blocks area (for toolbox items)
  const handleToolboxDragOver = useCallback((e, index) => {
    // Check if this is a toolbox item drag
    if (!e.dataTransfer.types.includes('application/x-toolbox-item')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    // Auto-scroll when near edges
    performAutoScroll(e);

    // Determine insert position
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertAt = e.clientY < midY ? index : index + 1;
    setToolboxInsertIndex(insertAt);
    setToolboxDropZoneActive(true);
  }, [performAutoScroll]);

  // Handle drop from toolbox
  const handleToolboxDrop = useCallback((e, targetIndex) => {
    // Check if this is a toolbox item
    const toolboxData = e.dataTransfer.getData('application/x-toolbox-item');
    if (!toolboxData) return;

    e.preventDefault();
    e.stopPropagation();

    try {
      const item = JSON.parse(toolboxData);
      onSaveToUndo?.();

      // Parse the template HTML to create a new block
      const parser = new DOMParser();
      const doc = parser.parseFromString(item.html, 'text/html');
      const element = doc.body.firstChild;

      if (element) {
        const newBlock = createBlockFromElement(element, 'card');

        // Insert at the specified position
        const insertIndex = toolboxInsertIndex !== null ? toolboxInsertIndex : targetIndex;
        const newBlocks = [...blocks];
        newBlocks.splice(insertIndex, 0, newBlock);

        setBlocks(newBlocks);
        updateHtml(newBlocks);
        setSelectedIndex(insertIndex);

        console.log('[TOOLBOX] Added block:', item.label, 'at index:', insertIndex);
      }
    } catch (err) {
      console.error('[TOOLBOX] Drop error:', err);
    }

    handleToolboxDragEnd();
  }, [blocks, toolboxInsertIndex, onSaveToUndo, updateHtml]);

  // Handle click to add from toolbox (alternative to drag)
  const handleToolboxItemClick = (item) => {
    onSaveToUndo?.();

    const parser = new DOMParser();
    const doc = parser.parseFromString(item.html, 'text/html');
    const element = doc.body.firstChild;

    if (element) {
      const newBlock = createBlockFromElement(element, 'card');

      // Add at the end or after selected block
      const insertIndex = selectedIndex !== null ? selectedIndex + 1 : blocks.length;
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);

      setBlocks(newBlocks);
      updateHtml(newBlocks);
      setSelectedIndex(insertIndex);

      console.log('[TOOLBOX] Clicked to add:', item.label, 'at index:', insertIndex);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // COLOR PICKER HANDLERS - Apply colors to selected text
  // ═══════════════════════════════════════════════════════════

  // Apply text color to selection
  const applyTextColor = (color) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      alert('Vui lòng chọn (highlight) đoạn text cần đổi màu');
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText.trim()) {
      alert('Vui lòng chọn (highlight) đoạn text cần đổi màu');
      return;
    }

    onSaveToUndo?.();

    // Create a span with the color
    const span = document.createElement('span');
    span.style.color = color;
    span.textContent = selectedText;

    // Replace the selection
    range.deleteContents();
    range.insertNode(span);

    // Update the block HTML
    if (selectedIndex !== null) {
      const blockContentEl = blockRefs.current[selectedIndex]?.querySelector('.block-html-content');
      if (blockContentEl) {
        handleContentChange(selectedIndex, blockContentEl.innerHTML);
      }
    }

    setShowColorPicker(false);
    selection.removeAllRanges();
  };

  // Apply background highlight to selection
  const applyHighlightColor = (color) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      alert('Vui lòng chọn (highlight) đoạn text cần highlight');
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText.trim()) {
      alert('Vui lòng chọn (highlight) đoạn text cần highlight');
      return;
    }

    onSaveToUndo?.();

    // Create a mark/span with background
    const mark = document.createElement('mark');
    mark.style.backgroundColor = color;
    mark.style.color = 'inherit';
    mark.style.padding = '0 2px';
    mark.style.borderRadius = '2px';
    mark.textContent = selectedText;

    range.deleteContents();
    range.insertNode(mark);

    // Update the block HTML
    if (selectedIndex !== null) {
      const blockContentEl = blockRefs.current[selectedIndex]?.querySelector('.block-html-content');
      if (blockContentEl) {
        handleContentChange(selectedIndex, blockContentEl.innerHTML);
      }
    }

    setShowColorPicker(false);
    selection.removeAllRanges();
  };

  // Handle click on links/buttons in the content
  const handleContentClick = (e, blockIndex) => {
    const target = e.target;

    // Check if clicked on a link or button
    const linkElement = target.closest('a') || target.closest('button[data-href]') ||
                        (target.tagName === 'A' ? target : null) ||
                        (target.tagName === 'BUTTON' ? target : null);

    if (linkElement && (linkElement.tagName === 'A' || linkElement.hasAttribute('href') || linkElement.hasAttribute('data-href'))) {
      e.preventDefault();
      e.stopPropagation();

      // Get position for the editor modal
      const rect = linkElement.getBoundingClientRect();
      setLinkEditorPosition({
        top: Math.min(rect.bottom + 8, window.innerHeight - 250),
        left: Math.max(10, Math.min(rect.left, window.innerWidth - 340)),
      });
      setEditingLink(linkElement);
      setEditingBlockIndex(blockIndex);
    }
  };

  // Handle link save
  const handleLinkSave = (newUrl, newText) => {
    if (!editingLink || editingBlockIndex === null) return;

    onSaveToUndo?.();

    // Get the block's content element
    const blockContentEl = blockRefs.current[editingBlockIndex]?.querySelector('.block-html-content');
    if (!blockContentEl) return;

    // Find and update the link in the content
    const links = blockContentEl.querySelectorAll('a, button[data-href]');
    links.forEach(link => {
      if (link === editingLink || link.textContent === editingLink.textContent) {
        if (link.tagName === 'A') {
          link.setAttribute('href', newUrl);
          link.textContent = newText;
        } else if (link.tagName === 'BUTTON') {
          link.setAttribute('data-href', newUrl);
          link.textContent = newText;
        }
      }
    });

    // Update the block's HTML
    const newHtml = blockContentEl.innerHTML;
    handleContentChange(editingBlockIndex, newHtml);

    setEditingLink(null);
    setEditingBlockIndex(null);
  };

  // Handle drop on content (for dropping URLs onto links)
  const handleContentDrop = (e, blockIndex) => {
    // If it's a block drag, don't handle here
    if (e.dataTransfer.types.includes('application/x-block-drag')) {
      return;
    }

    const droppedUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');

    if (droppedUrl && isValidUrl(droppedUrl)) {
      const target = e.target;
      const linkElement = target.closest('a') || target.closest('button[data-href]');

      if (linkElement) {
        e.preventDefault();
        e.stopPropagation();

        onSaveToUndo?.();

        if (linkElement.tagName === 'A') {
          linkElement.setAttribute('href', droppedUrl);
        } else if (linkElement.tagName === 'BUTTON') {
          linkElement.setAttribute('data-href', droppedUrl);
        }

        // Update block HTML
        const blockContentEl = blockRefs.current[blockIndex]?.querySelector('.block-html-content');
        if (blockContentEl) {
          handleContentChange(blockIndex, blockContentEl.innerHTML);
        }
      }
    }
  };

  // Mobile screen width reference (iPhone 14 Pro Max)
  const MOBILE_WIDTH = 430;

  // Smart snap points as percentages of mobile width
  const SNAP_POINTS = [0.25, 0.33, 0.5, 0.66, 0.75, 1.0];
  const SNAP_THRESHOLD = 8; // pixels threshold for snapping (smaller = easier to escape)

  // Get cursor for resize direction
  const getCursorForDirection = (direction) => {
    const cursors = {
      n: 'ns-resize', s: 'ns-resize',
      e: 'ew-resize', w: 'ew-resize',
      ne: 'nesw-resize', nw: 'nwse-resize',
      se: 'nwse-resize', sw: 'nesw-resize',
    };
    return cursors[direction] || 'default';
  };

  // Check if block contains an image
  const blockHasImage = (block) => {
    return block.tagName === 'IMG' ||
           block.tagName === 'FIGURE' ||
           block.html?.includes('<img') ||
           block.html?.includes('<video');
  };

  // Snap to nearest snap point
  const snapToPoint = (width) => {
    for (const ratio of SNAP_POINTS) {
      const snapWidth = MOBILE_WIDTH * ratio;
      if (Math.abs(width - snapWidth) <= SNAP_THRESHOLD) {
        return { width: snapWidth, ratio };
      }
    }
    return { width, ratio: null };
  };

  // Handle resize start
  const handleResizeStart = useCallback((e, index, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const blockEl = blockRefs.current[index];
    if (!blockEl) return;

    // Get content wrapper's ACTUAL rendered dimensions
    const contentWrapper = blockEl.querySelector('.block-content-wrapper');
    const rect = contentWrapper ? contentWrapper.getBoundingClientRect() : blockEl.getBoundingClientRect();

    // Always use the actual rendered width/height as starting point
    const startWidth = rect.width;
    const startHeight = rect.height;

    console.log('[RESIZE START]', { index, direction, startWidth, startHeight, clientX: e.clientX, clientY: e.clientY });

    setResizingIndex(index);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartDimensions({ width: startWidth, height: startHeight });

    document.body.style.cursor = getCursorForDirection(direction);
    document.body.style.userSelect = 'none';
  }, []);

  // Handle resize move - simple and direct
  const handleResizeMove = useCallback((e) => {
    if (resizingIndex === null || !resizeDirection) return;

    const block = blocks[resizingIndex];
    if (!block) return;

    const deltaX = e.clientX - resizeStartPos.x;
    const deltaY = e.clientY - resizeStartPos.y;

    // Only use aspect lock if user explicitly turned it on
    const isLocked = aspectLocked[block.id] === true;
    const aspectRatio = resizeStartDimensions.height !== 0
      ? resizeStartDimensions.width / resizeStartDimensions.height
      : 1;

    let newWidth = resizeStartDimensions.width;
    let newHeight = resizeStartDimensions.height;

    console.log('[RESIZE MOVE]', { deltaX, deltaY, direction: resizeDirection, startW: resizeStartDimensions.width });

    // Calculate new dimensions based on drag direction
    switch (resizeDirection) {
      case 'e': // East - drag right to increase width
        newWidth = resizeStartDimensions.width + deltaX;
        if (isLocked) newHeight = newWidth / aspectRatio;
        break;
      case 'w': // West - drag left to increase width
        newWidth = resizeStartDimensions.width - deltaX;
        if (isLocked) newHeight = newWidth / aspectRatio;
        break;
      case 's': // South - drag down to increase height
        newHeight = resizeStartDimensions.height + deltaY;
        if (isLocked) newWidth = newHeight * aspectRatio;
        break;
      case 'n': // North - drag up to increase height
        newHeight = resizeStartDimensions.height - deltaY;
        if (isLocked) newWidth = newHeight * aspectRatio;
        break;
      case 'se': // Southeast corner
        newWidth = resizeStartDimensions.width + deltaX;
        newHeight = isLocked ? newWidth / aspectRatio : resizeStartDimensions.height + deltaY;
        break;
      case 'sw': // Southwest corner
        newWidth = resizeStartDimensions.width - deltaX;
        newHeight = isLocked ? newWidth / aspectRatio : resizeStartDimensions.height + deltaY;
        break;
      case 'ne': // Northeast corner
        newWidth = resizeStartDimensions.width + deltaX;
        newHeight = isLocked ? newWidth / aspectRatio : resizeStartDimensions.height - deltaY;
        break;
      case 'nw': // Northwest corner
        newWidth = resizeStartDimensions.width - deltaX;
        newHeight = isLocked ? newWidth / aspectRatio : resizeStartDimensions.height - deltaY;
        break;
      default:
        break;
    }

    // Apply minimum constraints only (no max limit for expansion)
    newWidth = Math.max(60, newWidth);
    newHeight = Math.max(30, newHeight);

    // Snap to common widths
    const snapped = snapToPoint(newWidth);
    if (snapped.ratio !== null) {
      newWidth = snapped.width;
      if (isLocked) {
        newHeight = newWidth / aspectRatio;
      }
      setSnappedRatio(snapped.ratio);
    } else {
      setSnappedRatio(null);
    }

    // Update block dimensions
    const finalWidth = Math.round(newWidth);
    const finalHeight = Math.round(newHeight);

    console.log('[RESIZE UPDATE]', { finalWidth, finalHeight });

    const newBlocks = [...blocks];
    newBlocks[resizingIndex] = {
      ...block,
      width: finalWidth,
      height: finalHeight,
    };
    setBlocks(newBlocks);
  }, [resizingIndex, resizeDirection, resizeStartPos, resizeStartDimensions, blocks, aspectLocked]);

  // Handle resize end - use blocksRef to get latest blocks (avoid stale closure)
  const handleResizeEnd = useCallback(() => {
    if (resizingIndex !== null) {
      onSaveToUndo?.();
      // Use blocksRef.current to get the LATEST blocks with updated dimensions
      const latestBlocks = blocksRef.current;
      console.log('[RESIZE END] Saving blocks with dimensions:',
        latestBlocks.map(b => ({ id: b.id, width: b.width, height: b.height })));
      updateHtml(latestBlocks);
    }
    setResizingIndex(null);
    setResizeDirection(null);
    setSnappedRatio(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [resizingIndex, onSaveToUndo, updateHtml]);

  // Add resize event listeners
  useEffect(() => {
    if (resizingIndex !== null) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingIndex, handleResizeMove, handleResizeEnd]);

  // Toggle aspect lock for block
  const toggleAspectLock = (blockId) => {
    setAspectLocked(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  // Set block alignment
  const setBlockAlignment = (blockId, alignment) => {
    setBlockAlignments(prev => ({ ...prev, [blockId]: alignment }));
    // Update block HTML with alignment style
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex !== -1) {
      const block = blocks[blockIndex];
      const parser = new DOMParser();
      const doc = parser.parseFromString(block.html, 'text/html');
      const el = doc.body.firstChild;
      if (el) {
        el.style.textAlign = alignment;
        const newHtml = el.outerHTML;
        handleContentChange(blockIndex, newHtml);
      }
    }
  };

  // Toggle settings panel
  const toggleBlockSettings = (blockId) => {
    setShowBlockSettings(prev => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  // Get alignment style
  const getAlignmentStyle = (blockId) => {
    const alignment = blockAlignments[blockId] || 'left';
    switch (alignment) {
      case 'center':
        return { marginLeft: 'auto', marginRight: 'auto' };
      case 'right':
        return { marginLeft: 'auto', marginRight: 0 };
      default:
        return { marginLeft: 0, marginRight: 'auto' };
    }
  };

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSelectedIndex(null);
        setEditingLink(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;

      // Don't handle shortcuts when editing content or in the link editor
      if (e.target.contentEditable === 'true' || e.target.tagName === 'INPUT') return;

      // Delete with Delete key
      if (e.key === 'Delete') {
        e.preventDefault();
        handleDelete(selectedIndex);
      }

      // Move with Ctrl + arrow keys
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleMoveUp(selectedIndex);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          handleMoveDown(selectedIndex);
        } else if (e.key === 'd') {
          e.preventDefault();
          handleDuplicate(selectedIndex);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, blocks.length]);

  // Empty state
  if (blocks.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`draggable-block-editor empty ${className}`}
        style={{
          padding: '16px',
          minHeight: '200px',
        }}
      >
        {/* Drop zone for empty state */}
        <div
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('application/x-toolbox-item')) {
              e.preventDefault();
              setToolboxDropZoneActive(true);
            }
          }}
          onDragLeave={() => setToolboxDropZoneActive(false)}
          onDrop={(e) => handleToolboxDrop(e, 0)}
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: COLORS.textMuted,
            border: `2px dashed ${toolboxDropZoneActive ? COLORS.gold : COLORS.border}`,
            borderRadius: '12px',
            backgroundColor: toolboxDropZoneActive ? 'rgba(255,189,89,0.1)' : 'transparent',
            transition: 'all 0.2s ease',
          }}
        >
          {toolboxDropZoneActive ? (
            <span style={{ color: COLORS.gold }}>Thả component tại đây để thêm</span>
          ) : (
            <>
              <span>{placeholder}</span>
              <br />
              <span style={{ fontSize: '11px', opacity: 0.7 }}>Kéo component từ Toolbox bên trái vào đây</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`draggable-block-editor ${className}`}
      style={{
        padding: '16px',
        minHeight: '200px',
        overflow: 'visible',
      }}
    >
      {/* Instructions */}
      <div style={{
        marginBottom: '16px',
        padding: '10px 14px',
        backgroundColor: 'rgba(255, 189, 89, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: COLORS.gold,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: `1px solid rgba(255, 189, 89, 0.2)`,
        flexWrap: 'wrap',
      }}>
        <GripVertical size={16} />
        <span>Kéo <strong>⋮⋮</strong> để di chuyển.</span>
        <span style={{ color: COLORS.textSecondary }}>|</span>
        <Maximize2 size={14} />
        <span>Click block để resize.</span>
        <span style={{ color: COLORS.textSecondary }}>|</span>
        <Link2 size={14} />
        <span>Click link để sửa URL.</span>
      </div>

      {/* Blocks list */}
      <div className="blocks-list" style={{ overflow: 'visible' }}>
        {blocks.map((block, index) => {
          const isSelected = selectedIndex === index;
          const isDragging = draggingIndex === index;
          const isDragOver = dragOverIndex === index && draggingIndex !== index;
          const isHovered = hoveredIndex === index;
          const showTools = isSelected || isHovered;

          return (
            <div
              key={block.id}
              ref={(el) => blockRefs.current[index] = el}
              className={`draggable-block-item ${isSelected ? 'selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onDragOver={(e) => {
                handleDragOver(e, index);
                handleToolboxDragOver(e, index);
              }}
              onDragLeave={(e) => {
                handleDragLeave(e);
                setToolboxInsertIndex(null);
              }}
              onDrop={(e) => {
                handleDrop(e, index);
                handleToolboxDrop(e, index);
              }}
              onClick={() => handleSelect(index)}
              style={{
                position: 'relative',
                marginBottom: '8px',
                borderRadius: '8px',
                border: `1px solid ${isSelected ? COLORS.gold : isHovered ? COLORS.borderHover : COLORS.border}`,
                backgroundColor: isSelected ? COLORS.selected : isDragging ? COLORS.dragging : isHovered ? 'rgba(255,255,255,0.02)' : 'transparent',
                transition: 'all 0.15s ease',
                opacity: isDragging ? 0.5 : 1,
                // Allow block to grow and show all content
                display: 'block', // Changed from inline-block to block for proper height
                minWidth: '200px',
                maxWidth: '100%',
                overflow: 'visible', // Ensure toolbar and settings are never cut off
              }}
            >
              {/* Drop indicator - above (block reorder) */}
              {isDragOver && dragOverPosition === 'above' && (
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '40px',
                  right: '8px',
                  height: '3px',
                  backgroundColor: COLORS.gold,
                  borderRadius: '2px',
                  zIndex: 10,
                  boxShadow: `0 0 8px ${COLORS.gold}`,
                }} />
              )}

              {/* Drop indicator - below (block reorder) */}
              {isDragOver && dragOverPosition === 'below' && (
                <div style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '40px',
                  right: '8px',
                  height: '3px',
                  backgroundColor: COLORS.gold,
                  borderRadius: '2px',
                  zIndex: 10,
                  boxShadow: `0 0 8px ${COLORS.gold}`,
                }} />
              )}

              {/* Toolbox drop indicator - above */}
              {toolboxInsertIndex === index && draggingToolboxItem && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '0',
                  right: '0',
                  height: '4px',
                  backgroundColor: '#22c55e',
                  borderRadius: '2px',
                  zIndex: 20,
                  boxShadow: '0 0 12px #22c55e',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#22c55e',
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                  }}>
                    + {draggingToolboxItem.label}
                  </div>
                </div>
              )}

              {/* Block layout: drag handle + resizable content area */}
              <div style={{ display: 'flex', alignItems: 'flex-start', overflow: 'visible' }}>
                {/* Drag handle */}
                <div
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    width: '32px',
                    minHeight: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 4px',
                    cursor: 'grab',
                    color: showTools ? COLORS.gold : COLORS.textMuted,
                    backgroundColor: showTools ? 'rgba(255, 189, 89, 0.1)' : 'transparent',
                    borderRight: `1px solid ${COLORS.border}`,
                    borderRadius: '8px 0 0 8px',
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                  title="Kéo để di chuyển"
                >
                  <GripVertical size={16} />
                  <span style={{ fontSize: '9px', marginTop: '2px', opacity: 0.7 }}>{index + 1}</span>
                </div>

                {/* Resizable content area */}
                <div
                  className="block-content-wrapper"
                  style={{
                    position: 'relative',
                    padding: '10px 12px',
                    minHeight: '40px',
                    minWidth: '100px',
                    width: typeof block.width === 'number' ? `${block.width}px` : 'auto',
                    // Don't set fixed height - let content flow naturally
                    // Height resize only affects the visual indicator, not actual constraint
                    boxSizing: 'border-box',
                    overflow: 'visible', // Allow resize handles to show outside
                    backgroundColor: typeof block.width === 'number' ? 'rgba(106, 91, 255, 0.05)' : undefined,
                    border: typeof block.width === 'number' ? '2px dashed rgba(106, 91, 255, 0.5)' : undefined,
                  }}
                >
                  {/* Block type label */}
                  {showTools && (
                    <div style={{
                      position: 'absolute', top: '2px', right: '4px',
                      fontSize: '9px', fontWeight: '600', color: COLORS.gold,
                      backgroundColor: 'rgba(255, 189, 89, 0.15)',
                      padding: '1px 5px', borderRadius: '3px',
                      textTransform: 'uppercase', letterSpacing: '0.3px',
                    }}>
                      {getBlockLabel(block)}
                    </div>
                  )}

                  {/* Editable content */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="block-html-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(block.html) }}
                    onBlur={(e) => {
                      const newHtml = e.currentTarget.innerHTML;
                      if (newHtml !== block.html) {
                        handleContentChange(index, newHtml);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContentClick(e, index);
                    }}
                    onDrop={(e) => handleContentDrop(e, index)}
                    onDragOver={(e) => {
                      if (!e.dataTransfer.types.includes('application/x-block-drag')) {
                        e.preventDefault();
                      }
                    }}
                    style={{ outline: 'none', color: COLORS.textPrimary, cursor: 'text' }}
                  />

                  {/* RESIZE HANDLES - inside content wrapper */}
                  {isSelected && (
                    <>
                      {/* SE corner - MAIN RESIZE HANDLE - big and visible */}
                      <div
                        onMouseDown={(e) => {
                          console.log('[CLICK SE HANDLE]');
                          handleResizeStart(e, index, 'se');
                        }}
                        style={{
                          position: 'absolute', bottom: '-8px', right: '-8px',
                          width: '20px', height: '20px',
                          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                          border: '3px solid #fff',
                          borderRadius: '4px', cursor: 'nwse-resize',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)', zIndex: 100,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="Kéo để resize"
                      >
                        <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>↘</span>
                      </div>
                      {/* East edge - visible bar */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, index, 'e')}
                        style={{
                          position: 'absolute', right: '-4px', top: '10px', bottom: '25px',
                          width: '8px', cursor: 'ew-resize', zIndex: 90,
                          background: 'rgba(106, 91, 255, 0.5)',
                          borderRadius: '4px',
                        }}
                      />
                      {/* South edge - visible bar */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, index, 's')}
                        style={{
                          position: 'absolute', bottom: '-4px', left: '10px', right: '25px',
                          height: '8px', cursor: 'ns-resize', zIndex: 90,
                          background: 'rgba(106, 91, 255, 0.5)',
                          borderRadius: '4px',
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    padding: '4px',
                    opacity: showTools ? 1 : 0,
                    pointerEvents: showTools ? 'auto' : 'none',
                    transition: 'opacity 0.15s ease',
                    borderLeft: `1px solid ${COLORS.border}`,
                    backgroundColor: showTools ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    borderRadius: '0 8px 8px 0',
                  }}
                >
                  {/* Move up */}
                  {index > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                      style={{
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: COLORS.textSecondary,
                        transition: 'all 0.15s ease',
                      }}
                      title="Di chuyển lên (Ctrl+↑)"
                    >
                      <ChevronUp size={14} />
                    </button>
                  )}

                  {/* Move down */}
                  {index < blocks.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                      style={{
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: COLORS.textSecondary,
                        transition: 'all 0.15s ease',
                      }}
                      title="Di chuyển xuống (Ctrl+↓)"
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}

                  {/* Duplicate */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDuplicate(index); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'transparent',
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: COLORS.textSecondary,
                      transition: 'all 0.15s ease',
                    }}
                    title="Nhân bản (Ctrl+D)"
                  >
                    <Copy size={12} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(index); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${COLORS.error}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: COLORS.error,
                      transition: 'all 0.15s ease',
                    }}
                    title="Xóa (Delete)"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Resize toolbar - shown when selected */}
              {isSelected && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderTop: `1px solid ${COLORS.border}`,
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                }}>
                  {/* Alignment buttons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setBlockAlignment(block.id, 'left'); }}
                      style={{
                        width: '28px', height: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: blockAlignments[block.id] === 'left' ? 'rgba(106, 91, 255, 0.3)' : 'transparent',
                        border: `1px solid ${COLORS.border}`, borderRadius: '4px',
                        cursor: 'pointer', color: COLORS.textSecondary,
                      }}
                      title="Căn trái"
                    >
                      <AlignLeft size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setBlockAlignment(block.id, 'center'); }}
                      style={{
                        width: '28px', height: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: blockAlignments[block.id] === 'center' ? 'rgba(106, 91, 255, 0.3)' : 'transparent',
                        border: `1px solid ${COLORS.border}`, borderRadius: '4px',
                        cursor: 'pointer', color: COLORS.textSecondary,
                      }}
                      title="Căn giữa"
                    >
                      <AlignCenter size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setBlockAlignment(block.id, 'right'); }}
                      style={{
                        width: '28px', height: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: blockAlignments[block.id] === 'right' ? 'rgba(106, 91, 255, 0.3)' : 'transparent',
                        border: `1px solid ${COLORS.border}`, borderRadius: '4px',
                        cursor: 'pointer', color: COLORS.textSecondary,
                      }}
                      title="Căn phải"
                    >
                      <AlignRight size={14} />
                    </button>
                  </div>

                  <div style={{ width: '1px', height: '20px', background: COLORS.border }} />

                  {/* Lock aspect ratio */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAspectLock(block.id); }}
                    style={{
                      width: '28px', height: '28px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: aspectLocked[block.id] ? 'rgba(106, 91, 255, 0.3)' : 'transparent',
                      border: `1px solid ${COLORS.border}`, borderRadius: '4px',
                      cursor: 'pointer', color: aspectLocked[block.id] ? '#a78bfa' : COLORS.textSecondary,
                    }}
                    title={aspectLocked[block.id] ? 'Mở khóa tỷ lệ' : 'Khóa tỷ lệ'}
                  >
                    {aspectLocked[block.id] ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>

                  {/* Settings */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBlockSettings(block.id); }}
                    style={{
                      width: '28px', height: '28px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: showBlockSettings[block.id] ? 'rgba(106, 91, 255, 0.3)' : 'transparent',
                      border: `1px solid ${COLORS.border}`, borderRadius: '4px',
                      cursor: 'pointer', color: COLORS.textSecondary,
                    }}
                    title="Cài đặt kích thước"
                  >
                    <Settings size={14} />
                  </button>

                  {/* Dimension display */}
                  <div style={{
                    fontSize: '11px', color: COLORS.textMuted,
                    fontFamily: 'monospace', padding: '4px 8px',
                    background: 'rgba(0,0,0,0.3)', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <span>{block.width !== 'auto' ? `${block.width}` : 'auto'}×{block.height !== 'auto' ? `${block.height}` : 'auto'}</span>
                    {block.width !== 'auto' && (
                      <span style={{ color: COLORS.gold, fontSize: '10px' }}>
                        ({Math.round((block.width / 430) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Settings panel */}
              {isSelected && showBlockSettings[block.id] && (
                <div style={{
                  padding: '12px',
                  borderTop: `1px solid ${COLORS.border}`,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}>
                  {/* MOBILE WIDTH - for mobile preview (iPhone) */}
                  <div style={{
                    marginBottom: '12px',
                    padding: '10px',
                    background: 'rgba(0, 217, 255, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 217, 255, 0.3)'
                  }}>
                    <label style={{ fontSize: '11px', color: '#00D9FF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                      📱 Mobile Width (iPhone Preview):
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {[
                        { label: '25%', value: 25 },
                        { label: '33%', value: 33 },
                        { label: '50%', value: 50 },
                        { label: '66%', value: 66 },
                        { label: '75%', value: 75 },
                        { label: '100%', value: 100 },
                      ].map(preset => (
                        <button
                          key={`mobile-${preset.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newBlocks = [...blocks];
                            newBlocks[index] = { ...block, mobileWidth: preset.value };
                            setBlocks(newBlocks);
                            updateHtml(newBlocks);
                          }}
                          style={{
                            padding: '4px 10px',
                            background: block.mobileWidth === preset.value ? 'rgba(0, 217, 255, 0.3)' : 'rgba(255,255,255,0.1)',
                            border: `1px solid ${block.mobileWidth === preset.value ? '#00D9FF' : COLORS.border}`,
                            borderRadius: '4px',
                            color: block.mobileWidth === preset.value ? '#00D9FF' : COLORS.textSecondary,
                            fontSize: '11px', cursor: 'pointer',
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    {/* Mobile width slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="range"
                        min="25"
                        max="100"
                        value={block.mobileWidth || 100}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const newBlocks = [...blocks];
                          newBlocks[index] = { ...block, mobileWidth: val };
                          setBlocks(newBlocks);
                          updateHtml(newBlocks);
                        }}
                        style={{ flex: 1, accentColor: '#00D9FF' }}
                      />
                      <span style={{ fontSize: '12px', color: '#00D9FF', minWidth: '40px', fontWeight: '600' }}>
                        {block.mobileWidth || 100}%
                      </span>
                    </div>
                  </div>

                  {/* WEB WIDTH - for web editor display */}
                  <div style={{
                    marginBottom: '12px',
                    padding: '10px',
                    background: 'rgba(255, 189, 89, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 189, 89, 0.3)'
                  }}>
                    <label style={{ fontSize: '11px', color: COLORS.gold, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                      🖥️ Web Width (Editor Display):
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { label: '25%', value: Math.round(430 * 0.25) },
                        { label: '33%', value: Math.round(430 * 0.33) },
                        { label: '50%', value: Math.round(430 * 0.5) },
                        { label: '66%', value: Math.round(430 * 0.66) },
                        { label: '75%', value: Math.round(430 * 0.75) },
                        { label: '100%', value: 430 },
                      ].map(preset => (
                        <button
                          key={`web-${preset.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newBlocks = [...blocks];
                            // Only adjust height if aspect lock is explicitly enabled
                            let newHeight = block.height;
                            if (aspectLocked[block.id] && block.width !== 'auto' && block.height !== 'auto') {
                              const aspectRatio = block.width / block.height;
                              newHeight = Math.round(preset.value / aspectRatio);
                            }
                            newBlocks[index] = { ...block, width: preset.value, height: newHeight };
                            setBlocks(newBlocks);
                            updateHtml(newBlocks);
                          }}
                          style={{
                            padding: '4px 10px',
                            background: block.width === preset.value ? 'rgba(255, 189, 89, 0.3)' : 'rgba(255,255,255,0.1)',
                            border: `1px solid ${block.width === preset.value ? COLORS.gold : COLORS.border}`,
                            borderRadius: '4px',
                            color: block.width === preset.value ? COLORS.gold : COLORS.textSecondary,
                            fontSize: '11px', cursor: 'pointer',
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual input */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: COLORS.textMuted }}>W:</label>
                      <input
                        type="number"
                        value={block.width !== 'auto' ? block.width : ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : 'auto';
                          const newBlocks = [...blocks];
                          newBlocks[index] = { ...block, width: val };
                          setBlocks(newBlocks);
                          updateHtml(newBlocks);
                        }}
                        placeholder="auto"
                        style={{
                          width: '60px', padding: '4px 6px',
                          background: 'rgba(255,255,255,0.1)',
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: '4px', color: COLORS.textPrimary,
                          fontSize: '11px',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: COLORS.textMuted }}>H:</label>
                      <input
                        type="number"
                        value={block.height !== 'auto' ? block.height : ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value) : 'auto';
                          const newBlocks = [...blocks];
                          newBlocks[index] = { ...block, height: val };
                          setBlocks(newBlocks);
                          updateHtml(newBlocks);
                        }}
                        placeholder="auto"
                        style={{
                          width: '60px', padding: '4px 6px',
                          background: 'rgba(255,255,255,0.1)',
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: '4px', color: COLORS.textPrimary,
                          fontSize: '11px',
                        }}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newBlocks = [...blocks];
                        newBlocks[index] = { ...block, width: 'auto', height: 'auto' };
                        setBlocks(newBlocks);
                        updateHtml(newBlocks);
                      }}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(255,255,255,0.1)',
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px', color: COLORS.textSecondary,
                        fontSize: '11px', cursor: 'pointer',
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Dimension tooltip while resizing */}
              {resizingIndex === index && (
                <div style={{
                  position: 'absolute', bottom: '-45px', left: '50%',
                  transform: 'translateX(-50%)',
                  background: snappedRatio ? 'rgba(16, 185, 129, 0.95)' : 'rgba(0,0,0,0.95)',
                  color: '#fff',
                  padding: '6px 12px', borderRadius: '8px',
                  fontSize: '11px', fontFamily: 'monospace',
                  whiteSpace: 'nowrap', zIndex: 150, pointerEvents: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  border: snappedRatio ? '2px solid #10B981' : 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}>
                  <span style={{ fontWeight: '600' }}>
                    {block.width}×{block.height !== 'auto' ? block.height : 'auto'}px
                  </span>
                  {block.width !== 'auto' && (
                    <span style={{ fontSize: '10px', color: snappedRatio ? '#fff' : '#FFBD59' }}>
                      {Math.round((block.width / 430) * 100)}% màn hình
                      {snappedRatio && ' ✓'}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Drop zone at the end for adding new components */}
        <div
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('application/x-toolbox-item')) {
              e.preventDefault();
              setToolboxInsertIndex(blocks.length);
              setToolboxDropZoneActive(true);
            }
          }}
          onDragLeave={() => {
            setToolboxInsertIndex(null);
            setToolboxDropZoneActive(false);
          }}
          onDrop={(e) => handleToolboxDrop(e, blocks.length)}
          style={{
            padding: '20px',
            margin: '8px 0',
            border: `2px dashed ${toolboxInsertIndex === blocks.length && draggingToolboxItem ? '#22c55e' : COLORS.border}`,
            borderRadius: '8px',
            backgroundColor: toolboxInsertIndex === blocks.length && draggingToolboxItem ? 'rgba(34,197,94,0.1)' : 'transparent',
            textAlign: 'center',
            color: toolboxInsertIndex === blocks.length && draggingToolboxItem ? '#22c55e' : COLORS.textMuted,
            fontSize: '12px',
            transition: 'all 0.2s ease',
          }}
        >
          {toolboxInsertIndex === blocks.length && draggingToolboxItem ? (
            <span>+ Thả {draggingToolboxItem.label} tại đây</span>
          ) : (
            <span>Kéo component vào đây để thêm cuối</span>
          )}
        </div>
      </div>

      {/* Link Editor Modal */}
      {editingLink && (
        <LinkEditorModal
          linkElement={editingLink}
          position={linkEditorPosition}
          onSave={handleLinkSave}
          onClose={() => {
            setEditingLink(null);
            setEditingBlockIndex(null);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FLOATING TOOLBOX SIDEBAR - Export as separate component
// ═══════════════════════════════════════════════════════════

export function ToolboxSidebar({ onAddComponent, collapsed = false, onToggle }) {
  const [categories, setCategories] = useState(
    TOOLBOX_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: !cat.collapsed }), {})
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState('text');

  const toggleCategory = (id) => {
    setCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-toolbox-item', JSON.stringify(item));
    e.dataTransfer.setData('text/plain', item.label);
  };

  const handleItemClick = (item) => {
    if (onAddComponent) {
      onAddComponent(item);
    }
  };

  // Apply text color to selection
  const applyTextColor = (color) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      alert('Vui lòng chọn (highlight) đoạn text cần đổi màu');
      return;
    }
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.color = color;
    span.textContent = range.toString();
    range.deleteContents();
    range.insertNode(span);
    setShowColorPicker(false);
  };

  // Apply highlight
  const applyHighlight = (color) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      alert('Vui lòng chọn (highlight) đoạn text cần highlight');
      return;
    }
    const range = selection.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.style.backgroundColor = color;
    mark.style.color = 'inherit';
    mark.style.padding = '0 2px';
    mark.style.borderRadius = '2px';
    mark.textContent = range.toString();
    range.deleteContents();
    range.insertNode(mark);
    setShowColorPicker(false);
  };

  if (collapsed) {
    return (
      <div
        className="toolbox-sidebar collapsed"
        onClick={onToggle}
        style={{
          position: 'sticky',
          top: '80px',
          width: '40px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: '0 12px 12px 0',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          borderLeft: 'none',
          zIndex: 100,
        }}
        title="Mở Toolbox"
      >
        <Plus size={20} style={{ color: '#FFBD59' }} />
        <span style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          color: '#FFBD59',
          fontSize: '11px',
          fontWeight: '600',
        }}>Toolbox</span>
      </div>
    );
  }

  return (
    <div
      className="toolbox-sidebar"
      style={{
        position: 'sticky',
        top: '80px',
        width: '260px',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        backgroundColor: 'rgba(0,0,0,0.9)',
        borderRadius: '0 12px 12px 0',
        border: '1px solid rgba(255,255,255,0.15)',
        borderLeft: 'none',
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          backgroundColor: 'rgba(255,189,89,0.15)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} style={{ color: '#FFBD59' }} />
          <span style={{ color: '#FFBD59', fontWeight: '600', fontSize: '13px' }}>Toolbox</span>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
          }}
        >
          <X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>
      </div>

      <div style={{ padding: '12px' }}>
        {/* Color Picker */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', width: '100%', marginBottom: '4px' }}>
            🎨 Chọn text → đổi màu:
          </span>
          <button
            onClick={() => { setColorPickerType('text'); setShowColorPicker(!showColorPicker || colorPickerType !== 'text'); }}
            style={{
              padding: '5px 10px',
              background: showColorPicker && colorPickerType === 'text' ? 'rgba(255,189,89,0.3)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${showColorPicker && colorPickerType === 'text' ? '#FFBD59' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '5px',
              color: '#fff',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Type size={12} /> Màu chữ
          </button>
          <button
            onClick={() => { setColorPickerType('highlight'); setShowColorPicker(!showColorPicker || colorPickerType !== 'highlight'); }}
            style={{
              padding: '5px 10px',
              background: showColorPicker && colorPickerType === 'highlight' ? 'rgba(255,189,89,0.3)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${showColorPicker && colorPickerType === 'highlight' ? '#FFBD59' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '5px',
              color: '#fff',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Award size={12} /> Highlight
          </button>

          {showColorPicker && (
            <div style={{
              width: '100%',
              marginTop: '6px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
            }}>
              {(colorPickerType === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS).map((color) => (
                <button
                  key={color.value}
                  onClick={() => colorPickerType === 'text' ? applyTextColor(color.value) : applyHighlight(color.value)}
                  title={color.name}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    backgroundColor: colorPickerType === 'text' ? '#1a1a1a' : color.value,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {colorPickerType === 'text' && (
                    <span style={{ color: color.value, fontWeight: 'bold', fontSize: '12px' }}>A</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        {TOOLBOX_CATEGORIES.map((category) => (
          <div key={category.id} style={{ marginBottom: '8px' }}>
            <div
              onClick={() => toggleCategory(category.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '6px',
                marginBottom: categories[category.id] ? '6px' : '0',
              }}
            >
              {categories[category.id] ? <ChevronDownIcon size={12} /> : <ChevronRight size={12} />}
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: '600' }}>{category.label}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px' }}>({category.items.length})</span>
            </div>

            {categories[category.id] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '4px' }}>
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => handleItemClick(item)}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                    }}
                    title={item.description + ' - Kéo hoặc click để thêm'}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,189,89,0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255,189,89,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  >
                    <item.icon size={14} style={{ color: '#FFBD59', flexShrink: 0 }} />
                    <span style={{ color: '#fff', fontSize: '11px', fontWeight: '500' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Hint */}
        <div style={{
          marginTop: '10px',
          padding: '8px',
          backgroundColor: 'rgba(156,6,18,0.1)',
          borderRadius: '6px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          lineHeight: '1.4',
        }}>
          💡 Kéo thả vào editor hoặc click để thêm cuối
        </div>
      </div>
    </div>
  );
}

// Export constants for external use
export { TOOLBOX_CATEGORIES, TEXT_COLORS, HIGHLIGHT_COLORS };
