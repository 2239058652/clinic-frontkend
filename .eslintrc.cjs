require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    // 环境变量配置，不再需要手动 require globals
    env: {
        browser: true,
        es2020: true,
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting' // 放在最后处理 Prettier 冲突
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    rules: {
        // 这里放你真正需要的通用规则
        '@typescript-eslint/no-explicit-any': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
        // Vue 特有的规则也可以加在这里，例如要求组件名多单词：
        // 'vue/multi-word-component-names': 'off'
    }
}
