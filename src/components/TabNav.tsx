import { NavLink } from 'react-router-dom';
import './TabNav.css';

interface TabInfo {
  path: string;
  label: string;
}

const tabs: TabInfo[] = [
  { path: '/', label: '번호생성기' },
  { path: '/saju', label: '오늘의 운세' },
  { path: '/about', label: '로또소개' },
  { path: '/results', label: '추첨결과' },
  { path: '/stats', label: '통계' },
];

function TabNav() {
  return (
    <nav className="tab-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default TabNav;
