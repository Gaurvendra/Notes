package track.jdk_jre_jvm;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

/** Predict the output: the same javac compiles the same source with different {@code --release} values. */
public class ReleaseFlag {

    public static void main(String[] args) throws IOException {
        // @snippet:start puzzle
        for (String release : List.of("11", "17", "21", "25")) {
            int major = compileAndReadMajor(release);
            System.out.println("--release " + release + " -> major version " + major);
        }
        // @snippet:end puzzle
    }

    /** Compiles {@code class Tiny {}} with {@code javac --release <release>} and returns the class file's major version. */
    static int compileAndReadMajor(String release) throws IOException {
        Path dir = Files.createTempDirectory("release-flag");
        try {
            Path source = Files.writeString(dir.resolve("Tiny.java"), "class Tiny {}");
            JavaCompiler javac = ToolProvider.getSystemJavaCompiler();
            int exitCode = javac.run(null, null, null,
                    "--release", release, "-Xlint:-options", "-d", dir.toString(), source.toString());
            if (exitCode != 0) {
                throw new IllegalStateException("javac failed for --release " + release);
            }
            byte[] bytes = Files.readAllBytes(dir.resolve("Tiny.class"));
            return ((bytes[6] & 0xFF) << 8) | (bytes[7] & 0xFF);     // bytes 6-7: major version (unsigned)
        } finally {
            try (var files = Files.list(dir)) {
                for (Path file : files.toList()) {
                    Files.delete(file);
                }
            }
            Files.delete(dir);
        }
    }
}
