package track.jdk_jre_jvm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.spi.ToolProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import track.testkit.Golden;

/** Lesson jdk-jre-jvm: every program's output equals the golden file the website shows. */
class JdkJreJvmExamplesTest {

    @ParameterizedTest(name = "{0}")
    @ValueSource(classes = {WhereClassesLive.class, ClassFileHeader.class, WhatIsInThisRuntime.class,
            TooNewClassFile.class, JavaVersionCheck.class, WhoLoadedIt.class, PackageIsNotModule.class,
            ReleaseFlag.class})
    void outputMatchesTheWebsite(Class<?> program) throws Throwable {
        Golden.assertOutputMatches(program);
    }

    @Test
    void javapReportsTheSameMajorVersionAsOurHeaderReader() throws Exception {
        var out = new StringWriter();
        int exit = ToolProvider.findFirst("javap").orElseThrow()
                .run(new PrintWriter(out), new PrintWriter(new StringWriter()),
                        "-v", "-cp", "target/classes", ClassFileHeader.class.getName());
        assertThat(exit).isZero();
        assertThat(out.toString()).contains("major version: 69", "minor version: 0");
    }

    @Test
    void theJvmNamesItsOwnLimitAsFeatureReleasePlus44() throws Exception {
        byte[] bytes = ClassFileHeader.readClassFile(TooNewClassFile.Greeter.class);
        bytes[7] = 99;
        var error = catchThrowableOfType(UnsupportedClassVersionError.class,
                () -> new TooNewClassFile.RawClassLoader().define(TooNewClassFile.Greeter.class.getName(), bytes));
        int newestMajor = Runtime.version().feature() + 44;   // 69 on Java 25, 71 on Java 27
        assertThat(error.getMessage())
                .endsWith("only recognizes class file versions up to " + newestMajor + ".0");
    }

    @Test
    void legacyParsingIsWrongForEveryModernVersionString() {
        assertThat(JavaVersionCheck.legacyMajor("1.8.0_402")).isEqualTo(8);
        assertThat(JavaVersionCheck.legacyMajor("11.0.2")).isZero();   // silently wrong: the worst kind of bug
        assertThat(JavaVersionCheck.featureRelease("1.7.0_80")).isEqualTo(7);
        assertThat(JavaVersionCheck.featureRelease(System.getProperty("java.version")))
                .isEqualTo(Runtime.version().feature());
    }

    @Test
    void releaseChecksTheApiWhileSourceAndTargetDoNot(@TempDir Path dir) throws Exception {
        Path source = Files.writeString(dir.resolve("UsesIO.java"), """
                public class UsesIO {
                    public static void main(String[] args) {
                        IO.println("IO is new in Java 25");
                    }
                }
                """);
        var javac = ToolProvider.findFirst("javac").orElseThrow();

        var withRelease = new StringWriter();
        int releaseExit = javac.run(new PrintWriter(withRelease), new PrintWriter(withRelease),
                "--release", "21", "-d", dir.resolve("r").toString(), source.toString());
        assertThat(releaseExit).isNotZero();
        assertThat(withRelease.toString()).contains("error: cannot find symbol", "symbol:   variable IO");

        var withSourceTarget = new StringWriter();
        int oldStyleExit = javac.run(new PrintWriter(withSourceTarget), new PrintWriter(withSourceTarget),
                "-source", "21", "-target", "21", "-d", dir.resolve("st").toString(), source.toString());
        assertThat(oldStyleExit).as("compiles, and would fail on Java 21 at run time").isZero();
        assertThat(withSourceTarget.toString())
                .contains("--release 21 is recommended instead of -source 21 -target 21");
    }
}
