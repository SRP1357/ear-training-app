import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from './storage/settings';
import { Seo } from './seo/Seo';
import { PAGE_SEO } from './seo/site';
import { ChordDrillPage } from './pages/ChordDrillPage';
import { HomePage } from './pages/HomePage';
import { InKeyChordsPage } from './pages/InKeyChordsPage';
import { InKeyNotesPage } from './pages/InKeyNotesPage';
import { IntervalDrillPage } from './pages/IntervalDrillPage';
import { ScaleDrillPage } from './pages/ScaleDrillPage';
import { SettingsPage } from './pages/SettingsPage';

function Page({
  seo,
  children,
}: {
  seo: (typeof PAGE_SEO)[keyof typeof PAGE_SEO];
  children: ReactNode;
}) {
  return (
    <>
      <Seo {...seo} />
      {children}
    </>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Routes>
          <Route
            path="/"
            element={
              <Page seo={PAGE_SEO.home}>
                <HomePage />
              </Page>
            }
          />
          <Route
            path="/intervals"
            element={
              <Page seo={PAGE_SEO.intervals}>
                <IntervalDrillPage />
              </Page>
            }
          />
          <Route
            path="/chords"
            element={
              <Page seo={PAGE_SEO.chords}>
                <ChordDrillPage />
              </Page>
            }
          />
          <Route
            path="/scales"
            element={
              <Page seo={PAGE_SEO.scales}>
                <ScaleDrillPage />
              </Page>
            }
          />
          <Route
            path="/in-key/chords"
            element={
              <Page seo={PAGE_SEO.inKeyChords}>
                <InKeyChordsPage />
              </Page>
            }
          />
          <Route
            path="/in-key/notes"
            element={
              <Page seo={PAGE_SEO.inKeyNotes}>
                <InKeyNotesPage />
              </Page>
            }
          />
          <Route
            path="/settings"
            element={
              <Page seo={PAGE_SEO.settings}>
                <SettingsPage />
              </Page>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}
