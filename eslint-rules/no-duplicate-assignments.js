/**
 * Custom ESLint Rule: no-duplicate-assignments
 *
 * Catches duplicate assignment statements to the same property within a block.
 * Detects duplicates even if they're not on consecutive lines or have different values.
 *
 * ❌ Bad:
 *   this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
 *   this.mobileInput = page.getByRole('textbox', { name: 'Mobileee' }); // Duplicate property!
 *
 * ❌ Bad:
 *   this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
 *   this.emailInput = page.getByRole('textbox', { name: 'Email' });
 *   this.mobileInput = page.getByRole('textbox', { name: 'Mobile' }); // Duplicate!
 *
 * ✅ Good:
 *   this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
 *   this.emailInput = page.getByRole('textbox', { name: 'Email' });
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate assignment statements to the same property',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null, // No auto-fix - must be fixed manually
    schema: [],
    messages: {
      duplicateAssignment: 'Duplicate assignment to "{{property}}". Already assigned on line {{firstLine}}.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode ? context.getSourceCode() : context.sourceCode;

    /**
     * Get the property name being assigned (e.g., "this.mobileInput")
     */
    function getAssignedPropertyKey(node) {
      if (node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression') {
        const left = node.expression.left;
        // For this.property assignments
        if (left.type === 'MemberExpression') {
          return sourceCode.getText(left);
        }
        // For simple variable assignments
        if (left.type === 'Identifier') {
          return left.name;
        }
      }
      return null;
    }

    /**
     * Check if a node is an assignment expression statement
     */
    function isAssignmentStatement(node) {
      return node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression';
    }

    return {
      BlockStatement(node) {
        const statements = node.body;

        // Track assignments: key = property name, value = { line, node }
        const assignments = new Map();

        for (const statement of statements) {
          if (!isAssignmentStatement(statement)) continue;

          const propertyKey = getAssignedPropertyKey(statement);
          if (!propertyKey) continue;

          const currentLine = statement.loc.start.line;

          if (assignments.has(propertyKey)) {
            const firstAssignment = assignments.get(propertyKey);

            // Report duplicate - same property assigned twice (regardless of value)
            context.report({
              node: statement,
              messageId: 'duplicateAssignment',
              data: {
                property: propertyKey,
                firstLine: firstAssignment.line,
              },
            });
          } else {
            // First time seeing this property
            assignments.set(propertyKey, {
              line: currentLine,
              node: statement,
            });
          }
        }
      },
    };
  },
};
