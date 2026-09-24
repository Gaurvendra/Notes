package track.jdk_jre_jvm;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Scenario (real world): "which Java version does this .class file need?" The first 8 bytes of every class file
 * answer it (JVMS §4.1): a magic number, then the minor and major version.
 */
public class ClassFileHeader {

    public static void main(String[] args) throws IOException {
        // @snippet:start header
        // Read this program's own compiled bytecode
        byte[] bytes = readClassFile(ClassFileHeader.class);

        var data = new DataInputStream(new ByteArrayInputStream(bytes));
        int magic = data.readInt();            // 4 bytes: always 0xCAFEBABE
        int minor = data.readUnsignedShort();  // 2 bytes
        int major = data.readUnsignedShort();  // 2 bytes: 69 = Java 25

        System.out.printf("magic:   %X%n", magic);
        System.out.printf("version: %d.%d%n", major, minor);
        System.out.printf("needs:   Java %d or newer%n", major - 44);
        // @snippet:end header
    }

    /** Reads a class's compiled bytes from the class path ("Outer$Inner.class" for nested classes). */
    static byte[] readClassFile(Class<?> type) throws IOException {
        String fileName = type.getName().substring(type.getPackageName().length() + 1) + ".class";
        try (InputStream in = type.getResourceAsStream(fileName)) {
            return in.readAllBytes();
        }
    }
}
