package track.jdk_jre_jvm;

import java.util.List;

/**
 * Scenario (anti-pattern → fix): parsing the Java version by hand. Code written in the Java 8 era assumed the
 * "1.8.0_402" format and broke (sometimes silently) when Java 9 switched to "9", "11.0.2", "25.0.4.1" (JEP 223).
 */
public class JavaVersionCheck {

    // @snippet:start broken
    // ❌ Assumes the old "1.<major>.0_<update>" format.
    static int legacyMajor(String version) {
        return Integer.parseInt(version.split("\\.")[1]);
    }
    // @snippet:end broken

    // @snippet:start fixed
    // ✅ Handles both formats. For the JVM you're running on,
    //    don't parse at all: use Runtime.version().feature().
    static int featureRelease(String version) {
        if (version.startsWith("1.")) {           // Java 8 and older: "1.8.0_402"
            return Integer.parseInt(version.substring(2).split("\\D")[0]);
        }
        return Runtime.Version.parse(version).feature();   // "25.0.4.1", "26-ea"
    }
    // @snippet:end fixed

    public static void main(String[] args) {
        // @snippet:start compare
        for (String v : List.of("1.8.0_402", "11.0.2", "17", "25.0.4.1", "26-ea")) {
            String legacy;
            try {
                legacy = String.valueOf(legacyMajor(v));
            } catch (RuntimeException e) {
                legacy = e.getClass().getSimpleName();
            }
            System.out.printf("%-10s legacy: %-31s fixed: %d%n",
                    v, legacy, featureRelease(v));
        }
        // @snippet:end compare
    }
}
