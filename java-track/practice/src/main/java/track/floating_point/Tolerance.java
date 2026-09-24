package track.floating_point;

/**
 * 🟡 Core: compare two doubles safely.
 *
 * <p>{@code nearlyEqual(a, b, relTol, absTol)} is {@code true} when {@code a} and {@code b} are close enough:
 * <ul>
 *   <li>equal values are always close, including the same infinity, and {@code 0.0} vs {@code -0.0};</li>
 *   <li>NaN is never close to anything, and an infinity is only close to the same infinity;</li>
 *   <li>otherwise, {@code |a - b| <= max(relTol * max(|a|, |b|), absTol)}. The relative part scales with the size of
 *       the numbers; the absolute part handles comparisons with zero.</li>
 * </ul>
 * Throw {@link IllegalArgumentException} if a tolerance is negative or NaN.
 *
 * <p>Run the tests with {@code mvn -pl practice -am test -Dpractice -Dtest=ToleranceTest} (from {@code java-track/}).
 */
public final class Tolerance {

    private Tolerance() {
    }

    public static boolean nearlyEqual(double a, double b, double relTol, double absTol) {
        throw new UnsupportedOperationException("TODO: implement me");
    }
}
