const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { load } = require('cheerio');

const root = path.resolve(__dirname, '..');
let checks = 0;
const failures = [];
for (const directory of [root, path.join(root, 'dist')]) {
  if (!fs.existsSync(directory)) { failures.push('Build output is missing. Run npm run build.'); continue; }
  for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.html'))) {
    const $ = load(fs.readFileSync(path.join(directory, file), 'utf8'));
    $('script[src],link[rel="stylesheet"]').each((_, element) => {
      const reference = $(element).attr('src') || $(element).attr('href');
      if (!reference || /^(https?:|\/\/|data:)/.test(reference)) return;
      const local = path.join(directory, reference.split(/[?#]/)[0].replace(/^\//, ''));
      checks++;
      // Development vendor files are served by Vite middleware.
      if (!fs.existsSync(local) && !(directory === root && reference.startsWith('vendor/'))) failures.push(`${file}: missing ${reference}`);
    });
    $('script:not([src])').each((index, element) => {
      if ($(element).attr('type') && !/javascript/.test($(element).attr('type'))) return;
      checks++;
      try { new vm.Script($(element).html(), { filename: `${file}:script${index}` }); }
      catch (error) { failures.push(`${file}:script${index}: ${error.message}`); }
    });
  }
  for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.js'))) {
    checks++;
    try { new vm.Script(fs.readFileSync(path.join(directory, file), 'utf8'), { filename: file }); }
    catch (error) { failures.push(error.message); }
  }
}
for (const asset of ['pdf-tools.html','pdf-ultra.js','tax-portal.js','gst-tools.js','resume-builder.js','specialized-tools.js','js/api-client.js','js/pdf-worker.js','vendor/qpdf.js','vendor/qpdf.wasm','vendor/purify.min.js','backend/algorithms/incomeTax.js','offline.html','gst-black-mirror.html']) {
  checks++;
  if (!fs.existsSync(path.join(root, 'dist', asset))) failures.push(`Production output missing ${asset}`);
}
if (fs.existsSync(path.join(root, 'dist/backend/server.js'))) failures.push('Backend server must never be published as a static asset.');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`${checks} script, stylesheet and production-asset checks passed.`);
