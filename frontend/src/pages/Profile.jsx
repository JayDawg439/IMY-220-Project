import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import PostPreview from '../components/PostPreview';
import ProfilePreview from '../components/ProfilePreview';
import CreatePost from '../components/CreatePost';
import EditProfileForm from '../components/EditProfileForm';
import { currentUser, dummyFriends, dummyProfilePosts } from '../dummyData';
import './Profile.css';

function Profile() {
  useParams();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [rightPanel, setRightPanel] = useState('posts');

  const toggleEditProfile = () => {
    setShowCreatePost(false);
    setShowEditProfile(s => !s);
  };
  const toggleCreatePost = () => {
    setShowEditProfile(false);
    setShowCreatePost(s => !s);
  };

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <div className="profile-top">
          <section className="profile-info">
            <div className="profile-avatars">
              <img src={currentUser.avatar} alt={currentUser.name} />
              <img src={currentUser.avatar} alt={currentUser.name} />
            </div>
            <table className="profile-table">
              <tbody>
                <tr>
                  <td>NAME</td>
                  <td>{currentUser.name}</td>
                </tr>
                <tr>
                  <td>PRONOUNS</td>
                  <td>{currentUser.pronouns}</td>
                </tr>
                <tr>
                  <td
                    className={rightPanel === 'posts' ? 'profile-table-toggle active' : 'profile-table-toggle'}
                    onClick={() => setRightPanel('posts')}
                  >
                    POSTS
                  </td>
                  <td>{currentUser.postsCount}</td>
                </tr>
                <tr>
                  <td
                    className={rightPanel === 'friends' ? 'profile-table-toggle active' : 'profile-table-toggle'}
                    onClick={() => setRightPanel('friends')}
                  >
                    FRIENDS
                  </td>
                  <td>{currentUser.friendsCount}</td>
                </tr>
              </tbody>
            </table>

            <div className="profile-bio-links">
              <div className="profile-bio-links-col">
                <span className="profile-bio-links-label">BIO</span>
                <span>{currentUser.bio}</span>
              </div>
              <div className="profile-bio-links-col">
                <span className="profile-bio-links-label">LINKS</span>
                <span>{currentUser.links}</span>
              </div>
            </div>

            <div className="profile-actions">
              <button onClick={toggleEditProfile}>Edit Profile</button>
              <button onClick={toggleCreatePost}>New Post</button>
            </div>
          </section>

          <section className="profile-photo-grid">
            {rightPanel === 'posts'
              ? dummyProfilePosts.concat(dummyProfilePosts).slice(0, 8).map((post, i) => (
                  <PostPreview key={`${post.id}-${i}`} post={post} />
                ))
              : dummyFriends.map(friend => (
                  <ProfilePreview key={friend.id} user={friend} />
                ))}
          </section>
        </div>

        {showEditProfile && (
          <EditProfileForm user={currentUser} onCancel={() => setShowEditProfile(false)} />
        )}
        {showCreatePost && (
          <CreatePost onCancel={() => setShowCreatePost(false)} />
        )}
      </main>
    </div>
  );
}

export default Profile;
