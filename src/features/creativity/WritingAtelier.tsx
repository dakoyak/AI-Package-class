import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import GlassButton from '../../shared/GlassButton';
import { requestWritingGuide } from '../../services/geminiTasks';
import loadingVideo from '../../assets/lo.mp4';
import styles from './WritingAtelier.module.css';

const gradeOptions = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'] as const;
const genreOptions = ['동화', '에세이', '신문 기사', '극본'] as const;

function WritingAtelier() {
  const [grade, setGrade] = useState<(typeof gradeOptions)[number]>(gradeOptions[0]);
  const [theme, setTheme] = useState('토끼와 거북이를 현대 도시 배경으로 다시 쓰기');
  const [genre, setGenre] = useState<(typeof genreOptions)[number]>(genreOptions[0]);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setError('');
    setOutput(''); // Clear previous output
    try {
      await requestWritingGuide(
        { grade, theme, genre },
        (streamedText) => {
          setOutput(streamedText);
          setLoading(false); // 첫 데이터 수신 시 로딩 해제하여 텍스트 표시
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '글쓰기 가이드를 가져오지 못했습니다.';
      setError(message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOutput('');
    setError('');
  };

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h3 className={styles.title}>AI 글쓰기 듀오</h3>
        <p className={styles.desc}>학년/장르를 지정하면 AI가 글쓰기 활동지 초안을 제안합니다.</p>
      </header>

      {/* Loading Overlay */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <video
            src={loadingVideo}
            autoPlay
            loop
            muted
            playsInline
            className={styles.loadingVideo}
          />
          <p className={styles.loadingText}>AI가 글쓰기 가이드를 작성하고 있습니다...</p>
        </div>
      )}

      {/* Result View */}
      {!loading && output && (
        <div className={styles.resultContainer}>
          <article className={styles.output}>
            <ReactMarkdown>{output}</ReactMarkdown>
          </article>
          <div className={styles.actionWrapper} style={{ marginTop: '2rem' }}>
            <GlassButton onClick={handleReset}>
              다시 작성하기
            </GlassButton>
          </div>
        </div>
      )}

      {/* Input Form */}
      {!loading && !output && (
        <>
          <div className={styles.form}>
            <label className={styles.field}>
              <span>학년</span>
              <select value={grade} onChange={(event) => setGrade(event.target.value as (typeof gradeOptions)[number])}>
                {gradeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>장르</span>
              <select
                value={genre}
                onChange={(event) => setGenre(event.target.value as (typeof genreOptions)[number])}
              >
                {genreOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>글쓰기 주제</span>
              <textarea value={theme} onChange={(event) => setTheme(event.target.value)} />
            </label>
          </div>

          <div className={styles.actionWrapper}>
            <GlassButton onClick={handleRun} disabled={loading}>
              글쓰기 안내 생성
            </GlassButton>
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
}

export default WritingAtelier;
