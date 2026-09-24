package track.floating_point;

import java.math.BigDecimal;

/**
 * The notes' two worked examples, done by the JVM: how 4.125f and 0.7f are stored (1 sign bit, 8 exponent bits,
 * 23 mantissa bits) and the exact value that ends up in memory.
 */
public class FloatAnatomy {

    public static void main(String[] args) {
        // @snippet:start anatomy
        for (float value : new float[] {4.125f, 0.7f}) {
            // The 32 bits of the float, padded with leading zeros
            String bits = String.format("%32s", Integer.toBinaryString(Float.floatToIntBits(value)))
                    .replace(' ', '0');
            String sign = bits.substring(0, 1);
            String exponent = bits.substring(1, 9);  // 8 bits, bias 127
            String mantissa = bits.substring(9);     // 23 bits after "1."
            int storedExponent = Integer.parseInt(exponent, 2);

            System.out.println("value     " + value);
            System.out.println("bits      " + sign + " " + exponent + " " + mantissa);
            System.out.println("exponent  " + storedExponent + " - 127 = " + (storedExponent - 127));
            // BigDecimal shows the exact value in memory
            System.out.println("stored    " + new BigDecimal(value));
            System.out.println();
        }
        // @snippet:end anatomy
    }
}
