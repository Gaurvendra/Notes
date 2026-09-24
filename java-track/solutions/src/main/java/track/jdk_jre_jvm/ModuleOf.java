package track.jdk_jre_jvm;

/** Reference solution for the ModuleOf exercise. */
public final class ModuleOf {

    private ModuleOf() {
    }

    public static String moduleName(Class<?> type) {
        Module module = type.getModule();   // never null: primitives and arrays report java.base / the element's module
        return module.isNamed() ? module.getName() : "unnamed";
    }
}
