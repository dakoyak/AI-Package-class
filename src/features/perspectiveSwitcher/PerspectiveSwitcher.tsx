import React, { useState } from 'react';
import styles from './PerspectiveSwitcher.module.css';

interface PerspectiveResponse {
  their_view: string;
  their_emotion: string;
  inner_message: string;
  better_expression: string;
}

const initialPortalText = '📖 동화책을 펼쳐 친구의 마음 이야기를 읽어봐요!';

export const PerspectiveSwitcher: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [myView, setMyView] = useState('');
  const [portalText, setPortalText] = useState(initialPortalText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PerspectiveResponse | null>(null);

  const handleAnalyze = async () => {
    const trimmedSituation = situation.trim();
    const trimmedMyView = myView.trim();

    if (!trimmedSituation || !trimmedMyView) {
      alert('상황 설명과 나의 생각을 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setPortalText('📖 동화책이 친구의 이야기를 들려주고 있어요...');
    setResult(null);

    try {
      const res = await fetch('http://localhost:5001/api/perspective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: trimmedSituation,
          my_view: trimmedMyView,
        }),
      });

      if (!res.ok) {
        throw new Error('서버 응답에 문제가 있습니다.');
      }

      const data = (await res.json()) as {
        ok: boolean;
        their_view?: string;
        their_emotion?: string;
        inner_message?: string;
        better_expression?: string;
        message?: string;
      };

      if (!data.ok) {
        throw new Error(data.message || '입장 바꾸어 생각하기 생성에 실패했습니다.');
      }

      const cleanResult: PerspectiveResponse = {
        their_view: data.their_view || '',
        their_emotion: data.their_emotion || '',
        inner_message: data.inner_message || '',
        better_expression: data.better_expression || '',
      };

      setResult(cleanResult);
      setPortalText('📖 동화책에서 친구의 마음 이야기를 찾았어요!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
      setPortalText('책장이 넘어가지 않았어요. 다시 시도해볼까요?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSituation('');
    setMyView('');
    setResult(null);
    setError(null);
    setPortalText(initialPortalText);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.layout}>
        {/* 왼쪽 - 나의 입장 */}
        <section className={styles.leftPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>나의 입장</h2>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="situation">
                어떤 상황이었나요?
              </label>
              <textarea
                id="situation"
                className={styles.textarea}
                placeholder="상황을 구체적으로 적어주세요..."
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="myView">
                그때 나는 어떤 마음이었나요?
              </label>
              <textarea
                id="myView"
                className={styles.textarea}
                placeholder="내 마음과 말, 행동을 솔직하게 적어주세요..."
                value={myView}
                onChange={(e) => setMyView(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? '책장을 넘기는 중...' : '📖 동화책 펼치기'}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleReset}
                disabled={loading}
              >
                다시 하기
              </button>
            </div>

            <div className={styles.tipBox}>
              <div className={styles.tipTitle}>생각 연습 팁</div>
              <ul className={styles.tipList}>
                <li>친구도 나와 비슷하게 기분이 상할 수 있어요</li>
                <li>친구가 좋아할 말과 서운해할 말을 나누어 생각해봐요</li>
                <li>다음에는 어떻게 말하면 좋을지 생각해봐요</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 중앙 - 포털 */}
        <section className={styles.centerPortal}>
          <div className={`${styles.portalContainer} ${loading ? styles.active : ''}`}>
            <div className={`${styles.portal} ${loading ? styles.active : ''}`}>
              <div className={styles.portalInner}>
                <div className={styles.bookContent}>
                  <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>✦</div>
                  친구의 마음을
                  <br />
                  이해하는 시간
                  <div style={{ fontSize: '14px', opacity: 0.6, marginTop: '8px' }}>✦</div>
                </div>
              </div>
            </div>
          </div>
          <p className={styles.portalText}>{portalText}</p>
        </section>

        {/* 오른쪽 - 친구의 입장 */}
        <section className={styles.rightPanel}>
          <div className={styles.resultCard}>
            <h2 className={styles.resultTitle}>친구의 입장</h2>

            {!result && !error && (
              <p className={styles.resultPlaceholder}>
                왼쪽에 상황을 입력하고 '동화책 펼치기' 버튼을 누르면,
                <br />
                동화책이 친구의 마음 이야기를 들려줄 거예요! 📖
              </p>
            )}

            {error && <p className={styles.errorText}>{error}</p>}

            {result && (
              <div className={styles.resultGrid}>
                <div className={styles.resultItem}>
                  <h4>친구가 본 상황</h4>
                  <p>{result.their_view}</p>
                </div>
                <div className={styles.resultItem}>
                  <h4>친구의 감정</h4>
                  <p>{result.their_emotion}</p>
                </div>
                <div className={styles.resultItem}>
                  <h4>친구가 속으로 하고 싶었을 말</h4>
                  <p>{result.inner_message}</p>
                </div>
                <div className={styles.resultItem}>
                  <h4>더 부드럽게 말하는 방법</h4>
                  <p>{result.better_expression}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
