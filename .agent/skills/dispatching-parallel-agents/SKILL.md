# Dispatching Parallel Agents Skill

Parallelize only independent work.
- Give each agent a clearly bounded task and file scope.
- Avoid parallel edits to the same files.
- Define a shared contract before splitting work.
- Integrate results deliberately.
- Run full verification after integration.
- Prefer sequential work when dependencies or shared state make parallel changes risky.
