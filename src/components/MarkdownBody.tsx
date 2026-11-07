import ReactMarkdown, { type Components } from 'react-markdown';

function safeUrl(url: string): string {
  return url.startsWith('https://') || url.startsWith('#') ? url : '';
}

const components: Components = {
  h1: ({ children }) => <h3>{children}</h3>,
  h2: ({ children }) => <h4>{children}</h4>,
  h3: ({ children }) => <h5>{children}</h5>,
  h4: ({ children }) => <h6>{children}</h6>,
  h5: ({ children }) => <h6>{children}</h6>,
  h6: ({ children }) => <h6>{children}</h6>,
  a: ({ href, children }) => <a href={href || undefined} rel={href?.startsWith('https://') ? 'noopener noreferrer' : undefined}>{children}</a>,
  img: ({ alt }) => <span>{alt}</span>,
};

export function MarkdownBody({ body }: { body: string }) {
  return <div className="markdown-body"><ReactMarkdown urlTransform={safeUrl} components={components}>{body}</ReactMarkdown></div>;
}
