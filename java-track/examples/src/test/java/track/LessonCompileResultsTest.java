package track;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import track.testkit.CompileCheck;

/**
 * Cases shown on the website with {@code <CompileResult case="<lesson>/<case>" />}. Each folder under
 * {@code src/test/resources/compile-errors/<lesson>/<case>/} holds one or more .java files plus {@code expected.txt}:
 * the expected first compiler error (a substring), or {@code COMPILES OK}.
 */
class LessonCompileResultsTest {

    private static final Path ROOT = Path.of("src/test/resources/compile-errors");

    /** Every folder with .java files is a case (its expected.txt may still be missing, see below). */
    static Stream<String> cases() throws IOException {
        try (Stream<Path> walk = Files.walk(ROOT)) {
            return walk.filter(p -> p.getFileName().toString().endsWith(".java"))
                    .map(p -> ROOT.relativize(p.getParent()).toString().replace('\\', '/'))
                    .distinct()
                    .sorted()
                    .toList()
                    .stream();
        }
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    void compilerResultMatchesExpectation(String caseId) throws IOException {
        Path dir = ROOT.resolve(caseId);
        Path expectedFile = dir.resolve("expected.txt");
        var result = CompileCheck.compileDirectory(dir);
        if (Files.notExists(expectedFile)) {
            // CI (-Dgolden.createMissing=true) records what the real javac says for a new case; locally it's an error
            assertThat(Boolean.getBoolean("golden.createMissing")).as("%s has no expected.txt", caseId).isTrue();
            Files.writeString(expectedFile, (result.success() ? "COMPILES OK" : result.firstError()) + "\n");
        }
        String expected = Files.readString(expectedFile).strip();
        if (expected.equals("COMPILES OK")) {
            assertThat(result.errors()).as(caseId).isEmpty();
        } else {
            assertThat(result.success()).as("%s must not compile", caseId).isFalse();
            assertThat(result.firstError()).as(caseId).contains(expected);
        }
    }
}
