package track.jdk_jre_jvm;

/** Predict the output: which class loader loaded each class? */
public class WhoLoadedIt {

    public static void main(String[] args) {
        // @snippet:start puzzle
        System.out.println(String.class.getClassLoader());
        System.out.println(java.sql.Connection.class.getClassLoader().getName());
        System.out.println(WhoLoadedIt.class.getClassLoader().getName());
        // @snippet:end puzzle
    }
}
