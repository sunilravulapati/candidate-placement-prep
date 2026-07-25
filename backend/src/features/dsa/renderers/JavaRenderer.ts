// backend/src/features/dsa/renderers/JavaRenderer.ts

import { BaseRenderer } from './Renderer';

export class JavaRenderer extends BaseRenderer {
  render(): string {
    const { driverType, className, functionName, parameters } = this.ast;

    return `
import java.util.*;
import java.io.*;

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

${this.userCode}

public class Main {
    private static int[] parseIntArray(String s) {
        if (s == null || s.trim().isEmpty()) return new int[0];
        String cleaned = s.replaceAll("[^0-9,-]", "");
        if (cleaned.trim().isEmpty()) return new int[0];
        String[] parts = cleaned.split(",");
        List<Integer> list = new ArrayList<>();
        for (String p : parts) {
            if (!p.trim().isEmpty()) {
                list.add(Integer.parseInt(p.trim()));
            }
        }
        int[] res = new int[list.size()];
        for (int i = 0; i < list.size(); i++) res[i] = list.get(i);
        return res;
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

    private static void printArray(int[] arr) {
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

    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String line1 = reader.readLine();
        if (line1 == null) return;

        ${className} solver = new ${className}();

        ${
          driverType === 'LINKED_LIST'
            ? `
        int[] nums1 = parseIntArray(line1);
        ListNode head = arrayToListNode(nums1);
        ListNode res = solver.${functionName}(head);
        printList(res);
        `
            : parameters.length >= 2
            ? `
        int[] nums = parseIntArray(line1);
        String line2 = reader.readLine();
        int target = 0;
        if (line2 != null) {
            int[] tArr = parseIntArray(line2);
            if (tArr.length > 0) target = tArr[0];
        }
        int[] res = solver.${functionName}(nums, target);
        printArray(res);
        `
            : `
        int[] nums = parseIntArray(line1);
        Object res = solver.${functionName}(nums);
        if (res instanceof int[]) {
            printArray((int[]) res);
        } else {
            System.out.println(res);
        }
        `
        }
    }
}
`;
  }
}
