import java.lang.management.ManagementFactory;
import java.lang.ref.SoftReference;
import java.lang.ref.WeakReference;
import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;

public class Verify2 {
    public static void main(String[] args) throws Exception {
        System.out.println("java " + Runtime.version() + ", GCs = " + ManagementFactory.getGarbageCollectorMXBeans().stream().map(b -> b.getName()).toList());
        // --- ENUM ---
        System.out.println("[enum] MONDAY(101) ordinal = " + Day.MONDAY.ordinal() + ", value = " + Day.MONDAY.value);
        try { Day.valueOf("monday"); } catch (IllegalArgumentException e) { System.out.println("[enum] valueOf(\"monday\") -> IllegalArgumentException"); }
        try { Day.valueOf(null); } catch (NullPointerException e) { System.out.println("[enum] valueOf(null) -> NullPointerException"); }
        System.out.println("[enum] values() returns a fresh array each call: " + (Day.values() != Day.values()));
        System.out.println("[enum] plain enum class is final: " + Modifier.isFinal(Day.class.getModifiers())
            + "; enum with constant body is final: " + Modifier.isFinal(Op.class.getModifiers())
            + ", sealed: " + Op.class.isSealed()
            + "; PLUS.getClass()==Op.class: " + (Op.PLUS.getClass() == Op.class) + ", getDeclaringClass()==Op.class: " + (Op.PLUS.getDeclaringClass() == Op.class));
        Mutable.A.setComment("changed by someone else");
        System.out.println("[enum] mutable enum state is global: Mutable.A.comment = " + Mutable.A.comment);
        // --- REFERENCES ---
        WeakReference<Object> weak = new WeakReference<>(new Object());
        SoftReference<Object> soft = new SoftReference<>(new Object());
        for (int i = 0; i < 5 && weak.get() != null; i++) { System.gc(); Thread.sleep(50); }
        System.out.println("[ref] after GC: weak.get() = " + weak.get() + ", but the variable 'weak' itself is null? " + (weak == null)
            + "; soft.get() still present (plenty of heap) = " + (soft.get() != null));
        // --- IMMUTABLE CLASS (as in notes) ---
        List<Object> pets = new ArrayList<>(List.of("sj", "pj"));
        NotesImmutable n = new NotesImmutable("myName", pets);
        n.getPetNameList().add("hello");
        System.out.println("[immutable] notes version after adding to returned copy: " + n.getPetNameList());
        pets.add("MUTATED-FROM-OUTSIDE");
        System.out.println("[immutable] notes version after caller mutates its own list: " + n.getPetNameList() + "  <-- not immutable!");
        FixedImmutable f = new FixedImmutable("myName", pets);
        pets.add("again");
        System.out.println("[immutable] fixed version (List.copyOf in constructor): " + f.pets());
        try { f.pets().add("x"); } catch (UnsupportedOperationException e) { System.out.println("[immutable] fixed version rejects add() with UnsupportedOperationException"); }
        // --- SINGLETON ---
        System.out.println("[singleton] main started (EagerSingleton not yet initialised)");
        EagerSingleton.hello();
        System.out.println("[singleton] now calling getInstance()");
        EagerSingleton s1 = EagerSingleton.getInstance();
        Constructor<EagerSingleton> c = EagerSingleton.class.getDeclaredConstructor();
        c.setAccessible(true);
        EagerSingleton s2 = c.newInstance();
        System.out.println("[singleton] reflection breaks classic singleton: two instances? " + (s1 != s2));
        try {
            Constructor<EnumSingleton> ec = EnumSingleton.class.getDeclaredConstructor(String.class, int.class);
            ec.setAccessible(true);
            ec.newInstance("X", 1);
        } catch (IllegalArgumentException e) { System.out.println("[singleton] enum singleton resists reflection: " + e.getMessage()); }
        HolderSingleton.otherStatic();
        System.out.println("[singleton] holder idiom: outer class used, instance created yet? " + HolderSingleton.created);
        HolderSingleton.getInstance();
        System.out.println("[singleton] after getInstance(): created = " + HolderSingleton.created);
        // --- INTERFACES ---
        for (var fld : Bird.class.getDeclaredFields()) System.out.println("[interface] field " + fld.getName() + " modifiers = " + Modifier.toString(fld.getModifiers()));
        System.out.println("[interface] diamond resolved via Bird.super: " + new Crocodile().canBreathe());
        System.out.println("[interface] default method can implement a super-interface's abstract method: " + new Child() .m());
        // --- LAMBDA ---
        new Verify2().lambdaVsAnonymous();
        Supplier<String> s = () -> "x";
        System.out.println("[lambda] lambda class is hidden: " + s.getClass().isHidden() + ", name like " + s.getClass().getName().replaceAll("0x[0-9a-f]+", "0x..."));
        EqualsFi e = o -> true;
        System.out.println("[lambda] FI that also redeclares equals(Object)/toString() is still functional: " + e.test("a"));
    }

    void lambdaVsAnonymous() {
        Runnable lambda = () -> System.out.println("[lambda] 'this' inside lambda is the enclosing object: " + (this.getClass() == Verify2.class));
        Runnable anon = new Runnable() { public void run() { System.out.println("[lambda] 'this' inside anonymous class is the anonymous object: " + !(((Object) this) instanceof Verify2) + " (" + this.getClass().getName() + ")"); } };
        lambda.run(); anon.run();
    }
}

enum Day { MONDAY(101), TUESDAY(102); final int value; Day(int v) { value = v; } }
enum Op { PLUS { int apply(int a, int b) { return a + b; } }, MINUS { int apply(int a, int b) { return a - b; } }; abstract int apply(int a, int b); }
enum Mutable { A; String comment = "original"; void setComment(String c) { comment = c; } }

final class NotesImmutable {
    private final String name; private final List<Object> petNameList;
    NotesImmutable(String name, List<Object> petNameList) { this.name = name; this.petNameList = petNameList; }
    public List<Object> getPetNameList() { return new ArrayList<>(petNameList); }
}
record FixedImmutable(String name, List<Object> pets) { FixedImmutable { pets = List.copyOf(pets); } }

class EagerSingleton {
    private static final EagerSingleton INSTANCE = new EagerSingleton();
    private EagerSingleton() { System.out.println("[singleton] EagerSingleton constructor runs"); }
    static void hello() { System.out.println("[singleton] first use of the class (static method) triggers class init"); }
    static EagerSingleton getInstance() { return INSTANCE; }
}
enum EnumSingleton { INSTANCE }
class HolderSingleton {
    static boolean created = false;
    private HolderSingleton() { created = true; }
    private static class Holder { static final HolderSingleton I = new HolderSingleton(); }
    static HolderSingleton getInstance() { return Holder.I; }
    static void otherStatic() { }
}

interface Bird { int MAX_HEIGHT_IN_FEET = 2000; default boolean canBreathe() { return true; } }
interface WaterAnimal { default boolean canBreathe() { return false; } }
class Crocodile implements Bird, WaterAnimal { public boolean canBreathe() { return Bird.super.canBreathe() && !WaterAnimal.super.canBreathe(); } }
interface Parent { String m(); }
interface ChildI extends Parent { default String m() { return "yes"; } }
class Child implements ChildI { }
@FunctionalInterface interface EqualsFi { boolean test(Object o); boolean equals(Object o); String toString(); }
