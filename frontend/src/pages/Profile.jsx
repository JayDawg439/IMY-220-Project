import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Feed from '../components/Feed';
import ProfilePreview from '../components/ProfilePreview';
import AlbumPreview from '../components/AlbumPreview';
import CreatePost from '../components/CreatePost';
import EditProfileForm from '../components/EditProfileForm';
import AlbumForm from '../components/AlbumForm';
import FriendButton from '../components/FriendButton';
import { Loading, ErrorMessage, Empty } from '../components/Status';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { id } = useParams();
  const { user: me, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rightPanel, setRightPanel] = useState('posts');
  const [form, setForm] = useState(null);

  const isSelf = me.id === id;
  const canManage = isSelf || me.role === 'admin';

  const load = useCallback(async () => {
    setError('');
    try {
      const [p, postData, albumData] = await Promise.all([
        api(`/users/${id}`),
        api(`/posts?author=${id}`),
        api(`/albums?owner=${id}`),
      ]);
      setProfile(p);
      setPosts(postData.posts);
      setAlbums(albumData.albums);
      if (me.id === id) {
        const reqData = await api('/friends/requests');
        setRequests(reqData.requests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, me.id]);

  useEffect(() => {
    setLoading(true);
    setProfile(null);
    setRightPanel('posts');
    setForm(null);
    load();
  }, [load]);

  const handleDeleteProfile = async () => {
    const msg = isSelf
      ? 'Delete your profile? All your posts, albums and comments will be permanently removed.'
      : `Delete ${profile.user.username}'s account? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      if (isSelf) {
        await logout();
        navigate('/');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRequest = async (userId, action) => {
    try {
      await api(`/friends/${action}/${userId}`, { method: 'POST' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (!profile) return <Layout><ErrorMessage message={error || 'User not found.'} /></Layout>;

  const u = profile.user;
  const toggle = (name) => setForm((f) => (f === name ? null : name));
  const tabClass = (name) =>
    `cursor-pointer select-none border border-edge px-2 py-1.5 text-left transition hover:text-neon ${rightPanel === name ? 'bg-neon text-void hover:text-void' : ''}`;

  return (
    <Layout>
      <ErrorMessage message={error} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-5">
          <section className="panel flex w-full flex-col gap-4 sm:w-80">
            <img src={u.avatarUrl} alt={u.name} className="mx-auto size-32 border-2 border-neon object-cover shadow-[0_0_14px_#39ff1455]" />

            <div className="grid grid-cols-[auto_1fr] gap-px bg-edge text-sm">
              <span className="bg-panel px-2 py-1.5 text-xs font-bold tracking-widest text-mute">NAME</span>
              <span className="bg-panel px-2 py-1.5">{u.name}</span>
              <span className="bg-panel px-2 py-1.5 text-xs font-bold tracking-widest text-mute">USER</span>
              <span className="bg-panel px-2 py-1.5">@{u.username}</span>
              <span className="bg-panel px-2 py-1.5 text-xs font-bold tracking-widest text-mute">PRONOUNS</span>
              <span className="bg-panel px-2 py-1.5">{u.pronouns || '—'}</span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-xs font-bold tracking-widest">
              <button onClick={() => setRightPanel('posts')} className={tabClass('posts')}>POSTS<br /><span className="text-base">{profile.postCount}</span></button>
              <button onClick={() => setRightPanel('friends')} className={tabClass('friends')}>FRIENDS<br /><span className="text-base">{profile.friends.length}</span></button>
              <button onClick={() => setRightPanel('albums')} className={tabClass('albums')}>ALBUMS<br /><span className="text-base">{profile.albumCount}</span></button>
            </div>
            {isSelf && (
              <button onClick={() => setRightPanel('requests')} className={`${tabClass('requests')} text-xs font-bold tracking-widest`}>
                FRIEND REQUESTS ({requests.length})
              </button>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="border border-edge p-2">
                <p className="mb-1 text-xs font-bold tracking-widest text-mute">BIO</p>
                <p className="break-words">{u.bio || '—'}</p>
              </div>
              <div className="border border-edge p-2">
                <p className="mb-1 text-xs font-bold tracking-widest text-mute">LINKS</p>
                <p className="break-words">{u.links || '—'}</p>
              </div>
            </div>

            {!isSelf && (
              <FriendButton
                userId={u.id}
                status={profile.friendStatus}
                onChange={() => load()}
              />
            )}

            {canManage && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => toggle('edit')} className="btn flex-1">EDIT PROFILE</button>
                {isSelf && <button onClick={() => toggle('post')} className="btn flex-1">NEW POST</button>}
                {isSelf && <button onClick={() => toggle('album')} className="btn flex-1">NEW ALBUM</button>}
                <button onClick={handleDeleteProfile} className="btn btn-danger flex-1">DELETE PROFILE</button>
              </div>
            )}
          </section>

          <section className="min-w-72 flex-1">
            {rightPanel === 'posts' && <Feed posts={posts} emptyText="No posts yet." />}

            {rightPanel === 'friends' && (
              profile.friends.length === 0 ? (
                <Empty>No friends yet.</Empty>
              ) : (
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                  {profile.friends.map((f) => <ProfilePreview key={f.id} user={f} />)}
                </div>
              )
            )}

            {rightPanel === 'albums' && (
              albums.length === 0 ? (
                <Empty>No albums yet.</Empty>
              ) : (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
                  {albums.map((a) => <AlbumPreview key={a.id} album={a} />)}
                </div>
              )
            )}

            {rightPanel === 'requests' && isSelf && (
              requests.length === 0 ? (
                <Empty>No pending friend requests.</Empty>
              ) : (
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                  {requests.map((r) => (
                    <ProfilePreview key={r.id} user={r.from}>
                      <div className="flex gap-1">
                        <button onClick={() => handleRequest(r.from.id, 'accept')} className="btn btn-solid px-2 py-1">ACCEPT</button>
                        <button onClick={() => handleRequest(r.from.id, 'decline')} className="btn btn-ghost px-2 py-1">DECLINE</button>
                      </div>
                    </ProfilePreview>
                  ))}
                </div>
              )
            )}
          </section>
        </div>

        {form === 'edit' && (
          <EditProfileForm
            user={u}
            onCancel={() => setForm(null)}
            onSaved={(updated) => {
              if (isSelf) setUser(updated);
              setForm(null);
              load();
            }}
          />
        )}
        {form === 'post' && (
          <CreatePost
            onCancel={() => setForm(null)}
            onCreated={() => { setForm(null); setRightPanel('posts'); load(); }}
          />
        )}
        {form === 'album' && (
          <AlbumForm
            onCancel={() => setForm(null)}
            onSaved={() => { setForm(null); setRightPanel('albums'); load(); }}
          />
        )}
      </div>
    </Layout>
  );
}

export default Profile;
