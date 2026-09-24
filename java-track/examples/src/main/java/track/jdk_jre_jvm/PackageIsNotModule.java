package track.jdk_jre_jvm;

/** Predict the output: which module does each class belong to? (Package names are not module names.) */
public class PackageIsNotModule {

    public static void main(String[] args) {
        // @snippet:start puzzle
        Class<?>[] classes = {
            java.util.List.class,
            java.util.logging.Logger.class,
            javax.crypto.Cipher.class,
            java.beans.PropertyChangeEvent.class,
        };
        for (Class<?> type : classes) {
            System.out.println(type.getModule().getName());
        }
        // @snippet:end puzzle
    }
}
