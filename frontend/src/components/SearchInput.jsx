import { useState } from 'react';
import './SearchInput.css';

function SearchInput() {
  const [term, setTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Search submitted (not yet implemented):', term);
  };

  return (
    <form className="search-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button type="submit" aria-label="Search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </form>
  );
}

export default SearchInput;
