package track.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayOutputStream;
import java.io.NotSerializableException;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.PriorityQueue;
import java.util.SequencedCollection;
import java.util.SequencedMap;
import java.util.SequencedSet;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Gatherers;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/** Executable evidence for AUDIT.md batch 4 (notes 28, 40, 41, Optional). */
class Batch4StreamsCollectionsSealedOptionalTest {

    @Test
    void streamFacts_28_6_to_28_15() {
        IntStream original = Arrays.stream(new int[]{2, 1, 4, 7});
        original.filter(v -> v > 2);                                   // result discarded, as in the notes
        assertThatThrownBy(original::toArray)
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("stream has already been operated upon or closed");

        List<Integer> extremes = new ArrayList<>(List.of(Integer.MIN_VALUE, 1, Integer.MAX_VALUE));
        extremes.sort((a, b) -> a - b);                                // subtraction comparator overflows
        assertThat(extremes).containsExactly(1, Integer.MAX_VALUE, Integer.MIN_VALUE);
        extremes.sort(Comparator.naturalOrder());
        assertThat(extremes).containsExactly(Integer.MIN_VALUE, 1, Integer.MAX_VALUE);

        var peeked = new StringBuilder();
        long count = List.of(2, 1, 4, 7, 10).stream().peek(peeked::append).count();
        assertThat(count).isEqualTo(5);
        assertThat(peeked).isEmpty();                                  // Java 9+: count() may skip the pipeline

        var order = new StringBuilder();
        List.of(2, 1, 4, 7, 10).stream()
                .filter(v -> v >= 3).peek(v -> order.append('F').append(v).append(' '))
                .map(v -> -v).peek(v -> order.append('N').append(v).append(' '))
                .sorted().peek(v -> order.append('S').append(v).append(' '))
                .toList();
        assertThat(order.toString().trim()).isEqualTo("F4 N-4 F7 N-7 F10 N-10 S-10 S-7 S-4");

        assertThat(IntStream.rangeClosed(1, 100).reduce(0, (a, b) -> a - b)).isEqualTo(-5050);
        assertThat(Stream.<Integer>empty().allMatch(v -> v > 100)).isTrue();
        assertThatThrownBy(() -> Stream.of(1).toList().add(2)).isInstanceOf(UnsupportedOperationException.class);
        assertThat(Stream.of(1, 2, 3, 4, 5).gather(Gatherers.windowFixed(2)).toList())
                .containsExactly(List.of(1, 2), List.of(3, 4), List.of(5));
    }

    @Test
    void sequencedCollectionFacts_40_3_to_40_9() {
        List<String> list = new ArrayList<>(List.of("B", "C", "D"));
        list.reversed().addFirst("X");                                 // reversed() is a live view
        assertThat(list).containsExactly("B", "C", "D", "X");

        SequencedSet<String> set = new LinkedHashSet<>(List.of("B", "C", "D"));
        set.addFirst("A");
        set.addLast("Z");
        set.addFirst("C");                                             // re-adding repositions
        assertThat(set).containsExactly("C", "A", "B", "D", "Z");

        assertThatThrownBy(() -> new TreeSet<>(Set.of(14, 5, 7)).addFirst(2))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> new TreeMap<>(java.util.Map.of(1, "a")).putFirst(0, "z"))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> new ArrayList<String>().getFirst()).isInstanceOf(NoSuchElementException.class);

        SequencedMap<Integer, String> map = new LinkedHashMap<>();
        map.put(100, "B");
        map.putFirst(400, "A");
        assertThat(map.firstEntry().getKey()).isEqualTo(400);

        assertThat(new ArrayDeque<>()).isInstanceOf(SequencedCollection.class);
        assertThat(new PriorityQueue<>()).isNotInstanceOf(SequencedCollection.class);
        assertThat(new HashSet<>()).isNotInstanceOf(SequencedCollection.class);
    }

    sealed interface Expr permits Num, Add {}
    record Num(int v) implements Expr {}
    record Add(Expr l, Expr r) implements Expr {}

    static int eval(Expr e) {
        return switch (e) {                                            // exhaustive: no default needed
            case Num n -> n.v();
            case Add(Expr l, Expr r) -> eval(l) + eval(r);
        };
    }

    @Test
    void sealedFacts_41_2_to_41_7() {
        assertThat(Expr.class.isSealed()).isTrue();
        assertThat(Arrays.stream(Expr.class.getPermittedSubclasses()).map(Class::getSimpleName)).containsExactly("Num", "Add");
        assertThat(eval(new Add(new Num(1), new Add(new Num(2), new Num(3))))).isEqualTo(6);
    }

    static class UserDto implements Serializable {
        private static final long serialVersionUID = 1L;
        @SuppressWarnings("serial") Optional<String> name = Optional.of("A");
    }

    @Test
    void optionalFacts_O3_O5_O6_O8() {
        assertThatThrownBy(() -> Optional.of(null)).isInstanceOf(NullPointerException.class);
        var calls = new int[1];
        String value = Optional.of("Shrayansh").orElse(expensive(calls));
        assertThat(value).isEqualTo("Shrayansh");
        assertThat(calls[0]).as("orElse evaluates its argument eagerly").isEqualTo(1);
        Optional.of("Shrayansh").orElseGet(() -> expensive(calls));
        assertThat(calls[0]).as("orElseGet is lazy").isEqualTo(1);
        assertThat(Optional.of("x").map(v -> (String) null)).isEmpty();
        assertThat(Optional.of("Shrayansh").map(v -> Optional.of(v.length()))).contains(Optional.of(9));
        assertThat(Optional.of("Shrayansh").flatMap(v -> Optional.of(v.length()))).contains(9);
        assertThat(Serializable.class.isAssignableFrom(Optional.class)).isFalse();
        assertThatThrownBy(() -> new ObjectOutputStream(new ByteArrayOutputStream()).writeObject(new UserDto()))
                .isInstanceOf(NotSerializableException.class)
                .hasMessage("java.util.Optional");
    }

    private static String expensive(int[] calls) {
        calls[0]++;
        return "default";
    }
}
