package track.floating_point;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import org.junit.jupiter.api.Test;

/** Shared by the practice module (learner's code) and the solutions module (reference solution). */
class ToleranceTest {

    private static final double REL = 1e-9;

    @Test
    void theClassicCase() {
        assertThat(0.1 + 0.2 == 0.3).isFalse();
        assertThat(Tolerance.nearlyEqual(0.1 + 0.2, 0.3, REL, 0)).isTrue();
        assertThat(Tolerance.nearlyEqual(0.1, 0.2, REL, 0)).isFalse();
    }

    @Test
    void relativeToleranceScalesWithTheNumbers() {
        assertThat(Tolerance.nearlyEqual(1e20, 1e20 + 1e10, REL, 0)).isTrue();    // 1e10 is tiny next to 1e20
        assertThat(Tolerance.nearlyEqual(1.0, 1.001, REL, 0)).isFalse();
        assertThat(Tolerance.nearlyEqual(1.0, 1.001, 1e-2, 0)).isTrue();
    }

    @Test
    void comparingWithZeroNeedsAnAbsoluteTolerance() {
        double almostZero = 0.1 * 3 - 0.3;                                        // 5.55e-17
        assertThat(Tolerance.nearlyEqual(almostZero, 0.0, REL, 0)).isFalse();   // relative alone can't work
        assertThat(Tolerance.nearlyEqual(almostZero, 0.0, REL, 1e-12)).isTrue();
    }

    @Test
    void specialValues() {
        assertThat(Tolerance.nearlyEqual(0.0, -0.0, 0, 0)).isTrue();
        assertThat(Tolerance.nearlyEqual(Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY, REL, 0)).isTrue();
        assertThat(Tolerance.nearlyEqual(Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY, 1, 1e300)).isFalse();
        assertThat(Tolerance.nearlyEqual(Double.POSITIVE_INFINITY, Double.MAX_VALUE, 1, 0)).isFalse();
        assertThat(Tolerance.nearlyEqual(Double.NaN, Double.NaN, 1, 1)).isFalse();
        assertThat(Tolerance.nearlyEqual(Double.NaN, 1.0, 1, 1)).isFalse();
    }

    @Test
    void rejectsBadTolerances() {
        assertThatIllegalArgumentException().isThrownBy(() -> Tolerance.nearlyEqual(1, 1, -1e-9, 0));
        assertThatIllegalArgumentException().isThrownBy(() -> Tolerance.nearlyEqual(1, 1, 0, -1));
        assertThatIllegalArgumentException().isThrownBy(() -> Tolerance.nearlyEqual(1, 1, Double.NaN, 0));
    }
}
