import React from 'react';

const ErrorAlert = ({ error, onClose, className = '' }) => {
  if (!error) return null;

  let message = 'An unexpected error occurred. Please try again.';

  if (typeof error === 'string') {
    message = error;
  } else if (error.response) {
    const status = error.response.status;
    const detail = error.response.data?.detail;

    if (status === 400) {
      message = detail || 'Invalid request. Please check the provided information.';
    } else if (status === 401) {
      message = 'Your session has expired or credentials are invalid. Please log in again.';
    } else if (status === 403) {
      message = 'You do not have permission to access or modify this record.';
    } else if (status === 404) {
      message = detail || 'The requested record or resource was not found.';
    } else if (status === 413) {
      message = 'The uploaded file exceeds the maximum allowed size (5MB).';
    } else if (status === 422) {
      message = 'Please check the information you entered. Validation failed.';
    } else if (status === 500) {
      message = 'Something went wrong on the server while processing the request.';
    } else if (status === 503) {
      message = 'The analysis model or service is currently unavailable. Please try again later.';
    } else if (detail) {
      message = typeof detail === 'string' ? detail : JSON.stringify(detail);
    }
  } else if (error.request) {
    message = 'Unable to connect to the server. Please make sure the backend is running.';
  } else if (error.message) {
    message = error.message;
  }

  return (
    <div
      className={`alert alert-danger alert-dismissible fade show border-0 shadow-sm d-flex align-items-center ${className}`}
      role="alert"
    >
      <i className="bi bi-exclamation-triangle-fill fs-5 me-2 flex-shrink-0 text-danger"></i>
      <div className="small flex-grow-1">{message}</div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
};

export default ErrorAlert;
