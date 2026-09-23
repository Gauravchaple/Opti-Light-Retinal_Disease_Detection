import React from 'react';

const LoadingSpinner = ({ label = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="text-center p-4">
      <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {label && <p className="mt-3 text-secondary fw-semibold small mb-0">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
