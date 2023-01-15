import "isomorphic-fetch";
import { unzipSync } from "fflate";
import { XMLParser } from "fast-xml-parser";
import { TextDecoder } from "web-encoding";
import stripJsonComments from "strip-json-comments";
import { VSCodeTheme } from "./types";
import { dirname, join } from "./path";

interface QueryResponse {
  offset: number;
  totalSize: number;
  extensions: Extension[];
}

interface Extension {
  url: string;
  files: Files;
  name: string;
  namespace: string;
  version: string;
  timestamp: Date;
  averageRating?: number;
  downloadCount: number;
  displayName: string;
  description: string;
}

interface Files {
  download: string;
  icon?: string;
}

interface PackageManifest {
  Assets: Assets;
}

interface Assets {
  Asset: Asset[];
}

interface Asset {
  "@_Type": string;
  "@_Path": string;
}

interface PackageJSON {
  contributes: Contributes;
}

interface Contributes {
  themes: Theme[];
}

interface Theme {
  label: string;
  uiTheme: string;
  path: string;
}

export async function searchTheme(query: string): Promise<Extension[]> {
  const url = `https://open-vsx.org/api/-/search?query=${query}&category=Themes&offset=0&size=10&sortBy=relevance&sortOrder=desc`;

  console.info("Searching for themes:", query);

  const response = await fetch(url);
  if (!response.ok) return [];

  const result = (await response.json()) as QueryResponse;

  console.info("Found", result.totalSize, "themes");

  return result.extensions || [];
}

export async function downloadTheme(
  theme: Extension
): Promise<VSCodeTheme[] | undefined> {
  console.info("Getting", theme.name);

  const response = await fetch(theme.files.download);
  if (!response.ok) return;

  console.info("Parsing VSIX");

  const vsix = unzipSync(new Uint8Array(await response.arrayBuffer()));

  const manifest = vsix["extension.vsixmanifest"];
  if (!manifest) return;
  const parsedManifest = parseVSIXManifest(manifest);

  const packageJsonPath = parsedManifest.Assets.Asset.find(
    (a) => a["@_Type"] === "Microsoft.VisualStudio.Code.Manifest"
  )?.["@_Path"];
  if (!packageJsonPath) return;

  console.info("Found package.json at", packageJsonPath);

  const packageJsonRaw = vsix[packageJsonPath];
  if (!packageJsonRaw) return;

  const { contributes } = JSON.parse(
    new TextDecoder().decode(packageJsonRaw)
  ) as PackageJSON;

  if (!contributes || !contributes.themes || !contributes.themes.length) return;

  console.info(`Found ${contributes.themes.length} theme files`);

  const themes: VSCodeTheme[] = [];
  for (const theme of contributes.themes) {
    const themePath = join(dirname(packageJsonPath), theme.path);
    const vscodeTheme = JSON.parse(
      stripJsonComments(new TextDecoder().decode(vsix[themePath]))
    ) as VSCodeTheme;

    if (!vscodeTheme.type && theme.uiTheme) {
      vscodeTheme.type = theme.uiTheme === "vs-dark" ? "dark" : "light";
    }

    if (vscodeTheme.include) {
      const includedThemePath = join(dirname(themePath), vscodeTheme.include);
      const includedTheme = JSON.parse(
        stripJsonComments(new TextDecoder().decode(vsix[includedThemePath]))
      ) as VSCodeTheme;

      vscodeTheme.colors = { ...includedTheme.colors, ...vscodeTheme.colors };
      vscodeTheme.tokenColors = [
        ...vscodeTheme.tokenColors,
        ...includedTheme.tokenColors,
      ];
    }

    console.info("Collected", theme.label);

    themes.push(vscodeTheme);
  }

  return themes;
}

function parseVSIXManifest(manifest: Uint8Array) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(Buffer.from(manifest), {});
  const packageManifest = parsed["PackageManifest"] as PackageManifest;
  return packageManifest;
}
