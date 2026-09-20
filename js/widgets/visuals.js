import { createComputerDiagram } from './computer-diagram.js';
import { createBaseTenBlocks } from './base-ten-blocks.js';

const REGISTRY = {
  'computer-diagram': createComputerDiagram,
  'base-ten-blocks': (container) => createBaseTenBlocks(container, 452),
};

export function renderVisual(key, container) {
  const factory = REGISTRY[key];
  if (factory) factory(container);
}
