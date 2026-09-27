sealed interface S permits A, B {} record A() implements S {} record B() implements S {} class T { int m(S s) { return switch (s) { case A a -> 1; case B b -> 2; }; } }
