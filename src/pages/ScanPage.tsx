import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import QRScanner, { LottoScanResult } from '../components/QRScanner';
import './ScanPage.css';

// 네이티브 앱에서는 전체 URL 사용
const API_BASE = Capacitor.isNativePlatform()
  ? 'https://lotto-maker.vercel.app'
  : '';

interface WinningResult {
  round: number;
  numbers: number[];
  bonusNumber: number;
}

function ScanPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<LottoScanResult | null>(null);
  const [winningNumbers, setWinningNumbers] = useState<WinningResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  // 당첨 번호 조회
  const fetchWinningNumbers = async (round: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/lotto?drwNo=${round}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      if (data.returnValue === 'success') {
        setWinningNumbers({
          round: data.drwNo,
          numbers: [
            data.drwtNo1,
            data.drwtNo2,
            data.drwtNo3,
            data.drwtNo4,
            data.drwtNo5,
            data.drwtNo6
          ],
          bonusNumber: data.bnusNo
        });
      }
    } catch (error) {
      console.error('Failed to fetch winning numbers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanResult = (result: LottoScanResult | null) => {
    setShowScanner(false);
    if (result) {
      setScanResult(result);
      fetchWinningNumbers(result.round);
    }
  };

  // 당첨 등수 계산
  const calculateRank = (myNumbers: number[], winNumbers: number[], bonus: number): string => {
    const matchCount = myNumbers.filter(n => winNumbers.includes(n)).length;
    const hasBonus = myNumbers.includes(bonus);

    if (matchCount === 6) return '1등';
    if (matchCount === 5 && hasBonus) return '2등';
    if (matchCount === 5) return '3등';
    if (matchCount === 4) return '4등';
    if (matchCount === 3) return '5등';
    return '낙첨';
  };

  const getBallColor = (num: number): string => {
    if (num <= 10) return '#fbc400';
    if (num <= 20) return '#69c8f2';
    if (num <= 30) return '#ff7272';
    if (num <= 40) return '#aaa';
    return '#b0d840';
  };

  const resetScan = () => {
    setScanResult(null);
    setWinningNumbers(null);
  };

  return (
    <div className="scan-page">
      <div className="scan-header">
        <h2>QR 당첨 확인</h2>
        <p>로또 용지의 QR 코드를 스캔하여 당첨 여부를 확인하세요</p>
      </div>

      {!scanResult ? (
        <div className="scan-start">
          <div className="scan-icon">
            <svg viewBox="0 0 24 24" width="100" height="100" fill="currentColor">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 6h2v-2h2v2h2v-2h-2v-2h2v-2h-2v2h-2v-2h-2v2h2v2h-2v2zm4-6h2v2h-2v-2zm2 4h2v2h-2v-2z"/>
            </svg>
          </div>

          {!isNative ? (
            <div className="scan-web-notice">
              <p>QR 스캔은 앱에서만 사용 가능합니다</p>
              <p className="scan-hint">앱을 설치하시면 로또 용지의 QR 코드를<br />스캔하여 당첨 여부를 확인할 수 있습니다.</p>
            </div>
          ) : (
            <button className="scan-btn" onClick={() => setShowScanner(true)}>
              QR 코드 스캔하기
            </button>
          )}
        </div>
      ) : (
        <div className="scan-result">
          <div className="result-round">
            <span className="round-label">{scanResult.round}회차</span>
            <button className="rescan-btn" onClick={resetScan}>
              다시 스캔
            </button>
          </div>

          {isLoading ? (
            <div className="loading">당첨 번호 조회 중...</div>
          ) : winningNumbers ? (
            <>
              <div className="winning-numbers">
                <h3>당첨 번호</h3>
                <div className="numbers-row">
                  {winningNumbers.numbers.map((num, idx) => (
                    <span
                      key={idx}
                      className="ball"
                      style={{ background: getBallColor(num) }}
                    >
                      {num}
                    </span>
                  ))}
                  <span className="plus">+</span>
                  <span
                    className="ball bonus"
                    style={{ background: getBallColor(winningNumbers.bonusNumber) }}
                  >
                    {winningNumbers.bonusNumber}
                  </span>
                </div>
              </div>

              <div className="my-numbers">
                <h3>내 번호</h3>
                {scanResult.numbers.map((game, gameIdx) => {
                  const rank = calculateRank(game, winningNumbers.numbers, winningNumbers.bonusNumber);
                  const isWin = rank !== '낙첨';

                  return (
                    <div key={gameIdx} className={`game-row ${isWin ? 'win' : 'lose'}`}>
                      <span className="game-label">{String.fromCharCode(65 + gameIdx)}</span>
                      <div className="numbers-row">
                        {game.map((num, idx) => {
                          const isMatch = winningNumbers.numbers.includes(num);
                          const isBonus = num === winningNumbers.bonusNumber;
                          return (
                            <span
                              key={idx}
                              className={`ball small ${isMatch ? 'match' : ''} ${isBonus ? 'bonus-match' : ''}`}
                              style={{ background: getBallColor(num) }}
                            >
                              {num}
                            </span>
                          );
                        })}
                      </div>
                      <span className={`rank ${isWin ? 'win' : ''}`}>{rank}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="error">당첨 번호를 불러올 수 없습니다.</div>
          )}
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

export default ScanPage;
