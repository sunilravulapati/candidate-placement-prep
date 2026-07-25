# Canonical Type System Specification

PrepGenie uses a unified, language-independent canonical type system to represent data structures across C++, Java, Python, JavaScript, and TypeScript execution environments.

## Supported Canonical Types

| Canonical Type | Description | C++ | Java | Python | JS/TS |
|---|---|---|---|---|---|
| `int` | 32-bit signed integer | `int` | `int` | `int` | `number` |
| `long` | 64-bit signed integer | `long long` | `long` | `int` | `number` |
| `double` | Floating point number | `double` | `double` | `float` | `number` |
| `string` | UTF-8 string | `string` | `String` | `str` | `string` |
| `bool` | Boolean value | `bool` | `boolean` | `bool` | `boolean` |
| `array<T>` | 1D array of canonical type T | `vector<T>` | `T[]` | `List[T]` | `T[]` |
| `matrix<T>` | 2D array / grid of type T | `vector<vector<T>>` | `T[][]` | `List[List[T]]` | `T[][]` |
| `ListNode*` | Singly linked list node | `ListNode*` | `ListNode` | `Optional[ListNode]` | `ListNode \| null` |
| `TreeNode*` | Binary tree node | `TreeNode*` | `TreeNode` | `Optional[TreeNode]` | `TreeNode \| null` |
| `void` | No return value | `void` | `void` | `None` | `void` |

---

## Type Serialization Rules

1. **`ARRAY_INT`**: Input string format `"[1,2,3,4]"` parsed into native arrays.
2. **`NESTED_ARRAY`**: Input string format `"[[1,2],[3,4]]"` parsed into nested matrices.
3. **`LINKED_LIST`**: Input format `"[1,2,3]"` deserialized into linked nodes (`val`, `next`).
4. **`TREE`**: Level-order serialization e.g. `"[1,2,3,null,null,4,5]"` deserialized into `TreeNode` pointers.
