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
      await requestSparringScenario(
        { classicStory, twist, focus },
        (streamedText) => {
          setOutput(streamedText);
          // 스트리밍 시작되면 로딩 상태 해제 (비디오 숨기고 텍스트 보여주기 위함)
          // 하지만 여기서는 비디오 오버레이가 'loading' 상태에 의존하므로,
          // 첫 데이터가 들어오면 loading을 false로 바꿔야 오버레이가 사라지고 텍스트가 보임.
          // 다만 비디오를 조금 더 보여주고 싶다면 로직 조정 필요.
          // 여기서는 즉각적인 반응을 위해 첫 청크 수신 시 loading을 false로 변경하는 로직을 추가할 수도 있으나,
          // React state update batching 등을 고려하여, 
          // loading 상태는 '생성 중'이 아니라 '생성 시작 전 대기' 의미로 쓰고,
          // 생성 중일 때는 output이 있으므로 화면에 텍스트가 보이게 처리하는 것이 좋음.

          // 간단하게: 첫 텍스트가 들어오면 loading을 false로 설정.
          setLoading(false);
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '생성 중 오류가 발생했습니다.';
      setError(message);
      setLoading(false); // 에러 시에도 로딩 해제
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
