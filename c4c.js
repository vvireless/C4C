document.addEventListener('DOMContentLoaded', () => {
	const yearNode = document.querySelector('[data-year]');
	if (yearNode) {
		yearNode.textContent = new Date().getFullYear();
	}

	const calendarGrid = document.querySelector('[data-calendar-grid]');
	const calendarTrack = document.querySelector('[data-calendar-track]');
	const calendarStatus = document.querySelector('[data-calendar-status]');
	const calendarPrev = document.querySelector('[data-calendar-prev]');
	const calendarNext = document.querySelector('[data-calendar-next]');
	const eventList = document.querySelector('[data-event-list]');
	const eventModal = document.querySelector('[data-event-modal]');
	const eventModalTitle = document.querySelector('[data-event-modal-title]');
	const eventModalKicker = document.querySelector('[data-event-modal-kicker]');
	const eventModalMeta = document.querySelector('[data-event-modal-meta]');
	const eventModalCopy = document.querySelector('[data-event-modal-copy]');
	const eventModalCloseTargets = document.querySelectorAll('[data-event-modal-close]');

	if (!calendarTrack || !calendarStatus || !calendarPrev || !calendarNext || !eventList || !eventModal || !eventModalTitle || !eventModalKicker || !eventModalMeta || !eventModalCopy) {
		return;
	}

	const today = new Date();
	const referenceYear = today.getFullYear();
	const referenceMonth = today.getMonth();
	const startMonth = new Date(referenceYear, referenceMonth - 2, 1);
	const endMonth = new Date(referenceYear, referenceMonth + 2, 1);

	const eventData = [
		{
			title: 'Pipe cleaner flowers',
			start: new Date(referenceYear, 4, 27),
			end: new Date(referenceYear, 4, 27),
			time: '6:00 - 8:00 PM',
			location: 'STC 0060',
		},
		{
			title: 'Glass painting',
			start: new Date(referenceYear, 5, 12),
			end: new Date(referenceYear, 5, 12),
			time: '6:00 - 8:00 PM',
			location: 'DWE 2527',
		},
		{
			title: "Creator's Market",
			start: new Date(referenceYear, 5, 24),
			end: new Date(referenceYear, 5, 25),
			time: '11:00 AM - 6:00 PM',
			location: 'PSE',
		},
		{
			title: 'Polymer clay jewelry workshop with the Neurodivergent Club',
			start: new Date(referenceYear, 6, 10),
			end: new Date(referenceYear, 6, 10),
			time: '6:00 - 9:00 PM',
			location: 'B2 350',
		},
        {
			title: 'Cosplay Cafe',
			start: new Date(referenceYear, 6, 24),
			end: new Date(referenceYear, 6, 24),
			time: '5:00 - 9:00 PM',
			location: 'AL 211',
		},
	];

	const months = [];
	for (let monthCursor = new Date(startMonth); monthCursor <= endMonth; monthCursor.setMonth(monthCursor.getMonth() + 1)) {
		months.push(new Date(monthCursor));
	}

	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	const monthLabel = (date) => new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
	const shortLabel = (date) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
	const longLabel = (date) => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
	const dayOnlyLabel = (date) => new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);

	const eventMap = new Map();
	for (const event of eventData) {
		for (let cursor = new Date(event.start); cursor <= event.end; cursor.setDate(cursor.getDate() + 1)) {
			const key = dateKey(cursor);
			if (!eventMap.has(key)) {
				eventMap.set(key, []);
			}
			eventMap.get(key).push(event);
		}
	}

	const todayKey = dateKey(today);
	const initialEvent = eventData.find((event) => event.start.getMonth() === referenceMonth) || eventData[0];
	let selectedDateKey = initialEvent ? dateKey(initialEvent.start) : todayKey;
	let activeModalKey = null;

	const openEventModal = (key) => {
		const events = eventMap.get(key) || [];
		if (!events.length) {
			return;
		}

		const [year, month, day] = key.split('-').map(Number);
		const selectedDate = new Date(year, month - 1, day);
		const primaryEvent = events[0];
		activeModalKey = key;

		eventModalTitle.textContent = primaryEvent.title;
		eventModalKicker.textContent = events.length > 1 ? 'Event cluster' : 'Event spotlight';
		eventModalMeta.innerHTML = `
			<span class="event-modal-chip">${dayOnlyLabel(selectedDate)}</span>
			<span class="event-modal-chip">${primaryEvent.time}</span>
			<span class="event-modal-chip">${primaryEvent.location}</span>
		`;
		eventModalCopy.textContent = events.length > 1
			? `There are ${events.length} events on this day. Tap through the carousel to see the month view, or use this pop-up as the quick summary.` : '';
		eventModal.classList.add('is-open');
		eventModal.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
	};

	const closeEventModal = () => {
		activeModalKey = null;
		eventModal.classList.remove('is-open');
		eventModal.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
	};

	const setSelectedDay = (key) => {
		selectedDateKey = key;
		const [year, month, day] = key.split('-').map(Number);
		const selectedDate = new Date(year, month - 1, day);
		const events = eventMap.get(key) || [];

		calendarTrack.querySelectorAll('.calendar-day.selected').forEach((dayNode) => dayNode.classList.remove('selected'));
		const selectedNode = calendarTrack.querySelector(`[data-date="${key}"]`);
		if (selectedNode) {
			selectedNode.classList.add('selected');
		}

		return events;
	};

	calendarTrack.innerHTML = months
		.map((month) => {
			const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
			const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
			const monthEvents = eventData.filter((event) => event.start.getMonth() === month.getMonth() || event.end.getMonth() === month.getMonth()).length;
			const cells = [];

			for (let index = 0; index < firstDay; index += 1) {
				cells.push('<div class="calendar-day is-empty" aria-hidden="true"></div>');
			}

			for (let day = 1; day <= daysInMonth; day += 1) {
				const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
				const key = dateKey(currentDate);
				const events = eventMap.get(key) || [];
				const classes = ['calendar-day'];
				if (key === todayKey) {
					classes.push('today');
				}
				if (events.length > 0) {
					classes.push('has-event');
				}

				const chips = events.map((event) => `<span class="event-pill">${event.title}</span>`).join('');

				cells.push(`
					<button type="button" class="${classes.join(' ')}" data-date="${key}" aria-label="${longLabel(currentDate)}${events.length ? `, ${events.length} event${events.length > 1 ? 's' : ''}` : ''}">
						<div class="calendar-day-number">${day}</div>
						${chips}
					</button>
				`);
			}

			return `
				<article class="month-card fade-in">
					<div class="month-head">
						<h3>${monthLabel(month)}</h3>
						<span>${monthEvents} event${monthEvents === 1 ? '' : 's'}</span>
					</div>
					<div class="weekdays">${weekdays.map((weekday) => `<div class="weekday">${weekday}</div>`).join('')}</div>
					<div class="days">${cells.join('')}</div>
				</article>
			`;
		})
		.join('');

	calendarTrack.querySelectorAll('.calendar-day').forEach((dayNode) => {
		dayNode.addEventListener('click', () => {
			const key = dayNode.getAttribute('data-date');
			if (key) {
				const events = setSelectedDay(key);
				if (events.length) {
					openEventModal(key);
				}
			}
		});

		dayNode.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				const key = dayNode.getAttribute('data-date');
				if (key) {
					setSelectedDay(key);
				}
			}
		});
	});

	eventModalCloseTargets.forEach((target) => {
		target.addEventListener('click', closeEventModal);
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && eventModal.classList.contains('is-open')) {
			closeEventModal();
		}
	});

	let currentMonthIndex = Math.min(2, months.length - 1);

	const updateCarousel = () => {
		calendarTrack.style.transform = `translateX(-${currentMonthIndex * 100}%)`;
		calendarStatus.textContent = monthLabel(months[currentMonthIndex]);
		calendarPrev.disabled = currentMonthIndex === 0;
		calendarNext.disabled = currentMonthIndex === months.length - 1;
	};

	calendarPrev.addEventListener('click', () => {
		if (currentMonthIndex > 0) {
			currentMonthIndex -= 1;
			updateCarousel();
		}
	});

	calendarNext.addEventListener('click', () => {
		if (currentMonthIndex < months.length - 1) {
			currentMonthIndex += 1;
			updateCarousel();
		}
	});

	updateCarousel();
	setSelectedDay(selectedDateKey);

	eventList.innerHTML = eventData
		.slice(0, 3)
		.map((event) => {
			const dateText = event.start.getTime() === event.end.getTime()
				? shortLabel(event.start)
				: `${shortLabel(event.start)} - ${shortLabel(event.end)}`;

			return `
				<article class="event-card">
					<div class="event-card-date">${dateText}</div>
					<h4>${event.title}</h4>
					<p>${event.time} &middot; ${event.location}</p>
				</article>
			`;
		})
		.join('');
});