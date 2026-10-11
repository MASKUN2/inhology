'use client';

// 에디터의 태그 입력. 쉼표로 구분한 태그 이름을 한 필드(name)에 담아 폼과 자동저장이
// 그대로 읽게 하고, 기존 태그는 아래 배지로 보여 눌러서 켜고 끌 수 있게 한다.
import { useState } from 'react';
import { splitTags } from '@/lib/format';
import { field, pill } from '@/lib/styles';

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
  const current = splitTags(value);

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
                className={pill(on)}
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
