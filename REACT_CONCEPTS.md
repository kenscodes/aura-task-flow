# 📚 React Concepts Learned — Aura Task Flow

This project is a hands-on Kanban Board built specifically to master **modern React patterns** asked in frontend interviews. Every concept covered here is documented with the **"why"**, not just the "how".

---

## 1. `useState` — Local Component State

**File:** `src/components/Column.tsx`, `src/components/TaskCard.tsx`

```tsx
const [adding, setAdding] = useState(false);
const [draft, setDraft] = useState(task.content);
```

**What it is:** The most fundamental React hook. It stores a value that, when changed, causes the component to re-render.

**Why we use it here:** `adding` and `draft` are purely local UI states — they have no meaning outside their own component. Keeping them local avoids polluting the global state with ephemeral values.

**Interview question you can now answer:** *"When would you use `useState` vs `useReducer`?"*
> Use `useState` for simple, isolated values. Use `useReducer` when multiple state values are related and updated together through complex logic.

---

## 2. `useReducer` — Centralized State Machine

**File:** `src/reducers/boardReducer.ts`, `src/App.tsx`

```tsx
const [state, dispatch] = useReducer(boardReducer, savedState);

dispatch({ type: 'MOVE_TASK', payload: { taskId, fromColumn, toColumn } });
```

**What it is:** An alternative to `useState` for complex state. You define a "reducer" — a pure function that takes the current state + an action and returns a new state.

**Why we use it here:** Moving a task between columns requires atomically removing it from one array and appending it to another. If this logic lived in `Column.tsx`, it would be duplicated and untestable. The reducer centralizes ALL mutations in one pure function.

**Interview question you can now answer:** *"What is a pure function? Why does it matter for reducers?"*
> A pure function always returns the same output for the same inputs and has no side effects. React relies on this to efficiently detect state changes using shallow comparison.

---

## 3. Context API — Avoiding Prop Drilling

**File:** `src/context/ThemeContext.tsx`, `src/App.tsx`

```tsx
// Any component, anywhere in the tree, can access the theme
const { theme, setTheme } = useTheme();
```

**What it is:** React's built-in solution for sharing data globally without passing props through every level of the component tree.

**Why we use it here:** The theme needs to be available to the header, the columns, and every card. Passing it as a prop through `App → Board → Column → Card` is called *"prop drilling"* — it creates tight coupling and makes every parent aware of data it doesn't use.

**Interview question you can now answer:** *"When should you NOT use Context?"*
> Avoid Context for high-frequency updates (like real-time data). Every component that calls `useContext()` will re-render whenever the value changes, which can cause performance issues at scale.

---

## 4. Custom Hooks — Reusable Stateful Logic

**File:** `src/hooks/useLocalStorage.ts`

```tsx
// Usable in ANY component, with ANY type
const [savedState, setSavedState] = useLocalStorage<BoardState>('aura-board', initialState);
```

**What it is:** A regular JavaScript function that starts with `use` and calls other React hooks. It lets you extract and reuse stateful logic — like how `useState` extracts state logic from components.

**Why we use it here:** Without this hook, every component that needs localStorage would have to re-implement the `JSON.parse`/`JSON.stringify` + error handling pattern. The hook encapsulates it once.

**Interview question you can now answer:** *"What are the rules of hooks?"*
> 1. Only call hooks at the **top level** of a function (not inside loops or conditions). 2. Only call hooks from **React function components** or **custom hooks**. These rules exist because React tracks hook calls by order.

---

## 5. `useEffect` — Side Effect Management

**File:** `src/App.tsx`

```tsx
useEffect(() => {
  setSavedState(state); // Syncs reducer state → localStorage
}, [state, setSavedState]);
```

**What it is:** A hook for running code in response to renders. Used for things that need to "reach outside" React — DOM manipulation, API calls, timers, subscriptions.

**Why we use it here:** Writing to `localStorage` is a *side effect* — it mutates something outside of React's control. Any side effect must live in a `useEffect`, not directly in the render body.

**Interview question you can now answer:** *"What is the cleanup function in useEffect?"*
> It's a function returned from the effect that runs before the component unmounts or before the effect re-runs. Used to cancel subscriptions, clear timers, or abort fetch requests to prevent memory leaks.

---

## 6. HTML5 Drag & Drop API — Native Browser Events

**File:** `src/components/TaskCard.tsx` (drag source), `src/components/Column.tsx` (drop target)

```tsx
// On the card (drag source)
e.dataTransfer.setData('taskId', task.id);  

// On the column (drop target)
e.preventDefault(); // Required to allow the drop!
const taskId = e.dataTransfer.getData('taskId');
dispatch({ type: 'MOVE_TASK', payload: { ... } });
```

**What it is:** Native browser APIs for drag and drop, exposed through React's synthetic events. No library needed.

**Why we use it here:** Understanding the native API makes you a stronger engineer. Libraries like `react-dnd` or `dnd-kit` are wrappers around these exact same events.

**Interview question you can now answer:** *"Why must you call `e.preventDefault()` in `onDragOver`?"*
> Browsers cancel drop operations by default. Calling `preventDefault()` in `onDragOver` tells the browser "this element accepts drops", enabling the `onDrop` event to fire.

---

## 7. TypeScript Generics & Discriminated Unions

**File:** `src/types.ts`, `src/reducers/boardReducer.ts`

```ts
// Generic custom hook — works with any type T
function useLocalStorage<T>(key: string, initialValue: T): [T, ...]

// Discriminated union — TypeScript knows exactly which fields exist per action
type BoardAction =
  | { type: 'ADD_TASK'; payload: { columnId: ColumnId; content: string } }
  | { type: 'DELETE_TASK'; payload: { taskId: string; columnId: ColumnId } }
```

**What it is:** TypeScript patterns that make your code highly reusable and type-safe.

**Why we use it here:** The discriminated union ensures that if you dispatch `'ADD_TASK'` but provide a `taskId` (which belongs to `DELETE_TASK`), TypeScript will throw an error at compile time — before the bug ever reaches a user.

---

## Architecture Summary

```
src/
├── types.ts              → Shared TypeScript interfaces (Task, Column, BoardState)
├── context/
│   └── ThemeContext.tsx  → Context API — global theme, no prop drilling
├── hooks/
│   └── useLocalStorage.ts → Custom Hook — reusable localStorage persistence
├── reducers/
│   └── boardReducer.ts   → useReducer — centralized state machine
├── components/
│   ├── Column.tsx         → Drop target, renders TaskCard list
│   └── TaskCard.tsx       → Draggable card, inline editing
└── App.tsx               → Orchestrator — wires everything together
```
