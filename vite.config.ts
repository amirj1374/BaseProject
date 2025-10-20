import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['v-list-recognize-title'].includes(tag)
          }
        }
      }),
      vuetify({
        autoImport: true
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@tabler/icons-vue': '@tabler/icons-vue'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {}
      }
    },
    build: {
      chunkSizeWarningLimit: 1024 * 1024, // Set the limit to 1 MB
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'vuetify': ['vuetify', '@mdi/js'],
            'charts': ['apexcharts', 'vue3-apexcharts'],
            'utils': ['lodash', 'lodash-es', 'dayjs', 'date-fns'],
            'icons': ['@tabler/icons-vue', 'remixicon'],
            'forms': ['vee-validate', 'yup'],
            'pdf': ['jspdf'],
            'lottie': ['lottie-web', 'vue3-lottie']
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: env.VITE_DEBUG !== 'true',
          drop_debugger: env.VITE_DEBUG !== 'true',
          pure_funcs: ['console.log', 'console.info'],
          passes: 2
        },
        mangle: {
          safari10: true
        }
      },
      target: 'esnext',
      cssCodeSplit: true
    },
    optimizeDeps: {
      exclude: ['vuetify'],
      entries: ['./src/**/*.vue']
    },
    server: {
      host: true, // Allow external connections (same as --host)
      port: parseInt(env.VITE_PORT) || 5050, // Use env port or fallback to 5050
      headers: {
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'unsafe-none'
      }
    },
    // Dynamic base URL based on environment
    base: env.VITE_BASE_URL || '/',
  };
});
