import React, { useState, useEffect } from 'react';
import { fetchServerAnalytics, clearAnalytics } from './AdTracker';
import './ads.css';

const AdDashboard = () => {
  const [adStats, setAdStats] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const serverData = await fetchServerAnalytics(dateRange.start, dateRange.end);
      setAdStats(serverData || {});
    } catch (err) {
      setError('Failed to load analytics from server');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = () => {
    loadAnalytics();
  };

  const handleDateFilter = () => {
    loadAnalytics();
  };

  const handleExport = () => {
    const exportData = {
      dateRange,
      generatedAt: new Date().toISOString(),
      adStats
    };
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ad-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear local analytics cache?')) {
      clearAnalytics();
      alert('Local cache cleared. Server data remains intact.');
    }
  };

  if (loading) {
    return <div className="ad-dashboard-loading">Loading analytics from server...</div>;
  }

  if (error) {
    return (
      <div className="ad-dashboard-error">
        <p>{error}</p>
        <button onClick={handleRefresh} className="ad-btn">Retry</button>
      </div>
    );
  }

  const adIds = Object.keys(adStats);
  const totalImpressions = adIds.reduce((sum, id) => sum + (adStats[id]?.impressions || 0), 0);
  const totalClicks = adIds.reduce((sum, id) => sum + (adStats[id]?.clicks || 0), 0);
  const totalUniqueImpressions = adIds.reduce((sum, id) => sum + (adStats[id]?.uniqueImpressions || 0), 0);
  const totalUniqueClicks = adIds.reduce((sum, id) => sum + (adStats[id]?.uniqueClicks || 0), 0);
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const adsWithStats = adIds.map(adId => ({
    id: adId,
    impressions: adStats[adId]?.impressions || 0,
    clicks: adStats[adId]?.clicks || 0,
    uniqueImpressions: adStats[adId]?.uniqueImpressions || 0,
    uniqueClicks: adStats[adId]?.uniqueClicks || 0,
    ctr: adStats[adId]?.ctr || '0.00'
  })).sort((a, b) => b.impressions - a.impressions);

  return (
    <div className="ad-dashboard">
      <div className="ad-dashboard-header">
        <h1>📊 Ad Analytics Dashboard</h1>
        <div className="ad-dashboard-actions">
          <button onClick={handleRefresh} className="ad-btn">
            <i className="fa fa-refresh"></i> Refresh
          </button>
          <button onClick={handleExport} className="ad-btn">
            <i className="fa fa-download"></i> Export
          </button>
          <button onClick={handleClear} className="ad-btn ad-btn-danger">
            <i className="fa fa-trash"></i> Clear Cache
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="ad-date-filter">
        <input 
          type="date" 
          value={dateRange.start} 
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
        />
        <span style={{ opacity: 0.6 }}>to</span>
        <input 
          type="date" 
          value={dateRange.end} 
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
        />
        <button onClick={handleDateFilter} className="ad-btn">
          <i className="fa fa-filter"></i> Filter
        </button>
        {(dateRange.start || dateRange.end) && (
          <button onClick={() => { setDateRange({ start: '', end: '' }); loadAnalytics(); }} className="ad-btn ad-btn-secondary">
            Clear
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="ad-stats-grid">
        <div className="ad-stat-card">
          <div className="ad-stat-icon">👁️</div>
          <div className="ad-stat-info">
            <span className="ad-stat-value">{totalImpressions}</span>
            <span className="ad-stat-label">Impressions</span>
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-icon">👤</div>
          <div className="ad-stat-info">
            <span className="ad-stat-value">{totalUniqueImpressions}</span>
            <span className="ad-stat-label">Unique Impressions</span>
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-icon">🖱️</div>
          <div className="ad-stat-info">
            <span className="ad-stat-value">{totalClicks}</span>
            <span className="ad-stat-label">Clicks</span>
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-icon">👆</div>
          <div className="ad-stat-info">
            <span className="ad-stat-value">{totalUniqueClicks}</span>
            <span className="ad-stat-label">Unique Clicks</span>
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-icon">📈</div>
          <div className="ad-stat-info">
            <span className="ad-stat-value">{overallCTR}%</span>
            <span className="ad-stat-label">Overall CTR</span>
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-icon">📊</div>
          <div className="ad-stat-info">
            <span className="ad-stat-value">{adIds.length}</span>
            <span className="ad-stat-label">Total Ads</span>
          </div>
        </div>
      </div>

      {/* All Ads with Stats */}
      <div className="ad-breakdown">
        <h2>📋 Ad Performance {dateRange.start || dateRange.end ? `(${dateRange.start || 'Start'} - ${dateRange.end || 'Now'})` : '(All Time)'}</h2>
        
        {adsWithStats.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.6, padding: '40px' }}>No analytics data available for this date range.</p>
        ) : (
          <table className="ad-table">
            <thead>
              <tr>
                <th>Ad ID</th>
                <th>Impressions</th>
                <th>Unique Imp.</th>
                <th>Clicks</th>
                <th>Unique Clicks</th>
                <th>CTR</th>
              </tr>
            </thead>
            <tbody>
              {adsWithStats.map((ad) => (
                <tr key={ad.id}>
                  <td><strong>{ad.id}</strong></td>
                  <td>{ad.impressions}</td>
                  <td>{ad.uniqueImpressions}</td>
                  <td>{ad.clicks}</td>
                  <td>{ad.uniqueClicks}</td>
                  <td>{ad.ctr}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .ad-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .ad-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ad-dashboard-header h1 {
          font-size: 24px;
          color: var(--heading-color);
        }

        .ad-dashboard-actions {
          display: flex;
          gap: 10px;
        }

        .ad-date-filter {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .ad-date-filter input {
          padding: 8px 12px;
          border: 1px solid rgba(var(--button-color-rgb), 0.3);
          border-radius: 8px;
          background: var(--card-background);
          color: var(--text-color);
          font-size: 14px;
        }

        .ad-id-input {
          min-width: 120px;
        }

        .ad-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          background: var(--button-color);
          color: white;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .ad-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .ad-btn-danger {
          background: #ef4444;
        }

        .ad-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .ad-stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: var(--card-background);
          border-radius: 12px;
          box-shadow: 0 2px 8px var(--shadow-color);
        }

        .ad-stat-icon {
          font-size: 32px;
        }

        .ad-stat-info {
          display: flex;
          flex-direction: column;
        }

        .ad-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--heading-color);
        }

        .ad-stat-label {
          font-size: 12px;
          color: var(--text-color);
          opacity: 0.7;
        }

        .ad-breakdown {
          background: var(--card-background);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px var(--shadow-color);
        }

        .ad-breakdown h2 {
          font-size: 18px;
          margin-bottom: 16px;
          color: var(--heading-color);
        }

        .ad-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .ad-detail-card {
          background: var(--background-color);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(var(--button-color-rgb), 0.15);
          transition: all 0.3s;
        }

        .ad-detail-card:hover {
          box-shadow: 0 4px 16px var(--shadow-color);
          transform: translateY(-2px);
        }

        .ad-detail-card.ad-inactive {
          opacity: 0.6;
        }

        .ad-detail-image {
          width: 100%;
          height: 150px;
          overflow: hidden;
          background: rgba(var(--button-color-rgb), 0.05);
        }

        .ad-detail-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ad-detail-content {
          padding: 16px;
        }

        .ad-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
        }

        .ad-detail-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--heading-color);
          margin: 0;
        }

        .ad-status {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .ad-status.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .ad-status.inactive {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .ad-detail-desc {
          font-size: 13px;
          color: var(--text-color);
          opacity: 0.7;
          margin: 0 0 12px;
          line-height: 1.4;
        }

        .ad-detail-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--text-color);
          opacity: 0.6;
          margin-bottom: 12px;
        }

        .ad-detail-meta i {
          margin-right: 4px;
        }

        .ad-detail-stats {
          display: flex;
          gap: 16px;
          padding: 12px;
          background: rgba(var(--button-color-rgb), 0.05);
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .ad-detail-stat {
          flex: 1;
          text-align: center;
        }

        .ad-detail-stat .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--heading-color);
        }

        .ad-detail-stat .stat-label {
          font-size: 11px;
          color: var(--text-color);
          opacity: 0.6;
        }

        .ad-detail-positions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .position-tag {
          font-size: 10px;
          padding: 3px 8px;
          background: rgba(var(--button-color-rgb), 0.1);
          color: var(--button-color);
          border-radius: 4px;
          font-weight: 500;
        }

        .ad-btn-secondary {
          background: transparent;
          border: 1px solid rgba(var(--button-color-rgb), 0.3);
          color: var(--text-color);
        }

        .ad-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ad-table th,
        .ad-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .ad-table th {
          font-weight: 600;
          color: var(--heading-color);
          background: rgba(0, 0, 0, 0.05);
        }

        .ad-table code {
          background: rgba(var(--button-color-rgb), 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default AdDashboard;
