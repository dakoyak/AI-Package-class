import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPen, FaEraser, FaTrash, FaCheck, FaTimes, FaUndo, FaRedo } from 'react-icons/fa';

interface DrawingBoardProps {
  onSave: (imageData: string) => void;
  onCancel: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
`;

const BoardContainer = styled.div`
  background: #ffffff;
  padding: 24px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  width: 90%;
  max-width: 800px;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const CanvasWrapper = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 16px;
  cursor: crosshair;
  background: white;
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
  touch-action: none; /* Prevent scrolling on touch devices */
  display: flex;
  justify_content: center;
  align-items: center;
  background-image: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
`;

const Toolbar = styled.div`
  display: flex;
  justify_content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 12px;
`;

const ToolGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: ${props => props.$active ? '#4dabf7' : 'white'};
  color: ${props => props.$active ? 'white' : '#495057'};
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid ${props => props.$active ? '#4dabf7' : '#dee2e6'};

  &:hover {
    background: ${props => props.$active ? '#339af0' : '#f1f3f5'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: ${props => props.$primary ? 'linear-gradient(135deg, #4dabf7, #339af0)' : '#e9ecef'};
  color: ${props => props.$primary ? 'white' : '#495057'};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: ${props => props.$primary ? '0 4px 12px rgba(51, 154, 240, 0.3)' : 'none'};

  &:hover {
    filter: brightness(1.05);
    transform: translateY(-2px);
    box-shadow: ${props => props.$primary ? '0 6px 16px rgba(51, 154, 240, 0.4)' : '0 2px 4px rgba(0,0,0,0.05)'};
  }
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 6px;
  padding: 0 8px;
  border-left: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
`;

const ColorSwatch = styled.button<{ $color: string; $selected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  border: 2px solid ${props => props.$selected ? '#495057' : 'transparent'};
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  &:hover {
    transform: scale(1.1);
  }
`;

const SizeSlider = styled.input`
  width: 100px;
  cursor: pointer;
`;

const PRESET_COLORS = [
  '#000000', '#FF0000', '#FF8C00', '#FFD700',
  '#008000', '#0000FF', '#4B0082', '#800080', '#FFFFFF'
];

const DrawingBoard: React.FC<DrawingBoardProps> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas size to a fixed reasonable size or responsive
      canvas.width = 800;
      canvas.height = 600;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        setCtx(context);

        // Save initial blank state
        const initialData = context.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialData]);
        setHistoryStep(0);
      }
    }
  }, []);

  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = tool === 'pen' ? color : 'white';
      ctx.lineWidth = brushSize;
    }
  }, [tool, color, brushSize, ctx]);

  const saveHistory = () => {
    if (!ctx || !canvasRef.current) return;
    const newData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0 && ctx) {
      const prevData = history[historyStep - 1];
      ctx.putImageData(prevData, 0, 0);
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1 && ctx) {
      const nextData = history[historyStep + 1];
      ctx.putImageData(nextData, 0, 0);
      setHistoryStep(historyStep + 1);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
    saveHistory();
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL('image/png');
      onSave(imageData);
    }
  };

  return (
    <Overlay>
      <BoardContainer>
        <Toolbar>
          <ToolGroup>
            <ToolButton
              $active={tool === 'pen'}
              onClick={() => setTool('pen')}
              title="펜"
            >
              <FaPen />
            </ToolButton>
            <ToolButton
              $active={tool === 'eraser'}
              onClick={() => setTool('eraser')}
              title="지우개"
            >
              <FaEraser />
            </ToolButton>
          </ToolGroup>

          <ColorPicker>
            {PRESET_COLORS.map(c => (
              <ColorSwatch
                key={c}
                $color={c}
                $selected={color === c && tool === 'pen'}
                onClick={() => {
                  setColor(c);
                  setTool('pen');
                }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setTool('pen');
              }}
              style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }}
            />
          </ColorPicker>

          <ToolGroup>
            <span style={{ fontSize: '0.8rem', color: '#868e96' }}>크기</span>
            <SizeSlider
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </ToolGroup>

          <ToolGroup>
            <ToolButton onClick={undo} disabled={historyStep <= 0} title="실행 취소">
              <FaUndo />
            </ToolButton>
            <ToolButton onClick={redo} disabled={historyStep >= history.length - 1} title="다시 실행">
              <FaRedo />
            </ToolButton>
            <ToolButton onClick={clearCanvas} title="모두 지우기">
              <FaTrash />
            </ToolButton>
          </ToolGroup>

          <ToolGroup style={{ marginLeft: 'auto' }}>
            <ActionButton onClick={onCancel}>
              <FaTimes /> 취소
            </ActionButton>
            <ActionButton $primary onClick={handleSave}>
              <FaCheck /> 완료
            </ActionButton>
          </ToolGroup>
        </Toolbar>

        <CanvasWrapper>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ maxWidth: '100%', maxHeight: '60vh' }}
          />
        </CanvasWrapper>
      </BoardContainer>
    </Overlay>
  );
};

export default DrawingBoard;
