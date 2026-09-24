package track.testkit;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Captures what a piece of code prints, so tests can assert the exact output that a lesson shows.
 *
 * <p>Output is normalised to {@code \n} line endings. Capturing swaps {@link System#out} and {@link System#err}
 * globally, so tests that use it must not run in parallel (JUnit runs tests sequentially by default).
 */
public final class ConsoleCapture {

    /** Code under test; may throw anything. */
    @FunctionalInterface
    public interface ThrowingRunnable {
        void run() throws Throwable;
    }

    /** What was printed to standard out and standard error. */
    public record Output(String out, String err) {
        /** Standard-out lines (a trailing newline does not produce an empty last line). */
        public List<String> lines() {
            return out.isEmpty() ? List.of() : out.lines().toList();
        }
    }

    private ConsoleCapture() {
    }

    /** Runs {@code action} and returns everything it printed. Exceptions from {@code action} propagate. */
    public static synchronized Output run(ThrowingRunnable action) throws Throwable {
        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        try (PrintStream capturedOut = new PrintStream(out, true, StandardCharsets.UTF_8);
             PrintStream capturedErr = new PrintStream(err, true, StandardCharsets.UTF_8)) {
            System.setOut(capturedOut);
            System.setErr(capturedErr);
            action.run();
        } finally {
            System.setOut(originalOut);
            System.setErr(originalErr);
        }
        return new Output(normalise(out), normalise(err));
    }

    /**
     * Runs a program's {@code main} method and returns its output. Supports the classic
     * {@code public static void main(String[])} as well as Java 25 launch protocol variants (JEP 512): static or
     * instance {@code main}, with or without the {@code String[]} parameter.
     */
    public static Output runMain(Class<?> mainClass, String... args) throws Throwable {
        Method main = findMain(mainClass);
        return run(() -> {
            try {
                main.setAccessible(true);
                Object target = Modifier.isStatic(main.getModifiers())
                        ? null
                        : newInstance(mainClass);
                if (main.getParameterCount() == 1) {
                    main.invoke(target, (Object) args);
                } else {
                    main.invoke(target);
                }
            } catch (InvocationTargetException e) {
                throw e.getCause();
            }
        });
    }

    private static Method findMain(Class<?> c) throws NoSuchMethodException {
        try {
            return c.getDeclaredMethod("main", String[].class);
        } catch (NoSuchMethodException withoutArgs) {
            return c.getDeclaredMethod("main");
        }
    }

    private static Object newInstance(Class<?> c) throws ReflectiveOperationException {
        var constructor = c.getDeclaredConstructor();
        constructor.setAccessible(true);
        return constructor.newInstance();
    }

    private static String normalise(ByteArrayOutputStream bytes) {
        return bytes.toString(StandardCharsets.UTF_8).replace("\r\n", "\n");
    }
}
