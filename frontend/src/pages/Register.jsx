import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import Logo from '../components/Logo';
import ErrorAlert from '../components/ErrorAlert';

const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (isAuthenticated) {
    return <Navigate to="/analysis" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Frontend validations
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(name.trim(), email.trim(), password);
      setSuccessMsg('Account created successfully. Please log in.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5">
      <div className="card border-0 shadow-sm" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          {/* Brand & Subtitle */}
          <div className="text-center mb-4">
            <Logo size="large" className="mb-2" />
            <p className="text-secondary small fw-medium mt-1 mb-0">Create Clinical Account</p>
          </div>

          <ErrorAlert error={error} onClose={() => setError(null)} className="mb-3" />

          {successMsg && (
            <div className="alert alert-success border-0 shadow-sm d-flex align-items-center mb-3" role="alert">
              <i className="bi bi-check-circle-fill text-success fs-5 me-2 flex-shrink-0"></i>
              <div className="small">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="regName" className="form-label small fw-semibold text-secondary">
                Full Name
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  id="regName"
                  className="form-control border-start-0 ps-0"
                  placeholder="Dr. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || Boolean(successMsg)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="regEmail" className="form-label small fw-semibold text-secondary">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  id="regEmail"
                  className="form-control border-start-0 ps-0"
                  placeholder="name@clinic.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || Boolean(successMsg)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="regPassword" className="form-label small fw-semibold text-secondary">
                Password (min 6 characters)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  id="regPassword"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || Boolean(successMsg)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="regConfirmPassword" className="form-label small fw-semibold text-secondary">
                Confirm Password
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  id="regConfirmPassword"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || Boolean(successMsg)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-auth-action w-100 py-2 fw-semibold shadow-sm"
              disabled={loading || Boolean(successMsg)}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <p className="text-muted small mb-0">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
