import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { predictionApi } from '../api/predictionApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmModal from '../components/ConfirmModal';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState('ALL');

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetId, setTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const fetchHistory = async () => {
    try {
      const data = await predictionApi.getPredictionHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openDeleteModal = (id) => {
    setTargetId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTargetId(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!targetId) return;

    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await predictionApi.deletePrediction(targetId);
      setHistory((prev) => prev.filter((item) => item.id !== targetId));
      setSuccessMsg('Prediction record deleted successfully.');
      closeDeleteModal();
    } catch (err) {
      setError(err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Filter history based on search query and condition filter
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesFilter =
        filterCondition === 'ALL' ||
        item.prediction?.toUpperCase() === filterCondition;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.image_name?.toLowerCase().includes(q) ||
        item.prediction?.toLowerCase().includes(q) ||
        formatDate(item.created_at).toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [history, searchQuery, filterCondition]);

  if (loading) {
    return <LoadingSpinner label="Loading prediction history..." />;
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center">
            <i className="bi bi-clock-history text-primary me-2"></i>
            Prediction History
          </h3>
          <p className="text-secondary small mb-0">
            Archived log of previous AI-assisted OCT scan evaluations
          </p>
        </div>
        <Link to="/analysis" className="btn btn-primary btn-sm px-3 py-2 fw-semibold shadow-sm">
          <i className="bi bi-plus-lg me-1"></i> New Analysis
        </Link>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} className="mb-4" />

      {successMsg && (
        <div
          className="alert alert-success alert-dismissible fade show border-0 shadow-sm d-flex align-items-center mb-4"
          role="alert"
        >
          <i className="bi bi-check-circle-fill text-success fs-5 me-2 flex-shrink-0"></i>
          <span className="small flex-grow-1">{successMsg}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSuccessMsg(null)}
          ></button>
        </div>
      )}

      {/* Main Content Area */}
      {history.length === 0 ? (
        <div className="card border-0 shadow-sm bg-white text-center py-5 px-4">
          <div className="py-4 py-md-5 mx-auto" style={{ maxWidth: '520px' }}>
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle text-primary"
              style={{ width: '72px', height: '72px', backgroundColor: '#f3e8ff' }}
            >
              <i className="bi bi-clock-history fs-2"></i>
            </div>
            <h4 className="fw-bold text-dark mb-2">No analyses yet.</h4>
            <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
              Your previous OCT analyses will appear here.
            </p>
            <Link to="/analysis" className="btn btn-primary px-4 py-2.5 fw-semibold shadow-sm">
              <i className="bi bi-plus-lg me-1"></i> New Analysis
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Search & Filter Toolbar */}
          <div className="card border-0 shadow-sm mb-3 bg-white">
            <div className="card-body p-3">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-5">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light border-start-0"
                      placeholder="Search by scan name, condition, or date..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-8 col-md-4">
                  <div className="d-flex align-items-center">
                    <span className="text-secondary smaller me-2 fw-semibold text-nowrap d-none d-sm-inline">
                      Filter:
                    </span>
                    <select
                      className="form-select form-select-sm"
                      value={filterCondition}
                      onChange={(e) => setFilterCondition(e.target.value)}
                    >
                      <option value="ALL">All Predictions</option>
                      <option value="CNV">CNV</option>
                      <option value="DME">DME</option>
                      <option value="DRUSEN">DRUSEN</option>
                      <option value="NORMAL">NORMAL</option>
                    </select>
                  </div>
                </div>

                <div className="col-4 col-md-3 text-end">
                  {(searchQuery || filterCondition !== 'ALL') ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm w-100"
                      onClick={() => {
                        setSearchQuery('');
                        setFilterCondition('ALL');
                      }}
                    >
                      <i className="bi bi-x-circle me-1"></i> Reset
                    </button>
                  ) : (
                    <span className="text-muted smaller">
                      {filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* History Records Table */}
          <div className="card border-0 shadow-sm bg-white overflow-hidden">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-5 px-3">
                <i className="bi bi-funnel text-muted fs-2 d-block mb-2"></i>
                <h6 className="fw-bold text-dark mb-1">No matching analyses</h6>
                <p className="text-secondary smaller mb-3">
                  No predictions matched your current search or filter criteria.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm px-3"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCondition('ALL');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small text-uppercase">
                    <tr>
                      <th className="ps-4 py-3" style={{ minWidth: '180px' }}>Image</th>
                      <th style={{ minWidth: '130px' }}>Prediction</th>
                      <th style={{ minWidth: '110px' }}>Confidence</th>
                      <th style={{ minWidth: '130px' }}>Date</th>
                      <th className="text-end pe-4" style={{ minWidth: '140px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item) => {
                      const isNormal = item.prediction === 'NORMAL';
                      const badgeClass = isNormal
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-danger-subtle text-danger border border-danger-subtle';

                      const confidencePct = item.confidence <= 1
                        ? (item.confidence * 100).toFixed(1)
                        : Number(item.confidence).toFixed(1);

                      const thumbUrl = `${baseURL}/uploads/${item.image_name}`;

                      return (
                        <tr key={item.id}>
                          {/* Image Column */}
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <img
                                src={thumbUrl}
                                alt="OCT Scan Thumbnail"
                                className="rounded border me-2 flex-shrink-0 bg-dark"
                                style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/42x42?text=OCT';
                                }}
                              />
                              <div
                                className="text-truncate font-monospace small text-dark"
                                style={{ maxWidth: '170px' }}
                              >
                                <span title={item.image_name}>{item.image_name}</span>
                              </div>
                            </div>
                          </td>

                          {/* Prediction Column */}
                          <td>
                            <span className={`badge rounded-pill ${badgeClass} px-2.5 py-1.5 fw-semibold small`}>
                              {item.prediction}
                            </span>
                          </td>

                          {/* Confidence Column */}
                          <td className="small font-monospace fw-bold text-dark">
                            {confidencePct}%
                          </td>

                          {/* Date Column */}
                          <td className="small text-secondary">
                            {formatDate(item.created_at)}
                          </td>

                          {/* Action Column */}
                          <td className="text-end pe-4">
                            <Link
                              to={`/history/${item.id}`}
                              className="btn btn-outline-primary btn-sm me-2 px-2.5"
                              title="View Analysis Details"
                            >
                              <i className="bi bi-eye me-1"></i>
                              View
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm px-2.5"
                              title="Delete Record"
                              onClick={() => openDeleteModal(item.id)}
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Prediction"
        message="Are you sure you want to delete this prediction? This will permanently delete the record and the stored image file from the server."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default History;
