import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PostPreview from '../components/PostPreview';
import AlbumForm from '../components/AlbumForm';
import Hashtags from '../components/Hashtags';
import { Loading, ErrorMessage, Empty } from '../components/Status';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function Album() {
	const { id } = useParams();
	const { user } = useAuth();
	const navigate = useNavigate();

	const [album, setAlbum] = useState(null);
	const [myPosts, setMyPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [panel, setPanel] = useState(null);

	const canEdit = album && (album.owner.id === user.id || user.role === 'admin');

	useEffect(() => {
		setLoading(true);
		setError('');
		api(`/albums/${id}`)
			.then((data) => setAlbum(data.album))
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, [id]);

	const openAddPanel = async () => {
		if(panel === 'add'){
			return setPanel(null);
		}
		try {
			const data = await api(`/posts?author=${album.owner.id}`);
			setMyPosts(data.posts);
			setPanel('add');
		} catch (err) {
			setError(err.message);
		}
	};

	const changePost = async (method, postId) => {
		setError('');
		try {
			const data = await api(`/albums/${id}/posts/${postId}`, { method });
			setAlbum(data.album);
		} catch (err) {
			setError(err.message);
		}
	};

	const handleDelete = async () => {
		if(!window.confirm('Delete this album? The posts inside it will not be deleted.')){
			return;
		}
		try {
			await api(`/albums/${id}`, { method: 'DELETE' });
			navigate(`/profile/${album.owner.id}`);
		} catch (err) {
			setError(err.message);
		}
	};

	if(loading){
		return <Layout><Loading /></Layout>;
	}
	if(!album){
		return <Layout><ErrorMessage message={error || 'Album not found.'} /></Layout>;
	}

	const inAlbum = new Set(album.posts.map((p) => p.id));
	const available = myPosts.filter((p) => !inAlbum.has(p.id));

	return (
		<Layout>
			<div className="flex flex-col gap-5">
				<div className="panel flex flex-col gap-2">
					<p className="font-mono text-xs text-mute">ALBUM</p>
					<h1 className="text-2xl text-neon">{album.name}</h1>
					<p className="text-sm text-mute">
						by <Link to={`/profile/${album.owner.id}`} className="text-ink hover:text-neon">@{album.owner.username}</Link> · {album.postCount} {album.postCount === 1 ? 'post' : 'posts'}
					</p>
					{album.description && <p className="max-w-2xl text-sm">{album.description}</p>}
					<Hashtags tags={album.hashtags} />
					{canEdit && (
						<div className="mt-2 flex flex-wrap gap-2">
							<button onClick={() => setPanel(panel === 'edit' ? null : 'edit')} className="btn">EDIT ALBUM</button>
							<button onClick={openAddPanel} className="btn">ADD POSTS</button>
							<button onClick={handleDelete} className="btn btn-danger">DELETE ALBUM</button>
						</div>
					)}
				</div>

				<ErrorMessage message={error} />

				{panel === 'edit' && (
					<AlbumForm album={album} onCancel={() => setPanel(null)} onSaved={(a) => { setAlbum(a); setPanel(null); }} />
				)}

				{panel === 'add' && (
					<div className="panel flex flex-col gap-3">
						<h3 className="text-neon">Add posts to this album</h3>
						{available.length === 0 ? (
							<p className="text-sm text-mute">No more posts to add.</p>
						) : (
							<div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
								{available.map((p) => (
									<button key={p.id} onClick={() => changePost('POST', p.id)} className="group relative cursor-pointer border border-edge transition hover:border-neon" title="Add to album">
										<img src={p.imageUrl} alt={p.caption} className="aspect-square w-full object-cover" />
										<span className="absolute inset-0 grid place-items-center bg-void/70 text-2xl text-neon opacity-0 transition group-hover:opacity-100">+</span>
									</button>
								))}
							</div>
						)}
					</div>
				)}

				{album.posts.length === 0 ? (
					<Empty>This album has no posts yet.</Empty>
				) : (
					<div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
						{album.posts.map((p) => (
							<PostPreview key={p.id} post={p}>
								{canEdit && (
									<button onClick={() => changePost('DELETE', p.id)} className="btn btn-danger m-2 py-1">REMOVE</button>
								)}
							</PostPreview>
						))}
					</div>
				)}
			</div>
		</Layout>
	);
}

export default Album;
