package track.floating_point;

/**
 * 🟢 Warm-up: show the three parts of a float.
 *
 * <p>Return the 32 bits of {@code value} as {@code "<sign> <exponent> <mantissa>"}: 1 bit, a space, 8 bits, a space,
 * 23 bits, with leading zeros kept. Example: {@code format(4.125f)} returns
 * {@code "0 10000001 00001000000000000000000"}.
 *
 * <p>Run the tests with {@code mvn -pl practice -am test -Dpractice -Dtest=FloatBitsTest} (from {@code java-track/}).
 */
public final class FloatBits {

    private FloatBits() {
    }

    public static String format(float value) {
        throw new UnsupportedOperationException("TODO: implement me");
    }
}
