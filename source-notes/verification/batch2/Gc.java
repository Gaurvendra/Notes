import java.lang.management.ManagementFactory;
public class Gc { public static void main(String[] a) { long before = count(); System.gc(); System.out.println("GC collections caused by System.gc(): " + (count() - before)); }
  static long count() { return ManagementFactory.getGarbageCollectorMXBeans().stream().mapToLong(b -> b.getCollectionCount()).sum(); } }
