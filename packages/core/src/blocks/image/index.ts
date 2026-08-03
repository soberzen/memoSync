import { mergeAttributes, Node } from '@tiptap/core';

export type ImageBlockAttributes = {
  src: string;
  alt?: string | null;
  title?: string | null;
  width?: number | string | null;
  height?: number | string | null;
  align?: 'left' | 'center' | 'right';
  caption?: string | null;
};

export type ImageBlockOptions = {
  HTMLAttributes: Record<string, unknown>;
  defaultAlign: 'left' | 'center' | 'right';
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (attributes: ImageBlockAttributes) => ReturnType;
      updateImage: (attributes: Partial<ImageBlockAttributes>) => ReturnType;
    };
  }
}

function getImageElement(element: HTMLElement) {
  return element.matches('img') ? element : element.querySelector('img');
}

export const ImageBlock = Node.create<ImageBlockOptions>({
  name: 'image',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,
  addOptions() {
    return {
      HTMLAttributes: {},
      defaultAlign: 'center',
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.src) return {};
          return {
            src: attributes.src,
          };
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => getImageElement(element)?.getAttribute('alt'),
        renderHTML: (attributes) => {
          if (!attributes.alt) return {};
          return { alt: attributes.alt };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => getImageElement(element)?.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { title: attributes.title };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => getImageElement(element)?.getAttribute('width'),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) =>
          getImageElement(element)?.getAttribute('height'),
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      align: {
        default: this.options.defaultAlign,
        parseHTML: (element) => {
          return (
            element.getAttribute('data-align') || this.options.defaultAlign
          );
        },
        renderHTML: (attributes) => {
          return {
            'data-align': attributes.align,
          };
        },
      },
      caption: {
        default: null,
        parseHTML: (element) => {
          return (
            element.getAttribute('data-caption') ||
            element.querySelector('figcaption')?.textContent
          );
        },
        renderHTML: () => {
          return {};
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: 'figure[data-block-type="image"]' }, { tag: 'img' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, align, ...imageAttributes } = HTMLAttributes;
    return [
      'figure',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-block-type': 'image',
        'data-align': align,
        'data-caption': caption,
        class: 'image-block',
      }),
      ['img', imageAttributes],
      ...(caption ? [['figcaption', {}, caption]] : []),
    ];
  },

  addCommands() {
    return {
      setImage:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },

      updateImage:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});
