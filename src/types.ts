import { schemes } from "./base";

export type VSCodeTheme = {
  type: keyof typeof schemes;
  name: string;
  colors: Record<string, string>;
  include?: string;
  tokenColors: {
    scope: string | string[];
    settings: {
      foreground: string;
      bold: boolean;
      italic: boolean;
      underline: boolean;
    } & {
      foreground: string;
      fontStyle: "bold" | "italic" | "underline";
    };
  }[];
};
