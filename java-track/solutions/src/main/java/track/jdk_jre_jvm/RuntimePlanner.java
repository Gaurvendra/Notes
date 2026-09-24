package track.jdk_jre_jvm;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

/** Reference solution for the RuntimePlanner exercise: a graph walk, like jlink's module resolution. */
public final class RuntimePlanner {

    private RuntimePlanner() {
    }

    public static SortedSet<String> missingModules(Set<String> runtime, Set<String> needed,
            Map<String, Set<String>> requires) {
        Set<String> reachable = new HashSet<>();
        Deque<String> toVisit = new ArrayDeque<>(needed);
        while (!toVisit.isEmpty()) {
            String module = toVisit.pop();
            if (!reachable.add(module)) {
                continue;                           // already visited: this also stops cycles
            }
            Set<String> dependencies = requires.get(module);
            if (dependencies == null) {
                throw new IllegalArgumentException("unknown module: " + module);
            }
            toVisit.addAll(dependencies);
        }
        SortedSet<String> missing = new TreeSet<>(reachable);
        missing.removeAll(runtime);
        return missing;
    }
}
