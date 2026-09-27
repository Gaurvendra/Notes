#!/usr/bin/env bash
# JVM/GC facts used in AUDIT.md (batch 2). Output depends on JDK version and machine size.
J="${JDK25_HOME:-/usr/lib/jvm/java-25-openjdk-amd64}/bin"
echo "using: $("$J/java" -version 2>&1 | grep -v JAVA_TOOL | head -1)"
cd "$(dirname "$0")"
echo "default GC:            $("$J/java" -XX:+PrintCommandLineFlags -version 2>&1 | grep -oE -- '-XX:\+Use[A-Za-z0-9]+GC')"
echo "default GC with 1 CPU: $("$J/java" -XX:ActiveProcessorCount=1 -XX:+PrintCommandLineFlags -version 2>&1 | grep -oE -- '-XX:\+Use[A-Za-z0-9]+GC')"
echo "CMS:                   $("$J/java" -XX:+UseConcMarkSweepGC -version 2>&1 | grep -v JAVA_TOOL | head -1)"
"$J/java" -XX:+PrintFlagsFinal -version 2>/dev/null | grep -E " (MaxTenuringThreshold|UseCompactObjectHeaders|ThreadStackSize|MaxMetaspaceSize) " | awk '{print $2, "=", $4}'
echo "System.gc():           $("$J/java" Gc.java 2>&1 | grep -v JAVA_TOOL)"
echo "DisableExplicitGC:     $("$J/java" -XX:+DisableExplicitGC Gc.java 2>&1 | grep -v JAVA_TOOL)"
echo "ZGC non-generational:  $("$J/java" -XX:+UseZGC -XX:-ZGenerational -version 2>&1 | grep -i zgenerational)"
