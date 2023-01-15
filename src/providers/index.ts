import { VSCodeTheme } from "../types";
import docgen from "./docgen";
import kate from "./kate";

interface IThemeProvider {
  id: string;
  convert(theme: VSCodeTheme): string;
}

const providers: IThemeProvider[] = [
  { id: "docgen", convert: docgen },
  { id: "kate", convert: kate },
];

export function findProvider(id: string): IThemeProvider | undefined {
  return providers.find((p) => p.id === id);
}

export function allProviders() {
  return providers.map((a) => a.id);
}
