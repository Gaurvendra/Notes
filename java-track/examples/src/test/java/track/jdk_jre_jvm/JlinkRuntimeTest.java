package track.jdk_jre_jvm;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.spi.ToolProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import track.testkit.Golden;

/**
 * Backs the lesson's jlink lab: link a runtime that contains only {@code java.base}, check what is (not) in it, and
 * run {@link WhatIsInThisRuntime} on it. Its output is the second golden file shown on the website.
 */
class JlinkRuntimeTest {

    @Test
    void javaBaseOnlyRuntimeRunsOurProgramButCannotCompile(@TempDir Path temp) throws Exception {
        Path image = temp.resolve("rt-base");
        var jlinkOut = new StringWriter();
        int exit = ToolProvider.findFirst("jlink").orElseThrow().run(
                new PrintWriter(jlinkOut), new PrintWriter(jlinkOut),
                "--add-modules", "java.base", "--strip-debug", "--no-header-files", "--no-man-pages",
                "--output", image.toString());
        assertThat(exit).as("jlink output: %s", jlinkOut).isZero();

        assertThat(Files.readString(image.resolve("release"))).contains("MODULES=\"java.base\"");
        assertThat(image.resolve("bin/java")).exists();
        assertThat(image.resolve("bin/javac")).doesNotExist();
        assertThat(image.resolve("bin/jshell")).doesNotExist();

        var run = new ProcessBuilder(image.resolve("bin/java").toString(),
                "-cp", "target/classes", WhatIsInThisRuntime.class.getName());
        run.environment().remove("JAVA_TOOL_OPTIONS");   // keep stderr free of "Picked up ..." noise
        run.redirectError(ProcessBuilder.Redirect.DISCARD);
        Process process = run.start();
        String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        assertThat(process.waitFor(60, TimeUnit.SECONDS)).isTrue();
        assertThat(process.exitValue()).isZero();

        Path golden = Golden.fileFor(WhatIsInThisRuntime.class)
                .resolveSibling("WhatIsInThisRuntime.java-base-only.txt");
        Golden.assertMatches(output.replace("\r\n", "\n"), golden);
    }
}
