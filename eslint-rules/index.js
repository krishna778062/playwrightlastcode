/**
 * Custom ESLint Plugin for Project-Specific Rules
 */

const noDuplicateAssignments = require('./no-duplicate-assignments');

module.exports = {
  rules: {
    'no-duplicate-assignments': noDuplicateAssignments,
  },
};
