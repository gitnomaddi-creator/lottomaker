import './LegalPage.css';

function ContactPage() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <h2>문의하기</h2>
        <p>궁금한 점이 있으시면 연락주세요</p>
      </div>

      <div className="legal-content">
        <section className="legal-section contact-section">
          <h3>연락처 정보</h3>
          <div className="contact-card">
            <div className="contact-item">
              <span className="contact-icon">@</span>
              <div className="contact-detail">
                <strong>이메일</strong>
                <p>contact@lottomaker.com</p>
              </div>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h3>문의 안내</h3>
          <ul>
            <li>서비스 이용 관련 문의</li>
            <li>오류 및 버그 신고</li>
            <li>기능 개선 제안</li>
            <li>기타 문의사항</li>
          </ul>
          <p className="response-note">
            문의 주시면 영업일 기준 1~3일 이내에 답변 드리겠습니다.
          </p>
        </section>

        <section className="legal-section">
          <h3>자주 묻는 질문</h3>

          <div className="faq-item">
            <div className="faq-question">Q. 생성된 번호로 당첨이 보장되나요?</div>
            <div className="faq-answer">
              A. 아니요. 본 서비스에서 생성되는 번호는 완전히 무작위로 생성되며,
              당첨을 보장하지 않습니다. 오락 및 참고 목적으로만 이용해 주세요.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">Q. 로또 구매는 어디서 하나요?</div>
            <div className="faq-answer">
              A. 로또 6/45는 전국 로또 판매점 또는 동행복권 공식 웹사이트(dhlottery.co.kr)에서
              구매하실 수 있습니다. 인터넷 구매는 회원가입 후 예치금 충전이 필요합니다.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">Q. 복권 구매 나이 제한이 있나요?</div>
            <div className="faq-answer">
              A. 네. 대한민국 법률에 따라 만 19세 이상만 복권을 구매할 수 있습니다.
            </div>
          </div>

          <div className="faq-item">
            <div className="faq-question">Q. 당첨금은 어떻게 수령하나요?</div>
            <div className="faq-answer">
              A. 5등(5천원)과 4등(5만원)은 전국 로또 판매점에서 수령 가능합니다.
              1~3등은 신분증과 당첨복권을 지참하여 NH농협은행 본점에서 수령하셔야 합니다.
              지급 기한은 지급개시일로부터 1년입니다.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContactPage;
