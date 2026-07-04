// 마크다운 렌더러 (공개 글 본문 + 에디터 미리보기 공용). 동일 렌더러라 미리보기 == 실제.
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
