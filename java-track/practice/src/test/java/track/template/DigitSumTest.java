package track.template;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/** Shared by the practice module (learner's code) and the solutions module (reference solution). */
class DigitSumTest {

    @ParameterizedTest(name = "sumOfDigits({0}) = {1}")
    @CsvSource({"0,0", "7,7", "123,6", "-123,6", "1000000,1", "2147483647,46", "-2147483648,47"})
    void sumsDigits(int n, int expected) {
        assertThat(DigitSum.sumOfDigits(n)).isEqualTo(expected);
    }
}
