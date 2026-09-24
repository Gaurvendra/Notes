package track.floating_point;

/** Predict the output: four different ways Java turns a fractional number into a whole one. */
public class RoundingPuzzle {

    public static void main(String[] args) {
        // @snippet:start puzzle
        System.out.println((int) 3.99);
        System.out.println((int) -3.99);
        System.out.println(Math.round(2.5));
        System.out.println(Math.round(-2.5));
        System.out.println(Math.rint(2.5));
        System.out.println(String.format("%.2f", 1.005));
        // @snippet:end puzzle
    }
}
