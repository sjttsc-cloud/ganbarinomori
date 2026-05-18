import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Timer } from './pages/Timer';
import { Stamp } from './pages/Stamp';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { ForestGallery } from './pages/ForestGallery';
import { useStore } from './store/useStore';

function App() {
  const isFirstLaunch = useStore(state => state.isFirstLaunch);

  return (
    <BrowserRouter>
      <div className="min-h-screen max-w-md mx-auto bg-background text-text-main overflow-hidden relative shadow-xl">
        <Routes>
          {/* 初回起動時は設定画面（パスワード設定）へ強制遷移 */}
          <Route path="/" element={isFirstLaunch ? <Navigate to="/settings" replace /> : <Home />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/stamp" element={<Stamp />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/forest-gallery" element={<ForestGallery />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
