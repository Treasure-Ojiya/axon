import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0effd',
          100: '#e0dffb',
          200: '#c2bff7',
          300: '#a39ef3',
          400: '#857eef',
          500: '#7F77DD',
          600: '#5e57c4',
          700: '#4540a3',
          800: '#302d7a',
          900: '#1e1b52',
          950: '#131035',
        },

        success: {
          50: '#e8faf3',
          100: '#cff4e6',
          200: '#a0e8cb',
          300: '#66d6aa',
          400: '#1D9E75',
          500: '#167a5a',
          600: '#105c43',
          700: '#0b4331',
          800: '#072d21',
          900: '#041b14',
        },

        warning: {
          50: '#fff8e8',
          100: '#feefc7',
          200: '#fbdc8c',
          300: '#f6be3d',
          400: '#EF9F27',
          500: '#c47c10',
          600: '#8f5908',
          700: '#653d05',
          800: '#442903',
          900: '#291801',
        },

        danger: {
          50: '#fdf1ed',
          100: '#f9d8cf',
          200: '#f3afa0',
          300: '#e87b62',
          400: '#D85A30',
          500: '#a83f1d',
          600: '#7a2b10',
          700: '#581d0a',
          800: '#3a1206',
          900: '#220903',
        },

        info: {
          50: '#eef6fe',
          100: '#d8eafe',
          200: '#b6d7fb',
          300: '#79b3f6',
          400: '#378ADD',
          500: '#1f6ab8',
          600: '#16518c',
          700: '#103a66',
          800: '#0a2644',
          900: '#061528',
        },

        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        brand: '0 4px 20px rgba(127,119,221,0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config
