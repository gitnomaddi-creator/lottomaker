import { useState, useEffect, useCallback, useRef } from 'react';
import { LotteryGame, GeneratedNumbers } from '../types/lottery';
import { generateUniqueNumbers, getBallColor } from '../utils/numberGenerator';
import './GachaMachine.css';

interface GachaMachineProps {
  game: LotteryGame;
  onNumberUpdate: (numbers: number[], bonusNumbers?: number[]) => void;
  onReset: () => void;
  gameCount?: number;
  onAllGamesComplete?: (games: GeneratedNumbers[]) => void;
}

const GachaMachine = ({ game, onNumberUpdate, onReset: _onReset, gameCount = 1, onAllGamesComplete }: GachaMachineProps) => {
  const [isDispensing, setIsDispensing] = useState(false);
  const [capsuleNumber, setCapsuleNumber] = useState<number | null>(null);
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [leverTurned, setLeverTurned] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const allGamesRef = useRef<number[][]>([]);
  const currentNumbersRef = useRef<number[]>([]);
  void _onReset;

  const mainRequired = game.mainNumbers.count;

  useEffect(() => {
    setIsComplete(false);
    setCapsuleNumber(null);
    setCapsuleOpen(false);
    allGamesRef.current = [];
    currentNumbersRef.current = [];
  }, [game, gameCount]);

  const handleDispense = useCallback(() => {
    if (isDispensing || isComplete) return;

    setIsDispensing(true);
    allGamesRef.current = [];
    currentNumbersRef.current = [];

    setLeverTurned(true);
    setTimeout(() => setLeverTurned(false), 500);

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

    // 캡슐을 하나씩 뽑아서 표시
    const totalBalls = gameCount * mainRequired;
    let ballIndex = 0;

    const dispenseNextCapsule = () => {
      if (ballIndex >= totalBalls) {
        setIsDispensing(false);
        setIsComplete(true);
        setCapsuleNumber(null);
        setCapsuleOpen(false);

        if (onAllGamesComplete) {
          onAllGamesComplete(games.map(nums => ({ mainNumbers: nums })));
        }
        return;
      }

      const gameIdx = Math.floor(ballIndex / mainRequired);
      const numIdx = ballIndex % mainRequired;
      const num = allGamesRef.current[gameIdx][numIdx];

      setCapsuleOpen(false);
      setCapsuleNumber(num);

      // 캡슐 열기
      setTimeout(() => {
        setCapsuleOpen(true);

        // 추첨 결과에 번호 추가
        currentNumbersRef.current = [...currentNumbersRef.current, num];
        onNumberUpdate([...currentNumbersRef.current]);

        setTimeout(() => {
          ballIndex++;
          setTimeout(dispenseNextCapsule, 100);
        }, 300);
      }, 400);
    };

    setTimeout(dispenseNextCapsule, 500);
  }, [isDispensing, isComplete, game, gameCount, mainRequired, onNumberUpdate, onAllGamesComplete]);

  return (
    <div className="gacha-machine">
      <div className="gacha-container">
        <div className="gacha-body">
          <div className="gacha-top">
            <div className="gacha-dome">
              <div className="capsules-inside">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="mini-capsule"
                    style={{
                      backgroundColor: `hsl(${i * 30}, 70%, 50%)`,
                      left: `${15 + (i % 4) * 20}%`,
                      top: `${20 + Math.floor(i / 4) * 25}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="gacha-middle">
            <div className={`gacha-lever ${leverTurned ? 'turned' : ''}`}>
              <div className="lever-handle" />
            </div>
          </div>

          <div className="gacha-bottom">
            <div className="dispenser-slot">
              {capsuleNumber !== null && (
                <div className={`dispensed-capsule ${capsuleOpen ? 'open' : ''}`}>
                  <div className="capsule-top" style={{ backgroundColor: getBallColor(capsuleNumber) }} />
                  <div className="capsule-bottom" />
                  {capsuleOpen && (
                    <div className="capsule-number" style={{ backgroundColor: getBallColor(capsuleNumber) }}>
                      {capsuleNumber}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          className="gacha-button"
          onClick={handleDispense}
          disabled={isDispensing || isComplete}
        >
          {isDispensing ? '...' : '뽑기'}
        </button>
      </div>
    </div>
  );
};

export default GachaMachine;
