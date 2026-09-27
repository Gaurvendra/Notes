import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
public class Jackson2Optional {
    public static class User { public Optional<String> name = Optional.of("A"); }
    public static void main(String[] a) throws Exception {
        try { System.out.println("[jackson2] " + new ObjectMapper().writeValueAsString(new User())); }
        catch (Exception e) { System.out.println("[jackson2] " + e.getClass().getSimpleName() + ": " + e.getMessage().lines().findFirst().orElse("")); }
    }
}
