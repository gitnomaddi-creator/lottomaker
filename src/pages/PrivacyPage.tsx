import { useSEO } from '../hooks/useSEO';
import './LegalPage.css';

function PrivacyPage() {
  useSEO({
    title: '개인정보처리방침',
    description: '로또메이커 개인정보처리방침 안내.',
    path: '/privacy',
  });

  return (
    <div className="legal-page">
      <div className="legal-header">
        <h2>개인정보처리방침</h2>
        <p>최종 수정일: 2026년 1월</p>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h3>1. 개인정보의 처리 목적</h3>
          <p>
            로또메이커(이하 "서비스")는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
            이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul>
            <li>서비스 제공 및 운영</li>
            <li>서비스 이용 통계 분석</li>
            <li>서비스 개선 및 신규 서비스 개발</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>2. 수집하는 개인정보 항목</h3>
          <p>본 서비스는 별도의 회원가입 없이 이용 가능하며, 다음과 같은 정보를 자동으로 수집할 수 있습니다:</p>
          <ul>
            <li>접속 기록 (IP 주소, 접속 시간)</li>
            <li>기기 정보 (브라우저 종류, 운영체제)</li>
            <li>서비스 이용 기록</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>3. 개인정보의 보유 및 이용 기간</h3>
          <p>
            수집된 정보는 서비스 이용 기간 동안 보유되며,
            이용자의 요청이 있을 경우 즉시 파기합니다.
            자동 수집되는 정보는 수집일로부터 1년간 보관 후 파기됩니다.
          </p>
        </section>

        <section className="legal-section">
          <h3>4. 개인정보의 제3자 제공</h3>
          <p>
            본 서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다:
          </p>
          <ul>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>5. 쿠키(Cookie)의 사용</h3>
          <p>
            본 서비스는 이용자에게 더 나은 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다.
            쿠키는 웹사이트 운영에 이용되는 서버가 이용자의 브라우저에 보내는 작은 텍스트 파일입니다.
          </p>
          <p>
            이용자는 쿠키 설치에 대한 선택권을 가지고 있으며,
            브라우저 설정을 통해 쿠키를 허용하거나 거부할 수 있습니다.
          </p>
        </section>

        <section className="legal-section">
          <h3>6. 광고 서비스</h3>
          <p>
            본 서비스는 Google AdSense를 통해 광고를 게재할 수 있습니다.
            Google은 광고 제공을 위해 쿠키를 사용할 수 있으며,
            이에 대한 자세한 내용은 Google의 개인정보처리방침을 참조하시기 바랍니다.
          </p>
        </section>

        <section className="legal-section">
          <h3>7. 개인정보 보호책임자</h3>
          <p>
            개인정보 처리에 관한 업무를 총괄해서 책임지고,
            개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제를 위하여
            아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="contact-info">
            <p>이메일: contact@lottomaker.com</p>
          </div>
        </section>

        <section className="legal-section">
          <h3>8. 개인정보처리방침 변경</h3>
          <p>
            이 개인정보처리방침은 시행일로부터 적용되며,
            법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는
            변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage;
