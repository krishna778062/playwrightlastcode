/**
 * Custom ESLint Plugin for Project-Specific Rules
 */

const noDuplicateAssignments = require('./no-duplicate-assignments');
const locatorInConstructor = require('./locator-in-constructor');

module.exports = {
  rules: {
    'no-duplicate-assignments': noDuplicateAssignments,
    'locator-in-constructor': locatorInConstructor,
  },
};
