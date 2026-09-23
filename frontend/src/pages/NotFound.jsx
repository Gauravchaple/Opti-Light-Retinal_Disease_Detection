import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 py-5 text-center">
      <div className="card border-0 shadow-sm" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4 p-sm-5">
          <Logo size="medium" className="mb-4" />
          <div className="text-primary display-1 fw-bold mb-2">404</div>
          <h5 className="fw-bold text-dark mb-2">Page Not Found</h5>
          <p className="text-secondary small mb-4">
            The requested page does not exist or has been relocated.
          </p>
          <Link to="/analysis" className="btn btn-primary w-100 py-2 fw-semibold">
            <i className="bi bi-house-door me-2"></i>
            Go to New Analysis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
