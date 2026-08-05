import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

const lineCountCache = new WeakMap<ProseMirrorNode, number>();

export function countLines(text: string): number {
  let count = 1;
  const len = text.length;

  for (let i = 0; i < len; i++) {
    if (text.charCodeAt(i) === 10) {
      count++;
    }
  }
  return count;
}

export function countNodeLines(node: ProseMirrorNode): number {
  const cachedLineCount = lineCountCache.get(node);

  if (cachedLineCount !== undefined) {
    return cachedLineCount;
  }

  const lineCount = countLines(node.textContent);
  lineCountCache.set(node, lineCount);
  return lineCount;
}

export function shouldUpdateCodeBlockView(
  oldNode: ProseMirrorNode,
  newNode: ProseMirrorNode
) {
  return (
    !oldNode.sameMarkup(newNode) ||
    countNodeLines(oldNode) !== countNodeLines(newNode)
  );
}
