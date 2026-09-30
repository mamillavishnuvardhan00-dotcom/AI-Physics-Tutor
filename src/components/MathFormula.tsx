import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!latex) return '';
    try {
      // Clean up common LaTeX delimiters
      const cleanLatex = latex
        .replace(/^\\\[|\\\]$/g, '')
        .replace(/^\$\$|\$\$$/g, '')
        .replace(/^\$|\$$/g, '')
        .trim();

      return katex.renderToString(cleanLatex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return '';
    }
  }, [latex, displayMode]);

  if (!html) {
    return (
      <span className={`font-serif italic text-blue-200 tracking-wide ${className}`}>
        {latex}
      </span>
    );
  }

  return (
    <span
      className={`inline-block select-text text-blue-100 ${displayMode ? 'my-2 overflow-x-auto max-w-full text-center' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
