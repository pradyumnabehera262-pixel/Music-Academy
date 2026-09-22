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

function initializeSpecialEvents() {
	const track = document.querySelector('.special-events-track');
	const cards = track ? [...track.children] : [];

	if (cards.length < 2) {
		return;
	}

	let currentIndex = 0;
	window.setInterval(() => {
		currentIndex = (currentIndex + 1) % cards.length;
		track.style.transform = `translateY(-${currentIndex * 100}%)`;
	}, 3600);
}

function initializeEventNotifications() {
	const track = document.querySelector('.events-notification-track');
	const notifications = [...document.querySelectorAll('.events-notification')];
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	if (!track || notifications.length < 2 || reduceMotion.matches || track.dataset.carouselInitialized === 'true') {
		return;
	}

	track.dataset.carouselInitialized = 'true';
	let currentIndex = 0;
	window.setInterval(() => {
		currentIndex = (currentIndex + 1) % notifications.length;
		track.style.transform = `translateX(-${currentIndex * 100}%)`;
	}, 4200);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeSpecialEvents);
} else {
	initializeSpecialEvents();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeEventNotifications);
} else {
	initializeEventNotifications();
}


const filterButtons = document.querySelectorAll('.instrument-item');
const instructorCards = document.querySelectorAll('.instructor-card');
const instructorSection = document.querySelector('.instructors-section');
const instrumentSequence = ['Piano', 'Guitar', 'Drums', 'Voice'];
let currentInstrumentIndex = 0;

function normalizeInstrument(instrument) {
	const normalizedInstrument = instrument.trim().toLowerCase();

	if (normalizedInstrument === 'drum') {
		return 'drums';
	}

	if (normalizedInstrument === 'vocal') {
		return 'voice';
	}

	return normalizedInstrument;
}

function applyFilter(selectedInstrument) {
	const selectedButton = document.querySelector(
		`.instrument-item[data-instrument="${selectedInstrument}"]`
	);
	const selectedColor = selectedButton?.dataset.color || '#9d4936';

	instructorSection.style.setProperty('--selected-color', selectedColor);
	instructorSection.classList.add('is-changing');

	let visibleCardCount = 0;
	instructorCards.forEach(card => {
		const cardInstrument = normalizeInstrument(card.dataset.instrument);
		const matchesInstrument = selectedInstrument === 'all'
			|| cardInstrument === normalizeInstrument(selectedInstrument);
		const shouldShow = matchesInstrument && visibleCardCount < 2;

		if (shouldShow) {
			visibleCardCount += 1;
		}

		card.classList.remove('is-visible');
		card.style.display = shouldShow ? 'flex' : 'none';

		if (shouldShow) {
			window.requestAnimationFrame(() => card.classList.add('is-visible'));
		}
	});

	filterButtons.forEach(button => {
		const isActive = button.dataset.instrument === selectedInstrument;
		button.classList.toggle('active', isActive);
	});

	window.setTimeout(() => {
		instructorSection.classList.remove('is-changing');
	}, 220);
}

filterButtons.forEach(button => {
	button.addEventListener('click', () => {
		const selectedIndex = instrumentSequence.indexOf(button.dataset.instrument);
		if (selectedIndex !== -1) {
			currentInstrumentIndex = selectedIndex;
		}
		applyFilter(button.dataset.instrument);
	});
});

function moveToNextInstrument() {
	currentInstrumentIndex = (currentInstrumentIndex + 1) % instrumentSequence.length;
	applyFilter(instrumentSequence[currentInstrumentIndex]);
}

applyFilter(instrumentSequence[currentInstrumentIndex]);
window.setInterval(moveToNextInstrument, 3500);


// featured class section state change logic

let currentIndex = 0;
const track = document.querySelector(".track-week-class");
const rightBtn = document.querySelector(".right-button");
const leftBtn = document.querySelector(".left-button");

function nextClassCard() {
	currentIndex++;
	if (currentIndex > 6) {
		currentIndex = 0;
	}
	updateClassesCarousel();
};

function previousClassCard() {
	currentIndex--;
	if (currentIndex < 0) {
		currentIndex = 6;
	}
	updateClassesCarousel();
};

function updateClassesCarousel() {
	const slideWidth = 100 / track.children.length;
	track.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
};

rightBtn.addEventListener("click", ()=> {
	nextClassCard();
	clearInterval(autoSlide);
	startAutoSlide();

});

leftBtn.addEventListener("click", ()=> {
	previousClassCard();
	clearInterval(autoSlide);
	startAutoSlide();
});

let autoSlide;
function startAutoSlide() {
	autoSlide = setInterval(() => {
		nextClassCard();
	}, 4000);
};

startAutoSlide();
