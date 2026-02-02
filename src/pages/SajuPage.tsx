import { useState, useEffect } from 'react';
import { getBallColor } from '../utils/numberGenerator';
import { useSEO } from '../hooks/useSEO';
import AdBanner from '../components/AdBanner';
import './SajuPage.css';

type InputMode = 'zodiac' | 'birthdate';

interface ZodiacInfo {
  name: string;
  icon: string;
  dataKey: string;
  years: number[];
  element: string;
}

interface FortuneData {
  luck: string;
  score: number;
  message: string;
  advice: string;
  luckyColor: string;
  luckyTime: string;
}

const zodiacData: ZodiacInfo[] = [
  { name: '쥐', icon: '🐀', dataKey: '쥐띠', years: [1948, 1960, 1972, 1984, 1996, 2008, 2020], element: '수' },
  { name: '소', icon: '🐂', dataKey: '소띠', years: [1949, 1961, 1973, 1985, 1997, 2009, 2021], element: '토' },
  { name: '호랑이', icon: '🐅', dataKey: '호랑이띠', years: [1950, 1962, 1974, 1986, 1998, 2010, 2022], element: '목' },
  { name: '토끼', icon: '🐇', dataKey: '토끼띠', years: [1951, 1963, 1975, 1987, 1999, 2011, 2023], element: '목' },
  { name: '용', icon: '🐉', dataKey: '용띠', years: [1952, 1964, 1976, 1988, 2000, 2012, 2024], element: '토' },
  { name: '뱀', icon: '🐍', dataKey: '뱀띠', years: [1953, 1965, 1977, 1989, 2001, 2013, 2025], element: '화' },
  { name: '말', icon: '🐴', dataKey: '말띠', years: [1954, 1966, 1978, 1990, 2002, 2014, 2026], element: '화' },
  { name: '양', icon: '🐑', dataKey: '양띠', years: [1955, 1967, 1979, 1991, 2003, 2015, 2027], element: '토' },
  { name: '원숭이', icon: '🐒', dataKey: '원숭이띠', years: [1956, 1968, 1980, 1992, 2004, 2016, 2028], element: '금' },
  { name: '닭', icon: '🐓', dataKey: '닭띠', years: [1957, 1969, 1981, 1993, 2005, 2017, 2029], element: '금' },
  { name: '개', icon: '🐕', dataKey: '개띠', years: [1958, 1970, 1982, 1994, 2006, 2018, 2030], element: '토' },
  { name: '돼지', icon: '🐷', dataKey: '돼지띠', years: [1959, 1971, 1983, 1995, 2007, 2019, 2031], element: '수' },
];

// 완전 랜덤 번호 생성
const generateLuckyNumbers = (): number[] => {
  const result: number[] = [];
  while (result.length < 6) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!result.includes(num)) {
      result.push(num);
    }
  }
  return result.sort((a, b) => a - b);
};

function SajuPage() {
  useSEO({
    title: '띠별 오늘의 운세 로또번호',
    description: '띠별, 생년월일별 오늘의 운세와 행운의 로또번호를 확인하세요. 12간지 띠별 운세 서비스.',
    keywords: '띠별운세, 오늘의운세, 행운의번호, 사주로또, 12간지운세',
    path: '/saju',
  });

  const [inputMode, setInputMode] = useState<InputMode>('zodiac');
  const [selectedZodiac, setSelectedZodiac] = useState<number | null>(null);
  const [birthYear, setBirthYear] = useState<number>(1990);
  const [showFortune, setShowFortune] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[] | null>(null);
  const [fortunesData, setFortunesData] = useState<Record<string, Record<string, FortuneData>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 운세 데이터 동적 로드
  useEffect(() => {
    import('../data/fortunes.json').then((data) => {
      setFortunesData(data.default as Record<string, Record<string, FortuneData>>);
    });
  }, []);

  const getZodiacByYear = (year: number): { zodiac: ZodiacInfo; index: number } => {
    const index = ((year - 1948) % 12 + 12) % 12;
    return { zodiac: zodiacData[index], index };
  };

  const currentZodiac = inputMode === 'zodiac' && selectedZodiac !== null
    ? { zodiac: zodiacData[selectedZodiac], index: selectedZodiac }
    : inputMode === 'birthdate'
      ? getZodiacByYear(birthYear)
      : null;

  // 오늘 날짜로 운세 가져오기
  const getTodayFortune = (): FortuneData | null => {
    if (!fortunesData || !currentZodiac) return null;

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dateKey = `${month}-${day}`;

    const zodiacFortunes = fortunesData[currentZodiac.zodiac.dataKey];
    if (!zodiacFortunes) return null;

    return zodiacFortunes[dateKey] || null;
  };

  const fortune = showFortune ? getTodayFortune() : null;

  const handleShowFortune = () => {
    if (!currentZodiac) return;
    setIsLoading(true);
    // 약간의 딜레이로 로딩 효과
    setTimeout(() => {
      setShowFortune(true);
      setGeneratedNumbers(null);
      setIsLoading(false);
    }, 300);
  };

  const handleGenerateNumbers = () => {
    const numbers = generateLuckyNumbers();
    setGeneratedNumbers(numbers);
  };

  const handleReset = () => {
    setShowFortune(false);
    setGeneratedNumbers(null);
    if (inputMode === 'zodiac') {
      setSelectedZodiac(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const maxBirthYear = currentYear - 19; // 19세 이상만 복권 구매 가능
  const years = Array.from({ length: 80 }, (_, i) => maxBirthYear - 79 + i);

  const renderBall = (num: number, index: number) => (
    <div
      key={index}
      className="saju-ball"
      style={{
        background: getBallColor(num),
        animationDelay: `${index * 0.1}s`
      }}
    >
      {num}
    </div>
  );

  return (
    <div className="saju-page">
      <div className="saju-header">
        <h2>오늘의 운세</h2>
        <p>띠별 운세를 확인하고 행운의 번호를 받아보세요</p>
        <div className="today-date">
          {new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
      </div>

      {!showFortune ? (
        <div className="saju-content">
          <div className="input-mode-selector">
            <button
              className={`mode-toggle-btn ${inputMode === 'zodiac' ? 'active' : ''}`}
              onClick={() => { setInputMode('zodiac'); setSelectedZodiac(null); }}
            >
              띠로 보기
            </button>
            <button
              className={`mode-toggle-btn ${inputMode === 'birthdate' ? 'active' : ''}`}
              onClick={() => setInputMode('birthdate')}
            >
              생년월일로 보기
            </button>
          </div>

          {inputMode === 'zodiac' && (
            <div className="zodiac-section">
              <h3>본인의 띠를 선택하세요</h3>
              <div className="zodiac-grid">
                {zodiacData.map((zodiac, idx) => (
                  <button
                    key={idx}
                    className={`zodiac-btn ${selectedZodiac === idx ? 'selected' : ''}`}
                    onClick={() => setSelectedZodiac(idx)}
                  >
                    <span className="zodiac-emoji">{zodiac.icon}</span>
                    <span className="zodiac-text">{zodiac.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {inputMode === 'birthdate' && (
            <div className="birthdate-section">
              <h3>태어난 연도를 선택하세요</h3>
              <div className="birthdate-inputs">
                <select value={birthYear} onChange={(e) => setBirthYear(Number(e.target.value))}>
                  {years.map(y => (
                    <option key={y} value={y}>{y}년</option>
                  ))}
                </select>
              </div>
              {currentZodiac && (
                <div className="zodiac-info">
                  <span className="zodiac-icon">{currentZodiac.zodiac.icon}</span>
                  <span className="zodiac-name">{birthYear}년생 - {currentZodiac.zodiac.name}띠</span>
                </div>
              )}
            </div>
          )}

          <button
            className="generate-btn"
            onClick={handleShowFortune}
            disabled={(inputMode === 'zodiac' && selectedZodiac === null) || isLoading}
          >
            {isLoading ? '로딩중...' : '운세 보기'}
          </button>
        </div>
      ) : (
        <div className="saju-content">
          {currentZodiac && fortune && (
            <>
              <div className="fortune-card">
                <div className="fortune-zodiac">
                  <span className="fortune-zodiac-icon">{currentZodiac.zodiac.icon}</span>
                  <span className="fortune-zodiac-name">{currentZodiac.zodiac.name}띠</span>
                  <span className="fortune-element">({currentZodiac.zodiac.element})</span>
                </div>

                <div className="fortune-score-section">
                  <div className="fortune-luck-badge" data-luck={fortune.luck}>
                    {fortune.luck}
                  </div>
                  <div className="fortune-score">
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${fortune.score}%` }}></div>
                    </div>
                    <span className="score-text">{fortune.score}점</span>
                  </div>
                </div>

                <div className="fortune-message-box">
                  <p className="fortune-message">{fortune.message}</p>
                  <p className="fortune-advice">💡 {fortune.advice}</p>
                </div>

                <div className="fortune-details">
                  <div className="fortune-detail-item">
                    <span className="detail-label">행운의 색</span>
                    <span className="detail-value">{fortune.luckyColor}</span>
                  </div>
                  <div className="fortune-detail-item">
                    <span className="detail-label">행운의 시간</span>
                    <span className="detail-value">{fortune.luckyTime}</span>
                  </div>
                </div>
              </div>

              <div className="number-section">
                <h3>오늘의 행운 번호</h3>
                <p>오늘 당신을 위한 행운의 번호입니다</p>

                {generatedNumbers ? (
                  <div className="saju-result">
                    <div className="saju-balls">
                      {generatedNumbers.map((num, idx) => renderBall(num, idx))}
                    </div>
                    <button className="regenerate-btn" onClick={handleGenerateNumbers}>
                      다시 뽑기
                    </button>
                  </div>
                ) : (
                  <button className="generate-btn number-btn" onClick={handleGenerateNumbers}>
                    번호 추천받기
                  </button>
                )}
              </div>

              <button className="back-btn" onClick={handleReset}>
                다른 띠로 보기
              </button>
            </>
          )}
        </div>
      )}

      {/* 하단 광고 배너 */}
      <AdBanner slot="1267852110" format="horizontal" />
    </div>
  );
}

export default SajuPage;
