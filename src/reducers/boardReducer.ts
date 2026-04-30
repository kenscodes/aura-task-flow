/**
 * boardReducer.ts — The centralized state machine for the Kanban board.
 *
 * WHY useReducer over useState?
 * When state transitions involve complex logic — like moving a task
 * between columns by splicing arrays — putting that logic inside
 * individual event handlers creates scattered, hard-to-test code.
 * useReducer consolidates ALL mutations into one place (this file),
 * making every state change predictable and traceable. This is the
 * same pattern Redux uses at scale.
 *
 * INTERVIEW TIP: Explain that useReducer is perfect when:
 *   1. Next state depends on previous state.
 *   2. Multiple sub-values need updating together.
 *   3. You want to extract and test logic in isolation.
 */

import { v4 as uuidv4 } from 'uuid';
import type { BoardState, ColumnId, Priority } from '../types';

// Discriminated union types ensure TypeScript will catch any missing
// properties when you dispatch an action.

export type BoardAction =
  | { type: 'ADD_TASK'; payload: { columnId: ColumnId; content: string; priority: Priority; tags: string[] } }
  | { type: 'DELETE_TASK'; payload: { taskId: string; columnId: ColumnId } }
  | { type: 'MOVE_TASK'; payload: { taskId: string; fromColumn: ColumnId; toColumn: ColumnId } }
  | { type: 'EDIT_TASK'; payload: { taskId: string; columnId: ColumnId; content: string; priority: Priority; tags: string[] } }
  | { type: 'CLEAR_COLUMN'; payload: { columnId: ColumnId } };

export const initialState: BoardState = {
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-blue-500',
      tasks: [
        { id: uuidv4(), content: 'Design the database schema', priority: 'high', columnId: 'todo', createdAt: Date.now(), tags: ['backend'] },
        { id: uuidv4(), content: 'Set up authentication flow', priority: 'medium', columnId: 'todo', createdAt: Date.now(), tags: ['auth'] },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'bg-amber-400',
      tasks: [
        { id: uuidv4(), content: 'Build WebSocket chat server', priority: 'high', columnId: 'in-progress', createdAt: Date.now(), tags: ['backend', 'ws'] },
      ],
    },
    {
      id: 'review',
      title: 'In Review',
      color: 'bg-violet-500',
      tasks: [
        { id: uuidv4(), content: 'Code review: leaderboard API', priority: 'low', columnId: 'review', createdAt: Date.now(), tags: ['review'] },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: 'bg-emerald-500',
      tasks: [
        { id: uuidv4(), content: 'Deploy Nakama server to Render', priority: 'medium', columnId: 'done', createdAt: Date.now(), tags: ['devops'] },
      ],
    },
  ],
};

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'ADD_TASK': {
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.columnId
            ? {
                ...col,
                tasks: [
                  ...col.tasks,
                  {
                    id: uuidv4(),
                    content: action.payload.content,
                    priority: action.payload.priority,
                    columnId: action.payload.columnId,
                    createdAt: Date.now(),
                    tags: action.payload.tags,
                  },
                ],
              }
            : col
        ),
      };
    }

    case 'DELETE_TASK': {
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.columnId
            ? { ...col, tasks: col.tasks.filter(t => t.id !== action.payload.taskId) }
            : col
        ),
      };
    }

    case 'MOVE_TASK': {
      const { taskId, fromColumn, toColumn } = action.payload;
      if (fromColumn === toColumn) return state;

      const sourceCol = state.columns.find(c => c.id === fromColumn)!;
      const task = sourceCol.tasks.find(t => t.id === taskId)!;
      const updatedTask = { ...task, columnId: toColumn };

      return {
        ...state,
        columns: state.columns.map(col => {
          if (col.id === fromColumn) return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
          if (col.id === toColumn) return { ...col, tasks: [...col.tasks, updatedTask] };
          return col;
        }),
      };
    }

    case 'EDIT_TASK': {
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.columnId
            ? {
                ...col,
                tasks: col.tasks.map(t =>
                  t.id === action.payload.taskId
                    ? { ...t, content: action.payload.content, priority: action.payload.priority, tags: action.payload.tags }
                    : t
                ),
              }
            : col
        ),
      };
    }

    case 'CLEAR_COLUMN': {
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.columnId ? { ...col, tasks: [] } : col
        ),
      };
    }

    default:
      return state;
  }
}
