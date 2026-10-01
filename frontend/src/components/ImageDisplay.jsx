function ImageDisplay({ src, alt }) {
	return (
		<div className="flex items-center justify-center overflow-hidden border border-edge bg-panel">
			<img src={src} alt={alt} className="max-h-[75vh] w-full object-contain" />
		</div>
	);
}

export default ImageDisplay;
