export const requireTransactional = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Warn if a service method is missing @Transactional decorator',
      recommended: 'warn',
    },
    messages: {
      missingTransactional:
        "Service method '{{name}}' is missing @Transactional decorator.",
    },
    schema: [],
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        const className = node.id?.name || '';
        if (!className.endsWith('Service')) return;

        for (const method of node.body.body) {
          // Only process methods (ignore constructors or properties)
          if (
            method.type !== 'MethodDefinition' &&
            method.type !== 'TSMethodDefinition'
          )
            continue;

          // Ignore constructors
          if (method.kind === 'constructor') continue;

          // Ignore methods already decorated with @Transactional
          const decorators = method.decorators || [];
          const hasTransactional = decorators.some(
            (d) =>
              d.expression?.callee?.name === 'Transactional' ||
              d.expression?.name === 'Transactional',
          );

          if (!hasTransactional) {
            const methodName = method.key?.name || '<unknown>';
            context.report({
              node: method,
              messageId: 'missingTransactional',
              data: { name: methodName },
            });
          }
        }
      },
    };
  },
};
