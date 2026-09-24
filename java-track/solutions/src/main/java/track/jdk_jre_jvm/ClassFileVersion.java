package track.jdk_jre_jvm;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;

/** Reference solution for the ClassFileVersion exercise. */
public final class ClassFileVersion {

    private static final int MAGIC = 0xCAFEBABE;
    private static final int FIRST_SIMPLE_MAJOR = 49;   // Java 5; older releases were numbered 1.0 to 1.4
    private static final int PREVIEW_MINOR = 0xFFFF;

    private ClassFileVersion() {
    }

    public static int featureRelease(int major) {
        if (major < FIRST_SIMPLE_MAJOR) {
            throw new IllegalArgumentException("major version " + major + " is older than Java 5 (49)");
        }
        return major - 44;
    }

    public static int majorVersion(byte[] classFile) {
        return header(classFile).major();
    }

    public static boolean isPreview(byte[] classFile) {
        return header(classFile).minor() == PREVIEW_MINOR;
    }

    private record Header(int minor, int major) {
    }

    private static Header header(byte[] classFile) {
        if (classFile.length < 8) {
            throw new IllegalArgumentException("a class file header has 8 bytes, got " + classFile.length);
        }
        try {
            var data = new DataInputStream(new ByteArrayInputStream(classFile));
            if (data.readInt() != MAGIC) {
                throw new IllegalArgumentException("not a class file: it doesn't start with 0xCAFEBABE");
            }
            int minor = data.readUnsignedShort();   // unsigned: bytes are signed in Java, 0x80 must not become -128
            int major = data.readUnsignedShort();
            return new Header(minor, major);
        } catch (IOException e) {
            throw new UncheckedIOException(e);    // can't happen: an in-memory stream with at least 8 bytes
        }
    }
}
