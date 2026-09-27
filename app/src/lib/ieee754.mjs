// IEEE 754 binary32 (float) and binary64 (double) helpers for the interactive "IEEE 754 lab".
// Everything here must agree with the JVM: `npm run check:content` compares it against
// app/scripts/fixtures/float-lab*.tsv, which Java itself generated (FloatLabFixtureTest, commit 719dbf3).
// Pure functions, no DOM: shared by the React widget (src/content/mdx/FloatLab.tsx) and the Node check script.

export const FORMATS = {
	float: { total: 32, expBits: 8, fracBits: 23, bias: 127, maxDigits: 9 },
	double: { total: 64, expBits: 11, fracBits: 52, bias: 1023, maxDigits: 17 },
};

const view = new DataView(new ArrayBuffer(8));

/** Bits (BigInt) of a JS number stored in the given format. For 'float' the number must already be a float value. */
export function bitsOf(value, format) {
	if (format === 'float') {
		view.setFloat32(0, value);
		return BigInt(view.getUint32(0));
	}
	view.setFloat64(0, value);
	return view.getBigUint64(0);
}

/** The JS number stored by these bits. */
export function valueOf(bits, format) {
	if (format === 'float') {
		view.setUint32(0, Number(bits));
		return view.getFloat32(0);
	}
	view.setBigUint64(0, bits);
	return view.getFloat64(0);
}

/**
 * Splits bits into their fields. `significand` and `power` describe the exact magnitude as significand × 2^power
 * (for finite values).
 */
export function decompose(bits, format) {
	const f = FORMATS[format];
	const fracBits = BigInt(f.fracBits);
	const fraction = bits & ((1n << fracBits) - 1n);
	const exponent = Number((bits >> fracBits) & ((1n << BigInt(f.expBits)) - 1n));
	const sign = Number(bits >> BigInt(f.total - 1));
	const maxExponent = (1 << f.expBits) - 1;
	let kind;
	if (exponent === maxExponent) kind = fraction === 0n ? 'infinity' : 'nan';
	else if (exponent === 0) kind = fraction === 0n ? 'zero' : 'subnormal';
	else kind = 'normal';
	const significand = kind === 'normal' ? (1n << fracBits) | fraction : fraction;
	const power = (kind === 'normal' ? exponent : 1) - f.bias - f.fracBits;
	return { sign, exponent, fraction, kind, significand, power, unbiased: kind === 'normal' ? exponent - f.bias : 1 - f.bias };
}

/** Exact magnitude as a decimal: value = digits × 10^-scale, with no trailing zeros in digits when scale > 0. */
export function exactDecimal(significand, power) {
	let digits;
	let scale;
	if (power >= 0) {
		digits = significand << BigInt(power);
		scale = 0;
	} else {
		digits = significand * 5n ** BigInt(-power); // 2^-n = 5^n / 10^n
		scale = -power;
	}
	while (scale > 0 && digits !== 0n && digits % 10n === 0n) {
		digits /= 10n;
		scale--;
	}
	if (digits === 0n) scale = 0;
	return { digits, scale };
}

/** Plain decimal string like Java's BigDecimal.toPlainString() (no sign handling). */
export function toPlain({ digits, scale }) {
	const s = digits.toString();
	if (scale === 0) return s;
	const padded = s.padStart(scale + 1, '0');
	return `${padded.slice(0, padded.length - scale)}.${padded.slice(padded.length - scale)}`;
}

/** Exact stored value as a plain decimal string (Java: new BigDecimal(x).toPlainString()); "NaN"/"Infinity" otherwise. */
export function exactString(bits, format) {
	const d = decompose(bits, format);
	if (d.kind === 'nan') return 'NaN';
	if (d.kind === 'infinity') return d.sign ? '-Infinity' : 'Infinity';
	const plain = toPlain(exactDecimal(d.significand, d.power));
	return d.sign && plain !== '0' ? `-${plain}` : plain;
}

/**
 * Java's Float.toString / Double.toString (JDK 19+, JDK-4511638). The spec: take the decimals that round to the value;
 * keep those of minimal length n (when n is 1, also allow length 2); print the one closest to the exact value, or, if
 * two are equally close, the one whose last digit is even. Done exactly with BigInt: note that at a power of two the
 * rounding interval below the value is half the size of the one above, so the closest n-digit decimal may not round
 * back while a farther one does.
 */
export function javaToString(value, format) {
	if (Number.isNaN(value)) return 'NaN';
	if (value === Infinity) return 'Infinity';
	if (value === -Infinity) return '-Infinity';
	if (value === 0) return Object.is(value, -0) ? '-0.0' : '0.0';
	const abs = Math.abs(value);
	const d = decompose(bitsOf(abs, format), format);
	const { digits: D, scale: s } = exactDecimal(d.significand, d.power); // abs = D × 10^-s exactly
	const L = D.toString().length;
	const roundsBack = (q, t) => {
		const text = `${q}e${-t}`;
		return (format === 'float' ? parseJava(text, 'float') : Number(text)) === abs;
	};
	// n-digit decimals just below and above the exact value, with their distance to it (in units of 10^-s)
	const candidatesOfLength = (n) => {
		if (L <= n) return [{ q: D, t: s, dist: 0n }];
		const k = L - n;
		const unit = 10n ** BigInt(k);
		const q = D / unit;
		const r = D % unit;
		const list = [{ q, t: s - k, dist: r }];
		if (r !== 0n) list.push({ q: q + 1n, t: s - k, dist: unit - r });
		return list;
	};
	let chosen;
	for (let n = 1; n <= FORMATS[format].maxDigits && !chosen; n++) {
		const pool = (n === 1 ? [...candidatesOfLength(1), ...candidatesOfLength(2)] : candidatesOfLength(n)).filter(
			(c) => roundsBack(c.q, c.t),
		);
		if (!pool.length) continue;
		// only lengths with a valid candidate count; for n = 1, length-2 decimals compete too (JDK spec)
		chosen = pool.reduce((best, c) => {
			if (c.dist < best.dist) return c;
			if (c.dist === best.dist && best.q % 2n !== 0n && c.q % 2n === 0n) return c;
			return best;
		});
	}
	chosen ??= candidatesOfLength(FORMATS[format].maxDigits)[0];
	let digitsText = chosen.q.toString();
	const exp10 = digitsText.length - 1 - chosen.t; // chosen = d.ddd × 10^exp10
	digitsText = digitsText.replace(/0+$/, '') || '0';
	let body;
	if (abs >= 1e-3 && abs < 1e7) {
		const point = exp10 + 1; // digits before the decimal point
		if (point <= 0) body = `0.${'0'.repeat(-point)}${digitsText}`;
		else if (point >= digitsText.length) body = `${digitsText}${'0'.repeat(point - digitsText.length)}.0`;
		else body = `${digitsText.slice(0, point)}.${digitsText.slice(point)}`;
	} else {
		body = `${digitsText[0]}.${digitsText.slice(1) || '0'}E${exp10}`;
	}
	return value < 0 ? `-${body}` : body;
}

/** Parses decimal text the way Java's Float.parseFloat / Double.parseDouble do (ties to even, no double rounding). */
export function parseJava(text, format) {
	const t = text.trim();
	if (/^[+-]?NaN$/.test(t)) return NaN;
	if (/^\+?Infinity$/.test(t)) return Infinity;
	if (t === '-Infinity') return -Infinity;
	const exact = parseDecimal(t);
	if (!exact) return undefined;
	const d = Number(t);
	if (format === 'double') return d; // JS parsing is correctly rounded to double
	// text → double → float can round twice. The correct float is f0 or one of its neighbours: pick the closest to
	// the exact decimal, ties to even.
	const f0 = Math.fround(d);
	if (!Number.isFinite(f0)) return f0;
	const candidates = [f0, nextFloat(f0, -1), nextFloat(f0, 1)].filter(Number.isFinite);
	let best = candidates[0];
	for (const c of candidates.slice(1)) {
		const cmp = compareDistance(exact, c, best, format);
		if (cmp < 0 || (cmp === 0 && (bitsOf(c, format) & 1n) === 0n)) best = c;
	}
	return exact.negative && best === 0 ? -0 : best;
}

/** { negative, digits, scale } with value = ±digits × 10^-scale, or undefined if the text isn't a decimal number. */
export function parseDecimal(text) {
	const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(text.trim());
	if (!m || (m[2] === '' && (m[3] ?? '') === '')) return undefined;
	const fraction = m[3] ?? '';
	let digits = BigInt((m[2] + fraction) || '0');
	let scale = fraction.length - Number(m[4] ?? 0);
	if (scale < 0) {
		digits *= 10n ** BigInt(-scale);
		scale = 0;
	}
	return { negative: m[1] === '-', digits, scale };
}

function nextFloat(f, direction) {
	const bits = bitsOf(f, 'float');
	if (f === 0) return direction > 0 ? valueOf(1n, 'float') : -valueOf(1n, 'float');
	const up = (f > 0) === direction > 0;
	return valueOf(up ? bits + 1n : bits - 1n, 'float');
}

/** Exact rational of a finite number: { num, den } (BigInt, den > 0). */
function rationalOf(value, format) {
	const d = decompose(bitsOf(value, format), format);
	const sign = d.sign ? -1n : 1n;
	return d.power >= 0
		? { num: sign * (d.significand << BigInt(d.power)), den: 1n }
		: { num: sign * d.significand, den: 1n << BigInt(-d.power) };
}

/** Sign of |exact − a| − |exact − b|. */
function compareDistance(exact, a, b, format) {
	const t = { num: (exact.negative ? -1n : 1n) * exact.digits, den: 10n ** BigInt(exact.scale) };
	const ra = rationalOf(a, format);
	const rb = rationalOf(b, format);
	const abs = (x) => (x < 0n ? -x : x);
	const da = abs(t.num * ra.den - ra.num * t.den); // |t − a| × t.den × a.den
	const db = abs(t.num * rb.den - rb.num * t.den); // |t − b| × t.den × b.den
	const left = da * rb.den;
	const right = db * ra.den;
	return left < right ? -1 : left > right ? 1 : 0;
}

/** Java's Math.ulp: the gap to the next larger value in magnitude (2^(e − fracBits); the smallest subnormal below). */
export function ulp(value, format) {
	if (Number.isNaN(value)) return NaN;
	if (!Number.isFinite(value)) return Infinity;
	const f = FORMATS[format];
	const d = decompose(bitsOf(value, format), format);
	const power = (d.kind === 'normal' ? d.exponent : 1) - f.bias - f.fracBits;
	return 2 ** power;
}

/**
 * Exact difference typed − stored, formatted with 3 significant digits ("1.19e-8", "1.00", "-5.93e-326"), "0" when the
 * typed decimal is stored exactly, or undefined when not meaningful. Formatted from the exact BigInt digits, because
 * the difference can be far smaller than the smallest double.
 */
export function errorOf(text, bits, format) {
	const typed = parseDecimal(text);
	const d = decompose(bits, format);
	if (!typed || d.kind === 'nan' || d.kind === 'infinity') return undefined;
	const stored = exactDecimal(d.significand, d.power);
	const scale = Math.max(typed.scale, stored.scale);
	const tv = (typed.negative ? -1n : 1n) * typed.digits * 10n ** BigInt(scale - typed.scale);
	const sv = (d.sign ? -1n : 1n) * stored.digits * 10n ** BigInt(scale - stored.scale);
	const diff = tv - sv;
	if (diff === 0n) return '0';
	const digits = (diff < 0n ? -diff : diff).toString();
	let exp10 = digits.length - 1 - scale;
	let mantissa = Number(Number(`${digits[0]}.${digits.slice(1, 17) || '0'}`).toFixed(2));
	if (mantissa >= 10) {
		mantissa /= 10;
		exp10++;
	}
	const body = exp10 >= -4 && exp10 < 6 ? (mantissa * 10 ** exp10).toPrecision(3) : `${mantissa.toFixed(2)}e${exp10}`;
	return diff < 0n ? `-${body}` : body;
}
