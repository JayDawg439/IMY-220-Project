import Header from './Header';

function Layout({ children }) {
	return (
		<div className="flex min-h-screen">
			<Header />
			<main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
		</div>
	);
}

export default Layout;
