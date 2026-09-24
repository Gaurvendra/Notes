package track.audit;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

/** Executable evidence for AUDIT.md batch 1 (notes 01, 02, 04, 06, 07-08). */
class Batch1PrimitivesAndReferencesTest {

    static boolean booleanField;
    static char charField;

    @Test
    void fieldDefaults_4_6_and_4_11() {
        assertThat(booleanField).isFalse();                 // notes said the default is true
        assertThat((int) charField).isZero();
    }

    @Test
    void narrowingKeepsLowBits_4_13() {
        assertThat((byte) 128).isEqualTo((byte) -128);
        assertThat((byte) 148).isEqualTo((byte) -108);
        assertThat((int) 3.99e10).isEqualTo(Integer.MAX_VALUE);   // saturates
        assertThat((int) Double.NaN).isZero();
        assertThat((int) -7.9).isEqualTo(-7);                     // truncates toward zero
    }

    @Test
    void ieee754Layout_4_18_and_4_19() {
        assertThat(Integer.toBinaryString(Float.floatToIntBits(4.125f)))
                .isEqualTo("1000000100001000000000000000000");       // 0 10000001 00001000...
        assertThat(String.format("%32s", Integer.toBinaryString(Float.floatToIntBits(0.7f))).replace(' ', '0'))
                .isEqualTo("00111111001100110011001100110011");
        assertThat(new BigDecimal(0.7f)).isEqualByComparingTo("0.699999988079071044921875");
        assertThat(0.1 + 0.2).isEqualTo(0.30000000000000004);
    }

    @Test
    void promotionIsATypeRule_4_14() {
        final byte a = 1, b = 2;
        byte constantSum = a + b;                             // compiles: compile-time constants
        assertThat(constantSum).isEqualTo((byte) 3);
        int big = Integer.MAX_VALUE;
        assertThat(big + 1).isEqualTo(Integer.MIN_VALUE);     // int + int wraps, no promotion to long
    }

    @Test
    void wideningCanLosePrecision_4_12() {
        long l = 123456789123456789L;
        float f = l;
        assertThat((long) f).isEqualTo(123456790519087104L);
    }

    @Test
    void integerCacheAndImmutableWrappers_6_10_and_6_12() {
        Integer a = 127, b = 127, c = 128, d = 128;
        assertThat(a == b).isTrue();
        assertThat(c == d).isFalse();
        Integer w = 10;
        increment(w);
        assertThat(w).isEqualTo(10);                          // pass-by-value + immutable wrapper
    }

    private static void increment(Integer x) {
        x = x + 1;
    }

    @Test
    void stringPoolAndConcatenation_6_5() {
        String literal = "hello";
        String constantConcat = "hel" + "lo";
        String part = "hel";
        String runtimeConcat = part + "lo";
        assertThat(literal == constantConcat).isTrue();
        assertThat(literal == runtimeConcat).isFalse();
        assertThat(literal == runtimeConcat.intern()).isTrue();
    }

    @Test
    void charIsUtf16CodeUnit_4_6() {
        assertThat("😀".length()).isEqualTo(2);
        assertThat("😀".codePointCount(0, 2)).isEqualTo(1);
    }
}
