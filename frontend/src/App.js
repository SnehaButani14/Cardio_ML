import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import './App.css';
import {
  Activity, Heart, Brain, CheckCircle, AlertTriangle,
  ArrowRight, Stethoscope, Info, CheckCircle2, AlertCircle,
  User, ClipboardList, Dumbbell, ChevronRight
} from 'lucide-react';

/* --- HELPER: Responsive Window Size Hook --- */
const useWindowSize = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

/* --- HELPER: Inject Responsive CSS for App.css Classes --- */
const ResponsiveStyles = () => (
  <style>{`
    /* Global Responsive Overrides */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    @media (max-width: 1024px) {
      .hero-grid, .stats-grid { 
        grid-template-columns: 1fr !important; 
        gap: 40px !important; 
        text-align: center; 
      }
      .hero-buttons { 
        justify-content: center; 
        display: flex; 
        flex-wrap: wrap; 
        gap: 15px; 
      }
      .footer-grid { 
        grid-template-columns: 1fr !important; 
        gap: 30px; 
        text-align: center; 
      }
      .footer-grid ul { 
        align-items: center; 
      }
    }

    @media (max-width: 768px) {
      .features-grid { 
        grid-template-columns: repeat(2, 1fr) !important; 
      }
      .nav-container { 
        flex-direction: column; 
        gap: 15px; 
      }
      .nav-links { 
        flex-wrap: wrap; 
        justify-content: center; 
        gap: 10px; 
      }
      h1 { font-size: 2.2rem !important; }
      h2 { font-size: 1.8rem !important; }
    }

    @media (max-width: 480px) {
      .features-grid { 
        grid-template-columns: 1fr !important; 
      }
    }
  `}</style>
);

/* --- HELPER: Scroll To Top & Hash Handling --- */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
};

/* --- FEATURE 1: MODEL ACCURACY CHART COMPONENT --- */
const ModelAccuracyChart = () => {
  const data = [
    { name: 'Decision Tree', accuracy: 58.7 },
    { name: 'Random Forest', accuracy: 68.7 },
    { name: 'KNN', accuracy: 69.5 },
    { name: 'Logistic Reg', accuracy: 72.7, isBest: true },
  ];

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #E2E8F0', height: '100%' }}>
      <div className="text-center" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0F172A' }}>Model Accuracy Comparison</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Evaluation on test dataset (20% split)</p>
      </div>

      <div style={{ height: '250px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isBest ? '#22C55E' : '#14B8A6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '20px', background: '#F0FDFA', padding: '15px', borderRadius: '8px', border: '1px solid #CCFBF1', fontSize: '0.85rem', color: '#334155', textAlign: 'center' }}>
        <span style={{ fontWeight: 'bold', color: '#0F766E' }}>Insight:</span> We selected
        <strong> Logistic Regression</strong> as the backend model due to its superior stability and accuracy.
      </div>
    </div>
  );
};

/* --- FEATURE 2: EXPLAINABLE AI (XAI) COMPONENT --- */
const XAIExplanation = ({ formData, prediction }) => {
  if (prediction === null) return null;

  const heightM = Number(formData.height) / 100;
  const bmi = heightM > 0 ? (Number(formData.weight) / (heightM * heightM)).toFixed(1) : 0;

  const getFactors = () => {
    const factors = [];

    if (prediction === 1) {
      if (Number(formData.ap_hi) > 130) factors.push("High systolic blood pressure increases cardiovascular strain.");
      if (Number(formData.chol) > 1) factors.push("Elevated cholesterol levels may indicate arterial plaque buildup.");
      if (Number(formData.age) > 55) factors.push("Age is a significant risk factor requiring regular monitoring.");
      if (Number(formData.smoke) === 1) factors.push("Smoking damages blood vessels and increases heart rate.");
      if (bmi > 25) factors.push(`BMI of ${bmi} indicates weight that may strain the heart.`);
      if (factors.length === 0) factors.push("A combination of borderline health factors contributed to this result.");
    } else {
      if (Number(formData.active) === 1) factors.push("Regular physical activity strengthens the heart muscle.");
      if (Number(formData.ap_hi) < 120 && Number(formData.ap_lo) < 80) factors.push("Optimal blood pressure significantly reduces heart strain.");
      if (Number(formData.chol) === 1) factors.push("Normal cholesterol levels suggest healthy arteries.");
      if (Number(formData.smoke) === 0) factors.push("Non-smoking lifestyle protects blood vessel integrity.");
      if (bmi >= 18.5 && bmi <= 25) factors.push(`BMI of ${bmi} is within the healthy range.`);
      if (factors.length === 0) factors.push("Your overall health metrics align with a low-risk profile.");
    }
    return factors;
  };

  const factors = getFactors();
  const isHighRisk = prediction === 1;

  return (
    <div style={{ marginTop: '24px', padding: '20px', borderRadius: '12px', backgroundColor: isHighRisk ? '#FEF2F2' : '#F0FDF4', border: isHighRisk ? '1px solid #FECACA' : '1px solid #BBF7D0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <Brain color={isHighRisk ? "#EF4444" : "#22C55E"} size={20} />
        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: isHighRisk ? "#7F1D1D" : "#14532D", margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Prediction Analysis
        </h3>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {factors.map((factor, index) => (
          <li key={index} style={{ display: 'flex', gap: '10px', alignItems: 'start', fontSize: '0.85rem', fontWeight: '500', color: '#334155', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '6px' }}>
            {isHighRisk ? (
              <AlertCircle size={16} color="#EF4444" style={{ marginTop: '2px', flexShrink: 0 }} />
            ) : (
              <CheckCircle2 size={16} color="#22C55E" style={{ marginTop: '2px', flexShrink: 0 }} />
            )}
            {factor}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '12px', fontSize: '0.7rem', color: '#64748B', opacity: 0.8 }}>
        * Rule-based interpretation of model parameters.
      </div>
    </div>
  );
};

/* --- FORM HELPERS --- */
const SectionHeader = ({ icon: Icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' }}>
    <Icon size={18} color="#0F766E" />
    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
  </div>
);

const InputGroup = ({ label, name, value, onChange, type = "number", placeholder, options }) => (
  <div className="form-group" style={{ width: '100%' }}>
    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B', marginBottom: '6px', display: 'block' }}>{label}</label>
    {options ? (
      <select
        className="form-input"
        name={name}
        value={value}
        onChange={onChange}
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#0F172A', transition: 'all 0.2s', boxSizing: 'border-box' }}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : (
      <input
        className="form-input"
        name={name}
        type={type}
        value={value}
        required
        placeholder={placeholder}
        onChange={onChange}
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#fff', color: '#0F172A', transition: 'all 0.2s', boxSizing: 'border-box' }}
      />
    )}
  </div>
);

/* --- SHARED COMPONENTS --- */

const Navbar = () => {
  return (
    <nav className="navbar" style={{ padding: '15px 0' }}>
      <div className="container nav-container" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#0F172A' }}>
          <Heart fill="#0F766E" color="#0F766E" />
          <span>CardioAI</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Home</Link>
          <Link to="/#about" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>About</Link>
          <Link to="/#model" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Model Performance</Link>
          <Link to="/predict" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem', color: 'white', background: '#0F766E', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
            Check Risk
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="footer" style={{ background: '#0F172A', color: '#CBD5E1', padding: '60px 0 20px 0' }}>
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>
            <Heart fill="#0F766E" color="#0F766E" /> CardioAI
          </div>
          <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>A machine learning final year project dedicated to saving lives through early algorithm-based detection.</p>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '16px' }}>Quick Links</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
            <li><Link to="/" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Home</Link></li>
            <li><Link to="/#model" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Model Performance</Link></li>
            <li><Link to="/predict" style={{ color: '#CBD5E1', textDecoration: 'none' }}>Prediction Tool</Link></li>
          </ul>
        </div>
      </div>

      <div className="disclaimer" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginTop: '40px', marginBottom: '20px', fontSize: '0.9rem' }}>
        <Info size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        <strong>DISCLAIMER:</strong> This tool is for educational purposes only. It is not a medical diagnosis.
      </div>

      <div className="text-center" style={{ fontSize: '0.85rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
        <p>&copy; 2026 University Final Year Project. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

/* --- PAGE 1: HOME PAGE COMPONENTS --- */

const Hero = () => (
  <section className="section hero" style={{ padding: '80px 0', overflow: 'hidden' }}>
    <div className="container hero-grid">
      <div className="hero-content">
        <span className="badge badge-primary" style={{ display: 'inline-block', padding: '6px 12px', background: '#CCFBF1', color: '#0F766E', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '20px', letterSpacing: '1px' }}>AI-POWERED HEALTHCARE</span>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', color: '#0F172A', marginBottom: '20px' }}>
          Heart Disease <br />
          <span className="gradient-text" style={{ background: 'linear-gradient(to right, #0F766E, #14B8A6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Prediction System</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '30px', lineHeight: '1.6' }}>
          Early detection of cardiovascular risk using advanced Machine Learning models trained on real patient data.
        </p>
        <div className="hero-buttons">
          <Link to="/predict" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#0F766E', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
            Check Your Risk <ArrowRight size={20} />
          </Link>
          <a href="#model" className="btn btn-outline" style={{ display: 'inline-block', padding: '12px 24px', border: '2px solid #E2E8F0', color: '#334155', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', marginLeft: '15px' }}>View Model Details</a>
        </div>
      </div>

      <div className="hero-image" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="tech-info-card" style={{ background: 'white', color: '#333', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ background: '#FEE2E2', padding: '12px', borderRadius: '50%', color: '#EF4444' }}><Heart size={32} fill="currentColor" /></div>
            <div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>Cardio Analysis</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>Real-time processing</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}><div style={{ height: '100%', background: '#0F766E', width: '70%' }}></div></div>
            <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}><div style={{ height: '100%', background: '#14B8A6', width: '85%' }}></div></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="section" id="about" style={{ padding: '80px 0', background: '#F8FAFC' }}>
    <div className="container">
      <div className="text-center" style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#0F172A' }}>Features Used</h2>
        <p style={{ color: '#475569' }}>Our model analyzes these key physiological indicators</p>
      </div>
      <div className="features-grid">
        {["Age", "Gender", "BMI", "Blood Pressure", "Cholesterol", "Glucose", "Smoking", "Alcohol", "Active Lifestyle"].map((item, idx) => (
          <div key={idx} className="feature-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div className="icon-box" style={{ background: '#F0FDFA', color: '#0F766E', padding: '10px', borderRadius: '8px', display: 'flex' }}><Activity size={20} /></div>
            <p style={{ fontWeight: '600', color: '#334155', margin: 0 }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ModelStats = () => (
  <section className="section model-section" id="model" style={{ padding: '80px 0' }}>
    <div className="container">
      <div className="text-center" style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: '#0F172A' }}>Model Performance</h2>
        <p style={{ color: '#475569' }}>Comparative analysis of machine learning algorithms.</p>
      </div>
      <div className="stats-grid">
        <div className="models-list">
          <ModelAccuracyChart />
        </div>

        <div className="tech-info-card" style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0', height: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}><Brain size={20} color="#14B8A6" /> Methodology</h3>
          <ul className="tech-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: 0, margin: 0, listStyle: 'none' }}>
            <li style={{ display: 'flex', gap: '15px', color: '#475569', lineHeight: '1.5' }}>
              <CheckCircle size={20} color="#14B8A6" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong style={{ color: '#0F172A' }}>80/20 Train-Test Split:</strong> Ensures model validity on unseen data.</span>
            </li>
            <li style={{ display: 'flex', gap: '15px', color: '#475569', lineHeight: '1.5' }}>
              <CheckCircle size={20} color="#14B8A6" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong style={{ color: '#0F172A' }}>Standard Scaler:</strong> Normalizes inputs like Age and Weight for uniform analysis.</span>
            </li>
            <li style={{ display: 'flex', gap: '15px', color: '#475569', lineHeight: '1.5' }}>
              <CheckCircle size={20} color="#14B8A6" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong style={{ color: '#0F172A' }}>10-Fold Cross-Validation:</strong> Verified model consistency across different data subsets.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

/* --- PAGE 2: UPDATED PROFESSIONAL PREDICTION FORM --- */

const PredictionForm = () => {
  const width = useWindowSize();
  const isMobile = width < 768;
  const isTablet = width < 1024;

  const [probability, setProbability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [formData, setFormData] = useState({
    age: '', gender: '1', height: '', weight: '', ap_hi: '', ap_lo: '', chol: '1', gluc: '1', smoke: '0', alco: '0', active: '0'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (prediction !== null) setPrediction(null);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const values = [
        Number(formData.age),
        Number(formData.gender),
        Number(formData.height),
        Number(formData.weight),
        Number(formData.ap_hi),
        Number(formData.ap_lo),
        Number(formData.chol),
        Number(formData.gluc),
        Number(formData.smoke),
        Number(formData.alco),
        Number(formData.active)
      ];

     const response = await fetch("https://cardio-ml-7ynv.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: values }),
      });

      if (!response.ok) throw new Error("Server Error");

      const result = await response.json();

      setPrediction(result.prediction);
      setProbability(result.probability);

    } catch (err) {
      console.error(err);
      setError("Error connecting to server. Ensure Flask is running.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="section form-section" style={{ padding: isMobile ? '60px 0' : '120px 0', minHeight: '100vh', background: '#F1F5F9' }}>
      <div className="container">

        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '15px' }}>
          <div>
            <Link to="/" style={{ color: '#0F766E', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '0.9rem', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
            <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Clinical Assessment</h2>
            <p style={{ color: '#64748B', fontSize: '1.1rem', marginTop: '8px' }}>Enter patient health metrics for AI risk analysis.</p>
          </div>
        </div>

        {/* --- RESPONSIVE INLINE GRID APPLIED HERE --- */}
        <div className="demo-card" style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '2fr 1fr', gap: '0', background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>

          {/* LEFT SIDE: FORM */}
          <div className="form-side" style={{ padding: isMobile ? '20px' : '40px' }}>
            <form onSubmit={handleSubmit}>

              {/* Section 1: Personal Details */}
              <div style={{ marginBottom: '32px' }}>
                <SectionHeader icon={User} title="Patient Profile" />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                  <InputGroup label="Age (Years)" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 50" />
                  <InputGroup label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={[{ value: 1, label: 'Female' }, { value: 2, label: 'Male' }]} />
                  <InputGroup label="Height (cm)" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 165" />
                  <InputGroup label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 70" />
                </div>
              </div>

              {/* Section 2: Clinical Metrics */}
              <div style={{ marginBottom: '32px' }}>
                <SectionHeader icon={ClipboardList} title="Clinical Metrics" />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
                  <InputGroup label="Systolic BP (ap_hi)" name="ap_hi" value={formData.ap_hi} onChange={handleChange} placeholder="e.g. 120" />
                  <InputGroup label="Diastolic BP (ap_lo)" name="ap_lo" value={formData.ap_lo} onChange={handleChange} placeholder="e.g. 80" />
                  <InputGroup label="Cholesterol Level" name="chol" value={formData.chol} onChange={handleChange} options={[{ value: 1, label: 'Normal' }, { value: 2, label: 'Above Normal' }, { value: 3, label: 'Well Above Normal' }]} />
                  <InputGroup label="Glucose Level" name="gluc" value={formData.gluc} onChange={handleChange} options={[{ value: 1, label: 'Normal' }, { value: 2, label: 'Above Normal' }, { value: 3, label: 'Well Above Normal' }]} />
                </div>
              </div>

              {/* Section 3: Lifestyle */}
              <div style={{ marginBottom: '40px' }}>
                <SectionHeader icon={Dumbbell} title="Lifestyle Habits" />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '15px' }}>
                  <InputGroup label="Smoker" name="smoke" value={formData.smoke} onChange={handleChange} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                  <InputGroup label="Alcohol Intake" name="alco" value={formData.alco} onChange={handleChange} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                  <InputGroup label="Active Lifestyle" name="active" value={formData.active} onChange={handleChange} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', background: '#0F766E', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {loading ? 'Processing...' : <>Predict Risk <ChevronRight size={20} /></>}
              </button>
              {error && <p style={{ color: '#EF4444', textAlign: 'center', marginTop: '15px', fontWeight: '500' }}>{error}</p>}
            </form>
          </div>

          {/* RIGHT SIDE: RESULTS */}
          <div className="result-side" style={{ backgroundColor: '#F8FAFC', padding: isMobile ? '20px' : '40px', borderLeft: isTablet ? 'none' : '1px solid #E2E8F0', borderTop: isTablet ? '1px solid #E2E8F0' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {prediction === null && !loading && (
              <div style={{ textAlign: 'center', color: '#94A3B8' }}>
                <div style={{ background: '#E2E8F0', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <Stethoscope size={60} color="#64748B" />
                </div>
                <h3 style={{ color: '#475569', fontSize: '1.2rem', marginBottom: '8px' }}>Ready to Analyze</h3>
                <p style={{ fontSize: '0.9rem' }}>Fill out the clinical form on the left and submit to generate an AI risk assessment.</p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 20px auto', width: '60px', height: '60px', border: '5px solid #E2E8F0', borderTopColor: '#0F766E', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <h3 style={{ color: '#0F766E', fontWeight: '700', fontSize: '1.2rem' }}>Consulting AI Model...</h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Processing physiological data...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {prediction !== null && (
              <div style={{ width: '100%', animation: 'fadeIn 0.5s ease' }}>
                <div style={{
                  background: prediction === 1 ? '#FEF2F2' : '#F0FDF4',
                  color: prediction === 1 ? '#DC2626' : '#16A34A',
                  padding: '30px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  border: prediction === 1 ? '1px solid #FECACA' : '1px solid #BBF7D0'
                }}>
                  <div style={{ marginBottom: '15px', display: 'inline-block' }}>
                    {prediction === 1 ? <AlertTriangle size={60} /> : <CheckCircle size={60} />}
                  </div>
                  <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '800', margin: '0 0 10px 0' }}>
                    {prediction === 1 ? 'Heart Disease Detected' : 'No Heart Disease Detected'}
                  </h2>
                  <p style={{ margin: 0, fontWeight: '500', opacity: 0.9 }}>
                    {prediction === 1 ? "Cardiovascular disease patterns detected." : "No significant risk factors identified."}
                  </p>
                </div>

                <XAIExplanation formData={formData} prediction={prediction} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* --- MAIN APP ROUTING --- */

const HomePage = () => (
  <>
    <Navbar />
    <Hero />
    <Features />
    <ModelStats />
    <Footer />
  </>
);

const PredictPage = () => (
  <>
    <Navbar />
    <PredictionForm />
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ResponsiveStyles /> {/* Instantly handles missing responsive CSS classes */}
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/predict" element={<PredictPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;