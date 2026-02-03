# 로또메이커 프로젝트 컨텍스트

> 이 파일은 Claude가 프로젝트를 빠르게 파악할 수 있도록 작성되었습니다.

## 프로젝트 개요

- **이름**: 로또메이커 (LottoMaker)
- **플랫폼**: Android/iOS 네이티브 앱 (Capacitor)
- **GitHub**: https://github.com/nomadwebapp-arch/lotto-maker
- **기술 스택**: React 19 + TypeScript + Vite 7 + Capacitor
- **백엔드**: Firebase Firestore
- **광고**: AdMob (네이티브), AdSense (웹 - 비활성)

---

## 2026-02-03 진행 상황

### ✅ 완료된 작업

#### 1. Capacitor 앱 전환
- Android/iOS 네이티브 앱 설정 완료
- `capacitor.config.ts` 생성
- Android Studio 빌드 성공

#### 2. QR 스캔 기능
- `@capacitor-mlkit/barcode-scanning` 연동
- `src/components/QRScanner.tsx` - QR 스캔 컴포넌트
- `src/pages/ScanPage.tsx` - QR 스캔 페이지
- 카메라 권한 설정 완료

#### 3. AdMob 광고 설정
- `@capacitor-community/admob` 설치
- `src/utils/admob.ts` - AdMob 초기화/배너 함수
- AndroidManifest.xml에 테스트 App ID 추가
- 네이티브 앱에서 AdSense 숨김 처리

#### 4. Firebase 참여 확정 기능 ⭐ NEW
- Firebase 프로젝트: `lotto-maker-212ee`
- `src/utils/firebase.ts` - Firestore 연동
- 기능:
  - 번호 생성 후 "참여하기" 버튼으로 Firebase 저장
  - 기기별 익명 ID로 중복 방지
  - 회차별 참여자 수 집계
  - 내 참여 기록 조회/삭제

#### 5. 앱 성적표 페이지 ⭐ NEW
- `src/pages/MyRecordPage.tsx` - 성적표 페이지
- 기능:
  - 현재 회차 참여 현황
  - 전체 앱 성적 (당첨 통계)
  - 내 참여 기록 + 당첨 여부 표시
  - 기록 삭제 기능

#### 6. API 네이티브 대응
- ResultsPage, StatsPage, ScanPage에 API_BASE 추가
- 네이티브 앱에서 전체 URL 사용

### 🔄 진행 중 / 남은 작업

#### 1. 당첨 계산 Cron Job
- `api/calculate-results.ts` 생성 필요
- 매주 일요일 자동 실행
- 동행복권 API → 당첨번호 조회 → 참여자 당첨 계산

#### 2. 카카오톡 공유 확인
- 네이티브 앱에서 카카오 공유 동작 확인 필요

#### 3. 푸시 알림
- Firebase Cloud Messaging 설정 필요
- 현재 비활성 상태

#### 4. 앱 스토어 출시
- Google Play Store ($25)
- Apple App Store ($99/년)
- 실제 AdMob ID 교체

---

## 주요 기능

1. **번호 생성기** (6가지 방식)
   - 한방생성, 로또머신, 룰렛, 슬롯, 가챠, 복권 긁기

2. **정보 페이지**
   - 추첨결과 조회 (/results) - API 연동
   - 통계 분석 (/stats)
   - 오늘의 운세 (/saju)
   - 로또 소개 (/about)
   - FAQ (/faq) - 17개 Q&A

3. **법적 페이지**
   - 개인정보처리방침 (/privacy)
   - 이용약관 (/terms)
   - 문의하기 (/contact)

## 디렉토리 구조

```
LottoMaker/
├── src/
│   ├── components/     # 재사용 컴포넌트 (QuickGenerator, LotteryMachine 등)
│   ├── pages/          # 페이지 컴포넌트
│   ├── data/           # 게임 데이터, 운세 데이터 (fortunes.json)
│   ├── types/          # TypeScript 타입 정의
│   ├── utils/          # 유틸리티 함수
│   └── hooks/          # 커스텀 훅 (useSEO)
├── api/                # Vercel 서버리스 API (lotto.ts)
├── .github/workflows/  # GitHub Actions (프리렌더링 빌드)
└── public/             # 정적 파일
```

## 애드센스 승인 히스토리

### 거절 이력
- **1차 거절**: "게시자 콘텐츠가 없는 화면에 Google 게재 광고"
- **2차 거절**: 동일 사유

### 해결 작업 (2026-02-02)

1. **메인 페이지 콘텐츠 추가** (`GeneratorPage.tsx`)
   - "로또메이커란?" 섹션
   - "이용 방법" 섹션 (4단계 가이드)
   - "당첨 확률" 섹션 (확률 테이블)
   - "자주 묻는 질문" 섹션 (5개 Q&A)

2. **프리렌더링 적용**
   - `@prerenderer/rollup-plugin` + `puppeteer` 사용
   - GitHub Actions에서 빌드 → Vercel 배포
   - HTML 소스에 콘텐츠가 직접 포함됨 (SEO 최적화)

### 현재 상태
- ✅ 9개 페이지 모두 충분한 콘텐츠
- ✅ 프리렌더링 적용 완료
- ✅ 메타 태그, 구조화된 데이터 완비
- ⏳ 애드센스 재신청 대기 중

## 배포 파이프라인

```
GitHub Push → GitHub Actions → 프리렌더링 빌드 → Vercel 배포
```

### GitHub Secrets 설정됨
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`: team_4EFZtlVoqCUhzl2xLVjIHRPN
- `VERCEL_PROJECT_ID`: prj_83fJYm7GOHUvLQXeqeR0juAnLc0L

### Vercel 설정
- 자동 빌드 비활성화 권장 (GitHub Actions와 중복 방지)
- Settings → Git → Ignored Build Step에 `exit 0` 입력

## 주요 파일

| 파일 | 설명 |
|-----|------|
| `vite.config.ts` | 프리렌더링 플러그인 설정 |
| `src/main.tsx` | hydration 지원 (프리렌더링용) |
| `src/pages/GeneratorPage.tsx` | 메인 페이지 + 콘텐츠 섹션 |
| `.github/workflows/deploy.yml` | CI/CD 워크플로우 |
| `api/lotto.ts` | 동행복권 API 프록시 |

## 자주 하는 작업

### 로컬 개발
```bash
npm run dev
```

### 빌드 (프리렌더링 포함)
```bash
npm run build
```

### 배포
```bash
git push origin main  # GitHub Actions 자동 실행
```

## 참고 문서

- `ADSENSE_STATUS.md` - 애드센스 승인 체크리스트
- `/Users/di-nomad/Documents/lotto-maker_adsense_guide.pdf` - 애드센스 가이드

---

*마지막 업데이트: 2026-02-02*
