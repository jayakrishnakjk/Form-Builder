import { computeExpression } from './formulaEngine';

const compare = (left, operator, right) => {
  switch (operator) {
    case '=':
    case '==':
      return left == right;
    case '===':
      return left === right;
    case '!=':
      return left != right;
    case '!==':
      return left !== right;
    case '>':
      return Number(left) > Number(right);
    case '>=':
      return Number(left) >= Number(right);
    case '<':
      return Number(left) < Number(right);
    case '<=':
      return Number(left) <= Number(right);
    case 'contains':
      return Array.isArray(left) ? left.includes(right) : String(left || '').includes(String(right));
    default:
      return false;
  }
};

export const evaluateConditions = (conditions = [], formData = {}) => {
  if (!conditions.length) {
    return true;
  }

  return conditions.every((condition) =>
    compare(formData[condition.leftOperand], condition.operator, condition.rightOperand),
  );
};

export const getRuntimeFieldState = (field, formData = {}) => {
  const runtimeState = {
    hidden: field.hidden || field.visible === false,
    disabled: field.disabled,
    required: field.required,
    defaultValue: field.defaultValue,
  };

  (field.conditionalLogic || []).forEach((rule) => {
    const match = evaluateConditions(rule.conditions || [], formData);
    if (!match) {
      return;
    }
    switch (rule.action) {
      case 'show':
        runtimeState.hidden = false;
        break;
      case 'hide':
        runtimeState.hidden = true;
        break;
      case 'enable':
        runtimeState.disabled = false;
        break;
      case 'disable':
        runtimeState.disabled = true;
        break;
      case 'require':
        runtimeState.required = true;
        break;
      case 'changeValue':
        runtimeState.defaultValue = rule.value;
        break;
      case 'calculate':
        runtimeState.defaultValue = computeExpression(rule.expression, formData);
        break;
      default:
        break;
    }
  });

  return runtimeState;
};

export const executeEventScript = (script, payload) => {
  if (!script) {
    return undefined;
  }
  try {
    const runner = new Function('payload', `${script}`);
    return runner(payload);
  } catch (error) {
    return error.message;
  }
};
