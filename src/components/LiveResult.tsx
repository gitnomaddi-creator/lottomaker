import { getBallColor } from '../utils/numberGenerator';
import './LiveResult.css';

interface LiveResultProps {
  numbers: number[];
  bonusNumbers?: number[];
  totalRequired: number;
  numbersPerGame: number;
  gameCount: number;
  isComplete: boolean;
  onReset?: () => void;
}

const LiveResult = ({ numbers, bonusNumbers, totalRequired, numbersPerGame, gameCount, isComplete, onReset }: LiveResultProps) => {
  const displayBonusNumbers = isComplete && bonusNumbers
    ? [...bonusNumbers].sort((a, b) => a - b)
    : bonusNumbers;

  // 게임별로 번호 그룹화
  const getGameRows = () => {
    const rows: number[][] = [];
    for (let i = 0; i < gameCount; i++) {
      const start = i * numbersPerGame;
      const end = start + numbersPerGame;
      const gameNumbers = numbers.slice(start, end);
      // 완료된 게임은 정렬
      if (gameNumbers.length === numbersPerGame && isComplete) {
        rows.push([...gameNumbers].sort((a, b) => a - b));
      } else {
        rows.push(gameNumbers);
      }
    }
    return rows;
  };

  const gameRows = getGameRows();
  const gameLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="live-result" style={{ margin: '0 auto' }}>
      <div className="live-result-header">
        <h2>추첨 결과</h2>
        <div className="progress-indicator">
          {numbers.length} / {totalRequired}
        </div>
      </div>

      <div className="live-result-content">
        <div className="result-section-live">
          <h3>당첨 번호</h3>
          <div className="live-game-rows">
            {gameRows.map((row, gameIndex) => (
              <div key={gameIndex} className="live-game-row">
                <div className="live-row-label">{gameLabels[gameIndex]}</div>
                <div className="live-numbers-grid">
                  {row.map((num, index) => (
                    <div
                      key={`${gameIndex}-${num}-${index}`}
                      className="live-ball"
                      style={{ backgroundColor: getBallColor(num) }}
                    >
                      {num}
                    </div>
                  ))}
                  {/* Empty slots for this game */}
                  {row.length < numbersPerGame && Array.from({ length: numbersPerGame - row.length }).map((_, index) => (
                    <div key={`empty-${gameIndex}-${index}`} className="live-ball empty">
                      ?
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {displayBonusNumbers && displayBonusNumbers.length > 0 && (
          <div className="result-section-live">
            <h3>보너스 번호</h3>
            <div className="live-numbers-grid">
              {displayBonusNumbers.map((num, index) => (
                <div
                  key={`bonus-${num}-${index}`}
                  className="live-ball bonus"
                  style={{ backgroundColor: getBallColor(num) }}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        {isComplete && (
          <div className="completion-message">
            <div className="complete-icon">✨</div>
            <p>추첨 완료!</p>
            {onReset && (
              <button className="reset-button-live" onClick={onReset}>
                다시하기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveResult;
