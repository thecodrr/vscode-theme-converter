import { schemes, resolveColorValue } from "../base";
import { VSCodeTheme } from "../types";
import { matchScope } from "../utils";

type EditorColors =
  | "BackgroundColor"
  | "BracketMatching"
  | "CodeFolding"
  | "CurrentLine"
  | "CurrentLineNumber"
  | "IconBorder"
  | "IndentationLine"
  | "LineNumbers"
  | "MarkBookmark"
  | "MarkBreakpointActive"
  | "MarkBreakpointDisabled"
  | "MarkBreakpointReached"
  | "MarkError"
  | "MarkExecution"
  | "MarkWarning"
  | "ModifiedLines"
  | "ReplaceHighlight"
  | "SavedLines"
  | "SearchHighlight"
  | "Separator"
  | "SpellChecking"
  | "TabMarker"
  | "TemplateBackground"
  | "TemplateFocusedPlaceholder"
  | "TemplatePlaceholder"
  | "TemplateReadOnlyPlaceholder"
  | "TextSelection"
  | "WordWrapMarker";

type TextStyles =
  | "Normal"
  | "Keyword"
  | "Function"
  | "Variable"
  | "ControlFlow"
  | "Operator"
  | "BuiltIn"
  | "Extension"
  | "Preprocessor"
  | "Attribute"
  | "DataType"
  | "DecVal"
  | "BaseN"
  | "Float"
  | "Constant"
  | "Char"
  | "SpecialChar"
  | "String"
  | "VerbatimString"
  | "SpecialString"
  | "Import"
  | "Comment"
  | "Documentation"
  | "Annotation"
  | "CommentVar"
  | "RegionMarker"
  | "Information"
  | "Warning"
  | "Alert"
  | "Error"
  | "Others";

type KateTextStyle = {
  bold?: boolean;
  "selected-text-color": string;
  "text-color": string;
  "background-color"?: string;
  "selected-background-color"?: string;
  italic?: boolean;
  underline?: boolean;
  "strike-through"?: boolean;
};

type KateTheme = {
  metadata: {
    name: string;
    revision: number;
  };
  "editor-colors": Record<EditorColors, string | undefined>;
  "text-styles": Record<TextStyles, KateTextStyle | undefined>;
  "custom-styles"?: Record<string, Record<string, KateTextStyle | undefined>>;
};

const KATE_DEFAULT_COLORS: Record<
  "light" | "dark",
  KateTheme["editor-colors"]
> = {
  light: {
    BackgroundColor: "#ffffff",
    CodeFolding: "#94caef",
    BracketMatching: "#ffff00",
    CurrentLine: "#f8f7f6",
    IconBorder: "#f0f0f0",
    IndentationLine: "#d2d2d2",
    LineNumbers: "#a0a0a0",
    CurrentLineNumber: "#1e1e1e",
    MarkBookmark: "#0000ff",
    MarkBreakpointActive: "#ff0000",
    MarkBreakpointReached: "#ffff00",
    MarkBreakpointDisabled: "#ff00ff",
    MarkExecution: "#a0a0a4",
    MarkWarning: "#00ff00",
    MarkError: "#ff0000",
    ModifiedLines: "#fdbc4b",
    ReplaceHighlight: "#00ff00",
    SavedLines: "#2ecc71",
    SearchHighlight: "#ffff00",
    TextSelection: "#94caef",
    Separator: "#d5d5d5",
    SpellChecking: "#bf0303",
    TabMarker: "#d2d2d2",
    TemplateBackground: "#d6d2d0",
    TemplatePlaceholder: "#baf8ce",
    TemplateFocusedPlaceholder: "#76da98",
    TemplateReadOnlyPlaceholder: "#f6e6e6",
    WordWrapMarker: "#ededed",
  },
  dark: {
    BackgroundColor: "#232629",
    CodeFolding: "#224e65",
    BracketMatching: "#8e44ad",
    CurrentLine: "#2A2E32",
    IconBorder: "#31363b",
    IndentationLine: "#3a3f44",
    LineNumbers: "#7a7c7d",
    CurrentLineNumber: "#a5a6a8",
    MarkBookmark: "#0404bf",
    MarkBreakpointActive: "#8b0607",
    MarkBreakpointReached: "#6d6e07",
    MarkBreakpointDisabled: "#820683",
    MarkExecution: "#4d4e50",
    MarkWarning: "#f67400",
    MarkError: "#da4453",
    ModifiedLines: "#c04900",
    ReplaceHighlight: "#808021",
    SavedLines: "#1c8042",
    SearchHighlight: "#218058",
    TextSelection: "#2d5c76",
    Separator: "#3f4347",
    SpellChecking: "#c0392b",
    TabMarker: "#4d4d4d",
    TemplateBackground: "#31363b",
    TemplatePlaceholder: "#123723",
    TemplateFocusedPlaceholder: "#123723",
    TemplateReadOnlyPlaceholder: "#4d1f24",
    WordWrapMarker: "#3a3f44",
  },
};

export default function convert(theme: VSCodeTheme): string {
  const baseTheme = schemes[theme.type || "light"];
  const themeColors = { ...baseTheme, ...theme.colors };

  function getColor(id: string) {
    const color = resolveColorValue(id, themeColors);
    if (!color) return;
    // Qt takes alpha hex colors as AARRGGBB instead of RRGGBBAA
    if (color.length === 9) {
      const alpha = color.slice(-2);
      const nonAlpha = color.slice(1, -2);
      return `#${alpha}${nonAlpha}`;
    }

    return color;
  }

  function toKateStyle(id: string): KateTextStyle | undefined {
    const style = theme.tokenColors.find((a) => matchScope(a.scope, id));

    if (!style && id !== "variable") return toKateStyle("variable");
    if (!style) return;

    const isBold = style.settings.bold || style.settings.fontStyle === "bold";
    const isItalic =
      style.settings.italic || style.settings.fontStyle === "italic";
    const isUnderline =
      style.settings.underline || style.settings.fontStyle === "underline";
    return {
      "text-color": style.settings.foreground,
      "selected-text-color": style.settings.foreground,
      bold: isBold || undefined,
      italic: isItalic || undefined,
      underline: isUnderline || undefined,
    };
  }

  const defaultKateTheme =
    theme.type === "dark"
      ? KATE_DEFAULT_COLORS.dark
      : KATE_DEFAULT_COLORS.light;

  const kateTheme: KateTheme = {
    metadata: { name: theme.name, revision: 1 },
    "editor-colors": {
      ...defaultKateTheme,
      BackgroundColor: getColor("editor.background"),
      IndentationLine: getColor("editorIndentGuide.background"),
      TextSelection: getColor("editor.selectionBackground"),
      LineNumbers: getColor("editorLineNumber.foreground"),
      CurrentLineNumber: getColor("editorLineNumber.activeForeground"),
      CurrentLine: getColor("editor.lineHighlightBackground"),
      SearchHighlight: getColor("editor.findMatchHighlightBackground"),
      ReplaceHighlight: getColor("editor.findMatchBackground"),
      BracketMatching: getColor("editorBracketMatch.background"),
      CodeFolding: getColor("editor.foldBackground"),
      SpellChecking: getColor("editorError.foreground"),
      ModifiedLines:
        getColor("editorGutter.modifiedBackground") ||
        getColor("editorOverviewRuler.modifiedForeground"),
      SavedLines:
        getColor("editorGutter.addedBackground") ||
        getColor("editorOverviewRuler.addedForeground"),
      MarkError: getColor("editorOverviewRuler.errorForeground"),
      MarkWarning: getColor("editorOverviewRuler.warningForeground"),
      MarkBookmark: getColor("editorOverviewRuler.infoForeground"),
      WordWrapMarker: getColor("editorGutter.foldingControlForeground"),
      IconBorder: getColor("editorGutter.background"),
      MarkBreakpointActive: getColor("debugIcon.breakpointForeground"),
      MarkBreakpointDisabled: getColor(
        "debugIcon.breakpointDisabledForeground"
      ),
      MarkBreakpointReached: getColor(
        "debugIcon.breakpointCurrentStackframeForeground"
      ),
      Separator: getColor("menu.separatorBackground"),
      TabMarker: getColor("editorWhitespace.foreground"),
    },
    "text-styles": {
      Normal: toKateStyle("variable"),
      Others: toKateStyle("variable"),
      Comment: toKateStyle("comment"),
      Keyword: toKateStyle("keyword"),
      ControlFlow: toKateStyle("keyword.control") || toKateStyle("keyword"),
      Function: toKateStyle("entity.name.function"),
      String: toKateStyle("string"),
      VerbatimString: toKateStyle("markup.raw"),
      SpecialString: toKateStyle("string.regexp"),
      SpecialChar:
        toKateStyle("constant.character.escape") ||
        toKateStyle("constant.character"),
      Char: toKateStyle("constant.character"),
      Import: toKateStyle("keyword.control") || toKateStyle("keyword"),
      Constant: toKateStyle("variable.other.constant"),
      Float: toKateStyle("constant.numeric"),
      DecVal: toKateStyle("constant.numeric"),
      BaseN: toKateStyle("constant.numeric"),
      DataType: toKateStyle("support.type"),
      Operator: toKateStyle("keyword.operator.*") || toKateStyle("keyword"),
      Variable: toKateStyle("variable"),
      BuiltIn: toKateStyle("variable"),
      Extension: toKateStyle("support.class"),
      Preprocessor: toKateStyle("meta.preprocessor"),
      Attribute: toKateStyle("variable"),
      // toKateStyle("entity.other.attribute") ||
      // toKateStyle("entity.other.attribute-name"),
      Error: toKateStyle("invalid"),

      Annotation: toKateStyle("keyword"),
      Warning: toKateStyle("keyword"),
      CommentVar: toKateStyle("variable"),
      Documentation:
        toKateStyle("comment.block.documentation") || toKateStyle("comment.*"),
      Information: {
        "selected-text-color": "#6a737d",
        "text-color": "#6a737d",
      },
      Alert: {
        "background-color": toKateStyle("comment")?.["text-color"],
        "text-color": "#ffffff",
        "selected-text-color": "#ffffff",
      },
      RegionMarker: {
        "background-color": toKateStyle("comment")?.["text-color"],
        "text-color": "#ffffff",
        "selected-text-color": "#ffffff",
      },
    },
    "custom-styles": {
      TypeScript: {
        Objects: toKateStyle("variable.other.constant"),
      },
      JavaScript: {
        Objects: toKateStyle("variable.other.constant"),
      },
      "TypeScript React (TSX)": {
        "Component Tag": toKateStyle("support.class"),
        Attribute: toKateStyle("entity.other.attribute-name"),
      },
      "JavaScript React (JSX)": {
        "Component Tag": toKateStyle("support.class"),
        Attribute: toKateStyle("entity.other.attribute-name"),
      },
      YAML: {
        Key: toKateStyle("entity.name.tag"),
        Attribute: toKateStyle("string.unquoted.plain.out.yaml"),
        "Literal/Folded Block": toKateStyle("string.unquoted.block.yaml"),
      },
    },
  };

  return JSON.stringify(kateTheme);
}
