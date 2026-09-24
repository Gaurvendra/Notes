package track.audit;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import track.testkit.CompileCheck;

/**
 * Every "this does / doesn't compile" statement in {@code source-notes/AUDIT.md} (batches 2-4), re-checked with the
 * real compiler. Cases live in {@code src/test/resources/compile-checks/batchN/<case>/}; {@code expected.tsv} holds the
 * expected first error message ({@code COMPILES OK} for cases that must compile).
 */
class CompileChecksTest {

    private static final Path ROOT = Path.of("src/test/resources/compile-checks");

    static Stream<Arguments> cases() throws IOException {
        try (Stream<Path> batches = Files.list(ROOT)) {
            return batches.sorted().flatMap(batch -> {
                try {
                    return Files.readAllLines(batch.resolve("expected.tsv")).stream()
                            .filter(line -> !line.isBlank())
                            .map(line -> line.split("\t", 2))
                            .map(parts -> Arguments.of(batch.getFileName() + "/" + parts[0], parts[1]));
                } catch (IOException e) {
                    throw new IllegalStateException(e);
                }
            }).toList().stream();
        }
    }

    @ParameterizedTest(name = "{0} → {1}")
    @MethodSource("cases")
    void compilerAgreesWithTheAudit(String caseDir, String expected) {
        var result = CompileCheck.compileDirectory(ROOT.resolve(caseDir));
        if (expected.equals("COMPILES OK")) {
            assertThat(result.errors()).as("errors for %s", caseDir).isEmpty();
            assertThat(result.success()).isTrue();
        } else {
            assertThat(result.success()).as("%s should not compile", caseDir).isFalse();
            assertThat(result.firstError()).as("first error for %s", caseDir).contains(expected);
        }
    }
}
