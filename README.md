# VSCode Theme Converter

This is a simple utility that downloads, parses & converts VSCode themes into various formats. Currently, only 2 providers are supported:

1. Kate (Kate Text Editor)
2. Docgen (Documentation generator)

**Note: This is still experimental and prone to crashing at any time.**

## Usage

Requirements:

1. Node.js
2. Git

```
npm run start -- --query material --provider kate
```

- `--query` is the search query for themes available at open-vsx.org
- `--provider` is one of `kate` or `docgen`

Converted themes get saved at current working directory. There's currently no way to change that.

## License

Copyright © 2023 Abdullah Atta under MIT. [Read full text here.](LICENSE)
