export interface Arm {
  labels: (number | 'default')[]
  /** Lines printed by the arm; `{value}` stands for the selector's value. */
  prints: string[]
  hasBreak: boolean
}
export const NOTES_EXAMPLE: Arm[]
export function entryArm(arms: Arm[], value: number): number
export function run(arms: Arm[], value: number, arrow?: boolean): { start: number; executed: number[]; output: string[] }
