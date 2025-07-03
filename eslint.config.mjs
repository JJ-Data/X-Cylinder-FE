import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        rules: {
            '@typescript-eslint/no-unused-expressions': 'off',
            '@next/next/no-img-element': 'off',
            'react-hooks/rules-of-hooks': 'off',
            '@typescript-eslint/no-unused-vars': [
                'off',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                    caughtErrors: 'none', // This will ignore all catch block errors
                },
            ],
            '@typescript-eslint/no-explicit-any': [
                'off',
                {
                    ignoreRestArgs: true,
                    fixToUnknown: false,
                },
            ],
            'react/no-unescaped-entities': [
                'off',
                {
                    forbid: ['>', '}'],
                },
            ],
        },
    },
]

export default eslintConfig
