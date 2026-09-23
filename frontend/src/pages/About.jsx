import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  // Steps in "How Optilight works" with user-specified color sequence:
  // 1. purple, 2. blue, 3. orange, 4. purple, 5. blue, 6. green
  const workflowSteps = [
    {
      title: 'OCT Image',
      desc: 'Cross-sectional optical coherence tomography scan',
      icon: 'bi-image',
      color: '#7c3aed', // 1. purple
      bg: '#faf5ff',
      border: '#ede9fe',
    },
    {
      title: 'Image Preprocessing',
      desc: 'Grayscale normalization and standard 224×224 input sizing',
      icon: 'bi-aspect-ratio',
      color: '#0284c7', // 2. blue
      bg: '#f0f9ff',
      border: '#e0f2fe',
    },
    {
      title: 'ResNet50 Deep Features + GLCM Texture Features',
      desc: 'Dual-stream visual convolutional and statistical texture extraction',
      icon: 'bi-cpu',
      color: '#ea580c', // 3. orange
      bg: '#fff7ed',
      border: '#ffedd5',
    },
    {
      title: 'Feature Fusion',
      desc: 'Combines deep visual representations and texture descriptors',
      icon: 'bi-shuffle',
      color: '#7c3aed', // 4. purple
      bg: '#faf5ff',
      border: '#ede9fe',
    },
    {
      title: 'Classification',
      desc: 'Dense neural layers evaluate fused feature vectors',
      icon: 'bi-layers',
      color: '#0284c7', // 5. blue
      bg: '#f0f9ff',
      border: '#e0f2fe',
    },
    {
      title: 'Prediction',
      desc: 'Class assignment with calibrated confidence probabilities',
      icon: 'bi-check-circle',
      color: '#16a34a', // 6. green
      bg: '#f0fdf4',
      border: '#dcfce7',
    },
  ];

  const supportedClasses = [
    {
      code: 'CNV',
      name: 'Choroidal Neovascularization',
      color: '#dc2626', // Red
      bg: '#fee2e2',
      border: '#fecaca',
      desc: 'Neovascular growth and fluid beneath retinal layers',
    },
    {
      code: 'DME',
      name: 'Diabetic Macular Edema',
      color: '#b45309', // Yellow / Amber
      bg: '#fef3c7',
      border: '#fde68a',
      desc: 'Retinal thickening and fluid accumulation from vascular leakage',
    },
    {
      code: 'DRUSEN',
      name: 'Drusen Deposits',
      color: '#1d4ed8', // Blue
      bg: '#dbeafe',
      border: '#bfdbfe',
      desc: 'Extracellular lipid deposits situated below the RPE',
    },
    {
      code: 'NORMAL',
      name: 'Normal OCT',
      color: '#15803d', // Green
      bg: '#dcfce7',
      border: '#bbf7d0',
      desc: 'Preserved foveal depression with healthy, intact retinal architecture',
    },
  ];

  return (
    <div style={{ maxWidth: '940px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-primary mb-1 d-flex align-items-center">
          <i className="bi bi-info-circle text-primary me-2"></i>
          About Optilight
        </h3>
        <p className="text-secondary small mb-0">
          AI-assisted OCT retinal analysis and clinical decision support
        </p>
      </div>

      {/* Section 1: About Optilight */}
      <div className="card border-0 shadow-sm mb-4 bg-white">
        <div className="card-body p-4">
          <h5 className="fw-bold text-primary mb-2">About Optilight</h5>
          <p className="text-secondary small mb-0" style={{ lineHeight: '1.75' }}>
            <strong className="text-primary">Optilight</strong> is an AI-assisted clinical decision-support application designed to analyze Optical Coherence Tomography (OCT) retinal images and classify them into four diagnostic categories:{' '}
            <span
              className="badge px-2.5 py-1 fw-bold me-1 font-monospace"
              style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
            >
              CNV
            </span>{' '}
            <span
              className="badge px-2.5 py-1 fw-bold me-1 font-monospace"
              style={{ backgroundColor: '#fef3c7', color: '#b45309' }}
            >
              DME
            </span>{' '}
            <span
              className="badge px-2.5 py-1 fw-bold me-1 font-monospace"
              style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
            >
              DRUSEN
            </span>
            , and{' '}
            <span
              className="badge px-2.5 py-1 fw-bold font-monospace"
              style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
            >
              NORMAL
            </span>
            . It is engineered to assist healthcare professionals in evaluating OCT scans efficiently and does not provide autonomous medical diagnosis.
          </p>
        </div>
      </div>

      {/* Section 2: How Optilight works */}
      <div className="card border-0 shadow-sm mb-4 bg-white">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
            <i className="bi bi-diagram-3-fill text-primary me-2"></i>
            How Optilight works
          </h5>
        </div>
        <div className="card-body p-4 pt-0">
          <div className="d-flex flex-column align-items-center">
            {workflowSteps.map((step, idx) => (
              <React.Fragment key={step.title}>
                <div
                  className="w-100 p-3 rounded-3 d-flex align-items-center justify-content-between"
                  style={{
                    maxWidth: '640px',
                    backgroundColor: step.bg,
                    border: `1px solid ${step.border}`,
                  }}
                >
                  <div className="d-flex align-items-center">
                    <span
                      className="badge rounded-circle me-3 d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold"
                      style={{
                        width: '28px',
                        height: '28px',
                        fontSize: '0.8rem',
                        backgroundColor: step.color,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span className="fw-bold text-dark d-block small mb-0.5">{step.title}</span>
                      <span className="text-secondary smaller">{step.desc}</span>
                    </div>
                  </div>
                  <i
                    className={`bi ${step.icon} fs-5 ms-2 flex-shrink-0`}
                    style={{ color: step.color }}
                  ></i>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="my-1.5" style={{ color: step.color }}>
                    <i className="bi bi-arrow-down fs-5"></i>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Model Architecture */}
      <div className="card border-0 shadow-sm mb-4 bg-white">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
            <i className="bi bi-cpu text-primary me-2"></i>
            Model Architecture: ResNet50 + GLCM
          </h5>
        </div>
        <div className="card-body p-4 pt-0">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 h-100 border">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-layers text-primary fs-5 me-2"></i>
                  <span className="fw-bold text-dark small">ResNet50</span>
                </div>
                <p className="text-secondary smaller mb-0" style={{ lineHeight: '1.5' }}>
                  Extracts deep visual features from OCT images.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 h-100 border">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-grid-3x3 text-primary fs-5 me-2"></i>
                  <span className="fw-bold text-dark small">GLCM</span>
                </div>
                <p className="text-secondary smaller mb-0" style={{ lineHeight: '1.5' }}>
                  Extracts texture-based image features.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 h-100 border">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-shuffle text-primary fs-5 me-2"></i>
                  <span className="fw-bold text-dark small">Feature Fusion</span>
                </div>
                <p className="text-secondary smaller mb-0" style={{ lineHeight: '1.5' }}>
                  Combines deep and texture features before classification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Supported Classes */}
      <div className="card border-0 shadow-sm mb-4 bg-white">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
            <i className="bi bi-card-checklist text-primary me-2"></i>
            Supported Classes
          </h5>
        </div>
        <div className="card-body p-4 pt-0">
          <div className="row g-3">
            {supportedClasses.map((item) => (
              <div key={item.code} className="col-12 col-sm-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    backgroundColor: item.bg,
                    border: `1px solid ${item.border}`,
                  }}
                >
                  <span
                    className="badge px-3 py-1.5 fw-bold mb-2 font-monospace"
                    style={{
                      backgroundColor: item.color,
                      color: '#ffffff',
                    }}
                  >
                    {item.code}
                  </span>
                  <div className="fw-bold text-dark small mb-1">{item.name}</div>
                  <div className="text-secondary smaller">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 5: Clinical Decision Support */}
      <div className="card border-0 bg-white shadow-sm mb-4">
        <div className="card-body p-3.5 d-flex align-items-center">
          <i className="bi bi-shield-check text-primary fs-4 me-3 flex-shrink-0"></i>
          <div>
            <strong className="text-dark small d-block mb-0.5">Clinical Decision Support</strong>
            <p className="text-secondary smaller mb-0" style={{ lineHeight: '1.45' }}>
              Results are intended to support clinical review and are not a standalone medical diagnosis. Always review findings with a qualified healthcare professional.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="text-center pt-2 pb-4">
        <Link to="/analysis" className="btn btn-primary px-4 py-2 fw-semibold shadow-sm">
          <i className="bi bi-plus-lg me-2"></i> New Analysis
        </Link>
      </div>
    </div>
  );
};

export default About;
