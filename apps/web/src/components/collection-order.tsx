'use client';

// 컬렉션 순서 편집. 행을 끌어다 놓거나(HTML5 drag and drop) ↑↓ 버튼으로 옮기면 즉시
// 화면에 반영하고 서버 액션으로 저장한다. 실패하면 직전 순서로 되돌린다. 저장 후
// router.refresh() 로 아래 편집 폼 목록도 새 순서로 다시 그린다.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { reorderCollections } from '@/app/admin/actions';

type Item = { id: string; title: string };
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function move(items: Item[], from: number, to: number): Item[] {
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function CollectionOrder({ collections }: { collections: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(collections);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [state, setState] = useState<SaveState>('idle');

  // 서버에서 목록이 바뀌어 내려오면(추가·삭제·이름 변경) 그 목록을 따른다.
  const [seen, setSeen] = useState(collections);
  if (seen !== collections) {
    setSeen(collections);
    setItems(collections);
  }

  async function apply(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const previous = items;
    const next = move(items, from, to);
    setItems(next);
    setState('saving');
    const ok = await reorderCollections(next.map((item) => item.id));
    if (ok) {
      setState('saved');
      router.refresh();
    } else {
      setItems(previous);
      setState('error');
    }
  }

  if (items.length < 2) return null;

  const text =
    state === 'saving'
      ? 'Saving…'
      : state === 'saved'
        ? 'Saved'
        : state === 'error'
          ? 'Could not save the order'
          : '';

  return (
    <section aria-label="Order" className="mt-10">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted">Order · drag to reorder</p>
        <span
          className={`text-sm ${state === 'error' ? 'text-red-600' : 'text-muted'}`}
          aria-live="polite"
        >
          {text}
        </span>
      </div>

      <ol className="mt-2 flex flex-col divide-y divide-border border-y border-border">
        {items.map((item, i) => (
          <li
            key={item.id}
            draggable
            onDragStart={(e) => {
              setDragging(i);
              e.dataTransfer.effectAllowed = 'move';
              // Firefox 는 setData 가 있어야 드래그를 시작한다.
              e.dataTransfer.setData('text/plain', item.id);
            }}
            onDragOver={(e) => {
              if (dragging === null) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (over !== i) setOver(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragging;
              setDragging(null);
              setOver(null);
              if (from !== null) void apply(from, i);
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            className={`flex cursor-grab items-center justify-between gap-3 py-2 ${
              dragging === i ? 'opacity-40' : ''
            } ${over === i && dragging !== i ? 'bg-subtle' : ''}`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span aria-hidden className="select-none text-muted">
                ⠿
              </span>
              <span className="truncate">{item.title}</span>
            </span>
            <span className="flex shrink-0 gap-1 text-sm">
              <button
                type="button"
                aria-label={`Move ${item.title} up`}
                disabled={i === 0 || state === 'saving'}
                onClick={() => void apply(i, i - 1)}
                className="rounded-md px-2 py-0.5 text-muted hover:bg-subtle hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${item.title} down`}
                disabled={i === items.length - 1 || state === 'saving'}
                onClick={() => void apply(i, i + 1)}
                className="rounded-md px-2 py-0.5 text-muted hover:bg-subtle hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
