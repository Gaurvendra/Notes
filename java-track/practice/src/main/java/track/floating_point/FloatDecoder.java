package track.floating_point;

import java.math.BigDecimal;

/**
 * 🔴 Challenge: decode a float by hand.
 *
 * <p>Given the 32 bits of a float (as returned by {@link Float#floatToIntBits}), return the exact value it stores,
 * using only the IEEE 754 rules, not {@code Float.intBitsToFloat}:
 * <ul>
 *   <li>sign = bit 31, exponent = bits 30–23, fraction = bits 22–0;</li>
 *   <li>normal numbers (exponent 1–254): {@code (-1)^sign × (1 + fraction / 2^23) × 2^(exponent - 127)};</li>
 *   <li>subnormal numbers and zero (exponent 0): {@code (-1)^sign × (fraction / 2^23) × 2^-126};</li>
 *   <li>exponent 255 means infinity or NaN: throw {@link IllegalArgumentException}.</li>
 * </ul>
 * Both zeros return {@link BigDecimal#ZERO} (BigDecimal has no negative zero).
 *
 * <p>Run the tests with {@code mvn -pl practice -am test -Dpractice -Dtest=FloatDecoderTest} (from {@code java-track/}).
 */
public final class FloatDecoder {

    private FloatDecoder() {
    }

    public static BigDecimal exactValue(int bits) {
        throw new UnsupportedOperationException("TODO: implement me");
    }
}
