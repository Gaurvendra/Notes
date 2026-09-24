# Transcript: 28 Streams (Java 8)

> Source: `source-notes/pdf/28_Streams.pdf` ("Concept && Coding" YT video notes, typed; 1 tall image page, no text
> layer). Transcribed 2026-09-24. Audit: `AUDIT.md` → Note 28.

## What is a stream?
- We can consider a stream as a pipeline through which our collection elements pass.
- While elements pass through the pipeline, it performs various operations like sorting, filtering etc.
- Useful when dealing with bulk processing (can do parallel processing).

**Diagram:** Collection → Step 1 *Create Stream* ("streams are created from the data source like collection or array
etc.") → Step 2 *Intermediate Operations* ("filter(), sorted(), map(), distinct() etc. These operations transform
the stream into another stream and more operations can be done on top of it. These are **lazy** in nature, means
these operations get executed only when a terminal operation is invoked.") → Step 3 *Terminal Operations*
("collect(), reduce(), count() etc. These operations trigger the processing of the stream, and produce the output.
Means after a terminal operation is used, no more operations we can perform.")

**Example:** salaries 3000, 4100, 9000, 1000, 3500. Loop with counter vs
`long output = salaryList.stream().filter((Integer sal) -> sal > 3000).count();` → `Total Employee with salary > 3000: 3`.

## Different ways to create a stream
1. From collection: `Arrays.asList(3000, 4100, 9000, 1000, 3500).stream()`
2. From array: `Arrays.stream(new Integer[]{3000, 4100, 9000, 1000, 3500})`
3. From static method: `Stream.of(1000, 3500, 4000, 9000)`
4. From stream builder: `Stream.Builder<Integer> b = Stream.builder(); b.add(1000).add(9000).add(3500); b.build();`
5. From stream iterate: `Stream.iterate(1000, (Integer n) -> n + 5000).limit(5);`

## Different intermediate operations
"We can chain multiple intermediate operations together to perform more complex processing before applying a
terminal operation to produce the result."

| # | Operation | Example | Output / description |
|---|---|---|---|
| 1 | `filter(Predicate<T>)` | `Stream.of("HELLO","EVERYBODY","HOW","ARE","YOU","DOING").filter(name -> name.length() <= 3).collect(Collectors.toList())` | HOW, ARE, YOU. "Filters the element." |
| 2 | `map(Function<T,R>)` | same names `.map(name -> name.toLowerCase())` | hello, everybody, how, are, you, doing. "Used to transform each element." |
| 3 | `flatMap(Function<T, Stream<R>>)` | `List<List<String>> sentenceList = [[I, LOVE, JAVA], [CONCEPTS, ARE, CLEAR], [ITS, VERY, EASY]]`; `.flatMap(sentence -> sentence.stream())`; and `.flatMap(sentence -> sentence.stream().map(v -> v.toLowerCase()))` | I, LOVE, JAVA, CONCEPTS, ARE, CLEAR, ITS, VERY, EASY / lower-case version. "Used to iterate over each element of the complex collection, and helps to flatten it." |
| 4 | `distinct()` | `Arrays.stream(new Integer[]{1,5,2,7,4,4,2,0,9}).distinct()` | 1, 5, 2, 7, 4, 0, 9. "Removes duplicates from the stream." |
| 5 | `sorted()` | same array `.sorted()`; `.sorted((val1, val2) -> val2 - val1)` | 0,1,2,2,4,4,5,7,9 / 9,7,5,4,4,2,2,1,0. "Sorts the elements." |
| 6 | `peek(Consumer<T>)` | `Arrays.asList(2,1,3,4,6).stream().filter(val -> val > 2).peek(val -> System.out.println(val)).map(val -> -1 * val); numberStream.collect(Collectors.toList())` | "it will print 3, 4, 6". "Helps you to see the intermediate result of the stream which is getting processed." |
| 7 | `limit(long maxSize)` | `Arrays.asList(2,1,3,4,6).stream().limit(3)` | 2, 1, 3. "Truncate the stream, to have no longer than given maxSize." |
| 8 | `skip(long n)` | same list `.skip(3)` | 4, 6. "Skip the first n elements of the stream." |
| 9 | `mapToInt(ToIntFunction<T>)` | `Arrays.asList("2","1","4","7").stream().mapToInt(val -> Integer.parseInt(val)).toArray()` → 2, 1, 4, 7; and `IntStream numbersStream = Arrays.stream(new int[]{2,1,4,7}); numbersStream.filter(val -> val > 2); int[] filteredArray = numbersStream.toArray(); //Output: 4, 7` | "helps to work with primitive int data types" |
| 10 | `mapToLong(ToLongFunction<T>)` | "(pls try it out....)" | primitive long |
| 11 | `mapToDouble(ToDoubleFunction<T>)` | "(pls try it out....)" | primitive double |

## Why we call intermediate operations "lazy"
- `Arrays.asList(2,1,4,7,10).stream().filter(val -> val >= 3).peek(val -> System.out.println(val));` →
  "Nothing would be printed in the output."
- Same pipeline + `numbersStream.count(); //count is one of the terminal operation` → prints 4, 7, 10.

## Sequence of stream operations
```java
List<Integer> numbers = Arrays.asList(2, 1, 4, 7, 10);
Stream<Integer> numbersStream = numbers.stream()
    .filter(val -> val >= 3)
    .peek(val -> System.out.println("after filter:" + val))
    .map(val -> val * -1)
    .peek(val -> System.out.println("after negating:" + val))
    .sorted()
    .peek(val -> System.out.println("after Sorted:" + val));
List<Integer> filteredNumberStream = numbersStream.collect(Collectors.toList());
```
Expected (wrong) output: all "after filter" lines, then all "after negating", then all "after Sorted".
Actual output: `after filter:4, after negating:-4, after filter:7, after negating:-7, after filter:10,
after negating:-10, after Sorted:-10, after Sorted:-7, after Sorted:-4`.
Diagram: elements 2 1 4 7 10 flow one at a time through FILTER → PEEK → MAP → PEEK; "Generally each element is
processed sequentially and can perform multiple operations, this feature helps Stream to fast process the task. For
example: if you need to return any number which is greater than 3, processing will stop at 4 itself." Then SORTED:
"All stream elements should be present before this operation starts." → PEEK.

## Different terminal operations
"Terminal operations are the ones that produce the result. It triggers the processing of the stream."

| # | Operation | Example | Output / description |
|---|---|---|---|
| 1 | `forEach(Consumer<T>)` | `numbers.stream().filter(val -> val >= 3).forEach(val -> System.out.println(val))` | 4, 7, 10. "Perform action on each element of the stream. DO NOT return any value." |
| 2 | `toArray()` | `.filter(val -> val >= 3).toArray()` → `Object[]`; `.toArray((int size) -> new Integer[size])` → `Integer[]` | "Collects the elements of the stream into an array." |
| 3 | `reduce(BinaryOperator<T>)` | `Optional<Integer> reducedValue = numbers.stream().reduce((val1, val2) -> val1 + val2); reducedValue.get()` | 24. "Does reduction on the elements of the stream. Perform associative aggregation function." |
| 4 | `collect(Collector<T,A,R>)` | `.filter(val -> val >= 3).collect(Collectors.toList())` | "can be used to collect the elements of the stream into a List." |
| 5 | `min(Comparator<T>)` / `max(Comparator<T>)` | `.filter(val -> val >= 3).min((v1, v2) -> v1 - v2)` → 4; `.min((v1, v2) -> v2 - v1)` → 10. "Can you pls comment the output for max for both the types" | "Finds the minimum or maximum element from the stream based on the comparator provided." |
| 6 | `count()` | `.filter(val1 -> val1 >= 3).count()` | 3. "returns the count of elements present in the stream" |
| 7 | `anyMatch(Predicate<T>)` | `numbers.stream().anyMatch(val -> val > 3)` | true. "Checks if any value in the stream matches the given predicate and returns the boolean." |
| 8 | `allMatch(Predicate<T>)` | "Can you pls try it out..." | "Checks if all values … match …" |
| 9 | `noneMatch(Predicate<T>)` | "Can you pls try it out..." | "Checks if no value … matches …" |
| 10 | `findFirst()` | `.filter(val -> val >= 3).findFirst().get()` | 4. "finds the first element of the stream." |
| 11 | `findAny()` | "Can you pls try it out..." | "finds any random element of the stream." |

## How many times can we use a single stream?
"Once a terminal operation is used on a stream, it is closed/consumed and cannot be used again for another terminal
operation." Example: `filteredNumbers.forEach(println)` (prints 4, 7, 10) then `filteredNumbers.collect(...)` →
`Exception in thread "main" java.lang.IllegalStateException: stream has already been operated upon or closed`.

## Parallel stream
- Helps to perform operations on a stream concurrently, taking advantage of multi-core CPUs.
- `parallelStream()` is used instead of the regular `stream()` method.
- Internally it does: **task splitting** (uses a "spliterator" function to split the data into multiple chunks);
  **task submission and parallel processing** (uses the **Fork-Join pool** technique).
- "Note: I will cover Fork-Join pool implementation in the Multithreading topic."

Example: numbers 11, 22, …, 110; `map(val -> val * val).forEach(println)` sequentially then with `parallelStream()`,
timing each with `System.currentTimeMillis()`. Output: sequential prints 121 … 12100 in order, "Sequential processing
Time Taken: 64 millisecond"; parallel prints in a scrambled order (7744, 121, 5929, …), "Parallel processing Time
Taken: 5 millisecond".

Diagram: Task → fork() → Sub-task → fork() → Sub-tasks → Join subtask result → … → output.
