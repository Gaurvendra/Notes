package track.floating_point;

/** Predict the output: the most famous floating-point surprise, in double and in float. */
public class ClassicSurprises {

    public static void main(String[] args) {
        // @snippet:start puzzle
        System.out.println(0.1 + 0.2);
        System.out.println(0.1 + 0.2 == 0.3);
        System.out.println(0.1f + 0.2f);
        System.out.println(0.1f + 0.2f == 0.3f);
        System.out.println(0.1f == 0.1);
        // @snippet:end puzzle
    }
}
