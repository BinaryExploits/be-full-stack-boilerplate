export const requireTransactional = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Warn if a service class is missing @Transactional decorator',
      recommended: 'warn',
    },
    messages: {
      missingClassTransactional:
        "Service class '{{name}}' is missing @Transactional decorator.",
    },
    schema: [],
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const className = node.id?.name || '';
        // Only check classes ending with 'Service'
        if (!className.endsWith('Service')) return;

        const decorators = node.decorators || [];
        const hasTransactional = decorators.some(
          (d) =>
            d.expression?.callee?.name === 'Transactional' ||
            d.expression?.name === 'Transactional',
        );

        if (!hasTransactional) {
          context.report({
            node,
            messageId: 'missingClassTransactional',
            data: { name: className },
          });
        }
      },
    };
  },
};
