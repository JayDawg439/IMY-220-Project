import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ImageDisplay from '../components/ImageDisplay';
import Comments from '../components/Comments';
import EditPostForm from '../components/EditPostForm';
import ReportForm from '../components/ReportForm';
import Hashtags from '../components/Hashtags';
import { Loading, ErrorMessage } from '../components/Status';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function Post() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [panel, setPanel] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    api(`/posts/${id}`)
      .then((data) => setPost(data.post))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = post && post.author.id === user.id;
  const canEdit = post && (isOwner || user.role === 'admin');

  const toggleLike = async () => {
    try {
      const data = await api(`/posts/${id}/like`, { method: 'POST' });
      setPost(data.post);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api(`/posts/${id}`, { method: 'DELETE' });
      navigate(`/profile/${user.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Layout><Loading /></Layout>;
  if (!post) return <Layout><ErrorMessage message={error || 'Post not found.'} /></Layout>;

  return (
    <Layout>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-[2]">
          <ImageDisplay src={post.imageUrl} alt={post.caption || 'post'} />
        </div>

        <div className="flex min-w-72 flex-1 flex-col gap-4">
          <div className="panel flex items-start gap-3">
            <Link to={`/profile/${post.author.id}`}>
              <img src={post.author.avatarUrl} alt={post.author.username} className="size-10 rounded-full border border-neon/50 object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/profile/${post.author.id}`} className="font-bold hover:text-neon">{post.author.name}</Link>
              <p className="text-xs text-mute">@{post.author.username} · {new Date(post.createdAt).toLocaleDateString()}</p>
              {post.caption && <p className="mt-2 break-words text-sm">{post.caption}</p>}
              <div className="mt-2"><Hashtags tags={post.hashtags} /></div>
            </div>
          </div>

          <div className="panel flex flex-wrap items-center gap-2">
            <button onClick={toggleLike} className={`btn ${post.liked ? 'btn-solid' : ''}`}>
              {post.liked ? '♥ LIKED' : '♡ LIKE'} · {post.likeCount}
            </button>
            {canEdit && (
              <>
                <button onClick={() => setPanel(panel === 'edit' ? null : 'edit')} className="btn btn-ghost">EDIT</button>
                <button onClick={handleDelete} className="btn btn-danger">DELETE</button>
              </>
            )}
            {!isOwner && (
              <button onClick={() => setPanel(panel === 'report' ? null : 'report')} className="btn btn-ghost ml-auto">REPORT</button>
            )}
          </div>

          <ErrorMessage message={error} />
          {notice && <p className="notice">{notice}</p>}

          {panel === 'edit' && (
            <EditPostForm post={post} onSaved={(p) => { setPost(p); setPanel(null); }} onCancel={() => setPanel(null)} />
          )}
          {panel === 'report' && (
            <ReportForm postId={post.id} onDone={(msg) => { setNotice(msg); setPanel(null); }} onCancel={() => setPanel(null)} />
          )}

          <Comments
            postId={post.id}
            postAuthorId={post.author.id}
            onCountChange={(n) => setPost((p) => ({ ...p, commentCount: n }))}
          />
        </div>
      </div>
    </Layout>
  );
}

export default Post;
