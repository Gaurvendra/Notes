package track.floating_point;

import java.math.BigDecimal;
import java.util.stream.DoubleStream;

/** Under the hood: every + rounds, errors accumulate, and some APIs compensate for it. */
public class SummingErrors {

    public static void main(String[] args) {
        // @snippet:start sums
        double loop = 0;
        for (int i = 0; i < 10; i++) {
            loop += 0.1;                                  // rounds after every addition
        }
        double stream = DoubleStream.generate(() -> 0.1).limit(10).sum();  // compensated summation
        BigDecimal exact = new BigDecimal("0.1").multiply(BigDecimal.TEN);

        System.out.println("loop:        " + loop);
        System.out.println("stream sum:  " + stream);
        System.out.println("BigDecimal:  " + exact);
        // @snippet:end sums
        System.out.println();

        // @snippet:start fma
        // 0.1 * 10 - 1.0 rounds twice; Math.fma rounds once and reveals the hidden error
        System.out.println("0.1 * 10 - 1.0        = " + (0.1 * 10 - 1.0));
        System.out.println("Math.fma(0.1, 10, -1) = " + Math.fma(0.1, 10, -1.0));
        // @snippet:end fma
    }
}
