package track.jdk_jre_jvm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

import java.lang.module.ModuleDescriptor;
import java.lang.module.ModuleFinder;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

/** Shared by the practice module (learner's code) and the solutions module (reference solution). */
class RuntimePlannerTest {

    /** A small, real excerpt of the JDK's module graph (`java --describe-module java.sql`). */
    private static final Map<String, Set<String>> JDK_EXCERPT = Map.of(
            "java.base", Set.of(),
            "java.logging", Set.of("java.base"),
            "java.xml", Set.of("java.base"),
            "java.transaction.xa", Set.of("java.base"),
            "java.sql", Set.of("java.base", "java.logging", "java.transaction.xa", "java.xml"),
            "java.net.http", Set.of("java.base"));

    @Test
    void jdbcAppOnAJavaBaseOnlyRuntime() {
        assertThat(RuntimePlanner.missingModules(Set.of("java.base"), Set.of("java.sql"), JDK_EXCERPT))
                .containsExactly("java.logging", "java.sql", "java.transaction.xa", "java.xml");
    }

    @Test
    void nothingIsMissingWhenTheRuntimeHasEverything() {
        assertThat(RuntimePlanner.missingModules(JDK_EXCERPT.keySet(), Set.of("java.sql", "java.net.http"), JDK_EXCERPT))
                .isEmpty();
        assertThat(RuntimePlanner.missingModules(Set.of("java.base"), Set.of(), JDK_EXCERPT)).isEmpty();
    }

    @Test
    void aPresentModuleCanStillMissItsDependencies() {
        assertThat(RuntimePlanner.missingModules(Set.of("java.base", "java.sql"), Set.of("java.sql"), JDK_EXCERPT))
                .containsExactly("java.logging", "java.transaction.xa", "java.xml");
    }

    @Test
    void unknownModulesAreReported() {
        assertThatIllegalArgumentException()
                .isThrownBy(() -> RuntimePlanner.missingModules(Set.of("java.base"), Set.of("java.corba"), JDK_EXCERPT))
                .withMessageContaining("java.corba");
    }

    @Test
    void doesNotLoopForeverOnACycle() {
        Map<String, Set<String>> cyclic = Map.of("a", Set.of("b"), "b", Set.of("a"));
        assertThat(RuntimePlanner.missingModules(Set.of(), Set.of("a"), cyclic)).containsExactly("a", "b");
    }

    @Test
    void agreesWithTheRealModuleGraphOfThisJdk() {
        Map<String, Set<String>> real = ModuleFinder.ofSystem().findAll().stream()
                .map(reference -> reference.descriptor())
                .collect(Collectors.toMap(ModuleDescriptor::name, descriptor -> descriptor.requires().stream()
                        .map(ModuleDescriptor.Requires::name)
                        .collect(Collectors.toSet())));
        // the same answer jlink gives: `jlink --add-modules java.sql` also adds these three
        assertThat(RuntimePlanner.missingModules(Set.of("java.base"), Set.of("java.sql"), real))
                .containsExactly("java.logging", "java.sql", "java.transaction.xa", "java.xml");
        assertThat(RuntimePlanner.missingModules(Set.of("java.base"), Set.of("java.desktop"), real))
                .contains("java.desktop", "java.datatransfer", "java.prefs", "java.xml")
                .doesNotContain("java.base");
    }
}
