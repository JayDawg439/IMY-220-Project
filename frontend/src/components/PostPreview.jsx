import { Link } from 'react-router-dom';
import './PostPreview.css';

function PostPreview({ post }) {
  return (
    <Link to={`/post/${post.id}`} className="post-preview">
      <img src={post.imageUrl} alt={post.caption} className="post-preview-image" />
      <div className="post-preview-footer">
        <img src={post.authorAvatar} alt={post.authorName} className="post-preview-avatar" />
        <span className="post-preview-caption">{post.caption}</span>
      </div>
    </Link>
  );
}

export default PostPreview;
