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

    static Stream<String> cases() throws IOException {
        try (Stream<Path> walk = Files.walk(ROOT)) {
            return walk.filter(p -> p.getFileName().toString().equals("expected.txt"))
                    .map(p -> ROOT.relativize(p.getParent()).toString().replace('\\', '/'))
                    .sorted()
                    .toList()
                    .stream();
        }
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("cases")
    void compilerResultMatchesExpectation(String caseId) throws IOException {
        Path dir = ROOT.resolve(caseId);
        String expected = Files.readString(dir.resolve("expected.txt")).strip();
        var result = CompileCheck.compileDirectory(dir);
        if (expected.equals("COMPILES OK")) {
            assertThat(result.errors()).as(caseId).isEmpty();
        } else {
            assertThat(result.success()).as("%s must not compile", caseId).isFalse();
            assertThat(result.firstError()).as(caseId).contains(expected);
        }
    }
}
