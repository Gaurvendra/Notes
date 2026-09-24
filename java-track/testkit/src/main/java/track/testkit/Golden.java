package track.testkit;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Golden files: the expected program output lives in a text file that the tests compare against <em>and</em> the
 * website displays, so the output shown in a lesson can never drift from what the code really prints.
 *
 * <p>Location convention: {@code src/test/resources/outputs/<package path>/<SimpleClassName>.txt} (see
 * {@link #fileFor(Class)}). To (re)write golden files after an intentional change run
 * {@code mvn verify -Dgolden.update=true} and review the diff.
 */
public final class Golden {

    private static final Path ROOT = Path.of("src/test/resources/outputs");

    private Golden() {
    }

    /** The golden file for a program's main class. */
    public static Path fileFor(Class<?> mainClass) {
        return ROOT.resolve(mainClass.getPackageName().replace('.', '/')).resolve(mainClass.getSimpleName() + ".txt");
    }

    /** Runs {@code mainClass} and asserts its standard output equals its golden file. */
    public static void assertOutputMatches(Class<?> mainClass, String... args) throws Throwable {
        assertMatches(ConsoleCapture.runMain(mainClass, args).out(), fileFor(mainClass));
    }

    /** Asserts {@code actual} equals the content of {@code goldenFile} (or rewrites it in update mode). */
    public static void assertMatches(String actual, Path goldenFile) {
        try {
            if (Boolean.getBoolean("golden.update")) {
                Files.createDirectories(goldenFile.getParent());
                Files.writeString(goldenFile, actual);
                return;
            }
            assertThat(goldenFile).as("golden file (create it with -Dgolden.update=true)").exists();
            assertThat(actual).isEqualTo(Files.readString(goldenFile).replace("\r\n", "\n"));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
