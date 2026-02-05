import React, { useState } from 'react';

export default function App() {
  const [opinion, setOpinion] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [challenge, setChallenge] = useState('');
  const [expected, setExpected] = useState([]);
  const [userCode, setUserCode] = useState('// write a function here\nfunction defends(data) {\n  return false;\n}');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    setAnalysis(null);
    setChallenge('');
    setResult(null);
    try {
      const r = await fetch('http://localhost:3000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opinion })
      });
      const j = await r.json();
      if (r.ok) {
        setAnalysis(j.analysis);
        setChallenge(j.challenge);
        setExpected(j.expected || []);
      } else {
        alert(JSON.stringify(j));
      }
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluate() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('http://localhost:3000/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge, userCode, expected })
      });
      const j = await r.json();
      if (r.ok) setResult(j.result);
      else alert(JSON.stringify(j));
    } catch (e) {
      alert(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui' }}>
      <h2>Argumentation Game (mobile-ready)</h2>
      <p>Type an opinion and press Analyze.</p>

      <textarea
        placeholder="Write an opinion..."
        value={opinion}
        onChange={(e) => setOpinion(e.target.value)}
        rows={4}
        style={{ width: '100%', fontSize: 16 }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleAnalyze} disabled={loading || !opinion}>Analyze</button>
      </div>

      {analysis && (
        <section style={{ marginTop: 16 }}>
          <h3>Analysis</h3>
          <div><strong>Claim:</strong> {analysis.claim}</div>
          <div><strong>Premises:</strong>
            <ul>{(analysis.premises || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
          <div><strong>Inferences:</strong>
            <ul>{(analysis.inferences || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
          <h4>Challenge</h4>
          <div>{challenge}</div>

          <h4 style={{ marginTop: 8 }}>Write code (JS)</h4>
          <textarea value={userCode} onChange={(e) => setUserCode(e.target.value)} rows={8} style={{ width: '100%' }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={handleEvaluate} disabled={loading}>Submit Code</button>
          </div>
        </section>
      )}

      {result && (
        <section style={{ marginTop: 16 }}>
          <h3>Result</h3>
          <div><strong>Pass:</strong> {String(result.pass)}</div>
          <div><strong>Score:</strong> {result.score}</div>
          <div><strong>Feedback:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{result.feedback}</pre>
          </div>
          <div><strong>Suggestions:</strong>
            <ul>{(result.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </section>
      )}
    </div>
  );
}