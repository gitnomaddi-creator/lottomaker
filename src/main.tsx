import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initAdMob, showBannerAd } from './utils/admob'
// import { initPushNotifications, scheduleLotteryReminder } from './utils/pushNotifications'

const container = document.getElementById('root')!;

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// pre-rendering 지원
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}

// prerenderer에게 렌더링 완료 알림
setTimeout(() => {
  document.dispatchEvent(new Event('render-ready'));
}, 500);

// 푸시 알림 초기화 (Firebase 설정 후 활성화)
// TODO: Firebase 설정 후 주석 해제
// initPushNotifications().then(() => {
//   scheduleLotteryReminder();
// });

// AdMob 초기화 (네이티브 앱에서만 실행)
initAdMob().then((success) => {
  if (success) {
    showBannerAd('bottom');
  }
}).catch((error) => {
  console.error('AdMob setup failed:', error);
});
