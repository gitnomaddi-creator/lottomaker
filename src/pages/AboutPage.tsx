import { useSEO } from '../hooks/useSEO';
import './AboutPage.css';

function AboutPage() {
  useSEO({
    title: '로또 6/45 소개',
    description: '로또 6/45 게임 규칙, 당첨 등위, 구매 방법 등 로또에 대한 모든 정보를 알아보세요.',
    keywords: '로또소개, 로또규칙, 로또645, 로또당첨등위, 로또구매방법',
    path: '/about',
  });

  return (
    <div className="about-page">
      <div className="about-header">
        <h2>로또 6/45 소개</h2>
        <p>대한민국 대표 복권 게임에 대해 알아보세요</p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h3>로또 6/45란?</h3>
          <p>
            1부터 45까지의 숫자 중 <strong>6개의 번호</strong>를 선택하여,
            추첨으로 결정된 당첨번호와 일치하는 개수에 따라 당첨금을 받는 복권 게임입니다.
          </p>
          <p>
            2002년 12월 첫 추첨을 시작으로, 매주 토요일 추첨이 진행됩니다.
          </p>
        </div>

        <div className="about-section">
          <h3>번호 선택 방법</h3>
          <div className="method-cards">
            <div className="method-card">
              <span className="method-emoji">✍️</span>
              <strong>수동 선택</strong>
              <p>직접 6개 번호를 선택</p>
            </div>
            <div className="method-card">
              <span className="method-emoji">🎲</span>
              <strong>자동 선택</strong>
              <p>컴퓨터가 무작위로 선택</p>
            </div>
            <div className="method-card">
              <span className="method-emoji">🔀</span>
              <strong>반자동 선택</strong>
              <p>일부는 직접, 나머지는 자동</p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h3>당첨 등위</h3>
          <div className="prize-table">
            <div className="prize-row header">
              <span>등위</span>
              <span>당첨 조건</span>
              <span>당첨금</span>
              <span>확률</span>
            </div>
            <div className="prize-row">
              <span className="rank rank-1">1등</span>
              <span>6개 번호 일치</span>
              <span>총 당첨금의 75%</span>
              <span>1/8,145,060</span>
            </div>
            <div className="prize-row">
              <span className="rank rank-2">2등</span>
              <span>5개 + 보너스 번호</span>
              <span>총 당첨금의 12.5%</span>
              <span>1/1,357,510</span>
            </div>
            <div className="prize-row">
              <span className="rank rank-3">3등</span>
              <span>5개 번호 일치</span>
              <span>총 당첨금의 12.5%</span>
              <span>1/35,724</span>
            </div>
            <div className="prize-row">
              <span className="rank rank-4">4등</span>
              <span>4개 번호 일치</span>
              <span className="fixed-prize">50,000원</span>
              <span>1/733</span>
            </div>
            <div className="prize-row">
              <span className="rank rank-5">5등</span>
              <span>3개 번호 일치</span>
              <span className="fixed-prize">5,000원</span>
              <span>1/45</span>
            </div>
          </div>
          <p className="prize-note">* 전체 당첨 확률: 1/42</p>
        </div>

        <div className="about-section">
          <h3>추첨 안내</h3>
          <div className="schedule-grid">
            <div className="schedule-card">
              <span className="schedule-icon">📅</span>
              <div className="schedule-info">
                <strong>추첨일</strong>
                <span>매주 토요일</span>
              </div>
            </div>
            <div className="schedule-card">
              <span className="schedule-icon">⏰</span>
              <div className="schedule-info">
                <strong>추첨 시간</strong>
                <span>오후 8시 35분</span>
              </div>
            </div>
            <div className="schedule-card">
              <span className="schedule-icon">📺</span>
              <div className="schedule-info">
                <strong>생방송</strong>
                <span>MBC</span>
              </div>
            </div>
            <div className="schedule-card">
              <span className="schedule-icon">🛒</span>
              <div className="schedule-info">
                <strong>판매 마감</strong>
                <span>토요일 오후 8시</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h3>구매 안내</h3>
          <div className="purchase-info">
            <div className="purchase-item highlight">
              <span className="purchase-label">복권 가격</span>
              <span className="purchase-value price">1,000원 / 1게임</span>
            </div>
            <div className="purchase-item">
              <span className="purchase-label">판매점 구매 한도</span>
              <span className="purchase-value">1회 10만원</span>
            </div>
            <div className="purchase-item">
              <span className="purchase-label">인터넷 구매 한도</span>
              <span className="purchase-value">회차당 5천원</span>
            </div>
            <div className="purchase-item">
              <span className="purchase-label">구매 가능 연령</span>
              <span className="purchase-value">만 19세 이상</span>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h3>당첨금 수령</h3>
          <div className="claim-info">
            <div className="claim-item">
              <strong>5등 (5천원)</strong>
              <p>전국 로또 판매점에서 수령</p>
            </div>
            <div className="claim-item">
              <strong>4등 (5만원)</strong>
              <p>전국 로또 판매점에서 수령</p>
            </div>
            <div className="claim-item">
              <strong>1~3등</strong>
              <p>NH농협은행 본점에서 수령<br/>(신분증, 당첨복권 지참)</p>
            </div>
          </div>
          <div className="claim-warning">
            <p>⚠️ 당첨금 지급 기한은 <strong>지급개시일로부터 1년</strong>이며, 미청구 당첨금은 복권기금으로 귀속됩니다.</p>
          </div>
        </div>

        <div className="about-note">
          <p>💡 로또 6/45는 만 19세 이상만 구매 가능합니다. 본 서비스는 오락 목적으로만 제공되며, 실제 당첨을 보장하지 않습니다.</p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
