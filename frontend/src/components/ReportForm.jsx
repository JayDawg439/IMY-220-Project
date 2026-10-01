import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function ReportForm({ postId, onDone, onCancel }) {
  const [reasons, setReasons] = useState([]);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api('/reports/reasons')
      .then((data) => {
        setReasons(data.reasons);
        if (data.reasons[0]) setReason(data.reasons[0].label);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await api(`/posts/${postId}/report`, { method: 'POST', body: { reason, details } });
      onDone(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel flex flex-col gap-3">
      <h4 className="text-danger">Report this post</h4>
      <label className="label">
        Reason
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="field">
          {reasons.map((r) => <option key={r.id} value={r.label}>{r.label}</option>)}
        </select>
      </label>
      <label className="label">
        Details (optional)
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={2} maxLength={300} className="field" />
      </label>
      {error && <p className="error-text">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={submitting || !reason} className="btn btn-danger">{submitting ? 'SENDING...' : 'SUBMIT REPORT'}</button>
        <button type="button" onClick={onCancel} className="btn btn-ghost">CANCEL</button>
      </div>
    </form>
  );
}

export default ReportForm;
