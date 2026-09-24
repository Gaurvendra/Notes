package track.floating_point;

import java.math.BigDecimal;

/** Anti-pattern → fix: adding prices with double, then with BigDecimal. */
public class MoneyMath {

    public static void main(String[] args) {
        // @snippet:start broken
        // ❌ Money in a double: 0.10 has no exact binary form
        double total = 0;
        for (int i = 0; i < 3; i++) {
            total += 0.10;                          // three items at ₹0.10
        }
        System.out.println("double total:  " + total);
        System.out.println("equals 0.30?   " + (total == 0.30));
        // @snippet:end broken

        // @snippet:start fixed
        // ✅ Money in a BigDecimal, created from a String
        BigDecimal price = new BigDecimal("0.10");
        BigDecimal sum = BigDecimal.ZERO;
        for (int i = 0; i < 3; i++) {
            sum = sum.add(price);                   // BigDecimal is immutable: keep the result
        }
        System.out.println("BigDecimal:    " + sum);
        System.out.println("equals 0.30?   " + (sum.compareTo(new BigDecimal("0.30")) == 0));
        // @snippet:end fixed
    }
}
