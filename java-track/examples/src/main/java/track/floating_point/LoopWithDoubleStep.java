package track.floating_point;

/** Anti-pattern → fix: a loop that steps by 0.1 and waits for exactly 1.0. */
public class LoopWithDoubleStep {

    public static void main(String[] args) {
        // @snippet:start broken
        // ❌ Meant to run 10 times. It never sees x == 1.0, so it would run forever.
        int safety = 0;
        for (double x = 0.0; x != 1.0 && safety < 12; x += 0.1) {
            safety++;
            if (safety >= 9) {
                System.out.println("x = " + x);
            }
        }
        System.out.println("iterations before the safety stop: " + safety);
        // @snippet:end broken

        // @snippet:start fixed
        // ✅ Count with an int, compute the double from it
        for (int i = 0; i <= 10; i++) {
            double x = i / 10.0;                     // exactly 0.9 and 1.0 at the end
            if (i >= 9) {
                System.out.println("x = " + x);
            }
        }
        // @snippet:end fixed
    }
}
