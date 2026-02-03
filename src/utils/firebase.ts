import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyC6pED3rs-8Fh9BXq6b9TJq4uitFVa3PnM",
  authDomain: "lotto-maker-212ee.firebaseapp.com",
  projectId: "lotto-maker-212ee",
  storageBucket: "lotto-maker-212ee.firebasestorage.app",
  messagingSenderId: "307157656265",
  appId: "1:307157656265:web:5035417ff385c20b6f6318",
  measurementId: "G-6MW1PWJGRD"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 현재 회차 계산 (토요일 기준)
export const getCurrentRound = (): number => {
  const startDate = new Date('2002-12-07'); // 1회차 추첨일
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks + 1;
};

// 기기 ID 생성 (익명 식별용)
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('lotto_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('lotto_device_id', deviceId);
  }
  return deviceId;
};

// 참여 데이터 타입
export interface Participation {
  roundNumber: number;
  numbers: number[];
  createdAt: Timestamp;
  deviceId: string;
}

// 주간 통계 타입
export interface WeeklyStats {
  roundNumber: number;
  winningNumbers: number[];
  bonusNumber: number;
  totalParticipants: number;
  results: {
    '1등': number;
    '2등': number;
    '3등': number;
    '4등': number;
    '5등': number;
    '낙첨': number;
  };
  calculatedAt: Timestamp;
}

// 참여 확정 (번호 저장)
export const submitParticipation = async (numbers: number[]): Promise<{ success: boolean; message: string }> => {
  try {
    const deviceId = getDeviceId();
    const roundNumber = getCurrentRound();

    // 이미 참여했는지 확인
    const existingQuery = query(
      collection(db, 'participations'),
      where('deviceId', '==', deviceId),
      where('roundNumber', '==', roundNumber),
      where('numbers', '==', numbers)
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      return { success: false, message: '이미 동일한 번호로 참여하셨습니다.' };
    }

    // 참여 데이터 저장
    await addDoc(collection(db, 'participations'), {
      roundNumber,
      numbers: numbers.sort((a, b) => a - b),
      createdAt: Timestamp.now(),
      deviceId
    });

    return { success: true, message: `${roundNumber}회차 참여 완료!` };
  } catch (error) {
    console.error('참여 저장 실패:', error);
    return { success: false, message: '참여 저장에 실패했습니다.' };
  }
};

// 내 참여 기록 조회
export const getMyParticipations = async (limitCount: number = 10): Promise<Participation[]> => {
  try {
    const deviceId = getDeviceId();
    // 인덱스 없이 단순 쿼리 후 클라이언트에서 정렬
    const q = query(
      collection(db, 'participations'),
      where('deviceId', '==', deviceId)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => doc.data() as Participation);

    // 클라이언트에서 정렬 및 제한
    return results
      .sort((a, b) => b.roundNumber - a.roundNumber)
      .slice(0, limitCount);
  } catch (error) {
    console.error('참여 기록 조회 실패:', error);
    return [];
  }
};

// 특정 회차 전체 통계 조회
export const getWeeklyStats = async (roundNumber: number): Promise<WeeklyStats | null> => {
  try {
    const docRef = doc(db, 'weeklyStats', String(roundNumber));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as WeeklyStats;
    }
    return null;
  } catch (error) {
    console.error('주간 통계 조회 실패:', error);
    return null;
  }
};

// 최근 통계 목록 조회
export const getRecentStats = async (limitCount: number = 5): Promise<WeeklyStats[]> => {
  try {
    const q = query(
      collection(db, 'weeklyStats'),
      orderBy('roundNumber', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as WeeklyStats);
  } catch (error) {
    console.error('최근 통계 조회 실패:', error);
    return [];
  }
};

// 현재 회차 참여자 수 조회 (고유 deviceId 기준)
export const getCurrentRoundParticipantCount = async (): Promise<number> => {
  try {
    const roundNumber = getCurrentRound();
    const q = query(
      collection(db, 'participations'),
      where('roundNumber', '==', roundNumber)
    );

    const snapshot = await getDocs(q);

    // 고유한 deviceId 수를 카운트 (1인 여러 게임 참여 시 1명으로 계산)
    const uniqueDevices = new Set(
      snapshot.docs.map(doc => doc.data().deviceId)
    );
    return uniqueDevices.size;
  } catch (error) {
    console.error('참여자 수 조회 실패:', error);
    return 0;
  }
};

// 당첨 등수 계산
export const calculateRank = (
  myNumbers: number[],
  winningNumbers: number[],
  bonusNumber: number
): string => {
  const matchCount = myNumbers.filter(n => winningNumbers.includes(n)).length;
  const hasBonus = myNumbers.includes(bonusNumber);

  if (matchCount === 6) return '1등';
  if (matchCount === 5 && hasBonus) return '2등';
  if (matchCount === 5) return '3등';
  if (matchCount === 4) return '4등';
  if (matchCount === 3) return '5등';
  return '낙첨';
};

// 내 참여 기록 전체 삭제
export const deleteMyParticipations = async (): Promise<{ success: boolean; count: number }> => {
  try {
    const deviceId = getDeviceId();
    const q = query(
      collection(db, 'participations'),
      where('deviceId', '==', deviceId)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('참여 기록 삭제 실패:', error);
    return { success: false, count: 0 };
  }
};

export { db };
