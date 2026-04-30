import { useReducer, useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { boardReducer, initialState } from './reducers/boardReducer';
import { useLocalStorage } from './hooks/useLocalStorage';
import Column from './components/Column';
import type { BoardState } from './types';
import { CheckCircle2, Clock, Circle, LayoutGrid, Sun, Moon } from 'lucide-react';

function Board() {
  const [savedState, setSavedState] = useLocalStorage<BoardState>('aura-board-v3', initialState);
  const [state, dispatch] = useReducer(boardReducer, savedState);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => { setSavedState(state); }, [state, setSavedState]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Derived stats
  const todo       = state.columns.find(c => c.id === 'todo')?.tasks.length ?? 0;
  const inProgress = state.columns.find(c => c.id === 'in-progress')?.tasks.length ?? 0;
  const done       = state.columns.find(c => c.id === 'done')?.tasks.length ?? 0;
  const total      = state.columns.reduce((s, c) => s + c.tasks.length, 0);
  const pct        = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-secondary)' }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav style={{
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 40,
        height: 56,
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto', padding: '0 32px',
          height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: '#5b5ef4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(91,94,244,0.4)',
            }}>
              <LayoutGrid size={15} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              TaskFlow
            </span>
          </div>

          {/* Pill Stats */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface-secondary)', borderRadius: 99, padding: '6px 12px',
            border: '1px solid var(--border)',
          }}>
            {[
              { icon: <Circle size={10} fill="#aeaeb2" color="#aeaeb2" />, label: 'To do', val: todo },
              { icon: <Clock size={10} color="#ff9500" />, label: 'In progress', val: inProgress },
              { icon: <CheckCircle2 size={10} color="#34c759" />, label: 'Done', val: done },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 10px', fontSize: 12, color: 'var(--text-secondary)' }}>
                {icon}
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Dark mode toggle */}
          <button
            className="btn btn-icon"
            onClick={() => setDark(d => !d)}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ color: dark ? '#ff9500' : '#636366', background: dark ? 'rgba(255,149,0,0.1)' : undefined }}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Avatar placeholder */}
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #5b5ef4, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'white', fontWeight: 600 }}>
            K
          </div>
        </div>
      </nav>

      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '28px 32px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                My Workspace
              </h1>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                background: '#ededff', color: '#5b5ef4', border: '1px solid #d4d4ff',
              }}>
                Board View
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
              Drag and drop tasks between columns. Changes persist automatically.
            </p>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Overall progress</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: pct >= 80 ? '#34c759' : pct >= 40 ? '#ff9500' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {pct}%
              </span>
            </div>
            <div style={{ width: 220, height: 6, background: 'var(--surface-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                width: `${pct}%`,
                background: pct >= 80 ? '#34c759' : pct >= 40 ? '#ff9500' : '#5b5ef4',
              }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{done} of {total} tasks completed</span>
          </div>
        </div>
      </div>

      {/* ── Board ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowX: 'auto', padding: '28px 32px 40px' }}>
        <div style={{
          display: 'flex', gap: 16, alignItems: 'flex-start',
          maxWidth: 1400, margin: '0 auto',
        }}>
          {state.columns.map(col => (
            <Column key={col.id} column={col} dispatch={dispatch} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Board />
    </ThemeProvider>
  );
}
