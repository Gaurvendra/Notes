import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

public class Verify3 {
    public static void main(String[] args) throws Exception {
        System.out.println("java " + Runtime.version());
        operators();
        controlFlow();
        exceptions();
        reflection();
        annotations();
    }

    // ---------------- OPERATORS (note 20) ----------------
    static void operators() {
        int a = 4;
        a = a + a++ + ++a * --a + a--;
        System.out.println("[ops] a=4; a = a + a++ + ++a * --a + a--  ->  " + a + "   (notes: 39)");
        System.out.println("[ops] 5/2=" + (5 / 2) + ", -5/2=" + (-5 / 2) + ", -5%2=" + (-5 % 2) + ", 5%-2=" + (5 % -2) + ", Math.floorMod(-5,2)=" + Math.floorMod(-5, 2));
        System.out.println("[ops] 5.0/0=" + (5.0 / 0) + ", 0.0/0=" + (0.0 / 0) + ", 5.5%2=" + (5.5 % 2));
        try { System.out.println(5 / 0); } catch (ArithmeticException e) { System.out.println("[ops] 5/0 -> ArithmeticException: " + e.getMessage()); }
        System.out.println("[ops] 4&6=" + (4 & 6) + ", 4|6=" + (4 | 6) + ", 4^6=" + (4 ^ 6) + ", ~4=" + (~4) + ", ~-5=" + (~-5));
        System.out.println("[ops] 4<<1=" + (4 << 1) + ", 4<<2=" + (4 << 2) + ", 4>>1=" + (4 >> 1) + ", 4>>2=" + (4 >> 2));
        System.out.println("[ops] shift distance is masked: 1<<32=" + (1 << 32) + ", 1<<33=" + (1 << 33) + ", 1L<<64=" + (1L << 64));
        System.out.println("[ops] left shift overflows: 1<<31=" + (1 << 31) + ", 0x40000000<<1=" + (0x40000000 << 1));
        System.out.println("[ops] >> on negatives rounds toward -inf: -5>>1=" + (-5 >> 1) + " vs -5/2=" + (-5 / 2));
        System.out.println("[ops] -8>>>1=" + (-8 >>> 1) + " (int), -8>>>28=" + (-8 >>> 28));
        byte b = (byte) 0b11000110;
        System.out.println("[ops] byte 11000110 >>> 1 = " + (b >>> 1) + " = 0x" + Integer.toHexString(b >>> 1) + " (promoted to int first, NOT 01100011=99); (b & 0xFF)>>>1 = " + ((b & 0xFF) >>> 1));
        int x = 0;
        boolean r1 = (x != 0) && (10 / x > 1);
        boolean r2 = (x == 0) || (10 / x > 1);
        System.out.println("[ops] short-circuit: (x!=0)&&(10/x>1)=" + r1 + ", (x==0)||(10/x>1)=" + r2 + " (no ArithmeticException)");
        try { boolean r3 = (x != 0) & (10 / x > 1); System.out.println(r3); } catch (ArithmeticException e) { System.out.println("[ops] non-short-circuit & evaluates both sides -> ArithmeticException"); }
        System.out.println("[ops] boolean ^: true^true=" + (true ^ true) + ", true^false=" + (true ^ false));
        byte bb = 10; bb += 300; // implicit cast
        System.out.println("[ops] byte bb=10; bb += 300 -> " + bb + " (compound assignment casts implicitly)");
        int i = 5; i = i++;
        System.out.println("[ops] i=5; i = i++ -> " + i);
        Object o = true ? 1 : "s";
        Object tern = true ? 1 : 'a';
        System.out.println("[ops] ternary: true ? 1 : 'a' -> type " + tern.getClass().getSimpleName() + " with code " + (int) (Character) tern + " (prints an invisible char!), true ? Integer.valueOf(1) : Double.valueOf(2) -> " + (true ? Integer.valueOf(1) : Double.valueOf(2)) + ", Object o = true?1:\"s\" -> " + o.getClass().getSimpleName());
        try { Integer n = null; int v = true ? n : 0; System.out.println(v); } catch (NullPointerException e) { System.out.println("[ops] ternary unboxing: flag ? (Integer)null : 0 -> NullPointerException"); }
        Object nothing = null;
        System.out.println("[ops] null instanceof Object = " + (nothing instanceof Object));
        Object s = "hello";
        if (s instanceof String str && str.length() > 3) System.out.println("[ops] pattern matching instanceof (Java 16): " + str.toUpperCase());
        System.out.println("[ops] string concat is left-to-right: 1+2+\"3\"=" + (1 + 2 + "3") + ", \"1\"+2+3=" + ("1" + 2 + 3));
    }

    // ---------------- CONTROL FLOW (note 21) ----------------
    enum Day { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }
    sealed interface Shape permits Circle, Square {}
    record Circle(double r) implements Shape {}
    record Square(double side) implements Shape {}

    static void controlFlow() {
        int a = 1, b = 9;
        StringBuilder out = new StringBuilder();
        switch (a + b) {
            case 1: out.append("a+b is 1|"); break;
            default: out.append(a + b).append("|");
            case 2: out.append("a+b is 2|"); break;
            case 3: out.append("a+b is 3|");
            case 4: out.append("a+b is 4|");
        }
        System.out.println("[flow] default-in-middle fall-through (sum=10): " + out);
        String q = switch ("March") { case "January", "February", "March" -> "Q1"; default -> "other"; };
        System.out.println("[flow] string switch with comma labels -> " + q);
        String yieldColon = switch (1) { case 1: yield "One (yield with colon label)"; default: yield "None"; };
        System.out.println("[flow] " + yieldColon);
        Day d = Day.FRIDAY;
        int weekend = switch (d) { case SATURDAY, SUNDAY -> 1; case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> 0; }; // exhaustive enum, no default
        System.out.println("[flow] exhaustive enum switch expression without default -> " + weekend);
        Shape sh = new Square(2);
        double area = switch (sh) { case Circle c -> Math.PI * c.r() * c.r(); case Square s -> s.side() * s.side(); }; // Java 21
        System.out.println("[flow] pattern switch over sealed type (Java 21) -> area=" + area);
        Object obj = null;
        String desc = switch (obj) { case null -> "null handled by case null"; case String s -> "String"; default -> "other"; };
        System.out.println("[flow] " + desc);
        try { String str = null; switch (str) { case "x": break; default: break; } } catch (NullPointerException e) { System.out.println("[flow] classic switch on null String -> NullPointerException"); }
        arrowStatement();
        System.out.println("[flow] return inside a switch STATEMENT works: " + returnsFromSwitchStatement(2));
        StringBuilder lab = new StringBuilder();
        outer:
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == 2) continue outer;
                if (i == 3) break outer;
                lab.append(i).append(",").append(j).append(" ");
            }
        }
        System.out.println("[flow] labeled continue/break -> " + lab.toString().trim());
        int k = 10;
        do { k++; } while (k < 5);
        System.out.println("[flow] do-while runs at least once: k=" + k);
        int[] arr = {1, 2, 3};
        for (int v : arr) { v = v * 10; }
        System.out.println("[flow] for-each variable is a copy: arr=" + Arrays.toString(arr));
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
        try { for (Integer v : list) { if (v == 2) list.remove(v); } System.out.println("[flow] quirk: removing the 2nd-to-last element in for-each throws NO CME (loop just ends early): list=" + list); }
        catch (ConcurrentModificationException e) { System.out.println("[flow] removing inside for-each -> ConcurrentModificationException"); }
        List<Integer> list2 = new ArrayList<>(List.of(1, 2, 3, 4));
        try { for (Integer v : list2) { if (v == 2) list2.remove(v); } } catch (ConcurrentModificationException e) { System.out.println("[flow] (list of 4) removing inside for-each -> ConcurrentModificationException; use removeIf/iterator.remove"); }
    }
    static void arrowStatement() {
        switch (2) { case 1 -> System.out.println("one"); case 2 -> System.out.println("[flow] arrow labels in a switch STATEMENT: no fall-through"); default -> System.out.println("default (not reached)"); }
    }
    static String returnsFromSwitchStatement(int v) {
        switch (v) { case 1: return "one"; case 2: return "two"; default: return "other"; }
    }

    // ---------------- EXCEPTIONS (note 19) ----------------
    static class Res implements AutoCloseable {
        final String name; Res(String n) { name = n; System.out.println("[exc] open " + n); }
        public void close() throws Exception { System.out.println("[exc] close " + name); throw new IllegalStateException("close failed: " + name); }
    }
    @SuppressWarnings("finally")
    static int finallyOverridesReturn() { try { return 1; } finally { return 2; } }
    @SuppressWarnings("finally")
    static int finallySwallows() { try { throw new RuntimeException("lost"); } finally { return 42; } }
    static int finallyDoesNotChangeReturnedValue() { int x = 1; try { return x; } finally { x = 99; } }

    static void exceptions() {
        int big = 900000000 * 900000000 * 900000000;
        System.out.println("[exc] notes' OOM example: 900000000*900000000*900000000 as int = " + big + " (int overflow!)");
        try { String[] arr = new String[big]; System.out.println(arr.length); }
        catch (OutOfMemoryError e) { System.out.println("[exc] new String[" + big + "] -> OutOfMemoryError: " + e.getMessage()); }
        catch (NegativeArraySizeException e) { System.out.println("[exc] new String[" + big + "] -> NegativeArraySizeException: " + e.getMessage()); }
        try { Object val = 0; System.out.println((String) val); } catch (ClassCastException e) { System.out.println("[exc] CCE message: " + e.getMessage()); }
        try { int[] val = new int[2]; System.out.println(val[3]); } catch (ArrayIndexOutOfBoundsException e) { System.out.println("[exc] AIOOBE message: " + e.getMessage()); }
        try { System.out.println("hello".charAt(5)); } catch (StringIndexOutOfBoundsException e) { System.out.println("[exc] SIOOBE message: " + e.getMessage()); }
        try { String val = null; System.out.println(val.charAt(0)); } catch (NullPointerException e) { System.out.println("[exc] helpful NPE message: " + e.getMessage()); }
        try { Integer.parseInt("abc"); } catch (NumberFormatException e) { System.out.println("[exc] NFE message: " + e.getMessage() + " ; NFE is an IllegalArgumentException: " + (e instanceof IllegalArgumentException)); }
        System.out.println("[exc] Error is unchecked & not an Exception: " + !Exception.class.isAssignableFrom(Error.class) + "; InterruptedException checked: " + !RuntimeException.class.isAssignableFrom(InterruptedException.class));
        try {
            try { throw new OutOfMemoryError("simulated OOM"); }
            finally { System.out.println("[exc] finally DOES run while an OutOfMemoryError propagates"); }
        } catch (OutOfMemoryError e) { System.out.println("[exc] caught " + e.getMessage()); }
        System.out.println("[exc] try{return 1} finally{return 2} -> " + finallyOverridesReturn());
        System.out.println("[exc] exception swallowed by return in finally -> " + finallySwallows());
        System.out.println("[exc] finally changing local after 'return x' -> returns " + finallyDoesNotChangeReturnedValue());
        try (Res r1 = new Res("A"); Res r2 = new Res("B")) {
            throw new RuntimeException("body failed");
        } catch (Exception e) {
            System.out.println("[exc] try-with-resources: primary=" + e.getMessage() + ", suppressed=" + Arrays.stream(e.getSuppressed()).map(Throwable::getMessage).toList() + " (closed in reverse order)");
        }
        try { try { Integer.parseInt("x"); } catch (NumberFormatException e) { throw new IllegalStateException("config invalid", e); } }
        catch (IllegalStateException e) { System.out.println("[exc] chaining keeps the cause: " + e.getCause().getClass().getSimpleName()); }
        try { throw null; } catch (NullPointerException e) { System.out.println("[exc] throw null -> NullPointerException"); }
        long t0 = System.nanoTime(); for (int i = 0; i < 100_000; i++) { try { throw new RuntimeException(); } catch (RuntimeException e) { } } long withTrace = System.nanoTime() - t0;
        RuntimeException cheap = new RuntimeException("x", null, false, false) {};
        long t1 = System.nanoTime(); for (int i = 0; i < 100_000; i++) { try { throw new RuntimeException("x", null, false, false) {}; } catch (RuntimeException e) { } } long noTrace = System.nanoTime() - t1;
        System.out.println("[exc] cost is mostly creating the stack trace: 100k throws with trace ~" + withTrace / 1_000_000 + " ms, without (writableStackTrace=false) ~" + noTrace / 1_000_000 + " ms (indicative only)");
        Thread t = new Thread(() -> { throw new IllegalStateException("worker died"); });
        t.setUncaughtExceptionHandler((th, ex) -> System.out.println("[exc] uncaught in thread '" + th.getName() + "': " + ex.getMessage() + " -> only that thread dies; main continues"));
        t.setName("worker"); t.start();
        try { t.join(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    // ---------------- REFLECTION (note 17) ----------------
    static class Init { static { System.out.println("[refl] Init static initializer ran"); } }
    public static class Eagle {
        public String breed; private boolean canSwim;
        private static final String KIND = "bird";
        public Eagle() {}
        public void fly() { System.out.println("fly"); }
        private void eat() { System.out.println("eat"); }
    }
    record Point(int x, int y) {}
    static class Singleton { static final Singleton INSTANCE = new Singleton(); private Singleton() {} }

    static void reflection() throws Exception {
        System.out.println("[refl] Init.class (no init yet): " + Init.class.getSimpleName());
        Class.forName("Verify3$Init");
        System.out.println("[refl] ^ Class.forName initialised the class; '.class' did not");
        try { Class.forName("Eagle"); } catch (ClassNotFoundException e) { System.out.println("[refl] Class.forName(\"Eagle\") needs the binary name -> ClassNotFoundException; works with \"" + Eagle.class.getName() + "\""); }
        System.out.println("[refl] same Class object for all 3 ways: " + (Eagle.class == new Eagle().getClass() && Eagle.class == Class.forName(Eagle.class.getName())));
        System.out.println("[refl] int.class=" + int.class + ", void.class=" + void.class + ", int[].class=" + int[].class.getName());
        Method[] pub = Eagle.class.getMethods();
        Method[] decl = Eagle.class.getDeclaredMethods();
        System.out.println("[refl] getMethods() count=" + pub.length + " (fly + 9 public methods inherited from Object), getDeclaredMethods()=" + Arrays.stream(decl).map(Method::getName).sorted().toList() + " (no inherited)");
        System.out.println("[refl] getFields()=" + Arrays.stream(Eagle.class.getFields()).map(Field::getName).toList() + ", getDeclaredFields()=" + Arrays.stream(Eagle.class.getDeclaredFields()).map(Field::getName).toList());
        Eagle e = new Eagle();
        Field canSwim = Eagle.class.getDeclaredField("canSwim");
        try { canSwim.set(e, true); } catch (IllegalAccessException ex) { System.out.println("[refl] set private without setAccessible -> IllegalAccessException: " + ex.getMessage()); }
        canSwim.setAccessible(true); canSwim.set(e, true);
        System.out.println("[refl] after setAccessible(true): canSwim=" + canSwim.getBoolean(e));
        Field kind = Eagle.class.getDeclaredField("KIND"); kind.setAccessible(true);
        try { kind.set(null, "fish"); } catch (IllegalAccessException ex) { System.out.println("[refl] static final field cannot be set even with setAccessible: " + ex.getMessage()); }
        Field px = Point.class.getDeclaredField("x"); px.setAccessible(true);
        try { px.set(new Point(1, 2), 5); } catch (IllegalAccessException ex) { System.out.println("[refl] record field cannot be set: " + ex.getMessage()); }
        try { Field value = String.class.getDeclaredField("value"); value.setAccessible(true); System.out.println("[refl] JDK internals accessible?!"); }
        catch (InaccessibleObjectException ex) { System.out.println("[refl] strong encapsulation (JDK 17+): String.value -> InaccessibleObjectException"); }
        Method privateEat = Eagle.class.getDeclaredMethod("eat"); privateEat.setAccessible(true);
        System.out.print("[refl] invoking private method: "); privateEat.invoke(e);
        Method thrower = Verify3.class.getDeclaredMethod("boom");
        try { thrower.invoke(null); } catch (InvocationTargetException ex) { System.out.println("[refl] exception inside invoked method is wrapped: InvocationTargetException, cause=" + ex.getCause()); }
        Constructor<Singleton> c = Singleton.class.getDeclaredConstructor(); c.setAccessible(true);
        System.out.println("[refl] private constructor bypassed -> second singleton instance: " + (c.newInstance() != Singleton.INSTANCE));
        @SuppressWarnings("deprecation") Object viaOld = Eagle.class.newInstance();
        Object viaNew = Eagle.class.getDeclaredConstructor().newInstance();
        System.out.println("[refl] Class.newInstance() is deprecated (since 9); use getDeclaredConstructor().newInstance(): " + (viaOld != null && viaNew != null)
            + "; Class.newInstance @Deprecated: " + Class.class.getMethod("newInstance").isAnnotationPresent(Deprecated.class));
        Runnable proxy = (Runnable) Proxy.newProxyInstance(Verify3.class.getClassLoader(), new Class<?>[]{Runnable.class},
            (p, m, a) -> { System.out.println("[refl] dynamic proxy intercepted " + m.getName() + "()"); return null; });
        proxy.run();
        System.out.println("[refl] record components: " + Arrays.stream(Point.class.getRecordComponents()).map(RecordComponent::getName).toList() + ", sealed permits: " + Arrays.stream(Shape.class.getPermittedSubclasses()).map(Class::getSimpleName).toList());
    }
    static void boom() { throw new IllegalStateException("boom"); }

    // ---------------- ANNOTATIONS (note 18) ----------------
    @interface NoRetention {}
    @Retention(RetentionPolicy.RUNTIME) @interface RuntimeAnno {}
    @Inherited @Retention(RetentionPolicy.RUNTIME) @interface Inh {}
    @Retention(RetentionPolicy.RUNTIME) @interface NotInh {}
    @Inh @NotInh @NoRetention @RuntimeAnno static class Parent {}
    static class Child extends Parent {}
    @Inh interface MarkedIface {}
    static class ImplementsMarked implements MarkedIface {}
    @Repeatable(Categories.class) @Retention(RetentionPolicy.RUNTIME) @interface Category { String name(); }
    @Retention(RetentionPolicy.RUNTIME) @interface Categories { Category[] value(); }
    @Category(name = "Bird") @Category(name = "LivingThing") @Category(name = "carnivorous") static class Hawk {}

    @SafeVarargs
    static void printLogValues(List<Integer>... logNumbersList) {
        Object[] objectList = logNumbersList;
        List<String> stringValuesList = new ArrayList<>();
        stringValuesList.add("Hello");
        objectList[0] = stringValuesList;           // heap pollution (the @SafeVarargs promise is broken!)
        try { Integer first = logNumbersList[0].get(0); System.out.println(first); }
        catch (ClassCastException e) { System.out.println("[anno] heap pollution surfaces later as ClassCastException: " + e.getMessage().split(" \\(")[0]); }
    }

    static void annotations() {
        System.out.println("[anno] default retention is CLASS -> not visible at runtime: " + Parent.class.getAnnotation(NoRetention.class) + "; RUNTIME -> " + (Parent.class.getAnnotation(RuntimeAnno.class) != null));
        System.out.println("[anno] @Inherited from superclass: " + (Child.class.getAnnotation(Inh.class) != null) + "; without @Inherited: " + Child.class.getAnnotation(NotInh.class)
            + "; @Inherited is NOT inherited from interfaces: " + ImplementsMarked.class.getAnnotation(Inh.class));
        System.out.println("[anno] @Repeatable: " + Arrays.stream(Hawk.class.getAnnotationsByType(Category.class)).map(Category::name).toList() + "; stored as container: " + (Hawk.class.getAnnotation(Categories.class) != null));
        for (Class<? extends Annotation> a : List.of(Override.class, SuppressWarnings.class, Deprecated.class, FunctionalInterface.class, SafeVarargs.class)) {
            Retention r = a.getAnnotation(Retention.class); Target t = a.getAnnotation(Target.class);
            System.out.println("[anno] @" + a.getSimpleName() + " retention=" + (r == null ? "CLASS(default)" : r.value()) + " target=" + (t == null ? "any" : Arrays.toString(t.value())));
        }
        printLogValues(new ArrayList<>(List.of(1)));
    }
}
