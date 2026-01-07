/**
 * Custom ESLint Rule: no-duplicate-assignments
 *
 * Catches consecutive duplicate assignment statements to the same property.
 *
 * ❌ Bad:
 *   this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
 *   this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
 *
 * ✅ Good:
 *   this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
 *   this.emailInput = page.getByRole('textbox', { name: 'Email' });
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow consecutive duplicate assignment statements',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null, // No auto-fix - must be fixed manually
    schema: [],
    messages: {
      duplicateAssignment: 'Duplicate assignment to "{{property}}". This line is identical to the previous assignment.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode ? context.getSourceCode() : context.sourceCode;

    /**
     * Get the full text of an assignment expression
     */
    function getAssignmentText(node) {
      return sourceCode.getText(node);
    }

    /**
     * Get the property name being assigned (e.g., "this.mobileInput" -> "mobileInput")
     */
    function getAssignedProperty(node) {
      if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression') {
        const left = node.expression.left;
        if (left.type === 'MemberExpression' && left.object.type === 'ThisExpression') {
          return left.property.name || left.property.value;
        }
        if (left.type === 'Identifier') {
          return left.name;
        }
        if (left.type === 'MemberExpression') {
          return sourceCode.getText(left);
        }
      }
      return null;
    }

    /**
     * Check if two nodes are duplicate assignments
     */
    function isDuplicateAssignment(node1, node2) {
      if (!node1 || !node2) return false;
      if (node1.type !== 'ExpressionStatement' || node2.type !== 'ExpressionStatement') return false;
      if (node1.expression.type !== 'AssignmentExpression' || node2.expression.type !== 'AssignmentExpression')
        return false;

      const text1 = getAssignmentText(node1);
      const text2 = getAssignmentText(node2);

      return text1 === text2;
    }

    return {
      BlockStatement(node) {
        const statements = node.body;

        for (let i = 1; i < statements.length; i++) {
          const prevStatement = statements[i - 1];
          const currentStatement = statements[i];

          if (isDuplicateAssignment(prevStatement, currentStatement)) {
            const property = getAssignedProperty(currentStatement) || 'property';

            context.report({
              node: currentStatement,
              messageId: 'duplicateAssignment',
              data: { property },
              // No auto-fix - must be fixed manually
            });
          }
        }
      },
    };
  },
};
