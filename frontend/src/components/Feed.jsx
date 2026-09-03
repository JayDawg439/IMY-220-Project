import PostPreview from './PostPreview';
import './Feed.css';

function Feed({ posts }) {
  return (
    <div className="feed-grid">
      {posts.map(post => (
        <PostPreview key={post.id} post={post} />
      ))}
    </div>
  );
}

export default Feed;
