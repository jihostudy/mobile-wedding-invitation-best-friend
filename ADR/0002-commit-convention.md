# ADR-0002: Git Commit Convention

## Status

Accepted

---

## Format

```
<prefix>: #<issue> <short description>
```

Example: `feat: #12 Add product list API endpoint`

---

## Prefix

| Prefix     | When to use                                          |
| ---------- | ---------------------------------------------------- |
| `feat`     | New feature                                          |
| `fix`      | Bug fix                                              |
| `refactor` | Code restructuring without behavior change           |
| `chore`    | Build, CI, config, dependency, or tooling updates    |
| `style`    | Formatting, whitespace, semicolons (no logic change) |
| `docs`     | Documentation only                                   |
| `test`     | Add or update tests                                  |
| `revert`   | Revert a previous commit                             |

---

## Rules

1. Prefix is **required**.
2. Use lowercase for the prefix.
3. Short description: imperative mood, lowercase start, no period. Max ~72 chars.
4. Include `#<issue>` when the commit relates to a GitHub Issue.
5. One logical change per commit. Do not mix unrelated changes.

---

## Body (optional)

Add a blank line after the subject, then a body for context when needed.

```
feat: #5 Add category filter to product list

Support filtering by top-level category ID.
Adds query parameter `categoryId` to GET /api/products.
```

---

## References

- `.cursorrules` Agent Usage > Act Mode (commit format)
- Conventional Commits: https://www.conventionalcommits.org
