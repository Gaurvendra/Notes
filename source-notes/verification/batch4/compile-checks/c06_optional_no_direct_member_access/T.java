import java.util.Optional; class User { String getName() { return ""; } } class T { void m(Optional<User> u) { u.getName(); } }
