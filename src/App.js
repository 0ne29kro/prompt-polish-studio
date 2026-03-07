import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';

function StatusPanel({ steps }) {
  if (steps.length === 0) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6">
      <p className="text-sm font-semibold text-gray-300 mb-3">🤖 Claude is working...</p>
      <ul className="space-y-1">
        {steps.map((step, i) => (
          <li key={i} className="text-sm text-green-400 flex items-center gap-2">
            <span>▸</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RadarBlock({ label, diagnosis, lintResults, color }) {
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
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      {diagnosis ? (
        <>
          <p className="text-3xl font-bold">
            <span style={{ color }}>{score}</span>
            <span className="text-gray-500 text-lg"> / 100</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Prompt Score</p>
          <div className="flex justify-center mt-4">
            <RadarChart width={260} height={200} data={data}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.4} />
            </RadarChart>
          </div>
          <p className="text-gray-400 text-sm mt-3 italic border-l-2 border-gray-700 pl-3">
            {diagnosis.summary}
          </p>
          {lintResults && lintResults.length > 0 && (
            <ul className="space-y-2 mt-4">
              {lintResults.map((issue, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-yellow-400">
                  <span>⚠</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-sm">Analysis will appear here...</p>
      )}
    </div>
  );
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [lintResults, setLintResults] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [improvedDiagnosis, setImprovedDiagnosis] = useState(null);
  const [status, setStatus] = useState([]);
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [originalOutput, setOriginalOutput] = useState('');
  const [improvedOutput, setImprovedOutput] = useState('');

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
    console.log('clicked', prompt);
    setStatus([]);
    setDiagnosis(null);
    setImprovedDiagnosis(null);
    setImprovedPrompt('');
    setOriginalOutput('');
    setImprovedOutput('');

    const issues = lintPrompt(prompt);
    setLintResults(issues);
    setStatus(['Analyzing your prompt...']);

    try {
      const diagResponse = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const diagData = await diagResponse.json();
      setDiagnosis(diagData);
      setStatus(prev => [...prev, 'Original prompt scored ✓']);

      setStatus(prev => [...prev, 'Polishing your prompt...']);
      const polishResponse = await fetch('http://localhost:3001/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, summary: diagData.summary })
      });
      const polishData = await polishResponse.json();
      setImprovedPrompt(polishData.improved);
      setStatus(prev => [...prev, 'Prompt polished ✓']);

      setStatus(prev => [...prev, 'Scoring polished prompt...']);
      const improvedDiagResponse = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: polishData.improved })
      });
      const improvedDiagData = await improvedDiagResponse.json();
      setImprovedDiagnosis(improvedDiagData);
      setStatus(prev => [...prev, 'Polished prompt scored ✓']);

      setStatus(prev => [...prev, 'Generating output comparison...']);
      const compareResponse = await fetch('http://localhost:3001/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: prompt, improved: polishData.improved })
      });
      if (!compareResponse.ok) throw new Error('Compare failed: ' + compareResponse.status);
      const compareData = await compareResponse.json();
      setOriginalOutput(compareData.originalOutput);
      setImprovedOutput(compareData.improvedOutput);
      setStatus(prev => [...prev, 'Output comparison complete ✓']);

    } catch (err) {
      console.error('Error:', err);
      setStatus(prev => [...prev, '✗ Something failed']);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Prompt Polish</h1>
        <p className="text-gray-400 mt-2">AI Prompt Diagnostics and Improvement</p>
      </div>

      {/* Prompt Input Panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Prompt</h2>
        <textarea
          className="w-full bg-gray-800 text-white rounded-lg p-4 text-sm resize-none outline-none border border-gray-700 focus:border-gray-500"
          rows={4}
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAnalyze}
            className="bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition">
            Analyze Prompt
          </button>
          <button
            onClick={() => setPrompt('How do I win a hackathon?')}
            className="bg-gray-800 text-gray-300 font-semibold px-6 py-2 rounded-lg hover:bg-gray-700 transition">
            Load Example
          </button>
        </div>
      </div>

      {/* Status Panel */}
      <StatusPanel steps={status} />

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-6">

        {/* Diagnostics Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Prompt Diagnostics</h2>
          <RadarBlock
            label="Original Prompt"
            diagnosis={diagnosis}
            lintResults={lintResults}
            color="#f97316"
          />
          {improvedDiagnosis && (
            <>
              <div className="border-t border-gray-800 my-6" />
              <RadarBlock
                label="Polished Prompt"
                diagnosis={improvedDiagnosis}
                lintResults={[]}
                color="#4ade80"
              />
            </>
          )}
        </div>

        {/* Improvement Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Prompt Improvement</h2>
          {improvedPrompt ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Original</p>
                <p className="text-gray-400 text-sm bg-gray-800 rounded-lg p-3">{prompt}</p>
              </div>
              <div className="text-center text-gray-500">▼</div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Polished</p>
                <p className="text-white text-sm bg-gray-800 rounded-lg p-3 whitespace-pre-wrap">{improvedPrompt}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Improved prompt will appear here...</p>
          )}
        </div>

        {/* Original Output Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Original Output</h2>
          {originalOutput ? (
            <p className="text-gray-300 text-sm bg-gray-800 rounded-lg p-3 whitespace-pre-wrap">{originalOutput}</p>
          ) : (
            <p className="text-gray-500 text-sm">Output will appear here...</p>
          )}
        </div>

        {/* Improved Output Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Improved Output</h2>
          {improvedOutput ? (
            <p className="text-white text-sm bg-gray-800 rounded-lg p-3 whitespace-pre-wrap">{improvedOutput}</p>
          ) : (
            <p className="text-gray-500 text-sm">Output will appear here...</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;