import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  getMyParticipations,
  getRecentStats,
  getWeeklyStats,
  getCurrentRound,
  getCurrentRoundParticipantCount,
  calculateRank,
  deleteMyParticipations,
  Participation,
  WeeklyStats
} from '../utils/firebase';
import { getBallColor } from '../utils/numberGenerator';
import AdBanner from '../components/AdBanner';
import './MyRecordPage.css';

// API 기본 URL
const API_BASE = Capacitor.isNativePlatform()
  ? 'https://lottomaker.vercel.app'
  : '';

interface LottoResult {
  drwNo: number;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
}

function MyRecordPage() {
  const [loading, setLoading] = useState(true);
  const [myRecords, setMyRecords] = useState<Participation[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [currentParticipants, setCurrentParticipants] = useState(0);
  const [lottoResults, setLottoResults] = useState<Map<number, LottoResult>>(new Map());
  const [selectedRound, setSelectedRound] = useState<number>(getCurrentRound() - 1);
  const [selectedStats, setSelectedStats] = useState<WeeklyStats | null>(null);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const currentRound = getCurrentRound();

  // 특정 회차 조회
  const handleRoundSearch = async () => {
    if (selectedRound < 1 || selectedRound >= currentRound) {
      alert('유효한 지난 회차를 입력해주세요.');
      return;
    }
    setLoadingSelected(true);
    try {
      const stats = await getWeeklyStats(selectedRound);
      setSelectedStats(stats);
      if (!stats) {
        alert('해당 회차의 앱 성적 데이터가 없습니다.');
      }
    } catch {
      alert('조회 실패');
    } finally {
      setLoadingSelected(false);
    }
  };

  // 당첨 번호 조회
  const fetchLottoResult = async (round: number): Promise<LottoResult | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/lotto?drwNo=${round}`);
      const data = await response.json();
      if (data.returnValue === 'success') {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 내 참여 기록 조회
        const records = await getMyParticipations(20);
        setMyRecords(records);

        // 최근 통계 조회
        const stats = await getRecentStats(5);
        setWeeklyStats(stats);

        // 현재 회차 참여자 수
        const count = await getCurrentRoundParticipantCount();
        setCurrentParticipants(count);

        // 내 참여 기록의 당첨 번호 조회
        const uniqueRounds = [...new Set(records.map(r => r.roundNumber))];
        const resultsMap = new Map<number, LottoResult>();

        for (const round of uniqueRounds) {
          if (round < currentRound) {
            const result = await fetchLottoResult(round);
            if (result) {
              resultsMap.set(round, result);
            }
          }
        }
        setLottoResults(resultsMap);

      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentRound]);

  const getWinningNumbers = (result: LottoResult): number[] => {
    return [
      result.drwtNo1,
      result.drwtNo2,
      result.drwtNo3,
      result.drwtNo4,
      result.drwtNo5,
      result.drwtNo6
    ];
  };

  const renderBall = (num: number, isMatch?: boolean, isBonus?: boolean) => (
    <span
      className={`record-ball ${isMatch ? 'match' : ''} ${isBonus ? 'bonus' : ''}`}
      style={{ background: getBallColor(num) }}
    >
      {num}
    </span>
  );

  const getRankEmoji = (rank: string) => {
    switch (rank) {
      case '1등': return '🏆';
      case '2등': return '🥈';
      case '3등': return '🥉';
      case '4등': return '🎉';
      case '5등': return '🎊';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="my-record-page">
        <div className="record-header">
          <h2>앱 성적표</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-record-page">
      <div className="record-header">
        <h2>앱 성적표</h2>
        <p>로또메이커 사용자들의 당첨 현황</p>
      </div>

      {/* 이번 주 앱 현황 */}
      <section className="current-round-section">
        <h3>🎯 {currentRound}회차 현황</h3>
        <div className="stats-card highlight">
          <div className="stats-item">
            <span className="stats-label">참여 인원</span>
            <span className="stats-value">{currentParticipants.toLocaleString()}명</span>
          </div>
          <div className="stats-item">
            <span className="stats-label">추첨일</span>
            <span className="stats-value">매주 토요일 오후 8:45</span>
          </div>
        </div>
      </section>

      {/* 최근 앱 성적 */}
      {weeklyStats.length > 0 && (
        <section className="weekly-stats-section">
          <h3>🏆 최근 앱 전체 성적</h3>
          {weeklyStats.map((stat) => (
            <div key={stat.roundNumber} className="weekly-card">
              <div className="weekly-header">
                <span className="round-badge">{stat.roundNumber}회</span>
                <span className="participant-count">참여 {stat.totalParticipants.toLocaleString()}명</span>
              </div>
              <div className="winning-numbers">
                {stat.winningNumbers.map((num, idx) => (
                  <span key={idx} className="winning-ball" style={{ background: getBallColor(num) }}>
                    {num}
                  </span>
                ))}
                <span className="plus">+</span>
                <span className="winning-ball bonus" style={{ background: getBallColor(stat.bonusNumber) }}>
                  {stat.bonusNumber}
                </span>
              </div>
              <div className="results-grid">
                {['1등', '2등', '3등', '4등', '5등'].map((rank) => {
                  const count = stat.results[rank as keyof typeof stat.results];
                  if (count === 0) return null;

                  // 당첨금 표시 (전체 금액)
                  let prizeText = '';
                  if (rank === '1등' && stat.prizes?.['1등']) {
                    prizeText = stat.prizes['1등'].toLocaleString();
                  } else if (rank === '2등' && stat.prizes?.['2등']) {
                    prizeText = stat.prizes['2등'].toLocaleString();
                  } else if (rank === '3등' && stat.prizes?.['3등']) {
                    prizeText = stat.prizes['3등'].toLocaleString();
                  } else if (rank === '4등') {
                    prizeText = '50,000';
                  } else if (rank === '5등') {
                    prizeText = '5,000';
                  }

                  return (
                    <div key={rank} className="result-item win">
                      <span className="rank">{rank}</span>
                      <span className="count">{count}명</span>
                      {prizeText && <span className="prize">{prizeText}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 지난 회차 조회 */}
      <section className="round-search-section">
        <h3>📊 지난 회차 조회</h3>
        <div className="search-box">
          <input
            type="number"
            placeholder="회차 번호"
            value={selectedRound}
            onChange={(e) => setSelectedRound(parseInt(e.target.value) || currentRound - 1)}
            min={1}
            max={currentRound - 1}
          />
          <button onClick={handleRoundSearch} disabled={loadingSelected}>
            {loadingSelected ? '조회 중...' : '조회'}
          </button>
        </div>

        {selectedStats && (
          <div className="weekly-card selected-stats">
            <div className="weekly-header">
              <span className="round-badge">{selectedStats.roundNumber}회</span>
              <span className="participant-count">참여 {selectedStats.totalParticipants.toLocaleString()}명</span>
            </div>
            <div className="winning-numbers">
              {selectedStats.winningNumbers.map((num, idx) => (
                <span key={idx} className="winning-ball" style={{ background: getBallColor(num) }}>
                  {num}
                </span>
              ))}
              <span className="plus">+</span>
              <span className="winning-ball bonus" style={{ background: getBallColor(selectedStats.bonusNumber) }}>
                {selectedStats.bonusNumber}
              </span>
            </div>
            <div className="results-grid">
              {['1등', '2등', '3등', '4등', '5등'].map((rank) => {
                const count = selectedStats.results[rank as keyof typeof selectedStats.results];
                if (count === 0) return null;

                let prizeText = '';
                if (rank === '1등' && selectedStats.prizes?.['1등']) {
                  prizeText = selectedStats.prizes['1등'].toLocaleString();
                } else if (rank === '2등' && selectedStats.prizes?.['2등']) {
                  prizeText = selectedStats.prizes['2등'].toLocaleString();
                } else if (rank === '3등' && selectedStats.prizes?.['3등']) {
                  prizeText = selectedStats.prizes['3등'].toLocaleString();
                } else if (rank === '4등') {
                  prizeText = '50,000';
                } else if (rank === '5등') {
                  prizeText = '5,000';
                }

                return (
                  <div key={rank} className="result-item win">
                    <span className="rank">{rank}</span>
                    <span className="count">{count}명</span>
                    {prizeText && <span className="prize">{prizeText}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 내 참여 기록 */}
      <section className="my-records-section">
        <div className="section-header-row">
          <h3>📋 내 참여 기록</h3>
          {myRecords.length > 0 && (
            <button
              className="reset-btn"
              onClick={async () => {
                if (confirm('정말 모든 참여 기록을 삭제하시겠습니까?')) {
                  const result = await deleteMyParticipations();
                  if (result.success) {
                    setMyRecords([]);
                    // 참여 인원 수도 갱신
                    const newCount = await getCurrentRoundParticipantCount();
                    setCurrentParticipants(newCount);
                    alert(`${result.count}개의 기록이 삭제되었습니다.`);
                  }
                }
              }}
            >
              기록 삭제
            </button>
          )}
        </div>
        {myRecords.length === 0 ? (
          <div className="empty-state">
            <p>아직 참여 기록이 없어요</p>
            <p className="hint">번호를 생성하고 "참여하기" 버튼을 눌러보세요!</p>
          </div>
        ) : (
          <div className="records-list">
            {myRecords.map((record, idx) => {
              const lottoResult = lottoResults.get(record.roundNumber);
              const isCurrentRound = record.roundNumber === currentRound;
              let rank = '';
              let winningNumbers: number[] = [];
              let bonusNumber = 0;

              if (lottoResult) {
                winningNumbers = getWinningNumbers(lottoResult);
                bonusNumber = lottoResult.bnusNo;
                rank = calculateRank(record.numbers, winningNumbers, bonusNumber);
              }

              return (
                <div key={idx} className={`record-card ${rank && rank !== '낙첨' ? 'winner' : ''}`}>
                  <div className="record-header-row">
                    <span className="round-badge">{record.roundNumber}회</span>
                    {isCurrentRound ? (
                      <span className="status pending">대기 중</span>
                    ) : rank ? (
                      <span className={`status ${rank === '낙첨' ? 'lose' : 'win'}`}>
                        {getRankEmoji(rank)} {rank}
                      </span>
                    ) : (
                      <span className="status pending">결과 대기</span>
                    )}
                  </div>
                  <div className="record-numbers">
                    {record.numbers.map((num, numIdx) => {
                      const isMatch = winningNumbers.includes(num);
                      const isBonus = num === bonusNumber;
                      return (
                        <span key={numIdx}>
                          {renderBall(num, isMatch, isBonus)}
                        </span>
                      );
                    })}
                  </div>
                  {lottoResult && (
                    <div className="record-comparison">
                      <span className="comparison-label">당첨번호:</span>
                      <div className="comparison-numbers">
                        {winningNumbers.map((num, numIdx) => (
                          <span key={numIdx} className="mini-ball" style={{ background: getBallColor(num) }}>
                            {num}
                          </span>
                        ))}
                        <span className="plus-small">+</span>
                        <span className="mini-ball bonus" style={{ background: getBallColor(bonusNumber) }}>
                          {bonusNumber}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <AdBanner slot="1267852110" format="horizontal" />
    </div>
  );
}

export default MyRecordPage;
