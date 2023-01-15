import { schemes, resolveColorValue } from "../base";
import { VSCodeTheme } from "../types";

export default function convert(theme: VSCodeTheme): string {
  const type = theme.type || "light";
  const baseTheme = schemes[type];
  const themeColors = { ...baseTheme, ...theme.colors };

  function getColor(id: string) {
    return resolveColorValue(id, themeColors);
  }

  const primary =
    getColor("tab.activeBorder") ||
    getColor("focusBorder") ||
    getColor("statusBar.background");
  const doctaveTheme: Record<string, string | undefined> = {
    "--primary": primary,
    "--page-bg": getColor("editorWidget.background"),
    "--document-bg": getColor("editor.background"),
    "--document-fg": getColor("editor.foreground"),

    /* TYPOGRAPHY */
    "--heading": getColor("editor.foreground"),
    "--paragraph": getColor("editor.foreground"),
    "--link": getColor("textLink.foreground"),

    "--code-bg": getColor("textCodeBlock.background"),
    "--code-fg": getColor("editor.foreground"),
    "--blockquote-bg": getColor("textBlockQuote.background"),
    "--blockquote-fg": getColor("textBlockQuote.foreground"),
    "--blockquote-border": getColor("textBlockQuote.border"),

    "--input-bg": getColor("input.background") || "transparent",
    "--input-fg": getColor("input.foreground") || getColor("editor.foreground"),
    "--input-border":
      getColor("input.border") || getColor("focusBorder") || "transparent",
    "--input-placeholder": getColor("input.placeholderForeground"),

    "--hr": getColor("menu.separatorBackground"),

    /* STATES */
    "--hover-fg": getColor(""),
    "--hover-bg": getColor(""),
    "--active-fg": getColor(""),
    "--active-bg": getColor(""),
    "--focus-fg": getColor(""),
    "--focus-bg": getColor(""),
    "--selection-bg":
      getColor("selection.background") ||
      getColor("editor.selectionBackground"),

    "--hover-color": getColor(""),
    "--header-fg": primary,

    "--border-color": getColor("input.border") || getColor("dropdown.border"),
    "--fg": getColor("editor.foreground"),
    "--fg-dim": getColor("editorHint.foreground"),
    "--fg-dimmer": getColor("editorCodeLens.foreground"),
  };

  const codeblockCss = theme.tokenColors
    .map((color) => {
      const scopes =
        typeof color.scope === "string" ? [color.scope] : color.scope;
      const selector = scopes
        .map((scope) => `html.${type} pre .${scope.replace(/\.(\d+)/g, "_$1")}`)
        .join(",");
      const properties = [];
      for (const key in color.settings) {
        const value = color.settings[key as keyof typeof color.settings];
        if (!value) continue;
        switch (key === "fontStyle" ? value : key) {
          case "foreground":
            properties.push(`color: ${value};`);
            break;
          case "bold":
            properties.push(`font-weight: bold;`);
            break;
          case "italic":
            properties.push(`font-style: italic;`);
            break;
          case "underline":
            properties.push(`text-decoration-line: underline;`);
            break;
        }
      }
      return `${selector} {
        ${properties.join("\n")}
      }`;
    })
    .join("\n");

  const keys = Object.keys(doctaveTheme);

  return [
    `/* ${theme.name} */`,
    `html.${type} {
      ${keys
        .filter((key) => !!doctaveTheme[key])
        .map((key) => `${key}: ${doctaveTheme[key]};`)
        .join("\n")}
      }`,
    codeblockCss,
  ].join("\n\n");
}
