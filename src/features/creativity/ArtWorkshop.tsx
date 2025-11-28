
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import GlassButton from '../../shared/GlassButton';
import { requestArtStyleRender, type ArtStyleResult } from '../../services/geminiTasks';
import loadingVideo from '../../assets/lo.mp4';
import './ArtWorkshop.css';

type ArtStylePreset = {
  label: string;
  value: string;
  prompt: string;
};

const stylePresets = [
  {
    value: 'vangogh',
    label: '고흐',
    prompt: 'Starry Night style by Vincent van Gogh, thick impasto brushstrokes, swirling patterns, vibrant blue and yellow colors, expressive texture, oil painting style',
  },
  {
    value: 'monet',
    label: '모네',
    prompt: 'Impressionist style by Claude Monet, soft light, dappled sunlight, loose brushstrokes, pastel colors, water lilies atmosphere, dreamy and atmospheric',
  },
  {
    value: 'pixel',
    label: '픽셀 아트',
    prompt: '16-bit pixel art style, retro game aesthetic, limited color palette, clean sharp edges, blocky details, nostalgic arcade look',
  },
  {
    value: 'watercolor',
    label: '수채화',
    prompt: 'Soft watercolor painting, wet-on-wet technique, gentle color bleeding, paper texture, artistic and fluid, dreamy atmosphere, light and airy',
  },
];

const resolveResultPreview = (payload: ArtStyleResult | null): string => {
  if (!payload) {
    return '';
  }
  return payload.dataUrl || '';
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const [, base64 = ''] = reader.result.split(',');
        resolve(base64);
      } else {
        reject(new Error('이미지 파일을 인식하지 못했습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('이미지를 읽는 중 오류가 발생했습니다.'));
    reader.readAsDataURL(file);
  });
};

type JobStatus = 'idle' | 'running' | 'done';

function ArtWorkshop() {
  const [selectedStyle, setSelectedStyle] = useState(stylePresets[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState<JobStatus>('idle');
  const [resultImage, setResultImage] = useState<ArtStyleResult | null>(null);
  const [error, setError] = useState('');

  const selectedPreset = stylePresets.find((preset) => preset.value === selectedStyle);
  const resultPreviewSrc = resolveResultPreview(resultImage);

  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setResultImage(null);
    setError('');
    setStatus('idle');

    if (nextFile) {
      setPreviewUrl(URL.createObjectURL(nextFile));
    } else {
      setPreviewUrl('');
    }
  };

  const handleStyleTransfer = async () => {
    if (!file) {
      setError('먼저 내 그림 파일을 업로드하세요.');
      return;
    }

    setStatus('running');
    setError('');
    setResultImage(null);

    try {
      const base64Image = await fileToBase64(file);
      const rendered = await requestArtStyleRender({
        imageBase64: base64Image,
        mimeType: file.type,
        styleLabel: selectedPreset?.label ?? '선택 스타일',
        stylePrompt: selectedPreset?.prompt ?? '',
      });
      setResultImage(rendered);
      setStatus('done');
    } catch (error) {
      const message = error instanceof Error ? error.message : '스타일 변환에 실패했습니다.';
      setError(message);
      setStatus('idle');
    }
  };

  const handleRegenerate = async () => {
    if (!file || !selectedStyle) return;

    setStatus('running');
    setError('');
    // Keep the previous result visible while regenerating if desired, or clear it. 
    // Let's keep it to avoid flickering too much, or clear it to show loading.
    // Clearing it feels more responsive to the "new action".
    setResultImage(null);

    try {
      const base64Image = await fileToBase64(file);

      const selectedPreset = stylePresets.find(p => p.value === selectedStyle);

      // Combine original style prompt with user's refinement
      const combinedPrompt = refinementPrompt
        ? `${selectedPreset?.prompt ?? ''}. Additional requirements: ${refinementPrompt}`
        : (selectedPreset?.prompt ?? '');

      const rendered = await requestArtStyleRender({
        imageBase64: base64Image,
        mimeType: file.type,
        styleLabel: selectedPreset?.label ?? '선택 스타일',
        stylePrompt: combinedPrompt,
      });
      setResultImage(rendered);
      setStatus('done');
    } catch (error) {
      const message = error instanceof Error ? error.message : '재생성에 실패했습니다.';
      setError(message);
      setStatus('done'); // Return to done state to show error and allow retry
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResultImage(null);
    setFile(null);
    setPreviewUrl('');
    setError('');
    setRefinementPrompt('');
  };

  // Render Result View
  if (status === 'done' && resultPreviewSrc) {
    return (
      <div className="aw-layout fade-in">
        <div className="aw-container-result">
          <h3 className="aw-title-center"> 변환 완료!</h3>
          <p className="aw-desc-center">
            {selectedPreset?.label} 스타일로 재탄생한 작품입니다.
          </p>

          <div className="aw-result-large">
            <img src={resultPreviewSrc} alt={`${selectedPreset?.label} 스타일 결과물`} />
          </div>

          {/* Refinement Section */}
          <div className="aw-refine-area">
            <input
              type="text"
              className="aw-refine-input"
              placeholder="추가 요청사항을 입력하세요 "
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegenerate()}
            />
            <button className="aw-regenerate-btn" onClick={handleRegenerate}>
              다시 그리기
            </button>
          </div>

          <div className="aw-actions">
            <button
              className="aw-download-btn large"
              onClick={() => {
                const link = document.createElement('a');
                link.href = resultPreviewSrc;
                link.download = `art-workshop-${selectedPreset?.value}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <span> 이미지 저장하기</span>
            </button>

            <button className="aw-reset-btn" onClick={handleReset}>
              🔄 다른 그림 그리기
            </button>
          </div>

          {resultImage?.message && <p className="aw-message-toast">{resultImage.message}</p>}
        </div>
      </div>
    );
  }

  // Render Input View
  return (
    <div className="aw-page-wrapper">
      {/* Header Row: Title & Execute Button */}
      <header className="aw-header-row">
        <div className="aw-header-info">
          <h3 className="aw-title">AI 아트 워크숍</h3>
          <p className="aw-desc">나의 그림을 명작 스타일로 변환해보세요.</p>
        </div>

        <GlassButton
          onClick={handleStyleTransfer}
          disabled={status === 'running' || !file}
          className="aw-execute-btn-top"
        >
          {status === 'running' ? '변환 중...' : ' 스타일 변환 실행'}
        </GlassButton>
      </header>

      {/* Workspace Row: Sidebar & Main Box */}
      <div className="aw-workspace">
        {/* Left Sidebar: Style Buttons */}
        <aside className="aw-sidebar">
          {stylePresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={`aw-style-card-side ${preset.value === selectedStyle ? 'selected' : ''}`}
              onClick={() => setSelectedStyle(preset.value)}
            >
              <span className="aw-style-name">{preset.label}</span>
            </button>
          ))}
        </aside>

        {/* Main Content Box */}
        <main className="aw-container">
          <div className="aw-upload-zone">
            {previewUrl ? (
              <div className="aw-preview-wrapper">
                <img src={previewUrl} alt="업로드 미리보기" />
                <button className="aw-remove-btn" onClick={() => { setFile(null); setPreviewUrl(''); }}>✕</button>
              </div>
            ) : (
              <label className="aw-upload-label">
                <span className="aw-upload-icon">🖼️</span>
                <span>이미지 업로드</span>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </main>
      </div>

      {error && <p className="aw-error-message">{error}</p>}

      {status === 'running' && (
        <div className="aw-loading-overlay">
          <video
            src={loadingVideo}
            autoPlay
            loop
            muted
            playsInline
            className="aw-loading-video"
          />
          <p className="aw-loading-text">AI가 작품을 변환하고 있습니다...</p>
        </div>
      )}
    </div>
  );
}

export default ArtWorkshop;
