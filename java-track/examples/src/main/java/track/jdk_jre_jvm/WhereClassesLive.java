package track.jdk_jre_jvm;

import java.net.http.HttpClient;
import java.sql.Connection;
import java.util.ArrayList;

/**
 * Scenario (basic): the "class libraries" of a Java runtime are modules. Every class you use comes from one of them,
 * or from your own code on the class path (the "unnamed module").
 */
public class WhereClassesLive {

    public static void main(String[] args) {
        // @snippet:start modules
        System.out.println("String           -> " + moduleOf(String.class));
        System.out.println("ArrayList        -> " + moduleOf(ArrayList.class));
        System.out.println("Connection       -> " + moduleOf(Connection.class));
        System.out.println("HttpClient       -> " + moduleOf(HttpClient.class));
        System.out.println("WhereClassesLive -> " + moduleOf(WhereClassesLive.class));
        // @snippet:end modules
    }

    // @snippet:start helper
    static String moduleOf(Class<?> type) {
        Module module = type.getModule();
        return module.isNamed()
                ? module.getName()
                : "unnamed module (our own code, from the class path)";
    }
    // @snippet:end helper
}
