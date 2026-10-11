'use client';

// 에디터의 태그 입력. 쉼표로 구분한 태그 이름을 한 필드(name)에 담아 폼과 자동저장이
// 그대로 읽게 하고, 기존 태그는 아래 배지로 보여 눌러서 켜고 끌 수 있게 한다.
import { useState } from 'react';

const field = 'rounded-md border border-border bg-background px-3 py-2';

function parse(value: string): string[] {
  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export function TagInput({
  name = 'tags',
  defaultValue = [],
  suggestions = [],
  placeholder = 'Tags (comma-separated)',
}: {
  name?: string;
  defaultValue?: string[];
  suggestions?: string[];
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue.join(', '));
  const current = parse(value);

  function toggle(tag: string) {
    const next = current.some((t) => same(t, tag))
      ? current.filter((t) => !same(t, tag))
      : [...current, tag];
    setValue(next.join(', '));
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={field}
      />
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => {
            const on = current.some((t) => same(t, tag));
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(tag)}
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs hover:opacity-80 ${
                  on ? 'bg-strong text-strong-foreground' : 'bg-subtle text-muted'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
