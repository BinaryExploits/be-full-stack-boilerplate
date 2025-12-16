export const requireTransaction = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Warn if a service class is missing @AutoTransaction decorator',
      recommended: 'warn',
    },
    messages: {
      missingClassAutoTransaction:
        "Service class '{{name}}' is missing @AutoTransaction decorator.",
    },
    schema: [],
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const className = node.id?.name || '';
        if (!className.endsWith('Service')) return;

        const decorators = node.decorators || [];
        const hasTransactional = decorators.some(
          (d) =>
            d.expression?.callee?.name === 'AutoTransaction' ||
            d.expression?.name === 'AutoTransaction',
        );

        if (!hasTransactional) {
          context.report({
            node,
            messageId: 'missingClassAutoTransaction',
            data: { name: className },
          });
        }
      },
    };
  },
};
