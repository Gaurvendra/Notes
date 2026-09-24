package track.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.lang.ref.SoftReference;
import java.lang.ref.WeakReference;
import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;

/** Executable evidence for AUDIT.md batch 2 (notes 09, 12-13, 14-15, 16). */
class Batch2ClassesInterfacesLambdasTest {

    enum Day { MONDAY(101), TUESDAY(102); final int value; Day(int v) { value = v; } }

    enum Op {
        PLUS { int apply(int a, int b) { return a + b; } },
        MINUS { int apply(int a, int b) { return a - b; } };
        abstract int apply(int a, int b);
    }

    @Test
    void enumOrdinalIsPosition_12_5_to_12_11() {
        assertThat(Day.MONDAY.ordinal()).isZero();
        assertThat(Day.TUESDAY.ordinal()).isEqualTo(1);
        assertThatThrownBy(() -> Day.valueOf("monday")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> Day.valueOf(null)).isInstanceOf(NullPointerException.class);
        assertThat(Day.values()).isNotSameAs(Day.values());           // fresh clone per call
        assertThat(Modifier.isFinal(Day.class.getModifiers())).isTrue();
        assertThat(Op.class.isSealed()).isTrue();                     // constant bodies → sealed, not final
        assertThat(Op.PLUS.getClass()).isNotEqualTo(Op.class);
        assertThat(Op.PLUS.getDeclaringClass()).isEqualTo(Op.class);
    }

    @Test
    void weakReferenceVariableIsNotNulled_9_16() throws InterruptedException {
        WeakReference<Object> weak = new WeakReference<>(new Object());
        SoftReference<Object> soft = new SoftReference<>(new Object());
        for (int i = 0; i < 20 && weak.get() != null; i++) {
            System.gc();
            Thread.sleep(20);
        }
        assumeTrue(weak.get() == null, "GC did not run; System.gc() is only a request");
        assertThat(weak).isNotNull();                                 // the variable still points to the wrapper
        assertThat(soft.get()).isNotNull();                           // plenty of heap → soft ref survives
    }

    static final class NotesImmutable {
        private final List<Object> pets;
        NotesImmutable(List<Object> pets) { this.pets = pets; }
        List<Object> getPets() { return new ArrayList<>(pets); }
    }

    record FixedImmutable(List<Object> pets) {
        FixedImmutable { pets = List.copyOf(pets); }
    }

    @Test
    void immutableClassNeedsDefensiveCopyInConstructor_12_28() {
        List<Object> pets = new ArrayList<>(List.of("sj", "pj"));
        var notes = new NotesImmutable(pets);
        var fixed = new FixedImmutable(pets);
        pets.add("mutated");
        assertThat(notes.getPets()).contains("mutated");              // not immutable
        assertThat(fixed.pets()).containsExactly("sj", "pj");
        assertThatThrownBy(() -> fixed.pets().add("x")).isInstanceOf(UnsupportedOperationException.class);
    }

    static class Eager {
        static int constructed;
        static final Eager INSTANCE = new Eager();
        private Eager() { constructed++; }
    }

    enum EnumSingleton { INSTANCE }

    @Test
    void singletonsAndReflection_12_18_12_25_12_26() throws Exception {
        Eager first = Eager.INSTANCE;
        Constructor<Eager> c = Eager.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertThat(c.newInstance()).isNotSameAs(first);               // reflection breaks a classic singleton
        Constructor<EnumSingleton> ec = EnumSingleton.class.getDeclaredConstructor(String.class, int.class);
        ec.setAccessible(true);
        assertThatThrownBy(() -> ec.newInstance("X", 1))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cannot reflectively create enum objects");
    }

    interface Bird { int MAX_HEIGHT = 2000; default boolean canBreathe() { return true; } }
    interface WaterAnimal { default boolean canBreathe() { return false; } }
    static class Crocodile implements Bird, WaterAnimal {
        public boolean canBreathe() { return Bird.super.canBreathe() && !WaterAnimal.super.canBreathe(); }
    }
    interface Parent { String m(); }
    interface Child extends Parent { default String m() { return "from default"; } }

    @Test
    void interfaceRules_14_9_14_13_14_15() throws Exception {
        int mods = Bird.class.getDeclaredField("MAX_HEIGHT").getModifiers();
        assertThat(Modifier.isPublic(mods) && Modifier.isStatic(mods) && Modifier.isFinal(mods)).isTrue();
        assertThat(new Crocodile().canBreathe()).isTrue();
        assertThat(new Child() {}.m()).isEqualTo("from default");      // sub-interface implements parent's method
    }

    @Test
    void lambdaThisAndHiddenClass_16_4() {
        Supplier<Object> lambdaThis = () -> this;
        assertThat(lambdaThis.get()).isSameAs(this);
        Supplier<Object> anonThis = new Supplier<>() { public Object get() { return this; } };
        assertThat(anonThis.get()).isNotSameAs(this);
        assertThat(lambdaThis.getClass().isHidden()).isTrue();
    }
}
