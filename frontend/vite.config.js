import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteRoot = path.resolve(__dirname, '..');

// These pages intentionally use classic scripts: inline controls call their
// global functions. Vite does not bundle or copy classic script dependencies.
function publicToolAssets() {
  const vendors = {
    'vendor/tesseract.min.js': path.join(siteRoot, 'node_modules/tesseract.js/dist/tesseract.min.js'),
    'vendor/tesseract-worker.min.js': path.join(siteRoot, 'node_modules/tesseract.js/dist/worker.min.js'),
    'vendor/ocr-lang/eng.traineddata.gz': path.join(siteRoot, 'node_modules/@tesseract.js-data/eng/4.0.0/eng.traineddata.gz'),
    'vendor/pdf.min.mjs': path.join(siteRoot, 'node_modules/pdfjs-dist/build/pdf.min.mjs'),
    'vendor/pdf.worker.min.mjs': path.join(siteRoot, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
    'vendor/exceljs.min.js': path.join(siteRoot, 'node_modules/exceljs/dist/exceljs.min.js'),
    'vendor/jspdf.umd.min.js': path.join(siteRoot, 'node_modules/jspdf/dist/jspdf.umd.min.js'),
    'vendor/jspdf.plugin.autotable.min.js': path.join(siteRoot, 'node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js'),
    'vendor/qpdf.js': path.join(siteRoot, 'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.js'),
    'vendor/qpdf.wasm': path.join(siteRoot, 'node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm'),
    'vendor/purify.min.js': path.join(siteRoot, 'node_modules/dompurify/dist/purify.min.js')
  };
  for (const name of fs.readdirSync(path.join(siteRoot,'node_modules/tesseract.js-core')).filter(name=>/\.wasm(?:\.js)?$/.test(name))) vendors['vendor/ocr-core/'+name]=path.join(siteRoot,'node_modules/tesseract.js-core',name);
  return {
    name: 'public-tool-assets',
    writeBundle(options) {
      // Preserve classic-script HTML and its matching public stylesheets.
      // Vite's stylesheet-only entry optimization can leave dangling module
      // references when multiple pages share a manually named CSS chunk.
      const output = path.resolve(siteRoot, options.dir || 'dist');
      for (const file of fs.readdirSync(siteRoot).filter(name => name.endsWith('.html'))) {
        if (fs.existsSync(path.join(output, file))) fs.copyFileSync(path.join(siteRoot, file), path.join(output, file));
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const asset = (req.url || '').split('?')[0].replace(/^\//, '');
        if (!vendors[asset]) return next();
        res.setHeader('Content-Type', asset.endsWith('.wasm') ? 'application/wasm' : 'text/javascript');
        fs.createReadStream(vendors[asset]).pipe(res);
      });
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(vendors)) this.emitFile({ type: 'asset', fileName, source: fs.readFileSync(source) });
      const emit = (relative) => {
        if (relative.replaceAll('\\', '/') === 'js/config.js' && process.env.VITE_API_BASE_URL) {
          const api = process.env.VITE_API_BASE_URL;
          if (api !== '/api/v1' && !/^https:\/\/[^\s]+\/api\/v1\/?$/.test(api)) throw new Error('VITE_API_BASE_URL must be /api/v1 or an HTTPS API URL');
          this.emitFile({ type: 'asset', fileName: 'js/config.js', source: `window.DS_API_BASE_URL = ${JSON.stringify(api)};\n` });
          return;
        }
        this.emitFile({ type: 'asset', fileName: relative.replaceAll('\\', '/'), source: fs.readFileSync(path.join(siteRoot, relative)) });
      };
      for (const file of fs.readdirSync(siteRoot)) {
        if (/\.(js|css)$/.test(file) || ['manifest.json', 'robots.txt', 'sitemap.xml'].includes(file)) emit(file);
      }
      const walk = (directory) => {
        for (const entry of fs.readdirSync(path.join(siteRoot, directory), { withFileTypes: true })) {
          const relative = path.join(directory, entry.name);
          if (entry.isDirectory()) walk(relative);
          else if (/\.(js|json)$/.test(entry.name)) emit(relative);
        }
      };
      walk('js');
      // The options calculator uses this browser-compatible UMD module.
      // Never copy the rest of the backend into the public output.
      emit('backend/services/blackscholes.js');
      emit('backend/algorithms/incomeTax.js');
    }
  };
}

export default defineConfig({
  plugins: [publicToolAssets()],
  root: path.resolve(__dirname, '..'),
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, '..', 'index.html'),
        'financial-modelling': path.resolve(__dirname, '..', 'financial-modelling.html'),
        'financial-modelling-advanced': path.resolve(__dirname, '..', 'financial-modelling-advanced.html'),
        'financial-modelling-v2': path.resolve(__dirname, '..', 'financial-modelling-v2.html'),
        gallery: path.resolve(__dirname, '..', 'gallery.html'),
        'gst-tools': path.resolve(__dirname, '..', 'gst-tools.html'),
        'tax-portal': path.resolve(__dirname, '..', 'tax-portal.html'),
        admin: path.resolve(__dirname, '..', 'admin.html'),
        'admin-dashboard': path.resolve(__dirname, '..', 'admin-dashboard.html'),
        'api-demo': path.resolve(__dirname, '..', 'api-demo.html'),
        'smart-tax-optimizer': path.resolve(__dirname, '..', 'smart-tax-optimizer.html'),
        blog: path.resolve(__dirname, '..', 'blog.html'),
        invoice: path.resolve(__dirname, '..', 'invoice-generator.html'),
        'resume-builder': path.resolve(__dirname, '..', 'resume-builder.html'),
        'pdf-ultra': path.resolve(__dirname, '..', 'pdf-ultra.html'),
        'pdf-tools': path.resolve(__dirname, '..', 'pdf-tools.html'),
        'pdf-tools-backup': path.resolve(__dirname, '..', 'pdf-tools-backup.html'),
        'gst-black-mirror': path.resolve(__dirname, '..', 'gst-black-mirror.html'),
        offline: path.resolve(__dirname, '..', 'offline.html'),
        '404': path.resolve(__dirname, '..', '404.html'),
        'index-new': path.resolve(__dirname, '..', 'index-new.html'),
        auth: path.resolve(__dirname, '..', 'auth.html'),
        privacy: path.resolve(__dirname, '..', 'privacy.html'),
        'investment-tools': path.resolve(__dirname, '..', 'investment-tools.html'),
        'design-system': path.resolve(__dirname, '..', 'design-system-showcase.html'),
        'specialized-tools': path.resolve(__dirname, '..', 'specialized-tools.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js')) return 'vendor-chart';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            return 'vendor';
          }
          if (id.includes('gst-black-mirror-enhanced')) return 'gst-engine';
          if (id.includes('smart-tax-optimizer')) return 'tax-optimizer';
          if (id.includes('ai-engine')) return 'ai-engine';
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    include: ['chart.js', 'xlsx']
  }
});
