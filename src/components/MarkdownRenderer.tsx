import React from 'react';
import MarkdownIt from 'markdown-it';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderMarkdown = () => {
    if (!content) return '';
    
    try {
      return md.render(content);
    } catch (error) {
      console.error('Markdown渲染失败:', error);
      return content; // 如果渲染失败，返回原始内容
    }
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown() }}
    />
  );
};

export default MarkdownRenderer;
