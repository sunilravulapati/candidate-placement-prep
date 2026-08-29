'use client';

import React, { forwardRef } from 'react';
import { TemplateId, Density, PaperSize } from './templates/types';
import { ModernTechTemplate } from './templates/ModernTechTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalAtsTemplate } from './templates/MinimalAtsTemplate';

interface HtmlRendererProps {
  resumeJson: any;
  templateId?: TemplateId;
  density?: Density;
  paperSize?: PaperSize;
  className?: string;
}

export const HtmlRenderer = forwardRef<HTMLDivElement, HtmlRendererProps>(
  function HtmlRenderer(
    {
      resumeJson,
      templateId = 'modern',
      density = 'standard',
      paperSize = 'a4',
      className = '',
    },
    ref
  ) {
    if (!resumeJson) {
      return (
        <div className="flex h-96 items-center justify-center p-8 text-center text-slate-500">
          No resume data available to preview.
        </div>
      );
    }

    const renderTemplate = () => {
      switch (templateId) {
        case 'classic':
          return <ClassicTemplate resumeJson={resumeJson} density={density} />;
        case 'minimal':
          return <MinimalAtsTemplate resumeJson={resumeJson} density={density} />;
        case 'modern':
        default:
          return <ModernTechTemplate resumeJson={resumeJson} density={density} />;
      }
    };

    // Standard paper dimensions
    // A4: 210mm x 297mm (~794px x 1123px at 96 DPI)
    // US Letter: 8.5in x 11in (216mm x 279mm, ~816px x 1056px at 96 DPI)
    const paperWidthStyle =
      paperSize === 'letter' ? 'w-full max-w-[216mm]' : 'w-full max-w-[210mm]';
    const paperMinHeightStyle =
      paperSize === 'letter' ? 'min-h-[279mm]' : 'min-h-[297mm]';

    return (
      <div className={`resume-print-wrapper ${className}`}>
        {/* Printable Paper Container */}
        <div
          ref={ref}
          id="resume-document-to-print"
          className={`resume-paper-container mx-auto ${paperWidthStyle} ${paperMinHeightStyle} bg-white text-slate-950 shadow-2xl rounded-sm print:rounded-none print:shadow-none print:m-0 print:w-full print:max-w-none print:p-0 transition-all`}
        >
          {renderTemplate()}
        </div>

        {/* Embedded Print CSS for accurate vector PDF printing */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            /* Hide all UI elements except the printable resume container */
            nav,
            header,
            aside,
            footer,
            button,
            .no-print,
            .editor-left-pane,
            .resume-toolbar {
              display: none !important;
            }
            .resume-print-wrapper {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            .resume-paper-container {
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
            }
            .page-break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            @page {
              size: ${paperSize === 'letter' ? 'letter' : 'A4'} portrait;
              margin: 12mm 10mm 12mm 10mm;
            }
          }
        `}</style>
      </div>
    );
  }
);
