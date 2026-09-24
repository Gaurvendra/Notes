package track.floating_point;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** BigDecimal, the right way and the four classic mistakes. */
public class BigDecimalBasics {

    public static void main(String[] args) {
        // @snippet:start create
        // Creating: from a String or valueOf, never new BigDecimal(double)
        System.out.println(new BigDecimal("0.1"));      // exactly 0.1
        System.out.println(BigDecimal.valueOf(0.1));    // uses Double.toString(0.1) = "0.1"
        System.out.println(new BigDecimal(0.1));        // the double's exact binary value
        // @snippet:end create
        System.out.println();

        // @snippet:start compare
        // equals() also compares the scale (number of decimal places)
        BigDecimal a = new BigDecimal("2.0");
        BigDecimal b = new BigDecimal("2.00");
        System.out.println(a.equals(b));                 // false: scale 1 vs scale 2
        System.out.println(a.compareTo(b) == 0);         // true: same numeric value
        // @snippet:end compare
        System.out.println();

        // @snippet:start divide
        BigDecimal one = BigDecimal.ONE;
        BigDecimal three = BigDecimal.valueOf(3);
        try {
            one.divide(three);                           // 0.333... never ends
        } catch (ArithmeticException e) {
            System.out.println(e.getMessage());
        }
        System.out.println(one.divide(three, 2, RoundingMode.HALF_EVEN));
        // @snippet:end divide
        System.out.println();

        // @snippet:start rounding
        // HALF_EVEN ("banker's rounding") vs HALF_UP ("school rounding")
        BigDecimal x = new BigDecimal("2.345");
        BigDecimal y = new BigDecimal("2.355");
        System.out.println(x.setScale(2, RoundingMode.HALF_EVEN) + " " + y.setScale(2, RoundingMode.HALF_EVEN));
        System.out.println(x.setScale(2, RoundingMode.HALF_UP) + " " + y.setScale(2, RoundingMode.HALF_UP));
        // @snippet:end rounding
    }
}
