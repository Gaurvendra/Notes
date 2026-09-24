package track.jdk_jre_jvm;

import java.io.IOException;

/**
 * Scenario (edge case): bytecode is forward-compatible only. A JVM refuses a class file whose major version is newer
 * than it understands, exactly as a Java 21 JVM refuses code compiled for Java 25. We fake a "future" class file by
 * patching the version bytes, then ask the running JVM to load it.
 */
public class TooNewClassFile {

    /** The class whose bytecode we tamper with. */
    static class Greeter {
    }

    public static void main(String[] args) throws IOException {
        // @snippet:start too-new
        // Greeter was compiled for Java 25: major version 69
        byte[] bytes = ClassFileHeader.readClassFile(Greeter.class);
        bytes[7] = 99;   // byte 7 = low byte of the major version: now 99 ("Java 55")

        try {
            new RawClassLoader().define(Greeter.class.getName(), bytes);
            System.out.println("loaded");
        } catch (UnsupportedClassVersionError e) {
            System.out.println(e.getClass().getName());
            // The message ends with this JVM's limit ("... up to 69.0" on Java 25)
            String message = e.getMessage();
            System.out.println(message.substring(0, message.indexOf(", this version")));
        }
        // @snippet:end too-new
    }

    /** Turns raw bytes into a class, the way every class loader eventually does. */
    static final class RawClassLoader extends ClassLoader {
        Class<?> define(String name, byte[] bytes) {
            return defineClass(name, bytes, 0, bytes.length);
        }
    }
}
