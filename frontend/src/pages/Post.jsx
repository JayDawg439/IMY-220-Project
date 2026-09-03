import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import ImageDisplay from '../components/ImageDisplay';
import Comments from '../components/Comments';
import EditPostForm from '../components/EditPostForm';
import { dummySinglePost } from '../dummyData';
import './Post.css';

function Post() {
  const { id } = useParams();
  const [showEdit, setShowEdit] = useState(false);
  const post = dummySinglePost;

  return (
    <div className="post-page">
      <Header />
      <main className="post-main">
        <div className="post-image-col">
          <p className="post-route-note">Viewing post id: {id}</p>
          <ImageDisplay src={post.imageUrl} alt={post.caption} />
        </div>
        <div className="post-side-col">
          <div className="post-author">
            <img src={post.authorAvatar} alt={post.authorName} />
            <div>
              <p className="post-author-name">{post.authorName}</p>
              <p className="post-caption">{post.caption}</p>
            </div>
            <button className="post-edit-btn" onClick={() => setShowEdit(s => !s)}>
              Edit
            </button>
          </div>

          {showEdit && (
            <EditPostForm post={post} onCancel={() => setShowEdit(false)} />
          )}

          <div className="post-likes">{post.likes} likes</div>

          <Comments comments={post.comments} />
        </div>
      </main>
    </div>
  );
}

export default Post;
