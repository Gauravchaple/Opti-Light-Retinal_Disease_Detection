import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResult from './pages/AnalysisResult';
import History from './pages/History';
import PredictionDetails from './pages/PredictionDetails';
import Profile from './pages/Profile';
import About from './pages/About';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Authenticated) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/analysis" element={<NewAnalysis />} />
              <Route path="/analysis/result/:id" element={<AnalysisResult />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:id" element={<PredictionDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
            </Route>
          </Route>

          {/* Root Redirect to /analysis */}
          <Route path="/" element={<Navigate to="/analysis" replace />} />

          {/* 404 Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
