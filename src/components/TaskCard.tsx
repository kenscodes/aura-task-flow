import { useState, useRef } from 'react';
import { Trash2, Pencil, Flag, Check, X, GripVertical, Tag as TagIcon } from 'lucide-react';
import type { Task, Priority } from '../types';

interface Props {
  task: Task;
  onDelete: () => void;
  onEdit: (content: string, priority: Priority, tags: string[]) => void;
}

const PRIORITY: Record<Priority, { label: string; dot: string; badge: string; text: string }> = {
  low:    { label: 'Low',    dot: '#34c759', badge: '#f0fdf4', text: '#16a34a' },
  medium: { label: 'Medium', dot: '#ff9f0a', badge: '#fefce8', text: '#b45309' },
  high:   { label: 'High',   dot: '#ff3b30', badge: '#fff1f2', text: '#e11d48' },
};

export default function TaskCard({ task, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]         = useState(task.content);
  const [draftPri, setDraftPri]   = useState<Priority>(task.priority);
  const [draftTags, setDraftTags] = useState(task.tags.join(', '));
  const [hover, setHover] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const p = PRIORITY[task.priority];

  const save = () => {
    if (!draft.trim()) return;
    onEdit(draft.trim(), draftPri, draftTags.split(',').map(t => t.trim()).filter(Boolean));
    setEditing(false);
  };

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromColumn', task.columnId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => dragRef.current?.classList.add('task-dragging'), 0);
  };
  const onDragEnd = () => dragRef.current?.classList.remove('task-dragging');

  if (editing) {
    return (
      <div
        className="animate-slide-down"
        style={{
          background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow-lg)',
          border: '2px solid #5b5ef4',
        }}
      >
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          className="input"
          style={{ resize: 'none', marginBottom: 10, fontSize: 14 }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } if (e.key === 'Escape') setEditing(false); }}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <select className="input-select" value={draftPri} onChange={e => setDraftPri(e.target.value as Priority)} style={{ flex: 1 }}>
 <option value="low"> Low priority</option>
 <option value="medium"> Medium priority</option>
 <option value="high"> High priority</option>
          </select>
          <input
            className="input"
            style={{ flex: 1, padding: '10px 12px', fontSize: 13 }}
            value={draftTags}
            onChange={e => setDraftTags(e.target.value)}
            placeholder="Tags (comma separated)"
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: '10px 16px' }} onClick={() => setEditing(false)}>
            <X size={14} /> Cancel
          </button>
          <button className="btn btn-primary" style={{ fontSize: 13, padding: '10px 16px' }} onClick={save}>
            <Check size={14} /> Save changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="card"
      style={{
        padding: '14px 16px',
        cursor: 'grab',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        border: `1px solid ${hover ? 'rgba(0,0,0,0.12)' : 'var(--border)'}`,
      }}
    >
      {/* Top row: grip + text */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <GripVertical
          size={16}
          style={{ color: hover ? '#aeaeb2' : '#d1d1d6', marginTop: 1, flexShrink: 0, transition: 'color 0.2s' }}
        />
        <p style={{ fontSize: 14, lineHeight: '1.55', color: 'var(--text-primary)', flex: 1, fontWeight: 400 }}>
          {task.content}
        </p>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10, paddingLeft: 26 }}>
          {task.tags.map(tag => (
            <span key={tag} className="tag" style={{ background: '#f5f5f7', color: '#6e6e73', border: '1px solid #e8e8ed' }}>
              <TagIcon size={9} /> {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: priority + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingLeft: 26 }}>
        <div
          className="tag"
          style={{ background: p.badge, color: p.text, border: 'none', fontWeight: 500 }}
        >
          <span className="priority-dot" style={{ background: p.dot }} />
          <Flag size={10} />
          {p.label}
        </div>

        {/* Action buttons — slide in on hover */}
        <div style={{
          display: 'flex', gap: 4,
          opacity: hover ? 1 : 0, transform: hover ? 'translateX(0)' : 'translateX(6px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}>
          <button className="btn btn-icon-sm" onClick={() => setEditing(true)} title="Edit task" style={{ color: '#5b5ef4' }}>
            <Pencil size={13} />
          </button>
          <button
            className="btn btn-icon-sm"
            onClick={onDelete}
            title="Delete task"
            style={{ color: '#ff3b30' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff1f2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
