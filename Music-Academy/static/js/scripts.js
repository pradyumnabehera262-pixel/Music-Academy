function initializeMenu() {
	const menuButton = document.querySelector('.menu-button');
	const topMenu = document.querySelector('#top-menu');
	const topBar = document.querySelector('.top-bar');
	const topLogo = document.querySelector('.top-logo');

	if (!menuButton || !topMenu || !topBar || !topLogo) {
		return;
	}

	topBar.addEventListener('animationend', (event) => {
		if (event.animationName === 'top-bar-reveal' || event.animationName === 'top-bar-reveal-mobile') {
			topBar.classList.add('reveal-complete');
			topLogo.classList.add('reveal-complete');
		}
	});

	menuButton.addEventListener('click', () => {
		const isOpen = topMenu.classList.toggle('is-open');
		topBar.classList.toggle('menu-open', isOpen);
		menuButton.setAttribute('aria-expanded', String(isOpen));
		menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeMenu);
} else {
	initializeMenu();
}
