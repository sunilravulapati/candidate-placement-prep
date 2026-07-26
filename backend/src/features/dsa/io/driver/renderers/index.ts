// backend/src/features/dsa/io/driver/renderers/index.ts

import { BaseLanguageRenderer } from './baseRenderer';
import { CppRenderer } from './cppRenderer';
import { JavaRenderer } from './javaRenderer';
import { PythonRenderer } from './pythonRenderer';
import { JavaScriptRenderer } from './javascriptRenderer';
import { TypeScriptRenderer } from './typescriptRenderer';
import { SupportedLanguage } from '../../canonical/types';

export {
  BaseLanguageRenderer,
  CppRenderer,
  JavaRenderer,
  PythonRenderer,
  JavaScriptRenderer,
  TypeScriptRenderer,
};

const renderers: Record<SupportedLanguage, BaseLanguageRenderer> = {
  cpp: new CppRenderer(),
  java: new JavaRenderer(),
  python: new PythonRenderer(),
  javascript: new JavaScriptRenderer(),
  typescript: new TypeScriptRenderer(),
};

export function getLanguageRenderer(lang: SupportedLanguage): BaseLanguageRenderer {
  const renderer = renderers[lang];
  if (!renderer) {
    throw new Error(`Unsupported target language for rendering: ${lang}`);
  }
  return renderer;
}
