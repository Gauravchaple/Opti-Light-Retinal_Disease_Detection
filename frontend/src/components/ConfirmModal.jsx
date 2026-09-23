import React from 'react';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this prediction? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                disabled={loading}
                onClick={onCancel}
              ></button>
            </div>
            <div className="modal-body py-3 text-secondary">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                disabled={loading}
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn btn-${confirmVariant} btn-sm px-3`}
                disabled={loading}
                onClick={onConfirm}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
