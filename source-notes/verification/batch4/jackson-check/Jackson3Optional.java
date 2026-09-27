import tools.jackson.databind.json.JsonMapper;
import java.util.Optional;
public class Jackson3Optional {
    public static class User { public Optional<String> name = Optional.of("A"); public Optional<String> email = Optional.empty(); }
    public static void main(String[] a) {
        System.out.println("[jackson3] " + JsonMapper.builder().build().writeValueAsString(new User()));
    }
}
