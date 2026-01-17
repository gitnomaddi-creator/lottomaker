/**
 * 로또 데이터 크롤링 스크립트
 * GitHub Actions에서 자동 실행됩니다.
 *
 * 사용법: node scripts/scrape-lotto.mjs [가져올회차수]
 * 예시: node scripts/scrape-lotto.mjs 10
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'lotto-results.json');

// 최신 회차 계산
function calculateLatestRound() {
  const startDate = new Date('2002-12-07');
  const today = new Date();
  // 토요일 저녁 9시 이후에만 해당 주 회차 포함
  const kstNow = new Date(today.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
  const dayOfWeek = kstNow.getDay();
  const hour = kstNow.getHours();

  let adjustedDate = kstNow;
  // 토요일 21시 이전이면 이전 회차까지만
  if (dayOfWeek === 6 && hour < 21) {
    adjustedDate = new Date(kstNow.getTime() - (7 * 24 * 60 * 60 * 1000));
  } else if (dayOfWeek < 6) {
    // 토요일 이전이면 지난 토요일 기준
    const daysToSubtract = dayOfWeek + 1;
    adjustedDate = new Date(kstNow.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
  }

  const diffTime = adjustedDate.getTime() - startDate.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks + 1;
}

// HTML 페이지에서 당첨번호 크롤링
async function scrapeLottoResult(drwNo) {
  const url = `https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${drwNo}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      console.log(`  HTTP 오류: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // 당첨번호 추출 (ball_645 클래스)
    // 패턴: <span class="ball_645 lrg ball1">10</span>
    const ballRegex = /<span\s+class="[^"]*ball_645[^"]*"[^>]*>(\d+)<\/span>/gi;
    const balls = [];
    let match;

    while ((match = ballRegex.exec(html)) !== null) {
      balls.push(parseInt(match[1]));
    }

    // 번호가 부족하면 다른 패턴 시도
    if (balls.length < 7) {
      // win_result 영역에서 숫자 추출
      const winResultMatch = html.match(/class="win_result"[\s\S]*?<\/div>/);
      if (winResultMatch) {
        const numRegex = /<span[^>]*>(\d{1,2})<\/span>/g;
        let numMatch;
        while ((numMatch = numRegex.exec(winResultMatch[0])) !== null) {
          const num = parseInt(numMatch[1]);
          if (num >= 1 && num <= 45 && !balls.includes(num)) {
            balls.push(num);
          }
        }
      }
    }

    // 보너스 번호 추출 (bonus_ball 또는 별도 영역)
    let bonusNo = balls[6]; // 기본적으로 7번째 번호가 보너스
    const bonusMatch = html.match(/보너스[^0-9]*(\d{1,2})/);
    if (bonusMatch) {
      bonusNo = parseInt(bonusMatch[1]);
    }

    if (balls.length < 7) {
      console.log(`  번호 부족: ${balls.length}개`);
      return null;
    }

    // 추첨일 추출
    const dateMatch = html.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    let drwNoDate = '';
    if (dateMatch) {
      drwNoDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    }

    // 총 판매금액 추출
    const salesMatch = html.match(/총\s*판매금액[^0-9]*([0-9,]+)\s*원/i);
    const totSellamnt = salesMatch ? parseInt(salesMatch[1].replace(/,/g, '')) : 0;

    // 1등 당첨금/당첨자 추출
    let firstWinamnt = 0;
    let firstPrzwnerCo = 0;

    // 테이블에서 1등 정보 추출
    const firstPrizeMatch = html.match(/1등[\s\S]*?([0-9,]+)\s*원[\s\S]*?(\d+)\s*명/);
    if (firstPrizeMatch) {
      firstWinamnt = parseInt(firstPrizeMatch[1].replace(/,/g, ''));
      firstPrzwnerCo = parseInt(firstPrizeMatch[2]);
    }

    return {
      drwNo: parseInt(drwNo),
      drwNoDate,
      drwtNo1: balls[0],
      drwtNo2: balls[1],
      drwtNo3: balls[2],
      drwtNo4: balls[3],
      drwtNo5: balls[4],
      drwtNo6: balls[5],
      bnusNo: bonusNo,
      totSellamnt,
      firstWinamnt,
      firstPrzwnerCo,
      firstAccumamnt: firstWinamnt * firstPrzwnerCo,
      returnValue: 'success',
    };
  } catch (error) {
    console.log(`  에러: ${error.message}`);
    return null;
  }
}

// JSON API에서 가져오기 (백업용)
async function fetchFromAPI(drwNo) {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return null;

    const text = await response.text();
    if (!text.startsWith('{')) return null;

    const data = JSON.parse(text);
    if (data.returnValue === 'success') {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const roundsToFetch = parseInt(process.argv[2]) || 10;

  console.log('🎱 로또 데이터 크롤링 시작\n');
  console.log(`수집 대상: 최근 ${roundsToFetch}회차\n`);

  // 기존 데이터 로드
  let dataFile = { lastUpdated: '', results: {} };

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      dataFile = JSON.parse(content);
      console.log(`기존 데이터: ${Object.keys(dataFile.results).length}개 회차\n`);
    } catch {
      console.log('기존 파일 읽기 실패, 새로 생성\n');
    }
  }

  const latestRound = calculateLatestRound();
  console.log(`최신 회차: ${latestRound}회\n`);

  // 최근 N회차 수집
  let newCount = 0;
  let updateCount = 0;

  for (let i = 0; i < roundsToFetch; i++) {
    const round = latestRound - i;
    if (round < 1) break;

    const existing = dataFile.results[String(round)];

    // 이미 있고 완전한 데이터면 스킵
    if (existing && existing.drwtNo1 && existing.drwNoDate) {
      continue;
    }

    process.stdout.write(`${round}회차 수집 중... `);

    // HTML 크롤링 시도
    let result = await scrapeLottoResult(round);

    // 실패시 JSON API 시도
    if (!result) {
      console.log('HTML 실패, JSON 시도...');
      result = await fetchFromAPI(round);
    }

    if (result) {
      dataFile.results[String(round)] = result;
      if (existing) {
        updateCount++;
        console.log(`✅ 업데이트 (${result.drwtNo1}-${result.drwtNo2}-${result.drwtNo3}-${result.drwtNo4}-${result.drwtNo5}-${result.drwtNo6}+${result.bnusNo})`);
      } else {
        newCount++;
        console.log(`✅ 신규 (${result.drwtNo1}-${result.drwtNo2}-${result.drwtNo3}-${result.drwtNo4}-${result.drwtNo5}-${result.drwtNo6}+${result.bnusNo})`);
      }
    } else {
      console.log('❌ 실패');
    }

    // 요청 간격 (부하 방지)
    await new Promise(r => setTimeout(r, 500));
  }

  // 데이터 저장
  dataFile.lastUpdated = new Date().toISOString().split('T')[0];

  // 회차 순 정렬
  const sortedResults = {};
  Object.keys(dataFile.results)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach(round => {
      sortedResults[String(round)] = dataFile.results[String(round)];
    });
  dataFile.results = sortedResults;

  fs.writeFileSync(DATA_FILE, JSON.stringify(dataFile, null, 2));

  console.log('\n========================================');
  console.log(`✅ 크롤링 완료!`);
  console.log(`   신규: ${newCount}개, 업데이트: ${updateCount}개`);
  console.log(`   총 데이터: ${Object.keys(dataFile.results).length}개 회차`);
  console.log('========================================\n');
}

main().catch(console.error);
