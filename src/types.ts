/**
 * types.ts — Core TypeScript interfaces for Aura Task Flow.
 *
 * WHY: Defining shared types in one place is a foundational React
 * pattern. It enables TypeScript's type-checker to catch bugs at
 * compile time instead of at runtime, and makes the codebase
 * self-documenting for interviewers reading your code.
 */

export type Priority = 'low' | 'medium' | 'high';

export type ColumnId = 'todo' | 'in-progress' | 'review' | 'done';

/** Represents a single task card on the Kanban board. */
export interface Task {
  id: string;
  content: string;
  priority: Priority;
  columnId: ColumnId;
  createdAt: number;
  /** Optional label tags for categorization */
  tags: string[];
}

/** Represents one vertical column on the board. */
export interface Column {
  id: ColumnId;
  title: string;
  /** Tailwind bg color class for the column dot/accent */
  color: string;
  tasks: Task[];
}

/** The complete state of the entire Kanban board. */
export interface BoardState {
  columns: Column[];
}
