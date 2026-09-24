package track.floating_point;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.List;
import java.util.Random;
import org.junit.jupiter.api.Test;
import track.testkit.Golden;

/**
 * Ground truth for the website's interactive IEEE-754 lab: the JVM's own answers for a set of inputs, in both formats.
 * The website's `npm run check:floatlab` compares its JavaScript implementation against this file, so the widget can
 * never disagree with Java.
 */
class FloatLabFixtureTest {

    static final Path FIXTURE = Path.of("src/test/resources/fixtures/float-lab.tsv");
    static final Path RANDOM_FIXTURE = Path.of("src/test/resources/fixtures/float-lab-random.tsv");

    static final List<String> INPUTS = List.of(
            "0.1", "0.2", "0.3", "0.7", "4.125", "1", "-1", "0.5", "100", "1234567", "9999999", "16777216",
            "16777217", "123456789", "0.30000000000000004", "123.456", "0.001", "0.0001", "1e7", "2e23", "1e21",
            "1e-7", "-0", "0", "NaN", "Infinity", "-Infinity", "1e-45", "1.4e-45", "7e-46", "3.4028235e38",
            "3.5e38", "1e-50", "5e-324", "2.2250738585072014e-308", "1.7976931348623157e308", "1e309",
            "1.00000017881393432617187499", "1.00000017881393432617187501", "9007199254740993", "0.1e1", "-2.5",
            "1e-323");

    @Test
    void jvmAnswersMatchTheFixtureTheWebsiteChecksAgainst() {
        var out = new StringBuilder("# format\tinput\tbits(hex)\tjavaToString\texactPlain\tkind\tulp\n");
        for (String input : INPUTS) {
            float f = Float.parseFloat(input);
            out.append(row("float", input, Integer.toHexString(Float.floatToIntBits(f)), Float.toString(f),
                    exact(f), kind(f), Float.toString(Math.ulp(f))));
            double d = Double.parseDouble(input);
            out.append(row("double", input, Long.toHexString(Double.doubleToLongBits(d)), Double.toString(d),
                    exact(d), kind(d), Double.toString(Math.ulp(d))));
        }
        Golden.assertMatches(out.toString(), FIXTURE);
    }

    /** Any bit pattern a learner can click together: 1000 random floats and doubles (fixed seed). */
    @Test
    void jvmAnswersForRandomBitPatterns() {
        var out = new StringBuilder("# format\tbits(hex)\tjavaToString\tulp\n");
        Random random = new Random(754);
        for (int i = 0; i < 1000; i++) {
            float f = Float.intBitsToFloat(random.nextInt());
            if (!Float.isNaN(f)) {
                out.append(row("float", Integer.toHexString(Float.floatToIntBits(f)), Float.toString(f),
                        Float.toString(Math.ulp(f))));
            }
            double d = Double.longBitsToDouble(random.nextLong());
            if (!Double.isNaN(d)) {
                out.append(row("double", Long.toHexString(Double.doubleToLongBits(d)), Double.toString(d),
                        Double.toString(Math.ulp(d))));
            }
        }
        Golden.assertMatches(out.toString(), RANDOM_FIXTURE);
    }

    private static String row(String... cells) {
        return String.join("\t", cells) + "\n";
    }

    private static String exact(double value) {
        return Double.isFinite(value) ? new BigDecimal(value).toPlainString() : Double.toString(value);
    }

    private static String kind(double value) {
        if (Double.isNaN(value)) {
            return "nan";
        }
        if (Double.isInfinite(value)) {
            return "infinity";
        }
        if (value == 0) {
            return "zero";
        }
        return Math.abs(value) < Double.MIN_NORMAL ? "subnormal" : "normal";
    }

    private static String kind(float value) {
        if (Float.isFinite(value) && value != 0 && Math.abs(value) < Float.MIN_NORMAL) {
            return "subnormal";
        }
        return kind((double) value);
    }
}
