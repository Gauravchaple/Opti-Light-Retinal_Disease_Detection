import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const Profile = () => {
  const { user: contextUser } = useAuth();
  const [profile, setProfile] = useState(contextUser);
  const [loading, setLoading] = useState(!contextUser);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const data = await authApi.getCurrentUser();
        setProfile(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfile();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner label="Loading user profile..." />;
  }

  return (
    <div style={{ maxWidth: '940px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
          <i className="bi bi-person-circle text-primary me-2"></i>
          User Profile
        </h3>
        <p className="text-secondary small mb-0">
          Account information and profile details
        </p>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} className="mb-4" />

      {/* Main Profile Card */}
      <div className="card border-0 shadow-sm bg-white">
        <div className="card-body p-4 p-md-5">
          {/* Avatar & Basic Identity */}
          <div className="d-flex align-items-center mb-4">
            <div
              className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center me-3 flex-shrink-0"
              style={{ width: '64px', height: '64px', fontSize: '1.6rem' }}
            >
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-0.5">{profile?.name || 'User'}</h5>
              <div className="text-secondary font-monospace small">
                {profile?.email || '—'}
              </div>
            </div>
          </div>

          <hr className="my-4 text-secondary-subtle" />

          {/* Account Information Header */}
          <h6 className="fw-bold text-dark mb-3">Account Information</h6>

          {/* Responsive Two-Column Grid */}
          <div className="row g-3 g-md-4 mb-4">
            <div className="col-12 col-md-6">
              <label className="text-muted smaller d-block mb-1.5 fw-semibold text-uppercase">
                Full Name
              </label>
              <div className="p-3 bg-light rounded-3 text-dark fw-medium small border border-light-subtle">
                {profile?.name || '—'}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="text-muted smaller d-block mb-1.5 fw-semibold text-uppercase">
                Email Address
              </label>
              <div className="p-3 bg-light rounded-3 font-monospace text-dark small border border-light-subtle">
                {profile?.email || '—'}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="text-muted smaller d-block mb-1.5 fw-semibold text-uppercase">
                Account Registered
              </label>
              <div className="p-3 bg-light rounded-3 text-dark small border border-light-subtle">
                {formatDate(profile?.created_at)}
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="text-muted smaller d-block mb-1.5 fw-semibold text-uppercase">
                Account Status
              </label>
              <div className="p-3 bg-light rounded-3 text-dark small border border-light-subtle d-flex align-items-center">
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center">
                  <span
                    className="d-inline-block rounded-circle bg-success me-1.5"
                    style={{ width: '6px', height: '6px' }}
                  ></span>
                  Active
                </span>
              </div>
            </div>
          </div>

          <hr className="my-4 text-secondary-subtle" />

          {/* About Your Account Section */}
          <div>
            <h6 className="fw-bold text-dark mb-1">About your account</h6>
            <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
              Your account is used to securely manage your OCT analysis history and prediction results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
