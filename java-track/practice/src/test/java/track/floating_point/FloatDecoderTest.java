package track.floating_point;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import java.math.BigDecimal;
import java.util.Random;
import org.junit.jupiter.api.Test;

/** Shared by the practice module (learner's code) and the solutions module (reference solution). */
class FloatDecoderTest {

    private static BigDecimal jvm(int bits) {
        return new BigDecimal(Float.intBitsToFloat(bits));      // the JVM's own exact answer
    }

    @Test
    void theNotesWorkedExamples() {
        assertThat(FloatDecoder.exactValue(Float.floatToIntBits(4.125f))).isEqualByComparingTo("4.125");
        assertThat(FloatDecoder.exactValue(Float.floatToIntBits(0.7f)))
                .isEqualByComparingTo("0.699999988079071044921875");
    }

    @Test
    void signsZerosAndLimits() {
        assertThat(FloatDecoder.exactValue(Float.floatToIntBits(-2.5f))).isEqualByComparingTo("-2.5");
        assertThat(FloatDecoder.exactValue(0x00000000)).isEqualByComparingTo("0");
        assertThat(FloatDecoder.exactValue(0x80000000)).isEqualByComparingTo("0");     // -0.0f
        assertThat(FloatDecoder.exactValue(Float.floatToIntBits(Float.MAX_VALUE)))
                .isEqualByComparingTo("340282346638528859811704183484516925440");
    }

    @Test
    void subnormalNumbers() {
        assertThat(FloatDecoder.exactValue(0x00000001)).isEqualByComparingTo(jvm(0x00000001));   // Float.MIN_VALUE
        assertThat(FloatDecoder.exactValue(0x007fffff)).isEqualByComparingTo(jvm(0x007fffff));   // largest subnormal
        assertThat(FloatDecoder.exactValue(0x00800000)).isEqualByComparingTo(jvm(0x00800000));   // MIN_NORMAL
    }

    @Test
    void agreesWithTheJvmOnTenThousandRandomFloats() {
        Random random = new Random(754);
        for (int i = 0; i < 10_000; i++) {
            int bits = random.nextInt();
            if (((bits >>> 23) & 0xFF) == 0xFF) {
                continue;                                         // infinities and NaNs are tested below
            }
            assertThat(FloatDecoder.exactValue(bits)).as("bits %08x", bits).isEqualByComparingTo(jvm(bits));
        }
    }

    @Test
    void rejectsInfinityAndNaN() {
        assertThatIllegalArgumentException().isThrownBy(() -> FloatDecoder.exactValue(0x7f800000));
        assertThatIllegalArgumentException().isThrownBy(() -> FloatDecoder.exactValue(0xff800000));
        assertThatIllegalArgumentException().isThrownBy(() -> FloatDecoder.exactValue(0x7fc00000));
    }
}
