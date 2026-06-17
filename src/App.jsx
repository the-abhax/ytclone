import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Home from './pages/Home'
import Watch from './pages/Watch'
import { ThemeProvider } from './ThemeContext'
import './App.css'

export default function App() {
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [resultCount, setResultCount] = useState(null)

  return (
    <ThemeProvider>
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <button
            className="app-shell__overlay"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="app-shell__main">
          <Topbar
            query={query}
            onQueryChange={setQuery}
            resultCount={resultCount}
            showCount={query.trim().length > 0 && resultCount !== null}
            onMenuClick={() => setSidebarOpen((o) => !o)}
          />

          <main className="app-shell__content">
            <Routes>
              <Route path="/" element={<Home query={query} onResultCount={setResultCount} />} />
              <Route
                path="/category/:categoryId"
                element={<Home query={query} onResultCount={setResultCount} />}
              />
              <Route path="/watch/:videoId" element={<Watch />} />
              <Route
                path="*"
                element={
                  <div className="page">
                    <div className="video-grid__empty">
                      <p className="video-grid__empty-title">Page not found.</p>
                      <p className="video-grid__empty-sub">
                        That section of the archive doesn&rsquo;t exist.
                      </p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
