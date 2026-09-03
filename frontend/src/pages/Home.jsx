import { useState } from 'react';
import Header from '../components/Header';
import SearchInput from '../components/SearchInput';
import Feed from '../components/Feed';
import { dummyPosts } from '../dummyData';
import './Home.css';

function Home() {
  const [activeTab, setActiveTab] = useState('friends');

  const visiblePosts = dummyPosts.filter(p => p.feed === activeTab);

  return (
    <div className="home-page">
      <Header />
      <main className="home-main">
        <div className="home-topbar">
          <div className="home-tabs">
            <button
              className={activeTab === 'friends' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('friends')}
            >
              FRIENDS
            </button>
            <button
              className={activeTab === 'adventure' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('adventure')}
            >
              ADVENTURE
            </button>
          </div>
          <SearchInput />
        </div>
        <Feed posts={visiblePosts} />
      </main>
    </div>
  );
}

export default Home;
