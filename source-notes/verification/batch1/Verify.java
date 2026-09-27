import java.math.BigDecimal;
public class Verify {
    static boolean bField; static char cField; static int[] arr = new int[1];
    static void change(Integer x) { x = x + 1; }
    public static void main(String[] args) {
        System.out.println("boolean default field = " + bField);
        System.out.println("char default = " + (int) cField);
        System.out.println("(byte)128 = " + (byte) 128 + ", (byte)148 = " + (byte) 148);
        System.out.println("4.125f bits = " + Integer.toBinaryString(Float.floatToIntBits(4.125f)));
        System.out.println("0.7f bits = " + String.format("%32s", Integer.toBinaryString(Float.floatToIntBits(0.7f))).replace(' ', '0'));
        System.out.println("exact 0.7f = " + new BigDecimal(0.7f));
        System.out.println("exact 0.7d = " + new BigDecimal(0.7));
        System.out.println("0.1+0.2 = " + (0.1 + 0.2));
        final byte fa = 1, fb = 2; byte ok = fa + fb; System.out.println("final byte const sum compiles = " + ok);
        int big = Integer.MAX_VALUE; System.out.println("MAX+1 = " + (big + 1));
        long l = 123456789123456789L; float f = l; System.out.println("long->float = " + (long) f + " (lost precision)");
        System.out.println("(int)3.99e10 = " + (int) 3.99e10 + ", (int)NaN = " + (int) Double.NaN + ", (int)-7.9 = " + (int) -7.9);
        Integer a = 127, b = 127, c = 128, d = 128; System.out.println("127==127: " + (a == b) + ", 128==128: " + (c == d));
        Integer w = 10; change(w); System.out.println("wrapper after change(): " + w);
        String s1 = "hello", s2 = "hel" + "lo", part = "hel", s3 = part + "lo";
        System.out.println("literal==constConcat: " + (s1 == s2) + ", literal==runtimeConcat: " + (s1 == s3) + ", intern: " + (s1 == s3.intern()));
        System.out.println("emoji length = " + "😀".length() + ", codePoints = " + "😀".codePointCount(0, 2));
        System.out.println("Runtime.version = " + Runtime.version());
    }
}
