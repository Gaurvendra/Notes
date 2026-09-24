package track.floating_point;

/** How precise are float and double? The gap to the next value (the ULP) grows with the size of the number. */
public class UlpTable {

    public static void main(String[] args) {
        // @snippet:start ulp
        // Math.ulp(x): the gap between x and the next larger value
        System.out.println("gap after 1.0f          " + Math.ulp(1.0f));
        System.out.println("gap after 1,000,000f    " + Math.ulp(1_000_000f));
        System.out.println("gap after 16,777,216f   " + Math.ulp(16_777_216f));
        System.out.println("gap after 1.0 (double)  " + Math.ulp(1.0));
        System.out.println("gap after 1e16 (double) " + Math.ulp(1e16));
        // @snippet:end ulp
    }
}
