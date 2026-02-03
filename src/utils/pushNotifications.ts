import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

// 푸시 알림 초기화
export const initPushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are not available on web');
    return;
  }

  try {
    // 권한 요청
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // 푸시 알림 등록
      await PushNotifications.register();

      // 리스너 등록
      addPushListeners();
    } else {
      console.log('Push notification permission not granted');
    }
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
};

// 푸시 알림 리스너
const addPushListeners = () => {
  // 등록 성공
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token:', token.value);
    // TODO: 서버에 토큰 저장 (필요시)
  });

  // 등록 실패
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error:', error);
  });

  // 푸시 수신 (앱이 포그라운드에 있을 때)
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification);
    // 포그라운드에서는 로컬 알림으로 표시
    showLocalNotification(
      notification.title || '로또메이커',
      notification.body || ''
    );
  });

  // 푸시 클릭
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push action performed:', notification);
    // TODO: 특정 화면으로 이동 등 액션 처리
  });
};

// 로컬 알림 표시 (포그라운드용)
export const showLocalNotification = async (title: string, body: string) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title,
          body,
          schedule: { at: new Date(Date.now() + 100) },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          iconColor: '#FFD700'
        }
      ]
    });
  } catch (error) {
    console.error('Error showing local notification:', error);
  }
};

// 매주 토요일 추첨 알림 스케줄링
export const scheduleLotteryReminder = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 권한 확인
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') {
      console.log('Local notification permission not granted');
      return;
    }

    // 기존 알림 취소
    await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });

    // 다음 토요일 오후 8시 계산
    const now = new Date();
    const nextSaturday = new Date(now);
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(20, 0, 0, 0);

    // 이미 지났으면 다음 주
    if (nextSaturday <= now) {
      nextSaturday.setDate(nextSaturday.getDate() + 7);
    }

    // 알림 스케줄
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1001,
          title: '오늘은 로또 추첨일!',
          body: '곧 로또 추첨이 시작됩니다. 행운을 빌어요! 🍀',
          schedule: {
            at: nextSaturday,
            repeats: true,
            every: 'week'
          },
          sound: 'default',
          smallIcon: 'ic_stat_icon',
          iconColor: '#FFD700'
        }
      ]
    });

    console.log('Lottery reminder scheduled for:', nextSaturday);
  } catch (error) {
    console.error('Error scheduling lottery reminder:', error);
  }
};

// 알림 설정 확인
export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const status = await PushNotifications.checkPermissions();
    return status.receive === 'granted';
  } catch {
    return false;
  }
};
