import { Link } from 'react-router-dom';

function PostPreview({ post, children }) {
  return (
    <div className="group flex flex-col overflow-hidden border border-edge bg-panel transition hover:border-neon">
      <Link to={`/post/${post.id}`} className="flex flex-col">
        <img src={post.imageUrl} alt={post.caption || 'post'} className="aspect-square w-full bg-panel-2 object-cover" loading="lazy" />
        <div className="flex items-center gap-2 px-2 py-2">
          <img src={post.author.avatarUrl} alt={post.author.username} className="size-6 rounded-full border border-neon/50 object-cover" />
          <span className="truncate text-xs text-ink">{post.caption || `@${post.author.username}`}</span>
        </div>
      </Link>
      {children}
    </div>
  );
}

export default PostPreview;
