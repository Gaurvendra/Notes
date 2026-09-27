enum D { A, B } class T { int m(D d) { return switch (d) { case A -> 1; case B -> 2; }; } }
