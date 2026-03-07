import React, { useState, useEffect, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';

// Animated score counter
function AnimatedScore({ target }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [target]);
  return <>{display}</>;
}

function StatusPanel({ steps }) {
  if (steps.length === 0) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,20,30,0.95), rgba(20,28,40,0.95))',
      border: '1px solid rgba(99,179,237,0.2)',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '24px',
      boxShadow: '0 0 20px rgba(99,179,237,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#63b3ed',
          boxShadow: '0 0 8px #63b3ed',
          animation: 'pulse 1.5s infinite'
        }} />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#63b3ed', letterSpacing: '0.1em' }}>
          CLAUDE PROCESSING
        </p>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {steps.map((step, i) => (
          <li key={i} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: step.includes('✓') ? '#68d391' : '#a0aec0',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ color: step.includes('✓') ? '#68d391' : '#63b3ed' }}>
              {step.includes('✓') ? '✓' : '▸'}
            </span>
            {step.replace('✓', '').trim()}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RadarBlock({ label, diagnosis, lintResults, color, accentColor }) {
  const score = diagnosis
    ? Object.values(diagnosis).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0)
    : null;

  const data = diagnosis ? [
    { axis: 'Specificity', value: diagnosis.specificity },
    { axis: 'Context', value: diagnosis.context },
    { axis: 'Role', value: diagnosis.role_definition },
    { axis: 'Structure', value: diagnosis.output_structure },
    { axis: 'Constraints', value: diagnosis.constraints },
  ] : [];

  return (
    <div>
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        color: '#4a5568',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '16px'
      }}>{label}</p>

      {diagnosis ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '48px',
              fontWeight: '700',
              color,
              lineHeight: 1,
              textShadow: `0 0 20px ${color}60`
            }}>
              <AnimatedScore target={score} />
            </p>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '18px', color: '#4a5568' }}>/100</span>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#4a5568', letterSpacing: '0.1em', marginBottom: '16px' }}>
            PROMPT SCORE
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadarChart width={260} height={200} data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={1.5} />
            </RadarChart>
          </div>

          <p style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '13px',
            color: '#718096',
            fontStyle: 'italic',
            borderLeft: `2px solid ${color}40`,
            paddingLeft: '12px',
            marginTop: '12px',
            lineHeight: '1.6'
          }}>
            {diagnosis.summary}
          </p>

          {lintResults && lintResults.length > 0 && (
            <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lintResults.map((issue, i) => (
                <li key={i} style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: '#d69e2e',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(214,158,46,0.05)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(214,158,46,0.15)'
                }}>
                  <span>⚠</span>
                  {issue}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#2d3748' }}>
          awaiting input...
        </p>
      )}
    </div>
  );
}

function Panel({ children, style = {}, className }) {
  return (
    <div className={className} style={{
      background: 'rgba(13,17,23,0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '24px',
      backdropFilter: 'blur(10px)',
      ...style
    }}>
      {children}
    </div>
  );
}

function PanelTitle({ children }) {
  return (
    <p style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '11px',
      color: '#4a5568',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      marginBottom: '20px'
    }}>{children}</p>
  );
}

const TIPS = [
  "Vague prompts get vague answers — specificity is the single most impactful prompt skill",
  "Adding 'You are an expert in...' can dramatically shift the tone and depth of a response",
  "Structured output requests — like bullet points or numbered lists — reduce AI rambling by forcing prioritization",
  "Constraints aren't limitations — they're instructions. Word limits force the AI to keep only what matters",
  "Context is everything. The more the AI knows about your situation, the more useful its answer becomes",
  "The best prompts read like a brief to a smart colleague, not a Google search",
  "Output format matters as much as the question itself — always specify how you want the answer",
];

function CyclingTip({ active }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(prev => (prev + 1) % TIPS.length);
        setVisible(true);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
      <p style={{
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: '13px',
        color: '#4a5568',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: '1.6',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease'
      }}>
        💡 {TIPS[index]}
      </p>
    </div>
  );
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [lintResults, setLintResults] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [improvedDiagnosis, setImprovedDiagnosis] = useState(null);
  const [status, setStatus] = useState([]);
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [originalOutput, setOriginalOutput] = useState('');
  const [improvedOutput, setImprovedOutput] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showQuestions, setShowQuestions] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  function handleCopyPrompt() {
    navigator.clipboard.writeText(improvedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  function lintPrompt(text) {
    const issues = [];
    if (!text.toLowerCase().includes('you are') && !text.toLowerCase().includes("you're")) {
      issues.push('Missing role definition');
    }
    if (text.split(' ').length < 12) {
      issues.push('Prompt is too vague or short');
    }
    if (!text.includes('-') && !text.includes('1.') && !text.toLowerCase().includes('list')) {
      issues.push('No output structure specified');
    }
    if (!text.toLowerCase().includes('limit') && !text.toLowerCase().includes('words') && !text.toLowerCase().includes('concise')) {
      issues.push('No constraints on length');
    }
    if (!text.toLowerCase().includes('context') && !text.toLowerCase().includes('background') && !text.toLowerCase().includes('because')) {
      issues.push('No context provided');
    }
    return issues;
  }

  async function handleAnalyze() {
    setStatus([]);
    setDiagnosis(null);
    setImprovedDiagnosis(null);
    setImprovedPrompt('');
    setOriginalOutput('');
    setImprovedOutput('');
    setQuestions([]);
    setAnswers({});
    setShowQuestions(false);

    const issues = lintPrompt(prompt);
    setLintResults(issues);
    setStatus(['Analyzing your prompt...']);

    try {
      const diagResponse = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const diagData = await diagResponse.json();
      setDiagnosis(diagData);
      setStatus(prev => [...prev, 'Original prompt scored ✓']);

      setStatus(prev => [...prev, 'Generating clarifying questions...']);
      const questionsResponse = await fetch(`${API_URL}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, summary: diagData.summary })
      });
      if (!questionsResponse.ok) throw new Error('Questions failed: ' + questionsResponse.status);
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData.questions);
      setStatus(prev => [...prev, 'Generating clarifying questions ✓']);
      setShowQuestions(true);

    } catch (err) {
      console.error('Error:', err);
      setStatus(prev => [...prev, `✗ ${err.message}`]);
    }
  }

  async function handlePolish() {
    setShowQuestions(false);
    const answersArray = questions.map((q, i) => ({ question: q, answer: answers[i] || '' }));

    try {
      setStatus(prev => [...prev, 'Polishing your prompt...']);
      const polishResponse = await fetch(`${API_URL}/api/polish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, summary: diagnosis.summary, answers: answersArray })
      });
      if (!polishResponse.ok) throw new Error('Polish failed: ' + polishResponse.status);
      const polishData = await polishResponse.json();
      setImprovedPrompt(polishData.improved);
      setStatus(prev => [...prev, 'Prompt polished ✓']);

      setStatus(prev => [...prev, 'Scoring polished prompt...']);
      const improvedDiagResponse = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: polishData.improved })
      });
      if (!improvedDiagResponse.ok) throw new Error('Improved diagnosis failed');
      const improvedDiagData = await improvedDiagResponse.json();
      setImprovedDiagnosis(improvedDiagData);
      setStatus(prev => [...prev, 'Polished prompt scored ✓']);

      setStatus(prev => [...prev, 'Generating output comparison...']);
      const compareResponse = await fetch(`${API_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: prompt, improved: polishData.improved })
      });
      if (!compareResponse.ok) throw new Error(`Compare failed: ${compareResponse.status}`);
      const compareData = await compareResponse.json();
      setOriginalOutput(compareData.originalOutput);
      setImprovedOutput(compareData.improvedOutput);
      setStatus(prev => [...prev, 'Output comparison complete ✓']);

    } catch (err) {
      console.error('Error:', err);
      setStatus(prev => [...prev, `✗ ${err.message}`]);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #080c10;
          min-height: 100vh;
        }

        .pp-root {
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(99,179,237,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(104,211,145,0.03) 0%, transparent 50%),
            #080c10;
          color: #e2e8f0;
          padding: 48px 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fadeSlideUp 0.4s ease forwards;
        }

        textarea:focus { outline: none; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 2px; }
      `}</style>

      <div className="pp-root">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#63b3ed',
              boxShadow: '0 0 8px #63b3ed'
            }} />
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: '#4a5568',
              letterSpacing: '0.3em',
              textTransform: 'uppercase'
            }}>AI Prompt Engineering</p>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#63b3ed',
              boxShadow: '0 0 8px #63b3ed'
            }} />
          </div>
          <h1 style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '52px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #718096 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            Prompt Polish
          </h1>
          <p style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '15px',
            color: '#4a5568'
          }}>
            Diagnose, refine, and compare your AI prompts
          </p>
        </div>

        {/* Input Panel */}
        <Panel style={{ marginBottom: '20px' }}>
          <PanelTitle>Input Prompt</PanelTitle>
          <textarea
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '14px 16px',
              color: '#e2e8f0',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '14px',
              lineHeight: '1.6',
              resize: 'none',
              transition: 'border-color 0.2s'
            }}
            rows={4}
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.3)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={handleAnalyze}
              style={{
                background: 'linear-gradient(135deg, #2d5a8e, #1a3a5c)',
                border: '1px solid rgba(99,179,237,0.3)',
                borderRadius: '8px',
                padding: '10px 24px',
                color: '#90cdf4',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0 20px rgba(99,179,237,0.1)'
              }}
              onMouseEnter={e => e.target.style.boxShadow = '0 0 30px rgba(99,179,237,0.2)'}
              onMouseLeave={e => e.target.style.boxShadow = '0 0 20px rgba(99,179,237,0.1)'}
            >
              ANALYZE PROMPT
            </button>
            <button
              onClick={() => setPrompt('How do I win a hackathon?')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '10px 24px',
                color: '#4a5568',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = '#718096'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.color = '#4a5568'; }}
            >
              LOAD EXAMPLE
            </button>
          </div>
        </Panel>

        {/* Status */}
        <StatusPanel steps={status} />

        {/* Clarifying Questions Panel */}
        {showQuestions && (
          <Panel style={{ marginBottom: '20px' }} className="fade-in">
            <PanelTitle>Clarifying Questions</PanelTitle>
            <p style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '13px',
              color: '#718096',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              Answer these to get a more personalized polish. You can leave any blank.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, i) => (
                <div key={i}>
                  <p style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: '13px',
                    color: '#a0aec0',
                    marginBottom: '8px',
                    lineHeight: '1.5'
                  }}>{q}</p>
                  <input
                    type="text"
                    value={answers[i] || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                    placeholder="Your answer..."
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#e2e8f0',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: '13px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.3)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handlePolish}
              style={{
                marginTop: '20px',
                background: 'linear-gradient(135deg, #276749, #1a4731)',
                border: '1px solid rgba(104,211,145,0.3)',
                borderRadius: '8px',
                padding: '10px 24px',
                color: '#9ae6b4',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0 20px rgba(104,211,145,0.1)'
              }}
              onMouseEnter={e => e.target.style.boxShadow = '0 0 30px rgba(104,211,145,0.2)'}
              onMouseLeave={e => e.target.style.boxShadow = '0 0 20px rgba(104,211,145,0.1)'}
            >
              POLISH MY PROMPT
            </button>
          </Panel>
        )}

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Diagnostics */}
          <Panel>
            <PanelTitle>Prompt Diagnostics</PanelTitle>
            <RadarBlock
              label="Original Prompt"
              diagnosis={diagnosis}
              lintResults={lintResults}
              color="#f6ad55"
            />
            {improvedDiagnosis && (
              <div className="fade-in">
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', margin: '28px 0' }} />
                <RadarBlock
                  label="Polished Prompt"
                  diagnosis={improvedDiagnosis}
                  lintResults={[]}
                  color="#68d391"
                />
              </div>
            )}
          </Panel>

          {/* Improvement */}
          <Panel>
            <PanelTitle>Prompt Improvement</PanelTitle>
            {improvedPrompt ? (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px',
                    color: '#4a5568',
                    letterSpacing: '0.15em',
                    marginBottom: '8px'
                  }}>ORIGINAL</p>
                  <p style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: '13px',
                    color: '#718096',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    padding: '12px',
                    lineHeight: '1.6'
                  }}>{prompt}</p>
                </div>
                <div style={{ textAlign: 'center', color: '#2d3748', fontSize: '18px' }}>↓</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color: '#68d391',
                      letterSpacing: '0.15em',
                    }}>POLISHED</p>
                    <button
                      onClick={handleCopyPrompt}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        color: copiedPrompt ? '#68d391' : '#4a5568',
                        cursor: 'pointer',
                        padding: '0',
                        transition: 'color 0.2s'
                      }}
                    >
                      {copiedPrompt ? 'COPIED ✓' : 'COPY'}
                    </button>
                  </div>
                  <p style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: '13px',
                    color: '#e2e8f0',
                    background: 'rgba(104,211,145,0.03)',
                    border: '1px solid rgba(104,211,145,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>{improvedPrompt}</p>
                </div>
              </div>
            ) : (
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#2d3748' }}>
                awaiting analysis...
              </p>
            )}
          </Panel>

          {/* Original Output */}
          <Panel>
            <PanelTitle>Original Output</PanelTitle>
            {originalOutput ? (
              <p className="fade-in" style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                color: '#718096',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '8px',
                padding: '14px',
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap'
              }}>{originalOutput}</p>
            ) : (
              <>
                {status.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#63b3ed',
                      boxShadow: '0 0 6px #63b3ed',
                      flexShrink: 0,
                      animation: 'pulse 1.5s infinite'
                    }} />
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      color: '#4a5568',
                      letterSpacing: '0.05em'
                    }}>{status[status.length - 1].replace('✓', '').trim()}</span>
                  </div>
                )}
                <CyclingTip active={status.length > 0} />
              </>
            )}
          </Panel>

          {/* Improved Output */}
          <Panel>
            <PanelTitle>Improved Output</PanelTitle>
            {improvedOutput ? (
              <p className="fade-in" style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                color: '#e2e8f0',
                background: 'rgba(104,211,145,0.02)',
                border: '1px solid rgba(104,211,145,0.08)',
                borderRadius: '8px',
                padding: '14px',
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap'
              }}>{improvedOutput}</p>
            ) : (
              <>
                {status.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#63b3ed',
                      boxShadow: '0 0 6px #63b3ed',
                      flexShrink: 0,
                      animation: 'pulse 1.5s infinite'
                    }} />
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      color: '#4a5568',
                      letterSpacing: '0.05em'
                    }}>{status[status.length - 1].replace('✓', '').trim()}</span>
                  </div>
                )}
                <CyclingTip active={status.length > 0} />
              </>
            )}
          </Panel>

        </div>
      </div>
    </>
  );
}