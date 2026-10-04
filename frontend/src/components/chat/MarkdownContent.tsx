import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  isUser = false,
}) => {
  if (isUser) {
    return <p className="whitespace-pre-wrap leading-6">{content}</p>;
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-6 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-2 ml-4 list-disc space-y-1 text-card-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 list-decimal space-y-1 text-card-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <h1 className="my-3 text-lg font-bold tracking-tight text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="my-2.5 text-base font-bold tracking-tight text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="my-2 text-sm font-bold tracking-tight text-foreground">
              {children}
            </h3>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[12px] font-medium text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-2 overflow-x-auto rounded-lg bg-muted/80 p-3 font-mono text-xs">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-primary-500/50 pl-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/50 border-b border-border">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 font-semibold text-foreground">{children}</th>
          ),
          td: ({ children }) => <td className="px-3 py-2 text-card-foreground">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
