import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  ko: {
    translation: {
      // Navigation
      "app.title": "임팩트 오토파일럿",
      "app.subtitle": "한 번의 터치로 지구를 지키다",

      // Dashboard
      "dashboard.welcome": "환영합니다, {{name}}님!",
      "dashboard.stats.totalImpact": "총 임팩트 점수",
      "dashboard.stats.completedMissions": "완료한 미션",
      "dashboard.stats.weeklyProgress": "주간 목표 달성",
      "dashboard.stats.nextMilestone": "다음 마일스톤",

      // Missions
      "missions.title": "이번 주 미션",
      "missions.loading": "미션을 불러오는 중...",
      "missions.start": "미션 시작하기",
      "missions.inProgress": "진행 중...",
      "missions.completed": "완료됨",
      "missions.carbonOffset": "탄소상쇄",
      "missions.donation": "기부",
      "missions.petition": "청원",

      // Progress
      "progress.title": "주간 진행률",
      "progress.complete": "{{percentage}}% 달성",

      // Badges
      "badges.title": "나의 임팩트 배지",
      "badges.level.bronze": "브론즈",
      "badges.level.silver": "실버",
      "badges.level.gold": "골드",
      "badges.level.platinum": "플래티넘",
      "badges.impact": "{{impact}} 임팩트",

      // Work Log
      "worklog.title": "작업 로그",
      "worklog.empty": "아직 작업 로그가 없습니다.\\n미션을 시작하면 여기에 실시간으로 진행 상황이 표시됩니다.",
      "worklog.loading": "로그를 불러오는 중...",

      // Receipts
      "receipt.title": "영수증",
      "receipt.donation": "기부금영수증",
      "receipt.carbonOffset": "탄소상쇄영수증",
      "receipt.number": "영수증번호",
      "receipt.issuedBy": "발급 기관",
      "receipt.issuedAt": "발급 일자",
      "receipt.amount": "금액",
      "receipt.totalAmount": "총 금액",
      "receipt.taxDeductible": "세액공제 가능",
      "receipt.notTaxDeductible": "세액공제 불가능",
      "receipt.download": "PDF 다운로드",

      // Actions
      "actions.confirm": "확인",
      "actions.cancel": "취소",
      "actions.close": "닫기",
      "actions.retry": "다시 시도",

      // Messages
      "messages.loading": "로딩 중...",
      "messages.error": "오류가 발생했습니다",
      "messages.success": "성공했습니다",
      "messages.confirmStart": "이 미션을 시작하시겠습니까?",

      // Telegram
      "telegram.initializing": "텔레그램 앱을 초기화하는 중...",
      "telegram.notAvailable": "텔레그램 WebApp을 사용할 수 없습니다",

      // Time
      "time.justNow": "방금 전",
      "time.minutesAgo": "{{count}}분 전",
      "time.hoursAgo": "{{count}}시간 전",
      "time.daysAgo": "{{count}}일 전",
    }
  },
  en: {
    translation: {
      // Navigation
      "app.title": "Impact Autopilot",
      "app.subtitle": "Save the planet with one touch",

      // Dashboard
      "dashboard.welcome": "Welcome, {{name}}!",
      "dashboard.stats.totalImpact": "Total Impact Score",
      "dashboard.stats.completedMissions": "Completed Missions",
      "dashboard.stats.weeklyProgress": "Weekly Goal Progress",
      "dashboard.stats.nextMilestone": "Next Milestone",

      // Missions
      "missions.title": "This Week's Missions",
      "missions.loading": "Loading missions...",
      "missions.start": "Start Mission",
      "missions.inProgress": "In Progress...",
      "missions.completed": "Completed",
      "missions.carbonOffset": "Carbon Offset",
      "missions.donation": "Donation",
      "missions.petition": "Petition",

      // Progress
      "progress.title": "Weekly Progress",
      "progress.complete": "{{percentage}}% Complete",

      // Badges
      "badges.title": "My Impact Badges",
      "badges.level.bronze": "Bronze",
      "badges.level.silver": "Silver",
      "badges.level.gold": "Gold",
      "badges.level.platinum": "Platinum",
      "badges.impact": "{{impact}} Impact",

      // Work Log
      "worklog.title": "Work Log",
      "worklog.empty": "No work logs yet.\\nStart a mission to see real-time progress here.",
      "worklog.loading": "Loading logs...",

      // Receipts
      "receipt.title": "Receipt",
      "receipt.donation": "Donation Receipt",
      "receipt.carbonOffset": "Carbon Offset Receipt",
      "receipt.number": "Receipt Number",
      "receipt.issuedBy": "Issued By",
      "receipt.issuedAt": "Issue Date",
      "receipt.amount": "Amount",
      "receipt.totalAmount": "Total Amount",
      "receipt.taxDeductible": "Tax Deductible",
      "receipt.notTaxDeductible": "Not Tax Deductible",
      "receipt.download": "Download PDF",

      // Actions
      "actions.confirm": "Confirm",
      "actions.cancel": "Cancel",
      "actions.close": "Close",
      "actions.retry": "Retry",

      // Messages
      "messages.loading": "Loading...",
      "messages.error": "An error occurred",
      "messages.success": "Success",
      "messages.confirmStart": "Start this mission?",

      // Telegram
      "telegram.initializing": "Initializing Telegram app...",
      "telegram.notAvailable": "Telegram WebApp not available",

      // Time
      "time.justNow": "Just now",
      "time.minutesAgo": "{{count}} minutes ago",
      "time.hoursAgo": "{{count}} hours ago",
      "time.daysAgo": "{{count}} days ago",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // Default language
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Detect user language
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
