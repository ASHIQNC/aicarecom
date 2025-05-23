module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [0], // allow any type
    'type-empty': [0], // allow type to be empty
    'subject-empty': [0], // allow subject to be empty

    'header-min-length': [2, 'always', 20],
    'header-case-start-capital': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'header-case-start-capital': ({ raw }) => {
          return [
            /^[A-Z]/.test(raw),
            'Commit message must start with a capital letter',
          ];
        },
      },
    },
  ],
};

// What this does:
// -----------------

// 'type-enum': disables the rule that restricts the type to a specific set of values.
// 'type-empty': allows the type to be empty (so you could even have a message like : just a message).

// 'subject-empty': allows the subject (the part after the colon) to be empty.

// Now, any word before the colon is accepted as the type.

// Example
// With this config, all of these will be valid:

// nextcicd: first commit

// hello: initial setup

// anything: whatever you want
