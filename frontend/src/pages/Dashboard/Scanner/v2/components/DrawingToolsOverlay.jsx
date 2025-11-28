import React, { useRef, useEffect, useState } from 'react';
import './DrawingToolsOverlay.css';

/**
 * Drawing Tools Overlay Component
 * Canvas-based drawing layer for TradingView Lightweight Charts
 *
 * Supported Tools:
 * - Horizontal Line
 * - Trend Line
 * - Fibonacci Retracement
 */
export const DrawingToolsOverlay = ({
  chartRef,
  candlestickSeriesRef,
  activeTool,
  onToolComplete,
  clearAllDrawings,
  currentColor = '#FFBD59',
  currentLineWidth = 2
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);

  // Convert canvas coordinates to price/time
  const canvasToPriceTime = (x, y) => {
    if (!chartRef || !candlestickSeriesRef) return null;

    try {
      // Get chart dimensions
      const chartElement = chartRef.chartElement();
      if (!chartElement) return null;

      const rect = chartElement.getBoundingClientRect();

      // Use coordinate converter from Lightweight Charts
      const timeScale = chartRef.timeScale();
      const priceScale = candlestickSeriesRef.priceScale();

      // Convert x to time
      const time = timeScale.coordinateToTime(x);

      // Convert y to price
      const price = priceScale.coordinateToPrice(y);

      return { time, price };
    } catch (error) {
      console.error('[DrawingTools] Coordinate conversion error:', error);
      return null;
    }
  };

  // Convert price/time to canvas coordinates
  const priceTimeToCanvas = (time, price) => {
    if (!chartRef || !candlestickSeriesRef) return null;

    try {
      const timeScale = chartRef.timeScale();
      const priceScale = candlestickSeriesRef.priceScale();

      const x = timeScale.timeToCoordinate(time);
      const y = priceScale.priceToCoordinate(price);

      return { x, y };
    } catch (error) {
      console.error('[DrawingTools] Coordinate conversion error:', error);
      return null;
    }
  };

  // Check if a click is near a drawing (hit detection)
  const isNearDrawing = (clickX, clickY, drawing) => {
    const { type, startPoint, currentPoint } = drawing;
    const tolerance = 10; // pixels

    switch (type) {
      case 'horizontal-line':
        // Check if click is near the horizontal line
        return Math.abs(clickY - startPoint.y) < tolerance;

      case 'trend-line':
        // Check if click is near the trend line
        if (!currentPoint) return false;

        // Calculate distance from point to line segment
        const dx = currentPoint.x - startPoint.x;
        const dy = currentPoint.y - startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return false;

        const t = Math.max(0, Math.min(1, ((clickX - startPoint.x) * dx + (clickY - startPoint.y) * dy) / (length * length)));
        const nearestX = startPoint.x + t * dx;
        const nearestY = startPoint.y + t * dy;
        const distance = Math.sqrt((clickX - nearestX) ** 2 + (clickY - nearestY) ** 2);

        return distance < tolerance;

      case 'fibonacci':
        // Check if click is near any fibonacci level
        if (!currentPoint) return false;
        const minY = Math.min(startPoint.y, currentPoint.y);
        const maxY = Math.max(startPoint.y, currentPoint.y);
        return clickY >= minY - tolerance && clickY <= maxY + tolerance;

      default:
        return false;
    }
  };

  // Draw all saved drawings and current drawing
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved drawings
    drawings.forEach((drawing, index) => {
      const isSelected = selectedDrawing === index;
      drawShape(ctx, drawing, isSelected);
    });

    // Draw current drawing (if in progress)
    if (isDrawing && startPoint && currentPoint) {
      drawShape(ctx, {
        type: activeTool,
        startPoint,
        currentPoint,
        color: currentColor,
        lineWidth: currentLineWidth,
      }, false);
    }
  };

  // Draw a shape based on type
  const drawShape = (ctx, drawing, isSelected = false) => {
    const { type, startPoint, currentPoint, color, lineWidth } = drawing;

    // Highlight selected drawing with cyan glow
    if (isSelected) {
      ctx.strokeStyle = '#00D9FF';
      ctx.lineWidth = (lineWidth || 2) + 2;
      ctx.shadowColor = '#00D9FF';
      ctx.shadowBlur = 10;
    } else {
      ctx.strokeStyle = color || '#FFBD59';
      ctx.lineWidth = lineWidth || 2;
      ctx.shadowBlur = 0;
    }
    ctx.setLineDash([]);

    switch (type) {
      case 'horizontal-line':
        drawHorizontalLine(ctx, startPoint, currentPoint);
        break;
      case 'trend-line':
        drawTrendLine(ctx, startPoint, currentPoint);
        break;
      case 'fibonacci':
        drawFibonacci(ctx, startPoint, currentPoint);
        break;
      default:
        break;
    }
  };

  // Draw horizontal line
  const drawHorizontalLine = (ctx, start, current) => {
    const canvas = canvasRef.current;
    const y = current ? current.y : start.y;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    // Draw price label
    if (start.price) {
      ctx.fillStyle = '#FFBD59';
      ctx.fillRect(canvas.width - 80, y - 12, 75, 24);
      ctx.fillStyle = '#000';
      ctx.font = '12px monospace';
      ctx.fillText(`$${start.price.toFixed(2)}`, canvas.width - 75, y + 4);
    }
  };

  // Draw trend line
  const drawTrendLine = (ctx, start, current) => {
    if (!current) return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    // Draw handles
    ctx.fillStyle = '#FFBD59';
    ctx.fillRect(start.x - 4, start.y - 4, 8, 8);
    ctx.fillRect(current.x - 4, current.y - 4, 8, 8);
  };

  // Draw Fibonacci retracement
  const drawFibonacci = (ctx, start, current) => {
    if (!current) return;

    const fibLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const colors = [
      'rgba(255, 189, 89, 0.3)',
      'rgba(0, 255, 136, 0.3)',
      'rgba(0, 217, 255, 0.3)',
      'rgba(255, 255, 255, 0.3)',
      'rgba(0, 217, 255, 0.3)',
      'rgba(0, 255, 136, 0.3)',
      'rgba(255, 189, 89, 0.3)',
    ];

    const canvas = canvasRef.current;
    const minY = Math.min(start.y, current.y);
    const maxY = Math.max(start.y, current.y);
    const range = maxY - minY;

    // Draw levels
    fibLevels.forEach((level, index) => {
      const y = start.y > current.y
        ? start.y - (range * level)
        : start.y + (range * level);

      // Draw line
      ctx.strokeStyle = colors[index];
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();

      // Draw label
      ctx.fillStyle = colors[index];
      ctx.fillRect(canvas.width - 80, y - 10, 75, 20);
      ctx.fillStyle = '#000';
      ctx.font = '11px monospace';
      ctx.fillText(`${(level * 100).toFixed(1)}%`, canvas.width - 75, y + 4);
    });

    ctx.setLineDash([]);
  };

  // Handle mouse down
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If no tool is active, check for drawing selection
    if (!activeTool || activeTool === 'none') {
      // Check if clicking on an existing drawing (reverse order to select topmost)
      for (let i = drawings.length - 1; i >= 0; i--) {
        if (isNearDrawing(x, y, drawings[i])) {
          setSelectedDrawing(i);
          return;
        }
      }
      // Click on empty space deselects
      setSelectedDrawing(null);
      return;
    }

    // Drawing a new shape
    const priceTime = canvasToPriceTime(x, y);
    setStartPoint({ x, y, ...priceTime });
    setCurrentPoint({ x, y, ...priceTime });
    setIsDrawing(true);
    setSelectedDrawing(null); // Deselect when drawing new
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const priceTime = canvasToPriceTime(x, y);

    setCurrentPoint({ x, y, ...priceTime });
  };

  // Handle mouse up
  const handleMouseUp = (e) => {
    if (!isDrawing) return;

    // Save drawing with current color and line width
    const newDrawing = {
      id: Date.now(),
      type: activeTool,
      startPoint,
      currentPoint,
      color: currentColor,
      lineWidth: currentLineWidth,
    };

    setDrawings([...drawings, newDrawing]);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);

    // Notify parent
    if (onToolComplete) {
      onToolComplete(newDrawing);
    }
  };

  // Clear all drawings
  const clearDrawings = () => {
    setDrawings([]);
    setSelectedDrawing(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Delete selected drawing
  const deleteSelectedDrawing = () => {
    if (selectedDrawing !== null) {
      setDrawings(drawings.filter((_, index) => index !== selectedDrawing));
      setSelectedDrawing(null);
    }
  };

  // Listen for clearAllDrawings trigger
  useEffect(() => {
    if (clearAllDrawings) {
      clearDrawings();
    }
  }, [clearAllDrawings]);

  // Redraw when state changes
  useEffect(() => {
    redrawCanvas();
  }, [isDrawing, startPoint, currentPoint, drawings, activeTool, selectedDrawing]);

  // Keyboard shortcuts (Delete key to remove selected drawing)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDrawing !== null) {
          deleteSelectedDrawing();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDrawing, drawings]);

  // Resize canvas to match chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !chartRef) return;

    const resizeCanvas = () => {
      try {
        const chartElement = chartRef.chartElement();
        if (!chartElement) return;

        const rect = chartElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawCanvas();
      } catch (error) {
        console.error('[DrawingTools] Resize error:', error);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [chartRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`drawing-tools-overlay ${activeTool !== 'none' ? 'active' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        // Only intercept events when a tool is active, otherwise let chart handle dragging
        pointerEvents: activeTool !== 'none' ? 'auto' : 'none',
        cursor: activeTool !== 'none' ? 'crosshair' : 'default',
        zIndex: 10,
      }}
    />
  );
};

export default DrawingToolsOverlay;
