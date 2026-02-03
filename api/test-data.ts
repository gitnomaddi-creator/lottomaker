import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Firebase Admin 초기화
let db: ReturnType<typeof getFirestore>;

try {
  if (!getApps().length) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    if (!privateKey.startsWith('-----BEGIN')) {
      privateKey = Buffer.from(privateKey, 'base64').toString('utf-8');
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      } as any),
    });
  }
  db = getFirestore();
} catch (error) {
  console.error('Firebase init error:', error);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!db) {
    return res.status(500).json({ error: 'Firebase not initialized' });
  }

  const action = req.query.action as string;

  try {
    // 테스트 참여 데이터 추가
    if (action === 'addParticipation') {
      const round = parseInt(req.query.round as string) || 1208;
      const numbers = (req.query.numbers as string)?.split(',').map(Number) || [3, 12, 25, 33, 40, 45];

      await db.collection('participations').add({
        roundNumber: round,
        numbers: numbers.sort((a, b) => a - b),
        createdAt: Timestamp.now(),
        deviceId: 'test_device_' + Date.now(),
      });

      return res.status(200).json({
        message: 'Test participation added',
        round,
        numbers,
      });
    }

    // 테스트 weeklyStats 추가
    if (action === 'addStats') {
      const round = parseInt(req.query.round as string) || 1208;

      // 실제 당첨번호 조회
      const lottoRes = await fetch(`https://smok95.github.io/lotto/results/${round}.json`);
      const lottoData = await lottoRes.json();

      const testStats = {
        roundNumber: round,
        winningNumbers: lottoData.numbers,
        bonusNumber: lottoData.bonus_no,
        totalParticipants: 127,
        results: {
          '1등': 0,
          '2등': 0,
          '3등': 1,
          '4등': 8,
          '5등': 45,
          '낙첨': 73,
        },
        prizes: {
          '1등': lottoData.divisions?.[0]?.prize || 0,
          '2등': lottoData.divisions?.[1]?.prize || 0,
          '3등': lottoData.divisions?.[2]?.prize || 0,
        },
        calculatedAt: Timestamp.now(),
      };

      await db.collection('weeklyStats').doc(String(round)).set(testStats);

      return res.status(200).json({
        message: 'Test stats added',
        stats: testStats,
      });
    }

    // 테스트 데이터 삭제
    if (action === 'cleanup') {
      const round = parseInt(req.query.round as string) || 1208;

      // weeklyStats 삭제
      await db.collection('weeklyStats').doc(String(round)).delete();

      // 테스트 참여 데이터 삭제
      const testDocs = await db
        .collection('participations')
        .where('roundNumber', '==', round)
        .get();

      const batch = db.batch();
      testDocs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return res.status(200).json({
        message: 'Test data cleaned up',
        round,
        deletedParticipations: testDocs.size,
      });
    }

    return res.status(400).json({
      error: 'Invalid action',
      availableActions: ['addParticipation', 'addStats', 'cleanup'],
      examples: [
        '/api/test-data?action=addParticipation&round=1208&numbers=3,12,25,33,40,45',
        '/api/test-data?action=addStats&round=1208',
        '/api/test-data?action=cleanup&round=1208',
      ],
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
