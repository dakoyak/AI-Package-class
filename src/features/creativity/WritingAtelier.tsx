import { useState } from 'react';
import GlassButton from '../../shared/GlassButton';
import { requestWritingGuide } from '../../services/geminiTasks';
import styles from './WritingAtelier.module.css';

const gradeOptions = ['3학년', '4학년', '5학년', '6학년'] as const;
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
    try {
      const text = await requestWritingGuide({ grade, theme, genre });
      setOutput(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : '글쓰기 가이드를 가져오지 못했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <p className={styles.label}>AI 글쓰기 듀오</p>
        <h3 className={styles.title}>지도안 템플릿 생성</h3>
        <p className={styles.desc}>학년/장르를 지정하면 Gemini가 글쓰기 활동지 초안을 제안합니다.</p>
      </header>

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

      <GlassButton onClick={handleRun} disabled={loading}>
        {loading ? '생성 중...' : '글쓰기 안내 생성'}
      </GlassButton>

      {error && <p className={styles.error}>{error}</p>}

      {output && (
        <article className={styles.output}>
          <pre>{output}</pre>
        </article>
      )}
    </section>
  );
}

export default WritingAtelier;
