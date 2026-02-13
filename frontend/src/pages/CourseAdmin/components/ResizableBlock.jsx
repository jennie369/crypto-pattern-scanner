/**
 * ResizableBlock - Draggable resizable block wrapper
 * Allows users to resize blocks, cards, images by dragging handles
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Move,
  Maximize2,
  Trash2,
  Copy,
  GripVertical,
  Settings,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import './ResizableBlock.css';

const ResizableBlock = ({
  children,
  blockId,
  blockType = 'generic', // generic, image, card, table, text
  initialWidth = 'auto',
  initialHeight = 'auto',
  minWidth = 100,
  minHeight = 50,
  maxWidth = '100%',
  maxHeight = 'none',
  onResize,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onSelect,
  isSelected = false,
  showControls = true,
  lockAspectRatio = false,
  alignment = 'left', // left, center, right
  onAlignmentChange,
}) => {
  const blockRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [aspectLocked, setAspectLocked] = useState(lockAspectRatio);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Handle resize start
  const handleResizeStart = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = blockRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartDimensions({ width: rect.width, height: rect.height });
    setAspectRatio(rect.width / rect.height);

    document.body.style.cursor = getCursorForDirection(direction);
    document.body.style.userSelect = 'none';
  }, []);

  // Handle resize move
  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !resizeDirection) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    let newWidth = startDimensions.width;
    let newHeight = startDimensions.height;

    // Calculate new dimensions based on direction
    switch (resizeDirection) {
      case 'e': // East (right)
        newWidth = startDimensions.width + deltaX;
        break;
      case 'w': // West (left)
        newWidth = startDimensions.width - deltaX;
        break;
      case 's': // South (bottom)
        newHeight = startDimensions.height + deltaY;
        break;
      case 'n': // North (top)
        newHeight = startDimensions.height - deltaY;
        break;
      case 'se': // Southeast
        newWidth = startDimensions.width + deltaX;
        newHeight = aspectLocked
          ? (startDimensions.width + deltaX) / aspectRatio
          : startDimensions.height + deltaY;
        break;
      case 'sw': // Southwest
        newWidth = startDimensions.width - deltaX;
        newHeight = aspectLocked
          ? (startDimensions.width - deltaX) / aspectRatio
          : startDimensions.height + deltaY;
        break;
      case 'ne': // Northeast
        newWidth = startDimensions.width + deltaX;
        newHeight = aspectLocked
          ? (startDimensions.width + deltaX) / aspectRatio
          : startDimensions.height - deltaY;
        break;
      case 'nw': // Northwest
        newWidth = startDimensions.width - deltaX;
        newHeight = aspectLocked
          ? (startDimensions.width - deltaX) / aspectRatio
          : startDimensions.height - deltaY;
        break;
      default:
        break;
    }

    // Apply constraints
    const minW = typeof minWidth === 'number' ? minWidth : 50;
    const minH = typeof minHeight === 'number' ? minHeight : 30;
    const maxW = typeof maxWidth === 'number' ? maxWidth : 9999;
    const maxH = typeof maxHeight === 'number' ? maxHeight : 9999;

    newWidth = Math.max(minW, Math.min(maxW, newWidth));
    newHeight = Math.max(minH, Math.min(maxH, newHeight));

    setDimensions({ width: newWidth, height: newHeight });
  }, [isResizing, resizeDirection, startPos, startDimensions, aspectLocked, aspectRatio, minWidth, minHeight, maxWidth, maxHeight]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    setResizeDirection(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Notify parent of resize
    if (onResize) {
      onResize(blockId, dimensions);
    }
  }, [isResizing, blockId, dimensions, onResize]);

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Get cursor style for resize direction
  const getCursorForDirection = (direction) => {
    const cursors = {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'nesw-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize',
      sw: 'nesw-resize',
    };
    return cursors[direction] || 'default';
  };

  // Handle click to select
  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(blockId);
  };

  // Get alignment style
  const getAlignmentStyle = () => {
    switch (alignment) {
      case 'center':
        return { marginLeft: 'auto', marginRight: 'auto' };
      case 'right':
        return { marginLeft: 'auto', marginRight: 0 };
      default:
        return { marginLeft: 0, marginRight: 'auto' };
    }
  };

  return (
    <div
      ref={blockRef}
      className={`resizable-block ${isSelected ? 'selected' : ''} ${isResizing ? 'resizing' : ''} block-type-${blockType}`}
      style={{
        width: typeof dimensions.width === 'number' ? `${dimensions.width}px` : dimensions.width,
        height: typeof dimensions.height === 'number' ? `${dimensions.height}px` : dimensions.height,
        ...getAlignmentStyle(),
      }}
      onClick={handleClick}
      data-block-id={blockId}
    >
      {/* Content */}
      <div className="resizable-block-content">
        {children}
      </div>

      {/* Controls - only show when selected */}
      {isSelected && showControls && (
        <>
          {/* Top toolbar */}
          <div className="block-toolbar top">
            <button
              className="toolbar-btn drag-handle"
              title="Kéo để di chuyển"
            >
              <GripVertical size={14} />
            </button>

            <div className="toolbar-separator" />

            <button
              className={`toolbar-btn ${alignment === 'left' ? 'active' : ''}`}
              onClick={() => onAlignmentChange?.(blockId, 'left')}
              title="Căn trái"
            >
              <AlignLeft size={14} />
            </button>
            <button
              className={`toolbar-btn ${alignment === 'center' ? 'active' : ''}`}
              onClick={() => onAlignmentChange?.(blockId, 'center')}
              title="Căn giữa"
            >
              <AlignCenter size={14} />
            </button>
            <button
              className={`toolbar-btn ${alignment === 'right' ? 'active' : ''}`}
              onClick={() => onAlignmentChange?.(blockId, 'right')}
              title="Căn phải"
            >
              <AlignRight size={14} />
            </button>

            <div className="toolbar-separator" />

            <button
              className={`toolbar-btn ${aspectLocked ? 'active' : ''}`}
              onClick={() => setAspectLocked(!aspectLocked)}
              title={aspectLocked ? 'Mở khóa tỷ lệ' : 'Khóa tỷ lệ'}
            >
              {aspectLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>

            <button
              className="toolbar-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Cài đặt"
            >
              <Settings size={14} />
            </button>

            <div className="toolbar-separator" />

            {onMoveUp && (
              <button className="toolbar-btn" onClick={() => onMoveUp(blockId)} title="Di chuyển lên">
                <ChevronUp size={14} />
              </button>
            )}
            {onMoveDown && (
              <button className="toolbar-btn" onClick={() => onMoveDown(blockId)} title="Di chuyển xuống">
                <ChevronDown size={14} />
              </button>
            )}

            {onDuplicate && (
              <button className="toolbar-btn" onClick={() => onDuplicate(blockId)} title="Nhân bản">
                <Copy size={14} />
              </button>
            )}

            {onDelete && (
              <button className="toolbar-btn delete-btn" onClick={() => onDelete(blockId)} title="Xóa">
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="block-settings-panel">
              <div className="settings-row">
                <label>Chiều rộng:</label>
                <input
                  type="number"
                  value={typeof dimensions.width === 'number' ? dimensions.width : ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 'auto';
                    setDimensions(prev => ({ ...prev, width: val }));
                    onResize?.(blockId, { ...dimensions, width: val });
                  }}
                  placeholder="auto"
                />
                <span>px</span>
              </div>
              <div className="settings-row">
                <label>Chiều cao:</label>
                <input
                  type="number"
                  value={typeof dimensions.height === 'number' ? dimensions.height : ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 'auto';
                    setDimensions(prev => ({ ...prev, height: val }));
                    onResize?.(blockId, { ...dimensions, height: val });
                  }}
                  placeholder="auto"
                />
                <span>px</span>
              </div>
              <div className="settings-row">
                <button
                  className="reset-btn"
                  onClick={() => {
                    setDimensions({ width: 'auto', height: 'auto' });
                    onResize?.(blockId, { width: 'auto', height: 'auto' });
                  }}
                >
                  Reset kích thước
                </button>
              </div>
            </div>
          )}

          {/* Resize handles */}
          <div className="resize-handles">
            {/* Corner handles */}
            <div
              className="resize-handle corner nw"
              onMouseDown={(e) => handleResizeStart(e, 'nw')}
            />
            <div
              className="resize-handle corner ne"
              onMouseDown={(e) => handleResizeStart(e, 'ne')}
            />
            <div
              className="resize-handle corner sw"
              onMouseDown={(e) => handleResizeStart(e, 'sw')}
            />
            <div
              className="resize-handle corner se"
              onMouseDown={(e) => handleResizeStart(e, 'se')}
            />

            {/* Edge handles */}
            <div
              className="resize-handle edge n"
              onMouseDown={(e) => handleResizeStart(e, 'n')}
            />
            <div
              className="resize-handle edge s"
              onMouseDown={(e) => handleResizeStart(e, 's')}
            />
            <div
              className="resize-handle edge e"
              onMouseDown={(e) => handleResizeStart(e, 'e')}
            />
            <div
              className="resize-handle edge w"
              onMouseDown={(e) => handleResizeStart(e, 'w')}
            />
          </div>

          {/* Dimension tooltip while resizing */}
          {isResizing && (
            <div className="resize-dimension-tooltip">
              {Math.round(dimensions.width)}×{Math.round(dimensions.height)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResizableBlock;
