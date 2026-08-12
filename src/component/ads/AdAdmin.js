import React, { useState, useEffect } from 'react';
import { API_BASE } from './config';
import { getAnalyticsSummary } from './AdTracker';
import { useAuth, authFetch } from './AdminAuth';
import './admin.css';

// Local storage key for ads when backend is unavailable
const LOCAL_ADS_KEY = 'local-ads-data';
const getLocalAds = () => { try { return JSON.parse(localStorage.getItem(LOCAL_ADS_KEY)) || []; } catch { return []; } };
const saveLocalAds = (ads) => localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(ads));

const POSITION_OPTIONS = [
  { value: 'top-banner', label: 'Top Banner' },
  { value: 'sticky-footer', label: 'Sticky Footer' },
  { value: 'interstitial', label: 'Interstitial (Full Screen)' },
  { value: 'native-class', label: 'Native - Classes' },
  { value: 'native-event', label: 'Native - Events' },
  { value: 'card', label: 'Card Ad' },
];

const AdAdmin = () => {
  const { logout } = useAuth();
  const [ads, setAds] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list, add, analytics
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    id: '', title: '', description: '', tagline: '', imageUrl: '', targetUrl: '',
    sponsor: '', ctaText: '', priority: 2, positions: [], startDate: '', endDate: '',
    budget: '', costPerImpression: '', costPerClick: '', isActive: true
  });

  useEffect(() => {
    fetchAds();
    fetchAnalytics();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/ads/all`);
      if (!res.ok) throw new Error('Backend unavailable');
      const data = await res.json();
      setAds(data.ads || []);
    } catch (err) {
      console.log('[AdAdmin] Backend unavailable, using local storage');
      setAds(getLocalAds());
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/ads/analytics`);
      if (!res.ok) throw new Error('Backend unavailable');
      const data = await res.json();
      setAnalytics(data.analytics || {});
    } catch (err) {
      console.log('[AdAdmin] Using local analytics');
      setAnalytics(getAnalyticsSummary());
    }
  };

  const showMessage = (msg, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePositionToggle = (position) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(position)
        ? prev.positions.filter(p => p !== position)
        : [...prev.positions, position]
    }));
  };

  const resetForm = () => {
    setFormData({
      id: '', title: '', description: '', tagline: '', imageUrl: '', targetUrl: '',
      sponsor: '', ctaText: '', priority: 2, positions: [], startDate: '', endDate: '',
      budget: '', costPerImpression: '', costPerClick: '', isActive: true
    });
    setEditingAd(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.title || !formData.targetUrl) {
      showMessage('ID, Title, and Target URL are required', true);
      return;
    }

    const adData = {
      ...formData,
      priority: parseInt(formData.priority) || 2,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      costPerImpression: formData.costPerImpression ? parseFloat(formData.costPerImpression) : undefined,
      costPerClick: formData.costPerClick ? parseFloat(formData.costPerClick) : undefined,
    };

    try {
      const url = editingAd ? `${API_BASE}/api/ads/${editingAd}` : `${API_BASE}/api/ads`;
      const method = editingAd ? 'PUT' : 'POST';
      
      const res = await authFetch(url, {
        method,
        body: JSON.stringify(adData)
      });

      if (!res.ok) throw new Error('Backend unavailable');
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      showMessage(editingAd ? 'Ad updated successfully!' : 'Ad created successfully!');
    } catch (err) {
      // Fall back to local storage
      console.log('[AdAdmin] Saving to local storage');
      const localAds = getLocalAds();
      if (editingAd) {
        const idx = localAds.findIndex(a => a.id === editingAd);
        if (idx >= 0) localAds[idx] = adData;
      } else {
        localAds.push(adData);
      }
      saveLocalAds(localAds);
      showMessage(editingAd ? 'Ad updated locally!' : 'Ad created locally!');
    }
    
    resetForm();
    fetchAds();
    setActiveTab('list');
  };

  const handleEdit = (ad) => {
    setFormData({
      id: ad.id,
      title: ad.title || '',
      description: ad.description || '',
      tagline: ad.tagline || '',
      imageUrl: ad.imageUrl || '',
      targetUrl: ad.targetUrl || '',
      sponsor: ad.sponsor || '',
      ctaText: ad.ctaText || '',
      priority: ad.priority || 2,
      positions: ad.positions || [],
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
      budget: ad.budget || '',
      costPerImpression: ad.costPerImpression || '',
      costPerClick: ad.costPerClick || '',
      isActive: ad.isActive !== false
    });
    setEditingAd(ad.id);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete ad "${id}"? This cannot be undone.`)) return;
    
    try {
      const res = await authFetch(`${API_BASE}/api/ads/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Backend unavailable');
      showMessage('Ad deleted successfully!');
    } catch (err) {
      // Fall back to local storage
      console.log('[AdAdmin] Deleting from local storage');
      const localAds = getLocalAds().filter(a => a.id !== id);
      saveLocalAds(localAds);
      showMessage('Ad deleted locally!');
    }
    fetchAds();
  };

  const handleToggleActive = async (ad) => {
    try {
      const res = await authFetch(`${API_BASE}/api/ads/${ad.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !ad.isActive })
      });
      if (!res.ok) throw new Error('Backend unavailable');
    } catch (err) {
      // Fall back to local storage
      console.log('[AdAdmin] Toggling in local storage');
      const localAds = getLocalAds();
      const idx = localAds.findIndex(a => a.id === ad.id);
      if (idx >= 0) {
        localAds[idx].isActive = !localAds[idx].isActive;
        saveLocalAds(localAds);
      }
    }
    fetchAds();
  };

  const getAdStatus = (ad) => {
    const now = new Date();
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);
    if (!ad.isActive) return { label: 'Inactive', class: 'status-inactive' };
    if (now < start) return { label: 'Scheduled', class: 'status-scheduled' };
    if (now > end) return { label: 'Expired', class: 'status-expired' };
    return { label: 'Active', class: 'status-active' };
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="ad-admin">
      <div className="admin-header">
        <h1>📢 Ad Manager</h1>
        <div className="admin-tabs">
          <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => { setActiveTab('list'); resetForm(); }}>
            <i className="fa fa-list"></i> All Ads
          </button>
          <button className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => { setActiveTab('add'); resetForm(); }}>
            <i className="fa fa-plus"></i> {editingAd ? 'Edit Ad' : 'Add Ad'}
          </button>
          <button className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <i className="fa fa-bar-chart"></i> Analytics
          </button>
          <button className="tab" onClick={logout} style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626' }}>
            <i className="fa fa-sign-out"></i> Logout
          </button>
        </div>
      </div>

      {error && <div className="admin-alert error">{error}</div>}
      {success && <div className="admin-alert success">{success}</div>}

      {/* ADS LIST */}
      {activeTab === 'list' && (
        <div className="ads-list">
          <div className="list-header">
            <span>{ads.length} ad(s)</span>
            <button className="btn-primary" onClick={() => setActiveTab('add')}>+ New Ad</button>
          </div>
          
          {ads.length === 0 ? (
            <div className="empty-state">No ads yet. Create your first ad!</div>
          ) : (
            <div className="ads-grid">
              {ads.map(ad => {
                const status = getAdStatus(ad);
                const stats = analytics[ad.id] || { impressions: 0, clicks: 0, ctr: '0' };
                return (
                  <div key={ad.id} className="ad-item">
                    <div className="ad-item-header">
                      <span className={`status-badge ${status.class}`}>{status.label}</span>
                      <div className="ad-actions">
                        <button onClick={() => handleToggleActive(ad)} title={ad.isActive ? 'Deactivate' : 'Activate'}>
                          <i className={`fa fa-${ad.isActive ? 'pause' : 'play'}`}></i>
                        </button>
                        <button onClick={() => handleEdit(ad)} title="Edit"><i className="fa fa-edit"></i></button>
                        <button onClick={() => handleDelete(ad.id)} title="Delete" className="btn-danger"><i className="fa fa-trash"></i></button>
                      </div>
                    </div>
                    {ad.imageUrl && <div className="ad-thumb" style={{ backgroundImage: `url(${ad.imageUrl})` }}></div>}
                    <div className="ad-item-body">
                      <h3>{ad.title}</h3>
                      <p>{ad.description}</p>
                      <div className="ad-meta">
                        <span><i className="fa fa-building"></i> {ad.sponsor}</span>
                        <span><i className="fa fa-link"></i> {ad.targetUrl?.substring(0, 30)}...</span>
                      </div>
                      <div className="ad-positions">
                        {ad.positions?.map(p => <span key={p} className="position-tag">{p}</span>)}
                      </div>
                      <div className="ad-stats">
                        <span>👁️ {stats.impressions}</span>
                        <span>🖱️ {stats.clicks}</span>
                        <span>📈 {stats.ctr}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD/EDIT FORM */}
      {activeTab === 'add' && (
        <form className="ad-form" onSubmit={handleSubmit}>
          <h2>{editingAd ? `Edit: ${editingAd}` : 'Create New Ad'}</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Ad ID *</label>
              <input name="id" value={formData.id} onChange={handleInputChange} placeholder="unique-ad-id" disabled={!!editingAd} required />
            </div>
            <div className="form-group">
              <label>Sponsor Name</label>
              <input name="sponsor" value={formData.sponsor} onChange={handleInputChange} placeholder="Company Name" />
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Ad headline" required />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Detailed description" rows="3" />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input name="tagline" value={formData.tagline} onChange={handleInputChange} placeholder="Short catchy text" />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Image URL</label>
              <input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Target URL *</label>
              <input name="targetUrl" value={formData.targetUrl} onChange={handleInputChange} placeholder="https://..." required />
            </div>
          </div>

          <div className="form-grid cols-3">
            <div className="form-group">
              <label>CTA Text</label>
              <input name="ctaText" value={formData.ctaText} onChange={handleInputChange} placeholder="Learn More" />
            </div>
            <div className="form-group">
              <label>Priority (1=High, 3=Low)</label>
              <select name="priority" value={formData.priority} onChange={handleInputChange}>
                <option value="1">1 - High</option>
                <option value="2">2 - Normal</option>
                <option value="3">3 - Low</option>
              </select>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                Active
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Positions (where to show)</label>
            <div className="positions-grid">
              {POSITION_OPTIONS.map(pos => (
                <label key={pos.value} className={`position-option ${formData.positions.includes(pos.value) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={formData.positions.includes(pos.value)} onChange={() => handlePositionToggle(pos.value)} />
                  {pos.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Budget (Rs.)</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleInputChange} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Cost/Impression</label>
              <input type="number" name="costPerImpression" value={formData.costPerImpression} onChange={handleInputChange} placeholder="0" step="0.01" />
            </div>
            <div className="form-group">
              <label>Cost/Click</label>
              <input type="number" name="costPerClick" value={formData.costPerClick} onChange={handleInputChange} placeholder="0" step="0.01" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => { resetForm(); setActiveTab('list'); }}>Cancel</button>
            <button type="submit" className="btn-primary">{editingAd ? 'Update Ad' : 'Create Ad'}</button>
          </div>
        </form>
      )}

      {/* ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <div className="analytics-header">
            <h2>📊 Performance Analytics</h2>
            <button className="btn-secondary" onClick={fetchAnalytics}><i className="fa fa-refresh"></i> Refresh</button>
          </div>
          
          <div className="analytics-summary">
            {Object.entries(analytics).length === 0 ? (
              <div className="empty-state">No analytics data yet</div>
            ) : (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Ad ID</th>
                    <th>Impressions</th>
                    <th>Unique</th>
                    <th>Clicks</th>
                    <th>Unique</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analytics).map(([adId, data]) => (
                    <tr key={adId}>
                      <td><code>{adId}</code></td>
                      <td>{data.impressions}</td>
                      <td>{data.uniqueImpressions}</td>
                      <td>{data.clicks}</td>
                      <td>{data.uniqueClicks}</td>
                      <td className={parseFloat(data.ctr) > 2 ? 'good' : parseFloat(data.ctr) > 0.5 ? 'ok' : 'low'}>{data.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdAdmin;
