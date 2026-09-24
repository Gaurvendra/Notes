class T { String m(int v) { String s = switch (v) { case 1: return "One"; default: yield "x"; }; return s; } }
