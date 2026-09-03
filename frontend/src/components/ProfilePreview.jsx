import { Link } from 'react-router-dom';
import './ProfilePreview.css';

function ProfilePreview({ user }) {
  return (
    <Link to={`/profile/${user.id}`} className="profile-preview">
      <img src={user.avatar} alt={user.name} className="profile-preview-avatar" />
      <div className="profile-preview-info">
        <span className="profile-preview-name">{user.name}</span>
        <span className="profile-preview-pronouns">{user.pronouns}</span>
      </div>
    </Link>
  );
}

export default ProfilePreview;
