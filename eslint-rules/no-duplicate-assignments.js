/**
 * Custom ESLint Rule: no-duplicate-assignments
 *
 * Catches duplicate assignment statements to the same property within a CONSTRUCTOR.
 * Only applies to class constructors to avoid false positives in regular methods.
 *
 * ❌ Bad (in constructor):
 *   constructor(page: Page) {
 *     this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
 *     this.mobileInput = page.getByRole('textbox', { name: 'Mobileee' }); // Duplicate!
 *   }
 *
 * ✅ Good (in constructor):
 *   constructor(page: Page) {
 *     this.mobileInput = page.getByRole('textbox', { name: 'Mobile' });
 *     this.emailInput = page.getByRole('textbox', { name: 'Email' });
 *   }
 *
 * ✅ OK (in regular methods - not checked):
 *   someMethod() {
 *     this.value = 1;
 *     this.value = 2; // Allowed - intentional reassignment in methods
 *   }
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow duplicate assignment statements to the same property in constructors',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: null, // No auto-fix - must be fixed manually
    schema: [],
    messages: {
      duplicateAssignment:
        'Duplicate assignment to "{{property}}" in constructor. Already assigned on line {{firstLine}}.',
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

    /**
     * Check if the block is inside a constructor
     */
    function isConstructorBlock(node) {
      const parent = node.parent;

      // Check for class constructor: MethodDefinition with kind 'constructor'
      if (
        parent &&
        parent.type === 'FunctionExpression' &&
        parent.parent &&
        parent.parent.type === 'MethodDefinition' &&
        parent.parent.kind === 'constructor'
      ) {
        return true;
      }

      // Check for TypeScript constructor
      if (
        parent &&
        (parent.type === 'FunctionExpression' || parent.type === 'FunctionDeclaration') &&
        parent.parent &&
        parent.parent.type === 'MethodDefinition' &&
        parent.parent.key &&
        parent.parent.key.name === 'constructor'
      ) {
        return true;
      }

      return false;
    }

    return {
      BlockStatement(node) {
        // Only check blocks inside constructors
        if (!isConstructorBlock(node)) {
          return;
        }

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

            // Report duplicate - same property assigned twice in constructor
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
