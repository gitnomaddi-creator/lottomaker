import { useState, useEffect, useRef, useCallback } from 'react';
import { LotteryGame, GeneratedNumbers } from '../types/lottery';
import { generateUniqueNumbers, getBallColor } from '../utils/numberGenerator';
import './LotteryMachine.css';

interface LotteryMachineProps {
  game: LotteryGame;
  onNumberUpdate: (numbers: number[], bonusNumbers?: number[]) => void;
  onReset: () => void;
  gameCount?: number;
  onAllGamesComplete?: (games: GeneratedNumbers[]) => void;
}

const LotteryMachine = ({ game, onNumberUpdate, onReset: _onReset, gameCount = 1, onAllGamesComplete }: LotteryMachineProps) => {
  const [floatingBalls, setFloatingBalls] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractingBall, setExtractingBall] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const allGamesRef = useRef<number[][]>([]);
  const currentNumbersRef = useRef<number[]>([]);
  void _onReset;

  const mainRequired = game.mainNumbers.count;

  // Initialize floating balls
  useEffect(() => {
    const mainRange = game.mainNumbers.max - game.mainNumbers.min + 1;
    const mainCount = Math.min(12, mainRange);
    const mainBalls = generateUniqueNumbers(game.mainNumbers.min, game.mainNumbers.max, mainCount);
    setFloatingBalls(mainBalls);
    setIsComplete(false);
    allGamesRef.current = [];
    currentNumbersRef.current = [];
  }, [game, gameCount]);

  const handleGenerate = useCallback(() => {
    if (isGenerating || isComplete) return;

    setIsGenerating(true);
    allGamesRef.current = [];
    currentNumbersRef.current = [];

    // 모든 게임의 번호를 미리 생성
    const games: number[][] = [];
    for (let i = 0; i < gameCount; i++) {
      const numbers = generateUniqueNumbers(
        game.mainNumbers.min,
        game.mainNumbers.max,
        mainRequired
      ).sort((a, b) => a - b);
      games.push(numbers);
    }
    allGamesRef.current = games;

    // 번호를 하나씩 추출 애니메이션
    const totalBalls = gameCount * mainRequired;
    let ballIndex = 0;

    const extractNextBall = () => {
      if (ballIndex >= totalBalls) {
        // 모든 번호 추출 완료
        setIsGenerating(false);
        setIsComplete(true);
        setExtractingBall(null);

        if (onAllGamesComplete) {
          onAllGamesComplete(games.map(nums => ({ mainNumbers: nums })));
        }
        return;
      }

      const gameIdx = Math.floor(ballIndex / mainRequired);
      const numIdx = ballIndex % mainRequired;
      const num = allGamesRef.current[gameIdx][numIdx];

      setExtractingBall(num);

      // 공이 나오는 애니메이션 후 다음 공
      setTimeout(() => {
        // 추첨 결과에 번호 추가
        currentNumbersRef.current = [...currentNumbersRef.current, num];
        onNumberUpdate([...currentNumbersRef.current]);

        setExtractingBall(null);
        ballIndex++;
        setTimeout(extractNextBall, 200);
      }, 1000);
    };

    setTimeout(extractNextBall, 300);
  }, [isGenerating, isComplete, game, gameCount, mainRequired, onNumberUpdate, onAllGamesComplete]);

  return (
    <div className="lottery-machine">
      <div className="machine-body-glass">
        <div className="machine-dome-glass">
          <div className="sphere-wrapper">
            <div className="sphere-container">
              <div className="sphere-shell"></div>
              <div className="floating-balls">
              {floatingBalls.map((num, index) => {
                const isExtracting = extractingBall === num;

                return (
                  <div
                    key={`${num}-${index}`}
                    className={`floating-ball ${isExtracting ? 'extracting' : ''}`}
                    style={{
                      backgroundColor: getBallColor(num),
                      left: '50%',
                      top: '50%',
                      marginLeft: '-22.5px',
                      marginTop: '-22.5px',
                    }}
                  >
                    {num}
                  </div>
                );
              })}
              </div>
            </div>

            {/* Extracted ball animation */}
            {extractingBall !== null && (
              <div
                className="extracting-ball-container"
                style={{ backgroundColor: getBallColor(extractingBall) }}
              >
                <div className="extracting-ball">
                  {extractingBall}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="machine-base-glass">
          <button
            className="generate-button-glass"
            onClick={handleGenerate}
            disabled={isGenerating || isComplete}
          >
            {isGenerating ? '추출 중...' : '번호 뽑기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LotteryMachine;
