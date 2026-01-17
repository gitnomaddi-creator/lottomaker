/**
 * 로또 데이터 업데이트 스크립트
 * 로컬에서 실행하여 data/lotto-results.json 파일을 업데이트합니다.
 *
 * 사용법: npx ts-node scripts/update-lotto-data.ts
 * 또는: npm run update-data
 */

import * as fs from 'fs';
import * as path from 'path';

interface LottoResult {
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
  totSellamnt: number;
  firstWinamnt: number;
  firstPrzwnerCo: number;
  firstAccumamnt: number;
  returnValue: string;
}

interface DataFile {
  lastUpdated: string;
  results: Record<string, LottoResult>;
}

const DATA_FILE = path.join(__dirname, '..', 'data', 'lotto-results.json');

async function fetchLottoResult(drwNo: number): Promise<LottoResult | null> {
  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`  회차 ${drwNo}: HTTP ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.returnValue === 'success') {
      return data;
    }
    return null;
  } catch (error) {
    console.log(`  회차 ${drwNo}: 에러 발생`);
    return null;
  }
}

function calculateLatestRound(): number {
  const startDate = new Date('2002-12-07');
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks + 1;
}

async function main() {
  console.log('🎱 로또 데이터 업데이트 시작...\n');

  // 기존 데이터 로드
  let dataFile: DataFile = {
    lastUpdated: '',
    results: {},
  };

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      dataFile = JSON.parse(content);
      console.log(`기존 데이터: ${Object.keys(dataFile.results).length}개 회차\n`);
    } catch {
      console.log('기존 데이터 파일 읽기 실패, 새로 생성합니다.\n');
    }
  }

  const latestRound = calculateLatestRound();
  console.log(`최신 회차 (추정): ${latestRound}회\n`);

  // 누락된 회차 확인 및 업데이트
  const existingRounds = new Set(Object.keys(dataFile.results).map(Number));
  const roundsToFetch: number[] = [];

  // 최근 200회차만 확인 (전체는 너무 오래 걸림)
  const startRound = Math.max(1, latestRound - 200);

  for (let round = startRound; round <= latestRound; round++) {
    if (!existingRounds.has(round)) {
      roundsToFetch.push(round);
    }
  }

  if (roundsToFetch.length === 0) {
    console.log('✅ 모든 데이터가 최신 상태입니다!\n');
    return;
  }

  console.log(`업데이트 필요한 회차: ${roundsToFetch.length}개\n`);

  // 데이터 가져오기
  let successCount = 0;
  let failCount = 0;

  for (const round of roundsToFetch) {
    process.stdout.write(`회차 ${round} 가져오는 중... `);

    const result = await fetchLottoResult(round);

    if (result) {
      dataFile.results[String(round)] = result;
      successCount++;
      console.log(`✅ ${result.drwtNo1}-${result.drwtNo2}-${result.drwtNo3}-${result.drwtNo4}-${result.drwtNo5}-${result.drwtNo6}+${result.bnusNo}`);
    } else {
      failCount++;
      console.log(`❌ 실패`);
    }

    // 요청 간격 (너무 빠르면 차단될 수 있음)
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // 데이터 저장
  dataFile.lastUpdated = new Date().toISOString().split('T')[0];

  // 회차 순으로 정렬
  const sortedResults: Record<string, LottoResult> = {};
  Object.keys(dataFile.results)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((round) => {
      sortedResults[String(round)] = dataFile.results[String(round)];
    });
  dataFile.results = sortedResults;

  fs.writeFileSync(DATA_FILE, JSON.stringify(dataFile, null, 2));

  console.log('\n========================================');
  console.log(`✅ 업데이트 완료!`);
  console.log(`   성공: ${successCount}개, 실패: ${failCount}개`);
  console.log(`   총 데이터: ${Object.keys(dataFile.results).length}개 회차`);
  console.log(`   저장 위치: ${DATA_FILE}`);
  console.log('========================================\n');
}

main().catch(console.error);
