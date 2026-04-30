import { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Check, X } from 'lucide-react';
import TaskCard from './TaskCard';
import type { Column as ColType, ColumnId, Priority } from '../types';
import type { BoardAction } from '../reducers/boardReducer';

interface Props { column: ColType; dispatch: React.Dispatch<BoardAction>; }

const COL_COLORS: Record<string, { accent: string; light: string }> = {
  'bg-blue-500':    { accent: '#0071e3', light: '#e8f0fb' },
  'bg-amber-400':   { accent: '#ff9500', light: '#fff8ee' },
  'bg-violet-500':  { accent: '#8b5cf6', light: '#f5f0ff' },
  'bg-emerald-500': { accent: '#34c759', light: '#edfbf1' },
};

export default function Column({ column, dispatch }: Props) {
  const [adding, setAdding]         = useState(false);
  const [content, setContent]       = useState('');
  const [priority, setPriority]     = useState<Priority>('medium');
  const [tags, setTags]             = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu]     = useState(false);

  const colors = COL_COLORS[column.color] ?? { accent: '#5b5ef4', light: '#ededff' };

  const addTask = () => {
    if (!content.trim()) return;
    dispatch({ type: 'ADD_TASK', payload: {
      columnId: column.id, content: content.trim(), priority,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    }});
    setContent(''); setTags(''); setAdding(false);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setIsDragOver(true); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    const fromColumn = e.dataTransfer.getData('fromColumn') as ColumnId;
    if (taskId && fromColumn !== column.id) dispatch({ type: 'MOVE_TASK', payload: { taskId, fromColumn, toColumn: column.id } });
  };

  return (
    <div
      className={`column${isDragOver ? ' drag-over' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
      style={{ borderColor: isDragOver ? colors.accent : 'transparent', background: isDragOver ? colors.light : 'var(--surface-secondary)' }}
    >
      {/* ── Column Header ─────────────────────────────────── */}
      <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Color indicator */}
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: colors.accent,
            boxShadow: `0 2px 6px ${colors.accent}55`, flexShrink: 0,
          }} />
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {column.title}
          </span>
          {/* Count badge */}
          <div style={{
            minWidth: 20, height: 20, borderRadius: 99, background: colors.light, color: colors.accent,
            fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 6px', border: `1px solid ${colors.accent}33`,
          }}>
            {column.tasks.length}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
          <button
            className="btn btn-icon-sm"
            onClick={() => { setAdding(v => !v); setShowMenu(false); }}
            title="Add task"
            style={{ color: adding ? colors.accent : undefined, background: adding ? colors.light : undefined }}
          >
            <Plus size={16} />
          </button>
          <button
            className="btn btn-icon-sm"
            onClick={() => setShowMenu(v => !v)}
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              className="animate-slide-down"
              style={{
                position: 'absolute', right: 0, top: 44, zIndex: 50,
                background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-floating)',
                border: '1px solid var(--border)', padding: 6, minWidth: 180,
              }}
            >
              <button
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 12px', fontSize: 13, color: '#ff3b30', borderRadius: 8 }}
                onClick={() => { dispatch({ type: 'CLEAR_COLUMN', payload: { columnId: column.id } }); setShowMenu(false); }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={14} /> Clear all tasks
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Colored progress bar ────────────────────────── */}
      <div style={{ height: 2, background: 'var(--surface-tertiary)', margin: '0 16px 14px' }}>
        <div style={{
          height: 2, background: colors.accent, borderRadius: 99,
          width: `${column.tasks.length > 0 ? 100 : 0}%`,
          opacity: 0.5, transition: 'width 0.4s ease',
        }} />
      </div>

      {/* ── Task List ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: '0 12px', overflowY: 'auto',
          maxHeight: 'calc(100vh - 310px)',
        }}
      >
        {/* Add Task Form */}
        {adding && (
          <div
            className="animate-slide-down"
            style={{
              background: '#fff', borderRadius: 14, padding: 14,
              boxShadow: 'var(--shadow-md)', border: '1.5px solid var(--accent)',
            }}
          >
            <textarea
              autoFocus
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
              className="input"
              style={{ resize: 'none', marginBottom: 10, fontSize: 14 }}
              placeholder="What needs to be done?"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addTask(); }
                if (e.key === 'Escape') setAdding(false);
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <select className="input-select" value={priority} onChange={e => setPriority(e.target.value as Priority)} style={{ flex: 1 }}>
 <option value="low"> Low</option>
 <option value="medium"> Medium</option>
 <option value="high"> High</option>
              </select>
              <input
                className="input"
                style={{ flex: 1, padding: '10px 12px', fontSize: 13 }}
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Tags (comma-separated)"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" style={{ fontSize: 13, padding: '10px 16px' }} onClick={() => setAdding(false)}>
                <X size={14} /> Cancel
              </button>
              <button className="btn btn-primary" style={{ fontSize: 13, padding: '10px 16px' }} onClick={addTask}>
                <Check size={14} /> Add task
              </button>
            </div>
          </div>
        )}

        {/* Drop placeholder */}
        {isDragOver && column.tasks.length === 0 && (
          <div className="drop-placeholder">Drop here</div>
        )}

        {/* Task cards */}
        {column.tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={() => dispatch({ type: 'DELETE_TASK', payload: { taskId: task.id, columnId: column.id } })}
            onEdit={(c, pri, tgs) => dispatch({ type: 'EDIT_TASK', payload: { taskId: task.id, columnId: column.id, content: c, priority: pri, tags: tgs } })}
          />
        ))}

        {/* Empty state */}
        {column.tasks.length === 0 && !adding && !isDragOver && (
          <div style={{
            textAlign: 'center', padding: '28px 16px',
            border: '1.5px dashed var(--surface-tertiary)', borderRadius: 12,
            color: 'var(--text-tertiary)', fontSize: 13,
          }}>
 <div style={{ fontSize: 22, marginBottom: 6 }}></div>
            No tasks · drag here or
            <button
              className="btn"
              style={{ color: colors.accent, fontSize: 13, padding: '0 4px', fontWeight: 500 }}
              onClick={() => setAdding(true)}
            >
              add one
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom "Add task" button ─────────────────────── */}
      {!adding && column.tasks.length > 0 && (
        <button
          className="btn btn-ghost"
          onClick={() => setAdding(true)}
          style={{
            width: 'calc(100% - 24px)', margin: '10px 12px 14px',
            justifyContent: 'flex-start', fontSize: 13,
            border: '1.5px dashed var(--surface-tertiary)',
            borderRadius: 10, padding: '11px 14px', color: 'var(--text-tertiary)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; e.currentTarget.style.background = colors.light; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-tertiary)'; e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Plus size={15} /> Add task
        </button>
      )}
    </div>
  );
}
