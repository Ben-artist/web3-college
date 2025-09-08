import MarkdownIt from "markdown-it";
import type React from "react";
import { useEffect, useRef } from "react";

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
	content,
	className = "",
}) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || !content) return;

		// 初始化 markdown-it
		const md = new MarkdownIt({
			html: true,
			linkify: true,
			typographer: true,
		});

		// 渲染 Markdown 为 HTML
		const html = md.render(content);
		containerRef.current.innerHTML = html;
	}, [content]);

	return (
		<div
			ref={containerRef}
			className={`prose prose-lg max-w-none ${className}`}
			style={{
				// 自定义样式
				lineHeight: "1.6",
			}}
		/>
	);
};
