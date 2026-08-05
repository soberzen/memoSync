import { mergeAttributes, type Range } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { Image as TiptapImage } from '@tiptap/extension-image';

export type ImageBlockAlign = 'left' | 'center' | 'right';

export interface ImageBlockAttributes {
  src: string;
  alt?: string | null;
  title?: string | null;
  width?: number | null;
  align?: ImageBlockAlign;
  caption?: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: ImageBlockAttributes) => ReturnType;
      setImageBlockAt: (
        attributes: ImageBlockAttributes & {
          pos: number | Range;
        }
      ) => ReturnType;
      updateImageBlock: (
        attributes: Partial<ImageBlockAttributes>
      ) => ReturnType;
      setImageBlockAlign: (align: ImageBlockAlign) => ReturnType;
      setImageBlockCaption: (caption: string | null) => ReturnType;
      setImageBlockWidth: (width: number) => ReturnType;
      deleteImageBlock: () => ReturnType;
    };
  }
}

function getImageElement(element: HTMLElement) {
  return element.matches('img') ? element : element.querySelector('img');
}

function getImageDimension(
  element: HTMLElement,
  attribute: 'height' | 'width'
): number | null {
  const value = getImageElement(element)?.getAttribute(attribute);

  if (!value) {
    return null;
  }

  const dimension = Number(value);
  return Number.isFinite(dimension) && dimension > 0 ? dimension : null;
}

export const ImageBlock = TiptapImage.extend({
  name: 'imageBlock',

  group: 'block',

  inline: false,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => getImageElement(element)?.getAttribute('src'),
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
        parseHTML: (element) => getImageDimension(element, 'width'),
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => getImageDimension(element, 'height'),
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return { height: attributes.height };
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: () => ({}),
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
    return [
      { tag: 'figure[data-block-type="image"]' },
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const caption = node.attrs.caption as string | null;

    return [
      'figure',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-block-type': 'image',
        'data-align': node.attrs.align,
      }),
      ['img', HTMLAttributes],
      ...(caption ? [['figcaption', {}, caption]] : []),
    ];
  },

  addCommands() {
    return {
      ...this.parent?.(),

      setImageBlock:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: attributes,
          }),

      setImageBlockAt:
        ({ pos, ...attributes }) =>
        ({ commands }) =>
          commands.insertContentAt(pos, {
            type: this.name,
            attrs: attributes,
          }),
      updateImageBlock:
        (attributes) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attributes),

      setImageBlockAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { align }),

      setImageBlockCaption:
        (caption) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, {
            caption: caption?.trim() || null,
          }),

      setImageBlockWidth:
        (width) =>
        ({ commands }) => {
          if (!Number.isFinite(width) || width <= 0) {
            return false;
          }
          return commands.updateAttributes(this.name, {
            width: Math.round(width),
            height: null,
          });
        },

      deleteImageBlock:
        () =>
        ({ state, commands }) => {
          const { selection } = state;
          if (
            !(selection instanceof NodeSelection) ||
            selection.node.type.name !== this.name
          ) {
            return false;
          }
          return commands.deleteSelection();
        },
    };
  },
});
