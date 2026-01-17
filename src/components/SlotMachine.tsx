import { useState, useEffect, useRef, useCallback } from 'react';
import { LotteryGame, GeneratedNumbers } from '../types/lottery';
import { generateUniqueNumbers } from '../utils/numberGenerator';
import './SlotMachine.css';

interface SlotMachineProps {
  game: LotteryGame;
  onNumberUpdate: (numbers: number[], bonusNumbers?: number[]) => void;
  onReset: () => void;
  gameCount?: number;
  onAllGamesComplete?: (games: GeneratedNumbers[]) => void;
}

const SlotMachine = ({ game, onNumberUpdate, onReset: _onReset, gameCount = 1, onAllGamesComplete }: SlotMachineProps) => {
  const [reelNumbers, setReelNumbers] = useState<number[]>([]);
  const [stoppedReels, setStoppedReels] = useState<boolean[]>([]);
  const [isStopping, setIsStopping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const spinIntervalRef = useRef<number | null>(null);
  const allGamesRef = useRef<number[][]>([]);
  const currentNumbersRef = useRef<number[]>([]);
  const stoppedReelsRef = useRef<boolean[]>([]);
  void _onReset;

  const mainRequired = game.mainNumbers.count;
  const { min, max } = game.mainNumbers;

  // 초기화 및 자동 스핀 시작
  useEffect(() => {
    setIsComplete(false);
    setStoppedReels(new Array(mainRequired).fill(false));
    stoppedReelsRef.current = new Array(mainRequired).fill(false);
    setIsStopping(false);
    allGamesRef.current = [];
    currentNumbersRef.current = [];

    // 초기 릴 숫자 설정
    const initialNumbers = Array.from({ length: mainRequired }, () =>
      Math.floor(Math.random() * (max - min + 1)) + min
    );
    setReelNumbers(initialNumbers);

    // 자동 스핀 시작 - 멈추지 않은 릴만 업데이트
    spinIntervalRef.current = window.setInterval(() => {
      setReelNumbers(prev => prev.map((num, idx) =>
        stoppedReelsRef.current[idx] ? num : Math.floor(Math.random() * (max - min + 1)) + min
      ));
    }, 80);

    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, [game, gameCount, mainRequired, min, max]);

  const handleStop = useCallback(() => {
    if (isStopping || isComplete) return;

    setIsStopping(true);

    // 모든 게임의 번호를 미리 생성
    const games: number[][] = [];
    for (let i = 0; i < gameCount; i++) {
      const numbers = generateUniqueNumbers(min, max, mainRequired).sort((a, b) => a - b);
      games.push(numbers);
    }
    allGamesRef.current = games;
    currentNumbersRef.current = [];

    // 번호를 하나씩 멈추기
    const totalBalls = gameCount * mainRequired;
    let ballIndex = 0;

    const stopNextReel = () => {
      if (ballIndex >= totalBalls) {
        // 모든 번호 멈춤 완료
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
          spinIntervalRef.current = null;
        }
        setIsComplete(true);
        setIsStopping(false);

        if (onAllGamesComplete) {
          onAllGamesComplete(games.map(nums => ({ mainNumbers: nums })));
        }
        return;
      }

      const gameIdx = Math.floor(ballIndex / mainRequired);
      const reelIdx = ballIndex % mainRequired;
      const num = allGamesRef.current[gameIdx][reelIdx];

      // 해당 릴 멈추기
      stoppedReelsRef.current[reelIdx] = true;
      setStoppedReels(prev => {
        const newStopped = [...prev];
        newStopped[reelIdx] = true;
        return newStopped;
      });
      setReelNumbers(prev => {
        const newNums = [...prev];
        newNums[reelIdx] = num;
        return newNums;
      });

      // 추첨 결과에 번호 추가
      currentNumbersRef.current = [...currentNumbersRef.current, num];
      onNumberUpdate([...currentNumbersRef.current]);

      ballIndex++;

      // 한 게임(6개) 완료 시 릴 다시 스핀 시작 (다음 게임 위해)
      if (ballIndex % mainRequired === 0 && ballIndex < totalBalls) {
        setTimeout(() => {
          // 다음 게임을 위해 모든 릴 리셋
          stoppedReelsRef.current = new Array(mainRequired).fill(false);
          setStoppedReels(new Array(mainRequired).fill(false));
          setTimeout(stopNextReel, 400);
        }, 500);
      } else {
        setTimeout(stopNextReel, 300);
      }
    };

    // 첫 번째 멈춤 시작
    setTimeout(stopNextReel, 200);
  }, [isStopping, isComplete, gameCount, mainRequired, min, max, onNumberUpdate, onAllGamesComplete]);

  return (
    <div className="slot-machine">
      <div className="slot-machine-frame">
        <div className="slot-machine-top-light"></div>
        <div className="slot-machine-side-panel left"></div>
        <div className="slot-machine-side-panel right"></div>

        <div className="slot-container-glass">
          <div className="slot-header-glass">LOTTO</div>

          <div className="slot-reels-glass">
            {reelNumbers.map((num, reelIndex) => {
              const isStopped = stoppedReels[reelIndex];
              return (
                <div key={reelIndex} className={`slot-reel-glass ${isStopped ? 'stopped' : ''}`}>
                  <div className="reel-numbers">
                    <div className={`reel-number ${!isStopped && !isComplete ? 'flickering' : ''} ${isStopped || isComplete ? 'stopped-number' : ''}`}>
                      {num}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!isComplete && (
            <button
              className="spin-button-glass stop-button"
              onClick={handleStop}
              disabled={isStopping}
            >
              {isStopping ? '...' : 'STOP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
