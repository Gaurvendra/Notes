package track.floating_point;

/** Reference solution for the FloatBits exercise. */
public final class FloatBits {

    private FloatBits() {
    }

    public static String format(float value) {
        String bits = String.format("%32s", Integer.toBinaryString(Float.floatToIntBits(value))).replace(' ', '0');
        return bits.charAt(0) + " " + bits.substring(1, 9) + " " + bits.substring(9);
    }
}
