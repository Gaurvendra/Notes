class T { void m() { try { Integer.parseInt("x"); } catch (NumberFormatException | IllegalArgumentException e) { } } }
