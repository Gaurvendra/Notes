package track.jdk_jre_jvm;

import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

/**
 * 🔴 Challenge: will my application run on this trimmed runtime?
 *
 * <p>{@code jlink} builds a runtime from a set of root modules <em>plus everything they require, transitively</em>.
 * Given
 * <ul>
 *   <li>{@code runtime}: the modules present in a runtime image,</li>
 *   <li>{@code needed}: the modules your application uses directly,</li>
 *   <li>{@code requires}: for every known module, the modules it requires,</li>
 * </ul>
 * return the modules your application needs (directly or transitively) that the runtime lacks, sorted by name.
 * Throw {@link IllegalArgumentException} naming the module if you reach a module that {@code requires} doesn't know.
 * Real module graphs never have cycles, but your code must not loop forever if given one.
 *
 * <p>Run the tests with {@code mvn -pl practice -am test -Dpractice -Dtest=RuntimePlannerTest} (from {@code java-track/}).
 */
public final class RuntimePlanner {

    private RuntimePlanner() {
    }

    public static SortedSet<String> missingModules(Set<String> runtime, Set<String> needed,
            Map<String, Set<String>> requires) {
        throw new UnsupportedOperationException("TODO: implement me");
    }
}
