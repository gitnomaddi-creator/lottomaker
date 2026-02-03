import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Firebase Admin 초기화
let db: ReturnType<typeof getFirestore>;
let initError: string | null = null;

try {
  if (!getApps().length) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

    // Base64로 인코딩된 경우 먼저 디코딩
    if (!privateKey.startsWith('-----BEGIN')) {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
    }

    // \n 문자열을 실제 줄바꿈으로 변환
    privateKey = privateKey.replace(/\\n/g, '\n');

    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    initializeApp({
      credential: cert(serviceAccount as any),
    });
  }
  db = getFirestore();
} catch (error) {
  initError = error instanceof Error ? error.message : 'Unknown error';
  console.error('Firebase init error:', error);
}

// 당첨 등수 계산
function calculateRank(myNumbers: number[], winningNumbers: number[], bonusNumber: number): string {
  const matchCount = myNumbers.filter(n => winningNumbers.includes(n)).length;
  const hasBonus = myNumbers.includes(bonusNumber);

  if (matchCount === 6) return '1등';
  if (matchCount === 5 && hasBonus) return '2등';
  if (matchCount === 5) return '3등';
  if (matchCount === 4) return '4등';
  if (matchCount === 3) return '5등';
  return '낙첨';
}

// 당첨번호 및 당첨금 조회
async function fetchWinningNumbers(round: number): Promise<{
  numbers: number[];
  bonus: number;
  prizes: { '1등': number; '2등': number; '3등': number };
} | null> {
  try {
    const response = await fetch(`https://smok95.github.io/lotto/results/${round}.json`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      numbers: data.numbers,
      bonus: data.bonus_no,
      prizes: {
        '1등': data.divisions?.[0]?.prize || 0,
        '2등': data.divisions?.[1]?.prize || 0,
        '3등': data.divisions?.[2]?.prize || 0,
      },
    };
  } catch {
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
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  // Firebase 초기화 확인
  if (!db) {
    return res.status(500).json({
      error: 'Firebase not initialized',
      initError: initError,
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
    });
  }

  try {
    // 회차 파라미터 (없으면 최신 회차)
    let round = req.query.round ? parseInt(req.query.round as string) : null;

    if (!round) {
      round = await fetchLatestRound();
      if (!round) {
        return res.status(500).json({ error: 'Failed to get latest round' });
      }
    }

    console.log(`Calculating results for round ${round}`);

    // 이미 계산된 결과가 있는지 확인
    const existingDoc = await db.collection('weeklyStats').doc(String(round)).get();
    if (existingDoc.exists) {
      return res.status(200).json({
        message: 'Already calculated',
        round,
        stats: existingDoc.data(),
      });
    }

    // 당첨번호 조회
    const winningData = await fetchWinningNumbers(round);
    if (!winningData) {
      return res.status(500).json({ error: 'Failed to fetch winning numbers', round });
    }

    console.log(`Winning numbers: ${winningData.numbers.join(', ')} + ${winningData.bonus}`);

    // 해당 회차 참여 데이터 조회
    const participationsSnapshot = await db
      .collection('participations')
      .where('roundNumber', '==', round)
      .get();

    if (participationsSnapshot.empty) {
      return res.status(200).json({
        message: 'No participations for this round',
        round,
        totalParticipants: 0,
      });
    }

    // 당첨 결과 집계
    const results: Record<string, number> = {
      '1등': 0,
      '2등': 0,
      '3등': 0,
      '4등': 0,
      '5등': 0,
      '낙첨': 0,
    };

    // 고유한 deviceId 수집 (참여자 수 계산용)
    const uniqueDevices = new Set<string>();

    participationsSnapshot.forEach((doc) => {
      const data = doc.data();
      const rank = calculateRank(data.numbers, winningData.numbers, winningData.bonus);
      results[rank]++;
      uniqueDevices.add(data.deviceId);
    });

    // 고유 deviceId 기준 참여자 수 (1인 여러 게임 = 1명)
    const totalParticipants = uniqueDevices.size;

    console.log(`Total participants: ${totalParticipants}`);
    console.log(`Results:`, results);

    // weeklyStats에 저장
    const statsData = {
      roundNumber: round,
      winningNumbers: winningData.numbers,
      bonusNumber: winningData.bonus,
      totalParticipants,
      results,
      prizes: winningData.prizes,
      calculatedAt: Timestamp.now(),
    };

    await db.collection('weeklyStats').doc(String(round)).set(statsData);

    return res.status(200).json({
      message: 'Calculation complete',
      round,
      stats: statsData,
    });

  } catch (error) {
    console.error('Calculate results error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
