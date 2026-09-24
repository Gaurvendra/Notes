class T { void m() { int count = 0; count++; Runnable r = () -> System.out.println(count); } }
