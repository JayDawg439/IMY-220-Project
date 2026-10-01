import { Link } from 'react-router-dom';

function ProfilePreview({ user, children }) {
  return (
    <div className="flex items-center gap-3 border border-edge bg-panel p-2 transition hover:border-neon">
      <Link to={`/profile/${user.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <img src={user.avatarUrl} alt={user.name} className="size-10 rounded-full border border-neon/50 object-cover" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs text-mute">@{user.username}{user.pronouns ? ` · ${user.pronouns}` : ''}</span>
        </div>
      </Link>
      {children}
    </div>
  );
}

export default ProfilePreview;
