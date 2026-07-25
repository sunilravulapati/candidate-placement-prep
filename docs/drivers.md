# Driver Architecture Reference

PrepGenie's execution engine wraps user code using specialized driver wrappers depending on the problem domain and data structures involved.

## Driver Categories

| Driver Type | Problem Type | Use Cases | Memory / Input Handling |
|---|---|---|---|
| `DEFAULT` | Function | Primitive arrays, strings, numbers, grids | Reads `stdin`, parses params, prints output |
| `LINKED_LIST` | Function | Pointer manipulation (ListNode*) | Deserializes array into Linked List, serializes result back to array format |
| `TREE` | Function | Binary Tree / BST (TreeNode*) | Level-order tree construction from array, output tree serialization |
| `GRAPH` | Function | Graph traversal, adjacency matrices | Constructs adjacency list/matrix from edge lists |
| `COMMAND_SEQUENCE` | Class Design | Data structure design (LRU Cache, Queue) | Parses operation names and parameter arrays e.g. `["MyQueue","push","pop"]` |
| `MATRIX` | Function | Grid DFS/BFS, Matrix rotation | 2D vector / matrix serialization |
| `INTERACTIVE` | Interactive | Guess number, system calls | Interactive stdin/stdout streaming |

---

## Driver Selection Rule

Set `driverMetadata.driver` in `problem.json`:

```json
"driverMetadata": {
  "driver": "LINKED_LIST",
  "inputSerializers": ["LINKED_LIST", "INT", "INT"],
  "outputSerializer": "LINKED_LIST"
}
```
