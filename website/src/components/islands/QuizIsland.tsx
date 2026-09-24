import { useState } from 'preact/hooks';

export interface QuizOption {
	html: string;
	correct: boolean;
	whyHtml: string;
}
export interface QuizQuestion {
	html: string;
	options: QuizOption[];
}

/** Multiple-choice quiz with per-option explanations. Several correct options → checkboxes. */
export default function QuizIsland({ questions, quizId }: { questions: QuizQuestion[]; quizId: string }) {
	const [answers, setAnswers] = useState<Record<number, Set<number>>>({});
	const [checked, setChecked] = useState<Record<number, boolean>>({});

	const isMulti = (q: QuizQuestion) => q.options.filter((o) => o.correct).length > 1;
	const isRight = (qi: number) => {
		const chosen = answers[qi] ?? new Set<number>();
		return questions[qi].options.every((o, oi) => o.correct === chosen.has(oi));
	};
	const toggle = (qi: number, oi: number, multi: boolean) => {
		setChecked({ ...checked, [qi]: false });
		const next = new Set(multi ? answers[qi] ?? [] : []);
		if (multi && next.has(oi)) next.delete(oi);
		else next.add(oi);
		setAnswers({ ...answers, [qi]: next });
	};
	const score = Object.keys(checked).filter((k) => checked[Number(k)] && isRight(Number(k))).length;
	const answered = Object.values(checked).filter(Boolean).length;

	return (
		<div class="jmt-quiz">
			{questions.map((q, qi) => {
				const multi = isMulti(q);
				const chosen = answers[qi] ?? new Set<number>();
				const done = checked[qi];
				return (
					<fieldset class={`jmt-quiz__q ${done ? (isRight(qi) ? 'is-right' : 'is-wrong') : ''}`}>
						<legend>
							<span class="jmt-quiz__num">Q{qi + 1}.</span>{' '}
							<span dangerouslySetInnerHTML={{ __html: q.html }} />
							{multi && <span class="jmt-small jmt-muted"> (choose all that apply)</span>}
						</legend>
						{q.options.map((o, oi) => {
							const selected = chosen.has(oi);
							const state = done ? (o.correct ? 'correct' : selected ? 'incorrect' : '') : '';
							return (
								<div class={`jmt-quiz__opt ${state}`}>
									<label>
										<input
											type={multi ? 'checkbox' : 'radio'}
											name={`${quizId}-q${qi}`}
											checked={selected}
											onChange={() => toggle(qi, oi, multi)}
										/>
										<span dangerouslySetInnerHTML={{ __html: o.html }} />
									</label>
									{done && (selected || o.correct) && (
										<div class="jmt-quiz__why" dangerouslySetInnerHTML={{ __html: o.whyHtml }} />
									)}
								</div>
							);
						})}
						<div class="jmt-quiz__actions">
							<button type="button" disabled={chosen.size === 0} onClick={() => setChecked({ ...checked, [qi]: true })}>
								Check answer
							</button>
							<span aria-live="polite" class="jmt-quiz__verdict">
								{done ? (isRight(qi) ? '✅ Correct' : '❌ Not quite: read the explanations') : ''}
							</span>
						</div>
					</fieldset>
				);
			})}
			<p class="jmt-quiz__score" aria-live="polite">
				Score: {score} / {questions.length}
				{answered === questions.length && (score === questions.length ? ' 🎉 Perfect!' : ' · review the explanations and retry')}
			</p>
		</div>
	);
}
