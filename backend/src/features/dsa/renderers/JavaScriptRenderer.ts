// backend/src/features/dsa/renderers/JavaScriptRenderer.ts

import { BaseRenderer } from './Renderer';

export class JavaScriptRenderer extends BaseRenderer {
  render(): string {
    const { driverType, className, functionName, designMethods } = this.ast;

    // Standard ListNode / TreeNode definitions if needed in environment
    const helpers = `
function ListNode(val, next) {
  this.val = (val===undefined ? 0 : val);
  this.next = (next===undefined ? null : next);
}

function TreeNode(val, left, right) {
  this.val = (val===undefined ? 0 : val);
  this.left = (left===undefined ? null : left);
  this.right = (right===undefined ? null : right);
}

function arrayToListNode(arr) {
  if (!arr || !arr.length) return null;
  let dummy = new ListNode(0);
  let curr = dummy;
  for (let val of arr) {
    curr.next = new ListNode(val);
    curr = curr.next;
  }
  return dummy.next;
}

function listNodeToArray(head) {
  let res = [];
  let curr = head;
  let visited = new Set();
  while (curr && !visited.has(curr)) {
    visited.add(curr);
    res.push(curr.val);
    curr = curr.next;
  }
  return res;
}

function arrayToTreeNode(arr) {
  if (!arr || !arr.length || arr[0] === null) return null;
  let root = new TreeNode(arr[0]);
  let queue = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    let curr = queue.shift();
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
      curr.left = new TreeNode(arr[i]);
      queue.push(curr.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
      curr.right = new TreeNode(arr[i]);
      queue.push(curr.right);
    }
    i++;
  }
  return root;
}

function treeNodeToArray(root) {
  if (!root) return [];
  let res = [];
  let queue = [root];
  while (queue.length > 0) {
    let node = queue.shift();
    if (node) {
      res.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      res.push(null);
    }
  }
  while (res.length > 0 && res[res.length - 1] === null) res.pop();
  return res;
}

function buildTree(rawStr) {
  if (!rawStr) return null;
  let s = rawStr.trim();
  if (s.startsWith('[') && s.endsWith(']')) {
    s = s.substring(1, s.length - 1).trim();
  }
  if (!s || s === '0') return null;
  let tokens = s.split(/[,\\s]+/).filter(Boolean);
  if (!tokens.length) return null;
  let startIdx = 0;
  let possibleCount = parseInt(tokens[0]);
  if (!isNaN(possibleCount) && possibleCount === tokens.length - 1) {
    startIdx = 1;
  }
  if (startIdx >= tokens.length) return null;
  if (tokens[startIdx] === 'null' || tokens[startIdx] === 'None') return null;
  let root = new TreeNode(parseInt(tokens[startIdx]));
  let queue = [root];
  let i = startIdx + 1;
  while (queue.length > 0 && i < tokens.length) {
    let curr = queue.shift();
    if (i < tokens.length) {
      let val = tokens[i++];
      if (val !== 'null' && val !== 'None') {
        curr.left = new TreeNode(parseInt(val));
        queue.push(curr.left);
      }
    }
    if (i < tokens.length) {
      let val = tokens[i++];
      if (val !== 'null' && val !== 'None') {
        curr.right = new TreeNode(parseInt(val));
        queue.push(curr.right);
      }
    }
  }
  return root;
}

function expandRanges(token) {
  return token.replace(/\\[([\\s\\S]*?)\\]/g, (_match, inner) => {
    return '[' + inner.replace(/\\b(\\d+)\\s*\\.\\.\\s*(\\d+)\\b/g, (_all, start, end) => {
      const s = parseInt(start, 10);
      const e = parseInt(end, 10);
      const length = e - s + 1;
      if (length <= 0 || length > 20000) {
        return s + ',' + e;
      }
      return Array.from({ length }, (_, i) => String(s + i)).join(',');
    }) + ']';
  });
}

function parseValue(token) {
  const trimmed = token.trim();
  try {
    return JSON.parse(trimmed);
  } catch (_err) {
    // ignore
  }

  const assignmentMatch = trimmed.match(/^[A-Za-z_][A-Za-z0-9_]*\\s*=\\s*(.*)$/);
  const candidate = assignmentMatch ? assignmentMatch[1].trim() : trimmed;
  const expanded = expandRanges(candidate);
  try {
    return JSON.parse(expanded);
  } catch (_err) {
    return candidate;
  }
}
`;

    if (driverType === 'COMMAND_SEQUENCE') {
      return `
${helpers}

${this.userCode}

(function() {
  const fs = require('fs');
  const inputData = fs.readFileSync(0, 'utf-8').trim();
  if (!inputData) return;
  const lines = inputData.split('\\n').filter(l => l.length > 0);
  
  try {
    let obj = null;
    let results = [];

    if (lines[0].trim().startsWith('[')) {
      const commands = JSON.parse(lines[0]);
      const args = JSON.parse(lines[1] || '[]');
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        const arg = args[i] || [];
        if (cmd === "${className}") {
          obj = new ${className}(...arg);
          results.push(null);
        } else if (obj && typeof obj[cmd] === 'function') {
          const ret = obj[cmd](...arg);
          results.push(ret === undefined ? null : ret);
        } else {
          results.push(null);
        }
      }
    } else {
      let lineIdx = 0;
      if (${className}.length === 1) {
        obj = new ${className}(parseInt(lines[0].trim()));
        lineIdx = 1;
      } else {
        obj = new ${className}();
        lineIdx = 0;
      }
      const opCount = lineIdx < lines.length ? parseInt(lines[lineIdx].trim()) : 0;
      lineIdx++;

      for (let i = lineIdx; i < lines.length && i < lineIdx + opCount; i++) {
        const parts = lines[i].trim().split(/\\s+/);
        if (!parts.length || !parts[0]) continue;
        const cmd = parts[0];
        const args = parts.slice(2).map(p => isNaN(p) ? p : Number(p));
        if (obj && typeof obj[cmd] === 'function') {
          const ret = obj[cmd](...args);
          results.push(ret === undefined ? null : ret);
        } else {
          results.push(null);
        }
      }
    }
    console.log(JSON.stringify(results));
  } catch (err) {
    console.error("Execution Error:", err.message);
    process.exit(1);
  }
})();
`;
    }

    if (driverType === 'LINKED_LIST') {
      return `
${helpers}

${this.userCode}

(function() {
  const fs = require('fs');
  const inputData = fs.readFileSync(0, 'utf-8').trim();
  if (!inputData) return;
  const lines = inputData.split('\\n').filter(l => l.length > 0);
  
  try {
    const rawArgs = lines.map(parseValue);
    // Convert first arg (or list args) to ListNode
    const args = rawArgs.map(arg => Array.isArray(arg) ? arrayToListNode(arg) : arg);
    const isClassMethod = ${this.userCode.includes(`class ${className}`)};
    let result;
    if (isClassMethod) {
      const solver = new ${className}();
      result = solver.${functionName}(...args);
    } else {
      result = ${functionName}(...args);
    }
    if (result && typeof result === 'object' && 'val' in result) {
      console.log(JSON.stringify(listNodeToArray(result)));
    } else {
      console.log(JSON.stringify(result));
    }
  } catch (err) {
    console.error("Execution Error:", err.message);
    process.exit(1);
  }
})();
`;
    }

    if (driverType === 'TREE') {
      return `
${helpers}

${this.userCode}

(function() {
  const fs = require('fs');
  const inputData = fs.readFileSync(0, 'utf-8').trim();
  if (!inputData) return;
  const lines = inputData.split('\\n').filter(l => l.length > 0);
  
  try {
    const isClassMethod = ${this.userCode.includes(`class ${className}`)};
    let solver = isClassMethod ? new ${className}() : null;
    let targetFn = solver ? solver['${functionName}'] : (typeof ${functionName} === 'function' ? ${functionName} : null);
    if (solver && !targetFn) {
      const props = Object.getOwnPropertyNames(Object.getPrototypeOf(solver)).filter(p => p !== 'constructor' && typeof solver[p] === 'function');
      if (props.length) targetFn = solver[props[0]].bind(solver);
    }
    const root = buildTree(inputData);
    let result = targetFn ? (solver ? targetFn.call(solver, root) : targetFn(root)) : null;
    if (result && typeof result === 'object' && 'val' in result) {
      console.log(JSON.stringify(treeNodeToArray(result)));
    } else {
      console.log(JSON.stringify(result));
    }
  } catch (err) {
    console.error("Execution Error:", err.message);
    process.exit(1);
  }
})();
`;
    }

    // Default FUNCTION Driver
    return `
${helpers}

${this.userCode}

(function() {
  const fs = require('fs');
  const inputData = fs.readFileSync(0, 'utf-8').trim();
  if (!inputData) return;
  const lines = inputData.split('\\n').filter(l => l.length > 0);
  
  try {
    const args = lines.map(parseValue);
    const isClassMethod = ${this.userCode.includes(`class ${className}`)};
    let solver = isClassMethod ? new ${className}() : null;
    let targetFn = solver ? solver['${functionName}'] : (typeof ${functionName} === 'function' ? ${functionName} : null);
    if (solver && typeof targetFn !== 'function') {
      const props = Object.getOwnPropertyNames(Object.getPrototypeOf(solver)).filter(p => p !== 'constructor' && typeof solver[p] === 'function');
      if (props.length) targetFn = solver[props[0]].bind(solver);
    }
    let result = targetFn ? (solver ? targetFn.call(solver, ...args) : targetFn(...args)) : null;
    console.log(JSON.stringify(result));
  } catch (err) {
    console.error("Execution Error:", err.message);
    process.exit(1);
  }
})();
`;
  }
}
