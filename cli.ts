import { searchTheme, downloadTheme } from "./src/theme-finder";
import { findProvider } from "./src/providers";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { writeFile } from "fs/promises";

const args = yargs(hideBin(process.argv)).argv as any;

async function main() {
  if (
    !args.provider ||
    (args.provider !== "kate" && args.provider !== "docgen")
  ) {
    console.error("Please specify provider. One of kate or docgen.");
    process.exit(-1);
  }

  if (!args.query) {
    console.error(
      "Please specify a valid query string. Note: themes are downloaded from open-vsx.org."
    );
    process.exit(-1);
  }

  const results = await searchTheme(args.query);
  if (results.length <= 0) {
    console.error("Nothing found.");
    process.exit(-1);
  }

  const themes = await downloadTheme(results[0]);
  if (!themes) {
    console.error("No themes found for this query.");
    process.exit(-1);
  }

  const provider = findProvider(args.provider);
  for (const theme of themes) {
    await writeFile(`${theme.name}.theme`, provider!.convert(theme));
  }
}
main();
