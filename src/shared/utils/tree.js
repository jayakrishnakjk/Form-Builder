export const createId = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const cloneDeep = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

export const titleCase = (text = '') =>
  text
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const flattenFields = (children = []) =>
  children.flatMap((node) => [node, ...(node.children ? flattenFields(node.children) : [])]);

export const traverseTree = (nodes = [], callback) =>
  nodes.map((node, index) => {
    const next = callback(node, index) || node;
    if (next.children) {
      return {
        ...next,
        children: traverseTree(next.children, callback),
      };
    }
    return next;
  });

export const mapNodes = (nodes = [], mapper) =>
  nodes.map((node, index) => ({
    ...mapper(node, index),
    ...(node.children ? { children: mapNodes(node.children, mapper) } : {}),
  }));

export const findNode = (nodes = [], id, parentId = 'root') => {
  for (const node of nodes) {
    if (node.id === id) {
      return { node, parentId };
    }
    if (node.children?.length) {
      const match = findNode(node.children, id, node.id);
      if (match) {
        return match;
      }
    }
  }
  return null;
};

export const updateNodeById = (nodes = [], id, updater) =>
  nodes.map((node) => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeById(node.children, id, updater),
      };
    }
    return node;
  });

export const removeNodeById = (nodes = [], id) =>
  nodes
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      ...(node.children ? { children: removeNodeById(node.children, id) } : {}),
    }));

export const duplicateNodeById = (nodes = [], id, cloneFactory) =>
  nodes.flatMap((node) => {
    if (node.id === id) {
      const clone = cloneFactory(node);
      return [node, clone];
    }
    if (node.children) {
      return [
        {
          ...node,
          children: duplicateNodeById(node.children, id, cloneFactory),
        },
      ];
    }
    return [node];
  });

export const moveNodeInSiblings = (nodes = [], id, direction) => {
  const index = nodes.findIndex((node) => node.id === id);
  if (index >= 0) {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= nodes.length) {
      return nodes;
    }
    const next = [...nodes];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  }

  return nodes.map((node) => ({
    ...node,
    ...(node.children ? { children: moveNodeInSiblings(node.children, id, direction) } : {}),
  }));
};

export const appendNodeToParent = (nodes = [], parentId, newNode) => {
  if (parentId === 'root') {
    return [...nodes, newNode];
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }
    if (node.children) {
      return {
        ...node,
        children: appendNodeToParent(node.children, parentId, newNode),
      };
    }
    return node;
  });
};

export const insertNodeToParentAtIndex = (nodes = [], parentId, newNode, index = 0) => {
  if (parentId === 'root') {
    const next = [...nodes];
    next.splice(Math.max(0, index), 0, newNode);
    return next;
  }

  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = [...(node.children || [])];
      children.splice(Math.max(0, Math.min(index, children.length)), 0, newNode);
      return {
        ...node,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: insertNodeToParentAtIndex(node.children, parentId, newNode, index),
      };
    }
    return node;
  });
};

export const extractNodeById = (nodes = [], id) => {
  let removedNode = null;

  const nextTree = nodes
    .filter((node) => {
      if (node.id === id) {
        removedNode = node;
        return false;
      }
      return true;
    })
    .map((node) => {
      if (node.children?.length) {
        const result = extractNodeById(node.children, id);
        if (result.removedNode) {
          removedNode = result.removedNode;
          return {
            ...node,
            children: result.tree,
          };
        }
      }
      return node;
    });

  return { tree: nextTree, removedNode };
};
