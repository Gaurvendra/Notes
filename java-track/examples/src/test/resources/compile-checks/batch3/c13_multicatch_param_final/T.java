class T { void m() { try { Thread.sleep(1); Class.forName("X"); } catch (InterruptedException | ClassNotFoundException e) { e = null; } } }
