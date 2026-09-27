class T { void m() throws Exception { try { Class.forName("X"); } catch (Exception e) { } catch (ClassNotFoundException e) { } } }
