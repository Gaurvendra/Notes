package track.jdk_jre_jvm;

import java.lang.module.ModuleFinder;
import java.util.Set;
import java.util.spi.ToolProvider;
import java.util.stream.Collectors;

/**
 * Scenario (real world): is this a full JDK or a trimmed runtime? Can it compile code? The program only uses
 * {@code java.base}, so it also runs on the smallest possible runtime (see {@code JlinkRuntimeTest}).
 */
public class WhatIsInThisRuntime {

    public static void main(String[] args) {
        // @snippet:start inventory
        Set<String> modules = systemModules();   // every module in this runtime image

        System.out.println("java.base    (core classes):  " + modules.contains("java.base"));
        System.out.println("java.sql     (JDBC):          " + modules.contains("java.sql"));
        System.out.println("jdk.compiler (javac):         " + modules.contains("jdk.compiler"));
        System.out.println("jdk.jlink    (jlink):         " + modules.contains("jdk.jlink"));
        System.out.println("jdk.jfr      (Flight Rec.):   " + modules.contains("jdk.jfr"));
        System.out.println("javac tool available:         " + ToolProvider.findFirst("javac").isPresent());
        // @snippet:end inventory
    }

    static Set<String> systemModules() {
        return ModuleFinder.ofSystem().findAll().stream()
                .map(reference -> reference.descriptor().name())
                .collect(Collectors.toSet());
    }
}
