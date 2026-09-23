import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { predictionApi } from '../api/predictionApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ProbabilityBars from '../components/ProbabilityBars';

const AnalysisResult = () => {
  const { id } = useParams();
  const location = useLocation();

  const [prediction, setPrediction] = useState(() => location.state?.predictionData || null);
  const [loading, setLoading] = useState(() => !location.state?.predictionData);
  const [error, setError] = useState(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    // If we only have partial prediction data (missing image_name) or no data at all, fetch from API
    const loadPrediction = async () => {
      try {
        const data = await predictionApi.getPrediction(id);
        setPrediction(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (!prediction || !prediction.image_name) {
      loadPrediction();
    }
  }, [id, prediction]);

  if (loading) {
    return <LoadingSpinner label="Loading analysis results..." />;
  }

  if (error) {
    return (
      <div>
        <div className="mb-4">
          <h3 className="fw-bold text-dark">Analysis Result</h3>
        </div>
        <ErrorAlert error={error} />
        <Link to="/analysis" className="btn btn-primary btn-sm mt-3">
          <i className="bi bi-arrow-left me-1"></i> New Analysis
        </Link>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="alert alert-warning">
        Prediction record could not be loaded.{' '}
        <Link to="/analysis" className="alert-link">
          Run a new analysis.
        </Link>
      </div>
    );
  }

  const confidencePct = prediction.confidence <= 1
    ? (prediction.confidence * 100).toFixed(1)
    : Number(prediction.confidence).toFixed(1);

  const isNormal = prediction.prediction === 'NORMAL';
  const badgeClass = isNormal ? 'bg-success text-white' : 'bg-danger text-white';

  const imageUrl = prediction.image_name ? `${baseURL}/uploads/${prediction.image_name}` : null;

  return (
    <div>
      {/* Title */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-file-earmark-medical text-primary me-2"></i>
            OCT Analysis Result
          </h3>
          <p className="text-secondary small mb-0">
            AI-assisted diagnostic evaluation for OCT scan #{id}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/analysis" className="btn btn-outline-primary btn-sm px-3 fw-semibold">
            <i className="bi bi-plus-lg me-1"></i> New Analysis
          </Link>
          <Link to="/history" className="btn btn-outline-secondary btn-sm px-3 fw-semibold">
            <i className="bi bi-clock-history me-1"></i> View History
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: OCT Image */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3 border-0">
              <h6 className="fw-bold mb-0 text-dark">Analyzed OCT Scan</h6>
            </div>
            <div className="card-body p-3 text-center bg-black d-flex align-items-center justify-content-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`OCT Retinal Scan ${prediction.image_name || id}`}
                  className="img-fluid rounded"
                  style={{ maxHeight: '380px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/400x300?text=Scan+Image+Unavailable';
                  }}
                />
              ) : (
                <div className="text-white-50 p-5 small">No image preview available</div>
              )}
            </div>
            {prediction.image_name && (
              <div className="card-footer bg-white border-0 py-2">
                <div className="text-muted smaller font-monospace text-truncate">
                  File: {prediction.image_name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Findings & Probabilities */}
        <div className="col-12 col-lg-7">
          {/* Prediction Overview Card */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <span className="text-uppercase text-muted fw-bold smaller tracking-wide d-block mb-1">
                AI Prediction
              </span>
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <h2 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <span className={`badge ${badgeClass} px-3 py-2 rounded-3 me-2`}>
                    {prediction.prediction}
                  </span>
                </h2>
                <div className="text-end">
                  <span className="text-muted small d-block">Model Confidence</span>
                  <span className="fs-4 fw-bold text-dark font-monospace">{confidencePct}%</span>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 text-secondary small">
                {isNormal ? (
                  <span>
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    No dominant pathological biomarkers detected in this cross-sectional scan.
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-exclamation-diamond-fill text-danger me-2"></i>
                    Structural features consistent with <strong>{prediction.prediction}</strong> detected.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Probabilities Bars */}
          <ProbabilityBars probabilities={prediction.probabilities} record={prediction} />

          {/* Clinical Disclaimer */}
          <div className="card border-0 bg-white shadow-sm">
            <div className="card-body p-3 d-flex align-items-start">
              <i className="bi bi-shield-check text-primary fs-5 me-3 flex-shrink-0 mt-0.5"></i>
              <div>
                <strong className="text-dark small d-block mb-1">Clinical Decision Support Tool</strong>
                <p className="text-muted smaller mb-0" style={{ fontSize: '0.825rem', lineHeight: '1.45' }}>
                  AI-assisted results are intended to support clinical review and are not a standalone diagnosis. Always review results with a qualified healthcare professional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
