// backend/src/features/dsa/renderers/JavaRenderer.ts

import { BaseRenderer } from './Renderer';

export class JavaRenderer extends BaseRenderer {
  render(): string {
    const { driverType, className = 'Solution', functionName = 'solve', parameters = [] } = this.ast;

    // Check if user already provided a full program with public static void main
    const codeWithoutComments = this.userCode
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '');
    const hasUserMain = /\bpublic\s+static\s+void\s+main\s*\(/m.test(codeWithoutComments);

    if (hasUserMain) {
      return `
import java.util.*;
import java.io.*;

${this.userCode}
`;
    }

    // Strip 'public' modifier from user classes so only Main is public in single-file compilation
    const safeUserCode = this.userCode
      .replace(/\bpublic\s+class\s+/g, 'class ')
      .replace(/\bpublic\s+interface\s+/g, 'interface ');

    const isDesign = driverType === 'COMMAND_SEQUENCE';
    const isTree = driverType === 'TREE';
    const isLinkedList = driverType === 'LINKED_LIST';

    return `
import java.util.*;
import java.io.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String l;
        while ((l = br.readLine()) != null) {
            sb.append(l).append("\\n");
        }
        String inputStr = sb.toString().trim();

        ${
          isDesign
            ? `
        runCommandSequence(inputStr);
        `
            : isTree
            ? `
        runTreeProblem(inputStr);
        `
            : isLinkedList
            ? `
        runLinkedListProblem(inputStr);
        `
            : `
        runDefaultProblem(inputStr);
        `
        }
    }

    ${
      isDesign
        ? `
    // ── Command Sequence (Design Problems: LRUCache, MinStack, Trie, etc.) ──
    private static void runCommandSequence(String inputStr) throws Exception {
        if (inputStr.isEmpty()) {
            System.out.println("[]");
            return;
        }

        List<String> commands = new ArrayList<>();
        List<List<Object>> argList = new ArrayList<>();

        String[] lines = inputStr.split("\\r?\\n");
        String line1 = lines[0].trim();

        Object instance = null;
        List<String> output = new ArrayList<>();

        if (line1.startsWith("[")) {
            // LeetCode JSON format: line1 = commands, line2 = arguments
            commands = parseStringList(line1);
            argList = parseNestedArgs(lines.length > 1 ? lines[1].trim() : "[]");
        } else {
            // Stream format: configuration params (if any) precede op count, followed by operations
            Constructor<?>[] ctors = ${className}.class.getConstructors();
            Constructor<?> bestCtor = ctors.length > 0 ? ctors[0] : null;
            int ctorParamCount = bestCtor != null ? bestCtor.getParameterCount() : 0;

            int lineIdx = 0;
            if (ctorParamCount == 1) {
                int firstParam = 0;
                try {
                    firstParam = Integer.parseInt(lines[0].trim());
                } catch (Exception ignored) {}
                if (bestCtor != null) {
                    instance = bestCtor.newInstance(firstParam);
                }
                lineIdx = 1;
            } else {
                if (bestCtor != null) {
                    instance = bestCtor.newInstance();
                }
                lineIdx = 0;
            }

            int opCount = lineIdx < lines.length ? Integer.parseInt(lines[lineIdx].trim()) : 0;
            lineIdx++;

            for (int i = lineIdx; i < lines.length && i < lineIdx + opCount; i++) {
                String[] parts = lines[i].trim().split("\\s+");
                if (parts.length == 0 || parts[0].isEmpty()) continue;
                commands.add(parts[0]);
                List<Object> mArgs = new ArrayList<>();
                int aCount = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
                for (int j = 0; j < aCount && j + 2 < parts.length; j++) {
                    String token = parts[j + 2];
                    try {
                        mArgs.add(Integer.parseInt(token));
                    } catch (Exception e) {
                        mArgs.add(token);
                    }
                }
                argList.add(mArgs);
            }
        }

        for (int i = 0; i < commands.size(); i++) {
            String cmd = commands.get(i);
            List<Object> mArgs = i < argList.size() ? argList.get(i) : new ArrayList<>();

            if (cmd.equals("${className}")) {
                Constructor<?>[] ctors = ${className}.class.getConstructors();
                Constructor<?> bestCtor = null;
                for (Constructor<?> c : ctors) {
                    if (c.getParameterCount() == mArgs.size()) {
                        bestCtor = c;
                        break;
                    }
                }
                if (bestCtor != null) {
                    Object[] cArgs = new Object[mArgs.size()];
                    Class<?>[] pTypes = bestCtor.getParameterTypes();
                    for (int j = 0; j < mArgs.size(); j++) {
                        cArgs[j] = castValue(mArgs.get(j), pTypes[j]);
                    }
                    instance = bestCtor.newInstance(cArgs);
                } else if (ctors.length > 0) {
                    instance = ctors[0].newInstance();
                }
                output.add("null");
            } else if (instance != null) {
                Method target = null;
                for (Method m : instance.getClass().getMethods()) {
                    if (m.getName().equalsIgnoreCase(cmd) && m.getParameterCount() == mArgs.size()) {
                        target = m;
                        break;
                    }
                }
                if (target != null) {
                    Object[] invokeArgs = new Object[mArgs.size()];
                    Class<?>[] pTypes = target.getParameterTypes();
                    for (int j = 0; j < mArgs.size(); j++) {
                        invokeArgs[j] = castValue(mArgs.get(j), pTypes[j]);
                    }
                    Object ret = target.invoke(instance, invokeArgs);
                    if (target.getReturnType().equals(void.class) || ret == null) {
                        output.add("null");
                    } else {
                        output.add(String.valueOf(ret));
                    }
                } else {
                    output.add("null");
                }
            } else {
                output.add("null");
            }
        }
        System.out.println("[" + String.join(",", output) + "]");
    }
    `
        : isTree
        ? `
    // ── Tree Problem Driver ──────────────────────────────────────────────────
    private static void runTreeProblem(String inputStr) throws Exception {
        TreeNode root = buildTree(inputStr);
        ${className} solver = new ${className}();
        
        Method target = null;
        for (Method m : ${className}.class.getMethods()) {
            if (m.getName().equals("${functionName}")) {
                target = m;
                break;
            }
        }
        if (target == null) {
            for (Method m : ${className}.class.getDeclaredMethods()) {
                if (!m.getName().equals("main")) {
                    target = m;
                    break;
                }
            }
        }

        if (target != null) {
            Object[] invokeArgs = new Object[target.getParameterCount()];
            if (invokeArgs.length > 0) invokeArgs[0] = root;
            Object res = target.invoke(solver, invokeArgs);
            printResult(res);
        }
    }
    `
        : isLinkedList
        ? `
    // ── Linked List Driver ───────────────────────────────────────────────────
    private static void runLinkedListProblem(String inputStr) throws Exception {
        int[] nums = parseIntArray(inputStr);
        ListNode head = arrayToListNode(nums);
        ${className} solver = new ${className}();

        Method target = null;
        for (Method m : ${className}.class.getMethods()) {
            if (m.getName().equals("${functionName}")) {
                target = m;
                break;
            }
        }
        if (target == null) {
            for (Method m : ${className}.class.getDeclaredMethods()) {
                if (!m.getName().equals("main")) {
                    target = m;
                    break;
                }
            }
        }

        if (target != null) {
            Object[] invokeArgs = new Object[target.getParameterCount()];
            if (invokeArgs.length > 0) invokeArgs[0] = head;
            Object res = target.invoke(solver, invokeArgs);
            printResult(res);
        }
    }
    `
        : `
    // ── Default Function Driver ──────────────────────────────────────────────
    private static void runDefaultProblem(String inputStr) throws Exception {
        String[] lines = inputStr.split("\\r?\\n");
        ${className} solver = new ${className}();

        Method target = null;
        for (Method m : ${className}.class.getMethods()) {
            if (m.getName().equals("${functionName}")) {
                target = m;
                break;
            }
        }
        if (target == null) {
            for (Method m : ${className}.class.getDeclaredMethods()) {
                if (!m.getName().equals("main")) {
                    target = m;
                    break;
                }
            }
        }

        if (target != null) {
            Class<?>[] pTypes = target.getParameterTypes();
            Object[] invokeArgs = new Object[pTypes.length];

            for (int i = 0; i < pTypes.length; i++) {
                String line = i < lines.length ? lines[i] : "";
                invokeArgs[i] = parseArgument(line, pTypes[i]);
            }
            Object res = target.invoke(solver, invokeArgs);
            printResult(res);
        }
    }
    `
    }

    // ── Helper Utilities ─────────────────────────────────────────────────────
    private static Object castValue(Object val, Class<?> targetType) {
        if (val == null) return null;
        if (targetType.equals(int.class) || targetType.equals(Integer.class)) {
            return val instanceof Number ? ((Number) val).intValue() : Integer.parseInt(val.toString().trim());
        }
        if (targetType.equals(long.class) || targetType.equals(Long.class)) {
            return val instanceof Number ? ((Number) val).longValue() : Long.parseLong(val.toString().trim());
        }
        if (targetType.equals(double.class) || targetType.equals(Double.class)) {
            return val instanceof Number ? ((Number) val).doubleValue() : Double.parseDouble(val.toString().trim());
        }
        if (targetType.equals(boolean.class) || targetType.equals(Boolean.class)) {
            return Boolean.parseBoolean(val.toString().trim());
        }
        if (targetType.equals(String.class)) {
            return val.toString();
        }
        return val;
    }

    private static Object parseArgument(String s, Class<?> type) {
        s = s.trim();
        if (type.equals(int[].class)) return parseIntArray(s);
        if (type.equals(int.class) || type.equals(Integer.class)) {
            int[] arr = parseIntArray(s);
            return arr.length > 0 ? arr[0] : 0;
        }
        if (type.equals(String.class)) return s.replace('"', ' ').trim();
        return s;
    }

    private static TreeNode buildTree(String s) {
        if (s == null) return null;
        s = s.trim();
        if (s.isEmpty() || s.equals("[]") || s.equals("0")) return null;

        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);

        String[] rawTokens = s.split("[,\\\\s]+");
        List<String> tokens = new ArrayList<>();
        for (String t : rawTokens) {
            String trimmed = t.trim();
            if (!trimmed.isEmpty()) tokens.add(trimmed);
        }
        if (tokens.isEmpty()) return null;

        int startIndex = 0;
        try {
            int possibleCount = Integer.parseInt(tokens.get(0));
            if (possibleCount == tokens.size() - 1) {
                startIndex = 1;
            }
        } catch (Exception ignored) {}

        if (startIndex >= tokens.size()) return null;
        String rootVal = tokens.get(startIndex);
        if (rootVal.equalsIgnoreCase("null")) return null;

        TreeNode root = new TreeNode(Integer.parseInt(rootVal));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int i = startIndex + 1;

        while (!queue.isEmpty() && i < tokens.size()) {
            TreeNode curr = queue.poll();
            if (i < tokens.size()) {
                String leftVal = tokens.get(i++);
                if (!leftVal.equalsIgnoreCase("null") && !leftVal.isEmpty()) {
                    curr.left = new TreeNode(Integer.parseInt(leftVal));
                    queue.offer(curr.left);
                }
            }
            if (i < tokens.size()) {
                String rightVal = tokens.get(i++);
                if (!rightVal.equalsIgnoreCase("null") && !rightVal.isEmpty()) {
                    curr.right = new TreeNode(Integer.parseInt(rightVal));
                    queue.offer(curr.right);
                }
            }
        }
        return root;
    }

    private static ListNode arrayToListNode(int[] nums) {
        if (nums == null || nums.length == 0) return null;
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int v : nums) {
            curr.next = new ListNode(v);
            curr = curr.next;
        }
        return dummy.next;
    }

    private static int[] parseIntArray(String s) {
        if (s == null || s.trim().isEmpty()) return new int[0];
        String cleaned = s.replaceAll("[^0-9,-]", "");
        if (cleaned.trim().isEmpty()) return new int[0];
        String[] parts = cleaned.split(",");
        List<Integer> list = new ArrayList<>();
        for (String p : parts) {
            if (!p.trim().isEmpty()) {
                try {
                    list.add(Integer.parseInt(p.trim()));
                } catch (Exception ignored) {}
            }
        }
        int[] res = new int[list.size()];
        for (int i = 0; i < list.size(); i++) res[i] = list.get(i);
        return res;
    }

    private static List<String> parseStringList(String s) {
        List<String> list = new ArrayList<>();
        s = s.replace('[', ' ').replace(']', ' ').replace('"', ' ');
        for (String p : s.split(",")) {
            if (!p.trim().isEmpty()) list.add(p.trim());
        }
        return list;
    }

    private static List<List<Object>> parseNestedArgs(String s) {
        List<List<Object>> res = new ArrayList<>();
        s = s.trim();
        if (s.startsWith("[")) s = s.substring(1);
        if (s.endsWith("]")) s = s.substring(0, s.length() - 1);
        int i = 0;
        while (i < s.length()) {
            int start = s.indexOf('[', i);
            if (start == -1) break;
            int end = s.indexOf(']', start);
            if (end == -1) break;
            String inner = s.substring(start + 1, end).trim();
            List<Object> sub = new ArrayList<>();
            if (!inner.isEmpty()) {
                for (String p : inner.split(",")) {
                    p = p.trim().replace('"', ' ').trim();
                    if (!p.isEmpty()) {
                        try {
                            sub.add(Integer.parseInt(p));
                        } catch (Exception e) {
                            sub.add(p);
                        }
                    }
                }
            }
            res.add(sub);
            i = end + 1;
        }
        return res;
    }

    private static void printResult(Object obj) {
        if (obj == null) {
            System.out.println("null");
        } else if (obj instanceof TreeNode) {
            printTree((TreeNode) obj);
        } else if (obj instanceof ListNode) {
            printList((ListNode) obj);
        } else if (obj instanceof List) {
            System.out.println(formatList((List<?>) obj));
        } else if (obj instanceof int[]) {
            printArray((int[]) obj);
        } else if (obj instanceof int[][]) {
            print2DArray((int[][]) obj);
        } else if (obj instanceof boolean[]) {
            printBoolArray((boolean[]) obj);
        } else {
            System.out.println(obj);
        }
    }

    private static String formatList(List<?> list) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < list.size(); i++) {
            Object item = list.get(i);
            if (item instanceof List) {
                sb.append(formatList((List<?>) item));
            } else if (item == null) {
                sb.append("null");
            } else {
                sb.append(item.toString());
            }
            if (i + 1 < list.size()) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private static void printArray(int[] arr) {
        System.out.print("[");
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + (i + 1 == arr.length ? "" : ","));
        }
        System.out.println("]");
    }

    private static void print2DArray(int[][] arr) {
        System.out.print("[");
        for (int i = 0; i < arr.length; i++) {
            printArray(arr[i]);
            if (i + 1 < arr.length) System.out.print(",");
        }
        System.out.println("]");
    }

    private static void printBoolArray(boolean[] arr) {
        System.out.print("[");
        for (int i = 0; i < arr.length; i++) {
            System.out.print(arr[i] + (i + 1 == arr.length ? "" : ","));
        }
        System.out.println("]");
    }

    private static void printList(ListNode head) {
        List<Integer> list = new ArrayList<>();
        ListNode curr = head;
        while (curr != null) {
            list.add(curr.val);
            curr = curr.next;
        }
        int[] arr = new int[list.size()];
        for (int i = 0; i < list.size(); i++) arr[i] = list.get(i);
        printArray(arr);
    }

    private static void printTree(TreeNode root) {
        if (root == null) {
            System.out.println("[]");
            return;
        }
        List<String> list = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node != null) {
                list.add(String.valueOf(node.val));
                queue.offer(node.left);
                queue.offer(node.right);
            } else {
                list.add("null");
            }
        }
        while (!list.isEmpty() && list.get(list.size() - 1).equals("null")) {
            list.remove(list.size() - 1);
        }
        System.out.println("[" + String.join(",", list) + "]");
    }
}

// ── Standard Data Structures for User Solutions ─────────────────────────────
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

${safeUserCode}
`;
  }
}

