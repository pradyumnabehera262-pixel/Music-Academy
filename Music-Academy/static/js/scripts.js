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

const customSvg = document.getElementById("customSvg");
const buildYourSound = document.getElementById("buildYourSound");

if (customSvg && buildYourSound) {
    const svgObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                buildYourSound.classList.add('draw');
            } else {
                buildYourSound.classList.remove('draw');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-10% 0px -10% 0px'
    });

    svgObserver.observe(customSvg);
}

function initializeCoursePathTravelers() {
	const coursePaths = [...document.querySelectorAll('.course-road')];
	const courseCards = [...document.querySelectorAll('.course-card-shell, .course-card-shell-right')];
	const traveler = document.querySelector('.course-music-traveler');
	const coursesContainer = document.querySelector('.courses-container');

	if (!coursePaths.length || !traveler || !coursesContainer) {
		return;
	}

	let frameRequested = false;

	const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

	const updateTravelers = () => {
		frameRequested = false;

		const focusLine = window.innerHeight * 0.55;
		const selectedCard = courseCards.reduce((closest, card) => {
			const bounds = card.getBoundingClientRect();
			const distance = focusLine < bounds.top
				? bounds.top - focusLine
				: focusLine > bounds.bottom
					? focusLine - bounds.bottom
					: 0;

			if (!closest || distance < closest.distance) {
				return { card, distance };
			}

			return closest;
		}, null);

		courseCards.forEach((card) => {
			card.classList.toggle('is-selected', selectedCard?.card === card);
		});

		const routes = coursePaths.map((svg) => ({
			svg,
			path: svg.querySelector('.course-road-marking'),
			bounds: svg.getBoundingClientRect()
		})).filter(({ path }) => path);

		if (!routes.length) {
			return;
		}

		const toScreenPoint = (route, progress) => {
			const point = route.path.getPointAtLength(route.path.getTotalLength() * progress);
			return new DOMPoint(point.x, point.y).matrixTransform(route.svg.getScreenCTM());
		};

		let screenPoint;
		let isOnPath = false;
		const firstRoute = routes[0];
		const lastRoute = routes[routes.length - 1];

		if (focusLine <= firstRoute.bounds.top) {
			screenPoint = toScreenPoint(firstRoute, 0);
			isOnPath = true;
		} else if (focusLine >= lastRoute.bounds.bottom) {
			screenPoint = toScreenPoint(lastRoute, 1);
			isOnPath = true;
		} else {
			for (let index = 0; index < routes.length; index += 1) {
				const currentRoute = routes[index];

				if (focusLine >= currentRoute.bounds.top && focusLine <= currentRoute.bounds.bottom) {
					const progress = clamp(
						(focusLine - currentRoute.bounds.top) / currentRoute.bounds.height,
						0,
						1
					);
					screenPoint = toScreenPoint(currentRoute, progress);
					isOnPath = true;
					break;
				}

				const nextRoute = routes[index + 1];
				if (nextRoute && focusLine > currentRoute.bounds.bottom && focusLine < nextRoute.bounds.top) {
					const gapProgress = clamp(
						(focusLine - currentRoute.bounds.bottom) / (nextRoute.bounds.top - currentRoute.bounds.bottom),
						0,
						1
					);
					const easedProgress = gapProgress * gapProgress * (3 - 2 * gapProgress);
					const currentPoint = toScreenPoint(currentRoute, 1);
					const nextPoint = toScreenPoint(nextRoute, 0);
					screenPoint = new DOMPoint(
						currentPoint.x + (nextPoint.x - currentPoint.x) * easedProgress,
						currentPoint.y + (nextPoint.y - currentPoint.y) * easedProgress
					);
					break;
				}
			}
		}

		if (!screenPoint) {
			return;
		}

		traveler.classList.toggle('is-hidden', !isOnPath);
		const containerBounds = coursesContainer.getBoundingClientRect();

		traveler.style.left = `${screenPoint.x - containerBounds.left}px`;
		traveler.style.top = `${screenPoint.y - containerBounds.top}px`;
	};

	const requestUpdate = () => {
		if (!frameRequested) {
			frameRequested = true;
			window.requestAnimationFrame(updateTravelers);
		}
	};

	updateTravelers();
	window.addEventListener('scroll', requestUpdate, { passive: true });
	window.addEventListener('resize', requestUpdate, { passive: true });
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeCoursePathTravelers);
} else {
	initializeCoursePathTravelers();
}