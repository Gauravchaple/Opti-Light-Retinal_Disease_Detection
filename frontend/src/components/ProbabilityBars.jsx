import React from 'react';

const ProbabilityBars = ({ probabilities, record }) => {
  // Support both dictionary and flat database model fields
  const data = probabilities || (record ? {
    CNV: record.cnv_probability,
    DME: record.dme_probability,
    DRUSEN: record.drusen_probability,
    NORMAL: record.normal_probability,
  } : null);

  if (!data) return null;

  const classConfig = {
    NORMAL: {
      label: 'NORMAL (Healthy Retina)',
      color: 'bg-success',
      badge: 'text-bg-success'
    },
    CNV: {
      label: 'CNV (Choroidal Neovascularization)',
      color: 'bg-danger',
      badge: 'text-bg-danger'
    },
    DME: {
      label: 'DME (Diabetic Macular Edema)',
      color: 'bg-warning text-dark',
      badge: 'text-bg-warning'
    },
    DRUSEN: {
      label: 'DRUSEN (Early AMD)',
      color: 'bg-info text-dark',
      badge: 'text-bg-info'
    },
  };

  const classes = ['NORMAL', 'CNV', 'DME', 'DRUSEN'];

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white py-3 border-0">
        <h6 className="fw-bold mb-0 text-dark d-flex align-items-center">
          <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
          Class Probabilities
        </h6>
      </div>
      <div className="card-body pt-0">
        {classes.map((cls) => {
          const rawVal = data[cls] !== undefined ? data[cls] : 0;
          // Format percentage (handling decimal 0-1)
          const percentageNum = rawVal <= 1 ? rawVal * 100 : rawVal;
          const percentageStr = `${percentageNum.toFixed(1)}%`;
          const config = classConfig[cls];

          return (
            <div key={cls} className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1 small">
                <span className="fw-semibold text-secondary">{config.label}</span>
                <span className="fw-bold font-monospace text-dark">{percentageStr}</span>
              </div>
              <div className="progress" style={{ height: '1.25rem' }}>
                <div
                  className={`progress-bar ${config.color} fw-semibold`}
                  role="progressbar"
                  style={{ width: `${Math.max(percentageNum, 0)}%` }}
                  aria-valuenow={percentageNum}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {percentageNum >= 12 ? percentageStr : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProbabilityBars;
