export const resolveButtonAction = (field) => {
  const configured = field?.metadata?.buttonAction;
  if (configured === 'submit' || configured === 'reset') {
    return configured;
  }

  const label = (field?.label || '').trim().toLowerCase();
  if (label === 'submit') {
    return 'submit';
  }
  if (label === 'clear' || label === 'reset') {
    return 'reset';
  }

  return configured || 'button';
};
