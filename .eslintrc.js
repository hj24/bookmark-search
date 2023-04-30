module.exports = {
    root: true,
    env:{
        browser: true,
        es2021: true,
    },
    extends: [
        'prettier',
        'plugin:prettier/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    overrides: [],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
        'project': ['./tsconfig.json']
    },
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint'
    ],
    rules: {}
}
