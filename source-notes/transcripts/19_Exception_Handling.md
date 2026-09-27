# Transcript: 19 Exception Handling

> Source: `source-notes/pdf/19_Exception_Handling.pdf` ("Concept && Coding" YT video notes, typed; 2 tall image
> pages, no text layer). Faithful transcript of the text plus a summary of every code screenshot. Transcribed
> 2026-09-24. Audit: `AUDIT.md` → Note 19.

## What is an exception?
- An event that occurs during the execution of the program.
- It disrupts the program's normal flow.
- It creates an **exception object** containing information about the error: its type, message, stack trace, etc.
- The runtime system uses this exception object and finds the class which can handle it.

**Diagram (call-stack propagation):** exception occurs in `method3()` → "Can method3() handle it?" If no → `method2()` →
`method1()` → `main()` → if no one handles it: "Runtime system will terminate the program abruptly and print stack trace."

**Code:** `main → method1 → method2 → method3` where `method3` does `int b = 5/0;`. Output:
```
Exception in thread "main" java.lang.ArithmeticException: / by zero
    at Main.method3(Main.java:18)
    at Main.method2(Main.java:14)
    at Main.method1(Main.java:10)
    at Main.main(Main.java:6)
```

## Exception hierarchy (diagram)
```
Object
 └─ Throwable
     ├─ Error ── OutOfMemoryError, StackOverflowError
     └─ Exception
         ├─ Un-Checked / Runtime Exception
         │    ├─ ClassCastException
         │    ├─ ArithmeticException
         │    ├─ IndexOutOfBoundException ── ArrayIndexOutOfBoundException, StringIndexOutOfBoundException
         │    ├─ NullPointerException
         │    └─ IllegalArgumentException ── NumberFormatException
         └─ Checked / Compile Time Exception
              ├─ ClassNotFoundException
              ├─ InterruptedException
              ├─ IOException ── FileNotFoundException, EOFException, SocketException
              └─ SQLException
```
OOM example: `String[] arr = new String[900000000*900000000*900000000];` →
`Exception in thread "main" java.lang.OutOfMemoryError: Java heap space`.

## Unchecked / runtime exceptions
"These are the exceptions which occur during runtime and the compiler is not forcing us to handle them."
Examples with outputs:
- `throw new ArithmeticException();` in `method1` (no `throws` needed).
- **ClassCastException:** `Object val = 0; System.out.println((String) val);` → `java.lang.Integer cannot be cast to java.lang.String`.
- **ArithmeticException:** `int val = 5 / 0;` → `/ by zero`.
- **IndexOutOfBoundException:** `int[] val = new int[2]; val[3]` → `ArrayIndexOutOfBoundsException: 3`;
  `"hello".charAt(5)` → `StringIndexOutOfBoundsException: String index out of range: 5`.
- **NullPointerException:** `String val = null; val.charAt(0)` → `java.lang.NullPointerException` (no message shown).
- **IllegalArgumentException:** `Integer.parseInt("abc")` → `NumberFormatException: For input string: "abc"`.

## Checked / compile-time exceptions
"Compiler verifies them during compile time, and if not handled properly, code compilation will fail."
- `throw new ClassNotFoundException();` without handling → `error: unreported exception ClassNotFoundException; must be caught or declared to be thrown`.
- Handle using **`throws`**: "throws tells that this method MIGHT throw this exception (or might not), so pls caller
  you handle it appropriately." Then the caller must take care: `main(...) throws ClassNotFoundException`.
- Handle using **try/catch** inside `method1`, or in the caller (`main`) with `method1() throws ...`.

## How to handle exceptions: try, catch, finally, throw, throws
1. **Try/Catch**
   - Try block specifies the code which can throw an exception.
   - Try is followed either by a catch block or a finally block.
   - Catch block is used to catch all the exceptions which can be thrown in the try block.
   - Multiple catch blocks can be used.
   - Screenshot: `catch (FileNotFoundException)` flagged: "Catch block can only catch exceptions which can be thrown by try block."
   - **Catch all exception object:** `catch (ClassNotFoundException)` then `catch (Exception)` ✓; `catch (Exception)`
     then `catch (ClassNotFoundException)` ✗ "Already caught above".
   - **Catch multiple exceptions in one catch block:** `catch (ClassNotFoundException | InterruptedException exp)`.
2. **Try/catch/finally or try/finally**
   - Finally can be used after try or after catch.
   - "Finally block will always get executed, either if you just return from try block or from catch block."
   - At most 1 finally block.
   - Mostly used for closing objects, adding logs etc.
   - "If JVM related issues like out of memory, system shut down or our process is forcefully killed, then finally
     block does not get executed."
   - Examples: try/catch/finally; try/finally with `main throws ClassNotFoundException`; try/finally where method1
     `throws ArithmeticException`; `try { method1("dummy1"); return; } finally { println("inside finally"); }` → prints `inside finally`.
3. **Throw**: used to throw a new exception, or to re-throw (`catch (ClassNotFoundException e) { throw e; }`).

## Custom / user-defined exception
```java
public class MyCustomException extends Exception {
    MyCustomException(String message) { super(message); }
}
// method1() throws MyCustomException { throw new MyCustomException("some issue arise"); }
// main: try { method1(); } catch (MyCustomException e) { /* handle it */ }
```

## Why handle exceptions?
- Makes code clean by separating error-handling code from regular code.
- Allows the program to recover from the error.
- Allows adding more information, which supports debugging.
- Improves security by hiding sensitive information.

Example: `names[0] = "new value"` after `new String[noOfStudents]`. "Without exception handling" version: nested
`if` checks returning error codes -1/-2/-3 (readability + error codes). "With exception handling": try block +
`catch (IndexOutOfBoundsException)` + `catch (Exception)`.

"But remember, exception handling is little expensive, if stack trace is huge and it is not handled or handled at
parent class." "Try to avoid using exception handling if you can": `try { val = a/b; } catch (ArithmeticException) { val = -1; }`
vs ✓ `if (b == 0) return -1; return a/b;`.
