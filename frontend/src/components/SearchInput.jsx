import { useState } from 'react';

function SearchInput({ initialValue = '', onSearch }) {
	const [term, setTerm] = useState(initialValue);

	const handleSubmit = (e) => {
		e.preventDefault();
		onSearch(term.trim());
	};

	return (
		<form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center gap-2 border border-edge bg-panel-2 px-3 py-2 focus-within:border-neon">
			<input
				type="text"
				placeholder="Search captions, #tags, users..."
				value={term}
				onChange={(e) => setTerm(e.target.value)}
				className="flex-1 bg-transparent text-sm outline-none placeholder:text-mute"
			/>
			<button type="submit" aria-label="Search" className="cursor-pointer text-mute transition hover:text-neon">
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
					<circle cx="11" cy="11" r="7" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
			</button>
		</form>
	);
}

export default SearchInput;
