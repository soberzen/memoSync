import { Node, mergeAttributes } from '@tiptap/core';

export const Paragraph = Node.create({
  name: 'paragraph',
  content: 'inline*',
  group: 'block',
  parseHTML() {
    return [{ tag: 'p' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(HTMLAttributes, {
        'data-block-type': 'text',
        class: 'paragraph',
      }),
      0,
    ];
  },
});
