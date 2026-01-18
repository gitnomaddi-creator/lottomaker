import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { lotteryGames } from '../data/lotteryGames';
import { GeneratorType, GeneratedNumbers } from '../types/lottery';
import QuickGenerator from '../components/QuickGenerator';
import LotteryMachine from '../components/LotteryMachine';
import RouletteMachine from '../components/RouletteMachine';
import SlotMachine from '../components/SlotMachine';
import GachaMachine from '../components/GachaMachine';
import ScratchCard from '../components/ScratchCard';
import LiveResult from '../components/LiveResult';
import ResultModal from '../components/ResultModal';
import './GeneratorPage.css';

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: object) => void;
      };
    };
  }
}

interface GeneratorInfo {
  type: GeneratorType;
  icon: string;
  label: string;
  description: string;
}

const generators: GeneratorInfo[] = [
  { type: 'quick', icon: '⚡', label: '한방생성', description: '바로 번호 생성' },
  { type: 'lottery', icon: '🎱', label: '로또머신', description: '공이 나오는 추첨기' },
  { type: 'roulette', icon: '🎡', label: '룰렛', description: '돌려돌려 룰렛' },
  { type: 'slot', icon: '🎰', label: '슬롯', description: '잭팟을 노려라' },
  { type: 'gacha', icon: '🎪', label: '가챠', description: '캡슐 뽑기' },
  { type: 'scratch', icon: '🎫', label: '복권', description: '긁어서 확인' },
];

function GeneratorPage() {
  const selectedGame = lotteryGames[0];
  const [generatorType, setGeneratorType] = useState<GeneratorType>('quick');
  const [gameCount, setGameCount] = useState(1);
  const [allGames, setAllGames] = useState<GeneratedNumbers[]>([]);
  const [liveNumbers, setLiveNumbers] = useState<number[]>([]);
  const [liveBonusNumbers, setLiveBonusNumbers] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const numbersPerGame = selectedGame.mainNumbers.count;
  const totalRequired = numbersPerGame * gameCount;

  const handleGeneratorTypeChange = (type: GeneratorType) => {
    setGeneratorType(type);
    setLiveNumbers([]);
    setLiveBonusNumbers([]);
    setAllGames([]);
    setShowModal(false);
    setResetKey(prev => prev + 1);
  };

  const handleGameCountChange = (count: number) => {
    setGameCount(count);
    handleReset();
  };

  const handleNumberUpdate = (numbers: number[], bonusNumbers?: number[]) => {
    setLiveNumbers(numbers);
    if (bonusNumbers) {
      setLiveBonusNumbers(bonusNumbers);
    }
  };

  // 모든 생성기에서 생성된 게임 받기
  const handleAllGamesComplete = useCallback((games: GeneratedNumbers[]) => {
    setAllGames(games);
    setTimeout(() => {
      setShowModal(true);
    }, 300);
  }, []);


  const handleReset = () => {
    setLiveNumbers([]);
    setLiveBonusNumbers([]);
    setAllGames([]);
    setShowModal(false);
    setResetKey(prev => prev + 1);
  };

  const handleShareImage = useCallback(async (element: HTMLElement) => {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `로또메이커_${gameCount}게임_${new Date().toLocaleDateString('ko-KR')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('이미지 저장 실패:', error);
      alert('이미지 저장에 실패했습니다.');
    }
  }, [gameCount]);

  const handleShareSMS = useCallback(() => {
    if (allGames.length > 0) {
      const lines = allGames.map((game, i) =>
        `${String.fromCharCode(65 + i)} ${game.mainNumbers.join(' ')}`
      ).join('\n');
      const text = `로또메이커 생성 번호\n${lines}\nhttps://lotto-maker.vercel.app`;
      const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
      window.location.href = smsUrl;
    }
  }, [allGames]);

  const handleShareKakao = useCallback(() => {
    if (allGames.length === 0) return;

    const description = allGames.map((game, i) =>
      `${String.fromCharCode(65 + i)} ${game.mainNumbers.join(' ')}`
    ).join(' | ');

    if (window.Kakao && window.Kakao.isInitialized()) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: `로또메이커 ${allGames.length}게임 생성`,
          description: description,
          imageUrl: 'https://lotto-maker.vercel.app/og-image.png',
          link: {
            mobileWebUrl: 'https://lotto-maker.vercel.app',
            webUrl: 'https://lotto-maker.vercel.app',
          },
        },
        buttons: [
          {
            title: '나도 뽑아보기',
            link: {
              mobileWebUrl: 'https://lotto-maker.vercel.app',
              webUrl: 'https://lotto-maker.vercel.app',
            },
          },
        ],
      });
    } else {
      alert('카카오톡 공유는 배포 후 사용 가능합니다.');
    }
  }, [allGames]);

  const isComplete = liveNumbers.length + liveBonusNumbers.length === totalRequired;
  const currentGenerator = generators.find(g => g.type === generatorType)!;

  const renderGenerator = () => {
    const props = {
      key: `${generatorType}-${resetKey}`,
      game: selectedGame,
      onNumberUpdate: handleNumberUpdate,
      onReset: handleReset,
    };

    switch (generatorType) {
      case 'quick':
        return <QuickGenerator {...props} gameCount={gameCount} onMultiGenerate={handleAllGamesComplete} />;
      case 'lottery':
        return <LotteryMachine {...props} gameCount={gameCount} onAllGamesComplete={handleAllGamesComplete} />;
      case 'roulette':
        return <RouletteMachine {...props} gameCount={gameCount} onAllGamesComplete={handleAllGamesComplete} />;
      case 'slot':
        return <SlotMachine {...props} gameCount={gameCount} onAllGamesComplete={handleAllGamesComplete} />;
      case 'gacha':
        return <GachaMachine {...props} gameCount={gameCount} onAllGamesComplete={handleAllGamesComplete} />;
      case 'scratch':
        return <ScratchCard {...props} gameCount={gameCount} onAllGamesComplete={handleAllGamesComplete} />;
      default: return null;
    }
  };

  return (
    <div className="generator-page">
      {/* Generator Icon Selector */}
      <div className="generator-selector">
        {generators.map((gen) => (
          <button
            key={gen.type}
            className={`generator-icon-btn ${generatorType === gen.type ? 'active' : ''}`}
            onClick={() => handleGeneratorTypeChange(gen.type)}
            title={gen.description}
          >
            <span className="icon">{gen.icon}</span>
            <span className="label">{gen.label}</span>
          </button>
        ))}
      </div>

      {/* Current Generator Label */}
      <div className="current-generator">
        <span className="current-icon">{currentGenerator.icon}</span>
        <span className="current-label">{currentGenerator.label}</span>
        <span className="current-desc">{currentGenerator.description}</span>
        {gameCount > 1 && generatorType !== 'quick' && allGames.length > 0 && (
          <span className="game-progress">{allGames.length}/{gameCount} 게임</span>
        )}
      </div>

      <div className="content-layout">
        {/* Game Count Selector - Left Side */}
        <div className="game-count-panel">
          <div className="game-count-title">게임 수</div>
          <div className="game-count-buttons-vertical">
            {[1, 2, 3, 4, 5].map((count) => (
              <button
                key={count}
                className={`game-count-btn-vertical ${gameCount === count ? 'active' : ''}`}
                onClick={() => handleGameCountChange(count)}
              >
                {count}
              </button>
            ))}
          </div>
          <div className="game-count-price-panel">{(gameCount * 1000).toLocaleString()}원</div>
        </div>

        <div className="generator-area">
          {renderGenerator()}
        </div>

        <div className="result-area" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <LiveResult
            numbers={liveNumbers}
            bonusNumbers={liveBonusNumbers.length > 0 ? liveBonusNumbers : undefined}
            totalRequired={totalRequired}
            numbersPerGame={numbersPerGame}
            gameCount={gameCount}
            isComplete={isComplete}
            onReset={handleReset}
          />
        </div>
      </div>

      {showModal && allGames.length > 0 && (
        <ResultModal
          games={allGames}
          onClose={() => setShowModal(false)}
          onReset={handleReset}
          onShareImage={handleShareImage}
          onShareSMS={handleShareSMS}
          onShareKakao={handleShareKakao}
        />
      )}
    </div>
  );
}

export default GeneratorPage;
