const expo = require('eslint-config-expo');

module.exports = {
  extends: ['expo'],
  rules: {
    'prefer-const': 'error',
    'no-unused-vars': 'warn'
  }
};
