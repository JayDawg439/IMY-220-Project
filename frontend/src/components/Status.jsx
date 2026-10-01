export function Loading({ text = 'loading...' }) {
  return <p className="py-10 text-center font-mono text-sm text-neon">{text}</p>;
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return <p className="error-text border border-danger/40 bg-danger/10 px-3 py-2">{message}</p>;
}

export function Empty({ children }) {
  return <p className="py-10 text-center text-sm text-mute">{children}</p>;
}
