package track.jdk_jre_jvm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import java.io.IOException;
import java.io.InputStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

/** Shared by the practice module (learner's code) and the solutions module (reference solution). */
class ClassFileVersionTest {

    private static byte[] header(int... values) {
        byte[] bytes = new byte[values.length];
        for (int i = 0; i < values.length; i++) {
            bytes[i] = (byte) values[i];
        }
        return bytes;
    }

    private static byte[] ownClassFile() throws IOException {
        try (InputStream in = ClassFileVersionTest.class.getResourceAsStream("ClassFileVersionTest.class")) {
            return in.readAllBytes();
        }
    }

    @ParameterizedTest(name = "major {0} -> Java {1}")
    @CsvSource({"49,5", "52,8", "55,11", "61,17", "65,21", "69,25", "71,27"})
    void mapsMajorVersionsToJavaReleases(int major, int release) {
        assertThat(ClassFileVersion.featureRelease(major)).isEqualTo(release);
    }

    @ParameterizedTest(name = "major {0} is rejected")
    @ValueSource(ints = {48, 45, 0, -1})
    void rejectsPreJava5Versions(int major) {
        assertThatIllegalArgumentException().isThrownBy(() -> ClassFileVersion.featureRelease(major));
    }

    @Test
    void readsTheMajorVersionOfARealClassFile() throws IOException {
        assertThat(ClassFileVersion.majorVersion(ownClassFile())).isEqualTo(69);   // this track compiles for Java 25
        assertThat(ClassFileVersion.isPreview(ownClassFile())).isFalse();
    }

    @Test
    void readsHandMadeHeaders() {
        assertThat(ClassFileVersion.majorVersion(header(0xCA, 0xFE, 0xBA, 0xBE, 0, 0, 0, 52))).isEqualTo(52);
        assertThat(ClassFileVersion.majorVersion(header(0xCA, 0xFE, 0xBA, 0xBE, 0, 0, 0, 65, 0x12, 0x34)))
                .as("bytes after the header are ignored").isEqualTo(65);
    }

    @Test
    void treatsVersionBytesAsUnsigned() {
        assertThat(ClassFileVersion.majorVersion(header(0xCA, 0xFE, 0xBA, 0xBE, 0, 0, 0, 0x80))).isEqualTo(128);
        assertThat(ClassFileVersion.majorVersion(header(0xCA, 0xFE, 0xBA, 0xBE, 0, 0, 0x01, 0x00))).isEqualTo(256);
    }

    @Test
    void detectsPreviewClassFiles() {
        assertThat(ClassFileVersion.isPreview(header(0xCA, 0xFE, 0xBA, 0xBE, 0xFF, 0xFF, 0, 69))).isTrue();
        assertThat(ClassFileVersion.isPreview(header(0xCA, 0xFE, 0xBA, 0xBE, 0, 1, 0, 69))).isFalse();
    }

    @Test
    void rejectsSomethingThatIsNotAClassFile() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> ClassFileVersion.majorVersion(header(0xCA, 0xFE, 0xBA, 0xBF, 0, 0, 0, 69)));
        assertThatIllegalArgumentException()
                .isThrownBy(() -> ClassFileVersion.isPreview(header(0x50, 0x4B, 0x03, 0x04, 0, 0, 0, 0)));   // a ZIP/JAR
        assertThatIllegalArgumentException()
                .isThrownBy(() -> ClassFileVersion.majorVersion(header(0xCA, 0xFE, 0xBA, 0xBE, 0, 0, 0)));   // 7 bytes
        assertThatIllegalArgumentException().isThrownBy(() -> ClassFileVersion.majorVersion(new byte[0]));
    }
}
