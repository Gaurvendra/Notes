import { useEffect, useState } from 'preact/hooks';

export interface Card {
	frontHtml: string;
	backHtml: string;
}

const storageKey = (deck: string) => `jmt-flashcards-${deck}`;

function loadAgain(deck: string): Set<number> {
	try {
		return new Set(JSON.parse(localStorage.getItem(storageKey(deck)) ?? '[]'));
	} catch {
		return new Set();
	}
}

/** Flip cards with shuffle and a per-browser "needs review" pile. */
export default function FlashcardsIsland({ cards, deck }: { cards: Card[]; deck: string }) {
	const [order, setOrder] = useState(cards.map((_, i) => i));
	const [pos, setPos] = useState(0);
	const [flipped, setFlipped] = useState(false);
	const [again, setAgain] = useState<Set<number>>(new Set());

	useEffect(() => setAgain(loadAgain(deck)), [deck]);

	const save = (next: Set<number>) => {
		setAgain(next);
		try {
			localStorage.setItem(storageKey(deck), JSON.stringify([...next]));
		} catch {
			/* no persistence available */
		}
	};
	const card = cards[order[pos]];
	const go = (delta: number) => {
		setFlipped(false);
		setPos((pos + delta + order.length) % order.length);
	};
	const mark = (needsReview: boolean) => {
		const next = new Set(again);
		if (needsReview) next.add(order[pos]);
		else next.delete(order[pos]);
		save(next);
		go(1);
	};
	const shuffle = () => {
		const o = [...order];
		for (let i = o.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[o[i], o[j]] = [o[j], o[i]];
		}
		setOrder(o);
		setPos(0);
		setFlipped(false);
	};
	const reviewOnly = () => {
		if (again.size === 0) return;
		setOrder([...again]);
		setPos(0);
		setFlipped(false);
	};

	return (
		<div class="jmt-cards">
			<button
				type="button"
				class={`jmt-card ${flipped ? 'is-flipped' : ''}`}
				onClick={() => setFlipped(!flipped)}
				aria-label={flipped ? 'Show question' : 'Show answer'}
			>
				<span class="jmt-card__side-label">{flipped ? 'Answer' : 'Question'}</span>
				<span class="jmt-card__content" dangerouslySetInnerHTML={{ __html: flipped ? card.backHtml : card.frontHtml }} />
				<span class="jmt-card__hint">{flipped ? '' : 'Click or press Space to flip'}</span>
			</button>
			<div class="jmt-cards__bar">
				<button type="button" onClick={() => go(-1)} aria-label="Previous card">←</button>
				<span class="jmt-small">
					{pos + 1} / {order.length}
				</span>
				<button type="button" onClick={() => go(1)} aria-label="Next card">→</button>
				<span class="jmt-cards__spacer" />
				{flipped && (
					<>
						<button type="button" onClick={() => mark(true)}>🔁 Again</button>
						<button type="button" onClick={() => mark(false)}>✅ Got it</button>
					</>
				)}
				<button type="button" onClick={shuffle}>Shuffle</button>
				<button type="button" onClick={reviewOnly} disabled={again.size === 0}>
					Review pile ({again.size})
				</button>
			</div>
		</div>
	);
}
