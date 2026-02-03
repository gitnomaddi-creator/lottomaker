import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
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
import { useSEO } from '../hooks/useSEO';
import AdBanner from '../components/AdBanner';
import './GeneratorPage.css';

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
  useSEO({
    title: '무료 로또 번호 생성기',
    description: '로또 머신, 룰렛, 슬롯, 가챠, 복권 긁기 등 6가지 재미있는 방식으로 로또 번호를 생성하세요. 완전 무료!',
    keywords: '로또번호생성기, 로또추첨, 로또머신, 룰렛, 슬롯머신, 무료로또',
    path: '/',
  });

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

  const handleShareKakao = useCallback(async () => {
    if (allGames.length === 0) return;

    const lines = allGames.map((game, i) =>
      `${String.fromCharCode(65 + i)} ${game.mainNumbers.join(' ')}`
    ).join('\n');

    const text = `🍀 로또메이커 ${allGames.length}게임 생성\n\n${lines}`;

    // 네이티브 앱: Capacitor Share API 사용
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: '로또메이커 번호 공유',
          text: text,
          dialogTitle: '공유하기',
        });
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // 웹: Web Share API 또는 클립보드 복사
      if (navigator.share) {
        try {
          await navigator.share({
            title: '로또메이커 번호 공유',
            text: text,
          });
        } catch (error) {
          console.error('공유 실패:', error);
        }
      } else {
        // Web Share API 미지원 시 클립보드 복사
        try {
          await navigator.clipboard.writeText(text);
          alert('번호가 클립보드에 복사되었습니다!');
        } catch {
          alert('공유 기능을 사용할 수 없습니다.');
        }
      }
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

        <div className="result-area">
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

      {/* 하단 광고 배너 */}
      <AdBanner slot="1267852110" format="horizontal" />

      {/* 콘텐츠 섹션 - 애드센스 승인용 */}
      <div className="content-sections">
        {/* 로또메이커란? */}
        <section className="info-section">
          <h2 className="section-title">로또메이커란?</h2>
          <div className="section-content">
            <p>
              로또메이커는 <strong>로또 6/45 번호를 무작위로 생성</strong>해주는 무료 온라인 서비스입니다.
              수학적으로 검증된 난수 생성 알고리즘을 사용하여 1부터 45까지의 숫자 중 중복 없이 6개의 번호를
              공정하게 추첨합니다.
            </p>
            <p>
              단순한 자동 번호 생성을 넘어, <strong>로또머신, 룰렛, 슬롯머신, 가챠, 복권 긁기</strong> 등
              6가지 재미있는 방식으로 번호를 뽑을 수 있어 마치 실제 추첨에 참여하는 듯한 즐거움을 느낄 수 있습니다.
              생성된 번호는 이미지로 저장하거나 카카오톡, 문자로 공유할 수 있어 친구들과 함께 즐기기에도 좋습니다.
            </p>
            <p>
              회원가입 없이 누구나 무료로 이용할 수 있으며, 모바일과 PC 모두에서 최적화된 화면으로 편리하게 사용하실 수 있습니다.
            </p>
          </div>
        </section>

        {/* 이용 방법 */}
        <section className="info-section">
          <h2 className="section-title">이용 방법</h2>
          <div className="section-content">
            <div className="how-to-use">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h3>생성 방식 선택</h3>
                  <p>상단의 6가지 아이콘(한방생성, 로또머신, 룰렛, 슬롯, 가챠, 복권) 중 원하는 방식을 선택하세요.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h3>게임 수 설정</h3>
                  <p>왼쪽 패널에서 1~5게임 중 원하는 게임 수를 선택하세요. 한 번에 최대 5게임(5,000원어치)까지 생성할 수 있습니다.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h3>번호 생성</h3>
                  <p>중앙의 생성기를 클릭하거나 터치하여 번호를 뽑으세요. 각 방식마다 다른 애니메이션과 효과를 즐길 수 있습니다.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <h3>결과 확인 및 공유</h3>
                  <p>생성된 번호를 확인하고, 이미지 저장 또는 카카오톡/문자로 공유하세요. 다시 뽑기로 새로운 번호를 생성할 수도 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 당첨 확률 */}
        <section className="info-section">
          <h2 className="section-title">로또 당첨 확률</h2>
          <div className="section-content">
            <p>
              로또 6/45는 1부터 45까지의 숫자 중 6개를 맞추는 복권 게임입니다.
              수학적으로 가능한 모든 조합의 수는 <strong>8,145,060가지</strong>입니다.
            </p>
            <div className="probability-table">
              <div className="prob-row header">
                <span>등위</span>
                <span>당첨 조건</span>
                <span>확률</span>
              </div>
              <div className="prob-row">
                <span className="rank first">1등</span>
                <span>6개 번호 일치</span>
                <span className="prob">1/8,145,060</span>
              </div>
              <div className="prob-row">
                <span className="rank second">2등</span>
                <span>5개 + 보너스</span>
                <span className="prob">1/1,357,510</span>
              </div>
              <div className="prob-row">
                <span className="rank third">3등</span>
                <span>5개 일치</span>
                <span className="prob">1/35,724</span>
              </div>
              <div className="prob-row">
                <span className="rank fourth">4등</span>
                <span>4개 일치</span>
                <span className="prob">1/733</span>
              </div>
              <div className="prob-row">
                <span className="rank fifth">5등</span>
                <span>3개 일치</span>
                <span className="prob">1/45</span>
              </div>
            </div>
            <p className="prob-note">
              어떤 번호든 당첨될 확률은 동일합니다. 로또메이커의 무작위 생성 번호도 판매점 자동 번호와 동일한 당첨 확률을 가집니다.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="info-section">
          <h2 className="section-title">자주 묻는 질문</h2>
          <div className="section-content">
            <div className="mini-faq">
              <details className="faq-item">
                <summary>로또메이커는 무료인가요?</summary>
                <p>네, 로또메이커는 100% 무료 서비스입니다. 회원가입 없이 누구나 자유롭게 번호를 생성할 수 있습니다.</p>
              </details>
              <details className="faq-item">
                <summary>생성된 번호로 당첨될 수 있나요?</summary>
                <p>로또메이커에서 생성된 번호의 당첨 확률은 직접 선택하거나 판매점 자동 번호와 동일합니다.
                본 서비스는 오락 목적으로 제공되며, 당첨을 보장하지 않습니다.</p>
              </details>
              <details className="faq-item">
                <summary>번호를 저장할 수 있나요?</summary>
                <p>네, 생성된 번호는 이미지로 저장할 수 있습니다. 번호 생성 후 나타나는 결과 화면에서
                "이미지 저장" 버튼을 누르면 PNG 파일로 다운로드됩니다.</p>
              </details>
              <details className="faq-item">
                <summary>로또는 어디서 구매하나요?</summary>
                <p>로또는 전국의 로또 판매점 또는 동행복권 공식 웹사이트(dhlottery.co.kr)에서 구매할 수 있습니다.
                만 19세 이상만 구매 가능합니다.</p>
              </details>
              <details className="faq-item">
                <summary>6가지 생성 방식의 차이점은 무엇인가요?</summary>
                <p>모든 방식은 동일한 무작위 알고리즘을 사용하며 당첨 확률에 차이가 없습니다.
                단지 시각적 효과와 재미 요소가 다를 뿐이니 취향에 맞는 방식을 선택하세요.</p>
              </details>
            </div>
            <p className="faq-more">
              더 많은 질문과 답변은 <a href="/faq">FAQ 페이지</a>에서 확인하세요.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default GeneratorPage;
