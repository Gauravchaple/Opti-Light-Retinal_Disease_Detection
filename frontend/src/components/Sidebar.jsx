import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="d-md-none bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between sticky-top shadow-sm">
        <Logo size="small" />
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'} fs-5`}></i>
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={closeMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`bg-white border-end d-flex flex-column flex-shrink-0 ${
          mobileOpen ? 'd-flex' : 'd-none d-md-flex'
        }`}
        style={{
          width: '255px',
          minWidth: '255px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 1045,
        }}
      >
        {/* Brand Header */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <Logo size="medium" />
          <button
            className="btn-close d-md-none"
            aria-label="Close"
            onClick={closeMobile}
          />
        </div>

        {/* Navigation Links */}
        <nav className="p-2 flex-grow-1">
          <ul className="nav nav-pills flex-column gap-1">
            <li className="nav-item">
              <NavLink
                to="/analysis"
                end
                onClick={closeMobile}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 py-2.5 rounded-3 fw-semibold ${
                    isActive
                      ? 'active bg-primary text-white shadow-sm'
                      : 'text-secondary hover-bg-light'
                  }`
                }
              >
                <i className="bi bi-eyedropper me-3 fs-5 flex-shrink-0"></i>
                <span>New Analysis</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/history"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 py-2.5 rounded-3 fw-semibold ${
                    isActive
                      ? 'active bg-primary text-white shadow-sm'
                      : 'text-secondary hover-bg-light'
                  }`
                }
              >
                <i className="bi bi-clock-history me-3 fs-5 flex-shrink-0"></i>
                <span>History</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/profile"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 py-2.5 rounded-3 fw-semibold ${
                    isActive
                      ? 'active bg-primary text-white shadow-sm'
                      : 'text-secondary hover-bg-light'
                  }`
                }
              >
                <i className="bi bi-person-circle me-3 fs-5 flex-shrink-0"></i>
                <span>Profile</span>
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/about"
                onClick={closeMobile}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center px-3 py-2.5 rounded-3 fw-semibold ${
                    isActive
                      ? 'active bg-primary text-white shadow-sm'
                      : 'text-secondary hover-bg-light'
                  }`
                }
              >
                <i className="bi bi-info-circle me-3 fs-5 flex-shrink-0"></i>
                <span>About</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Footer Area: User Info & Logout */}
        <div className="p-3 border-top bg-light">
          {user && (
            <div className="mb-3 text-truncate">
              <div className="fw-bold small text-dark text-truncate">{user.name}</div>
              <div
                className="text-muted smaller text-truncate font-monospace"
                style={{ fontSize: '0.75rem' }}
              >
                {user.email}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center fw-semibold py-1.5"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
