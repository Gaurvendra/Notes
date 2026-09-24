package track.floating_point;

/** Predict the output: infinities, NaN, negative zero and the smallest double. */
public class SpecialValuesPuzzle {

    public static void main(String[] args) {
        // @snippet:start puzzle
        double nan = 0.0 / 0.0;
        System.out.println(1 / 0.0);
        System.out.println(nan == nan);
        System.out.println(0.0 == -0.0);
        System.out.println(Double.valueOf(0.0).equals(-0.0));
        System.out.println(Double.MIN_VALUE > 0);
        System.out.println((int) nan);
        // @snippet:end puzzle
    }
}
