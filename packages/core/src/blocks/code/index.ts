import {
  Node,
  mergeAttributes,
  textblockTypeInputRule,
  isTextSelection,
} from '@tiptap/core';

import {
  defaultSupportedLanguages,
  SupportedLanguageConfig,
} from './supportedLanguages';

export type CodeNodeOptions = {
  defaultLanguage: string;
  indentLineWithTab: boolean; // 是否支持 tab 缩进
  supportedLanguages: SupportedLanguageConfig[];
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeBlock: {
      setCodeBlock: (attributes?: { language?: string }) => ReturnType;
      toggleCodeBlock: (attributes?: { language?: string }) => ReturnType;
    };
  }
}

function normalizeLanguage(
  language: string | null | undefined,
  supportedLanguages: SupportedLanguageConfig[],
  defaultLanguage: string
) {
  if (!language) {
    return defaultLanguage;
  }

  const matchedLanguage = supportedLanguages.find((item) => {
    return item.match.includes(language) || item.id === language;
  });

  return matchedLanguage?.id ?? defaultLanguage;
}

export const CodeBlock = Node.create({
  name: 'codeBlock',
  content: 'inline*',
  group: 'block',
  code: true,
  defining: true,

  addOptions() {
    return {
      defaultLanguage: 'javascript',
      indentLineWithTab: true,
      supportedLanguages: defaultSupportedLanguages,
    };
  },

  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) => {
          const codeElement = element.querySelector('code');
          const language =
            element.getAttribute('data-language') ||
            codeElement?.getAttribute('data-language') ||
            codeElement?.className.replace(/^language-/, '');

          return normalizeLanguage(
            language,
            this.options.supportedLanguages,
            this.options.defaultLanguage
          );
        },
        renderHTML(attributes) {
          if (!attributes.language) return {};
          return { 'data-language': attributes.language };
        },
      },
    };
  },
  parseHTML() {
    return [
      { tag: 'div[data-block-type=code]' },
      { tag: 'pre', preserveWhitespace: 'full' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const language = normalizeLanguage(
      node.attrs.language,
      this.options.supportedLanguages,
      this.options.defaultLanguage
    );
    return [
      'pre',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'code',
        'data-language': language,
        class: 'code-block',
      }),
      [
        'code',
        {
          class: `language-${language}`,
        },
        0,
      ],
    ];
  },
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^```([a-zA-Z0-9_+#.-]+)?\s$/,
        type: this.type,
        getAttributes: (match) => {
          return {
            language: normalizeLanguage(
              match[1],
              this.options.supportedLanguages,
              this.options.defaultLanguage
            ),
          };
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (!this.options.indentLineWithTab) {
          return false;
        }
        if (editor.isActive(this.name)) {
          editor.commands.insertContent('  ');
          return true;
        }
        return false;
      },
      Enter: ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }
        const { $from } = editor.state.selection;
        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
        const endsWithDoubleNewline = $from.parent.textContent.endsWith('\n\n');
        if (!isAtEnd || !endsWithDoubleNewline) {
          editor.commands.insertContent('\n');
          return true;
        }
        return editor
          .chain()
          .command(({ tr }) => {
            tr.delete($from.pos - 2, $from.pos);
            return true;
          })
          .exitCode()
          .run();
      },
      'Shift-Enter': ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }
        const { $from } = editor.state.selection;
        editor
          .chain()
          .insertContentAt(
            $from.pos - $from.parentOffset + $from.parent.nodeSize,
            {
              type: 'paragraph',
            }
          )
          .run();
        return true;
      },
      Delete: ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;

        if (
          editor.isActive(this.name) &&
          !$from.parent.textContent &&
          isTextSelection(selection)
        ) {
          const from = $from.pos - $from.parentOffset - 2;
          editor.chain().setNodeSelection(from).deleteSelection().run();
          return true;
        }
        return false;
      },
    };
  },

  addCommands() {
    return {
      setCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, {
            language: normalizeLanguage(
              attributes?.language,
              this.options.supportedLanguages,
              this.options.defaultLanguage
            ),
          });
        },
      toggleCodeBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', {
            language: normalizeLanguage(
              attributes?.language,
              this.options.supportedLanguages,
              this.options.defaultLanguage
            ),
          });
        },
    };
  },
});
