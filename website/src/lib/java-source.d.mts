export function javaTrackPath(rel: string): string;
export function readJavaTrackFile(rel: string): string;
export function stripMarkers(text: string): string;
export function dedent(lines: string[]): string;
export function extractSnippet(text: string, name: string, fileForErrors?: string): string;
export function goldenPathFor(rel: string): string;
export function testPathFor(rel: string): string;
export function readCompileCase(caseId: string): { files: { name: string; code: string }[]; expected: string; compiles: boolean };
