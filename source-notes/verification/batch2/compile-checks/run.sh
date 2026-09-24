#!/usr/bin/env bash
# Compiles each snippet; c* are expected to FAIL (prints first error), k* are expected to compile.
set -u
JAVAC="${JDK25_HOME:-/usr/lib/jvm/java-25-openjdk-amd64}/bin/javac"
echo "using: $("$JAVAC" -version 2>&1 | grep -v JAVA_TOOL)"
cd "$(dirname "$0")"
out=$(mktemp -d)
for d in */; do
  d=${d%/}
  msg=$("$JAVAC" -d "$out" "$d/T.java" 2>&1 | grep "error:" | head -1 | sed 's/.*error: //')
  printf "%-40s %s\n" "$d" "${msg:-COMPILES OK}"
done
rm -rf "$out"
