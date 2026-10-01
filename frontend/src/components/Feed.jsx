import PostPreview from './PostPreview';
import { Empty } from './Status';

function Feed({ posts, emptyText = 'No posts to show.' }) {
  if (posts.length === 0) return <Empty>{emptyText}</Empty>;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <PostPreview key={post.id} post={post} />
      ))}
    </div>
  );
}

export default Feed;
