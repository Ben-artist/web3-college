import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Bold, Italic, Heading1, List, Link, Code, Quote, Image } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "输入Markdown内容...",
  className = ""
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // 插入Markdown语法
  const insertMarkdown = (prefix: string, suffix: string = "", placeholder: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let newText = prefix + selectedText + suffix;
    if (selectedText === "" && placeholder) {
      newText = prefix + placeholder + suffix;
    }
    
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    onChange(newValue);
    
    // 设置光标位置
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = start + (selectedText === "" ? prefix.length + placeholder.length : prefix.length);
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  };

  // 工具栏按钮配置
  const toolbarButtons = [
    {
      icon: <Bold className="h-4 w-4" />,
      tooltip: "粗体",
      action: () => insertMarkdown("**", "**", "粗体文本")
    },
    {
      icon: <Italic className="h-4 w-4" />,
      tooltip: "斜体",
      action: () => insertMarkdown("*", "*", "斜体文本")
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      tooltip: "标题",
      action: () => insertMarkdown("# ", "", "标题")
    },
    {
      icon: <List className="h-4 w-4" />,
      tooltip: "列表",
      action: () => insertMarkdown("- ", "", "列表项")
    },
    {
      icon: <Link className="h-4 w-4" />,
      tooltip: "链接",
      action: () => insertMarkdown("[", "](https://example.com)", "链接文本")
    },
    {
      icon: <Code className="h-4 w-4" />,
      tooltip: "代码",
      action: () => insertMarkdown("`", "`", "代码")
    },
    {
      icon: <Quote className="h-4 w-4" />,
      tooltip: "引用",
      action: () => insertMarkdown("> ", "", "引用文本")
    },
    {
      icon: <Image className="h-4 w-4" />,
      tooltip: "图片",
      action: () => insertMarkdown("![", "](https://example.com/image.jpg)", "图片描述")
    }
  ];

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setIsTyping(true);
    
    // 延迟重置输入状态，用于优化性能
    clearTimeout((window as any).typingTimer);
    (window as any).typingTimer = setTimeout(() => {
      setIsTyping(false);
    }, 300);
  };

  // 处理键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+B: 粗体
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      insertMarkdown("**", "**", "粗体文本");
    }
    // Ctrl+I: 斜体
    else if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      insertMarkdown("*", "*", "斜体文本");
    }
    // Ctrl+K: 链接
    else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      insertMarkdown("[", "](https://example.com)", "链接文本");
    }
    // Tab: 缩进
    else if (e.key === 'Tab') {
      e.preventDefault();
      insertMarkdown("    ", "", "");
    }
  };

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(300, textarea.scrollHeight) + 'px';
    }
  }, [value]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="outline"
            size="sm"
            onClick={button.action}
            className="h-8 w-8 p-0 flex items-center justify-center"
            title={button.tooltip}
          >
            {button.icon}
          </Button>
        ))}
        

      </div>

      {/* 编辑器和预览区域 */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* 编辑器 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">编辑区域</label>
            {isTyping && (
              <span className="text-xs text-muted-foreground animate-pulse">
                正在输入...
              </span>
            )}
          </div>
          
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full min-h-[300px] p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              style={{ 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                lineHeight: '1.6'
              }}
            />
            
            {/* 字符计数 */}
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-white px-2 py-1 rounded">
              {value.length} 字符
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            支持Markdown语法 • 快捷键: Ctrl+B(粗体) • Ctrl+I(斜体) • Ctrl+K(链接) • Tab(缩进)
          </p>
        </div>

        {/* 实时预览 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">实时预览</label>
              <div className="text-xs text-muted-foreground">
                {value.length} 字符
              </div>
            </div>
            
            <div className="border rounded-lg p-4 min-h-[300px] bg-gray-50 overflow-y-auto">
              {value ? (
                <div className="prose prose-sm max-w-none">
                  <MarkdownRenderer content={value} />
                </div>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p>在这里输入内容，右侧将实时显示预览效果</p>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
