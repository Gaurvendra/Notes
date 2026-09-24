package track.floating_point;

/**
 * Large whole numbers stop being exact: above 2^24 for float and 2^53 for double. A float counter stops counting, and a
 * 64-bit ID changes when it passes through a double (as in a JavaScript JSON parser).
 */
public class CountersAndIds {

    public static void main(String[] args) {
        // @snippet:start counter
        float count = 16_777_216f;        // 2^24
        count = count + 1;                // the exact result, 16,777,217, doesn't exist as a float
        System.out.println("float counter:  " + count);
        System.out.println("(float) 123456789 = " + (int) (float) 123_456_789);

        long id = 9_007_199_254_740_993L;  // 2^53 + 1, e.g. a database ID
        double asDouble = id;             // what a JSON parser in JavaScript would store
        System.out.println("long id:        " + id);
        System.out.println("as double:      " + (long) asDouble);
        // @snippet:end counter
    }
}
