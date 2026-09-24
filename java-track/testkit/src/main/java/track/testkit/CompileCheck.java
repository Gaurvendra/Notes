package track.testkit;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Stream;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

/**
 * Compiles Java source with the real {@code javac} (via {@link javax.tools.JavaCompiler}) so lessons can prove
 * statements like "this does not compile" and quote the exact compiler message.
 */
public final class CompileCheck {

    /**
     * Result of a compilation: whether it succeeded plus the English error and warning messages. Messages use simple
     * type names ({@code ClassNotFoundException}, {@code List<String>}), like the {@code javac} command line prints
     * them; the compiler API alone would print fully qualified names.
     */
    public record Result(boolean success, List<String> errors, List<String> warnings) {
        /** First error message, or an empty string when there are no errors. */
        public String firstError() {
            return errors.isEmpty() ? "" : errors.getFirst();
        }
    }

    private CompileCheck() {
    }

    /** Compiles a single compilation unit. {@code fileName} is e.g. {@code "T.java"} or {@code "p/Shape.java"}. */
    public static Result compile(String fileName, String source, String... extraOptions) {
        return compile(Map.of(fileName, source), extraOptions);
    }

    /** Compiles several compilation units together (map of relative file name to source text). */
    public static Result compile(Map<String, String> sources, String... extraOptions) {
        Path dir = null;
        try {
            dir = Files.createTempDirectory("compile-check");
            List<Path> files = new ArrayList<>();
            for (var entry : sources.entrySet()) {
                Path file = dir.resolve("src").resolve(entry.getKey());
                Files.createDirectories(file.getParent());
                Files.writeString(file, entry.getValue());
                files.add(file);
            }
            return compileFiles(files, dir.resolve("classes"), extraOptions);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } finally {
            deleteQuietly(dir);
        }
    }

    /** Compiles every {@code .java} file under {@code sourceDir}. */
    public static Result compileDirectory(Path sourceDir, String... extraOptions) {
        Path out = null;
        try (Stream<Path> walk = Files.walk(sourceDir)) {
            List<Path> files = walk.filter(p -> p.toString().endsWith(".java")).sorted().toList();
            out = Files.createTempDirectory("compile-check-out");
            return compileFiles(files, out, extraOptions);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } finally {
            deleteQuietly(out);
        }
    }

    private static Result compileFiles(List<Path> files, Path outputDir, String... extraOptions) throws IOException {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            throw new IllegalStateException("No system Java compiler: run the tests on a JDK, not a JRE");
        }
        Files.createDirectories(outputDir);
        var diagnostics = new DiagnosticCollector<JavaFileObject>();
        List<String> options = new ArrayList<>(List.of("-d", outputDir.toString(), "-proc:none", "-Xlint:all"));
        options.addAll(List.of(extraOptions));
        try (StandardJavaFileManager fm = compiler.getStandardFileManager(diagnostics, Locale.ENGLISH, null)) {
            var units = fm.getJavaFileObjectsFromPaths(files);
            boolean ok = compiler.getTask(null, fm, diagnostics, options, null, units).call();
            List<String> errors = new ArrayList<>();
            List<String> warnings = new ArrayList<>();
            for (Diagnostic<? extends JavaFileObject> d : diagnostics.getDiagnostics()) {
                String message = simplifyTypeNames(d.getMessage(Locale.ENGLISH));
                if (d.getKind() == Diagnostic.Kind.ERROR) {
                    errors.add(message);
                } else if (d.getKind() == Diagnostic.Kind.WARNING || d.getKind() == Diagnostic.Kind.MANDATORY_WARNING) {
                    warnings.add(message);
                }
            }
            return new Result(ok, List.copyOf(errors), List.copyOf(warnings));
        }
    }

    /** Turns {@code java.util.List<java.lang.String>} into {@code List<String>} (package prefixes removed). */
    static String simplifyTypeNames(String message) {
        return QUALIFIED_NAME.matcher(message).replaceAll("$1");
    }

    private static final java.util.regex.Pattern QUALIFIED_NAME =
            java.util.regex.Pattern.compile("\\b(?:[a-z][a-z0-9_]*\\.)+([A-Z])");

    private static void deleteQuietly(Path dir) {
        if (dir == null) {
            return;
        }
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder()).forEach(p -> p.toFile().delete());
        } catch (IOException ignored) {
            // best effort clean-up of a temp directory
        }
    }
}
