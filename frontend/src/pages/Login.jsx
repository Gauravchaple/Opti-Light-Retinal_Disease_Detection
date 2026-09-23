import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ErrorAlert from '../components/ErrorAlert';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already authenticated, redirect to /analysis
  if (isAuthenticated) {
    return <Navigate to="/analysis" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Redirect directly to /analysis
      navigate('/analysis', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <div className="card border-0 shadow-sm" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          {/* Brand & Subtitle */}
          <div className="text-center mb-4">
            <Logo size="large" className="mb-2" />
            <p className="text-secondary small fw-medium mt-1 mb-0">OCT Retinal Analysis</p>
          </div>

          <ErrorAlert error={error} onClose={() => setError(null)} className="mb-3" />

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label small fw-semibold text-secondary">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  id="loginEmail"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@clinic.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="loginPassword" className="form-label small fw-semibold text-secondary">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  id="loginPassword"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-auth-action w-100 py-2 fw-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <p className="text-muted small mb-0">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
