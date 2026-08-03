import { Node, mergeAttributes } from '@tiptap/core';

export type AudioBlockAttributes = {
  src: string;
  title?: string | null;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
};

export type AudioBlockOptions = {
  HTMLAttributes: Record<string, unknown>;
  controls: boolean;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (attributes: AudioBlockAttributes) => ReturnType;
      updateAudio: (attributes: Partial<AudioBlockAttributes>) => ReturnType;
    };
  }
}

function getAudioElement(element: HTMLElement) {
  return element.matches('audio') ? element : element.querySelector('audio');
}

function parseBooleanAttribute(element: HTMLElement | null, name: string) {
  return element?.hasAttribute(name) ?? false;
}

export const AudioBlock = Node.create<AudioBlockOptions>({
  name: 'audio',

  group: 'block',

  atom: true,

  selectable: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      controls: true,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => getAudioElement(element)?.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }

          return {
            src: attributes.src,
          };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => {
          return (
            element.getAttribute('data-title') ||
            getAudioElement(element)?.getAttribute('title')
          );
        },
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }

          return {
            title: attributes.title,
          };
        },
      },
      controls: {
        default: this.options.controls,
        parseHTML: (element) =>
          parseBooleanAttribute(getAudioElement(element), 'controls'),
        renderHTML: (attributes) =>
          attributes.controls ? { controls: '' } : {},
      },
      autoplay: {
        default: false,
        parseHTML: (element) =>
          parseBooleanAttribute(getAudioElement(element), 'autoplay'),
        renderHTML: (attributes) =>
          attributes.autoplay ? { autoplay: '' } : {},
      },
      loop: {
        default: false,
        parseHTML: (element) =>
          parseBooleanAttribute(getAudioElement(element), 'loop'),
        renderHTML: (attributes) => (attributes.loop ? { loop: '' } : {}),
      },
      muted: {
        default: false,
        parseHTML: (element) =>
          parseBooleanAttribute(getAudioElement(element), 'muted'),
        renderHTML: (attributes) => (attributes.muted ? { muted: '' } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-block-type="audio"]' }, { tag: 'audio[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { title, ...audioAttributes } = HTMLAttributes;

    return [
      'figure',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-block-type': 'audio',
        'data-title': title,
        class: 'audio-block',
      }),
      ['audio', audioAttributes],
    ];
  },

  addCommands() {
    return {
      setAudio:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
      updateAudio:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },
});
