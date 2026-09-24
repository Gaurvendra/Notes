package track.floating_point;

import java.math.BigDecimal;
import java.math.BigInteger;

/** Reference solution for the FloatDecoder exercise. */
public final class FloatDecoder {

    private static final int FRACTION_BITS = 23;
    private static final int BIAS = 127;

    private FloatDecoder() {
    }

    public static BigDecimal exactValue(int bits) {
        int sign = bits >>> 31;
        int exponent = (bits >>> FRACTION_BITS) & 0xFF;
        int fraction = bits & ((1 << FRACTION_BITS) - 1);
        if (exponent == 0xFF) {
            throw new IllegalArgumentException(fraction == 0 ? "infinity has no exact decimal value" : "NaN");
        }
        // |value| = significand × 2^power, with a whole-number significand
        boolean subnormal = exponent == 0;
        BigInteger significand = BigInteger.valueOf(subnormal ? fraction : (1 << FRACTION_BITS) | fraction);
        int power = (subnormal ? 1 : exponent) - BIAS - FRACTION_BITS;

        BigDecimal magnitude = power >= 0
                ? new BigDecimal(significand.shiftLeft(power))
                : new BigDecimal(significand.multiply(BigInteger.valueOf(5).pow(-power)), -power);  // 2^-n = 5^n / 10^n
        if (magnitude.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return sign == 1 ? magnitude.negate() : magnitude;
    }
}
