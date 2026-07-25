import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { TrackingProvider } from './context/TrackingContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlannerPage } from './pages/PlannerPage';
import { AIChatPage } from './pages/AIChatPage';
import { GNewsFeedPage } from './pages/GNewsFeedPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFBA00] text-black flex items-center justify-center font-black text-xl">
            !
          </div>
          <h2 className="text-2xl font-black font-outfit">Something went wrong while rendering this page</h2>
          <p className="text-xs text-slate-500 max-w-md font-medium">
            {this.state.error?.message || "An unexpected error occurred. Please click below to reload."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-[#FFBA00] hover:bg-[#FF9F00] text-black font-black text-xs shadow-md"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <TripProvider>
            <TrackingProvider>
              <Router>
                <div className="min-h-screen bg-white text-slate-900 flex flex-col pb-24 md:pb-8 relative">
                  <Navbar />
                  <main className="flex-1 pb-16 md:pb-0">
                    <Routes>
                      {/* Page 1: Landing Intro Page */}
                      <Route path="/" element={<LandingPage />} />
                      
                      {/* Page 2: Login / Register */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />

                      {/* Page 3: Dashboard */}
                      <Route path="/dashboard" element={<DashboardPage />} />

                      {/* Page 4: Plan Page */}
                      <Route path="/planner" element={<PlannerPage />} />

                      {/* Page 5: Live GNews Feed */}
                      <Route path="/news" element={<GNewsFeedPage />} />

                      {/* Page 6: AI Assistant */}
                      <Route path="/ai-chat" element={<AIChatPage />} />
                    </Routes>
                  </main>
                  
                  {/* Floating Mobile Bottom Navigation Dock */}
                  <MobileBottomNav />

                  <Toaster
                    position="top-right"
                    toastOptions={{
                      style: {
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                      },
                    }}
                  />
                </div>
              </Router>
            </TrackingProvider>
          </TripProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
