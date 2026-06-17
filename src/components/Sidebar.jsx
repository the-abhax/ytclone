import { NavLink } from 'react-router-dom'
import { categories } from '../data/categories'

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__mark">R</span>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">Reel Archive</span>
          <span className="sidebar__brand-sub">vol. 04</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Categories">
        <span className="sidebar__heading">Browse</span>
        <ul className="sidebar__list">
          {categories.map((cat) => (
            <li key={cat.id}>
              <NavLink
                to={cat.id === 'all' ? '/' : `/category/${cat.id}`}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                onClick={onNavigate}
                end={cat.id === 'all'}
              >
                {cat.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__footer-line">Live via YouTube Data API</span>
        <span className="sidebar__footer-line">Results update on search</span>
      </div>
    </aside>
  )
}
