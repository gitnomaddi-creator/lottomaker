import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

// AdMob 앱 ID (admob.google.com에서 발급)
// TODO: 실제 AdMob ID로 교체 필요
const ADMOB_CONFIG = {
  android: {
    appId: 'ca-app-pub-1441586915486263~5735662817',
    banner: 'ca-app-pub-1441586915486263/1501339109',
    interstitial: '', // 전면광고 미사용
  },
  ios: {
    appId: 'ca-app-pub-1441586915486263~7762768773',
    banner: 'ca-app-pub-1441586915486263/9439538879',
    interstitial: '', // 전면광고 미사용
  },
  // 테스트용 ID (개발 중 사용)
  test: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  }
};

// 현재 환경 설정
const isTestMode = false; // 실제 광고 모드

const getAdUnitId = (type: 'banner' | 'interstitial') => {
  if (isTestMode) {
    return ADMOB_CONFIG.test[type];
  }

  const platform = Capacitor.getPlatform() as 'android' | 'ios';
  return ADMOB_CONFIG[platform]?.[type] || ADMOB_CONFIG.test[type];
};

// AdMob 초기화
export const initAdMob = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    await AdMob.initialize({
      // 테스트 기기 ID (선택사항)
      // testingDevices: ['YOUR_TEST_DEVICE_ID'],
      initializeForTesting: isTestMode,
    });
    console.log('AdMob initialized');
    return true;
  } catch (error) {
    console.error('AdMob initialization failed:', error);
    return false;
  }
};

// 배너 광고 표시
export const showBannerAd = async (position: 'top' | 'bottom' = 'bottom') => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const options: BannerAdOptions = {
      adId: getAdUnitId('banner'),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    };

    await AdMob.showBanner(options);
    console.log('Banner ad shown');
  } catch (error) {
    console.error('Banner ad failed:', error);
  }
};

// 배너 광고 숨기기
export const hideBannerAd = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.hideBanner();
  } catch (error) {
    console.error('Hide banner failed:', error);
  }
};

// 전면 광고 준비
export const prepareInterstitialAd = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.prepareInterstitial({
      adId: getAdUnitId('interstitial'),
    });
    console.log('Interstitial ad prepared');
  } catch (error) {
    console.error('Prepare interstitial failed:', error);
  }
};

// 전면 광고 표시
export const showInterstitialAd = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await AdMob.showInterstitial();
    console.log('Interstitial ad shown');
  } catch (error) {
    console.error('Show interstitial failed:', error);
  }
};
