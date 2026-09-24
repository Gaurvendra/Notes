package track.floating_point;

import java.util.OptionalDouble;
import java.util.stream.DoubleStream;

/** Edge case: dividing by zero doesn't throw for doubles. An empty average silently becomes NaN. */
public class EmptyAverage {

    public static void main(String[] args) {
        // @snippet:start nan
        double[] latenciesMs = {};                  // no requests in this time window

        double sum = 0;
        for (double latency : latenciesMs) {
            sum += latency;
        }
        double average = sum / latenciesMs.length;  // 0.0 / 0 → NaN, no exception
        System.out.println("average:        " + average);
        System.out.println("average > 500?  " + (average > 500));    // every comparison with NaN is false
        System.out.println("average <= 500? " + (average <= 500));
        // @snippet:end nan

        // @snippet:start fix
        OptionalDouble safe = DoubleStream.of(latenciesMs).average(); // empty → "no value"
        System.out.println("stream average: " + safe);
        System.out.println("int division:   " + divide(1, 0));
        // @snippet:end fix
    }

    // @snippet:start int-division
    static String divide(int a, int b) {
        try {
            return String.valueOf(a / b);
        } catch (ArithmeticException e) {
            return "ArithmeticException: " + e.getMessage();   // only int/long division throws
        }
    }
    // @snippet:end int-division
}
