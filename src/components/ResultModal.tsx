import { useRef, useState } from 'react';
import { GeneratedNumbers } from '../types/lottery';
import { getBallColorClass } from '../utils/numberGenerator';
import { submitParticipation, getCurrentRound } from '../utils/firebase';
import './ResultModal.css';

interface ResultModalProps {
  games: GeneratedNumbers[];
  onClose: () => void;
  onReset: () => void;
  onShareImage: (element: HTMLElement) => void;
  onShareSMS: () => void;
  onShareKakao: () => void;
}

const ResultModal = ({ games, onClose, onReset, onShareImage, onShareSMS, onShareKakao }: ResultModalProps) => {
  const captureRef = useRef<HTMLDivElement>(null);
  const [participationStatus, setParticipationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [participationMessage, setParticipationMessage] = useState('');
  const currentRound = getCurrentRound();

  const handleShareImage = () => {
    if (captureRef.current) {
      onShareImage(captureRef.current);
    }
  };

  const handleParticipate = async () => {
    if (participationStatus === 'loading' || participationStatus === 'success') return;

    setParticipationStatus('loading');

    // 모든 게임의 번호를 각각 저장
    let successCount = 0;
    let lastMessage = '';

    for (const game of games) {
      const result = await submitParticipation(game.mainNumbers);
      if (result.success) {
        successCount++;
      }
      lastMessage = result.message;
    }

    if (successCount > 0) {
      setParticipationStatus('success');
      setParticipationMessage(`${currentRound}회차 ${successCount}게임 참여 완료!`);
    } else {
      setParticipationStatus('error');
      setParticipationMessage(lastMessage);
    }
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 실제 로또 용지 스타일 */}
        <div ref={captureRef} className="lotto-ticket">
          {/* 상단 로고 영역 */}
          <div className="ticket-header">
            <div className="ticket-logo-area">
              <span className="lotto-text">Lotto Maker</span>
            </div>
          </div>

          {/* 발행 정보 */}
          <div className="ticket-info">
            <div className="info-row">
              <span>발행일: {dateStr} ({['일','월','화','수','목','금','토'][today.getDay()]}) {timeStr}</span>
            </div>
          </div>

          {/* 번호 영역 */}
          <div className="ticket-body">
            <div className="ticket-games">
              {games.map((game, gameIndex) => (
                <div key={gameIndex} className="ticket-row">
                  <span className="row-label">{String.fromCharCode(65 + gameIndex)}</span>
                  <div className="row-numbers">
                    {game.mainNumbers.map((num, numIndex) => (
                      <span
                        key={numIndex}
                        className={`ticket-number ${getBallColorClass(num)}`}
                      >
                        {String(num).padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                  <span className="auto-mark">자동</span>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 금액 */}
          <div className="ticket-footer">
            <div className="ticket-price">금 액: ₩{(games.length * 1000).toLocaleString()}</div>
            <div className="ticket-watermark">lotto-maker.vercel.app</div>
          </div>
        </div>

        {/* 참여 확정 버튼 */}
        <div className="participate-section">
          <button
            className={`participate-btn ${participationStatus}`}
            onClick={handleParticipate}
            disabled={participationStatus === 'loading' || participationStatus === 'success'}
          >
            {participationStatus === 'idle' && `🎯 ${currentRound}회차 참여하기`}
            {participationStatus === 'loading' && '참여 중...'}
            {participationStatus === 'success' && '✓ 참여 완료!'}
            {participationStatus === 'error' && '다시 시도'}
          </button>
          {participationMessage && (
            <p className={`participate-message ${participationStatus}`}>
              {participationMessage}
            </p>
          )}
          <p className="participate-hint">
            참여하면 추첨 후 당첨 여부를 확인할 수 있어요
          </p>
        </div>

        <div className="share-section">
          <h4>공유하기</h4>
          <div className="share-buttons">
            <button className="share-option-btn image-btn" onClick={handleShareImage}>
              <span className="share-label">사진</span>
            </button>
            <button className="share-option-btn sms-btn" onClick={onShareSMS}>
              <span className="share-label">문자</span>
            </button>
            <button className="share-option-btn share-btn" onClick={onShareKakao}>
              <span className="share-label">공유</span>
            </button>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="modal-button reset-btn" onClick={onReset}>
            다시 뽑기
          </button>
          <button className="modal-button close-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
