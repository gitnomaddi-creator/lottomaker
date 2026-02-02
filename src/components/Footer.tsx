import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/privacy">개인정보처리방침</Link>
          <span className="divider">|</span>
          <Link to="/terms">이용약관</Link>
          <span className="divider">|</span>
          <Link to="/contact">문의하기</Link>
          <span className="divider">|</span>
          <Link to="/faq">FAQ</Link>
        </div>
        <div className="footer-info">
          <p>본 서비스는 오락 목적으로만 제공되며, 당첨을 보장하지 않습니다.</p>
          <p className="copyright">&copy; {currentYear} 로또메이커. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
