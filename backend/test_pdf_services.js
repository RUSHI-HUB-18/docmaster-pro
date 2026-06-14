const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { PdfService } = require('./dist/services/pdfService');

// Make sure output folder exists
const TEMP_DIR = path.join(__dirname, '../uploads/test_temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function createDummyPDF(filename, pageCount = 3) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([600, 800]);
    // Draw page number to distinguish
    page.drawText(`Page ${i + 1} of ${filename}`, { x: 50, y: 700, size: 20 });
  }
  const bytes = await doc.save();
  const filePath = path.join(TEMP_DIR, filename);
  fs.writeFileSync(filePath, bytes);
  return filePath;
}

async function runTests() {
  console.log('==================================================');
  console.log(' Running PDF Processing Services Integration Tests');
  console.log('==================================================\n');

  try {
    // 1. Create dummy files
    console.log('[1/5] Creating dummy PDFs for testing...');
    const file1 = await createDummyPDF('doc_A.pdf', 3);
    const file2 = await createDummyPDF('doc_B.pdf', 4);
    console.log(`- Created ${path.basename(file1)} (3 pages)`);
    console.log(`- Created ${path.basename(file2)} (4 pages)\n`);

    // 2. Test Merge
    console.log('[2/5] Testing PDF Merge...');
    const mergedPath = path.join(TEMP_DIR, 'merged_result.pdf');
    await PdfService.mergePDFs([file1, file2], mergedPath);
    
    // Verify merged page count
    const mergedDoc = await PDFDocument.load(fs.readFileSync(mergedPath));
    const mergedPages = mergedDoc.getPageCount();
    console.log(`- Merged Output: ${path.basename(mergedPath)}`);
    console.log(`- Total pages: ${mergedPages} (Expected: 7)`);
    if (mergedPages === 7) {
      console.log('✅ Merge test PASSED\n');
    } else {
      throw new Error(`Merge test FAILED: page count is ${mergedPages}`);
    }

    // 3. Test Split
    console.log('[3/5] Testing PDF Split...');
    // Split range 1-2 and 3-3 of doc_A (which has 3 pages)
    const splitResult = await PdfService.splitPDF(file1, 'ranges', [
      { start: 1, end: 2 },
      { start: 3, end: 3 }
    ], TEMP_DIR);
    
    console.log(`- Split Output: ${splitResult.filename} (isZip: ${splitResult.isZip})`);
    if (splitResult.isZip && fs.existsSync(splitResult.path)) {
      console.log('✅ Split (Ranges -> Zip) test PASSED\n');
    } else {
      throw new Error('Split test FAILED: expected ZIP output for multiple ranges');
    }

    // 4. Test Compress
    console.log('[4/5] Testing PDF Compression...');
    const compressedPath = path.join(TEMP_DIR, 'compressed_result.pdf');
    const compressionStats = await PdfService.compressPDF(file1, 'strong', compressedPath);
    
    console.log(`- Original Size: ${compressionStats.originalSize} bytes`);
    console.log(`- Compressed Size: ${compressionStats.compressedSize} bytes`);
    if (fs.existsSync(compressedPath)) {
      console.log('✅ Compression test PASSED\n');
    } else {
      throw new Error('Compression test FAILED: compressed file not created');
    }

    // 5. Test Rotate
    console.log('[5/5] Testing PDF Rotation...');
    const rotatedPath = path.join(TEMP_DIR, 'rotated_result.pdf');
    // Rotate page 0 by 90 degrees and page 1 by 180 degrees
    await PdfService.rotatePDF(file1, [
      { pageIndex: 0, degrees: 90 },
      { pageIndex: 1, degrees: 180 }
    ], rotatedPath);
    
    // Verify rotation
    const rotatedDoc = await PDFDocument.load(fs.readFileSync(rotatedPath));
    const rot0 = rotatedDoc.getPage(0).getRotation().angle;
    const rot1 = rotatedDoc.getPage(1).getRotation().angle;
    console.log(`- Page 1 Rotation: ${rot0}° (Expected: 90)`);
    console.log(`- Page 2 Rotation: ${rot1}° (Expected: 180)`);
    
    if (rot0 === 90 && rot1 === 180) {
      console.log('✅ Rotation test PASSED\n');
    } else {
      throw new Error(`Rotation test FAILED: rot0=${rot0}, rot1=${rot1}`);
    }

    console.log('==================================================');
    console.log(' 🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
    console.log('==================================================');

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED with error:');
    console.error(err);
    process.exit(1);
  } finally {
    // Clean up test temp files
    try {
      if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      }
    } catch (e) {}
  }
}

runTests();
