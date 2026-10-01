import { Link } from 'react-router-dom';

function Hashtags({ tags }) {
	if(!tags || tags.length === 0){
		return null;
	}
	return (
		<div className="flex flex-wrap gap-x-3 gap-y-1">
			{tags.map((t) => (
				<Link key={t} to={`/home?tab=global&q=${encodeURIComponent(t)}`} className="tag">
					#{t}
				</Link>
			))}
		</div>
	);
}

export default Hashtags;
