import { createId, cloneDeep } from './tree';

export const MASTER_FORM_REF_TYPE = 'masterFormRef';

export const isMasterFormRef = (node) => node?.type === MASTER_FORM_REF_TYPE;

export const createMasterFormRefNode = (master) => ({
  id: createId('masterformref'),
  type: MASTER_FORM_REF_TYPE,
  label: master.name,
  objectKey: '',
  metadata: {
    masterFormId: master.id,
    masterFormName: master.name,
  },
  children: [],
});

export const resolveLayoutWithMasterForms = (nodes = [], masterForms = []) => {
  if (!Array.isArray(nodes)) {
    return [];
  }

  return nodes.flatMap((node) => {
    if (isMasterFormRef(node)) {
      const master = masterForms.find((item) => item.id === node.metadata?.masterFormId);
      if (!master?.children?.length) {
        return [];
      }
      return resolveLayoutWithMasterForms(cloneDeep(master.children), masterForms);
    }

    if (Array.isArray(node.children) && node.children.length) {
      return [
        {
          ...node,
          children: resolveLayoutWithMasterForms(node.children, masterForms),
        },
      ];
    }

    return [node];
  });
};

export const getMasterFormById = (masterForms, masterFormId) =>
  masterForms.find((item) => item.id === masterFormId) || null;
