import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';

import SearchInput from '../components/SearchInput';
import Feed from '../components/Feed';
import { Loading, ErrorMessage } from '../components/Status';
import { api } from '../lib/api';

const TABS = [
	{ key: 'local', label: 'LOCAL', help: 'You and your friends' },
	{ key: 'global', label: 'GLOBAL', help: 'Everyone on Obscura Fulgur' },
];

function Home() {
	const [params, setParams] = useSearchParams();
	const tab = params.get('tab') === 'global' ? 'global' : 'local';
	const q = params.get('q') || '';

	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError('');
		api(`/posts?feed=${tab}${q ? `&q=${encodeURIComponent(q)}` : ''}`)
			.then((data) => !cancelled && setPosts(data.posts))
			.catch((err) => !cancelled && setError(err.message))
			.finally(() => !cancelled && setLoading(false));
		return () => { cancelled = true; };
	}, [tab, q]);

	const setTab = (key) => setParams({ tab: key, ...(q ? { q } : {}) });
	const setQuery = (term) => setParams({ tab, ...(term ? { q: term } : {}) });

	return (
		<Layout>
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div className="flex gap-5">
					{TABS.map((t) => (
						<button
							key={t.key}
							title={t.help}
							onClick={() => setTab(t.key)}
							className={`cursor-pointer border-b-2 px-1 py-1.5 text-sm font-bold tracking-widest transition ${
								tab === t.key ? 'border-neon text-neon' : 'border-transparent text-mute hover:text-ink'
							}`}
						>
							{t.label}
						</button>
					))}
				</div>
				<SearchInput key={q} initialValue={q} onSearch={setQuery} />
			</div>

			{q && <p className="mb-3 font-mono text-xs text-mute">Showing results for “{q}”</p>}

			<ErrorMessage message={error} />
			{loading ? (
				<Loading />
			) : (
				<Feed
					posts={posts}
					emptyText={
						q ? 'No posts match your search.' : tab === 'local' ? 'Nothing here yet. Add some friends or make a post!' : 'No posts yet.'
					}
				/>
			)}
		</Layout>
	);
}

export default Home;
