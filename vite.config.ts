import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vuetify from 'vite-plugin-vuetify';

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
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              // Core Vue ecosystem
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vendor-core';
              }
              // UI Framework
              if (id.includes('vuetify') || id.includes('@mdi/js')) {
                return 'vendor-ui';
              }
              // Charts and visualization
              if (id.includes('apexcharts') || id.includes('vue3-apexcharts')) {
                return 'vendor-charts';
              }
              // Utilities
              if (id.includes('lodash') || id.includes('date-fns') || id.includes('jalaali-js')) {
                return 'vendor-utils';
              }
              // Icons
              if (id.includes('@tabler/icons-vue') || id.includes('remixicon')) {
                return 'vendor-icons';
              }
              // Forms and validation
              if (id.includes('vee-validate') || id.includes('yup')) {
                return 'vendor-forms';
              }
              // PDF generation
              if (id.includes('jspdf')) {
                return 'vendor-pdf';
              }
              // Other vendor libraries
              return 'vendor-misc';
            }
            
            // Feature-based chunks
            if (id.includes('/src/features/')) {
              const feature = id.split('/src/features/')[1].split('/')[0];
              return `feature-${feature}`;
            }
            
            // Layout chunks
            if (id.includes('/src/layouts/')) {
              return 'layouts';
            }
            
            // Shared components
            if (id.includes('/src/components/shared/')) {
              return 'shared-components';
            }
          },
          // Optimize chunk names
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `assets/js/[name]-[hash].js`;
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[name]-[hash]';
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/\.(css)$/.test(assetInfo.name)) {
              return `assets/css/[name]-[hash].${ext}`;
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
              return `assets/images/[name]-[hash].${ext}`;
            }
            return `assets/[name]-[hash].${ext}`;
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: env.VITE_DEBUG !== 'true',
          drop_debugger: env.VITE_DEBUG !== 'true',
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2,
          unsafe: true,
          unsafe_comps: true,
          unsafe_math: true
        },
        mangle: {
          safari10: true,
          properties: {
            regex: /^_/
          }
        }
      },
      target: 'esnext',
      cssCodeSplit: true,
      sourcemap: env.VITE_DEBUG === 'true'
    },
    optimizeDeps: {
      entries: ['./src/**/*.vue'],
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'vuetify',
        '@tabler/icons-vue'
      ]
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
