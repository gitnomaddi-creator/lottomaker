import { useState, useEffect, useCallback, useRef } from 'react';
import { LotteryGame, GeneratedNumbers } from '../types/lottery';
import { generateUniqueNumbers, getBallColor } from '../utils/numberGenerator';
import './RouletteMachine.css';

interface RouletteMachineProps {
  game: LotteryGame;
  onNumberUpdate: (numbers: number[], bonusNumbers?: number[]) => void;
  onReset: () => void;
  gameCount?: number;
  onAllGamesComplete?: (games: GeneratedNumbers[]) => void;
}

const SEGMENT_COUNT = 10;

const RouletteMachine = ({ game, onNumberUpdate, onReset: _onReset, gameCount = 1, onAllGamesComplete }: RouletteMachineProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [poppingNumber, setPoppingNumber] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const allGamesRef = useRef<number[][]>([]);
  const currentNumbersRef = useRef<number[]>([]);
  const rotationRef = useRef(0);
  void _onReset;

  const mainRequired = game.mainNumbers.count;

  useEffect(() => {
    setIsComplete(false);
    setPoppingNumber(null);
    setRotation(0);
    rotationRef.current = 0;
    allGamesRef.current = [];
    currentNumbersRef.current = [];
  }, [game, gameCount]);

  const handleSpin = useCallback(() => {
    if (isSpinning || isComplete) return;

    setIsSpinning(true);
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

    // 번호를 하나씩 룰렛 애니메이션으로 표시
    const totalBalls = gameCount * mainRequired;
    let ballIndex = 0;

    const spinNextBall = () => {
      if (ballIndex >= totalBalls) {
        setIsSpinning(false);
        setIsComplete(true);
        setPoppingNumber(null);

        if (onAllGamesComplete) {
          onAllGamesComplete(games.map(nums => ({ mainNumbers: nums })));
        }
        return;
      }

      const gameIdx = Math.floor(ballIndex / mainRequired);
      const numIdx = ballIndex % mainRequired;
      const num = allGamesRef.current[gameIdx][numIdx];

      // 룰렛 회전
      const spins = 2 + Math.random();
      const newRotation = rotationRef.current + (spins * 360);
      rotationRef.current = newRotation;
      setRotation(newRotation);

      // 회전 후 번호 표시
      setTimeout(() => {
        setPoppingNumber(num);

        // 추첨 결과에 번호 추가
        currentNumbersRef.current = [...currentNumbersRef.current, num];
        onNumberUpdate([...currentNumbersRef.current]);

        setTimeout(() => {
          setPoppingNumber(null);
          ballIndex++;
          setTimeout(spinNextBall, 100);
        }, 400);
      }, 600);
    };

    setTimeout(spinNextBall, 300);
  }, [isSpinning, isComplete, game, gameCount, mainRequired, onNumberUpdate, onAllGamesComplete]);

  const segmentAngle = 360 / SEGMENT_COUNT;

  return (
    <div className="roulette-machine">
      <div className="roulette-container-glass">
        <div className="roulette-pointer">▼</div>
        <div
          className={`roulette-wheel-glass ${isSpinning ? 'spinning' : ''}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
          }}
        >
          {Array.from({ length: SEGMENT_COUNT }).map((_, index) => (
            <div
              key={`divider-${index}`}
              className="roulette-divider"
              style={{ transform: `rotate(${index * segmentAngle}deg)` }}
            />
          ))}

          {Array.from({ length: SEGMENT_COUNT }).map((_, index) => {
            const angle = index * segmentAngle + segmentAngle / 2;
            return (
              <div
                key={index}
                className="roulette-question"
                style={{ transform: `rotate(${angle}deg) translateY(-70px) rotate(${-angle}deg)` }}
              >
                ?
              </div>
            );
          })}

          <div className="roulette-center-glass">
            <span>{game.gameName}</span>
          </div>
        </div>

        {poppingNumber !== null && (
          <div className="popping-ball" style={{ backgroundColor: getBallColor(poppingNumber) }}>
            {poppingNumber}
          </div>
        )}

        <button
          className="spin-button-glass"
          onClick={handleSpin}
          disabled={isSpinning || isComplete}
        >
          {isSpinning ? '...' : '돌리기'}
        </button>
      </div>
    </div>
  );
};

export default RouletteMachine;
