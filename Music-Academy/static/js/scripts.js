function wrapIntroQuoteCharacters() {
	const introQuote = document.querySelector('.intro-quote');
	if (!introQuote || introQuote.dataset.charsWrapped === 'true') {
		return;
	}

	const text = introQuote.textContent;
	introQuote.textContent = '';

	const fragment = document.createDocumentFragment();
	[...text].forEach((char) => {
		const span = document.createElement('span');
		span.className = 'char';
		span.textContent = char === ' ' ? '\u00A0' : char;
		fragment.appendChild(span);
	});

	introQuote.appendChild(fragment);
	introQuote.dataset.charsWrapped = 'true';
}

function initializeMenu() {
	const menuButton = document.querySelector('.menu-button');
	const topMenu = document.querySelector('#top-menu');
	const topBar = document.querySelector('.top-bar');
	const topLogo = document.querySelector('.top-logo');
	const hero = document.querySelector('.hero');

	wrapIntroQuoteCharacters();

	if (!topBar || !topLogo) {
		return;
	}

	topBar.addEventListener('animationend', (event) => {
		if (event.animationName === 'top-bar-reveal' || event.animationName === 'top-bar-reveal-mobile') {
			topBar.classList.add('reveal-complete');
			topLogo.classList.add('reveal-complete');
		}
	});

	if (menuButton && topMenu) {
		menuButton.addEventListener('click', () => {
			const isOpen = topMenu.classList.toggle('is-open');
			topBar.classList.toggle('menu-open', isOpen);
			menuButton.setAttribute('aria-expanded', String(isOpen));
			menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
		});
	}

	if (hero) {
		const header = document.querySelector('.header');
		const updateHeroScroll = () => {
			if (!header) return;
			const start = header.offsetTop;
			const progress = Math.min(Math.max((window.scrollY - start) / 220, 0), 1);
			hero.style.setProperty('--reveal', progress.toFixed(3));
			hero.classList.toggle('is-revealed', progress > 0.05);
		};

		updateHeroScroll();
		window.addEventListener('scroll', updateHeroScroll, { passive: true });
		window.addEventListener('resize', updateHeroScroll, { passive: true });
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeMenu);
} else {
	initializeMenu();
}
