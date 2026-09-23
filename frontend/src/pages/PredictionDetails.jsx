import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { predictionApi } from '../api/predictionApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ProbabilityBars from '../components/ProbabilityBars';
import ConfirmModal from '../components/ConfirmModal';

const PredictionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const data = await predictionApi.getPrediction(id);
        setRecord(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await predictionApi.deletePrediction(id);
      navigate('/history', { replace: true });
    } catch (err) {
      setError(err);
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner label="Loading prediction details..." />;
  }

  if (error) {
    return (
      <div>
        <div className="mb-4">
          <h3 className="fw-bold text-dark">Prediction Details</h3>
        </div>
        <ErrorAlert error={error} />
        <Link to="/history" className="btn btn-outline-secondary btn-sm mt-3">
          <i className="bi bi-arrow-left me-1"></i> Back to History
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="alert alert-warning">
        Prediction record not found.{' '}
        <Link to="/history" className="alert-link">
          Return to History.
        </Link>
      </div>
    );
  }

  const confidencePct = record.confidence <= 1
    ? (record.confidence * 100).toFixed(1)
    : Number(record.confidence).toFixed(1);

  const isNormal = record.prediction === 'NORMAL';
  const badgeClass = isNormal ? 'bg-success text-white' : 'bg-danger text-white';
  const imageUrl = `${baseURL}/uploads/${record.image_name}`;

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Breadcrumb & Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link to="/history" className="text-decoration-none">
              History
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Analysis #{id}
          </li>
        </ol>
      </nav>

      {/* Header Actions */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-file-earmark-text text-primary me-2"></i>
            Prediction Details #{id}
          </h3>
          <p className="text-secondary small mb-0">
            Recorded analysis from {formatDate(record.created_at)}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/history" className="btn btn-outline-secondary btn-sm px-3 fw-semibold">
            <i className="bi bi-arrow-left me-1"></i> Back to History
          </Link>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm px-3 fw-semibold"
            onClick={() => setDeleteModalOpen(true)}
          >
            <i className="bi bi-trash3 me-1"></i> Delete Prediction
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: OCT Image & File Meta */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h6 className="fw-bold mb-0 text-dark">Stored OCT Scan</h6>
            </div>
            <div className="card-body p-3 text-center bg-black d-flex align-items-center justify-content-center">
              <img
                src={imageUrl}
                alt={`OCT Scan ${record.image_name}`}
                className="img-fluid rounded"
                style={{ maxHeight: '380px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x300?text=Scan+File+Unavailable';
                }}
              />
            </div>
            <div className="card-footer bg-white border-0 py-3">
              <div className="row g-2">
                <div className="col-12">
                  <span className="text-muted smaller d-block">Stored File Name:</span>
                  <span className="small font-monospace text-dark text-break fw-semibold">
                    {record.image_name}
                  </span>
                </div>
                <div className="col-12 mt-2">
                  <span className="text-muted smaller d-block">Analysis Timestamp:</span>
                  <span className="small text-dark fw-semibold">
                    {formatDate(record.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Findings & Probabilities */}
        <div className="col-12 col-lg-7">
          {/* Classification Overview */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <span className="text-uppercase text-muted fw-bold smaller tracking-wide d-block mb-1">
                AI Classification Result
              </span>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h2 className="fw-bold mb-0 text-dark">
                  <span className={`badge ${badgeClass} px-3 py-2 rounded-3`}>
                    {record.prediction}
                  </span>
                </h2>
                <div className="text-end">
                  <span className="text-muted small d-block">Confidence Score</span>
                  <span className="fs-4 fw-bold text-dark font-monospace">{confidencePct}%</span>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 text-secondary small">
                {isNormal ? (
                  <span>
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Retinal layers appear healthy with no evident choroidal neovascularization, macular edema, or drusen deposits.
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                    Features indicative of <strong>{record.prediction}</strong> detected. Clinical evaluation is advised.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Probabilities Bars */}
          <ProbabilityBars record={record} />

          {/* Clinical Disclaimer */}
          <div className="card border-0 bg-white shadow-sm">
            <div className="card-body p-3 d-flex align-items-start">
              <i className="bi bi-shield-check text-primary fs-5 me-3 flex-shrink-0 mt-0.5"></i>
              <div>
                <strong className="text-dark small d-block mb-1">Clinical Disclaimer</strong>
                <p className="text-muted smaller mb-0" style={{ fontSize: '0.825rem' }}>
                  Optilight provides AI-assisted analysis of OCT images. Results are intended to support clinical review and are not a standalone medical diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Prediction Record"
        message="Are you sure you want to delete this prediction record? Both the database findings and the uploaded scan file on disk will be deleted."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default PredictionDetails;
