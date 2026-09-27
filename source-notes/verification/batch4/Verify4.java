import java.io.*;
import java.util.*;
import java.util.stream.*;

public class Verify4 {
    public static void main(String[] args) throws Exception {
        System.out.println("java " + Runtime.version());
        streams();
        sequenced();
        sealed();
        optional();
    }

    // ---------------- STREAMS (note 28) ----------------
    static void streams() {
        System.out.println("[stream] salaries > 3000: " + List.of(3000, 4100, 9000, 1000, 3500).stream().filter(s -> s > 3000).count());
        System.out.println("[stream] iterate(1000, n+5000).limit(5): " + Stream.iterate(1000, n -> n + 5000).limit(5).toList());
        System.out.println("[stream] distinct keeps first-encounter order: " + Stream.of(1, 5, 2, 7, 4, 4, 2, 0, 9).distinct().toList());
        System.out.println("[stream] sorted desc: " + Stream.of(1, 5, 2, 7, 4, 4, 2, 0, 9).sorted(Comparator.reverseOrder()).toList());
        Comparator<Integer> subtraction = (a, b) -> a - b;
        List<Integer> extremes = new ArrayList<>(List.of(Integer.MIN_VALUE, 1, Integer.MAX_VALUE));
        extremes.sort(subtraction);
        System.out.println("[stream] subtraction comparator (a-b) overflows with extremes -> 'sorted' as " + extremes + " ; Integer::compare is safe");
        IntStream s = Arrays.stream(new int[]{2, 1, 4, 7});
        s.filter(v -> v > 2);   // result discarded (notes' example)
        try { System.out.println(Arrays.toString(s.toArray())); }
        catch (IllegalStateException e) { System.out.println("[stream] notes' mapToInt example (filter result ignored, then toArray on original) -> IllegalStateException: " + e.getMessage()); }
        System.out.print("[stream] lazy + terminal count() with filter prints: ");
        long c1 = List.of(2, 1, 4, 7, 10).stream().filter(v -> v >= 3).peek(v -> System.out.print(v + " ")).count();
        System.out.println("(count=" + c1 + ")");
        System.out.print("[stream] Java 9+: count() WITHOUT filter may skip the pipeline, peek prints: [");
        long c2 = List.of(2, 1, 4, 7, 10).stream().peek(v -> System.out.print(v + " ")).count();
        System.out.println("] (count=" + c2 + ")");
        StringBuilder order = new StringBuilder();
        List.of(2, 1, 4, 7, 10).stream().filter(v -> v >= 3).peek(v -> order.append("F").append(v).append(' '))
            .map(v -> -v).peek(v -> order.append("N").append(v).append(' ')).sorted().peek(v -> order.append("S").append(v).append(' ')).toList();
        System.out.println("[stream] vertical processing, sorted() is a barrier: " + order.toString().trim());
        StringBuilder sc = new StringBuilder();
        Optional<Integer> first = List.of(2, 1, 4, 7, 10).stream().peek(v -> sc.append(v).append(' ')).filter(v -> v > 3).findFirst();
        System.out.println("[stream] short-circuit findFirst(>3)=" + first.get() + " visited only: " + sc.toString().trim());
        System.out.println("[stream] reduce sum: " + List.of(2, 1, 4, 7, 10).stream().reduce(Integer::sum).get() + ", with identity: " + List.of(2, 1, 4, 7, 10).stream().reduce(0, Integer::sum));
        System.out.println("[stream] non-associative reduce (subtraction) seq vs parallel: " + IntStream.rangeClosed(1, 100).reduce(0, (a, b) -> a - b) + " vs " + IntStream.rangeClosed(1, 100).parallel().reduce(0, (a, b) -> a - b));
        System.out.println("[stream] min(v1-v2)=" + List.of(2, 1, 4, 7, 10).stream().filter(v -> v >= 3).min((a, b) -> a - b).get()
            + ", min(v2-v1)=" + List.of(2, 1, 4, 7, 10).stream().filter(v -> v >= 3).min((a, b) -> b - a).get()
            + ", max(v1-v2)=" + List.of(2, 1, 4, 7, 10).stream().filter(v -> v >= 3).max((a, b) -> a - b).get()
            + ", max(v2-v1)=" + List.of(2, 1, 4, 7, 10).stream().filter(v -> v >= 3).max((a, b) -> b - a).get());
        System.out.println("[stream] allMatch(>0)=" + List.of(2, 1, 4).stream().allMatch(v -> v > 0) + ", noneMatch(>5)=" + List.of(2, 1, 4).stream().noneMatch(v -> v > 5)
            + ", empty stream: allMatch=" + Stream.<Integer>empty().allMatch(v -> v > 100) + " anyMatch=" + Stream.<Integer>empty().anyMatch(v -> true));
        System.out.println("[stream] findAny sequential=" + List.of(2, 1, 4, 7, 10).stream().findAny().get() + " (not random; usually first)");
        Stream<Integer> used = List.of(1, 2).stream(); used.forEach(v -> {});
        try { used.toList(); } catch (IllegalStateException e) { System.out.println("[stream] reuse -> IllegalStateException: " + e.getMessage()); }
        List<Integer> unmod = Stream.of(1, 2).toList();
        try { unmod.add(3); } catch (UnsupportedOperationException e) { System.out.println("[stream] Stream.toList() (Java 16) is unmodifiable; Collectors.toList() gave " + Stream.of(1).collect(Collectors.toList()).getClass().getSimpleName()); }
        try { Stream.of("a", "b", "a").collect(Collectors.toMap(x -> x, x -> 1)); } catch (IllegalStateException e) { System.out.println("[stream] toMap with duplicate keys -> IllegalStateException: " + e.getMessage()); }
        System.out.println("[stream] groupingBy length: " + Stream.of("HELLO", "HOW", "ARE", "YOU", "DOING").collect(Collectors.groupingBy(String::length, TreeMap::new, Collectors.toList())));
        System.out.println("[stream] partitioningBy even: " + IntStream.rangeClosed(1, 6).boxed().collect(Collectors.partitioningBy(v -> v % 2 == 0)));
        System.out.println("[stream] joining: " + Stream.of("I", "LOVE", "JAVA").collect(Collectors.joining(" ", "[", "]")));
        System.out.println("[stream] takeWhile/dropWhile (9): " + Stream.of(1, 2, 5, 1).takeWhile(v -> v < 3).toList() + " / " + Stream.of(1, 2, 5, 1).dropWhile(v -> v < 3).toList());
        System.out.println("[stream] Gatherers.windowFixed(2) (JDK 24 final): " + Stream.of(1, 2, 3, 4, 5).gather(Gatherers.windowFixed(2)).toList());
        System.out.println("[stream] IntStream.range(1,5).sum()=" + IntStream.range(1, 5).sum() + ", average of empty = " + IntStream.empty().average());
        List<Integer> unsafe = new ArrayList<>();
        IntStream.range(0, 10_000).parallel().forEach(unsafe::add);
        System.out.println("[stream] parallel forEach into ArrayList (shared mutable state): size=" + unsafe.size() + " (expected 10000; wrong or exception is typical)");
        List<Integer> nums = List.of(11, 22, 33, 44, 55, 66, 77, 88, 99, 110);
        long p0 = System.nanoTime(); nums.parallelStream().map(v -> v * v).toList(); long par = System.nanoTime() - p0;
        long s0 = System.nanoTime(); nums.stream().map(v -> v * v).toList(); long seq = System.nanoTime() - s0;
        System.out.println("[stream] 10 elements, PARALLEL run first: parallel=" + par / 1000 + "us, sequential=" + seq / 1000 + "us -> first run pays warm-up; not a fair benchmark");
    }

    // ---------------- SEQUENCED COLLECTIONS (note 40) ----------------
    static void sequenced() {
        List<String> list = new ArrayList<>(List.of("B", "C", "D"));
        System.out.print("[seq] list: first=" + list.getFirst() + " last=" + list.getLast());
        list.addFirst("A"); list.addLast("Z"); System.out.print(" after add=" + list);
        list.removeFirst(); list.removeLast(); System.out.println(" after remove=" + list + " reversed=" + list.reversed());
        List<String> rev = list.reversed(); rev.addFirst("X");
        System.out.println("[seq] reversed() is a live VIEW: reversed.addFirst(\"X\") -> original=" + list);
        List<String> old = new ArrayList<>(List.of("a", "b", "c")); Collections.reverse(old);
        System.out.println("[seq] pre-21 Collections.reverse mutates in place: " + old);
        SequencedSet<String> set = new LinkedHashSet<>(List.of("B", "C", "D"));
        set.addFirst("A"); set.addLast("Z"); set.addFirst("C");
        System.out.print("[seq] LinkedHashSet addFirst(dup) repositions: " + set);
        set.removeFirst(); set.removeLast(); System.out.println(" -> after removeFirst/Last " + set + " reversed=" + set.reversed());
        SequencedSet<Integer> tree = new TreeSet<>(Set.of(14, 5, 7));
        try { tree.addFirst(2); } catch (UnsupportedOperationException e) { System.out.println("[seq] TreeSet.addFirst -> UnsupportedOperationException; first=" + tree.getFirst() + " last=" + tree.getLast() + " reversed=" + tree.reversed()); }
        SequencedMap<Integer, String> lhm = new LinkedHashMap<>();
        lhm.put(100, "B"); lhm.put(200, "C"); lhm.put(300, "D");
        lhm.putFirst(400, "A"); lhm.putLast(500, "Z");
        System.out.print("[seq] LinkedHashMap putFirst/putLast: " + lhm);
        lhm.pollFirstEntry(); lhm.pollLastEntry(); System.out.println(" -> after polls " + lhm + " reversed=" + lhm.reversed());
        SequencedMap<Integer, String> tm = new TreeMap<>(Map.of(100, "B", 200, "C"));
        try { tm.putFirst(50, "A"); } catch (UnsupportedOperationException e) { System.out.println("[seq] TreeMap.putFirst -> UnsupportedOperationException"); }
        try { new ArrayList<String>().getFirst(); } catch (NoSuchElementException e) { System.out.println("[seq] empty list getFirst() -> NoSuchElementException (get(0) would be IndexOutOfBoundsException)"); }
        try { List.of(1, 2).addFirst(0); } catch (UnsupportedOperationException e) { System.out.println("[seq] List.of(..).addFirst -> UnsupportedOperationException (immutable)"); }
        System.out.println("[seq] is SequencedCollection? ArrayDeque=" + (new ArrayDeque<>() instanceof SequencedCollection)
            + " LinkedList=" + (new LinkedList<>() instanceof SequencedCollection) + " PriorityQueue=" + (new PriorityQueue<>() instanceof SequencedCollection)
            + " HashSet=" + (new HashSet<>() instanceof SequencedCollection) + " HashMap=" + (new HashMap<>() instanceof SequencedMap)
            + " ConcurrentSkipListSet=" + (new java.util.concurrent.ConcurrentSkipListSet<>() instanceof SequencedSet)
            + " CopyOnWriteArrayList=" + (new java.util.concurrent.CopyOnWriteArrayList<>() instanceof SequencedCollection));
        System.out.println("[seq] Collections.unmodifiableSequencedSet exists: " + Collections.unmodifiableSequencedSet(new LinkedHashSet<>(List.of(1))).getFirst());
    }

    // ---------------- SEALED (note 41) ----------------
    sealed interface Shape permits Circle, Polygon, AbstractShape {}
    static final class Circle implements Shape {}
    non-sealed interface Polygon extends Shape {}
    static class Hexagon implements Polygon {}
    static abstract sealed class AbstractShape implements Shape permits Rectangle, Triangle {}
    static final class Rectangle extends AbstractShape {}
    static non-sealed class Triangle extends AbstractShape {}
    static class EquilateralTriangle extends Triangle {}
    sealed interface Expr {}
    record Num(int v) implements Expr {}
    record Add(Expr l, Expr r) implements Expr {}
    static int eval(Expr e) { return switch (e) { case Num n -> n.v(); case Add(Expr l, Expr r) -> eval(l) + eval(r); }; }

    static void sealed() {
        System.out.println("[sealed] Shape.isSealed=" + Shape.class.isSealed() + " permits=" + Arrays.stream(Shape.class.getPermittedSubclasses()).map(Class::getSimpleName).toList()
            + "; Expr permits inferred (same file): " + Arrays.stream(Expr.class.getPermittedSubclasses()).map(Class::getSimpleName).toList());
        System.out.println("[sealed] hierarchy from the notes compiles; EquilateralTriangle is a Shape: " + (new EquilateralTriangle() instanceof Shape) + ", Hexagon: " + (new Hexagon() instanceof Shape));
        System.out.println("[sealed] exhaustive switch over sealed records + record patterns, no default: eval(1 + (2 + 3)) = " + eval(new Add(new Num(1), new Add(new Num(2), new Num(3)))));
    }

    // ---------------- OPTIONAL (note Optional) ----------------
    static String expensive(String tag) { System.out.print("[computed " + tag + "] "); return "default"; }
    static class UserDTO implements Serializable { Optional<String> name = Optional.of("A"); }

    static void optional() throws Exception {
        try { Optional.of(null); } catch (NullPointerException e) { System.out.println("[opt] Optional.of(null) -> NullPointerException, message=" + e.getMessage()); }
        System.out.println("[opt] Optional.empty()==Optional.empty(): " + (Optional.empty() == Optional.empty()) + " (implementation detail; the API says don't rely on it)");
        try { Optional.empty().get(); } catch (NoSuchElementException e) { System.out.println("[opt] empty.get() -> NoSuchElementException: " + e.getMessage()); }
        System.out.print("[opt] orElse is EAGER even when a value is present: ");
        String r1 = Optional.of("Shrayansh").orElse(expensive("orElse"));
        System.out.println("-> " + r1);
        System.out.print("[opt] orElseGet is lazy: ");
        String r2 = Optional.of("Shrayansh").orElseGet(() -> expensive("orElseGet"));
        System.out.println("-> " + r2 + " (supplier not called)");
        System.out.println("[opt] map length: " + Optional.of("Shrayansh").map(String::length).get() + "; map to null -> " + Optional.of("x").map(v -> (String) null));
        Optional<Optional<Integer>> nested = Optional.of("Shrayansh").map(v -> Optional.of(v.length()));
        System.out.println("[opt] map returning Optional -> nested " + nested + "; flatMap -> " + Optional.of("Shrayansh").flatMap(v -> Optional.of(v.length())));
        System.out.println("[opt] filter(len>10)=" + Optional.of("Shrayansh").filter(v -> v.length() > 10).isPresent() + ", filter(len<=9)=" + Optional.of("Shrayansh").filter(v -> v.length() <= 9).isPresent());
        Optional.empty().ifPresentOrElse(v -> System.out.println("found"), () -> System.out.println("[opt] ifPresentOrElse on empty -> User not found"));
        System.out.println("[opt] or(): " + Optional.<String>empty().or(() -> Optional.of("from DB")).get());
        List<Optional<String>> emails = List.of(Optional.of("a@gmail.com"), Optional.empty(), Optional.of("b@gmail.com"));
        System.out.println("[opt] flatMap(Optional::stream): " + emails.stream().flatMap(Optional::stream).toList());
        System.out.println("[opt] equals by value: " + Optional.of("a").equals(Optional.of("a")) + "; OptionalInt avoids boxing: " + IntStream.of(3, 9).max());
        try (ObjectOutputStream out = new ObjectOutputStream(new ByteArrayOutputStream())) { out.writeObject(new UserDTO()); }
        catch (NotSerializableException e) { System.out.println("[opt] Optional field in a Serializable class -> NotSerializableException: " + e.getMessage()); }
        System.out.println("[opt] Optional is Serializable? " + Serializable.class.isAssignableFrom(Optional.class));
    }
}
