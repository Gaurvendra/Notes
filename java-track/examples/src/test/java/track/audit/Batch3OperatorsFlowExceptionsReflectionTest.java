package track.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.annotation.Inherited;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.reflect.Field;
import java.lang.reflect.InaccessibleObjectException;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.ConcurrentModificationException;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Executable evidence for AUDIT.md batch 3 (notes 17, 18, 19, 20, 21). */
class Batch3OperatorsFlowExceptionsReflectionTest {

    @Test
    @SuppressWarnings("all")
    void operatorFacts_20_3_to_20_16() {
        int a = 4;
        a = a + a++ + ++a * --a + a--;
        assertThat(a).isEqualTo(43);                                   // notes: 39
        assertThat(-5 / 2).isEqualTo(-2);
        assertThat(-5 % 2).isEqualTo(-1);
        assertThat(Math.floorMod(-5, 2)).isEqualTo(1);
        assertThat(~4).isEqualTo(-5);
        assertThat(1 << 32).isEqualTo(1);                              // shift distance masked to 5 bits
        assertThat(1L << 64).isEqualTo(1L);
        assertThat(-5 >> 1).isEqualTo(-3);                             // rounds toward -infinity
        byte b = (byte) 0b11000110;
        assertThat(b >>> 1).isEqualTo(0x7fffffe3);                     // promoted to int first
        assertThat((b & 0xFF) >>> 1).isEqualTo(99);
        byte bb = 10;
        bb += 300;                                                     // hidden narrowing cast
        assertThat(bb).isEqualTo((byte) 54);
        int i = 5;
        i = i++;
        assertThat(i).isEqualTo(5);
        Object ternary = true ? 1 : 'a';
        assertThat(ternary).isInstanceOf(Character.class);
        Object mixed = true ? Integer.valueOf(1) : Double.valueOf(2);
        assertThat(mixed).isEqualTo(1.0);
        Object nothing = null;
        assertThat(nothing instanceof Object).isFalse();
    }

    sealed interface Shape permits Circle, Square {}
    record Circle(double r) implements Shape {}
    record Square(double side) implements Shape {}

    @Test
    void switchFacts_21_4_21_9_21_11() {
        int sum = 10;
        var out = new StringBuilder();
        switch (sum) {
            case 1: out.append("1|"); break;
            default: out.append(sum).append('|');
            case 2: out.append("2|"); break;
            case 3: out.append("3|");
        }
        assertThat(out).hasToString("10|2|");                          // default in the middle falls through
        String viaYield = switch (1) { case 1: yield "One"; default: yield "None"; };
        assertThat(viaYield).isEqualTo("One");
        Shape s = new Square(2);
        double area = switch (s) { case Circle c -> Math.PI * c.r() * c.r(); case Square q -> q.side() * q.side(); };
        assertThat(area).isEqualTo(4.0);
        Object none = null;
        assertThat(switch (none) { case null -> "null"; default -> "other"; }).isEqualTo("null");
    }

    @Test
    void forEachRemovalQuirks_21_12() {
        List<Integer> three = new ArrayList<>(List.of(1, 2, 3));
        for (Integer v : three) { if (v == 2) three.remove(v); }       // 2nd-to-last: loop just ends, no CME
        assertThat(three).containsExactly(1, 3);
        List<Integer> four = new ArrayList<>(List.of(1, 2, 3, 4));
        assertThatThrownBy(() -> { for (Integer v : four) { if (v == 2) four.remove(v); } })
                .isInstanceOf(ConcurrentModificationException.class);
    }

    @SuppressWarnings("finally")
    private static int finallyReturns() { try { return 1; } finally { return 2; } }

    static class Res implements AutoCloseable {
        private final String name;
        Res(String name) { this.name = name; }
        @Override public void close() { throw new IllegalStateException("close " + name); }
    }

    @Test
    void exceptionFacts_19_5_19_7_19_13_19_14_19_20() {
        assertThat(900000000 * 900000000 * 900000000).isEqualTo(2030043136);   // the notes' OOM example overflows
        var finallyRan = new boolean[1];
        assertThatThrownBy(() -> { try { throw new OutOfMemoryError("simulated"); } finally { finallyRan[0] = true; } })
                .isInstanceOf(OutOfMemoryError.class);
        assertThat(finallyRan[0]).isTrue();                            // finally runs on OOM
        assertThat(finallyReturns()).isEqualTo(2);
        int[] two = new int[2];
        assertThatThrownBy(() -> two[3] = 1).hasMessage("Index 3 out of bounds for length 2");
        Throwable caught = null;
        try (Res r1 = new Res("A"); Res r2 = new Res("B")) {
            throw new RuntimeException("body");
        } catch (RuntimeException e) {
            caught = e;
        }
        assertThat(caught).hasMessage("body");
        assertThat(Arrays.stream(caught.getSuppressed()).map(Throwable::getMessage)).containsExactly("close B", "close A");
    }

    /** Set by Init's static initialiser. Kept outside Init: reading a field of Init would itself initialise Init. */
    static boolean initRan;

    static class Init { static { initRan = true; } }

    public static class Eagle {
        public String breed;
        private boolean canSwim;
        private static final String KIND = "bird";
        public void fly() { }
        private String eat() { return "eat"; }
        void boom() { throw new IllegalStateException("boom"); }
    }

    record Point(int x, int y) {}

    @Test
    void reflectionFacts_17_3_to_17_9() throws Exception {
        assertThat(Init.class.getSimpleName()).isEqualTo("Init");
        assertThat(initRan).as(".class does not initialise").isFalse();
        Class.forName(Init.class.getName());
        assertThat(initRan).as("forName initialises").isTrue();
        assertThatThrownBy(() -> Class.forName("Eagle")).isInstanceOf(ClassNotFoundException.class);
        assertThat(Eagle.class.getMethods()).hasSize(10);             // fly + 9 public methods of Object
        assertThat(Arrays.stream(Eagle.class.getDeclaredMethods()).map(m -> m.getName()).sorted())
                .containsExactly("boom", "eat", "fly");

        Field canSwim = Eagle.class.getDeclaredField("canSwim");
        var eagle = new Eagle();
        canSwim.setAccessible(true);
        canSwim.set(eagle, true);
        assertThat(canSwim.getBoolean(eagle)).isTrue();

        Field kind = Eagle.class.getDeclaredField("KIND");
        kind.setAccessible(true);
        assertThatThrownBy(() -> kind.set(null, "fish")).isInstanceOf(IllegalAccessException.class);
        Field x = Point.class.getDeclaredField("x");
        x.setAccessible(true);
        assertThatThrownBy(() -> x.set(new Point(1, 2), 5)).isInstanceOf(IllegalAccessException.class);
        assertThatThrownBy(() -> String.class.getDeclaredField("value").setAccessible(true))
                .isInstanceOf(InaccessibleObjectException.class);
        var boom = Eagle.class.getDeclaredMethod("boom");
        assertThatThrownBy(() -> boom.invoke(eagle))
                .isInstanceOf(InvocationTargetException.class)
                .cause().hasMessage("boom");
        assertThat(Class.class.getMethod("newInstance").isAnnotationPresent(Deprecated.class)).isTrue();
    }

    @interface NoRetention {}
    @Retention(RetentionPolicy.RUNTIME) @interface RuntimeAnno {}
    @Inherited @Retention(RetentionPolicy.RUNTIME) @interface Inh {}
    @Inh @NoRetention @RuntimeAnno static class ParentClass {}
    static class ChildClass extends ParentClass {}
    @Inh interface MarkedInterface {}
    static class Implementer implements MarkedInterface {}
    @Repeatable(Categories.class) @Retention(RetentionPolicy.RUNTIME) @interface Category { String name(); }
    @Retention(RetentionPolicy.RUNTIME) @interface Categories { Category[] value(); }
    @Category(name = "Bird") @Category(name = "LivingThing") static class Hawk {}

    @Test
    void annotationFacts_18_6_18_11_18_13_18_14() {
        assertThat(ParentClass.class.getAnnotation(NoRetention.class)).isNull();   // default retention = CLASS
        assertThat(ParentClass.class.getAnnotation(RuntimeAnno.class)).isNotNull();
        assertThat(ChildClass.class.getAnnotation(Inh.class)).isNotNull();
        assertThat(Implementer.class.getAnnotation(Inh.class)).isNull();           // not from interfaces
        assertThat(Arrays.stream(Hawk.class.getAnnotationsByType(Category.class)).map(Category::name))
                .containsExactly("Bird", "LivingThing");
        assertThat(Hawk.class.getAnnotation(Category.class)).isNull();             // stored inside the container
        assertThat(SuppressWarnings.class.getAnnotation(java.lang.annotation.Target.class)).isNull();
        assertThat(Override.class.getAnnotation(Retention.class).value()).isEqualTo(RetentionPolicy.SOURCE);
    }
}
