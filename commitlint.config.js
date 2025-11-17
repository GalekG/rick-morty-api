const VALID_GIT = [':boom:', ':sparkles:', ':bug:', ':recycle:', ':necktie:'];

module.exports = {
  rules: {
    'version-rule': [2, 'always', VALID_GIT],
  },
  plugins: [
    {
      rules: {
        'version-rule': ({ header = '' }) => {
          const pass = VALID_GIT.some((item) => header.startsWith(item));
          return [
            pass,
            `Your commit should start with one of the valid emojis: ${VALID_GIT.join(', ')}`,
          ];
        },
      },
    },
  ],
};
