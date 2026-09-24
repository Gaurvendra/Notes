/** Preview feature (JEP 507 in Java 25): primitive types in patterns. Compile and run with --enable-preview. */
public class FitsInFloat {

    public static void main(String[] args) {
        double[] values = {0.5, 0.1, 16_777_217.0, 1e40};
        for (double d : values) {
            if (d instanceof float f) {                  // matches only if the conversion is exact
                System.out.println(d + " fits in a float exactly: " + f);
            } else {
                System.out.println(d + " does NOT fit in a float exactly");
            }
        }
    }
}
