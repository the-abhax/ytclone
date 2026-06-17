export default function SearchBar({ value, onChange, resultCount, showCount }) {
  return (
    <div className="search-bar">
      <svg
        className="search-bar__icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
        <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search the archive — title, creator, or tag"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search videos"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
          type="button"
        >
          &times;
        </button>
      )}
      {showCount && (
        <span className="search-bar__count">{resultCount} found</span>
      )}
    </div>
  )
}
