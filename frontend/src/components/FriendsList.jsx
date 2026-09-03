import ProfilePreview from './ProfilePreview';
import './FriendsList.css';

function FriendsList({ friends }) {
  return (
    <div className="friends-list">
      <h3>Friends</h3>
      <div className="friends-list-grid">
        {friends.map(friend => (
          <ProfilePreview key={friend.id} user={friend} />
        ))}
      </div>
    </div>
  );
}

export default FriendsList;
