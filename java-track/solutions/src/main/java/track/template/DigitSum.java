package track.template;

/** Reference solution for the template exercise (see the practice module for the statement). */
public final class DigitSum {

    private DigitSum() {
    }

    public static int sumOfDigits(int n) {
        long value = Math.abs((long) n);   // widen first: Math.abs(Integer.MIN_VALUE) is still negative
        int sum = 0;
        while (value > 0) {
            sum += (int) (value % 10);
            value /= 10;
        }
        return sum;
    }
}
