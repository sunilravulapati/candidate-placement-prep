// backend/src/features/dsa/wrapperGenerator.ts

import { StarterMetadata, ExecutionMetadata, DriverMetadata, SupportedLanguage } from './canonicalTypes';
import { DefaultDriver } from './drivers/DefaultDriver';
import { LinkedListDriver } from './drivers/LinkedListDriver';
import { TreeDriver } from './drivers/TreeDriver';
import { GraphDriver } from './drivers/GraphDriver';
import { CommandSequenceDriver } from './drivers/CommandSequenceDriver';
import { MatrixDriver } from './drivers/MatrixDriver';

import { CppRenderer } from './renderers/CppRenderer';
import { JavaRenderer } from './renderers/JavaRenderer';
import { PythonRenderer } from './renderers/PythonRenderer';
import { JavaScriptRenderer } from './renderers/JavaScriptRenderer';
import { TypeScriptRenderer } from './renderers/TypeScriptRenderer';

export class WrapperGenerator {
  /**
   * Generates a hidden execution wrapper around the user's solution.
   */
  public static generateWrapper(
    metadata?: StarterMetadata | null,
    execMetadata?: ExecutionMetadata | null,
    userCode: string = '',
    lang: SupportedLanguage = 'java',
    driverMetadata?: DriverMetadata | null
  ): string {
    // Infer metadata if missing
    const resolvedMeta: StarterMetadata = metadata ? { ...metadata } : {
      className: 'Solution',
      functionName: 'solve',
      parameters: [],
      returnType: 'void',
    };

    const resolvedExec: ExecutionMetadata = execMetadata ? { ...execMetadata } : {
      problemType: 'FUNCTION',
      comparator: 'EXACT',
    };

    // Extract class name from user code if not explicitly provided
    const classMatch = userCode.match(/\bclass\s+([A-Za-z0-9_]+)/);
    if (classMatch) {
      const detectedClass = classMatch[1];
      if (detectedClass !== 'Solution' && detectedClass !== 'Main' && detectedClass !== 'TreeNode' && detectedClass !== 'ListNode') {
        resolvedMeta.className = detectedClass;
      }
    }

    // Extract function name if missing or defaulted to 'solve'
    if (!metadata || resolvedMeta.functionName === 'solve') {
      const pyMethod = userCode.match(/def\s+([A-Za-z0-9_]+)\s*\(\s*self/);
      if (pyMethod && pyMethod[1] !== '__init__') {
        resolvedMeta.functionName = pyMethod[1];
      } else {
        const javaCppMatch = userCode.match(/(?:public\s+|static\s+)?(?:List<[^>]+>|TreeNode\*?|ListNode\*?|int|void|boolean|bool|string|String|vector<[^>]+>)\s+([a-zA-Z][a-zA-Z0-9_]*)\s*\(/);
        if (javaCppMatch && javaCppMatch[1] !== 'main') {
          resolvedMeta.functionName = javaCppMatch[1];
        } else {
          // JS/TS class method: e.g. levelOrder(root) {
          const jsMethodMatch = userCode.match(/\b([a-zA-Z][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/g);
          if (jsMethodMatch) {
            for (const m of jsMethodMatch) {
              const name = m.split('(')[0].trim();
              if (!['if', 'for', 'while', 'switch', 'catch', 'function', 'constructor', 'Solution'].includes(name)) {
                resolvedMeta.functionName = name;
                break;
              }
            }
          }
        }
      }
    }

    // Infer driver type from code clues if not set
    let inferredDriver: 'COMMAND_SEQUENCE' | 'LINKED_LIST' | 'TREE' | 'GRAPH' | 'MATRIX' | 'DEFAULT' = 'DEFAULT';
    const isDesignClass =
      resolvedMeta.className !== 'Solution' &&
      resolvedMeta.className !== 'Main' &&
      resolvedMeta.className !== 'TreeNode' &&
      resolvedMeta.className !== 'ListNode';

    if (isDesignClass || userCode.includes('class LRUCache') || userCode.includes('class MinStack') || userCode.includes('class Trie')) {
      inferredDriver = 'COMMAND_SEQUENCE';
      resolvedExec.problemType = 'DESIGN';
      resolvedMeta.problemType = 'DESIGN';
    } else if (userCode.includes('TreeNode') || userCode.includes('.left') || userCode.includes('.right')) {
      inferredDriver = 'TREE';
      resolvedExec.comparator = 'TREE';
    } else if (userCode.includes('ListNode') || userCode.includes('.next')) {
      inferredDriver = 'LINKED_LIST';
      resolvedExec.comparator = 'LINKED_LIST';
    }

    const dMeta: DriverMetadata = driverMetadata || {
      driver:
        resolvedExec.problemType === 'DESIGN' || resolvedMeta.problemType === 'DESIGN'
          ? 'COMMAND_SEQUENCE'
          : resolvedExec.comparator === 'LINKED_LIST'
          ? 'LINKED_LIST'
          : resolvedExec.comparator === 'TREE'
          ? 'TREE'
          : resolvedExec.comparator === 'GRAPH'
          ? 'GRAPH'
          : resolvedExec.comparator === 'MATRIX'
          ? 'MATRIX'
          : inferredDriver,
    };

    // 1. Select Driver
    let driver;
    switch (dMeta.driver) {
      case 'LINKED_LIST':
        driver = new LinkedListDriver(resolvedMeta, resolvedExec, dMeta);
        break;
      case 'TREE':
        driver = new TreeDriver(resolvedMeta, resolvedExec, dMeta);
        break;
      case 'GRAPH':
        driver = new GraphDriver(resolvedMeta, resolvedExec, dMeta);
        break;
      case 'COMMAND_SEQUENCE':
        driver = new CommandSequenceDriver(resolvedMeta, resolvedExec, dMeta);
        break;
      case 'MATRIX':
        driver = new MatrixDriver(resolvedMeta, resolvedExec, dMeta);
        break;
      case 'DEFAULT':
      default:
        driver = new DefaultDriver(resolvedMeta, resolvedExec, dMeta);
        break;
    }

    // 2. Build AST
    const ast = driver.buildAST();

    // 3. Render for Language
    switch (lang) {
      case 'cpp':
        return new CppRenderer(ast, userCode).render();
      case 'java':
        return new JavaRenderer(ast, userCode).render();
      case 'python':
        return new PythonRenderer(ast, userCode).render();
      case 'javascript':
        return new JavaScriptRenderer(ast, userCode).render();
      case 'typescript':
        return new TypeScriptRenderer(ast, userCode).render();
    }
  }
}
