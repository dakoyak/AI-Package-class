import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import GlassButton from '../../shared/GlassButton';
import { requestSparringScenario } from '../../services/geminiTasks';
import loadingVideo from '../../assets/lo.mp4';
import styles from './SparringLab.module.css';

function SparringLab() {
  const [classicStory, setClassicStory] = useState('토끼와 거북이');
  const [twist, setTwist] = useState('거북이가 이긴 것은 불공평하다');
  const [focus, setFocus] = useState('불공정 상황을 토론으로 다시 쓰기');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setError('');
    setOutput(''); // Clear previous output
    try {
      const text = await requestSparringScenario({ classicStory, twist, focus });
      setOutput(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.';
      setError(message);
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
        <p className={styles.label}>상상 스파링</p>
        <h3 className={styles.title}>AI 스파링 파트너</h3>
        <p className={styles.desc}>AI가 엉뚱한 반론을 던져 이야기 재구성을 돕습니다.</p>
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
          <p className={styles.loadingText}>AI가 엉뚱한 상상을 하고 있습니다...</p>
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
              다시 스파링하기
            </GlassButton>
          </div>
        </div>
      )}

      {/* Input Form */}
      {!loading && !output && (
        <>
          <div className={styles.form}>
            <label className={styles.field}>
              <span>기준 동화</span>
              <input value={classicStory} onChange={(event) => setClassicStory(event.target.value)} />
            </label>

            <label className={styles.field}>
              <span>엉뚱한 반론</span>
              <input value={twist} onChange={(event) => setTwist(event.target.value)} />
            </label>

            <label className={styles.field}>
              <span>수업 초점</span>
              <input value={focus} onChange={(event) => setFocus(event.target.value)} />
            </label>
          </div>

          <div className={styles.actionWrapper}>
            <GlassButton onClick={handleRun} disabled={loading}>
              창의력 스파링 실행
            </GlassButton>
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
}

export default SparringLab;
