import { useState } from 'react';
import { api } from '../lib/api';

function FriendButton({ userId, status, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (method, path) => {
    setBusy(true);
    setError('');
    try {
      const data = await api(path, { method });
      onChange(data.friendStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const actions = {
    none: <button disabled={busy} onClick={() => run('POST', `/friends/request/${userId}`)} className="btn btn-solid">ADD FRIEND</button>,
    pending_sent: <button disabled={busy} onClick={() => run('DELETE', `/friends/${userId}`)} className="btn btn-ghost">REQUEST SENT · CANCEL</button>,
    pending_received: (
      <>
        <button disabled={busy} onClick={() => run('POST', `/friends/accept/${userId}`)} className="btn btn-solid">ACCEPT</button>
        <button disabled={busy} onClick={() => run('POST', `/friends/decline/${userId}`)} className="btn btn-ghost">DECLINE</button>
      </>
    ),
    friends: <button disabled={busy} onClick={() => run('DELETE', `/friends/${userId}`)} className="btn btn-danger">UNFRIEND</button>,
  };

  if (!actions[status]) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">{actions[status]}</div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default FriendButton;
