import './LegalPage.css';

function TermsPage() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <h2>이용약관</h2>
        <p>최종 수정일: 2026년 1월</p>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h3>제1조 (목적)</h3>
          <p>
            이 약관은 로또메이커(이하 "서비스")가 제공하는 로또 번호 생성 및 정보 서비스의
            이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="legal-section">
          <h3>제2조 (서비스의 내용)</h3>
          <p>본 서비스는 다음과 같은 기능을 제공합니다:</p>
          <ul>
            <li>로또 6/45 번호 무작위 생성</li>
            <li>띠별 운세 및 행운 번호 추천</li>
            <li>로또 당첨 결과 조회</li>
            <li>당첨 번호 통계 분석</li>
            <li>로또 관련 정보 제공</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>제3조 (면책조항)</h3>
          <div className="warning-box">
            <p><strong>중요:</strong> 본 서비스는 오락 및 참고 목적으로만 제공됩니다.</p>
          </div>
          <ul>
            <li>본 서비스에서 생성된 번호는 무작위로 생성되며, 당첨을 보장하지 않습니다.</li>
            <li>서비스 이용으로 인한 복권 구매 결과에 대해 어떠한 책임도 지지 않습니다.</li>
            <li>제공되는 운세 및 행운 번호는 재미를 위한 것으로, 과학적 근거가 없습니다.</li>
            <li>당첨 결과 및 통계 정보는 동행복권에서 제공하는 데이터를 기반으로 하며,
                정확성을 완전히 보장하지 않습니다.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>제4조 (이용 제한)</h3>
          <p>본 서비스는 대한민국 법률에 따라 만 19세 이상만 복권을 구매할 수 있습니다.</p>
          <ul>
            <li>만 19세 미만의 미성년자는 복권을 구매할 수 없습니다.</li>
            <li>본 서비스는 복권 구매를 권장하거나 조장하지 않습니다.</li>
            <li>과도한 복권 구매는 경제적 손실을 초래할 수 있으니 주의하시기 바랍니다.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>제5조 (저작권)</h3>
          <p>
            본 서비스가 제공하는 콘텐츠(디자인, 텍스트, 이미지, 소스코드 등)에 대한
            저작권 및 기타 지적재산권은 서비스 제공자에게 있습니다.
          </p>
          <p>
            이용자는 서비스를 이용함으로써 얻은 정보를 서비스 제공자의 사전 승낙 없이
            복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나
            제3자에게 이용하게 할 수 없습니다.
          </p>
        </section>

        <section className="legal-section">
          <h3>제6조 (서비스 변경 및 중단)</h3>
          <p>
            서비스 제공자는 다음의 경우 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다:
          </p>
          <ul>
            <li>시스템 정기점검, 증설 및 교체 등</li>
            <li>기술적 장애 발생</li>
            <li>천재지변, 국가비상사태 등 불가항력적 사유</li>
            <li>서비스 운영상 필요한 경우</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>제7조 (책임의 한계)</h3>
          <ul>
            <li>서비스 제공자는 무료로 제공하는 서비스의 이용과 관련하여
                이용자에게 발생한 손해에 대해 책임을 지지 않습니다.</li>
            <li>서비스 제공자는 이용자가 서비스를 이용하여 기대하는 수익을
                얻지 못한 것에 대해 책임을 지지 않습니다.</li>
            <li>서비스 제공자는 이용자가 서비스에 게재한 정보, 자료, 사실의
                신뢰도, 정확성 등 내용에 관하여 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h3>제8조 (분쟁 해결)</h3>
          <p>
            본 약관 및 서비스 이용과 관련하여 분쟁이 발생한 경우,
            당사자 간의 합의에 의해 원만히 해결하도록 노력합니다.
            합의가 이루어지지 않을 경우, 대한민국 법률에 따라 관할 법원에서 해결합니다.
          </p>
        </section>

        <section className="legal-section">
          <h3>제9조 (약관의 변경)</h3>
          <p>
            서비스 제공자는 필요한 경우 약관을 변경할 수 있으며,
            변경된 약관은 서비스 내 공지사항을 통해 공지합니다.
            변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.
          </p>
        </section>

        <section className="legal-section highlight">
          <h3>부칙</h3>
          <p>본 약관은 2026년 1월 1일부터 시행됩니다.</p>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;
