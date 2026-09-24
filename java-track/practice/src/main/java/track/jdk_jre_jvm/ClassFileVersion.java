package track.jdk_jre_jvm;

/**
 * 🟡 Core: read the version stamp of a class file.
 *
 * <p>Every class file starts with 8 bytes (JVMS §4.1): the magic number {@code 0xCAFEBABE} (4 bytes), then the
 * minor version (2 bytes) and the major version (2 bytes), both unsigned and big-endian.
 * <ul>
 *   <li>{@link #featureRelease(int)}: the Java release a major version belongs to (52 → 8, 69 → 25). Only Java 5
 *       (major 49) and newer use the simple rule; throw {@link IllegalArgumentException} for anything older.</li>
 *   <li>{@link #majorVersion(byte[])}: the major version stored in a class file.</li>
 *   <li>{@link #isPreview(byte[])}: {@code true} if the class was compiled with {@code --enable-preview} and uses
 *       preview features. javac marks such classes with the minor version {@code 0xFFFF} (65535).</li>
 * </ul>
 * Both byte-reading methods must throw {@link IllegalArgumentException} if the array is shorter than 8 bytes or doesn't
 * start with the magic number.
 *
 * <p>Run the tests with {@code mvn -pl practice -am test -Dpractice -Dtest=ClassFileVersionTest} (from {@code java-track/}).
 */
public final class ClassFileVersion {

    private ClassFileVersion() {
    }

    public static int featureRelease(int major) {
        throw new UnsupportedOperationException("TODO: implement me");
    }

    public static int majorVersion(byte[] classFile) {
        throw new UnsupportedOperationException("TODO: implement me");
    }

    public static boolean isPreview(byte[] classFile) {
        throw new UnsupportedOperationException("TODO: implement me");
    }
}
