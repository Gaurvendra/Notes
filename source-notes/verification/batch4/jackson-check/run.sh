#!/usr/bin/env bash
# Needs the jars in ~/.m2 (fetch with: mvn dependency:get -Dartifact=com.fasterxml.jackson.core:jackson-databind:2.22.3
#                                  and mvn dependency:get -Dartifact=tools.jackson.core:jackson-databind:3.2.3)
M=~/.m2/repository; J="${JDK25_HOME:-/usr/lib/jvm/java-25-openjdk-amd64}/bin"; cd "$(dirname "$0")"
"$J/java" -cp "$M/com/fasterxml/jackson/core/jackson-databind/2.22.3/jackson-databind-2.22.3.jar:$M/com/fasterxml/jackson/core/jackson-core/2.22.3/jackson-core-2.22.3.jar:$M/com/fasterxml/jackson/core/jackson-annotations/2.22/jackson-annotations-2.22.jar" Jackson2Optional.java 2>&1 | grep -v JAVA_TOOL
"$J/java" -cp "$M/tools/jackson/core/jackson-databind/3.2.3/jackson-databind-3.2.3.jar:$M/tools/jackson/core/jackson-core/3.2.3/jackson-core-3.2.3.jar:$M/com/fasterxml/jackson/core/jackson-annotations/2.22/jackson-annotations-2.22.jar" Jackson3Optional.java 2>&1 | grep -v JAVA_TOOL
