import { useState, useEffect, useRef } from 'react';
import { LotteryGame, GeneratedNumbers } from '../types/lottery';
import { generateUniqueNumbers, getBallColor } from '../utils/numberGenerator';
import './ScratchCard.css';

interface ScratchCardProps {
  game: LotteryGame;
  onNumberUpdate: (numbers: number[], bonusNumbers?: number[]) => void;
  onReset: () => void;
  gameCount?: number;
  onAllGamesComplete?: (games: GeneratedNumbers[]) => void;
}

interface CardData {
  numbers: number[];
  isRevealed: boolean;
  scratchPercent: number;
}

const ScratchCard = ({ game, onNumberUpdate, onReset: _onReset, gameCount = 1, onAllGamesComplete }: ScratchCardProps) => {
  const [allCardsData, setAllCardsData] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isCanvasReadyRef = useRef(false);
  const allNumbersRef = useRef<number[]>([]);
  const revealedGamesRef = useRef<GeneratedNumbers[]>([]);
  void _onReset;

  const mainRequired = game.mainNumbers.count;
  const { min, max } = game.mainNumbers;
  const gameLabels = ['A', 'B', 'C', 'D', 'E'];

  // 캔버스 초기화 함수
  const initCanvas = () => {
    isCanvasReadyRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#c0c0c0');
        gradient.addColorStop(0.3, '#e8e8e8');
        gradient.addColorStop(0.5, '#d0d0d0');
        gradient.addColorStop(0.7, '#e0e0e0');
        gradient.addColorStop(1, '#b8b8b8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 15; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }

        isCanvasReadyRef.current = true;
      }
    }
  };

  // 카드 공개 함수
  const revealCurrentCard = () => {
    if (!currentCard || currentCard.isRevealed) return;

    setIsTransitioning(true);
    setIsScratching(false);

    const revealedCard = { ...currentCard, isRevealed: true };
    setCurrentCard(revealedCard);

    allNumbersRef.current = [...allNumbersRef.current, ...currentCard.numbers];
    onNumberUpdate([...allNumbersRef.current]);

    revealedGamesRef.current = [...revealedGamesRef.current, { mainNumbers: currentCard.numbers }];

    const nextIndex = currentCardIndex + 1;
    if (nextIndex < gameCount) {
      setTimeout(() => {
        setCurrentCardIndex(nextIndex);
        setCurrentCard(allCardsData[nextIndex]);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 200);
      }, 800);
    } else {
      setIsComplete(true);
      setIsTransitioning(false);
      if (onAllGamesComplete) {
        setTimeout(() => {
          onAllGamesComplete(revealedGamesRef.current);
        }, 500);
      }
    }
  };

  // 모든 카드 데이터 미리 생성
  useEffect(() => {
    const newCards: CardData[] = [];
    for (let i = 0; i < gameCount; i++) {
      const numbers = generateUniqueNumbers(min, max, mainRequired).sort((a, b) => a - b);
      newCards.push({
        numbers,
        isRevealed: false,
        scratchPercent: 0,
      });
    }
    setAllCardsData(newCards);
    setCurrentCardIndex(0);
    setCurrentCard(newCards[0] || null);
    setIsComplete(false);
    isCanvasReadyRef.current = false;
    allNumbersRef.current = [];
    revealedGamesRef.current = [];
  }, [game, gameCount, mainRequired, min, max]);

  // 현재 카드가 변경되면 캔버스 초기화
  useEffect(() => {
    if (currentCard && !currentCard.isRevealed) {
      // requestAnimationFrame으로 DOM 업데이트 후 캔버스 초기화
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initCanvas();
        });
      });
    }
  }, [currentCardIndex, currentCard?.isRevealed]);

  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!currentCard || currentCard.isRevealed || isComplete || isTransitioning) return;
    if (!isCanvasReadyRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScratching(true);

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparentPixels++;
    }
    const percent = (transparentPixels / (imageData.data.length / 4)) * 100;

    setCurrentCard(prev => prev ? { ...prev, scratchPercent: Math.round(percent) } : null);

    if (percent > 50 && !currentCard.isRevealed) {
      revealCurrentCard();
    }
  };

  const handleScratchEnd = () => {
    setIsScratching(false);
  };

  return (
    <div className="scratch-card-machine">
      {gameCount > 1 && (
        <div className="scratch-progress">
          <span className="progress-text">복권 {currentCardIndex + 1} / {gameCount}</span>
        </div>
      )}

      {currentCard && (
        <div className={`scratch-card-wrapper ${currentCard.isRevealed ? 'revealed' : ''}`}>
          <div className="scratch-card-label">{gameLabels[currentCardIndex]}</div>
          <div className="scratch-card">
            <div className="scratch-header">
              <span>🍀 LUCKY LOTTO 🍀</span>
            </div>

            <div className="scratch-area-wrapper">
              <div className="numbers-underneath">
                {currentCard.numbers.map((num, index) => (
                  <div
                    key={index}
                    className="number-ball"
                    style={{ backgroundColor: getBallColor(num) }}
                  >
                    {num}
                  </div>
                ))}
              </div>

              {!currentCard.isRevealed && (
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={100}
                  className="scratch-canvas-big"
                  onMouseMove={(e) => isScratching && handleScratch(e)}
                  onMouseDown={(e) => handleScratch(e)}
                  onMouseUp={handleScratchEnd}
                  onMouseLeave={handleScratchEnd}
                  onTouchMove={(e) => handleScratch(e)}
                  onTouchStart={(e) => handleScratch(e)}
                  onTouchEnd={handleScratchEnd}
                />
              )}
            </div>

            <div className="scratch-footer">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(currentCard.scratchPercent * 2, 100)}%` }}
                />
              </div>
              <span>{currentCard.isRevealed ? '🎉 완료!' : `${Math.min(currentCard.scratchPercent * 2, 100)}% 긁음`}</span>
            </div>
          </div>
        </div>
      )}

      {!isComplete && currentCard && !currentCard.isRevealed && (
        <div className="scratch-hint">
          <span className="hint-icon">👆</span>
          <span>복권을 긁어서 번호를 확인하세요!</span>
        </div>
      )}

      {currentCard?.isRevealed && !isComplete && (
        <div className="scratch-hint next-card-hint">
          <span>다음 복권 준비 중...</span>
        </div>
      )}
    </div>
  );
};

export default ScratchCard;
