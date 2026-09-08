const menuButton = document.querySelector('.menu-button');
const topMenu = document.querySelector('#top-menu');

if (menuButton && topMenu) {
	menuButton.addEventListener('click', () => {
		const isOpen = topMenu.classList.toggle('is-open');
		menuButton.setAttribute('aria-expanded', String(isOpen));
		menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
	});
}
