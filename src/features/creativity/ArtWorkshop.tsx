import type { ChangeEvent } from 'react';
import { useState } from 'react';
import GlassButton from '../../shared/GlassButton';
import { requestArtStyleRender, type ArtStyleResult } from '../../services/geminiTasks';
import styles from './ArtWorkshop.module.css';

type ArtStylePreset = {
  label: string;
  value: string;
  prompt: string;
};

const stylePresets: ArtStylePreset[] = [
  {
    label: '고흐',
    value: 'van-gogh',
    prompt:
      'Vincent van Gogh inspired oil painting with swirling brush strokes and intense complementary colors',
  },
  {
    label: '모네',
    value: 'monet',
    prompt: 'Claude Monet style impressionist painting with soft light, pastel palette, and loose brushwork',
  },
  {
    label: '픽셀 아트',
    value: 'pixel-art',
    prompt:
      'Retro pixel art rendered at 64x64 grid with bold outlines and flat colors, reminiscent of classic 8-bit games',
  },
];

const resolveResultPreview = (payload: ArtStyleResult | null): string => {
  if (!payload) {
    return '';
  }
  return payload.dataUrl || payload.fileUri || payload.imageUrl || payload.resultUrl || '';
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
  const [description, setDescription] = useState('비 오는 날 창밖 풍경을 그린 친구의 작품');
  const [error, setError] = useState('');

  const selectedPreset = stylePresets.find((preset) => preset.value === selectedStyle);
  const resultPreviewSrc = resolveResultPreview(resultImage);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setResultImage(null);
    setError('');

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
    if (!description.trim()) {
      setError('학생 그림 설명을 입력해주세요.');
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
        description: description.trim(),
      });
      setResultImage(rendered);
      setStatus('done');
    } catch (error) {
      const message = error instanceof Error ? error.message : '스타일 변환에 실패했습니다.';
      setError(message);
      setStatus('idle');
    }
  };

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <p className={styles.label}>AI 아트 워크숍</p>
        <h3 className={styles.title}>나의 그림을 명작 스타일로 변환</h3>
        <p className={styles.desc}>그림을 업로드하면 선택한 작가 스타일로 변환해 드립니다.</p>
        <p className={styles.notice}>Gemini 이미지 모델로 변환하고 있습니다.</p>
      </header>

      <div className={styles.controls}>
        <label className={styles.field}>
          <span>이미지 업로드</span>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        <label className={styles.field}>
          <span>스타일 선택</span>
          <div className={styles.styleChoices}>
            {stylePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`${styles.styleButton} ${preset.value === selectedStyle ? styles.active : ''}`}
                onClick={() => setSelectedStyle(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </label>

        <label className={styles.field}>
          <span>학생 그림 설명</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="예: 빗속에서 우산을 쓴 친구와 창밖 나무를 그린 작품"
          />
          <small className={styles.helper}>
            업로드한 그림을 간단히 설명하면 Gemini가 구도를 이해하고 스타일 변환 이미지를 생성합니다.
          </small>
        </label>
      </div>

      <GlassButton onClick={handleStyleTransfer} disabled={status === 'running'}>
        {status === 'running' ? 'Gemini 스타일 적용 중...' : '스타일 변환 실행'}
      </GlassButton>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.previewArea}>
        {previewUrl && <img src={previewUrl} alt="업로드 미리보기" />}
        {status === 'running' && (
          <div className={styles.overlay}>
            <div className={styles.overlayBox}>
              <p className={styles.overlayText}>내 그림을 {selectedPreset?.label} 스타일로 다시 그리는 중...</p>
            </div>
          </div>
        )}
      </div>

      {status === 'done' && resultPreviewSrc && (
        <div className={styles.result}>
          <p className={styles.resultText}>
            {selectedPreset?.label} 스타일로 재해석된 결과물을 확인해 보세요
          </p>
          <div className={styles.resultPreview}>
            <img src={resultPreviewSrc} alt={`${selectedPreset?.label} 스타일 결과물`} />
          </div>
          {resultImage?.message && <small className={styles.helper}>{resultImage.message}</small>}
          <p className={styles.resultNote}>Gemini가 학생 그림의 구도를 살려 화풍만 덧입혔습니다.</p>
        </div>
      )}
    </section>
  );
}

export default ArtWorkshop;
