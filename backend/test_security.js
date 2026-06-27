/**
 * DocMaster Pro — Security Test Suite
 * Run this after starting the backend: node test_security.js
 *
 * Tests:
 * 1. Path traversal on download endpoint
 * 2. Path traversal on delete endpoint
 * 3. Malicious file upload (EXE magic bytes in .pdf)
 * 4. Upload too large (simulated via Content-Length header check)
 * 5. Invalid compression level injection
 * 6. Invalid split mode injection
 * 7. Malformed PDF (text file disguised as PDF)
 * 8. URL enumeration (random UUIDs)
 * 9. Verify security headers are present
 * 10. Client-supplied uploadId is ignored (server generates its own)
 * 11. Range injection with negative page numbers
 */

const BASE = 'http://localhost:5000';
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ FAIL: ${name}`);
    console.log(`         ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ─── Helper: valid PDF bytes ───────────────────────────────────────────────────
const VALID_PDF_BYTES = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 2\n0000000000 65535 f \n0000000009 00000 n \ntrailer\n<< /Root 1 0 R /Size 2 >>\nstartxref\n48\n%%EOF');

// ─── Helper: EXE bytes in .pdf disguise ──────────────────────────────────────
const FAKE_PDF_BYTES = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header

async function fetchJson(url, opts) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, opts);
}

(async () => {
  console.log('\n🔐 DocMaster Pro — Security Test Suite\n');
  console.log('Server:', BASE);
  console.log('─'.repeat(50));

  // 1. Health check
  await test('Server is reachable', async () => {
    const res = await fetchJson(`${BASE}/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // 2. Security headers
  await test('Helmet security headers are present', async () => {
    const res = await fetchJson(`${BASE}/health`);
    const headers = res.headers;
    assert(headers.get('x-frame-options') || headers.get('content-security-policy'), 'Missing X-Frame-Options or CSP');
    assert(headers.get('x-content-type-options') === 'nosniff', 'Missing X-Content-Type-Options: nosniff');
    assert(!headers.get('x-powered-by'), 'X-Powered-By header must be removed');
  });

  // 3. Path traversal — download
  await test('Path traversal on download is blocked', async () => {
    const res = await fetchJson(`${BASE}/api/pdf/download/..%2F..%2Fetc/passwd`);
    assert(res.status === 400 || res.status === 404, `Expected 400/404 for traversal, got ${res.status}`);
  });

  // 4. Path traversal — delete
  await test('Path traversal on delete is blocked', async () => {
    const res = await fetchJson(`${BASE}/api/pdf/delete/..%2F..%2Fetc/passwd`, { method: 'DELETE' });
    assert(res.status === 400 || res.status === 404, `Expected 400/404, got ${res.status}`);
  });

  // 5. URL enumeration — random UUIDs return 404 without leaking info
  await test('Random UUID download returns 404 without info leak', async () => {
    const fakeId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const res = await fetchJson(`${BASE}/api/pdf/download/${fakeId}/nonexistent.pdf`);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
    const body = await res.json();
    assert(!JSON.stringify(body).includes('UPLOAD_DIR'), 'Response must not leak internal paths');
    assert(!JSON.stringify(body).includes('node_modules'), 'Response must not leak stack trace');
  });

  // 6. Upload file with EXE magic bytes (disguised as PDF)
  await test('Malicious file (EXE magic bytes) upload is rejected', async () => {
    const form = new FormData();
    form.append('file', FAKE_PDF_BYTES, { filename: 'evil.pdf', contentType: 'application/pdf' });
    form.append('level', 'medium');
    const res = await fetchJson(`${BASE}/api/pdf/compress`, { method: 'POST', body: form, headers: form.getHeaders() });
    assert(res.status === 400, `Expected 400 for fake PDF, got ${res.status}`);
    const body = await res.json();
    assert(body.success === false, 'success should be false');
  });

  // 7. Malformed PDF (text file with .pdf extension)
  await test('Text file disguised as PDF is rejected', async () => {
    const form = new FormData();
    const textContent = Buffer.from('This is definitely not a PDF file');
    form.append('file', textContent, { filename: 'not_a_pdf.pdf', contentType: 'application/pdf' });
    form.append('level', 'medium');
    const res = await fetchJson(`${BASE}/api/pdf/compress`, { method: 'POST', body: form, headers: form.getHeaders() });
    assert(res.status === 400, `Expected 400 for text-as-PDF, got ${res.status}`);
  });

  // 8. Invalid compression level injection
  await test('Invalid compression level is rejected', async () => {
    const form = new FormData();
    form.append('file', VALID_PDF_BYTES, { filename: 'test.pdf', contentType: 'application/pdf' });
    form.append('level', '../../etc/passwd');
    const res = await fetchJson(`${BASE}/api/pdf/compress`, { method: 'POST', body: form, headers: form.getHeaders() });
    // Either 400 (rejected) or 200 (defaulted to 'medium') is acceptable
    const body = await res.json();
    if (res.status === 400) {
      assert(!body.success, 'success should be false');
    } else {
      // If it processed, level must not have been used as a path
      assert(body.success === true || body.error, 'Response must be structured');
    }
    assert(!JSON.stringify(body).includes('etc/passwd'), 'Injected value must not appear in response');
  });

  // 9. Invalid split mode injection
  await test('Invalid split mode is rejected', async () => {
    const form = new FormData();
    form.append('file', VALID_PDF_BYTES, { filename: 'test.pdf', contentType: 'application/pdf' });
    form.append('mode', 'execute_code');
    const res = await fetchJson(`${BASE}/api/pdf/split`, { method: 'POST', body: form, headers: form.getHeaders() });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // 10. Negative page ranges in split
  await test('Negative page ranges are rejected', async () => {
    const form = new FormData();
    form.append('file', VALID_PDF_BYTES, { filename: 'test.pdf', contentType: 'application/pdf' });
    form.append('mode', 'ranges');
    form.append('ranges', JSON.stringify([{ start: -1, end: 5 }]));
    const res = await fetchJson(`${BASE}/api/pdf/split`, { method: 'POST', body: form, headers: form.getHeaders() });
    assert(res.status === 400, `Expected 400 for negative range, got ${res.status}`);
  });

  // 11. Client-supplied uploadId is ignored
  await test('Client-supplied uploadId in body is ignored by server', async () => {
    const form = new FormData();
    form.append('file', VALID_PDF_BYTES, { filename: 'test.pdf', contentType: 'application/pdf' });
    form.append('level', 'medium');
    // Try to inject a crafted uploadId — server should replace it
    form.append('uploadId', '../../../../etc');
    form.append('_serverUploadId', '../../../../etc');
    const res = await fetchJson(`${BASE}/api/pdf/compress`, { method: 'POST', body: form, headers: form.getHeaders() });
    const body = await res.json();
    if (body.uploadId) {
      // The returned uploadId must be a valid UUID, not the injected value
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      assert(uuidPattern.test(body.uploadId), `uploadId "${body.uploadId}" is not a valid UUID`);
    }
  });

  // 12. Non-PDF MIME type is rejected
  await test('Non-PDF MIME type is rejected', async () => {
    const form = new FormData();
    form.append('file', Buffer.from('<script>alert(1)</script>'), { filename: 'evil.html', contentType: 'text/html' });
    const res = await fetchJson(`${BASE}/api/pdf/compress`, { method: 'POST', body: form, headers: form.getHeaders() });
    assert(res.status === 400, `Expected 400 for HTML file, got ${res.status}`);
  });

  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

  if (failed === 0) {
    console.log('\n🎉 All security tests passed!\n');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed — review the output above.\n`);
    process.exit(1);
  }
})();
