import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as fs from 'fs';
import * as path from 'path';

interface PrizeInfo {
  rank: number;
  totalPrize: number;
  winnerCount: number;
  prizePerWinner: number;
}

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
  prizes?: PrizeInfo[];
  returnValue: string;
}

interface DataFile {
  lastUpdated: string;
  results: Record<string, LottoResult>;
}

// 정적 데이터 파일에서 로드
function loadStaticData(): DataFile | null {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'lotto-results.json');
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Failed to load static data:', error);
  }
  return null;
}

// 외부 API 시도 (프록시 경유)
async function fetchFromExternal(drwNo: string): Promise<LottoResult | null> {
  const targetUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;

  const proxyUrls = [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://thingproxy.freeboard.io/fetch/${targetUrl}`,
  ];

  for (const url of proxyUrls) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          Accept: 'application/json, text/plain, */*',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) continue;

      const text = await response.text();
      if (!text.startsWith('{')) continue;

      const data = JSON.parse(text);
      if (data.returnValue === 'success') {
        return data;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { drwNo } = req.query;

  if (!drwNo) {
    return res.status(400).json({ error: 'drwNo is required' });
  }

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1시간 캐싱

  const roundNumber = drwNo as string;

  try {
    // 1. 정적 데이터에서 먼저 확인
    const staticData = loadStaticData();
    if (staticData?.results[roundNumber]) {
      console.log(`Serving round ${roundNumber} from static data`);
      return res.status(200).json({
        ...staticData.results[roundNumber],
        returnValue: 'success',
      });
    }

    // 2. 정적 데이터에 없으면 외부 API 시도
    console.log(`Round ${roundNumber} not in static data, trying external API...`);
    const externalResult = await fetchFromExternal(roundNumber);

    if (externalResult) {
      return res.status(200).json(externalResult);
    }

    // 3. 모두 실패시 에러 반환
    return res.status(200).json({
      returnValue: 'fail',
      error: '데이터를 찾을 수 없습니다. 아직 추첨되지 않은 회차이거나 데이터가 업데이트되지 않았습니다.',
      drwNo: parseInt(roundNumber),
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(200).json({
      returnValue: 'fail',
      error: 'Internal server error',
    });
  }
}
