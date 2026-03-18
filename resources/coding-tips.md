# Coding Tips & Best Practices

## Problem-Solving Approach
1. **Read carefully**: Understand input/output format, constraints, edge cases
2. **Plan first**: Sketch an algorithm before coding
3. **Start simple**: Brute force first, then optimize
4. **Test mentally**: Trace through examples by hand
5. **Edge cases**: Empty input, single element, negative numbers, overflow

## Time Complexity Guide
- O(1) - Constant: hash map lookups, array indexing
- O(log n) - Logarithmic: binary search, balanced BST operations
- O(n) - Linear: single pass through array
- O(n log n) - Linearithmic: merge sort, heap sort
- O(n²) - Quadratic: nested loops (avoid for n > 10,000)
- O(2^n) - Exponential: brute force recursion (avoid for n > 20)

## Common Data Structures
- **Arrays**: Fast index access, slow insert/delete
- **Hash Maps**: O(1) average lookup, great for frequency counting
- **Sets**: Fast membership testing, deduplication
- **Stacks**: LIFO, useful for matching brackets, undo operations
- **Queues**: FIFO, useful for BFS, sliding window
- **Heaps**: Fast min/max operations, priority queues
- **Trees/Graphs**: Hierarchical/networked data

## Algorithm Patterns

### Two Pointers
Use when: sorted array, finding pairs, palindrome check
```python
left, right = 0, len(arr) - 1
while left < right:
    # process arr[left] and arr[right]
    left += 1; right -= 1
```

### Sliding Window
Use when: contiguous subarray/substring problems
```python
window_sum = sum(arr[:k])
for i in range(k, len(arr)):
    window_sum += arr[i] - arr[i-k]
```

### Binary Search
Use when: sorted array, search space can be halved
```python
lo, hi = 0, len(arr) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if arr[mid] == target: return mid
    elif arr[mid] < target: lo = mid + 1
    else: hi = mid - 1
```

### BFS (Breadth-First Search)
Use when: shortest path, level-order traversal
```python
from collections import deque
queue = deque([start])
visited = {start}
while queue:
    node = queue.popleft()
    for neighbor in graph[node]:
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)
```

### Dynamic Programming
Use when: optimal substructure, overlapping subproblems
```python
# Bottom-up example: Fibonacci
dp = [0] * (n + 1)
dp[1] = 1
for i in range(2, n + 1):
    dp[i] = dp[i-1] + dp[i-2]
```

## Language-Specific Tips

### Python
- Use `collections.Counter` for frequency counting
- `collections.defaultdict` for adjacency lists
- List comprehensions are faster than loops
- `heapq` for priority queues (min-heap by default)
- `bisect` for binary search on sorted lists

### JavaScript
- Use `Map` and `Set` instead of plain objects for clarity
- Array destructuring: `const [a, b] = arr`
- Optional chaining: `obj?.prop?.nested`
- Use `BigInt` for very large numbers

### Java
- `HashMap`, `HashSet`, `PriorityQueue` from java.util
- Use `StringBuilder` instead of string concatenation in loops
- `Arrays.sort()` is O(n log n)
- Avoid autoboxing in tight loops

## Common Mistakes to Avoid
1. **Integer overflow**: Use long/Int64 when needed
2. **Off-by-one errors**: Be careful with loop bounds
3. **Null/None handling**: Always check for null/None
4. **Modifying array while iterating**: Copy first or iterate backwards
5. **Forgetting base cases** in recursion
6. **Stack overflow**: Use iterative or increase recursion limit for deep recursion
