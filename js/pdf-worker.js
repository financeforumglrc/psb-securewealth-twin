/* QPDF runs in an isolated worker. Document bytes and passwords stay local. */
importScripts('../vendor/qpdf.js');
self.onmessage = async ({ data }) => {
  try {
    const qpdf = await Module({ locateFile: () => new URL('../vendor/qpdf.wasm', self.location.href).href, print: () => {}, printErr: () => {} });
    qpdf.FS.writeFile('/input.pdf', new Uint8Array(data.bytes));
    const args = data.action === 'encrypt'
      ? ['--encrypt', data.password, data.ownerPassword, '256', '--', '/input.pdf', '/output.pdf']
      : ['--password=' + data.password, '--decrypt', '/input.pdf', '/output.pdf'];
    const code = qpdf.callMain(args);
    if (code && code !== 3) throw new Error(data.action === 'encrypt' ? 'Could not encrypt this PDF.' : 'Incorrect password or unsupported PDF.');
    const output = qpdf.FS.readFile('/output.pdf').slice();
    qpdf.FS.unlink('/input.pdf');
    qpdf.FS.unlink('/output.pdf');
    self.postMessage({ bytes: output.buffer }, [output.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message || 'PDF processing failed.' });
  }
};
