import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PrizeInfo {
  rank: number;
  prizePerWinner: number;
  winnerCount: number;
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
  prizes: PrizeInfo[];
  returnValue: string;
}

// smok95/lotto GitHub API에서 데이터 가져오기
async function fetchFromGitHubAPI(drwNo: string): Promise<LottoResult | null> {
  const url = `https://smok95.github.io/lotto/results/${drwNo}.json`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // 등수별 당첨금 변환
    const prizes: PrizeInfo[] = (data.divisions || []).map((div: { prize: number; winners: number }, idx: number) => ({
      rank: idx + 1,
      prizePerWinner: div.prize || 0,
      winnerCount: div.winners || 0,
    }));

    // 데이터 변환 (smok95 형식 → 우리 형식)
    const result: LottoResult = {
      drwNo: data.draw_no,
      drwNoDate: data.date ? data.date.split('T')[0] : '',
      drwtNo1: data.numbers[0],
      drwtNo2: data.numbers[1],
      drwtNo3: data.numbers[2],
      drwtNo4: data.numbers[3],
      drwtNo5: data.numbers[4],
      drwtNo6: data.numbers[5],
      bnusNo: data.bonus_no,
      totSellamnt: data.total_sales_amount || 0,
      firstWinamnt: data.divisions?.[0]?.prize || 0,
      firstPrzwnerCo: data.divisions?.[0]?.winners || 0,
      firstAccumamnt: (data.divisions?.[0]?.prize || 0) * (data.divisions?.[0]?.winners || 0),
      prizes,
      returnValue: 'success',
    };

    return result;
  } catch (error) {
    console.error(`Failed to fetch from GitHub API:`, error);
    return null;
  }
}

// 최신 회차 가져오기
async function fetchLatestRound(): Promise<number | null> {
  try {
    const response = await fetch('https://smok95.github.io/lotto/results/latest.json', {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.draw_no;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { drwNo } = req.query;

  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1시간 캐싱

  // drwNo가 없으면 최신 회차
  if (!drwNo || drwNo === 'latest') {
    const latest = await fetchLatestRound();
    if (latest) {
      drwNo = String(latest);
    } else {
      return res.status(200).json({
        returnValue: 'fail',
        error: 'Failed to get latest round',
      });
    }
  }

  try {
    console.log(`Fetching lottery data for round ${drwNo}`);

    const result = await fetchFromGitHubAPI(drwNo as string);

    if (result) {
      return res.status(200).json(result);
    }

    // 실패시
    return res.status(200).json({
      returnValue: 'fail',
      error: '해당 회차 데이터를 찾을 수 없습니다.',
      drwNo: parseInt(drwNo as string),
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(200).json({
      returnValue: 'fail',
      error: 'Internal server error',
    });
  }
}
