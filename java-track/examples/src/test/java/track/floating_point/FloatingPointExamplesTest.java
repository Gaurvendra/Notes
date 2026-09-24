package track.floating_point;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import track.testkit.Golden;

/** Lesson floating-point: every program's output equals the golden file the website shows, plus the key facts. */
class FloatingPointExamplesTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {FloatAnatomy.class, ClassicSurprises.class, SpecialValuesPuzzle.class,
            RoundingPuzzle.class, UlpTable.class, CountersAndIds.class, MoneyMath.class, LoopWithDoubleStep.class,
            EmptyAverage.class, BigDecimalBasics.class, SummingErrors.class})
    void outputMatchesTheWebsite(Class<?> program) throws Throwable {
        Golden.assertOutputMatches(program);
    }

    @Test
    void theNotesWorkedExamplesAreStoredAsTheLessonSays() {
        assertThat(Float.floatToIntBits(4.125f)).isEqualTo(0b0_10000001_00001000000000000000000);
        assertThat(Float.floatToIntBits(0.7f)).isEqualTo(0b0_01111110_01100110011001100110011);
        assertThat(new BigDecimal(0.7f)).isEqualByComparingTo("0.699999988079071044921875");
        // the last mantissa bit is rounded (to nearest), not cut off: truncation would give a smaller value
        assertThat(Float.intBitsToFloat(Float.floatToIntBits(0.7f) - 1)).isLessThan(0.7f);
        assertThat(Math.abs(new BigDecimal(0.7f).doubleValue() - 0.7))
                .isLessThan(Math.abs(new BigDecimal(Math.nextDown(0.7f)).doubleValue() - 0.7));
    }

    @Test
    void layoutsAndLimitsMatchIeee754() {
        assertThat(Float.SIZE).isEqualTo(32);
        assertThat(Double.SIZE).isEqualTo(64);
        assertThat(Float.PRECISION).isEqualTo(24);           // 23 stored bits + the hidden 1
        assertThat(Double.PRECISION).isEqualTo(53);
        assertThat(Float.MAX_EXPONENT).isEqualTo(127);
        assertThat(Double.MAX_EXPONENT).isEqualTo(1023);
        assertThat(Math.getExponent(4.125f)).isEqualTo(2);
        assertThat(Math.getExponent(0.7f)).isEqualTo(-1);
        assertThat(Float.floatToIntBits(Float.NaN)).isEqualTo(0x7fc00000);
        assertThat(Float.floatToIntBits(-0.0f)).isEqualTo(0x80000000);
    }

    @Test
    void newerApisExistOnThisJdk() {
        short half = Float.floatToFloat16(0.1f);                 // Java 20+
        assertThat(Float.float16ToFloat(half)).isEqualTo(0.099975586f);
        assertThat(Math.fma(0.1, 10, -1.0)).isEqualTo(5.551115123125783E-17);   // Java 9+
        assertThat(Double.toString(2e23)).isEqualTo("2.0E23");   // shortest-repr toString (Java 19+)
    }
}
