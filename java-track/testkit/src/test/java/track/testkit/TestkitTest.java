package track.testkit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class TestkitTest {

    static class ClassicMain {
        public static void main(String[] args) {
            System.out.println("hello " + args.length);
            System.err.println("oops");
        }
    }

    static class InstanceMain {
        void main() {
            System.out.println("instance main");
        }
    }

    @Test
    void capturesClassicAndInstanceMain() throws Throwable {
        var out = ConsoleCapture.runMain(ClassicMain.class, "a", "b");
        assertThat(out.lines()).containsExactly("hello 2");
        assertThat(out.err()).isEqualTo("oops\n");
        assertThat(ConsoleCapture.runMain(InstanceMain.class).lines()).containsExactly("instance main");
    }

    @Test
    void restoresSystemOutEvenWhenCodeThrows() {
        var before = System.out;
        assertThatThrownBy(() -> ConsoleCapture.run(() -> {
            System.out.print("partial");
            throw new IllegalStateException("boom");
        })).isInstanceOf(IllegalStateException.class);
        assertThat(System.out).isSameAs(before);
    }

    @Test
    void reportsCompileErrorsInEnglish() {
        var bad = CompileCheck.compile("T.java", "class T { void m(int x) { switch (x) { case 1: break; case 1: break; } } }");
        assertThat(bad.success()).isFalse();
        assertThat(bad.firstError()).isEqualTo("duplicate case label");

        var good = CompileCheck.compile("T.java", "class T { int twice(int x) { return 2 * x; } }");
        assertThat(good.success()).isTrue();
        assertThat(good.errors()).isEmpty();
    }

    @Test
    void simplifiesQualifiedTypeNamesLikeTheJavacCommandLine() {
        assertThat(CompileCheck.simplifyTypeNames("Instance method m(java.util.List<java.lang.String>...) in p1.Shape"))
                .isEqualTo("Instance method m(List<String>...) in Shape");
        assertThat(CompileCheck.simplifyTypeNames("module java.base does not export x")).contains("java.base");
    }

    @Test
    void compilesMultipleFilesInPackages() {
        var result = CompileCheck.compile(Map.of(
                "p1/Shape.java", "package p1; public sealed interface Shape permits p2.Circle {}",
                "p2/Circle.java", "package p2; public final class Circle implements p1.Shape {}"));
        assertThat(result.success()).isFalse();
        assertThat(result.firstError()).contains("sealed class in a different package");
    }

    @Test
    void extractsAndValidatesSnippetRegions(@TempDir Path dir) throws Exception {
        Path file = dir.resolve("Demo.java");
        Files.writeString(file, """
                class Demo {
                    void m() {
                        // @snippet:start outer
                        int a = 1;
                        // @snippet:start inner
                        int b = 2;
                        // @snippet:end inner
                        // @snippet:end outer
                    }
                }
                """);
        assertThat(Snippets.region(file, "outer")).isEqualTo("int a = 1;\nint b = 2;");
        assertThat(Snippets.region(file, "inner")).isEqualTo("int b = 2;");
        assertThat(Snippets.validate(dir)).isEmpty();

        Files.writeString(dir.resolve("Broken.java"), "// @snippet:start x\nclass Broken {}\n// @snippet:end y\n");
        assertThat(Snippets.validate(dir)).hasSize(2);
        assertThatThrownBy(() -> Snippets.region(file, "missing")).isInstanceOf(IllegalArgumentException.class);
    }
}
