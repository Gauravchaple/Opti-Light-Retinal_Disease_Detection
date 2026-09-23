import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictionApi } from '../api/predictionApi';
import ErrorAlert from '../components/ErrorAlert';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

const NewAnalysis = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file) => {
    if (!file) {
      return 'Please select an OCT image.';
    }

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return 'Unsupported file type. Please upload JPG, JPEG, or PNG.';
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return 'Unsupported file type. Please upload JPG, JPEG, or PNG.';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'File size exceeds the 5 MB limit.';
    }

    return null;
  };

  const handleFileSelection = (file) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChangeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await predictionApi.createPrediction(selectedFile);
      navigate(`/analysis/result/${result.id}`, { state: { predictionData: result } });
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="w-100">
      {/* 1. Page Heading */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.95rem' }}>
          New OCT Analysis
        </h2>
        <p className="text-secondary mb-0" style={{ fontSize: '0.98rem' }}>
          Upload an OCT scan for AI-assisted retinal analysis.
        </p>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} className="mb-4" />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={handleFileChange}
      />

      {/* 2. Main Upload Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          {!selectedFile ? (
            /* Upload Initial State */
            <div
              className={`border border-2 border-dashed rounded-3 p-4 text-center transition-all d-flex flex-column align-items-center justify-content-center ${
                dragActive ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-white'
              }`}
              style={{
                minHeight: '270px',
                cursor: 'pointer',
              }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {dragActive ? (
                <div>
                  <i className="bi bi-cloud-arrow-down-fill text-primary display-5 mb-2 d-block"></i>
                  <h5 className="fw-bold text-primary mb-1">Drop OCT image here</h5>
                  <p className="text-secondary small mb-0">Release to select this scan</p>
                </div>
              ) : (
                <div>
                  <div className="mb-3">
                    <i className="bi bi-cloud-arrow-up text-primary display-5"></i>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">Upload OCT Scan</h5>
                  <p className="text-muted small mb-3">
                    Drag &amp; drop your image here or browse
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm px-4 fw-semibold mb-3 shadow-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <i className="bi bi-folder2-open me-2"></i>
                    Browse Image
                  </button>

                  <div className="text-muted smaller d-block">
                    JPG • JPEG • PNG • Max 5 MB
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Preview State */
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center">
                  <i className="bi bi-image text-primary me-2"></i>
                  OCT Preview
                </h6>
                <span className="badge bg-light text-secondary border smaller">
                  Ready for Analysis
                </span>
              </div>

              {/* Centered Image Preview on diagnostic black canvas */}
              <div className="text-center mb-3">
                <div
                  className="d-inline-block p-2 rounded-3 bg-black shadow-sm"
                  style={{ maxWidth: '100%' }}
                >
                  <img
                    src={previewUrl}
                    alt="Selected OCT Scan Preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: '280px', width: 'auto', objectFit: 'contain' }}
                  />
                </div>
              </div>

              {/* File Metadata & Actions */}
              <div className="bg-light rounded-3 p-3 mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="d-flex align-items-center text-truncate me-2">
                  <i className="bi bi-file-earmark-medical text-primary fs-4 me-2 flex-shrink-0"></i>
                  <div className="text-truncate">
                    <span className="fw-semibold text-dark d-block text-truncate small">
                      {selectedFile.name}
                    </span>
                    <span className="text-muted smaller">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3 fw-medium"
                  onClick={handleChangeImage}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-repeat me-1"></i>
                  Change Image
                </button>
              </div>

              {/* Processing Loader or Submit Button */}
              {loading ? (
                <div className="text-center p-3 bg-light rounded-3 border">
                  <div
                    className="spinner-border text-primary mb-2"
                    role="status"
                    style={{ width: '2.2rem', height: '2.2rem' }}
                  >
                    <span className="visually-hidden">Analyzing OCT Scan...</span>
                  </div>
                  <h6 className="fw-bold text-dark mb-1">Analyzing OCT Scan...</h6>
                  <p className="text-secondary smaller mb-0">
                    Please wait while Optilight processes the image.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary w-100 py-2.5 fw-semibold shadow-sm d-flex align-items-center justify-content-center"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  <i className="bi bi-cpu me-2"></i>
                  Analyze Scan
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. How It Works (Compact 3-Step Section) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100 bg-white">
            <div className="card-body p-3 d-flex align-items-start">
              <div
                className="rounded-3 p-2 me-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#ede9fe', color: '#7c3aed', width: '40px', height: '40px' }}
              >
                <i className="bi bi-cloud-arrow-up fs-5"></i>
              </div>
              <div>
                <span className="fw-bold text-dark d-block small mb-1">
                  1. Upload OCT
                </span>
                <p className="text-secondary smaller mb-0">
                  Select a JPG, JPEG, or PNG cross-sectional retinal scan.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100 bg-white">
            <div className="card-body p-3 d-flex align-items-start">
              <div
                className="rounded-3 p-2 me-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#e0f2fe', color: '#0284c7', width: '40px', height: '40px' }}
              >
                <i className="bi bi-cpu fs-5"></i>
              </div>
              <div>
                <span className="fw-bold text-dark d-block small mb-1">
                  2. AI Analysis
                </span>
                <p className="text-secondary smaller mb-0">
                  Optilight evaluates spatial and textural retinal biomarkers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100 bg-white">
            <div className="card-body p-3 d-flex align-items-start">
              <div
                className="rounded-3 p-2 me-3 flex-shrink-0 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: '#dcfce7', color: '#16a34a', width: '40px', height: '40px' }}
              >
                <i className="bi bi-file-earmark-check fs-5"></i>
              </div>
              <div>
                <span className="fw-bold text-dark d-block small mb-1">
                  3. Review Result
                </span>
                <p className="text-secondary smaller mb-0">
                  Inspect the predicted condition, confidence score, and probabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAnalysis;
