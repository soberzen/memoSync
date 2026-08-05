import { memo, useCallback, useMemo, useState } from 'react';
import {
  NodeViewContent,
  type NodeViewProps,
  NodeViewWrapper,
} from '@tiptap/react';

import { CodeBlockActions } from './code-block-actions';
import { CodeBlockLanguagePicker } from './code-block-language-picker';
import { countNodeLines } from '../utils/countLines';

import type { CodeBlockOptions } from '..';

interface LineNumberGutterProps {
  lineCount: number;
}

const LineNumberGutter = memo(({ lineCount }: LineNumberGutterProps) => (
  <div
    aria-hidden="true"
    className="w-12 shrink-0 select-none py-2 pr-3 text-right font-mono text-sm leading-6 text-muted-foreground/70"
    contentEditable={false}
  >
    {Array.from({ length: lineCount }, (_, index) => (
      <span key={index} className="block h-6 tabular-nums">
        {index + 1}
      </span>
    ))}
  </div>
));

LineNumberGutter.displayName = 'LineNumberGutter';

const CodeBlockViewComponent = (props: NodeViewProps) => {
  const { editor, extension, getPos, node, updateAttributes } = props;
  const options = extension.options as CodeBlockOptions;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const lineCount = useMemo(() => countNodeLines(node), [node]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((previous) => !previous);
  }, []);

  const handleLanguageSelect = useCallback(
    (language: string) => {
      updateAttributes({ language });
    },
    [updateAttributes]
  );

  const handleCopy = useCallback(() => {
    const position = getPos();

    if (typeof position !== 'number') {
      return;
    }

    const content = editor.state.doc.nodeAt(position)?.textContent ?? '';
    void navigator.clipboard.writeText(content);
  }, [editor, getPos]);

  return (
    <NodeViewWrapper className="w-full" data-block-type="code">
      <div className="w-full overflow-hidden rounded-[12px] border border-border bg-card text-card-foreground">
        <div className="flex h-9 w-full items-center justify-between bg-muted/60 px-3 text-muted-foreground">
          {/* 语言选择器 */}
          <CodeBlockLanguagePicker
            defaultLanguage={options.defaultLanguage}
            language={node.attrs.language}
            supportedLanguages={options.supportedLanguages}
            onLanguageSelect={handleLanguageSelect}
          />
          {/* 操作组 */}
          <CodeBlockActions
            isCollapsed={isCollapsed}
            onCopy={handleCopy}
            onToggleCollapse={toggleCollapse}
          />
        </div>

        <div
          aria-hidden={isCollapsed}
          className={`grid border-t border-border/60 transition-[grid-template-rows] duration-200 ease-in-out ${
            isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
          }`}
        >
          <div className="overflow-hidden bg-muted/20">
            <div className="flex min-w-0">
              <LineNumberGutter lineCount={lineCount} />

              <div className="min-w-0 flex-1 overflow-x-auto">
                <NodeViewContent
                  className="min-h-28 min-w-max py-2 pr-6 font-mono text-sm leading-6 text-foreground outline-none"
                  spellCheck={false}
                  style={{ whiteSpace: 'pre' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const CodeBlockView = memo(CodeBlockViewComponent);

CodeBlockView.displayName = 'CodeBlockView';
