import { useState } from 'preact/hooks';
import {
	FORMATS,
	bitsOf,
	valueOf,
	decompose,
	exactDecimal,
	toPlain,
	exactString,
	javaToString,
	parseJava,
	ulp,
	errorOf,
	type Format,
} from '../../lib/ieee754.mjs';

const PRESETS = ['0.1', '0.7', '4.125', '16777217', '-0', '1e-45', 'Infinity', 'NaN'];
const KIND_TEXT = {
	normal: 'normal number',
	subnormal: 'subnormal number (exponent bits all 0: no hidden 1, fixed exponent)',
	zero: 'zero (exponent and fraction all 0; the sign bit gives +0.0 or −0.0)',
	infinity: 'infinity (exponent bits all 1, fraction 0)',
	nan: 'NaN, "not a number" (exponent bits all 1, fraction not 0)',
} as const;
const LONG = 90;

/** Interactive IEEE 754 explorer: type a number or flip bits; every readout matches what Java prints. */
export default function FloatLabIsland({ initial = '0.7', initialFormat = 'float' }: { initial?: string; initialFormat?: Format }) {
	const [format, setFormat] = useState<Format>(initialFormat);
	const [text, setText] = useState(initial);
	const [typed, setTyped] = useState<string | undefined>(initial);
	const [bits, setBits] = useState<bigint>(() => bitsOf(parseJava(initial, initialFormat) ?? 0, initialFormat));
	const [invalid, setInvalid] = useState(false);
	const [showAll, setShowAll] = useState(false);

	const f = FORMATS[format];
	const value = valueOf(bits, format);
	const parts = decompose(bits, format);

	const apply = (input: string, fmt: Format) => {
		setText(input);
		setShowAll(false);
		const parsed = parseJava(input, fmt);
		if (parsed === undefined) {
			setInvalid(input.trim() !== '');
			return;
		}
		setInvalid(false);
		setTyped(input);
		setBits(bitsOf(parsed, fmt));
	};
	const switchFormat = (fmt: Format) => {
		if (fmt === format) return;
		setFormat(fmt);
		apply(typed ?? javaToString(value, format), fmt);
	};
	const flip = (index: number) => {
		const next = bits ^ (1n << BigInt(f.total - 1 - index));
		setBits(next);
		setTyped(undefined);
		setInvalid(false);
		setShowAll(false);
		setText(javaToString(valueOf(next, format), format));
	};

	const bitString = bits.toString(2).padStart(f.total, '0');
	const fields = [
		{ name: 'sign', label: 'sign', from: 0, to: 1 },
		{ name: 'exp', label: `exponent (${f.expBits} bits)`, from: 1, to: 1 + f.expBits },
		{ name: 'frac', label: `fraction (${f.fracBits} bits)`, from: 1 + f.expBits, to: f.total },
	];

	const exact = exactString(bits, format);
	const shownExact = exact.length > LONG && !showAll ? `${exact.slice(0, LONG)}…` : exact;
	const error = typed === undefined ? undefined : errorOf(typed, bits, format);
	const finite = parts.kind !== 'nan' && parts.kind !== 'infinity';
	const significandText = toPlain(exactDecimal(parts.significand, -f.fracBits)); // 1.xxx or 0.xxx
	const exponentText =
		parts.kind === 'normal' ? `${parts.exponent} − ${f.bias} = ${parts.unbiased}` : `1 − ${f.bias} = ${parts.unbiased} (fixed)`;
	const javaType = format === 'float' ? 'Float' : 'Double';
	const hex = `0x${bits.toString(16).toUpperCase().padStart(f.total / 4, '0')}`;

	return (
		<div class="jmt-fl">
			<div class="jmt-fl__controls">
				<div class="jmt-fl__format" role="group" aria-label="Format">
					{(['float', 'double'] as const).map((fmt) => (
						<button type="button" aria-pressed={format === fmt} onClick={() => switchFormat(fmt)}>
							{fmt} ({FORMATS[fmt].total} bits)
						</button>
					))}
				</div>
				<label class="jmt-fl__input">
					<span>Type a number</span>
					<input
						type="text"
						inputMode="decimal"
						spellcheck={false}
						value={text}
						aria-invalid={invalid}
						onInput={(e) => apply((e.target as HTMLInputElement).value, format)}
					/>
				</label>
				<div class="jmt-fl__presets" role="group" aria-label="Examples">
					{PRESETS.map((p) => (
						<button type="button" onClick={() => apply(p, format)}>
							{p}
						</button>
					))}
				</div>
				{invalid && <p class="jmt-fl__invalid">Not a number Java can parse. Try 0.1, -2.5e3, NaN or Infinity.</p>}
			</div>

			<div class="jmt-fl__bits">
				{fields.map((field) => (
					<div class={`jmt-fl__field jmt-fl__field--${field.name}`}>
						<div class="jmt-fl__field-bits">
							{bitString
								.slice(field.from, field.to)
								.split('')
								.map((bit, i) => {
									const index = field.from + i;
									return (
										<button
											type="button"
											class="jmt-fl__bit"
											aria-label={`bit ${f.total - 1 - index} (${field.name}) is ${bit}, click to flip`}
											title={`bit ${f.total - 1 - index}: click to flip`}
											onClick={() => flip(index)}
										>
											{bit}
										</button>
									);
								})}
						</div>
						<span class="jmt-fl__field-label">{field.label}</span>
					</div>
				))}
			</div>

			<dl class="jmt-fl__readout" aria-live="polite">
				<dt>{javaType}.toString</dt>
				<dd>
					<code>{javaToString(value, format)}</code>
				</dd>
				<dt>Exactly stored</dt>
				<dd>
					<code class="jmt-fl__exact">{shownExact}</code>
					{exact.length > LONG && (
						<button type="button" class="jmt-fl__more" onClick={() => setShowAll(!showAll)}>
							{showAll ? 'show less' : `show all ${exact.replace(/[-.]/g, '').length} digits`}
						</button>
					)}
				</dd>
				{error !== undefined && (
					<>
						<dt>Error</dt>
						<dd>
							{error === '0' ? (
								'0: stored exactly'
							) : (
								<>
									you typed <code>{typed}</code>; typed − stored = <code class="jmt-fl__nowrap">{error}</code>
								</>
							)}
						</dd>
					</>
				)}
				<dt>Kind</dt>
				<dd>{KIND_TEXT[parts.kind]}</dd>
				{finite && (
					<>
						<dt>Formula</dt>
						<dd>
							<code>
								(−1)<sup>{parts.sign}</sup> × {significandText} × 2<sup>{parts.unbiased}</sup>
							</code>
							<span class="jmt-fl__note">exponent {exponentText}</span>
						</dd>
						<dt>Gap to next ({'Math.ulp'})</dt>
						<dd>
							<code>{javaToString(ulp(value, format), format)}</code>
						</dd>
					</>
				)}
				<dt>Bits in hex</dt>
				<dd>
					<code>{hex}</code>
					{parts.kind === 'nan' && (
						<span class="jmt-fl__note">
							{javaType}.{format === 'float' ? 'floatToIntBits' : 'doubleToLongBits'} returns every NaN as{' '}
							<code>{format === 'float' ? '0x7FC00000' : '0x7FF8000000000000'}</code>; the raw bits are shown here
						</span>
					)}
				</dd>
			</dl>
		</div>
	);
}
