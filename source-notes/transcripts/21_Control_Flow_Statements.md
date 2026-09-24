# Transcript: 21 Control Flow Statements

> Source: `source-notes/pdf/21_Control_Flow_Statements.pdf` ("Concept && Coding" YT video notes, typed; 2 tall
> image pages, no text layer). Transcribed 2026-09-24. Audit: `AUDIT.md` → Note 21.

**Diagram:** Control Flow Statements →
- **Decision making:** If then, If-else, If-Else-If ladder, Nested-If, Switch Statement, Switch Expression
- **Iterative:** for loop, while loop, do-while loop, for-each loop
- **Branching:** break statement, continue statement

## Decision making
1. **If then (simple if):** if the condition is true, the if-block is executed. `int val = 10; if (val > 8) {...}` + an
   always-executed line; output shows both lines.
2. **If-else:** true → if-block, false → else-block. `val = 7` → else line + always line.
3. **If-else-if ladder:** chain of else-ifs, evaluated top-down; the first true condition's block runs.
   `val = 13` with cases 1/2/3/else → `val is: 13`, `this code will executes anyhow`.
4. **Nested if:** if-else inside an if or else block. `val = 13`: `> 8` → prints "greater than 8", inner `< 15` →
   "greater than 8 but less than 15" (typo in notes: "but else than 15").
5. **Switch statement:** similar to the if-else-if ladder; based on the value a particular block executes.
   ```
   switch (expression) { case value_1: ...; break; case value_2: ...; break; ... default: ...; break; // optional }
   ```
   Flow diagram: expression → case value1 → code → break → end; → case value2 ...; → default → code → break (optional) → end.
   Examples (`a = 1, b = 2`, `switch (a + b)`):
   - With breaks → `a+b is 3`.
   - **Without break** after case 3 → falls through: `a+b is 3`, `a+b is 4`, `3` (default).
   - `default` placed in the middle → still only used when no case matches; fall-through continues past it
     (`a+b is 3`, `a+b is 4`). With `b = 9` (sum 10, no match) → `10` (default) then falls through into `case 2`
     → `a+b is 2`.
   - String switch: `case "January": case "February": case "March": ...` (stacked labels) and
     `case "January", "February", "March":` (comma form) → `month value is in Q1`.
   **Few things we need to take care of:**
   1. Two cases cannot have the same value.
   2. Switch expression data type and case values/constant data type should be the same.
   3. Case value should be either a LITERAL or a CONSTANT (`int value = 1; case value:` ✗; `final int value = 1;` ✓).
   4. All use cases need not be handled (enum `Day`, switch handles MONDAY–THURSDAY only, FRIDAY → output `0`).
   5. Nested switch is possible (switch on `outputValue` inside `case MONDAY`) → `output value:1`, `1`.
   6. Supported data types: 4 primitives `int, short, byte, char`; their wrappers `Integer, Short, Byte, Character`;
      `Enum`; `String`.
   7. "Return is not possible within switch case": `String outputVal = switch (val) { case 1: return "One"; };` ✗.
6. **Switch expression** (to return a value from a switch) — two ways:
   1. **`case N ->` label:** `String outputVal = switch (val) { case 1 -> "One"; case 2 -> "Two"; default -> "None"; };`
      - Rule 1: all possible use cases need to be handled (IDE: "'switch' expression does not cover all possible input values").
      - Rule 2: "Using `->` we can not have a block of statements. If we want a block of statements and then return the value, we need to use `yield`."
   2. **`yield`:** `case 1 -> { //some code logic here  yield "One"; }` … `default -> "None";`

## Iterative statements
1. **For loop:** `for (initialization; condition check; increment/decrement) { ... }`; `for (int val=1; val<=10; val++)` → 1..10.
   Nested for (x 1..3, y 1..3) → 9 lines `x=1 : y=1` … `x=3 : y=3`.
2. **While loop:** initialize; `while (condition) { ...; increment }`; `val=1; while (val<=5)` → 1..5.
3. **Do-while loop:** `do { ... } while (condition);` → 1..5.
4. **For-each loop:** `int valArray[] = {1,2,3,4,5}; for (int val : valArray)` → 1..5.

## Branching statements
1. **break:** `for 1..10 { if (val == 3) break; println(val); }` → 1, 2. Nested loops with `break` in the inner loop
   (when `innerLoop == 2`) → `1,1  2,1  3,1  4,1  5,1` (break exits only the inner loop).
2. **continue:** `if (val == 3) continue;` → 1, 2, 4, 5, … 10.
