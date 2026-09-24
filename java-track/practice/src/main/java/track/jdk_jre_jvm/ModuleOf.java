package track.jdk_jre_jvm;

/**
 * 🟢 Warm-up: which module does a class come from?
 *
 * <p>Return the name of the module that contains {@code type} (for example {@code "java.base"} for {@code String}).
 * Classes loaded from the class path (like your own code here) belong to an unnamed module: return
 * {@code "unnamed"} for them. Primitive types and arrays belong to a module too: find out which.
 *
 * <p>Run the tests with {@code mvn -pl practice -am test -Dpractice -Dtest=ModuleOfTest} (from {@code java-track/}).
 */
public final class ModuleOf {

    private ModuleOf() {
    }

    public static String moduleName(Class<?> type) {
        throw new UnsupportedOperationException("TODO: implement me");
    }
}
