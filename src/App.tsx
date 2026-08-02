import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from './storage/settings';
import { ChordDrillPage } from './pages/ChordDrillPage';
import { HomePage } from './pages/HomePage';
import { InKeyChordsPage } from './pages/InKeyChordsPage';
import { InKeyNotesPage } from './pages/InKeyNotesPage';
import { IntervalDrillPage } from './pages/IntervalDrillPage';
import { ScaleDrillPage } from './pages/ScaleDrillPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <SettingsProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/intervals" element={<IntervalDrillPage />} />
          <Route path="/chords" element={<ChordDrillPage />} />
          <Route path="/scales" element={<ScaleDrillPage />} />
          <Route path="/in-key/chords" element={<InKeyChordsPage />} />
          <Route path="/in-key/notes" element={<InKeyNotesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </SettingsProvider>
  );
}
