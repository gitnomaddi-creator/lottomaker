import { useState, useEffect, useCallback, useRef } from 'react';
import { LotteryGame } from '../types/lottery';
import { generateUniqueNumbers, getBallColorClass } from '../utils/numberGenerator';
import './QuickGenerator.css';

interface QuickGeneratorProps {
  game: LotteryGame;
  onNumberUpdate: (numbers: number[], bonusNumbers?: number[]) => void;
  onReset: () => void;
  gameCount?: number;
  onMultiGenerate?: (games: { mainNumbers: number[] }[]) => void;
}

const QuickGenerator = ({ game, onNumberUpdate, onReset: _onReset, gameCount = 1, onMultiGenerate }: QuickGeneratorProps) => {
  void _onReset;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [displayGames, setDisplayGames] = useState<number[][]>([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const allGamesRef = useRef<number[][]>([]);

  useEffect(() => {
    setIsComplete(false);
    setDisplayGames([]);
    setCurrentGameIndex(0);
    allGamesRef.current = [];
  }, [game, gameCount]);

  const handleGenerate = useCallback(() => {
    if (isGenerating || isComplete) return;

    setIsGenerating(true);
    setDisplayGames([]);
    setCurrentGameIndex(0);

    // 모든 게임 번호 미리 생성
    const games: number[][] = [];
    for (let i = 0; i < gameCount; i++) {
      const numbers = generateUniqueNumbers(
        game.mainNumbers.min,
        game.mainNumbers.max,
        game.mainNumbers.count
      ).sort((a, b) => a - b);
      games.push(numbers);
    }
    allGamesRef.current = games;

    // 번호를 하나씩 팡팡팡 표시
    const totalBalls = gameCount * game.mainNumbers.count;
    let ballCount = 0;

    const showNextBall = () => {
      if (ballCount >= totalBalls) {
        // 모든 번호 표시 완료
        setTimeout(() => {
          setIsGenerating(false);
          setIsComplete(true);
          // 모달에 전달
          if (onMultiGenerate) {
            onMultiGenerate(games.map(nums => ({ mainNumbers: nums })));
          }
        }, 500);
        return;
      }

      const gameIdx = Math.floor(ballCount / game.mainNumbers.count);
      const ballIdx = ballCount % game.mainNumbers.count;

      setCurrentGameIndex(gameIdx);

      setDisplayGames(prev => {
        const newGames = [...prev];
        if (!newGames[gameIdx]) {
          newGames[gameIdx] = [];
        }
        newGames[gameIdx] = [...(newGames[gameIdx] || []), allGamesRef.current[gameIdx][ballIdx]];

        // 추첨 결과에 모든 번호 전달 (flatten)
        const allNumbers = newGames.flat();
        onNumberUpdate(allNumbers);

        return newGames;
      });

      ballCount++;
      setTimeout(showNextBall, 120); // 120ms 간격
    };

    setTimeout(showNextBall, 300);
  }, [isGenerating, isComplete, game, gameCount, onNumberUpdate, onMultiGenerate]);

  return (
    <div className="quick-generator">
      {/* 번호 표시 영역 */}
      {displayGames.length > 0 && (
        <div className="quick-results">
          {displayGames.map((numbers, gameIdx) => (
            <div key={gameIdx} className="quick-game-row">
              <span className="quick-row-label">{String.fromCharCode(65 + gameIdx)}</span>
              <div className="quick-balls">
                {numbers.map((num, idx) => (
                  <span
                    key={idx}
                    className={`quick-ball ${getBallColorClass(num)} ${
                      gameIdx === currentGameIndex && idx === numbers.length - 1 && isGenerating ? 'pop' : ''
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="quick-buttons">
        <button
          className="quick-button"
          onClick={handleGenerate}
          disabled={isGenerating || isComplete}
        >
          {isGenerating ? '생성 중...' : '번호 생성'}
        </button>
      </div>
    </div>
  );
};

export default QuickGenerator;
