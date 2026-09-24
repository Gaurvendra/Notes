package track.jdk_jre_jvm;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** Shared by the practice module (learner's code) and the solutions module (reference solution). */
class ModuleOfTest {

    @Test
    void coreClassesComeFromJavaBase() {
        assertThat(ModuleOf.moduleName(String.class)).isEqualTo("java.base");
        assertThat(ModuleOf.moduleName(java.util.HashMap.class)).isEqualTo("java.base");
    }

    @Test
    void otherJavaSeModules() {
        assertThat(ModuleOf.moduleName(java.sql.Connection.class)).isEqualTo("java.sql");
        assertThat(ModuleOf.moduleName(java.util.logging.Logger.class)).isEqualTo("java.logging");
        assertThat(ModuleOf.moduleName(java.net.http.HttpClient.class)).isEqualTo("java.net.http");
    }

    @Test
    void primitivesAndArraysBelongToAModuleToo() {
        assertThat(ModuleOf.moduleName(int.class)).isEqualTo("java.base");
        assertThat(ModuleOf.moduleName(String[].class)).isEqualTo("java.base");
        assertThat(ModuleOf.moduleName(java.sql.Connection[].class)).isEqualTo("java.sql");
    }

    @Test
    void ourOwnCodeOnTheClassPathIsUnnamed() {
        assertThat(ModuleOf.moduleName(ModuleOfTest.class)).isEqualTo("unnamed");
        assertThat(ModuleOf.moduleName(ModuleOfTest[].class)).isEqualTo("unnamed");
    }
}
