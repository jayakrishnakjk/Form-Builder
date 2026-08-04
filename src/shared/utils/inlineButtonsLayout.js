export const countDirectButtonFields = (container) =>
  (container?.children || []).filter((child) => child.type === 'button').length;

export const showInlineButtonsToggle = (container) => countDirectButtonFields(container) >= 2;

export const shouldInlineButtons = (container, inherited = false) =>
  Boolean(container?.metadata?.buttonsInline) || inherited;

export const groupChildrenForButtonLayout = (children = [], buttonsInline = false) => {
  if (!buttonsInline) {
    return children.map((child) => ({ kind: 'single', child }));
  }

  const buttonCount = children.filter((child) => child.type === 'button').length;
  if (buttonCount < 2) {
    return children.map((child) => ({ kind: 'single', child }));
  }

  const groups = [];
  let buttonBatch = [];

  const flushButtons = () => {
    if (buttonBatch.length === 0) {
      return;
    }
    if (buttonBatch.length === 1) {
      groups.push({ kind: 'single', child: buttonBatch[0] });
    } else {
      groups.push({ kind: 'buttons', children: [...buttonBatch] });
    }
    buttonBatch = [];
  };

  children.forEach((child) => {
    if (child.type === 'button') {
      buttonBatch.push(child);
    } else {
      flushButtons();
      groups.push({ kind: 'single', child });
    }
  });

  flushButtons();
  return groups;
};
