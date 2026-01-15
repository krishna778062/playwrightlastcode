/**
 * Custom ESLint Rule: locator-in-constructor
 *
 * Enforces that Playwright Locator assignments should be inside the constructor,
 * not as class field initializers.
 *
 * ❌ Bad:
 *   class MyPage extends BasePage {
 *     readonly button = this.page.getByRole('button', { name: 'Submit' });
 *     readonly input = this.page.locator('#input');
 *   }
 *
 * ✅ Good:
 *   class MyPage extends BasePage {
 *     readonly button: Locator;
 *     readonly input: Locator;
 *
 *     constructor(page: Page) {
 *       super(page);
 *       this.button = page.getByRole('button', { name: 'Submit' });
 *       this.input = page.locator('#input');
 *     }
 *   }
 */

const LOCATOR_METHODS = [
  'getByRole',
  'getByText',
  'getByLabel',
  'getByPlaceholder',
  'getByAltText',
  'getByTitle',
  'getByTestId',
  'locator',
  'getByLocator',
];

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce Locator assignments inside constructor instead of class field initializers',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      locatorInClassField:
        'Locator "{{property}}" should be assigned inside the constructor, not as a class field initializer. Declare as "readonly {{property}}: Locator;" and assign in constructor.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode ? context.getSourceCode() : context.sourceCode;

    /**
     * Check if a node is a Playwright locator method call
     */
    function isLocatorMethodCall(node) {
      if (!node) return false;

      // Check for this.page.getByRole(), this.page.locator(), etc.
      if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
        const methodName = node.callee.property.name;

        if (LOCATOR_METHODS.includes(methodName)) {
          // Check if it's called on this.page
          const object = node.callee.object;
          if (
            object.type === 'MemberExpression' &&
            object.object.type === 'ThisExpression' &&
            object.property.name === 'page'
          ) {
            return true;
          }
          // Also check for page.getByRole() (direct page reference)
          if (object.type === 'Identifier' && object.name === 'page') {
            return true;
          }
        }
      }

      return false;
    }

    /**
     * Recursively check if a node contains a locator method call
     */
    function containsLocatorCall(node) {
      if (!node) return false;

      if (isLocatorMethodCall(node)) return true;

      // Check chained calls like this.page.locator().first()
      if (node.type === 'CallExpression') {
        if (containsLocatorCall(node.callee)) return true;
        if (node.callee.type === 'MemberExpression' && containsLocatorCall(node.callee.object)) {
          return true;
        }
      }

      if (node.type === 'MemberExpression') {
        return containsLocatorCall(node.object);
      }

      return false;
    }

    return {
      // Check PropertyDefinition (class field declarations)
      PropertyDefinition(node) {
        // Skip if no value (just type declaration like `readonly button: Locator;`)
        if (!node.value) return;

        // Check if the value contains a locator method call
        if (containsLocatorCall(node.value)) {
          const propertyName = node.key.name || sourceCode.getText(node.key);

          context.report({
            node,
            messageId: 'locatorInClassField',
            data: {
              property: propertyName,
            },
          });
        }
      },
    };
  },
};
