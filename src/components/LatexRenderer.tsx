'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className }: LatexRendererProps) {
  // For inline math, we'll convert $...$ to proper math notation for remark-math
  const processedContent = content
    // Replace standalone dollar signs (not part of inline math) with text
    .replace(/\$([^$\n]+?)\$/g, (match, p1) => {
      // This is inline math: we'll prepare it for remark-math
      return `$${p1}$`;
    });

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

export default LatexRenderer; 