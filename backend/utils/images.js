function sendDataUrl(res, dataUrl) {
	const match = /^data:([\w/+.-]+);base64,(.+)$/s.exec(dataUrl || '');
	if(!match){
		return res.status(404).json({ error: 'Image not found.' });
	}
	res.set({
		'Content-Type': match[1],
		'Cache-Control': 'public, max-age=3600',
		'X-Content-Type-Options': 'nosniff',
	});
	return res.send(Buffer.from(match[2], 'base64'));
}

function sendFallbackAvatar(res, label) {
	const letter = (label || '?').trim().charAt(0).toUpperCase() || '?';
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#151515"/><rect x="2" y="2" width="96" height="96" fill="none" stroke="#39ff14" stroke-width="2"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="700" fill="#39ff14">${letter.replace(/[<>&]/g, '')}</text></svg>`;
	res.set({ 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' });
	return res.send(svg);
}

module.exports = { sendDataUrl, sendFallbackAvatar };
