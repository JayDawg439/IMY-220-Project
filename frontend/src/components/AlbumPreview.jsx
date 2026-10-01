import { Link } from 'react-router-dom';

function AlbumPreview({ album }) {
  return (
    <Link to={`/album/${album.id}`} className="flex flex-col overflow-hidden border border-edge bg-panel transition hover:border-neon">
      {album.coverUrl ? (
        <img src={album.coverUrl} alt={album.name} className="aspect-square w-full object-cover" loading="lazy" />
      ) : (
        <div className="grid aspect-square w-full place-items-center bg-panel-2 font-mono text-xs text-mute">empty album</div>
      )}
      <div className="px-3 py-2">
        <p className="truncate text-sm font-bold">{album.name}</p>
        <p className="text-xs text-mute">{album.postCount} {album.postCount === 1 ? 'post' : 'posts'}</p>
      </div>
    </Link>
  );
}

export default AlbumPreview;
