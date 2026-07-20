export const computeExpression = (expression, context) => {
  if (!expression) {
    return undefined;
  }

  try {
    const executor = new Function(
      'formData',
      'helpers',
      `return (${expression});`,
    );

    return executor(context, {
      today: () => new Date(),
      percent: (part, total) => (total ? (part / total) * 100 : 0),
      bmi: (weightKg, heightM) => (heightM ? weightKg / (heightM * heightM) : 0),
    });
  } catch (error) {
    return undefined;
  }
};

export const applyFormulas = (fields = [], formData = {}) => {
  const nextData = { ...formData };

  fields.forEach((field) => {
    if (field.formula && field.objectKey) {
      const calculated = computeExpression(field.formula, nextData);
      if (calculated !== undefined) {
        nextData[field.objectKey] = calculated;
      }
    }
  });

  return nextData;
};
