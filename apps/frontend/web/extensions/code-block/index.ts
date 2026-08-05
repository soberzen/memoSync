import { ReactNodeViewRenderer } from '@tiptap/react';
import {
  CodeBlock as TiptapCodeBlock,
  type CodeBlockOptions as TiptapCodeBlockOptions,
} from '@tiptap/extension-code-block';
import { CodeBlockView } from './component/code-block-view';
import {
  defaultSupportedLanguages,
  type SupportedLanguageConfig,
} from './utils/supportedLanguages';
import { shouldUpdateCodeBlockView } from './utils/countLines';

export type CodeBlockOptions = TiptapCodeBlockOptions & {
  supportedLanguages: SupportedLanguageConfig[];
};

export const CodeBlock = TiptapCodeBlock.extend<CodeBlockOptions>({
  addOptions() {
    const parentOptions = this.parent?.() ?? TiptapCodeBlock.options;
    return {
      ...parentOptions,
      defaultLanguage: 'javascript',
      HTMLAttributes: { 'data-code-block': 'code', class: 'code-block' },
      supportedLanguages: defaultSupportedLanguages,
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView, {
      update({ oldNode, newNode, updateProps }) {
        if (shouldUpdateCodeBlockView(oldNode, newNode)) {
          updateProps();
        }
        return true;
      },
    });
  },
});
