import { useState, useEffect } from 'react';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import './QRScanner.css';

interface QRScannerProps {
  onScanResult: (result: LottoScanResult | null) => void;
  onClose: () => void;
}

export interface LottoScanResult {
  round: number;
  numbers: number[][];
  rawData: string;
}

function QRScanner({ onScanResult, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // 웹에서는 지원하지 않음
    if (!Capacitor.isNativePlatform()) {
      setIsSupported(false);
      setError('QR 스캔은 앱에서만 사용 가능합니다.');
    }
  }, []);

  const requestPermissions = async (): Promise<boolean> => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  };

  const startScan = async () => {
    try {
      setError(null);

      // 권한 확인
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('카메라 권한이 필요합니다.');
        return;
      }

      setIsScanning(true);

      // 스캔 시작
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      setIsScanning(false);

      if (barcodes.length > 0) {
        const rawValue = barcodes[0].rawValue || '';
        const parsed = parseLottoQR(rawValue);
        onScanResult(parsed);
      } else {
        setError('QR 코드를 찾을 수 없습니다.');
      }
    } catch (err) {
      setIsScanning(false);
      setError('스캔 중 오류가 발생했습니다.');
      console.error('Scan error:', err);
    }
  };

  // 로또 QR 코드 파싱
  // 형식 예: http://m.dhlottery.co.kr/?v=1196q030711143144q071522273640q...
  const parseLottoQR = (data: string): LottoScanResult | null => {
    try {
      // URL에서 파라미터 추출
      const url = new URL(data);
      const v = url.searchParams.get('v');

      if (!v) return null;

      // 회차 추출 (처음 4자리)
      const round = parseInt(v.substring(0, 4), 10);

      // 나머지 부분에서 번호 추출
      const rest = v.substring(4);
      const games: number[][] = [];

      // 'q'로 구분된 게임들
      const gameStrings = rest.split('q').filter(s => s.length > 0);

      for (const gameStr of gameStrings) {
        // 2자리씩 끊어서 번호 추출
        const numbers: number[] = [];
        for (let i = 0; i < gameStr.length; i += 2) {
          const num = parseInt(gameStr.substring(i, i + 2), 10);
          if (num >= 1 && num <= 45) {
            numbers.push(num);
          }
        }
        if (numbers.length === 6) {
          games.push(numbers.sort((a, b) => a - b));
        }
      }

      if (games.length === 0) return null;

      return {
        round,
        numbers: games,
        rawData: data
      };
    } catch {
      return null;
    }
  };

  const stopScan = async () => {
    try {
      await BarcodeScanner.stopScan();
      setIsScanning(false);
    } catch (err) {
      console.error('Stop scan error:', err);
    }
  };

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <h2>QR 코드 스캔</h2>
          <button className="qr-close-btn" onClick={onClose}>
            X
          </button>
        </div>

        <div className="qr-scanner-content">
          {!isSupported ? (
            <div className="qr-scanner-message">
              <p>{error}</p>
              <p className="qr-scanner-hint">
                앱을 설치하면 로또 용지의 QR 코드를 스캔하여<br />
                당첨 여부를 확인할 수 있습니다.
              </p>
            </div>
          ) : isScanning ? (
            <div className="qr-scanner-scanning">
              <div className="qr-scanner-frame">
                <div className="qr-corner top-left"></div>
                <div className="qr-corner top-right"></div>
                <div className="qr-corner bottom-left"></div>
                <div className="qr-corner bottom-right"></div>
              </div>
              <p>로또 용지의 QR 코드를 스캔해주세요</p>
              <button className="qr-cancel-btn" onClick={stopScan}>
                취소
              </button>
            </div>
          ) : (
            <div className="qr-scanner-ready">
              <div className="qr-icon">
                <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor">
                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 2h-2v2h2v2h-4v-4h2v-2h-2v-2h4v4zm0 2h2v2h-2v-2zm2-4h2v4h-2v-4z"/>
                </svg>
              </div>
              <p>로또 용지의 QR 코드를 스캔하여<br />당첨 여부를 확인하세요</p>

              {error && <p className="qr-error">{error}</p>}

              <button className="qr-scan-btn" onClick={startScan}>
                스캔 시작
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QRScanner;
