# Test Document for Markdown to PDF

This is a **test document** to verify the Markdown to PDF converter works correctly with multiple pages.

## Features Being Tested

1. **Multi-page content** - Does the PDF properly split across pages?
2. **Code blocks** - Do they stay within bounds and not overflow?
3. **Text rendering** - Is all text visible on every page?

## Code Example

Here is a code block that should wrap properly:

```javascript
function calculateComplexValue(inputArray, transformFunction, filterPredicate, reducerFunction, initialValue) {
    return inputArray
        .filter(filterPredicate)
        .map(transformFunction)
        .reduce(reducerFunction, initialValue);
}

const result = calculateComplexValue(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    (x) => x * x,
    (x) => x % 2 === 0,
    (acc, val) => acc + val,
    0
);
```

## Lorem Ipsum Content for Multi-Page Testing

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Section 3.1

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

### Section 3.2

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

| Feature | Status | Notes |
|---------|--------|-------|
| Page splitting | Testing | Should not cut through text |
| Code blocks | Testing | Should wrap within container |
| Tables | Testing | Should fit within page width |
| Images | N/A | Not tested in this document |

## Another Long Section

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.

Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.

## Final Section

This is the last section to verify all content renders correctly across all pages of the PDF.

> This is a blockquote that should be styled correctly with the theme colors and maintain proper formatting within the PDF output.

### Key Takeaways

- All text should be visible
- No blank/empty pages
- Code blocks should not overflow
- Tables should fit within margins
- Multi-page documents should work correctly

---

*End of test document*
