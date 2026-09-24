package track.testkit;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Snippet regions let a lesson show only part of a compiled, tested source file.
 *
 * <pre>
 * // @snippet:start widening
 * long big = 123456789123456789L;
 * float f = big;             // compiles, silently loses precision
 * // @snippet:end widening
 * </pre>
 *
 * The website extracts regions with the same rules: the marker lines are removed, and the region is de-indented by its
 * common leading whitespace. Regions may nest (inner markers are dropped from the outer region's text).
 */
public final class Snippets {

    private static final Pattern MARKER = Pattern.compile("^\\s*// @snippet:(start|end) ([a-z0-9][a-z0-9-]*)\\s*$");

    private Snippets() {
    }

    /** Returns the de-indented text of region {@code name} in {@code file}. */
    public static String region(Path file, String name) {
        List<String> lines = readLines(file);
        List<String> out = new ArrayList<>();
        boolean inside = false;
        boolean found = false;
        for (String line : lines) {
            Matcher m = MARKER.matcher(line);
            if (m.matches()) {
                if (m.group(2).equals(name)) {
                    inside = m.group(1).equals("start");
                    found = true;
                }
                continue;
            }
            if (inside) {
                out.add(line);
            }
        }
        if (!found) {
            throw new IllegalArgumentException("No snippet region '" + name + "' in " + file);
        }
        return dedent(out);
    }

    /** Checks every {@code .java} file under {@code root}; returns human-readable problems (empty = all good). */
    public static List<String> validate(Path root) {
        List<String> problems = new ArrayList<>();
        try (Stream<Path> walk = Files.walk(root)) {
            for (Path file : walk.filter(p -> p.toString().endsWith(".java")).sorted().toList()) {
                problems.addAll(validateFile(file));
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return problems;
    }

    static List<String> validateFile(Path file) {
        List<String> problems = new ArrayList<>();
        Deque<String> open = new ArrayDeque<>();
        Set<String> seen = new HashSet<>();
        List<String> lines = readLines(file);
        for (int i = 0; i < lines.size(); i++) {
            Matcher m = MARKER.matcher(lines.get(i));
            if (!m.matches()) {
                if (lines.get(i).contains("@snippet:")) {
                    problems.add(file + ":" + (i + 1) + " malformed snippet marker");
                }
                continue;
            }
            String name = m.group(2);
            if (m.group(1).equals("start")) {
                if (!seen.add(name)) {
                    problems.add(file + ":" + (i + 1) + " duplicate region '" + name + "'");
                }
                open.push(name);
            } else if (open.isEmpty() || !open.peek().equals(name)) {
                problems.add(file + ":" + (i + 1) + " end of '" + name + "' does not match the innermost open region");
            } else {
                open.pop();
            }
        }
        for (String name : open) {
            problems.add(file + " region '" + name + "' is never closed");
        }
        return problems;
    }

    static String dedent(List<String> lines) {
        int indent = lines.stream()
                .filter(l -> !l.isBlank())
                .mapToInt(l -> l.length() - l.stripLeading().length())
                .min()
                .orElse(0);
        return lines.stream()
                .map(l -> l.isBlank() ? "" : l.substring(indent))
                .collect(Collectors.joining("\n"));
    }

    private static List<String> readLines(Path file) {
        try {
            return Files.readAllLines(file);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
