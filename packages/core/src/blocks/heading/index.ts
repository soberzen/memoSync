import { Node, mergeAttributes, textblockTypeInputRule } from '@tiptap/core';

export interface HeadingOptions {
  levels?: number[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    heading: {
      toggleHeading: (options: { level: number }) => ReturnType;
    };
  }
}
export const Heading = Node.create<HeadingOptions>({
  name: 'heading',
  content: 'inline*',
  group: 'block',

  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
    };
  },
  addAttributes() {
    return {
      level: {
        default: 1,
        parseHTML: (element) => {
          const level = element.getAttribute('data-level');
          if (!level) {
            return null;
          }
          return Number(level);
        },
        renderHTML: (attributes) => ({
          'data-level': attributes.level,
        }),
      },
    };
  },

  addCommands() {
    return {
      toggleHeading:
        (options) =>
        ({ commands, editor }) => {
          if (editor.isActive('heading', options)) {
            return commands.setNode('paragraph');
          }
          return commands.setNode('heading', options);
        },
    };
  },

  addInputRules() {
    if (!this.options.levels) return [];
    return this.options.levels.map((level) => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{${level}})\\s$`),
        type: this.type,
        getAttributes: {
          level,
        },
      });
    });
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-1': () => this.editor.commands.toggleHeading({ level: 1 }),
      'Mod-Alt-2': () => this.editor.commands.toggleHeading({ level: 2 }),
      'Mod-Alt-3': () => this.editor.commands.toggleHeading({ level: 3 }),
      'Mod-Alt-4': () => this.editor.commands.toggleHeading({ level: 4 }),
      'Mod-Alt-5': () => this.editor.commands.toggleHeading({ level: 5 }),
      'Mod-Alt-6': () => this.editor.commands.toggleHeading({ level: 6 }),
    };
  },

  parseHTML() {
    return [
      {
        tag: `div[data-block-type="${this.name}"]`,
        getAttrs: (element) => {
          if (typeof element === 'string') {
            return false;
          }
          return {
            level: element.getAttribute('data-level'),
          };
        },
      },
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      `h${node.attrs.level}`,
      mergeAttributes(HTMLAttributes, {
        'data-block-type': `heading${node.attrs.level}`,
        'data-level': node.attrs.level,
        class: `heading${node.attrs.level}-block`,
      }),
      0,
    ];
  },
});
