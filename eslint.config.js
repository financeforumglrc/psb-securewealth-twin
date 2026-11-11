const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const eslintPluginImport = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const eslintPluginSecurity = require('eslint-plugin-security');

module.exports = [
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/coverage/**',
            '**/data/**',
            '**/logs/**',
            '**/uploads/**',
            '**/*.min.js',
            '**/vendor/**',
            '**/_dev/**',
            '**/deploy/**',
            'backend/node_modules/**',
            'frontend/node_modules/**'
        ]
    },
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
        plugins: {
            security: eslintPluginSecurity,
            import: eslintPluginImport,
            '@typescript-eslint': typescriptEslint,
            prettier: prettierPlugin
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                fetch: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                AbortSignal: 'readonly',
                Buffer: 'readonly',
                process: 'readonly',
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                exports: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly',
                // Standard browser globals used across the app
                location: 'readonly',
                history: 'readonly',
                screen: 'readonly',
                performance: 'readonly',
                Event: 'readonly',
                CustomEvent: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                crypto: 'readonly',
                TextDecoder: 'readonly',
                TextEncoder: 'readonly',
                createImageBitmap: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                FileReader: 'readonly',
                FormData: 'readonly',
                atob: 'readonly',
                btoa: 'readonly',
                structuredClone: 'readonly',
                Worker: 'readonly',
                WebSocket: 'readonly',
                XMLHttpRequest: 'readonly',
                Headers: 'readonly',
                Request: 'readonly',
                Response: 'readonly',
                AbortController: 'readonly',
                Image: 'readonly',
                HTMLElement: 'readonly',
                Element: 'readonly',
                Node: 'readonly',
                MutationObserver: 'readonly',
                IntersectionObserver: 'readonly',
                ResizeObserver: 'readonly',
                matchMedia: 'readonly',
                getComputedStyle: 'readonly',
                DOMParser: 'readonly',
                queueMicrotask: 'readonly',
                prompt: 'readonly',
                // Web Worker globals (pdf-worker.js)
                self: 'readonly',
                importScripts: 'readonly',
                Module: 'writable',
                // Cross-file app globals (loaded via script tags; runtime globals)
                ExcelJS: 'writable',
                XLSX: 'writable',
                Tesseract: 'writable',
                ReportResearch: 'writable',
                FinancialCore: 'writable',
                FinancialIntake: 'writable',
                ModelExports: 'writable',
                StatementUploads: 'writable',
                getModelResearch: 'writable',
                getCurrentParams: 'writable',
                setExportProgress: 'writable',
                showToast: 'writable',
                showNotification: 'writable',
                showSection: 'writable',
                updateMatchingResults: 'writable',
                checkSingleGstin: 'writable',
                exportProfessionalExcel: 'writable',
                GSTINValidatorPro: 'writable',
                validateGSTIN: 'writable',
                askChatQuestion: 'writable',
                switchInv: 'writable',
                switchTool: 'writable',
                analysisResults: 'writable',
                modelData: 'writable',
                _scrMonoData: 'writable'
            }
        },
        rules: {
            'prettier/prettier': 'warn',
            'no-console': 'off',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_'
                }
            ],
            'no-undef': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'no-param-reassign': 'warn',
            'no-return-await': 'warn',
            'require-await': 'warn',
            'no-throw-literal': 'error',
            'prefer-promise-reject-errors': 'warn',
            'no-promise-executor-return': 'error',
            'no-await-in-loop': 'warn',
            'max-params': ['warn', 4],
            'security/detect-object-injection': 'warn',
            'security/detect-non-literal-fs-filename': 'warn',
            'security/detect-child-process': 'warn',
            'security/detect-eval-with-expression': 'error',
            'security/detect-no-csrf-before-method-override': 'warn',
            'security/detect-possible-timing-attacks': 'warn',
            'security/detect-pseudoRandomBytes': 'warn',
            'security/detect-unsafe-regex': 'warn',
            'import/first': 'error',
            'import/no-duplicates': 'error',
            'import/newline-after-import': 'warn',
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc' }
                }
            ]
        }
    },
    {
        files: ['backend/**/*.js'],
        rules: {
            'no-process-env': 'off',
            'security/detect-non-literal-fs-filename': 'warn',
            'security/detect-child-process': 'warn'
        }
    },
    {
        files: ['frontend/**/*.js', 'frontend/**/*.ts'],
        rules: {
            'no-alert': 'warn'
        }
    },
    {
        files: ['**/tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
        rules: {
            'no-undef': 'off',
            'max-params': 'off',
            'require-await': 'off'
        }
    }
];
