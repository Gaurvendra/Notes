package track.floating_point;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.spi.ToolProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import track.testkit.Golden;

/**
 * The lesson's preview-feature demo, compiled with {@code --enable-preview} for the running JDK and run in its own JVM.
 * On a newer JDK this also tells us if the preview's behaviour changed.
 */
class PrimitivePatternsPreviewTest {

    static final Path SOURCE = Path.of("src/test/resources/preview/floating_point/FitsInFloat.java");

    @Test
    void instanceofFloatMatchesOnlyExactConversions(@TempDir Path out) throws Exception {
        String release = String.valueOf(Runtime.version().feature());
        int exit = ToolProvider.findFirst("javac").orElseThrow().run(System.out, System.err,
                "--enable-preview", "--release", release, "-Xlint:-preview", "-d", out.toString(), SOURCE.toString());
        assertThat(exit).isZero();

        Path java = Path.of(System.getProperty("java.home"), "bin", "java");
        var run = new ProcessBuilder(java.toString(), "--enable-preview", "-cp", out.toString(), "FitsInFloat");
        run.environment().remove("JAVA_TOOL_OPTIONS");
        run.redirectError(ProcessBuilder.Redirect.DISCARD);
        Process process = run.start();
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        assertThat(process.waitFor(60, TimeUnit.SECONDS)).isTrue();
        assertThat(process.exitValue()).isZero();
        Golden.assertMatches(output.replace("\r\n", "\n"),
                Path.of("src/test/resources/outputs/track/floating_point/FitsInFloat.preview.txt"));
        assertThat(Files.readString(SOURCE)).contains("d instanceof float f");
    }
}
