import SearchBar from './SearchBar'
import { useTheme } from '../ThemeContext'

export default function Topbar({ query, onQueryChange, resultCount, showCount, onMenuClick }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="topbar">
      <button
        className="topbar__menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <SearchBar
        value={query}
        onChange={onQueryChange}
        resultCount={resultCount}
        showCount={showCount}
      />

      <button
        className="topbar__theme-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        type="button"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
            <line x1="12" y1="1.5" x2="12" y2="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="4.2" y1="4.2" x2="6" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="18" y1="18" x2="19.8" y2="19.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="1.5" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="20" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="4.2" y1="19.8" x2="6" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="18" y1="6" x2="19.8" y2="4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 13.2A8.5 8.5 0 1 1 10.8 4a6.8 6.8 0 0 0 9.2 9.2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </header>
  )
}
