'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  Clock,
  Zap,
  ChevronRight,
  Presentation,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import JSZip from 'jszip';

export default function MergePptConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    downloadUrl: string;
    name: string;
    size: number;
    slideCount: number;
  } | null>(null);

  const handleFilesSelected = (selected: File[]) => {
    setError(null);
    // Filter out non-pptx files
    const valid = selected.filter(f => f.name.endsWith('.pptx'));
    if (valid.length !== selected.length) {
      setError('Some files were skipped. Only .pptx files are supported.');
    }
    setFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFiles(updated);
  };

  const resetTool = () => {
    setFiles([]);
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  // Helper to parse XML string using DOMParser
  const parseXml = (xmlText: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    
    // Check if there are parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing failed: ' + parserError.textContent);
    }
    return doc;
  };

  // Helper to serialize XML document back to string
  const serializeXml = (doc: Document) => {
    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PowerPoint presentations to merge.');
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress(10);
    setCurrentTask('Loading base PowerPoint presentation...');

    try {
      // 1. Read first file as base presentation
      const baseFile = files[0];
      const baseBuffer = await baseFile.arrayBuffer();
      const baseZip = await JSZip.loadAsync(baseBuffer);

      // Determine current number of slides in base presentation
      let baseSlideNames: string[] = [];
      baseZip.forEach((relativePath) => {
        const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
        if (match) {
          baseSlideNames.push(relativePath);
        }
      });

      let totalBaseSlides = baseSlideNames.length;
      if (totalBaseSlides === 0) {
        throw new Error('The first presentation contains no valid slides.');
      }

      // Load main structures of base presentation
      const presXmlText = await baseZip.file('ppt/presentation.xml')?.async('text');
      const presRelsXmlText = await baseZip.file('ppt/_rels/presentation.xml.rels')?.async('text');
      const contentTypesXmlText = await baseZip.file('[Content_Types].xml')?.async('text');

      if (!presXmlText || !presRelsXmlText || !contentTypesXmlText) {
        throw new Error('Base presentation has missing or corrupted configuration structures.');
      }

      const presDoc = parseXml(presXmlText);
      const presRelsDoc = parseXml(presRelsXmlText);
      const contentTypesDoc = parseXml(contentTypesXmlText);

      // 2. Loop through subsequent presentations
      for (let k = 1; k < files.length; k++) {
        const subFile = files[k];
        setCurrentTask(`Reading deck ${k + 1}: ${subFile.name}...`);
        setProgress(10 + Math.round((k / files.length) * 70));

        const subBuffer = await subFile.arrayBuffer();
        const subZip = await JSZip.loadAsync(subBuffer);

        // Find slides inside sub presentation
        const subSlides: { name: string; num: number }[] = [];
        subZip.forEach((relativePath) => {
          const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
          if (match) {
            subSlides.push({ name: relativePath, num: parseInt(match[1]) });
          }
        });

        // Sort slide files numerically
        subSlides.sort((a, b) => a.num - b.num);

        // Merge slides from sub to base
        for (let j = 0; j < subSlides.length; j++) {
          const slide = subSlides[j];
          const nextIndex = totalBaseSlides + j + 1; // 1-indexed for the target slide file

          const slideXmlText = await subZip.file(slide.name)?.async('text');
          if (!slideXmlText) continue;

          // Copy slide relation files if they exist
          const slideRelsName = `ppt/slides/_rels/slide${slide.num}.xml.rels`;
          const slideRelsFile = subZip.file(slideRelsName);
          let slideRelsXmlText = slideRelsFile ? await slideRelsFile.async('text') : '';

          // Copy and rename media assets referenced by slide relations to prevent conflicts
          if (slideRelsXmlText) {
            const relsDoc = parseXml(slideRelsXmlText);
            const relationships = relsDoc.getElementsByTagName('Relationship');

            for (let r = 0; r < relationships.length; r++) {
              const rel = relationships[r];
              const target = rel.getAttribute('Target') || '';
              const type = rel.getAttribute('Type') || '';
              const rId = rel.getAttribute('Id') || '';

              // If targets starting with "../media/" are copied
              if (target.startsWith('../media/')) {
                const originalMediaName = target.replace('../', 'ppt/');
                const mediaFile = subZip.file(originalMediaName);

                if (mediaFile) {
                  const mediaExt = target.substring(target.lastIndexOf('.'));
                  const newMediaTargetName = `../media/deck_${k}_slide_${slide.num}_rel_${rId}${mediaExt}`;
                  const newMediaZipName = `ppt/media/deck_${k}_slide_${slide.num}_rel_${rId}${mediaExt}`;

                  // Copy media file to baseZip
                  const mediaBlob = await mediaFile.async('blob');
                  baseZip.file(newMediaZipName, mediaBlob);

                  // Update target reference inside slide relationship file
                  rel.setAttribute('Target', newMediaTargetName);
                }
              }
            }
            slideRelsXmlText = serializeXml(relsDoc);
          }

          // Write slide.xml and slide.xml.rels into base zip
          baseZip.file(`ppt/slides/slide${nextIndex}.xml`, slideXmlText);
          if (slideRelsXmlText) {
            baseZip.file(`ppt/slides/_rels/slide${nextIndex}.xml.rels`, slideRelsXmlText);
          }

          // Add relationship reference inside presentation.xml.rels
          const newRelId = `rIdNew_${k}_${slide.num}`;
          const newRelNode = presRelsDoc.createElementNS('', 'Relationship');
          newRelNode.setAttribute('Id', newRelId);
          newRelNode.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide');
          newRelNode.setAttribute('Target', `slides/slide${nextIndex}.xml`);
          
          const relationshipsNode = presRelsDoc.getElementsByTagName('Relationships')[0];
          if (relationshipsNode) {
            relationshipsNode.appendChild(newRelNode);
          }

          // Add slide representation inside presentation.xml slide list (<p:sldIdLst>)
          const sldIdLstNode = presDoc.getElementsByTagName('p:sldIdLst')[0] || presDoc.getElementsByTagName('sldIdLst')[0];
          if (sldIdLstNode) {
            const sldIds = sldIdLstNode.getElementsByTagName('p:sldId') || sldIdLstNode.getElementsByTagName('sldId');
            let maxId = 255;
            for (let s = 0; s < sldIds.length; s++) {
              const currentId = parseInt(sldIds[s].getAttribute('id') || '0');
              if (currentId > maxId) maxId = currentId;
            }

            const newSldIdNode = presDoc.createElementNS('http://schemas.openxmlformats.org/presentationml/2006/main', 'p:sldId');
            newSldIdNode.setAttribute('id', (maxId + 1).toString());
            newSldIdNode.setAttribute('r:id', newRelId);
            sldIdLstNode.appendChild(newSldIdNode);
          }

          // Register slide content type in [Content_Types].xml
          const typesNode = contentTypesDoc.getElementsByTagName('Types')[0];
          if (typesNode) {
            const newOverrideNode = contentTypesDoc.createElementNS('http://schemas.openxmlformats.org/package/2006/content-types', 'Override');
            newOverrideNode.setAttribute('PartName', `/ppt/slides/slide${nextIndex}.xml`);
            newOverrideNode.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.presentationml.slide+xml');
            typesNode.appendChild(newOverrideNode);
          }
        }

        totalBaseSlides += subSlides.length;
      }

      // 3. Serialize and save modified configurations
      baseZip.file('ppt/presentation.xml', serializeXml(presDoc));
      baseZip.file('ppt/_rels/presentation.xml.rels', serializeXml(presRelsDoc));
      baseZip.file('[Content_Types].xml', serializeXml(contentTypesDoc));

      setCurrentTask('Compiling merged presentation...');
      setProgress(90);

      const outBlob = await baseZip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(outBlob);
      const outputFilename = `merged_presentation_${Date.now()}.pptx`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        size: outBlob.size,
        slideCount: totalBaseSlides
      });

      // Dispatch global history event
      const uploadId = 'ppt_merge_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'Merge PPT',
          size: outBlob.size,
          downloadUrl: downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to merge PowerPoint presentations. Make sure files are not corrupted.');
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {successResult ? (
          /* SUCCESS SCREEN */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <FileCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">PowerPoints Merged Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Combined presentations into a single file with {successResult.slideCount} slides.
              </p>
            </div>

            {/* File Info Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Presentation className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  PowerPoint Presentation · {formatSize(successResult.size)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={successResult.downloadUrl}
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download PowerPoint
              </a>
              <button
                onClick={resetTool}
                className="py-3 px-5 rounded-xl font-bold border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </motion.div>
        ) : processing ? (
          /* MERGING STATE SCREEN */
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-5 text-center"
          >
            <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
            <div>
              <h3 className="text-white font-bold text-base mb-1">{currentTask}</h3>
              <p className="text-slate-500 text-xs">Combining layout architectures and compiling. Do not close this tab.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-600"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        ) : files.length === 0 ? (
          /* UPLOAD ZONE */
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DropZone
              onFilesSelected={handleFilesSelected}
              multiple={true}
              selectedFiles={[]}
              onRemoveFile={() => {}}
            />
          </motion.div>
        ) : (
          /* FILE LIST WORKSPACE */
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-white font-bold text-base">Files to Combine</h3>
              <button
                onClick={resetTool}
                className="text-xs text-slate-500 hover:text-white transition-all font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* File List Grid */}
            <div className="flex flex-col gap-3">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <Presentation className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-white font-bold truncate max-w-[200px] sm:max-w-md">
                      {f.name}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      ({formatSize(f.size)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => moveFile(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white/2 border border-white/5 text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-all"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveFile(idx, 'down')}
                      disabled={idx === files.length - 1}
                      className="p-1.5 rounded-lg bg-white/2 border border-white/5 text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-all"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More Files Trigger */}
            <div className="flex justify-center border-t border-white/5 pt-4">
              <label className="cursor-pointer py-2 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-xs text-white font-bold flex items-center gap-1.5 transition-all">
                <Plus className="w-4 h-4" /> Add More Presentations
                <input
                  type="file"
                  multiple
                  accept=".pptx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  }}
                />
              </label>
            </div>

            {/* Footer Control Info & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4 mt-4">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] sm:text-xs">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Processes locally on your device · 100% Secure</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={resetTool}
                  className="flex-grow sm:flex-none py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-xs text-white font-bold transition-all shrink-0"
                >
                  Clear all
                </button>
                <button
                  onClick={handleMerge}
                  className="flex-grow sm:flex-none py-2.5 px-6 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-accent-primary/10 transition-all text-xs"
                >
                  Merge PPT <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Errors Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
