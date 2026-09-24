package track.floating_point;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** Shared by the practice module (learner's code) and the solutions module (reference solution). */
class FloatBitsTest {

    @Test
    void theNotesWorkedExamples() {
        assertThat(FloatBits.format(4.125f)).isEqualTo("0 10000001 00001000000000000000000");
        assertThat(FloatBits.format(0.7f)).isEqualTo("0 01111110 01100110011001100110011");
    }

    @Test
    void keepsLeadingZerosAndTheSignBit() {
        assertThat(FloatBits.format(1.0f)).isEqualTo("0 01111111 00000000000000000000000");
        assertThat(FloatBits.format(-2.0f)).isEqualTo("1 10000000 00000000000000000000000");
        assertThat(FloatBits.format(0.0f)).isEqualTo("0 00000000 00000000000000000000000");
        assertThat(FloatBits.format(-0.0f)).isEqualTo("1 00000000 00000000000000000000000");
    }

    @Test
    void specialValues() {
        assertThat(FloatBits.format(Float.MIN_VALUE)).isEqualTo("0 00000000 00000000000000000000001");
        assertThat(FloatBits.format(Float.MAX_VALUE)).isEqualTo("0 11111110 11111111111111111111111");
        assertThat(FloatBits.format(Float.NEGATIVE_INFINITY)).isEqualTo("1 11111111 00000000000000000000000");
        assertThat(FloatBits.format(Float.NaN)).isEqualTo("0 11111111 10000000000000000000000");
    }
}
