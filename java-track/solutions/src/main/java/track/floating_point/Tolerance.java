package track.floating_point;

/** Reference solution for the Tolerance exercise (the same rule as Python's math.isclose). */
public final class Tolerance {

    private Tolerance() {
    }

    public static boolean nearlyEqual(double a, double b, double relTol, double absTol) {
        if (!(relTol >= 0) || !(absTol >= 0)) {          // written this way so NaN tolerances are rejected too
            throw new IllegalArgumentException("tolerances must be >= 0, got " + relTol + " and " + absTol);
        }
        if (a == b) {
            return true;                                  // same infinity, or 0.0 vs -0.0
        }
        if (Double.isNaN(a) || Double.isNaN(b) || Double.isInfinite(a) || Double.isInfinite(b)) {
            return false;
        }
        double difference = Math.abs(a - b);
        return difference <= Math.max(relTol * Math.max(Math.abs(a), Math.abs(b)), absTol);
    }
}
