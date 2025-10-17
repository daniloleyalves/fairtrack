interface HtmlContentRendererProps {
  content: string;
  className?: string;
}

export function HtmlContentRenderer({
  content,
  className = '',
}: HtmlContentRendererProps) {
  return (
    <div
      className={`prose prose-sm prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 [&_li]:!font-normal [&_ol]:!ml-0 [&_ol]:!list-decimal [&_ol]:!pl-6 [&_ul]:!ml-0 [&_ul]:!list-none [&_ul]:!pl-4 [&_ul>li]:!relative [&_ul>li]:before:absolute [&_ul>li]:before:-left-4 [&_ul>li]:before:text-tertiary [&_ul>li]:before:content-['■'] ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
