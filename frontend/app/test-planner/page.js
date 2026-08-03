'use client';

import React, { useState, useEffect } from 'react';
import usePlanner from '../../hooks/usePlanner';

export default function TestPlannerPage() {
  const [city, setCity] = useState('Pune');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('2000');
  const [duration, setDuration] = useState('180');
  const [group, setGroup] = useState('Couple');
  const [selectedTemplate, setSelectedTemplate] = useState('Coffee & Conversations');
  const [preferencesStr, setPreferencesStr] = useState('Late Night');
  const [result, setResult] = useState(null);

  const {
    loading,
    error,
    templates,
    areas,
    fetchAreas,
    generateExperience,
  } = usePlanner(city);

  // Re-fetch areas when city changes
  useEffect(() => {
    fetchAreas(city);
    setArea(''); // reset area selection
  }, [city, fetchAreas]);

  // Handle generation form submit
  const handleGenerate = async (e) => {
    e.preventDefault();
    setResult(null);

    const preferences = preferencesStr
      ? preferencesStr.split(',').map((x) => x.trim()).filter(Boolean)
      : [];

    const params = {
      city,
      area: area || null,
      budget: budget ? parseFloat(budget) : null,
      duration: duration ? parseInt(duration) : null,
      group,
      experienceTemplate: selectedTemplate,
      preferences
    };

    const res = await generateExperience(params);
    setResult(res);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>WEEKENDR - Developer Planner API Test Page</h1>
      <hr />

      <form onSubmit={handleGenerate} style={{ maxWidth: '500px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>City: </label>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Area: </label>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">-- City Wide Search --</option>
            {areas.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Budget (₹): </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 2000"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Duration (mins): </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 180"
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Group: </label>
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="Solo">Solo</option>
            <option value="Couple">Couple</option>
            <option value="Friends">Friends</option>
            <option value="Family">Family</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Template: </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            {Object.keys(templates).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Preferences (comma separated): </label>
          <input
            type="text"
            value={preferencesStr}
            onChange={(e) => setPreferencesStr(e.target.value)}
            placeholder="e.g. Late Night, Indoor"
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          {loading ? 'Generating...' : 'Generate Itinerary'}
        </button>
      </form>

      <hr />

      {loading && <div style={{ color: 'blue', fontWeight: 'bold' }}>LOADING...</div>}
      
      {error && (
        <div style={{ border: '2px solid red', padding: '10px', color: 'red', margin: '10px 0' }}>
          <strong>ERROR:</strong> {error}
        </div>
      )}

      {result && (
        <div>
          <h3>API RESPONSE STATUS: {result.success ? 'SUCCESS (200)' : 'FAILED'}</h3>
          <p>{result.message}</p>
          <pre
            style={{
              background: '#f4f4f4',
              padding: '15px',
              border: '1px solid #ccc',
              overflowX: 'auto',
              maxHeight: '600px',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
