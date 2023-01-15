/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import tinycolor2 from "tinycolor2";

//  ------ API types

type ColorIdentifier = string;

const enum ColorTransformType {
  Darken,
  Lighten,
  Transparent,
  OneOf,
  LessProminent,
  IfDefinedThenElse,
}

type ColorTransform =
  | { op: ColorTransformType.Darken; value: ColorValue; factor: number }
  | { op: ColorTransformType.Lighten; value: ColorValue; factor: number }
  | { op: ColorTransformType.Transparent; value: ColorValue; factor: number }
  | { op: ColorTransformType.OneOf; values: readonly ColorValue[] }
  | {
      op: ColorTransformType.LessProminent;
      value: ColorValue;
      background: ColorValue;
      factor: number;
      transparency: number;
    }
  | {
      op: ColorTransformType.IfDefinedThenElse;
      if: ColorIdentifier;
      then: ColorValue;
      else: ColorValue;
    };

interface ColorDefaults {
  light: ColorValue | null;
  dark: ColorValue | null;
  hcDark: ColorValue | null;
  hcLight: ColorValue | null;
}

const Color = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  blue: "#0000ff",
  green: "#00ff00",
  cyan: "#00ffff",
  lightgrey: "#D3D3D3",
  transparent: "#00000000",
  fromHex: (color: string) => {
    return {
      transparent(factor: number) {
        return tinycolor2(color).setAlpha(factor).toHexString();
      },
    };
  },
  getLighterColor(
    of: tinycolor2.Instance,
    relative: tinycolor2.Instance,
    factor?: number
  ) {
    if (of.getLuminance() > relative.getLuminance()) {
      return of;
    }

    factor = factor ? factor : 0.5;
    const lum1 = of.getLuminance();
    const lum2 = relative.getLuminance();
    factor = (factor * (lum2 - lum1)) / lum2;
    return of.lighten(factor);
  },
  getDarkerColor(
    of: tinycolor2.Instance,
    relative: tinycolor2.Instance,
    factor?: number
  ) {
    if (of.getLuminance() < relative.getLuminance()) {
      return of;
    }

    factor = factor ? factor : 0.5;
    const lum1 = of.getLuminance();
    const lum2 = relative.getLuminance();
    factor = (factor * (lum1 - lum2)) / lum1;
    return of.darken(factor);
  },
};

/**
 * A Color Value is either a color literal, a reference to an other color or a derived color
 */
type ColorValue = string | ColorIdentifier | ColorTransform;

export const schemes: Record<
  keyof ColorDefaults,
  Record<string, ColorValue>
> = {
  dark: {},
  hcDark: {},
  hcLight: {},
  light: {},
};

function registerColor(
  id: string,
  defaults: ColorDefaults | null,
  description: string,
  needsTransparency?: boolean,
  deprecationMessage?: string
) {
  if (!defaults) return id;
  for (const key in defaults) {
    const value = defaults[key as keyof ColorDefaults];
    if (!value) continue;
    schemes[key as keyof ColorDefaults][id] = value;
  }
  return id;
}

const nls = { localize: (key: string, description: string) => description };

const localize = nls.localize;
// ----- base colors

const foreground = registerColor(
  "foreground",
  { dark: "#CCCCCC", light: "#616161", hcDark: "#FFFFFF", hcLight: "#292929" },
  nls.localize(
    "foreground",
    "Overall foreground color. This color is only used if not overridden by a component."
  )
);
const disabledForeground = registerColor(
  "disabledForeground",
  {
    dark: "#CCCCCC80",
    light: "#61616180",
    hcDark: "#A5A5A5",
    hcLight: "#7F7F7F",
  },
  nls.localize(
    "disabledForeground",
    "Overall foreground for disabled elements. This color is only used if not overridden by a component."
  )
);
const errorForeground = registerColor(
  "errorForeground",
  { dark: "#F48771", light: "#A1260D", hcDark: "#F48771", hcLight: "#B5200D" },
  nls.localize(
    "errorForeground",
    "Overall foreground color for error messages. This color is only used if not overridden by a component."
  )
);
const descriptionForeground = registerColor(
  "descriptionForeground",
  {
    light: "#717171",
    dark: transparent(foreground, 0.7),
    hcDark: transparent(foreground, 0.7),
    hcLight: transparent(foreground, 0.7),
  },
  nls.localize(
    "descriptionForeground",
    "Foreground color for description text providing additional information, for example for a label."
  )
);
const iconForeground = registerColor(
  "icon.foreground",
  { dark: "#C5C5C5", light: "#424242", hcDark: "#FFFFFF", hcLight: "#292929" },
  nls.localize(
    "iconForeground",
    "The default color for icons in the workbench."
  )
);

const focusBorder = registerColor(
  "focusBorder",
  { dark: "#007FD4", light: "#0090F1", hcDark: "#F38518", hcLight: "#0F4A85" },
  nls.localize(
    "focusBorder",
    "Overall border color for focused elements. This color is only used if not overridden by a component."
  )
);

const contrastBorder = registerColor(
  "contrastBorder",
  { light: null, dark: null, hcDark: "#6FC3DF", hcLight: "#0F4A85" },
  nls.localize(
    "contrastBorder",
    "An extra border around elements to separate them from others for greater contrast."
  )
);
const activeContrastBorder = registerColor(
  "contrastActiveBorder",
  { light: null, dark: null, hcDark: focusBorder, hcLight: focusBorder },
  nls.localize(
    "activeContrastBorder",
    "An extra border around active elements to separate them from others for greater contrast."
  )
);

const selectionBackground = registerColor(
  "selection.background",
  { light: null, dark: null, hcDark: null, hcLight: null },
  nls.localize(
    "selectionBackground",
    "The background color of text selections in the workbench (e.g. for input fields or text areas). Note that this does not apply to selections within the editor."
  )
);

// ------ text colors

const textSeparatorForeground = registerColor(
  "/*text*/Separator.foreground",
  {
    light: "#0000002e",
    dark: "#ffffff2e",
    hcDark: Color.black,
    hcLight: "#292929",
  },
  nls.localize("textSeparatorForeground", "Color for text separators.")
);
const textLinkForeground = registerColor(
  "textLink.foreground",
  { light: "#006AB1", dark: "#3794FF", hcDark: "#3794FF", hcLight: "#0F4A85" },
  nls.localize("textLinkForeground", "Foreground color for links in text.")
);
const textLinkActiveForeground = registerColor(
  "textLink.activeForeground",
  { light: "#006AB1", dark: "#3794FF", hcDark: "#3794FF", hcLight: "#0F4A85" },
  nls.localize(
    "textLinkActiveForeground",
    "Foreground color for links in text when clicked on and on mouse hover."
  )
);
const textPreformatForeground = registerColor(
  "textPreformat.foreground",
  { light: "#A31515", dark: "#D7BA7D", hcDark: "#D7BA7D", hcLight: "#292929" },
  nls.localize(
    "textPreformatForeground",
    "Foreground color for preformatted text segments."
  )
);
const textBlockQuoteBackground = registerColor(
  "textBlockQuote.background",
  { light: "#7f7f7f1a", dark: "#7f7f7f1a", hcDark: null, hcLight: "#F2F2F2" },
  nls.localize(
    "textBlockQuoteBackground",
    "Background color for block quotes in text."
  )
);
const textBlockQuoteBorder = registerColor(
  "textBlockQuote.border",
  {
    light: "#007acc80",
    dark: "#007acc80",
    hcDark: Color.white,
    hcLight: "#292929",
  },
  nls.localize("textBlockQuoteBorder", "Border color for block quotes in text.")
);
const textCodeBlockBackground = registerColor(
  "textCodeBlock.background",
  {
    light: "#dcdcdc66",
    dark: "#0a0a0a66",
    hcDark: Color.black,
    hcLight: "#F2F2F2",
  },
  nls.localize(
    "textCodeBlockBackground",
    "Background color for code blocks in text."
  )
);

// ----- widgets
const widgetShadow = registerColor(
  "widget.shadow",
  {
    dark: transparent(Color.black, 0.36),
    light: transparent(Color.black, 0.16),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "widgetShadow",
    "Shadow color of widgets such as find/replace inside the editor."
  )
);
export const widgetBorder = registerColor('widget.border', { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder }, nls.localize('widgetBorder', 'Border color of widgets such as find/replace inside the editor.'));

const inputBackground = registerColor(
  "input.background",
  {
    dark: "#3C3C3C",
    light: Color.white,
    hcDark: Color.black,
    hcLight: Color.white,
  },
  nls.localize("inputBoxBackground", "Input box background.")
);
const inputForeground = registerColor(
  "input.foreground",
  {
    dark: foreground,
    light: foreground,
    hcDark: foreground,
    hcLight: foreground,
  },
  nls.localize("inputBoxForeground", "Input box foreground.")
);
const inputBorder = registerColor(
  "input.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  nls.localize("inputBoxBorder", "Input box border.")
);
const inputActiveOptionBorder = registerColor(
  "inputOption.activeBorder",
  {
    dark: "#007ACC00",
    light: "#007ACC00",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "inputBoxActiveOptionBorder",
    "Border color of activated options in input fields."
  )
);
const inputActiveOptionHoverBackground = registerColor(
  "inputOption.hoverBackground",
  { dark: "#5a5d5e80", light: "#b8b8b850", hcDark: null, hcLight: null },
  nls.localize(
    "inputOption.hoverBackground",
    "Background color of activated options in input fields."
  )
);
const inputActiveOptionBackground = registerColor(
  "inputOption.activeBackground",
  {
    dark: transparent(focusBorder, 0.4),
    light: transparent(focusBorder, 0.2),
    hcDark: Color.transparent,
    hcLight: Color.transparent,
  },
  nls.localize(
    "inputOption.activeBackground",
    "Background hover color of options in input fields."
  )
);
const inputActiveOptionForeground = registerColor(
  "inputOption.activeForeground",
  {
    dark: Color.white,
    light: Color.black,
    hcDark: foreground,
    hcLight: foreground,
  },
  nls.localize(
    "inputOption.activeForeground",
    "Foreground color of activated options in input fields."
  )
);
const inputPlaceholderForeground = registerColor(
  "input.placeholderForeground",
  {
    light: transparent(foreground, 0.5),
    dark: transparent(foreground, 0.5),
    hcDark: transparent(foreground, 0.7),
    hcLight: transparent(foreground, 0.7),
  },
  nls.localize(
    "inputPlaceholderForeground",
    "Input box foreground color for placeholder text."
  )
);

const inputValidationInfoBackground = registerColor(
  "inputValidation.infoBackground",
  {
    dark: "#063B49",
    light: "#D6ECF2",
    hcDark: Color.black,
    hcLight: Color.white,
  },
  nls.localize(
    "inputValidationInfoBackground",
    "Input validation background color for information severity."
  )
);
const inputValidationInfoForeground = registerColor(
  "inputValidation.infoForeground",
  { dark: null, light: null, hcDark: null, hcLight: foreground },
  nls.localize(
    "inputValidationInfoForeground",
    "Input validation foreground color for information severity."
  )
);
const inputValidationInfoBorder = registerColor(
  "inputValidation.infoBorder",
  {
    dark: "#007acc",
    light: "#007acc",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "inputValidationInfoBorder",
    "Input validation border color for information severity."
  )
);
const inputValidationWarningBackground = registerColor(
  "inputValidation.warningBackground",
  {
    dark: "#352A05",
    light: "#F6F5D2",
    hcDark: Color.black,
    hcLight: Color.white,
  },
  nls.localize(
    "inputValidationWarningBackground",
    "Input validation background color for warning severity."
  )
);
const inputValidationWarningForeground = registerColor(
  "inputValidation.warningForeground",
  { dark: null, light: null, hcDark: null, hcLight: foreground },
  nls.localize(
    "inputValidationWarningForeground",
    "Input validation foreground color for warning severity."
  )
);
const inputValidationWarningBorder = registerColor(
  "inputValidation.warningBorder",
  {
    dark: "#B89500",
    light: "#B89500",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "inputValidationWarningBorder",
    "Input validation border color for warning severity."
  )
);
const inputValidationErrorBackground = registerColor(
  "inputValidation.errorBackground",
  {
    dark: "#5A1D1D",
    light: "#F2DEDE",
    hcDark: Color.black,
    hcLight: Color.white,
  },
  nls.localize(
    "inputValidationErrorBackground",
    "Input validation background color for error severity."
  )
);
const inputValidationErrorForeground = registerColor(
  "inputValidation.errorForeground",
  { dark: null, light: null, hcDark: null, hcLight: foreground },
  nls.localize(
    "inputValidationErrorForeground",
    "Input validation foreground color for error severity."
  )
);
const inputValidationErrorBorder = registerColor(
  "inputValidation.errorBorder",
  {
    dark: "#BE1100",
    light: "#BE1100",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "inputValidationErrorBorder",
    "Input validation border color for error severity."
  )
);

const selectBackground = registerColor(
  "dropdown.background",
  {
    dark: "#3C3C3C",
    light: Color.white,
    hcDark: Color.black,
    hcLight: Color.white,
  },
  nls.localize("dropdownBackground", "Dropdown background.")
);
const selectListBackground = registerColor(
  "dropdown.listBackground",
  { dark: null, light: null, hcDark: Color.black, hcLight: Color.white },
  nls.localize("dropdownListBackground", "Dropdown list background.")
);
const selectForeground = registerColor(
  "dropdown.foreground",
  { dark: "#F0F0F0", light: null, hcDark: Color.white, hcLight: foreground },
  nls.localize("dropdownForeground", "Dropdown foreground.")
);
const selectBorder = registerColor(
  "dropdown.border",
  {
    dark: selectBackground,
    light: "#CECECE",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize("dropdownBorder", "Dropdown border.")
);

const buttonForeground = registerColor(
  "button.foreground",
  {
    dark: Color.white,
    light: Color.white,
    hcDark: Color.white,
    hcLight: Color.white,
  },
  nls.localize("buttonForeground", "Button foreground color.")
);
const buttonSeparator = registerColor(
  "button.separator",
  {
    dark: transparent(buttonForeground, 0.4),
    light: transparent(buttonForeground, 0.4),
    hcDark: transparent(buttonForeground, 0.4),
    hcLight: transparent(buttonForeground, 0.4),
  },
  nls.localize("buttonSeparator", "Button separator color.")
);
const buttonBackground = registerColor(
  "button.background",
  { dark: "#0E639C", light: "#007ACC", hcDark: null, hcLight: "#0F4A85" },
  nls.localize("buttonBackground", "Button background color.")
);
const buttonHoverBackground = registerColor(
  "button.hoverBackground",
  {
    dark: lighten(buttonBackground, 0.2),
    light: darken(buttonBackground, 0.2),
    hcDark: buttonBackground,
    hcLight: buttonBackground,
  },
  nls.localize(
    "buttonHoverBackground",
    "Button background color when hovering."
  )
);
const buttonBorder = registerColor(
  "button.border",
  {
    dark: contrastBorder,
    light: contrastBorder,
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize("buttonBorder", "Button border color.")
);

const buttonSecondaryForeground = registerColor(
  "button.secondaryForeground",
  {
    dark: Color.white,
    light: Color.white,
    hcDark: Color.white,
    hcLight: foreground,
  },
  nls.localize(
    "buttonSecondaryForeground",
    "Secondary button foreground color."
  )
);
const buttonSecondaryBackground = registerColor(
  "button.secondaryBackground",
  { dark: "#3A3D41", light: "#5F6A79", hcDark: null, hcLight: Color.white },
  nls.localize(
    "buttonSecondaryBackground",
    "Secondary button background color."
  )
);
const buttonSecondaryHoverBackground = registerColor(
  "button.secondaryHoverBackground",
  {
    dark: lighten(buttonSecondaryBackground, 0.2),
    light: darken(buttonSecondaryBackground, 0.2),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "buttonSecondaryHoverBackground",
    "Secondary button background color when hovering."
  )
);

const badgeBackground = registerColor(
  "badge.background",
  {
    dark: "#4D4D4D",
    light: "#C4C4C4",
    hcDark: Color.black,
    hcLight: "#0F4A85",
  },
  nls.localize(
    "badgeBackground",
    "Badge background color. Badges are small information labels, e.g. for search results count."
  )
);
const badgeForeground = registerColor(
  "badge.foreground",
  {
    dark: Color.white,
    light: "#333",
    hcDark: Color.white,
    hcLight: Color.white,
  },
  nls.localize(
    "badgeForeground",
    "Badge foreground color. Badges are small information labels, e.g. for search results count."
  )
);

const scrollbarShadow = registerColor(
  "scrollbar.shadow",
  { dark: "#000000", light: "#DDDDDD", hcDark: null, hcLight: null },
  nls.localize(
    "scrollbarShadow",
    "Scrollbar shadow to indicate that the view is scrolled."
  )
);
const scrollbarSliderBackground = registerColor(
  "scrollbarSlider.background",
  {
    dark: Color.fromHex("#797979").transparent(0.4),
    light: Color.fromHex("#646464").transparent(0.4),
    hcDark: transparent(contrastBorder, 0.6),
    hcLight: transparent(contrastBorder, 0.4),
  },
  nls.localize(
    "scrollbarSliderBackground",
    "Scrollbar slider background color."
  )
);
const scrollbarSliderHoverBackground = registerColor(
  "scrollbarSlider.hoverBackground",
  {
    dark: Color.fromHex("#646464").transparent(0.7),
    light: Color.fromHex("#646464").transparent(0.7),
    hcDark: transparent(contrastBorder, 0.8),
    hcLight: transparent(contrastBorder, 0.8),
  },
  nls.localize(
    "scrollbarSliderHoverBackground",
    "Scrollbar slider background color when hovering."
  )
);
const scrollbarSliderActiveBackground = registerColor(
  "scrollbarSlider.activeBackground",
  {
    dark: Color.fromHex("#BFBFBF").transparent(0.4),
    light: Color.fromHex("#000000").transparent(0.6),
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "scrollbarSliderActiveBackground",
    "Scrollbar slider background color when clicked on."
  )
);

const progressBarBackground = registerColor(
  "progressBar.background",
  {
    dark: "#0E70C0",
    light: "#0E70C0",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "progressBarBackground",
    "Background color of the progress bar that can show for long running operations."
  )
);

const editorErrorBackground = registerColor(
  "editorError.background",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "editorError.background",
    "Background color of error text in the editor. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorErrorForeground = registerColor(
  "editorError.foreground",
  { dark: "#F14C4C", light: "#E51400", hcDark: "#F48771", hcLight: "#B5200D" },
  nls.localize(
    "editorError.foreground",
    "Foreground color of error squigglies in the editor."
  )
);
const editorErrorBorder = registerColor(
  "editorError.border",
  {
    dark: null,
    light: null,
    hcDark: Color.fromHex("#E47777").transparent(0.8),
    hcLight: "#B5200D",
  },
  nls.localize("errorBorder", "Border color of error boxes in the editor.")
);

const editorWarningBackground = registerColor(
  "editorWarning.background",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "editorWarning.background",
    "Background color of warning text in the editor. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorWarningForeground = registerColor(
  "editorWarning.foreground",
  { dark: "#CCA700", light: "#BF8803", hcDark: "#FFD37", hcLight: "#895503" },
  nls.localize(
    "editorWarning.foreground",
    "Foreground color of warning squigglies in the editor."
  )
);
const editorWarningBorder = registerColor(
  "editorWarning.border",
  {
    dark: null,
    light: null,
    hcDark: Color.fromHex("#FFCC00").transparent(0.8),
    hcLight: "#",
  },
  nls.localize("warningBorder", "Border color of warning boxes in the editor.")
);

const editorInfoBackground = registerColor(
  "editorInfo.background",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "editorInfo.background",
    "Background color of info text in the editor. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorInfoForeground = registerColor(
  "editorInfo.foreground",
  { dark: "#3794FF", light: "#1a85ff", hcDark: "#3794FF", hcLight: "#1a85ff" },
  nls.localize(
    "editorInfo.foreground",
    "Foreground color of info squigglies in the editor."
  )
);
const editorInfoBorder = registerColor(
  "editorInfo.border",
  {
    dark: null,
    light: null,
    hcDark: Color.fromHex("#3794FF").transparent(0.8),
    hcLight: "#292929",
  },
  nls.localize("infoBorder", "Border color of info boxes in the editor.")
);

const editorHintForeground = registerColor(
  "editorHint.foreground",
  {
    dark: Color.fromHex("#eeeeee").transparent(0.7),
    light: "#6c6c6c",
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "editorHint.foreground",
    "Foreground color of hint squigglies in the editor."
  )
);
const editorHintBorder = registerColor(
  "editorHint.border",
  {
    dark: null,
    light: null,
    hcDark: Color.fromHex("#eeeeee").transparent(0.8),
    hcLight: "#292929",
  },
  nls.localize("hintBorder", "Border color of hint boxes in the editor.")
);

const sashHoverBorder = registerColor(
  "sash.hoverBorder",
  {
    dark: focusBorder,
    light: focusBorder,
    hcDark: focusBorder,
    hcLight: focusBorder,
  },
  nls.localize("sashActiveBorder", "Border color of active sashes.")
);

/**
 * Editor background color.
 */
const editorBackground = registerColor(
  "editor.background",
  {
    light: "#ffffff",
    dark: "#1E1E1E",
    hcDark: Color.black,
    hcLight: Color.white,
  },
  nls.localize("editorBackground", "Editor background color.")
);

/**
 * Editor foreground color.
 */
const editorForeground = registerColor(
  "editor.foreground",
  {
    light: "#333333",
    dark: "#BBBBBB",
    hcDark: Color.white,
    hcLight: foreground,
  },
  nls.localize("editorForeground", "Editor default foreground color.")
);

/**
 * Sticky scroll
 */
const editorStickyScrollBackground = registerColor(
  "editorStickyScroll.background",
  {
    light: editorBackground,
    dark: editorBackground,
    hcDark: editorBackground,
    hcLight: editorBackground,
  },
  nls.localize(
    "editorStickyScrollBackground",
    "Sticky scroll background color for the editor"
  )
);
const editorStickyScrollHoverBackground = registerColor(
  "editorStickyScrollHover.background",
  {
    dark: "#2A2D2E",
    light: "#F0F0F0",
    hcDark: null,
    hcLight: Color.fromHex("#0F4A85").transparent(0.1),
  },
  nls.localize(
    "editorStickyScrollHoverBackground",
    "Sticky scroll on hover background color for the editor"
  )
);

/**
 * Editor widgets
 */
const editorWidgetBackground = registerColor(
  "editorWidget.background",
  {
    dark: "#252526",
    light: "#F3F3F3",
    hcDark: "#0C141F",
    hcLight: Color.white,
  },
  nls.localize(
    "editorWidgetBackground",
    "Background color of editor widgets, such as find/replace."
  )
);
const editorWidgetForeground = registerColor(
  "editorWidget.foreground",
  {
    dark: foreground,
    light: foreground,
    hcDark: foreground,
    hcLight: foreground,
  },
  nls.localize(
    "editorWidgetForeground",
    "Foreground color of editor widgets, such as find/replace."
  )
);
const editorWidgetBorder = registerColor(
  "editorWidget.border",
  {
    dark: "#454545",
    light: "#C8C8C8",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "editorWidgetBorder",
    "Border color of editor widgets. The color is only used if the widget chooses to have a border and if the color is not overridden by a widget."
  )
);
const editorWidgetResizeBorder = registerColor(
  "editorWidget.resizeBorder",
  { light: null, dark: null, hcDark: null, hcLight: null },
  nls.localize(
    "editorWidgetResizeBorder",
    "Border color of the resize bar of editor widgets. The color is only used if the widget chooses to have a resize border and if the color is not overridden by a widget."
  )
);

/**
 * Quick pick widget
 */
const quickInputBackground = registerColor(
  "quickInput.background",
  {
    dark: editorWidgetBackground,
    light: editorWidgetBackground,
    hcDark: editorWidgetBackground,
    hcLight: editorWidgetBackground,
  },
  nls.localize(
    "pickerBackground",
    "Quick picker background color. The quick picker widget is the container for pickers like the command palette."
  )
);
const quickInputForeground = registerColor(
  "quickInput.foreground",
  {
    dark: editorWidgetForeground,
    light: editorWidgetForeground,
    hcDark: editorWidgetForeground,
    hcLight: editorWidgetForeground,
  },
  nls.localize(
    "pickerForeground",
    "Quick picker foreground color. The quick picker widget is the container for pickers like the command palette."
  )
);
const quickInputTitleBackground = registerColor(
  "quickInputTitle.background",
  {
    dark: tinycolor2("rgba (255,255,255,0.105)").toHexString(),
    light: tinycolor2("rgba (0, 0, 0, 0.06)").toHexString(),
    hcDark: "#000000",
    hcLight: Color.white,
  },
  nls.localize(
    "pickerTitleBackground",
    "Quick picker title background color. The quick picker widget is the container for pickers like the command palette."
  )
);
const pickerGroupForeground = registerColor(
  "pickerGroup.foreground",
  {
    dark: "#3794FF",
    light: "#0066BF",
    hcDark: Color.white,
    hcLight: "#0F4A85",
  },
  nls.localize(
    "pickerGroupForeground",
    "Quick picker color for grouping labels."
  )
);
const pickerGroupBorder = registerColor(
  "pickerGroup.border",
  {
    dark: "#3F3F46",
    light: "#CCCEDB",
    hcDark: Color.white,
    hcLight: "#0F4A85",
  },
  nls.localize("pickerGroupBorder", "Quick picker color for grouping borders.")
);

/**
 * Keybinding label
 */
const keybindingLabelBackground = registerColor(
  "keybindingLabel.background",
  {
    dark: tinycolor2("rgba (128, 128, 128, 0.17)").toHexString(),
    light: tinycolor2("rgba (221, 221, 221, 0.4)").toHexString(),
    hcDark: Color.transparent,
    hcLight: Color.transparent,
  },
  nls.localize(
    "keybindingLabelBackground",
    "Keybinding label background color. The keybinding label is used to represent a keyboard shortcut."
  )
);
const keybindingLabelForeground = registerColor(
  "keybindingLabel.foreground",
  {
    dark: "#CCCCCC",
    light: "#555555",
    hcDark: Color.white,
    hcLight: foreground,
  },
  nls.localize(
    "keybindingLabelForeground",
    "Keybinding label foreground color. The keybinding label is used to represent a keyboard shortcut."
  )
);
const keybindingLabelBorder = registerColor(
  "keybindingLabel.border",
  {
    dark: tinycolor2("rgba (51, 51, 51, 0.6)").toHexString(),
    light: tinycolor2("rgba (204, 204, 204, 0.4)").toHexString(),
    hcDark: tinycolor2("rgb (111, 195, 223)").toHexString(),
    hcLight: contrastBorder,
  },
  nls.localize(
    "keybindingLabelBorder",
    "Keybinding label border color. The keybinding label is used to represent a keyboard shortcut."
  )
);
const keybindingLabelBottomBorder = registerColor(
  "keybindingLabel.bottomBorder",
  {
    dark: tinycolor2("rgba (68, 68, 68, 0.6)").toHexString(),
    light: tinycolor2("rgba (187, 187, 187, 0.4)").toHexString(),
    hcDark: tinycolor2("rgba (111, 195, 223)").toHexString(),
    hcLight: foreground,
  },
  nls.localize(
    "keybindingLabelBottomBorder",
    "Keybinding label border bottom color. The keybinding label is used to represent a keyboard shortcut."
  )
);

/**
 * Editor selection colors.
 */
const editorSelectionBackground = registerColor(
  "editor.selectionBackground",
  { light: "#ADD6FF", dark: "#264F78", hcDark: "#f3f518", hcLight: "#0F4A85" },
  nls.localize("editorSelectionBackground", "Color of the editor selection.")
);
const editorSelectionForeground = registerColor(
  "editor.selectionForeground",
  { light: null, dark: null, hcDark: "#000000", hcLight: Color.white },
  nls.localize(
    "editorSelectionForeground",
    "Color of the selected text for high contrast."
  )
);
const editorInactiveSelection = registerColor(
  "editor.inactiveSelectionBackground",
  {
    light: transparent(editorSelectionBackground, 0.5),
    dark: transparent(editorSelectionBackground, 0.5),
    hcDark: transparent(editorSelectionBackground, 0.7),
    hcLight: transparent(editorSelectionBackground, 0.5),
  },
  nls.localize(
    "editorInactiveSelection",
    "Color of the selection in an inactive editor. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorSelectionHighlight = registerColor(
  "editor.selectionHighlightBackground",
  {
    light: lessProminent(editorSelectionBackground, editorBackground, 0.3, 0.6),
    dark: lessProminent(editorSelectionBackground, editorBackground, 0.3, 0.6),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "editorSelectionHighlight",
    "Color for regions with the same content as the selection. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorSelectionHighlightBorder = registerColor(
  "editor.selectionHighlightBorder",
  {
    light: null,
    dark: null,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "editorSelectionHighlightBorder",
    "Border color for regions with the same content as the selection."
  )
);

/**
 * Editor find match colors.
 */
const editorFindMatch = registerColor(
  "editor.findMatchBackground",
  { light: "#A8AC94", dark: "#515C6A", hcDark: null, hcLight: null },
  nls.localize("editorFindMatch", "Color of the current search match.")
);
const editorFindMatchHighlight = registerColor(
  "editor.findMatchHighlightBackground",
  { light: "#EA5C0055", dark: "#EA5C0055", hcDark: null, hcLight: null },
  nls.localize(
    "findMatchHighlight",
    "Color of the other search matches. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorFindRangeHighlight = registerColor(
  "editor.findRangeHighlightBackground",
  { dark: "#3a3d4166", light: "#b4b4b44d", hcDark: null, hcLight: null },
  nls.localize(
    "findRangeHighlight",
    "Color of the range limiting the search. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorFindMatchBorder = registerColor(
  "editor.findMatchBorder",
  {
    light: null,
    dark: null,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "editorFindMatchBorder",
    "Border color of the current search match."
  )
);
const editorFindMatchHighlightBorder = registerColor(
  "editor.findMatchHighlightBorder",
  {
    light: null,
    dark: null,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "findMatchHighlightBorder",
    "Border color of the other search matches."
  )
);
const editorFindRangeHighlightBorder = registerColor(
  "editor.findRangeHighlightBorder",
  {
    dark: null,
    light: null,
    hcDark: transparent(activeContrastBorder, 0.4),
    hcLight: transparent(activeContrastBorder, 0.4),
  },
  nls.localize(
    "findRangeHighlightBorder",
    "Border color of the range limiting the search. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);

/**
 * Search Editor query match colors.
 *
 * Distinct from normal editor find match to allow for better differentiation
 */
const searchEditorFindMatch = registerColor(
  "searchEditor.findMatchBackground",
  {
    light: transparent(editorFindMatchHighlight, 0.66),
    dark: transparent(editorFindMatchHighlight, 0.66),
    hcDark: editorFindMatchHighlight,
    hcLight: editorFindMatchHighlight,
  },
  nls.localize(
    "searchEditor.queryMatch",
    "Color of the Search Editor query matches."
  )
);
const searchEditorFindMatchBorder = registerColor(
  "searchEditor.findMatchBorder",
  {
    light: transparent(editorFindMatchHighlightBorder, 0.66),
    dark: transparent(editorFindMatchHighlightBorder, 0.66),
    hcDark: editorFindMatchHighlightBorder,
    hcLight: editorFindMatchHighlightBorder,
  },
  nls.localize(
    "searchEditor.editorFindMatchBorder",
    "Border color of the Search Editor query matches."
  )
);

/**
 * Editor hover
 */
const editorHoverHighlight = registerColor(
  "editor.hoverHighlightBackground",
  { light: "#ADD6FF26", dark: "#264f7840", hcDark: "#ADD6FF26", hcLight: null },
  nls.localize(
    "hoverHighlight",
    "Highlight below the word for which a hover is shown. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorHoverBackground = registerColor(
  "editorHoverWidget.background",
  {
    light: editorWidgetBackground,
    dark: editorWidgetBackground,
    hcDark: editorWidgetBackground,
    hcLight: editorWidgetBackground,
  },
  nls.localize("hoverBackground", "Background color of the editor hover.")
);
const editorHoverForeground = registerColor(
  "editorHoverWidget.foreground",
  {
    light: editorWidgetForeground,
    dark: editorWidgetForeground,
    hcDark: editorWidgetForeground,
    hcLight: editorWidgetForeground,
  },
  nls.localize("hoverForeground", "Foreground color of the editor hover.")
);
const editorHoverBorder = registerColor(
  "editorHoverWidget.border",
  {
    light: editorWidgetBorder,
    dark: editorWidgetBorder,
    hcDark: editorWidgetBorder,
    hcLight: editorWidgetBorder,
  },
  nls.localize("hoverBorder", "Border color of the editor hover.")
);
const editorHoverStatusBarBackground = registerColor(
  "editorHoverWidget.statusBarBackground",
  {
    dark: lighten(editorHoverBackground, 0.2),
    light: darken(editorHoverBackground, 0.05),
    hcDark: editorWidgetBackground,
    hcLight: editorWidgetBackground,
  },
  nls.localize(
    "statusBarBackground",
    "Background color of the editor hover status bar."
  )
);
/**
 * Editor link colors
 */
const editorActiveLinkForeground = registerColor(
  "editorLink.activeForeground",
  {
    dark: "#4E94CE",
    light: Color.blue,
    hcDark: Color.cyan,
    hcLight: "#292929",
  },
  nls.localize("activeLinkForeground", "Color of active links.")
);

/**
 * Inline hints
 */
const editorInlayHintForeground = registerColor(
  "editorInlayHint.foreground",
  {
    dark: badgeForeground,
    light: badgeForeground,
    hcDark: Color.black,
    hcLight: badgeForeground,
  },
  nls.localize("editorInlayHintForeground", "Foreground color of inline hints")
);
const editorInlayHintBackground = registerColor(
  "editorInlayHint.background",
  {
    dark: transparent(badgeBackground, 0.8),
    light: transparent(badgeBackground, 0.6),
    hcDark: "#f38518",
    hcLight: badgeBackground,
  },
  nls.localize("editorInlayHintBackground", "Background color of inline hints")
);
const editorInlayHintTypeForeground = registerColor(
  "editorInlayHint.typeForeground",
  {
    dark: editorInlayHintForeground,
    light: editorInlayHintForeground,
    hcDark: editorInlayHintForeground,
    hcLight: editorInlayHintForeground,
  },
  nls.localize(
    "editorInlayHintForegroundTypes",
    "Foreground color of inline hints for types"
  )
);
const editorInlayHintTypeBackground = registerColor(
  "editorInlayHint.typeBackground",
  {
    dark: editorInlayHintBackground,
    light: editorInlayHintBackground,
    hcDark: editorInlayHintBackground,
    hcLight: editorInlayHintBackground,
  },
  nls.localize(
    "editorInlayHintBackgroundTypes",
    "Background color of inline hints for types"
  )
);
const editorInlayHintParameterForeground = registerColor(
  "editorInlayHint.parameterForeground",
  {
    dark: editorInlayHintForeground,
    light: editorInlayHintForeground,
    hcDark: editorInlayHintForeground,
    hcLight: editorInlayHintForeground,
  },
  nls.localize(
    "editorInlayHintForegroundParameter",
    "Foreground color of inline hints for parameters"
  )
);
const editorInlayHintParameterBackground = registerColor(
  "editorInlayHint.parameterBackground",
  {
    dark: editorInlayHintBackground,
    light: editorInlayHintBackground,
    hcDark: editorInlayHintBackground,
    hcLight: editorInlayHintBackground,
  },
  nls.localize(
    "editorInlayHintBackgroundParameter",
    "Background color of inline hints for parameters"
  )
);

/**
 * Editor lighbulb icon colors
 */
const editorLightBulbForeground = registerColor(
  "editorLightBulb.foreground",
  { dark: "#FFCC00", light: "#DDB100", hcDark: "#FFCC00", hcLight: "#007ACC" },
  nls.localize(
    "editorLightBulbForeground",
    "The color used for the lightbulb actions icon."
  )
);
const editorLightBulbAutoFixForeground = registerColor(
  "editorLightBulbAutoFix.foreground",
  { dark: "#75BEFF", light: "#007ACC", hcDark: "#75BEFF", hcLight: "#007ACC" },
  nls.localize(
    "editorLightBulbAutoFixForeground",
    "The color used for the lightbulb auto fix actions icon."
  )
);

/**
 * Diff Editor Colors
 */
const defaultRemoveColor = tinycolor2("rgba (255, 0, 0, .2)").toHexString();
const defaultInsertColor = tinycolor2("rgba (155, 185, 85, .2)").toHexString();

const diffInserted = registerColor(
  "diffEditor.insertedTextBackground",
  { dark: "#9ccc2c33", light: "#9ccc2c40", hcDark: null, hcLight: null },
  nls.localize(
    "diffEditorInserted",
    "Background color for text that got inserted. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const diffRemoved = registerColor(
  "diffEditor.removedTextBackground",
  { dark: "#ff000033", light: "#ff000033", hcDark: null, hcLight: null },
  nls.localize(
    "diffEditorRemoved",
    "Background color for text that got removed. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);

const diffInsertedLine = registerColor(
  "diffEditor.insertedLineBackground",
  {
    dark: defaultInsertColor,
    light: defaultInsertColor,
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "diffEditorInsertedLines",
    "Background color for lines that got inserted. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const diffRemovedLine = registerColor(
  "diffEditor.removedLineBackground",
  {
    dark: defaultRemoveColor,
    light: defaultRemoveColor,
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "diffEditorRemovedLines",
    "Background color for lines that got removed. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);

const diffInsertedLineGutter = registerColor(
  "diffEditorGutter.insertedLineBackground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "diffEditorInsertedLineGutter",
    "Background color for the margin where lines got inserted."
  )
);
const diffRemovedLineGutter = registerColor(
  "diffEditorGutter.removedLineBackground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "diffEditorRemovedLineGutter",
    "Background color for the margin where lines got removed."
  )
);

const diffOverviewRulerInserted = registerColor(
  "diffEditorOverview.insertedForeground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "diffEditorOverviewInserted",
    "Diff overview ruler foreground for inserted content."
  )
);
const diffOverviewRulerRemoved = registerColor(
  "diffEditorOverview.removedForeground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "diffEditorOverviewRemoved",
    "Diff overview ruler foreground for removed content."
  )
);

const diffInsertedOutline = registerColor(
  "diffEditor.insertedTextBorder",
  { dark: null, light: null, hcDark: "#33ff2eff", hcLight: "#374E06" },
  nls.localize(
    "diffEditorInsertedOutline",
    "Outline color for the text that got inserted."
  )
);
const diffRemovedOutline = registerColor(
  "diffEditor.removedTextBorder",
  { dark: null, light: null, hcDark: "#FF008F", hcLight: "#AD0707" },
  nls.localize(
    "diffEditorRemovedOutline",
    "Outline color for text that got removed."
  )
);

const diffBorder = registerColor(
  "diffEditor.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  nls.localize("diffEditorBorder", "Border color between the two text editors.")
);
const diffDiagonalFill = registerColor(
  "diffEditor.diagonalFill",
  { dark: "#cccccc33", light: "#22222233", hcDark: null, hcLight: null },
  nls.localize(
    "diffDiagonalFill",
    "Color of the diff editor's diagonal fill. The diagonal fill is used in side-by-side diff views."
  )
);

/**
 * List and tree colors
 */
const listFocusBackground = registerColor(
  "list.focusBackground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listFocusBackground",
    "List/Tree background color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listFocusForeground = registerColor(
  "list.focusForeground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listFocusForeground",
    "List/Tree foreground color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listFocusOutline = registerColor(
  "list.focusOutline",
  {
    dark: focusBorder,
    light: focusBorder,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "listFocusOutline",
    "List/Tree outline color for the focused item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listFocusAndSelectionOutline = registerColor(
  "list.focusAndSelectionOutline",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listFocusAndSelectionOutline",
    "List/Tree outline color for the focused item when the list/tree is active and selected. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listActiveSelectionBackground = registerColor(
  "list.activeSelectionBackground",
  {
    dark: "#04395E",
    light: "#0060C0",
    hcDark: null,
    hcLight: Color.fromHex("#0F4A85").transparent(0.1),
  },
  nls.localize(
    "listActiveSelectionBackground",
    "List/Tree background color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listActiveSelectionForeground = registerColor(
  "list.activeSelectionForeground",
  { dark: Color.white, light: Color.white, hcDark: null, hcLight: null },
  nls.localize(
    "listActiveSelectionForeground",
    "List/Tree foreground color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listActiveSelectionIconForeground = registerColor(
  "list.activeSelectionIconForeground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listActiveSelectionIconForeground",
    "List/Tree icon foreground color for the selected item when the list/tree is active. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listInactiveSelectionBackground = registerColor(
  "list.inactiveSelectionBackground",
  {
    dark: "#37373D",
    light: "#E4E6F1",
    hcDark: null,
    hcLight: Color.fromHex("#0F4A85").transparent(0.1),
  },
  nls.localize(
    "listInactiveSelectionBackground",
    "List/Tree background color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listInactiveSelectionForeground = registerColor(
  "list.inactiveSelectionForeground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listInactiveSelectionForeground",
    "List/Tree foreground color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listInactiveSelectionIconForeground = registerColor(
  "list.inactiveSelectionIconForeground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listInactiveSelectionIconForeground",
    "List/Tree icon foreground color for the selected item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listInactiveFocusBackground = registerColor(
  "list.inactiveFocusBackground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listInactiveFocusBackground",
    "List/Tree background color for the focused item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listInactiveFocusOutline = registerColor(
  "list.inactiveFocusOutline",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listInactiveFocusOutline",
    "List/Tree outline color for the focused item when the list/tree is inactive. An active list/tree has keyboard focus, an inactive does not."
  )
);
const listHoverBackground = registerColor(
  "list.hoverBackground",
  {
    dark: "#2A2D2E",
    light: "#F0F0F0",
    hcDark: null,
    hcLight: Color.fromHex("#0F4A85").transparent(0.1),
  },
  nls.localize(
    "listHoverBackground",
    "List/Tree background when hovering over items using the mouse."
  )
);
const listHoverForeground = registerColor(
  "list.hoverForeground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "listHoverForeground",
    "List/Tree foreground when hovering over items using the mouse."
  )
);
const listDropBackground = registerColor(
  "list.dropBackground",
  { dark: "#062F4A", light: "#D6EBFF", hcDark: null, hcLight: null },
  nls.localize(
    "listDropBackground",
    "List/Tree drag and drop background when moving items around using the mouse."
  )
);
const listHighlightForeground = registerColor(
  "list.highlightForeground",
  {
    dark: "#2AAAFF",
    light: "#0066BF",
    hcDark: focusBorder,
    hcLight: focusBorder,
  },
  nls.localize(
    "highlight",
    "List/Tree foreground color of the match highlights when searching inside the list/tree."
  )
);
const listFocusHighlightForeground = registerColor(
  "list.focusHighlightForeground",
  {
    dark: listHighlightForeground,
    light: ifDefinedThenElse(
      listActiveSelectionBackground,
      listHighlightForeground,
      "#BBE7FF"
    ),
    hcDark: listHighlightForeground,
    hcLight: listHighlightForeground,
  },
  nls.localize(
    "listFocusHighlightForeground",
    "List/Tree foreground color of the match highlights on actively focused items when searching inside the list/tree."
  )
);
const listInvalidItemForeground = registerColor(
  "list.invalidItemForeground",
  { dark: "#B89500", light: "#B89500", hcDark: "#B89500", hcLight: "#B5200D" },
  nls.localize(
    "invalidItemForeground",
    "List/Tree foreground color for invalid items, for example an unresolved root in explorer."
  )
);
const listErrorForeground = registerColor(
  "list.errorForeground",
  { dark: "#F88070", light: "#B01011", hcDark: null, hcLight: null },
  nls.localize(
    "listErrorForeground",
    "Foreground color of list items containing errors."
  )
);
const listWarningForeground = registerColor(
  "list.warningForeground",
  { dark: "#CCA700", light: "#855F00", hcDark: null, hcLight: null },
  nls.localize(
    "listWarningForeground",
    "Foreground color of list items containing warnings."
  )
);
const listFilterWidgetBackground = registerColor(
  "listFilterWidget.background",
  {
    light: darken(editorWidgetBackground, 0),
    dark: lighten(editorWidgetBackground, 0),
    hcDark: editorWidgetBackground,
    hcLight: editorWidgetBackground,
  },
  nls.localize(
    "listFilterWidgetBackground",
    "Background color of the type filter widget in lists and trees."
  )
);
const listFilterWidgetOutline = registerColor(
  "listFilterWidget.outline",
  {
    dark: Color.transparent,
    light: Color.transparent,
    hcDark: "#f38518",
    hcLight: "#007ACC",
  },
  nls.localize(
    "listFilterWidgetOutline",
    "Outline color of the type filter widget in lists and trees."
  )
);
const listFilterWidgetNoMatchesOutline = registerColor(
  "listFilterWidget.noMatchesOutline",
  {
    dark: "#BE1100",
    light: "#BE1100",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "listFilterWidgetNoMatchesOutline",
    "Outline color of the type filter widget in lists and trees, when there are no matches."
  )
);
const listFilterWidgetShadow = registerColor(
  "listFilterWidget.shadow",
  {
    dark: widgetShadow,
    light: widgetShadow,
    hcDark: widgetShadow,
    hcLight: widgetShadow,
  },
  nls.localize(
    "listFilterWidgetShadow",
    "Shadown color of the type filter widget in lists and trees."
  )
);
const listFilterMatchHighlight = registerColor(
  "list.filterMatchBackground",
  {
    dark: editorFindMatchHighlight,
    light: editorFindMatchHighlight,
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "listFilterMatchHighlight",
    "Background color of the filtered match."
  )
);
const listFilterMatchHighlightBorder = registerColor(
  "list.filterMatchBorder",
  {
    dark: editorFindMatchHighlightBorder,
    light: editorFindMatchHighlightBorder,
    hcDark: contrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "listFilterMatchHighlightBorder",
    "Border color of the filtered match."
  )
);
const treeIndentGuidesStroke = registerColor(
  "tree.indentGuidesStroke",
  { dark: "#585858", light: "#a9a9a9", hcDark: "#a9a9a9", hcLight: "#a5a5a5" },
  nls.localize(
    "treeIndentGuidesStroke",
    "Tree stroke color for the indentation guides."
  )
);
const tableColumnsBorder = registerColor(
  "tree.tableColumnsBorder",
  { dark: "#CCCCCC20", light: "#61616120", hcDark: null, hcLight: null },
  nls.localize("tableColumnsBorder", "Table border color between columns.")
);
const tableOddRowsBackgroundColor = registerColor(
  "tree.tableOddRowsBackground",
  {
    dark: transparent(foreground, 0.04),
    light: transparent(foreground, 0.04),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "tableOddRowsBackgroundColor",
    "Background color for odd table rows."
  )
);
const listDeemphasizedForeground = registerColor(
  "list.deemphasizedForeground",
  { dark: "#8C8C8C", light: "#8E8E90", hcDark: "#A7A8A9", hcLight: "#666666" },
  nls.localize(
    "listDeemphasizedForeground",
    "List/Tree foreground color for items that are deemphasized. "
  )
);

/**
 * Checkboxes
 */
const checkboxBackground = registerColor(
  "checkbox.background",
  {
    dark: selectBackground,
    light: selectBackground,
    hcDark: selectBackground,
    hcLight: selectBackground,
  },
  nls.localize("checkbox.background", "Background color of checkbox widget.")
);
const checkboxSelectBackground = registerColor(
  "checkbox.selectBackground",
  {
    dark: editorWidgetBackground,
    light: editorWidgetBackground,
    hcDark: editorWidgetBackground,
    hcLight: editorWidgetBackground,
  },
  nls.localize(
    "checkbox.select.background",
    "Background color of checkbox widget when the element it's in is selected."
  )
);
const checkboxForeground = registerColor(
  "checkbox.foreground",
  {
    dark: selectForeground,
    light: selectForeground,
    hcDark: selectForeground,
    hcLight: selectForeground,
  },
  nls.localize("checkbox.foreground", "Foreground color of checkbox widget.")
);
const checkboxBorder = registerColor(
  "checkbox.border",
  {
    dark: selectBorder,
    light: selectBorder,
    hcDark: selectBorder,
    hcLight: selectBorder,
  },
  nls.localize("checkbox.border", "Border color of checkbox widget.")
);
const checkboxSelectBorder = registerColor(
  "checkbox.selectBorder",
  {
    dark: editorWidgetBackground,
    light: editorWidgetBackground,
    hcDark: editorWidgetBackground,
    hcLight: editorWidgetBackground,
  },
  nls.localize(
    "checkbox.select.border",
    "Border color of checkbox widget when the element it's in is selected."
  )
);

/**
 * Quick pick widget (dependent on List and tree colors)
 */
const _deprecatedQuickInputListFocusBackground = registerColor(
  "quickInput.list.focusBackground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  "",
  undefined,
  nls.localize(
    "quickInput.list.focusBackground deprecation",
    "Please use quickInputList.focusBackground instead"
  )
);
const quickInputListFocusForeground = registerColor(
  "quickInputList.focusForeground",
  {
    dark: listActiveSelectionForeground,
    light: listActiveSelectionForeground,
    hcDark: listActiveSelectionForeground,
    hcLight: listActiveSelectionForeground,
  },
  nls.localize(
    "quickInput.listFocusForeground",
    "Quick picker foreground color for the focused item."
  )
);
const quickInputListFocusIconForeground = registerColor(
  "quickInputList.focusIconForeground",
  {
    dark: listActiveSelectionIconForeground,
    light: listActiveSelectionIconForeground,
    hcDark: listActiveSelectionIconForeground,
    hcLight: listActiveSelectionIconForeground,
  },
  nls.localize(
    "quickInput.listFocusIconForeground",
    "Quick picker icon foreground color for the focused item."
  )
);
const quickInputListFocusBackground = registerColor(
  "quickInputList.focusBackground",
  {
    dark: oneOf(
      _deprecatedQuickInputListFocusBackground,
      listActiveSelectionBackground
    ),
    light: oneOf(
      _deprecatedQuickInputListFocusBackground,
      listActiveSelectionBackground
    ),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "quickInput.listFocusBackground",
    "Quick picker background color for the focused item."
  )
);

/**
 * Menu colors
 */
const menuBorder = registerColor(
  "menu.border",
  { dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
  nls.localize("menuBorder", "Border color of menus.")
);
const menuForeground = registerColor(
  "menu.foreground",
  {
    dark: selectForeground,
    light: foreground,
    hcDark: selectForeground,
    hcLight: selectForeground,
  },
  nls.localize("menuForeground", "Foreground color of menu items.")
);
const menuBackground = registerColor(
  "menu.background",
  {
    dark: selectBackground,
    light: selectBackground,
    hcDark: selectBackground,
    hcLight: selectBackground,
  },
  nls.localize("menuBackground", "Background color of menu items.")
);
const menuSelectionForeground = registerColor(
  "menu.selectionForeground",
  {
    dark: listActiveSelectionForeground,
    light: listActiveSelectionForeground,
    hcDark: listActiveSelectionForeground,
    hcLight: listActiveSelectionForeground,
  },
  nls.localize(
    "menuSelectionForeground",
    "Foreground color of the selected menu item in menus."
  )
);
const menuSelectionBackground = registerColor(
  "menu.selectionBackground",
  {
    dark: listActiveSelectionBackground,
    light: listActiveSelectionBackground,
    hcDark: listActiveSelectionBackground,
    hcLight: listActiveSelectionBackground,
  },
  nls.localize(
    "menuSelectionBackground",
    "Background color of the selected menu item in menus."
  )
);
const menuSelectionBorder = registerColor(
  "menu.selectionBorder",
  {
    dark: null,
    light: null,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "menuSelectionBorder",
    "Border color of the selected menu item in menus."
  )
);
const menuSeparatorBackground = registerColor(
  "menu.separatorBackground",
  {
    dark: "#606060",
    light: "#D4D4D4",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "menuSeparatorBackground",
    "Color of a separator menu item in menus."
  )
);

/**
 * Toolbar colors
 */
const toolbarHoverBackground = registerColor(
  "toolbar.hoverBackground",
  { dark: "#5a5d5e50", light: "#b8b8b850", hcDark: null, hcLight: null },
  nls.localize(
    "toolbarHoverBackground",
    "Toolbar background when hovering over actions using the mouse"
  )
);
const toolbarHoverOutline = registerColor(
  "toolbar.hoverOutline",
  {
    dark: null,
    light: null,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "toolbarHoverOutline",
    "Toolbar outline when hovering over actions using the mouse"
  )
);
const toolbarActiveBackground = registerColor(
  "toolbar.activeBackground",
  {
    dark: lighten(toolbarHoverBackground, 0.1),
    light: darken(toolbarHoverBackground, 0.1),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "toolbarActiveBackground",
    "Toolbar background when holding the mouse over actions"
  )
);

/**
 * Snippet placeholder colors
 */
const snippetTabstopHighlightBackground = registerColor(
  "editor.snippetTabstopHighlightBackground",
  {
    dark: rgba(124, 124, 124, 0.3),
    light: rgba(10, 50, 100, 0.2),
    hcDark: rgba(124, 124, 124, 0.3),
    hcLight: rgba(10, 50, 100, 0.2),
  },
  nls.localize(
    "snippetTabstopHighlightBackground",
    "Highlight background color of a snippet tabstop."
  )
);
const snippetTabstopHighlightBorder = registerColor(
  "editor.snippetTabstopHighlightBorder",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "snippetTabstopHighlightBorder",
    "Highlight border color of a snippet tabstop."
  )
);
const snippetFinalTabstopHighlightBackground = registerColor(
  "editor.snippetFinalTabstopHighlightBackground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "snippetFinalTabstopHighlightBackground",
    "Highlight background color of the final tabstop of a snippet."
  )
);
const snippetFinalTabstopHighlightBorder = registerColor(
  "editor.snippetFinalTabstopHighlightBorder",
  {
    dark: "#525252",
    light: rgba(10, 50, 100, 0.5),
    hcDark: "#525252",
    hcLight: "#292929",
  },
  nls.localize(
    "snippetFinalTabstopHighlightBorder",
    "Highlight border color of the final tabstop of a snippet."
  )
);

/**
 * Breadcrumb colors
 */
const breadcrumbsForeground = registerColor(
  "breadcrumb.foreground",
  {
    light: transparent(foreground, 0.8),
    dark: transparent(foreground, 0.8),
    hcDark: transparent(foreground, 0.8),
    hcLight: transparent(foreground, 0.8),
  },
  nls.localize(
    "breadcrumbsFocusForeground",
    "Color of focused breadcrumb items."
  )
);
const breadcrumbsBackground = registerColor(
  "breadcrumb.background",
  {
    light: editorBackground,
    dark: editorBackground,
    hcDark: editorBackground,
    hcLight: editorBackground,
  },
  nls.localize("breadcrumbsBackground", "Background color of breadcrumb items.")
);
const breadcrumbsFocusForeground = registerColor(
  "breadcrumb.focusForeground",
  {
    light: darken(foreground, 0.2),
    dark: lighten(foreground, 0.1),
    hcDark: lighten(foreground, 0.1),
    hcLight: lighten(foreground, 0.1),
  },
  nls.localize(
    "breadcrumbsFocusForeground",
    "Color of focused breadcrumb items."
  )
);
const breadcrumbsActiveSelectionForeground = registerColor(
  "breadcrumb.activeSelectionForeground",
  {
    light: darken(foreground, 0.2),
    dark: lighten(foreground, 0.1),
    hcDark: lighten(foreground, 0.1),
    hcLight: lighten(foreground, 0.1),
  },
  nls.localize(
    "breadcrumbsSelectedForeground",
    "Color of selected breadcrumb items."
  )
);
const breadcrumbsPickerBackground = registerColor(
  "breadcrumbPicker.background",
  {
    light: editorWidgetBackground,
    dark: editorWidgetBackground,
    hcDark: editorWidgetBackground,
    hcLight: editorWidgetBackground,
  },
  nls.localize(
    "breadcrumbsSelectedBackground",
    "Background color of breadcrumb item picker."
  )
);

/**
 * Merge-conflict colors
 */

const headerTransparency = 0.5;
const currentBaseColor =
  Color.fromHex("#40C8AE").transparent(headerTransparency);
const incomingBaseColor =
  Color.fromHex("#40A6FF").transparent(headerTransparency);
const commonBaseColor = Color.fromHex("#606060").transparent(0.4);
const contentTransparency = 0.4;
const rulerTransparency = 1;

const mergeCurrentHeaderBackground = registerColor(
  "merge.currentHeaderBackground",
  {
    dark: currentBaseColor,
    light: currentBaseColor,
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "mergeCurrentHeaderBackground",
    "Current header background in inline merge-conflicts. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const mergeCurrentContentBackground = registerColor(
  "merge.currentContentBackground",
  {
    dark: transparent(mergeCurrentHeaderBackground, contentTransparency),
    light: transparent(mergeCurrentHeaderBackground, contentTransparency),
    hcDark: transparent(mergeCurrentHeaderBackground, contentTransparency),
    hcLight: transparent(mergeCurrentHeaderBackground, contentTransparency),
  },
  nls.localize(
    "mergeCurrentContentBackground",
    "Current content background in inline merge-conflicts. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const mergeIncomingHeaderBackground = registerColor(
  "merge.incomingHeaderBackground",
  {
    dark: incomingBaseColor,
    light: incomingBaseColor,
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "mergeIncomingHeaderBackground",
    "Incoming header background in inline merge-conflicts. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const mergeIncomingContentBackground = registerColor(
  "merge.incomingContentBackground",
  {
    dark: transparent(mergeIncomingHeaderBackground, contentTransparency),
    light: transparent(mergeIncomingHeaderBackground, contentTransparency),
    hcDark: transparent(mergeIncomingHeaderBackground, contentTransparency),
    hcLight: transparent(mergeIncomingHeaderBackground, contentTransparency),
  },
  nls.localize(
    "mergeIncomingContentBackground",
    "Incoming content background in inline merge-conflicts. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const mergeCommonHeaderBackground = registerColor(
  "merge.commonHeaderBackground",
  {
    dark: commonBaseColor,
    light: commonBaseColor,
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "mergeCommonHeaderBackground",
    "Common ancestor header background in inline merge-conflicts. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const mergeCommonContentBackground = registerColor(
  "merge.commonContentBackground",
  {
    dark: transparent(mergeCommonHeaderBackground, contentTransparency),
    light: transparent(mergeCommonHeaderBackground, contentTransparency),
    hcDark: transparent(mergeCommonHeaderBackground, contentTransparency),
    hcLight: transparent(mergeCommonHeaderBackground, contentTransparency),
  },
  nls.localize(
    "mergeCommonContentBackground",
    "Common ancestor content background in inline merge-conflicts. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);

const mergeBorder = registerColor(
  "merge.border",
  { dark: null, light: null, hcDark: "#C3DF6F", hcLight: "#007ACC" },
  nls.localize(
    "mergeBorder",
    "Border color on headers and the splitter in inline merge-conflicts."
  )
);

const overviewRulerCurrentContentForeground = registerColor(
  "editorOverviewRuler.currentContentForeground",
  {
    dark: transparent(mergeCurrentHeaderBackground, rulerTransparency),
    light: transparent(mergeCurrentHeaderBackground, rulerTransparency),
    hcDark: mergeBorder,
    hcLight: mergeBorder,
  },
  nls.localize(
    "overviewRulerCurrentContentForeground",
    "Current overview ruler foreground for inline merge-conflicts."
  )
);
const overviewRulerIncomingContentForeground = registerColor(
  "editorOverviewRuler.incomingContentForeground",
  {
    dark: transparent(mergeIncomingHeaderBackground, rulerTransparency),
    light: transparent(mergeIncomingHeaderBackground, rulerTransparency),
    hcDark: mergeBorder,
    hcLight: mergeBorder,
  },
  nls.localize(
    "overviewRulerIncomingContentForeground",
    "Incoming overview ruler foreground for inline merge-conflicts."
  )
);
const overviewRulerCommonContentForeground = registerColor(
  "editorOverviewRuler.commonContentForeground",
  {
    dark: transparent(mergeCommonHeaderBackground, rulerTransparency),
    light: transparent(mergeCommonHeaderBackground, rulerTransparency),
    hcDark: mergeBorder,
    hcLight: mergeBorder,
  },
  nls.localize(
    "overviewRulerCommonContentForeground",
    "Common ancestor overview ruler foreground for inline merge-conflicts."
  )
);

const overviewRulerFindMatchForeground = registerColor(
  "editorOverviewRuler.findMatchForeground",
  { dark: "#d186167e", light: "#d186167e", hcDark: "#AB5A00", hcLight: "" },
  nls.localize(
    "overviewRulerFindMatchForeground",
    "Overview ruler marker color for find matches. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);

const overviewRulerSelectionHighlightForeground = registerColor(
  "editorOverviewRuler.selectionHighlightForeground",
  {
    dark: "#A0A0A0CC",
    light: "#A0A0A0CC",
    hcDark: "#A0A0A0CC",
    hcLight: "#A0A0A0CC",
  },
  nls.localize(
    "overviewRulerSelectionHighlightForeground",
    "Overview ruler marker color for selection highlights. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);

const minimapFindMatch = registerColor(
  "minimap.findMatchHighlight",
  { light: "#d18616", dark: "#d18616", hcDark: "#AB5A00", hcLight: "#0F4A85" },
  nls.localize(
    "minimapFindMatchHighlight",
    "Minimap marker color for find matches."
  ),
  true
);
const minimapSelectionOccurrenceHighlight = registerColor(
  "minimap.selectionOccurrenceHighlight",
  { light: "#c9c9c9", dark: "#676767", hcDark: "#ffffff", hcLight: "#0F4A85" },
  nls.localize(
    "minimapSelectionOccurrenceHighlight",
    "Minimap marker color for repeating editor selections."
  ),
  true
);
const minimapSelection = registerColor(
  "minimap.selectionHighlight",
  { light: "#ADD6FF", dark: "#264F78", hcDark: "#ffffff", hcLight: "#0F4A85" },
  nls.localize(
    "minimapSelectionHighlight",
    "Minimap marker color for the editor selection."
  ),
  true
);
const minimapError = registerColor(
  "minimap.errorHighlight",
  {
    dark: tinycolor2("rgba (255, 18, 18, 0.7)").toHexString(),
    light: tinycolor2("rgba (255, 18, 18, 0.7)").toHexString(),
    hcDark: tinycolor2("rgba (255, 50, 50, 1)").toHexString(),
    hcLight: "#B5200D",
  },
  nls.localize("minimapError", "Minimap marker color for errors.")
);
const minimapWarning = registerColor(
  "minimap.warningHighlight",
  {
    dark: editorWarningForeground,
    light: editorWarningForeground,
    hcDark: editorWarningBorder,
    hcLight: editorWarningBorder,
  },
  nls.localize("overviewRuleWarning", "Minimap marker color for warnings.")
);
const minimapBackground = registerColor(
  "minimap.background",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize("minimapBackground", "Minimap background color.")
);
const minimapForegroundOpacity = registerColor(
  "minimap.foregroundOpacity",
  { dark: "#000000", light: "#000000", hcDark: "#000000", hcLight: "#000000" },
  nls.localize(
    "minimapForegroundOpacity",
    'Opacity of foreground elements rendered in the minimap. For example, "#000000c0" will render the elements with 75% opacity.'
  )
);

const minimapSliderBackground = registerColor(
  "minimapSlider.background",
  {
    light: transparent(scrollbarSliderBackground, 0.5),
    dark: transparent(scrollbarSliderBackground, 0.5),
    hcDark: transparent(scrollbarSliderBackground, 0.5),
    hcLight: transparent(scrollbarSliderBackground, 0.5),
  },
  nls.localize("minimapSliderBackground", "Minimap slider background color.")
);
const minimapSliderHoverBackground = registerColor(
  "minimapSlider.hoverBackground",
  {
    light: transparent(scrollbarSliderHoverBackground, 0.5),
    dark: transparent(scrollbarSliderHoverBackground, 0.5),
    hcDark: transparent(scrollbarSliderHoverBackground, 0.5),
    hcLight: transparent(scrollbarSliderHoverBackground, 0.5),
  },
  nls.localize(
    "minimapSliderHoverBackground",
    "Minimap slider background color when hovering."
  )
);
const minimapSliderActiveBackground = registerColor(
  "minimapSlider.activeBackground",
  {
    light: transparent(scrollbarSliderActiveBackground, 0.5),
    dark: transparent(scrollbarSliderActiveBackground, 0.5),
    hcDark: transparent(scrollbarSliderActiveBackground, 0.5),
    hcLight: transparent(scrollbarSliderActiveBackground, 0.5),
  },
  nls.localize(
    "minimapSliderActiveBackground",
    "Minimap slider background color when clicked on."
  )
);

const problemsErrorIconForeground = registerColor(
  "problemsErrorIcon.foreground",
  {
    dark: editorErrorForeground,
    light: editorErrorForeground,
    hcDark: editorErrorForeground,
    hcLight: editorErrorForeground,
  },
  nls.localize(
    "problemsErrorIconForeground",
    "The color used for the problems error icon."
  )
);
const problemsWarningIconForeground = registerColor(
  "problemsWarningIcon.foreground",
  {
    dark: editorWarningForeground,
    light: editorWarningForeground,
    hcDark: editorWarningForeground,
    hcLight: editorWarningForeground,
  },
  nls.localize(
    "problemsWarningIconForeground",
    "The color used for the problems warning icon."
  )
);
const problemsInfoIconForeground = registerColor(
  "problemsInfoIcon.foreground",
  {
    dark: editorInfoForeground,
    light: editorInfoForeground,
    hcDark: editorInfoForeground,
    hcLight: editorInfoForeground,
  },
  nls.localize(
    "problemsInfoIconForeground",
    "The color used for the problems info icon."
  )
);

/**
 * Chart colors
 */
const chartsForeground = registerColor(
  "charts.foreground",
  {
    dark: foreground,
    light: foreground,
    hcDark: foreground,
    hcLight: foreground,
  },
  nls.localize("chartsForeground", "The foreground color used in charts.")
);
const chartsLines = registerColor(
  "charts.lines",
  {
    dark: transparent(foreground, 0.5),
    light: transparent(foreground, 0.5),
    hcDark: transparent(foreground, 0.5),
    hcLight: transparent(foreground, 0.5),
  },
  nls.localize("chartsLines", "The color used for horizontal lines in charts.")
);
const chartsRed = registerColor(
  "charts.red",
  {
    dark: editorErrorForeground,
    light: editorErrorForeground,
    hcDark: editorErrorForeground,
    hcLight: editorErrorForeground,
  },
  nls.localize("chartsRed", "The red color used in chart visualizations.")
);
const chartsBlue = registerColor(
  "charts.blue",
  {
    dark: editorInfoForeground,
    light: editorInfoForeground,
    hcDark: editorInfoForeground,
    hcLight: editorInfoForeground,
  },
  nls.localize("chartsBlue", "The blue color used in chart visualizations.")
);
const chartsYellow = registerColor(
  "charts.yellow",
  {
    dark: editorWarningForeground,
    light: editorWarningForeground,
    hcDark: editorWarningForeground,
    hcLight: editorWarningForeground,
  },
  nls.localize("chartsYellow", "The yellow color used in chart visualizations.")
);
const chartsOrange = registerColor(
  "charts.orange",
  {
    dark: minimapFindMatch,
    light: minimapFindMatch,
    hcDark: minimapFindMatch,
    hcLight: minimapFindMatch,
  },
  nls.localize("chartsOrange", "The orange color used in chart visualizations.")
);

/**
 * Definition of the editor colors
 */
const editorLineHighlight = registerColor(
  "editor.lineHighlightBackground",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "lineHighlight",
    "Background color for the highlight of line at the cursor position."
  )
);
const editorLineHighlightBorder = registerColor(
  "editor.lineHighlightBorder",
  {
    dark: "#282828",
    light: "#eeeeee",
    hcDark: "#f38518",
    hcLight: contrastBorder,
  },
  nls.localize(
    "lineHighlightBorderBox",
    "Background color for the border around the line at the cursor position."
  )
);
const editorRangeHighlight = registerColor(
  "editor.rangeHighlightBackground",
  { dark: "#ffffff0b", light: "#fdff0033", hcDark: null, hcLight: null },
  nls.localize(
    "rangeHighlight",
    "Background color of highlighted ranges, like by quick open and find features. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorRangeHighlightBorder = registerColor(
  "editor.rangeHighlightBorder",
  {
    dark: null,
    light: null,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "rangeHighlightBorder",
    "Background color of the border around highlighted ranges."
  ),
  true
);
const editorSymbolHighlight = registerColor(
  "editor.symbolHighlightBackground",
  {
    dark: editorFindMatchHighlight,
    light: editorFindMatchHighlight,
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "symbolHighlight",
    "Background color of highlighted symbol, like for go to definition or go next/previous symbol. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorSymbolHighlightBorder = registerColor(
  "editor.symbolHighlightBorder",
  {
    dark: null,
    light: null,
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize(
    "symbolHighlightBorder",
    "Background color of the border around highlighted symbols."
  ),
  true
);

const editorCursorForeground = registerColor(
  "editorCursor.foreground",
  {
    dark: "#AEAFAD",
    light: Color.black,
    hcDark: Color.white,
    hcLight: "#0F4A85",
  },
  nls.localize("caret", "Color of the editor cursor.")
);
const editorCursorBackground = registerColor(
  "editorCursor.background",
  null,
  nls.localize(
    "editorCursorBackground",
    "The background color of the editor cursor. Allows customizing the color of a character overlapped by a block cursor."
  )
);
const editorWhitespaces = registerColor(
  "editorWhitespace.foreground",
  {
    dark: "#e3e4e229",
    light: "#33333333",
    hcDark: "#e3e4e229",
    hcLight: "#CCCCCC",
  },
  nls.localize(
    "editorWhitespaces",
    "Color of whitespace characters in the editor."
  )
);
const editorIndentGuides = registerColor(
  "editorIndentGuide.background",
  {
    dark: editorWhitespaces,
    light: editorWhitespaces,
    hcDark: editorWhitespaces,
    hcLight: editorWhitespaces,
  },
  nls.localize("editorIndentGuides", "Color of the editor indentation guides.")
);
const editorActiveIndentGuides = registerColor(
  "editorIndentGuide.activeBackground",
  {
    dark: editorWhitespaces,
    light: editorWhitespaces,
    hcDark: editorWhitespaces,
    hcLight: editorWhitespaces,
  },
  nls.localize(
    "editorActiveIndentGuide",
    "Color of the active editor indentation guides."
  )
);
const editorLineNumbers = registerColor(
  "editorLineNumber.foreground",
  {
    dark: "#858585",
    light: "#237893",
    hcDark: Color.white,
    hcLight: "#292929",
  },
  nls.localize("editorLineNumbers", "Color of editor line numbers.")
);

const deprecatedEditorActiveLineNumber = registerColor(
  "editorActiveLineNumber.foreground",
  {
    dark: "#c6c6c6",
    light: "#0B216F",
    hcDark: activeContrastBorder,
    hcLight: activeContrastBorder,
  },
  nls.localize("editorActiveLineNumber", "Color of editor active line number"),
  false,
  nls.localize(
    "deprecatedEditorActiveLineNumber",
    "Id is deprecated. Use 'editorLineNumber.activeForeground' instead."
  )
);
const editorActiveLineNumber = registerColor(
  "editorLineNumber.activeForeground",
  {
    dark: deprecatedEditorActiveLineNumber,
    light: deprecatedEditorActiveLineNumber,
    hcDark: deprecatedEditorActiveLineNumber,
    hcLight: deprecatedEditorActiveLineNumber,
  },
  nls.localize("editorActiveLineNumber", "Color of editor active line number")
);

const editorRuler = registerColor(
  "editorRuler.foreground",
  {
    dark: "#5A5A5A",
    light: Color.lightgrey,
    hcDark: Color.white,
    hcLight: "#292929",
  },
  nls.localize("editorRuler", "Color of the editor rulers.")
);

const editorCodeLensForeground = registerColor(
  "editorCodeLens.foreground",
  { dark: "#999999", light: "#919191", hcDark: "#999999", hcLight: "#292929" },
  nls.localize(
    "editorCodeLensForeground",
    "Foreground color of editor CodeLens"
  )
);

const editorBracketMatchBackground = registerColor(
  "editorBracketMatch.background",
  {
    dark: "#0064001a",
    light: "#0064001a",
    hcDark: "#0064001a",
    hcLight: "#0000",
  },
  nls.localize(
    "editorBracketMatchBackground",
    "Background color behind matching brackets"
  )
);
const editorBracketMatchBorder = registerColor(
  "editorBracketMatch.border",
  {
    dark: "#888",
    light: "#B9B9B9",
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize("editorBracketMatchBorder", "Color for matching brackets boxes")
);

const editorOverviewRulerBorder = registerColor(
  "editorOverviewRuler.border",
  {
    dark: "#7f7f7f4d",
    light: "#7f7f7f4d",
    hcDark: "#7f7f7f4d",
    hcLight: "#666666",
  },
  nls.localize(
    "editorOverviewRulerBorder",
    "Color of the overview ruler border."
  )
);
const editorOverviewRulerBackground = registerColor(
  "editorOverviewRuler.background",
  null,
  nls.localize(
    "editorOverviewRulerBackground",
    "Background color of the editor overview ruler."
  )
);

const editorGutter = registerColor(
  "editorGutter.background",
  {
    dark: editorBackground,
    light: editorBackground,
    hcDark: editorBackground,
    hcLight: editorBackground,
  },
  nls.localize(
    "editorGutter",
    "Background color of the editor gutter. The gutter contains the glyph margins and the line numbers."
  )
);

const editorUnnecessaryCodeBorder = registerColor(
  "editorUnnecessaryCode.border",
  {
    dark: null,
    light: null,
    hcDark: Color.fromHex("#fff").transparent(0.8),
    hcLight: contrastBorder,
  },
  nls.localize(
    "unnecessaryCodeBorder",
    "Border color of unnecessary (unused) source code in the editor."
  )
);
const editorUnnecessaryCodeOpacity = registerColor(
  "editorUnnecessaryCode.opacity",
  {
    dark: tinycolor2("#000a").toHexString(),
    light: tinycolor2("#0007").toHexString(),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "unnecessaryCodeOpacity",
    "Opacity of unnecessary (unused) source code in the editor. For example, \"#000000c0\" will render the code with 75% opacity. For high contrast themes, use the  'editorUnnecessaryCode.border' theme color to underline unnecessary code instead of fading it out."
  )
);

const ghostTextBorder = registerColor(
  "editorGhostText.border",
  {
    dark: null,
    light: null,
    hcDark: Color.fromHex("#fff").transparent(0.8),
    hcLight: Color.fromHex("#292929").transparent(0.8),
  },
  nls.localize(
    "editorGhostTextBorder",
    "Border color of ghost text in the editor."
  )
);
const ghostTextForeground = registerColor(
  "editorGhostText.foreground",
  {
    dark: "#ffffff56",
    light: tinycolor2("#0007").toHexString(),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "editorGhostTextForeground",
    "Foreground color of the ghost text in the editor."
  )
);
const ghostTextBackground = registerColor(
  "editorGhostText.background",
  { dark: null, light: null, hcDark: null, hcLight: null },
  nls.localize(
    "editorGhostTextBackground",
    "Background color of the ghost text in the editor."
  )
);

const rulerRangeDefault = rgba(0, 122, 204, 0.6);
const overviewRulerRangeHighlight = registerColor(
  "editorOverviewRuler.rangeHighlightForeground",
  {
    dark: rulerRangeDefault,
    light: rulerRangeDefault,
    hcDark: rulerRangeDefault,
    hcLight: rulerRangeDefault,
  },
  nls.localize(
    "overviewRulerRangeHighlight",
    "Overview ruler marker color for range highlights. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const overviewRulerError = registerColor(
  "editorOverviewRuler.errorForeground",
  {
    dark: rgba(255, 18, 18, 0.7),
    light: rgba(255, 18, 18, 0.7),
    hcDark: rgba(255, 50, 50, 1),
    hcLight: "#B5200D",
  },
  nls.localize("overviewRuleError", "Overview ruler marker color for errors.")
);
const overviewRulerWarning = registerColor(
  "editorOverviewRuler.warningForeground",
  {
    dark: editorWarningForeground,
    light: editorWarningForeground,
    hcDark: editorWarningBorder,
    hcLight: editorWarningBorder,
  },
  nls.localize(
    "overviewRuleWarning",
    "Overview ruler marker color for warnings."
  )
);
const overviewRulerInfo = registerColor(
  "editorOverviewRuler.infoForeground",
  {
    dark: editorInfoForeground,
    light: editorInfoForeground,
    hcDark: editorInfoBorder,
    hcLight: editorInfoBorder,
  },
  nls.localize("overviewRuleInfo", "Overview ruler marker color for infos.")
);

const editorBracketHighlightingForeground1 = registerColor(
  "editorBracketHighlight.foreground1",
  {
    dark: "#FFD700",
    light: "#0431FAFF",
    hcDark: "#FFD700",
    hcLight: "#0431FAFF",
  },
  nls.localize(
    "editorBracketHighlightForeground1",
    "Foreground color of brackets (1). Requires enabling bracket pair colorization."
  )
);
const editorBracketHighlightingForeground2 = registerColor(
  "editorBracketHighlight.foreground2",
  {
    dark: "#DA70D6",
    light: "#319331FF",
    hcDark: "#DA70D6",
    hcLight: "#319331FF",
  },
  nls.localize(
    "editorBracketHighlightForeground2",
    "Foreground color of brackets (2). Requires enabling bracket pair colorization."
  )
);
const editorBracketHighlightingForeground3 = registerColor(
  "editorBracketHighlight.foreground3",
  {
    dark: "#179FFF",
    light: "#7B3814FF",
    hcDark: "#87CEFA",
    hcLight: "#7B3814FF",
  },
  nls.localize(
    "editorBracketHighlightForeground3",
    "Foreground color of brackets (3). Requires enabling bracket pair colorization."
  )
);
const editorBracketHighlightingForeground4 = registerColor(
  "editorBracketHighlight.foreground4",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketHighlightForeground4",
    "Foreground color of brackets (4). Requires enabling bracket pair colorization."
  )
);
const editorBracketHighlightingForeground5 = registerColor(
  "editorBracketHighlight.foreground5",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketHighlightForeground5",
    "Foreground color of brackets (5). Requires enabling bracket pair colorization."
  )
);
const editorBracketHighlightingForeground6 = registerColor(
  "editorBracketHighlight.foreground6",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketHighlightForeground6",
    "Foreground color of brackets (6). Requires enabling bracket pair colorization."
  )
);

const editorBracketHighlightingUnexpectedBracketForeground = registerColor(
  "editorBracketHighlight.unexpectedBracket.foreground",
  {
    dark: rgba(255, 18, 18, 0.8),
    light: rgba(255, 18, 18, 0.8),
    hcDark: rgba(255, 50, 50, 1),
    hcLight: "",
  },
  nls.localize(
    "editorBracketHighlightUnexpectedBracketForeground",
    "Foreground color of unexpected brackets."
  )
);

const editorBracketPairGuideBackground1 = registerColor(
  "editorBracketPairGuide.background1",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.background1",
    "Background color of inactive bracket pair guides (1). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideBackground2 = registerColor(
  "editorBracketPairGuide.background2",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.background2",
    "Background color of inactive bracket pair guides (2). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideBackground3 = registerColor(
  "editorBracketPairGuide.background3",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.background3",
    "Background color of inactive bracket pair guides (3). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideBackground4 = registerColor(
  "editorBracketPairGuide.background4",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.background4",
    "Background color of inactive bracket pair guides (4). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideBackground5 = registerColor(
  "editorBracketPairGuide.background5",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.background5",
    "Background color of inactive bracket pair guides (5). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideBackground6 = registerColor(
  "editorBracketPairGuide.background6",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.background6",
    "Background color of inactive bracket pair guides (6). Requires enabling bracket pair guides."
  )
);

const editorBracketPairGuideActiveBackground1 = registerColor(
  "editorBracketPairGuide.activeBackground1",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.activeBackground1",
    "Background color of active bracket pair guides (1). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideActiveBackground2 = registerColor(
  "editorBracketPairGuide.activeBackground2",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.activeBackground2",
    "Background color of active bracket pair guides (2). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideActiveBackground3 = registerColor(
  "editorBracketPairGuide.activeBackground3",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.activeBackground3",
    "Background color of active bracket pair guides (3). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideActiveBackground4 = registerColor(
  "editorBracketPairGuide.activeBackground4",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.activeBackground4",
    "Background color of active bracket pair guides (4). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideActiveBackground5 = registerColor(
  "editorBracketPairGuide.activeBackground5",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.activeBackground5",
    "Background color of active bracket pair guides (5). Requires enabling bracket pair guides."
  )
);
const editorBracketPairGuideActiveBackground6 = registerColor(
  "editorBracketPairGuide.activeBackground6",
  {
    dark: "#00000000",
    light: "#00000000",
    hcDark: "#00000000",
    hcLight: "#00000000",
  },
  nls.localize(
    "editorBracketPairGuide.activeBackground6",
    "Background color of active bracket pair guides (6). Requires enabling bracket pair guides."
  )
);

const editorUnicodeHighlightBorder = registerColor(
  "editorUnicodeHighlight.border",
  { dark: "#BD9B03", light: "#CEA33D", hcDark: "#ff0000", hcLight: "" },
  nls.localize(
    "editorUnicodeHighlight.border",
    "Border color used to highlight unicode characters."
  )
);
const editorUnicodeHighlightBackground = registerColor(
  "editorUnicodeHighlight.background",
  { dark: "#bd9b0326", light: "#cea33d14", hcDark: "#00000000", hcLight: "" },
  nls.localize(
    "editorUnicodeHighlight.background",
    "Background color used to highlight unicode characters."
  )
);

const chartsGreen = registerColor(
  "charts.green",
  { dark: "#89D185", light: "#388A34", hcDark: "#89D185", hcLight: "#374e06" },
  nls.localize("chartsGreen", "The green color used in chart visualizations.")
);
const chartsPurple = registerColor(
  "charts.purple",
  { dark: "#B180D7", light: "#652D90", hcDark: "#B180D7", hcLight: "#652D90" },
  nls.localize("chartsPurple", "The purple color used in chart visualizations.")
);

const foldBackgroundBackground = registerColor(
  "editor.foldBackground",
  {
    light: transparent(editorSelectionBackground, 0.3),
    dark: transparent(editorSelectionBackground, 0.3),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "foldBackgroundBackground",
    "Background color behind folded ranges. The color must not be opaque so as not to hide underlying decorations."
  ),
  true
);
const editorFoldForeground = registerColor(
  "editorGutter.foldingControlForeground",
  {
    dark: iconForeground,
    light: iconForeground,
    hcDark: iconForeground,
    hcLight: iconForeground,
  },
  nls.localize(
    "editorGutter.foldingControlForeground",
    "Color of the folding control in the editor gutter."
  )
);

const editorGutterModifiedBackground = registerColor(
  "editorGutter.modifiedBackground",
  {
    dark: "#1B81A8",
    light: "#2090D3",
    hcDark: "#1B81A8",
    hcLight: "#2090D3",
  },
  nls.localize(
    "editorGutterModifiedBackground",
    "Editor gutter background color for lines that are modified."
  )
);

const editorGutterAddedBackground = registerColor(
  "editorGutter.addedBackground",
  {
    dark: "#487E02",
    light: "#48985D",
    hcDark: "#487E02",
    hcLight: "#48985D",
  },
  nls.localize(
    "editorGutterAddedBackground",
    "Editor gutter background color for lines that are added."
  )
);

const editorGutterDeletedBackground = registerColor(
  "editorGutter.deletedBackground",
  {
    dark: editorErrorForeground,
    light: editorErrorForeground,
    hcDark: editorErrorForeground,
    hcLight: editorErrorForeground,
  },
  nls.localize(
    "editorGutterDeletedBackground",
    "Editor gutter background color for lines that are deleted."
  )
);

const minimapGutterModifiedBackground = registerColor(
  "minimapGutter.modifiedBackground",
  {
    dark: editorGutterModifiedBackground,
    light: editorGutterModifiedBackground,
    hcDark: editorGutterModifiedBackground,
    hcLight: editorGutterModifiedBackground,
  },
  nls.localize(
    "minimapGutterModifiedBackground",
    "Minimap gutter background color for lines that are modified."
  )
);

const minimapGutterAddedBackground = registerColor(
  "minimapGutter.addedBackground",
  {
    dark: editorGutterAddedBackground,
    light: editorGutterAddedBackground,
    hcDark: editorGutterAddedBackground,
    hcLight: editorGutterAddedBackground,
  },
  nls.localize(
    "minimapGutterAddedBackground",
    "Minimap gutter background color for lines that are added."
  )
);

const minimapGutterDeletedBackground = registerColor(
  "minimapGutter.deletedBackground",
  {
    dark: editorGutterDeletedBackground,
    light: editorGutterDeletedBackground,
    hcDark: editorGutterDeletedBackground,
    hcLight: editorGutterDeletedBackground,
  },
  nls.localize(
    "minimapGutterDeletedBackground",
    "Minimap gutter background color for lines that are deleted."
  )
);

const overviewRulerModifiedForeground = registerColor(
  "editorOverviewRuler.modifiedForeground",
  {
    dark: transparent(editorGutterModifiedBackground, 0.6),
    light: transparent(editorGutterModifiedBackground, 0.6),
    hcDark: transparent(editorGutterModifiedBackground, 0.6),
    hcLight: transparent(editorGutterModifiedBackground, 0.6),
  },
  nls.localize(
    "overviewRulerModifiedForeground",
    "Overview ruler marker color for modified content."
  )
);
const overviewRulerAddedForeground = registerColor(
  "editorOverviewRuler.addedForeground",
  {
    dark: transparent(editorGutterAddedBackground, 0.6),
    light: transparent(editorGutterAddedBackground, 0.6),
    hcDark: transparent(editorGutterAddedBackground, 0.6),
    hcLight: transparent(editorGutterAddedBackground, 0.6),
  },
  nls.localize(
    "overviewRulerAddedForeground",
    "Overview ruler marker color for added content."
  )
);
const overviewRulerDeletedForeground = registerColor(
  "editorOverviewRuler.deletedForeground",
  {
    dark: transparent(editorGutterDeletedBackground, 0.6),
    light: transparent(editorGutterDeletedBackground, 0.6),
    hcDark: transparent(editorGutterDeletedBackground, 0.6),
    hcLight: transparent(editorGutterDeletedBackground, 0.6),
  },
  nls.localize(
    "overviewRulerDeletedForeground",
    "Overview ruler marker color for deleted content."
  )
);

const debugTokenExpressionName = registerColor(
  "debugTokenExpression.name",
  {
    dark: "#c586c0",
    light: "#9b46b0",
    hcDark: foreground,
    hcLight: foreground,
  },
  "Foreground color for the token names shown in the debug views (ie. the Variables or Watch view)."
);
const debugTokenExpressionValue = registerColor(
  "debugTokenExpression.value",
  {
    dark: "#cccccc99",
    light: "#6c6c6ccc",
    hcDark: foreground,
    hcLight: foreground,
  },
  "Foreground color for the token values shown in the debug views (ie. the Variables or Watch view)."
);
const debugTokenExpressionString = registerColor(
  "debugTokenExpression.string",
  { dark: "#ce9178", light: "#a31515", hcDark: "#f48771", hcLight: "#a31515" },
  "Foreground color for strings in the debug views (ie. the Variables or Watch view)."
);
const debugTokenExpressionBoolean = registerColor(
  "debugTokenExpression.boolean",
  { dark: "#4e94ce", light: "#0000ff", hcDark: "#75bdfe", hcLight: "#0000ff" },
  "Foreground color for booleans in the debug views (ie. the Variables or Watch view)."
);
const debugTokenExpressionNumber = registerColor(
  "debugTokenExpression.number",
  { dark: "#b5cea8", light: "#098658", hcDark: "#89d185", hcLight: "#098658" },
  "Foreground color for numbers in the debug views (ie. the Variables or Watch view)."
);
const debugTokenExpressionError = registerColor(
  "debugTokenExpression.error",
  { dark: "#f48771", light: "#e51400", hcDark: "#f48771", hcLight: "#e51400" },
  "Foreground color for expression errors in the debug views (ie. the Variables or Watch view) and for error logs shown in the debug console."
);

const debugViewExceptionLabelForeground = registerColor(
  "debugView.exceptionLabelForeground",
  { dark: foreground, light: "#FFF", hcDark: foreground, hcLight: foreground },
  "Foreground color for a label shown in the CALL STACK view when the debugger breaks on an exception."
);
const debugViewExceptionLabelBackground = registerColor(
  "debugView.exceptionLabelBackground",
  { dark: "#6C2022", light: "#A31515", hcDark: "#6C2022", hcLight: "#A31515" },
  "Background color for a label shown in the CALL STACK view when the debugger breaks on an exception."
);
const debugViewStateLabelForeground = registerColor(
  "debugView.stateLabelForeground",
  {
    dark: foreground,
    light: foreground,
    hcDark: foreground,
    hcLight: foreground,
  },
  "Foreground color for a label in the CALL STACK view showing the current session's or thread's state."
);
const debugViewStateLabelBackground = registerColor(
  "debugView.stateLabelBackground",
  {
    dark: "#88888844",
    light: "#88888844",
    hcDark: "#88888844",
    hcLight: "#88888844",
  },
  "Background color for a label in the CALL STACK view showing the current session's or thread's state."
);
const debugViewValueChangedHighlight = registerColor(
  "debugView.valueChangedHighlight",
  { dark: "#569CD6", light: "#569CD6", hcDark: "#569CD6", hcLight: "#569CD6" },
  "Color used to highlight value changes in the debug views (ie. in the Variables view)."
);

const debugConsoleInfoForeground = registerColor(
  "debugConsole.infoForeground",
  {
    dark: editorInfoForeground,
    light: editorInfoForeground,
    hcDark: foreground,
    hcLight: foreground,
  },
  "Foreground color for info messages in debug REPL console."
);
const debugConsoleWarningForeground = registerColor(
  "debugConsole.warningForeground",
  {
    dark: editorWarningForeground,
    light: editorWarningForeground,
    hcDark: "#008000",
    hcLight: editorWarningForeground,
  },
  "Foreground color for warning messages in debug REPL console."
);
const debugConsoleErrorForeground = registerColor(
  "debugConsole.errorForeground",
  {
    dark: errorForeground,
    light: errorForeground,
    hcDark: errorForeground,
    hcLight: errorForeground,
  },
  "Foreground color for error messages in debug REPL console."
);
const debugConsoleSourceForeground = registerColor(
  "debugConsole.sourceForeground",
  {
    dark: foreground,
    light: foreground,
    hcDark: foreground,
    hcLight: foreground,
  },
  "Foreground color for source filenames in debug REPL console."
);
const debugConsoleInputIconForeground = registerColor(
  "debugConsoleInputIcon.foreground",
  {
    dark: foreground,
    light: foreground,
    hcDark: foreground,
    hcLight: foreground,
  },
  "Foreground color for debug console input marker icon."
);

const debugIconPauseForeground = registerColor(
  "debugIcon.pauseForeground",
  {
    dark: "#75BEFF",
    light: "#007ACC",
    hcDark: "#75BEFF",
    hcLight: "#007ACC",
  },
  nls.localize("debugIcon.pauseForeground", "Debug toolbar icon for pause.")
);

const debugIconStopForeground = registerColor(
  "debugIcon.stopForeground",
  {
    dark: "#F48771",
    light: "#A1260D",
    hcDark: "#F48771",
    hcLight: "#A1260D",
  },
  nls.localize("debugIcon.stopForeground", "Debug toolbar icon for stop.")
);

const debugIconDisconnectForeground = registerColor(
  "debugIcon.disconnectForeground",
  {
    dark: "#F48771",
    light: "#A1260D",
    hcDark: "#F48771",
    hcLight: "#A1260D",
  },
  nls.localize(
    "debugIcon.disconnectForeground",
    "Debug toolbar icon for disconnect."
  )
);

const debugIconRestartForeground = registerColor(
  "debugIcon.restartForeground",
  {
    dark: "#89D185",
    light: "#388A34",
    hcDark: "#89D185",
    hcLight: "#388A34",
  },
  nls.localize("debugIcon.restartForeground", "Debug toolbar icon for restart.")
);

const debugIconStepOverForeground = registerColor(
  "debugIcon.stepOverForeground",
  {
    dark: "#75BEFF",
    light: "#007ACC",
    hcDark: "#75BEFF",
    hcLight: "#007ACC",
  },
  nls.localize(
    "debugIcon.stepOverForeground",
    "Debug toolbar icon for step over."
  )
);

const debugIconStepIntoForeground = registerColor(
  "debugIcon.stepIntoForeground",
  {
    dark: "#75BEFF",
    light: "#007ACC",
    hcDark: "#75BEFF",
    hcLight: "#007ACC",
  },
  nls.localize(
    "debugIcon.stepIntoForeground",
    "Debug toolbar icon for step into."
  )
);

const debugIconStepOutForeground = registerColor(
  "debugIcon.stepOutForeground",
  {
    dark: "#75BEFF",
    light: "#007ACC",
    hcDark: "#75BEFF",
    hcLight: "#007ACC",
  },
  nls.localize(
    "debugIcon.stepOutForeground",
    "Debug toolbar icon for step over."
  )
);

const debugIconContinueForeground = registerColor(
  "debugIcon.continueForeground",
  {
    dark: "#75BEFF",
    light: "#007ACC",
    hcDark: "#75BEFF",
    hcLight: "#007ACC",
  },
  nls.localize(
    "debugIcon.continueForeground",
    "Debug toolbar icon for continue."
  )
);

const debugIconStepBackForeground = registerColor(
  "debugIcon.stepBackForeground",
  {
    dark: "#75BEFF",
    light: "#007ACC",
    hcDark: "#75BEFF",
    hcLight: "#007ACC",
  },
  nls.localize(
    "debugIcon.stepBackForeground",
    "Debug toolbar icon for step back."
  )
);

const errorDefault = oneOf(editorErrorForeground, editorErrorBorder);
const warningDefault = oneOf(editorWarningForeground, editorWarningBorder);
const infoDefault = oneOf(editorInfoForeground, editorInfoBorder);

const editorMarkerNavigationError = registerColor(
  "editorMarkerNavigationError.background",
  {
    dark: errorDefault,
    light: errorDefault,
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "editorMarkerNavigationError",
    "Editor marker navigation widget error color."
  )
);
const editorMarkerNavigationErrorHeader = registerColor(
  "editorMarkerNavigationError.headerBackground",
  {
    dark: transparent(editorMarkerNavigationError, 0.1),
    light: transparent(editorMarkerNavigationError, 0.1),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "editorMarkerNavigationErrorHeaderBackground",
    "Editor marker navigation widget error heading background."
  )
);

const editorMarkerNavigationWarning = registerColor(
  "editorMarkerNavigationWarning.background",
  {
    dark: warningDefault,
    light: warningDefault,
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "editorMarkerNavigationWarning",
    "Editor marker navigation widget warning color."
  )
);
const editorMarkerNavigationWarningHeader = registerColor(
  "editorMarkerNavigationWarning.headerBackground",
  {
    dark: transparent(editorMarkerNavigationWarning, 0.1),
    light: transparent(editorMarkerNavigationWarning, 0.1),
    hcDark: "#0C141F",
    hcLight: transparent(editorMarkerNavigationWarning, 0.2),
  },
  nls.localize(
    "editorMarkerNavigationWarningBackground",
    "Editor marker navigation widget warning heading background."
  )
);

const editorMarkerNavigationInfo = registerColor(
  "editorMarkerNavigationInfo.background",
  {
    dark: infoDefault,
    light: infoDefault,
    hcDark: contrastBorder,
    hcLight: contrastBorder,
  },
  nls.localize(
    "editorMarkerNavigationInfo",
    "Editor marker navigation widget info color."
  )
);
const editorMarkerNavigationInfoHeader = registerColor(
  "editorMarkerNavigationInfo.headerBackground",
  {
    dark: transparent(editorMarkerNavigationInfo, 0.1),
    light: transparent(editorMarkerNavigationInfo, 0.1),
    hcDark: null,
    hcLight: null,
  },
  nls.localize(
    "editorMarkerNavigationInfoHeaderBackground",
    "Editor marker navigation widget info heading background."
  )
);

const editorMarkerNavigationBackground = registerColor(
  "editorMarkerNavigation.background",
  {
    dark: editorBackground,
    light: editorBackground,
    hcDark: editorBackground,
    hcLight: editorBackground,
  },
  nls.localize(
    "editorMarkerNavigationBackground",
    "Editor marker navigation widget background."
  )
);

const debugIconBreakpointForeground = registerColor(
  "debugIcon.breakpointForeground",
  { dark: "#E51400", light: "#E51400", hcDark: "#E51400", hcLight: "#E51400" },
  nls.localize("debugIcon.breakpointForeground", "Icon color for breakpoints.")
);
const debugIconBreakpointDisabledForeground = registerColor(
  "debugIcon.breakpointDisabledForeground",
  { dark: "#848484", light: "#848484", hcDark: "#848484", hcLight: "#848484" },
  nls.localize(
    "debugIcon.breakpointDisabledForeground",
    "Icon color for disabled breakpoints."
  )
);
const debugIconBreakpointUnverifiedForeground = registerColor(
  "debugIcon.breakpointUnverifiedForeground",
  { dark: "#848484", light: "#848484", hcDark: "#848484", hcLight: "#848484" },
  nls.localize(
    "debugIcon.breakpointUnverifiedForeground",
    "Icon color for unverified breakpoints."
  )
);
const debugIconBreakpointCurrentStackframeForeground = registerColor(
  "debugIcon.breakpointCurrentStackframeForeground",
  { dark: "#FFCC00", light: "#BE8700", hcDark: "#FFCC00", hcLight: "#BE8700" },
  nls.localize(
    "debugIcon.breakpointCurrentStackframeForeground",
    "Icon color for the current breakpoint stack frame."
  )
);
const debugIconBreakpointStackframeForeground = registerColor(
  "debugIcon.breakpointStackframeForeground",
  { dark: "#89D185", light: "#89D185", hcDark: "#89D185", hcLight: "#89D185" },
  nls.localize(
    "debugIcon.breakpointStackframeForeground",
    "Icon color for all breakpoint stack frames."
  )
);


// < --- Tabs --- >

//#region Tab Background

export const TAB_ACTIVE_BACKGROUND = registerColor('tab.activeBackground', {
	dark: editorBackground,
	light: editorBackground,
	hcDark: editorBackground,
	hcLight: editorBackground
}, localize('tabActiveBackground', "Active tab background color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_ACTIVE_BACKGROUND = registerColor('tab.unfocusedActiveBackground', {
	dark: TAB_ACTIVE_BACKGROUND,
	light: TAB_ACTIVE_BACKGROUND,
	hcDark: TAB_ACTIVE_BACKGROUND,
	hcLight: TAB_ACTIVE_BACKGROUND,
}, localize('tabUnfocusedActiveBackground', "Active tab background color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_INACTIVE_BACKGROUND = registerColor('tab.inactiveBackground', {
	dark: '#2D2D2D',
	light: '#ECECEC',
	hcDark: null,
	hcLight: null,
}, localize('tabInactiveBackground', "Inactive tab background color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_INACTIVE_BACKGROUND = registerColor('tab.unfocusedInactiveBackground', {
	dark: TAB_INACTIVE_BACKGROUND,
	light: TAB_INACTIVE_BACKGROUND,
	hcDark: TAB_INACTIVE_BACKGROUND,
	hcLight: TAB_INACTIVE_BACKGROUND
}, localize('tabUnfocusedInactiveBackground', "Inactive tab background color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

//#endregion

//#region Tab Foreground

export const TAB_ACTIVE_FOREGROUND = registerColor('tab.activeForeground', {
	dark: Color.white,
	light: '#333333',
	hcDark: Color.white,
	hcLight: '#292929'
}, localize('tabActiveForeground', "Active tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_INACTIVE_FOREGROUND = registerColor('tab.inactiveForeground', {
	dark: transparent(TAB_ACTIVE_FOREGROUND, 0.5),
	light: transparent(TAB_ACTIVE_FOREGROUND, 0.7),
	hcDark: Color.white,
	hcLight: '#292929'
}, localize('tabInactiveForeground', "Inactive tab foreground color in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_ACTIVE_FOREGROUND = registerColor('tab.unfocusedActiveForeground', {
	dark: transparent(TAB_ACTIVE_FOREGROUND, 0.5),
	light: transparent(TAB_ACTIVE_FOREGROUND, 0.7),
	hcDark: Color.white,
	hcLight: '#292929'
}, localize('tabUnfocusedActiveForeground', "Active tab foreground color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_INACTIVE_FOREGROUND = registerColor('tab.unfocusedInactiveForeground', {
	dark: transparent(TAB_INACTIVE_FOREGROUND, 0.5),
	light: transparent(TAB_INACTIVE_FOREGROUND, 0.5),
	hcDark: Color.white,
	hcLight: '#292929'
}, localize('tabUnfocusedInactiveForeground', "Inactive tab foreground color in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

//#endregion

//#region Tab Hover Foreground/Background

export const TAB_HOVER_BACKGROUND = registerColor('tab.hoverBackground', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('tabHoverBackground', "Tab background color when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_HOVER_BACKGROUND = registerColor('tab.unfocusedHoverBackground', {
	dark: transparent(TAB_HOVER_BACKGROUND, 0.5),
	light: transparent(TAB_HOVER_BACKGROUND, 0.7),
	hcDark: null,
	hcLight: null
}, localize('tabUnfocusedHoverBackground', "Tab background color in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_HOVER_FOREGROUND = registerColor('tab.hoverForeground', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null,
}, localize('tabHoverForeground', "Tab foreground color when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_HOVER_FOREGROUND = registerColor('tab.unfocusedHoverForeground', {
	dark: transparent(TAB_HOVER_FOREGROUND, 0.5),
	light: transparent(TAB_HOVER_FOREGROUND, 0.5),
	hcDark: null,
	hcLight: null
}, localize('tabUnfocusedHoverForeground', "Tab foreground color in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

//#endregion

//#region Tab Borders

export const TAB_BORDER = registerColor('tab.border', {
	dark: '#252526',
	light: '#F3F3F3',
	hcDark: contrastBorder,
	hcLight: contrastBorder,
}, localize('tabBorder', "Border to separate tabs from each other. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_LAST_PINNED_BORDER = registerColor('tab.lastPinnedBorder', {
	dark: treeIndentGuidesStroke,
	light: treeIndentGuidesStroke,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('lastPinnedTabBorder', "Border to separate pinned tabs from other tabs. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_ACTIVE_BORDER = registerColor('tab.activeBorder', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('tabActiveBorder', "Border on the bottom of an active tab. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_ACTIVE_BORDER = registerColor('tab.unfocusedActiveBorder', {
	dark: transparent(TAB_ACTIVE_BORDER, 0.5),
	light: transparent(TAB_ACTIVE_BORDER, 0.7),
	hcDark: null,
	hcLight: null
}, localize('tabActiveUnfocusedBorder', "Border on the bottom of an active tab in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_ACTIVE_BORDER_TOP = registerColor('tab.activeBorderTop', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: '#B5200D'
}, localize('tabActiveBorderTop', "Border to the top of an active tab. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_ACTIVE_BORDER_TOP = registerColor('tab.unfocusedActiveBorderTop', {
	dark: transparent(TAB_ACTIVE_BORDER_TOP, 0.5),
	light: transparent(TAB_ACTIVE_BORDER_TOP, 0.7),
	hcDark: null,
	hcLight: '#B5200D'
}, localize('tabActiveUnfocusedBorderTop', "Border to the top of an active tab in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_HOVER_BORDER = registerColor('tab.hoverBorder', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('tabHoverBorder', "Border to highlight tabs when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_HOVER_BORDER = registerColor('tab.unfocusedHoverBorder', {
	dark: transparent(TAB_HOVER_BORDER, 0.5),
	light: transparent(TAB_HOVER_BORDER, 0.7),
	hcDark: null,
	hcLight: contrastBorder
}, localize('tabUnfocusedHoverBorder', "Border to highlight tabs in an unfocused group when hovering. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

//#endregion

//#region Tab Modified Border

export const TAB_ACTIVE_MODIFIED_BORDER = registerColor('tab.activeModifiedBorder', {
	dark: '#3399CC',
	light: '#33AAEE',
	hcDark: null,
	hcLight: contrastBorder
}, localize('tabActiveModifiedBorder', "Border on the top of modified active tabs in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_INACTIVE_MODIFIED_BORDER = registerColor('tab.inactiveModifiedBorder', {
	dark: transparent(TAB_ACTIVE_MODIFIED_BORDER, 0.5),
	light: transparent(TAB_ACTIVE_MODIFIED_BORDER, 0.5),
	hcDark: Color.white,
	hcLight: contrastBorder
}, localize('tabInactiveModifiedBorder', "Border on the top of modified inactive tabs in an active group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER = registerColor('tab.unfocusedActiveModifiedBorder', {
	dark: transparent(TAB_ACTIVE_MODIFIED_BORDER, 0.5),
	light: transparent(TAB_ACTIVE_MODIFIED_BORDER, 0.7),
	hcDark: Color.white,
	hcLight: contrastBorder
}, localize('unfocusedActiveModifiedBorder', "Border on the top of modified active tabs in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

export const TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER = registerColor('tab.unfocusedInactiveModifiedBorder', {
	dark: transparent(TAB_INACTIVE_MODIFIED_BORDER, 0.5),
	light: transparent(TAB_INACTIVE_MODIFIED_BORDER, 0.5),
	hcDark: Color.white,
	hcLight: contrastBorder
}, localize('unfocusedINactiveModifiedBorder', "Border on the top of modified inactive tabs in an unfocused group. Tabs are the containers for editors in the editor area. Multiple tabs can be opened in one editor group. There can be multiple editor groups."));

//#endregion

// < --- Editors --- >

export const EDITOR_PANE_BACKGROUND = registerColor('editorPane.background', {
	dark: editorBackground,
	light: editorBackground,
	hcDark: editorBackground,
	hcLight: editorBackground
}, localize('editorPaneBackground', "Background color of the editor pane visible on the left and right side of the centered editor layout."));

export const EDITOR_GROUP_EMPTY_BACKGROUND = registerColor('editorGroup.emptyBackground', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('editorGroupEmptyBackground', "Background color of an empty editor group. Editor groups are the containers of editors."));

export const EDITOR_GROUP_FOCUSED_EMPTY_BORDER = registerColor('editorGroup.focusedEmptyBorder', {
	dark: null,
	light: null,
	hcDark: focusBorder,
	hcLight: focusBorder
}, localize('editorGroupFocusedEmptyBorder', "Border color of an empty editor group that is focused. Editor groups are the containers of editors."));

export const EDITOR_GROUP_HEADER_TABS_BACKGROUND = registerColor('editorGroupHeader.tabsBackground', {
	dark: '#252526',
	light: '#F3F3F3',
	hcDark: null,
	hcLight: null
}, localize('tabsContainerBackground', "Background color of the editor group title header when tabs are enabled. Editor groups are the containers of editors."));

export const EDITOR_GROUP_HEADER_TABS_BORDER = registerColor('editorGroupHeader.tabsBorder', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('tabsContainerBorder', "Border color of the editor group title header when tabs are enabled. Editor groups are the containers of editors."));

export const EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND = registerColor('editorGroupHeader.noTabsBackground', {
	dark: editorBackground,
	light: editorBackground,
	hcDark: editorBackground,
	hcLight: editorBackground
}, localize('editorGroupHeaderBackground', "Background color of the editor group title header when tabs are disabled (`\"workbench.editor.showTabs\": false`). Editor groups are the containers of editors."));

export const EDITOR_GROUP_HEADER_BORDER = registerColor('editorGroupHeader.border', {
	dark: null,
	light: null,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('editorTitleContainerBorder', "Border color of the editor group title header. Editor groups are the containers of editors."));

export const EDITOR_GROUP_BORDER = registerColor('editorGroup.border', {
	dark: '#444444',
	light: '#E7E7E7',
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('editorGroupBorder', "Color to separate multiple editor groups from each other. Editor groups are the containers of editors."));

export const EDITOR_DRAG_AND_DROP_BACKGROUND = registerColor('editorGroup.dropBackground', {
	dark: Color.fromHex('#53595D').transparent(0.5),
	light: Color.fromHex('#2677CB').transparent(0.18),
	hcDark: null,
	hcLight: Color.fromHex('#0F4A85').transparent(0.50)
}, localize('editorDragAndDropBackground', "Background color when dragging editors around. The color should have transparency so that the editor contents can still shine through."));

export const EDITOR_DROP_INTO_PROMPT_FOREGROUND = registerColor('editorGroup.dropIntoPromptForeground', {
	dark: editorWidgetForeground,
	light: editorWidgetForeground,
	hcDark: editorWidgetForeground,
	hcLight: editorWidgetForeground
}, localize('editorDropIntoPromptForeground', "Foreground color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor."));

export const EDITOR_DROP_INTO_PROMPT_BACKGROUND = registerColor('editorGroup.dropIntoPromptBackground', {
	dark: editorWidgetBackground,
	light: editorWidgetBackground,
	hcDark: editorWidgetBackground,
	hcLight: editorWidgetBackground
}, localize('editorDropIntoPromptBackground', "Background color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor."));

export const EDITOR_DROP_INTO_PROMPT_BORDER = registerColor('editorGroup.dropIntoPromptBorder', {
	dark: null,
	light: null,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('editorDropIntoPromptBorder', "Border color of text shown over editors when dragging files. This text informs the user that they can hold shift to drop into the editor."));

export const SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER = registerColor('sideBySideEditor.horizontalBorder', {
	dark: EDITOR_GROUP_BORDER,
	light: EDITOR_GROUP_BORDER,
	hcDark: EDITOR_GROUP_BORDER,
	hcLight: EDITOR_GROUP_BORDER
}, localize('sideBySideEditor.horizontalBorder', "Color to separate two editors from each other when shown side by side in an editor group from top to bottom."));

export const SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER = registerColor('sideBySideEditor.verticalBorder', {
	dark: EDITOR_GROUP_BORDER,
	light: EDITOR_GROUP_BORDER,
	hcDark: EDITOR_GROUP_BORDER,
	hcLight: EDITOR_GROUP_BORDER
}, localize('sideBySideEditor.verticalBorder', "Color to separate two editors from each other when shown side by side in an editor group from left to right."));

// < --- Panels --- >

export const PANEL_BACKGROUND = registerColor('panel.background', {
	dark: editorBackground,
	light: editorBackground,
	hcDark: editorBackground,
	hcLight: editorBackground
}, localize('panelBackground', "Panel background color. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_BORDER = registerColor('panel.border', {
	dark: Color.fromHex('#808080').transparent(0.35),
	light: Color.fromHex('#808080').transparent(0.35),
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('panelBorder', "Panel border color to separate the panel from the editor. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_ACTIVE_TITLE_FOREGROUND = registerColor('panelTitle.activeForeground', {
	dark: '#E7E7E7',
	light: '#424242',
	hcDark: Color.white,
	hcLight: editorForeground
}, localize('panelActiveTitleForeground', "Title color for the active panel. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_INACTIVE_TITLE_FOREGROUND = registerColor('panelTitle.inactiveForeground', {
	dark: transparent(PANEL_ACTIVE_TITLE_FOREGROUND, 0.6),
	light: transparent(PANEL_ACTIVE_TITLE_FOREGROUND, 0.75),
	hcDark: Color.white,
	hcLight: editorForeground
}, localize('panelInactiveTitleForeground', "Title color for the inactive panel. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_ACTIVE_TITLE_BORDER = registerColor('panelTitle.activeBorder', {
	dark: PANEL_ACTIVE_TITLE_FOREGROUND,
	light: PANEL_ACTIVE_TITLE_FOREGROUND,
	hcDark: contrastBorder,
	hcLight: '#B5200D'
}, localize('panelActiveTitleBorder', "Border color for the active panel title. Panels are shown below the editor area and contain views like output and integrated terminal."));

export const PANEL_INPUT_BORDER = registerColor('panelInput.border', {
	dark: inputBorder,
	light: '#ddd',
	hcDark: inputBorder,
	hcLight: inputBorder
}, localize('panelInputBorder', "Input box border for inputs in the panel."));

export const PANEL_DRAG_AND_DROP_BORDER = registerColor('panel.dropBorder', {
	dark: PANEL_ACTIVE_TITLE_FOREGROUND,
	light: PANEL_ACTIVE_TITLE_FOREGROUND,
	hcDark: PANEL_ACTIVE_TITLE_FOREGROUND,
	hcLight: PANEL_ACTIVE_TITLE_FOREGROUND
}, localize('panelDragAndDropBorder', "Drag and drop feedback color for the panel titles. Panels are shown below the editor area and contain views like output and integrated terminal."));


export const PANEL_SECTION_DRAG_AND_DROP_BACKGROUND = registerColor('panelSection.dropBackground', {
	dark: EDITOR_DRAG_AND_DROP_BACKGROUND,
	light: EDITOR_DRAG_AND_DROP_BACKGROUND,
	hcDark: EDITOR_DRAG_AND_DROP_BACKGROUND,
	hcLight: EDITOR_DRAG_AND_DROP_BACKGROUND
}, localize('panelSectionDragAndDropBackground', "Drag and drop feedback color for the panel sections. The color should have transparency so that the panel sections can still shine through. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));

export const PANEL_SECTION_HEADER_BACKGROUND = registerColor('panelSectionHeader.background', {
	dark: Color.fromHex('#808080').transparent(0.2),
	light: Color.fromHex('#808080').transparent(0.2),
	hcDark: null,
	hcLight: null,
}, localize('panelSectionHeaderBackground', "Panel section header background color. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));

export const PANEL_SECTION_HEADER_FOREGROUND = registerColor('panelSectionHeader.foreground', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('panelSectionHeaderForeground', "Panel section header foreground color. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));

export const PANEL_SECTION_HEADER_BORDER = registerColor('panelSectionHeader.border', {
	dark: contrastBorder,
	light: contrastBorder,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('panelSectionHeaderBorder', "Panel section header border color used when multiple views are stacked vertically in the panel. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));

export const PANEL_SECTION_BORDER = registerColor('panelSection.border', {
	dark: PANEL_BORDER,
	light: PANEL_BORDER,
	hcDark: PANEL_BORDER,
	hcLight: PANEL_BORDER
}, localize('panelSectionBorder', "Panel section border color used when multiple views are stacked horizontally in the panel. Panels are shown below the editor area and contain views like output and integrated terminal. Panel sections are views nested within the panels."));

// < --- Banner --- >

export const BANNER_BACKGROUND = registerColor('banner.background', {
	dark: listActiveSelectionBackground,
	light: darken(listActiveSelectionBackground, 0.3),
	hcDark: listActiveSelectionBackground,
	hcLight: listActiveSelectionBackground
}, localize('banner.background', "Banner background color. The banner is shown under the title bar of the window."));

export const BANNER_FOREGROUND = registerColor('banner.foreground', {
	dark: listActiveSelectionForeground,
	light: listActiveSelectionForeground,
	hcDark: listActiveSelectionForeground,
	hcLight: listActiveSelectionForeground
}, localize('banner.foreground', "Banner foreground color. The banner is shown under the title bar of the window."));

export const BANNER_ICON_FOREGROUND = registerColor('banner.iconForeground', {
	dark: editorInfoForeground,
	light: editorInfoForeground,
	hcDark: editorInfoForeground,
	hcLight: editorInfoForeground
}, localize('banner.iconForeground', "Banner icon color. The banner is shown under the title bar of the window."));

// < --- Status --- >

export const STATUS_BAR_FOREGROUND = registerColor('statusBar.foreground', {
	dark: '#FFFFFF',
	light: '#FFFFFF',
	hcDark: '#FFFFFF',
	hcLight: editorForeground
}, localize('statusBarForeground', "Status bar foreground color when a workspace or folder is opened. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_NO_FOLDER_FOREGROUND = registerColor('statusBar.noFolderForeground', {
	dark: STATUS_BAR_FOREGROUND,
	light: STATUS_BAR_FOREGROUND,
	hcDark: STATUS_BAR_FOREGROUND,
	hcLight: STATUS_BAR_FOREGROUND
}, localize('statusBarNoFolderForeground', "Status bar foreground color when no folder is opened. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_BACKGROUND = registerColor('statusBar.background', {
	dark: '#007ACC',
	light: '#007ACC',
	hcDark: null,
	hcLight: null,
}, localize('statusBarBackground', "Status bar background color when a workspace or folder is opened. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_NO_FOLDER_BACKGROUND = registerColor('statusBar.noFolderBackground', {
	dark: '#68217A',
	light: '#68217A',
	hcDark: null,
	hcLight: null,
}, localize('statusBarNoFolderBackground', "Status bar background color when no folder is opened. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_BORDER = registerColor('statusBar.border', {
	dark: null,
	light: null,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('statusBarBorder', "Status bar border color separating to the sidebar and editor. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_FOCUS_BORDER = registerColor('statusBar.focusBorder', {
	dark: STATUS_BAR_FOREGROUND,
	light: STATUS_BAR_FOREGROUND,
	hcDark: null,
	hcLight: STATUS_BAR_FOREGROUND
}, localize('statusBarFocusBorder', "Status bar border color when focused on keyboard navigation. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_NO_FOLDER_BORDER = registerColor('statusBar.noFolderBorder', {
	dark: STATUS_BAR_BORDER,
	light: STATUS_BAR_BORDER,
	hcDark: STATUS_BAR_BORDER,
	hcLight: STATUS_BAR_BORDER
}, localize('statusBarNoFolderBorder', "Status bar border color separating to the sidebar and editor when no folder is opened. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_ITEM_ACTIVE_BACKGROUND = registerColor('statusBarItem.activeBackground', {
	dark: transparent(Color.white, 0.18),
	light: transparent(Color.white, 0.18),
	hcDark: transparent(Color.white,0.18),
	hcLight: transparent(Color.black,0.18)
}, localize('statusBarItemActiveBackground', "Status bar item background color when clicking. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_ITEM_FOCUS_BORDER = registerColor('statusBarItem.focusBorder', {
	dark: STATUS_BAR_FOREGROUND,
	light: STATUS_BAR_FOREGROUND,
	hcDark: null,
	hcLight: activeContrastBorder
}, localize('statusBarItemFocusBorder', "Status bar item border color when focused on keyboard navigation. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_ITEM_HOVER_BACKGROUND = registerColor('statusBarItem.hoverBackground', {
	dark: transparent(Color.white,0.12),
	light: transparent(Color.white,0.12),
	hcDark: transparent(Color.white,0.12),
	hcLight: transparent(Color.black,0.12)
}, localize('statusBarItemHoverBackground', "Status bar item background color when hovering. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_ITEM_COMPACT_HOVER_BACKGROUND = registerColor('statusBarItem.compactHoverBackground', {
	dark: transparent(Color.white, 0.20),
	light: transparent(Color.white, 0.20),
	hcDark: transparent(Color.white,0.20),
	hcLight: transparent(Color.black,0.20)
}, localize('statusBarItemCompactHoverBackground', "Status bar item background color when hovering an item that contains two hovers. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_PROMINENT_ITEM_FOREGROUND = registerColor('statusBarItem.prominentForeground', {
	dark: STATUS_BAR_FOREGROUND,
	light: STATUS_BAR_FOREGROUND,
	hcDark: STATUS_BAR_FOREGROUND,
	hcLight: STATUS_BAR_FOREGROUND
}, localize('statusBarProminentItemForeground', "Status bar prominent items foreground color. Prominent items stand out from other status bar entries to indicate importance. Change mode `Toggle Tab Key Moves Focus` from command palette to see an example. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_PROMINENT_ITEM_BACKGROUND = registerColor('statusBarItem.prominentBackground', {
	dark: transparent(Color.black, 0.5),
	light: transparent(Color.black, 0.5),
	hcDark: transparent(Color.black, 0.5),
	hcLight: transparent(Color.black, 0.5),
}, localize('statusBarProminentItemBackground', "Status bar prominent items background color. Prominent items stand out from other status bar entries to indicate importance. Change mode `Toggle Tab Key Moves Focus` from command palette to see an example. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND = registerColor('statusBarItem.prominentHoverBackground', {
	dark: transparent(Color.black, 0.3),
	light: transparent(Color.black, 0.3),
	hcDark: transparent(Color.black, 0.3),
	hcLight: null
}, localize('statusBarProminentItemHoverBackground', "Status bar prominent items background color when hovering. Prominent items stand out from other status bar entries to indicate importance. Change mode `Toggle Tab Key Moves Focus` from command palette to see an example. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_ERROR_ITEM_BACKGROUND = registerColor('statusBarItem.errorBackground', {
	dark: darken(errorForeground, .4),
	light: darken(errorForeground, .4),
	hcDark: null,
	hcLight: '#B5200D'
}, localize('statusBarErrorItemBackground', "Status bar error items background color. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_ERROR_ITEM_FOREGROUND = registerColor('statusBarItem.errorForeground', {
	dark: Color.white,
	light: Color.white,
	hcDark: Color.white,
	hcLight: Color.white
}, localize('statusBarErrorItemForeground', "Status bar error items foreground color. Error items stand out from other status bar entries to indicate error conditions. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_WARNING_ITEM_BACKGROUND = registerColor('statusBarItem.warningBackground', {
	dark: darken(editorWarningForeground, .4),
	light: darken(editorWarningForeground, .4),
	hcDark: null,
	hcLight: '#895503'
}, localize('statusBarWarningItemBackground', "Status bar warning items background color. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window."));

export const STATUS_BAR_WARNING_ITEM_FOREGROUND = registerColor('statusBarItem.warningForeground', {
	dark: Color.white,
	light: Color.white,
	hcDark: Color.white,
	hcLight: Color.white
}, localize('statusBarWarningItemForeground', "Status bar warning items foreground color. Warning items stand out from other status bar entries to indicate warning conditions. The status bar is shown in the bottom of the window."));


// < --- Activity Bar --- >

export const ACTIVITY_BAR_BACKGROUND = registerColor('activityBar.background', {
	dark: '#333333',
	light: '#2C2C2C',
	hcDark: '#000000',
	hcLight: '#FFFFFF'
}, localize('activityBarBackground', "Activity bar background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_FOREGROUND = registerColor('activityBar.foreground', {
	dark: Color.white,
	light: Color.white,
	hcDark: Color.white,
	hcLight: editorForeground
}, localize('activityBarForeground', "Activity bar item foreground color when it is active. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_INACTIVE_FOREGROUND = registerColor('activityBar.inactiveForeground', {
	dark: transparent(ACTIVITY_BAR_FOREGROUND, 0.4),
	light: transparent(ACTIVITY_BAR_FOREGROUND, 0.4),
	hcDark: Color.white,
	hcLight: editorForeground
}, localize('activityBarInActiveForeground', "Activity bar item foreground color when it is inactive. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_BORDER = registerColor('activityBar.border', {
	dark: null,
	light: null,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('activityBarBorder', "Activity bar border color separating to the side bar. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_ACTIVE_BORDER = registerColor('activityBar.activeBorder', {
	dark: ACTIVITY_BAR_FOREGROUND,
	light: ACTIVITY_BAR_FOREGROUND,
	hcDark: null,
	hcLight: contrastBorder
}, localize('activityBarActiveBorder', "Activity bar border color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_ACTIVE_FOCUS_BORDER = registerColor('activityBar.activeFocusBorder', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: '#B5200D'
}, localize('activityBarActiveFocusBorder', "Activity bar focus border color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_ACTIVE_BACKGROUND = registerColor('activityBar.activeBackground', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('activityBarActiveBackground', "Activity bar background color for the active item. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_DRAG_AND_DROP_BORDER = registerColor('activityBar.dropBorder', {
	dark: ACTIVITY_BAR_FOREGROUND,
	light: ACTIVITY_BAR_FOREGROUND,
	hcDark: null,
	hcLight: null,
}, localize('activityBarDragAndDropBorder', "Drag and drop feedback color for the activity bar items. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_BADGE_BACKGROUND = registerColor('activityBarBadge.background', {
	dark: '#007ACC',
	light: '#007ACC',
	hcDark: '#000000',
	hcLight: '#0F4A85'
}, localize('activityBarBadgeBackground', "Activity notification badge background color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_BADGE_FOREGROUND = registerColor('activityBarBadge.foreground', {
	dark: Color.white,
	light: Color.white,
	hcDark: Color.white,
	hcLight: Color.white
}, localize('activityBarBadgeForeground', "Activity notification badge foreground color. The activity bar is showing on the far left or right and allows to switch between views of the side bar."));

export const ACTIVITY_BAR_PROFILE_FOREGROUND = registerColor('activityBarItem.profilesForeground', {
	dark: ACTIVITY_BAR_INACTIVE_FOREGROUND,
	light: ACTIVITY_BAR_INACTIVE_FOREGROUND,
	hcDark: ACTIVITY_BAR_INACTIVE_FOREGROUND,
	hcLight: ACTIVITY_BAR_INACTIVE_FOREGROUND
}, localize('activityBarItem.profilesForeground', "Foreground color for the profile entry on the activity bar."));

export const ACTIVITY_BAR_PROFILE_HOVER_FOREGROUND = registerColor('activityBarItem.profilesHoverForeground', {
	dark: ACTIVITY_BAR_FOREGROUND,
	light: ACTIVITY_BAR_FOREGROUND,
	hcDark: ACTIVITY_BAR_FOREGROUND,
	hcLight: ACTIVITY_BAR_FOREGROUND
}, localize('activityBarItem.profilesHoverForeground', "Foreground color for the profile entry on the activity bar when hovering."));

export const ACTIVITY_BAR_PROFILE_BACKGROUND = registerColor('activityBarItem.profilesBackground', {
	dark: lighten(ACTIVITY_BAR_BACKGROUND, 0.5),
	light: darken(ACTIVITY_BAR_BACKGROUND, 0.12),
	hcDark: null,
	hcLight: null
}, localize('activityBarItem.profilesBackground', "Background color for the profile entry on the activity bar."));

// < --- Remote --- >

export const STATUS_BAR_HOST_NAME_BACKGROUND = registerColor('statusBarItem.remoteBackground', {
	dark: ACTIVITY_BAR_BADGE_BACKGROUND,
	light: ACTIVITY_BAR_BADGE_BACKGROUND,
	hcDark: ACTIVITY_BAR_BADGE_BACKGROUND,
	hcLight: ACTIVITY_BAR_BADGE_BACKGROUND
}, localize('statusBarItemHostBackground', "Background color for the remote indicator on the status bar."));

export const STATUS_BAR_HOST_NAME_FOREGROUND = registerColor('statusBarItem.remoteForeground', {
	dark: ACTIVITY_BAR_BADGE_FOREGROUND,
	light: ACTIVITY_BAR_BADGE_FOREGROUND,
	hcDark: ACTIVITY_BAR_BADGE_FOREGROUND,
	hcLight: ACTIVITY_BAR_BADGE_FOREGROUND
}, localize('statusBarItemHostForeground', "Foreground color for the remote indicator on the status bar."));

export const EXTENSION_BADGE_REMOTE_BACKGROUND = registerColor('extensionBadge.remoteBackground', {
	dark: ACTIVITY_BAR_BADGE_BACKGROUND,
	light: ACTIVITY_BAR_BADGE_BACKGROUND,
	hcDark: ACTIVITY_BAR_BADGE_BACKGROUND,
	hcLight: ACTIVITY_BAR_BADGE_BACKGROUND
}, localize('extensionBadge.remoteBackground', "Background color for the remote badge in the extensions view."));

export const EXTENSION_BADGE_REMOTE_FOREGROUND = registerColor('extensionBadge.remoteForeground', {
	dark: ACTIVITY_BAR_BADGE_FOREGROUND,
	light: ACTIVITY_BAR_BADGE_FOREGROUND,
	hcDark: ACTIVITY_BAR_BADGE_FOREGROUND,
	hcLight: ACTIVITY_BAR_BADGE_FOREGROUND
}, localize('extensionBadge.remoteForeground', "Foreground color for the remote badge in the extensions view."));


// < --- Side Bar --- >

export const SIDE_BAR_BACKGROUND = registerColor('sideBar.background', {
	dark: '#252526',
	light: '#F3F3F3',
	hcDark: '#000000',
	hcLight: '#FFFFFF'
}, localize('sideBarBackground', "Side bar background color. The side bar is the container for views like explorer and search."));

export const SIDE_BAR_FOREGROUND = registerColor('sideBar.foreground', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('sideBarForeground', "Side bar foreground color. The side bar is the container for views like explorer and search."));

export const SIDE_BAR_BORDER = registerColor('sideBar.border', {
	dark: null,
	light: null,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('sideBarBorder', "Side bar border color on the side separating to the editor. The side bar is the container for views like explorer and search."));

export const SIDE_BAR_TITLE_FOREGROUND = registerColor('sideBarTitle.foreground', {
	dark: SIDE_BAR_FOREGROUND,
	light: SIDE_BAR_FOREGROUND,
	hcDark: SIDE_BAR_FOREGROUND,
	hcLight: SIDE_BAR_FOREGROUND
}, localize('sideBarTitleForeground', "Side bar title foreground color. The side bar is the container for views like explorer and search."));

export const SIDE_BAR_DRAG_AND_DROP_BACKGROUND = registerColor('sideBar.dropBackground', {
	dark: EDITOR_DRAG_AND_DROP_BACKGROUND,
	light: EDITOR_DRAG_AND_DROP_BACKGROUND,
	hcDark: EDITOR_DRAG_AND_DROP_BACKGROUND,
	hcLight: EDITOR_DRAG_AND_DROP_BACKGROUND
}, localize('sideBarDragAndDropBackground', "Drag and drop feedback color for the side bar sections. The color should have transparency so that the side bar sections can still shine through. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar."));

export const SIDE_BAR_SECTION_HEADER_BACKGROUND = registerColor('sideBarSectionHeader.background', {
	dark: Color.fromHex('#808080').transparent(0.2),
	light: Color.fromHex('#808080').transparent(0.2),
	hcDark: null,
	hcLight: null
}, localize('sideBarSectionHeaderBackground', "Side bar section header background color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar."));

export const SIDE_BAR_SECTION_HEADER_FOREGROUND = registerColor('sideBarSectionHeader.foreground', {
	dark: SIDE_BAR_FOREGROUND,
	light: SIDE_BAR_FOREGROUND,
	hcDark: SIDE_BAR_FOREGROUND,
	hcLight: SIDE_BAR_FOREGROUND
}, localize('sideBarSectionHeaderForeground', "Side bar section header foreground color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar."));

export const SIDE_BAR_SECTION_HEADER_BORDER = registerColor('sideBarSectionHeader.border', {
	dark: contrastBorder,
	light: contrastBorder,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('sideBarSectionHeaderBorder', "Side bar section header border color. The side bar is the container for views like explorer and search. Side bar sections are views nested within the side bar."));


// < --- Title Bar --- >

export const TITLE_BAR_ACTIVE_FOREGROUND = registerColor('titleBar.activeForeground', {
	dark: '#CCCCCC',
	light: '#333333',
	hcDark: '#FFFFFF',
	hcLight: '#292929'
}, localize('titleBarActiveForeground', "Title bar foreground when the window is active."));

export const TITLE_BAR_INACTIVE_FOREGROUND = registerColor('titleBar.inactiveForeground', {
	dark: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
	light: transparent(TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
	hcDark: null,
	hcLight: '#292929'
}, localize('titleBarInactiveForeground', "Title bar foreground when the window is inactive."));

export const TITLE_BAR_ACTIVE_BACKGROUND = registerColor('titleBar.activeBackground', {
	dark: '#3C3C3C',
	light: '#DDDDDD',
	hcDark: '#000000',
	hcLight: '#FFFFFF'
}, localize('titleBarActiveBackground', "Title bar background when the window is active."));

export const TITLE_BAR_INACTIVE_BACKGROUND = registerColor('titleBar.inactiveBackground', {
	dark: transparent(TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
	light: transparent(TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
	hcDark: null,
	hcLight: null,
}, localize('titleBarInactiveBackground', "Title bar background when the window is inactive."));

export const TITLE_BAR_BORDER = registerColor('titleBar.border', {
	dark: null,
	light: null,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('titleBarBorder', "Title bar border color."));

// < --- Menubar --- >

export const MENUBAR_SELECTION_FOREGROUND = registerColor('menubar.selectionForeground', {
	dark: TITLE_BAR_ACTIVE_FOREGROUND,
	light: TITLE_BAR_ACTIVE_FOREGROUND,
	hcDark: TITLE_BAR_ACTIVE_FOREGROUND,
	hcLight: TITLE_BAR_ACTIVE_FOREGROUND,
}, localize('menubarSelectionForeground', "Foreground color of the selected menu item in the menubar."));

export const MENUBAR_SELECTION_BACKGROUND = registerColor('menubar.selectionBackground', {
	dark: toolbarHoverBackground,
	light: toolbarHoverBackground,
	hcDark: null,
	hcLight: null,
}, localize('menubarSelectionBackground', "Background color of the selected menu item in the menubar."));

export const MENUBAR_SELECTION_BORDER = registerColor('menubar.selectionBorder', {
	dark: null,
	light: null,
	hcDark: activeContrastBorder,
	hcLight: activeContrastBorder,
}, localize('menubarSelectionBorder', "Border color of the selected menu item in the menubar."));

// < --- Notifications --- >

export const NOTIFICATIONS_CENTER_BORDER = registerColor('notificationCenter.border', {
	dark: widgetBorder,
	light: widgetBorder,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('notificationCenterBorder', "Notifications center border color. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_TOAST_BORDER = registerColor('notificationToast.border', {
	dark: widgetBorder,
	light: widgetBorder,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('notificationToastBorder', "Notification toast border color. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_FOREGROUND = registerColor('notifications.foreground', {
	dark: editorWidgetForeground,
	light: editorWidgetForeground,
	hcDark: editorWidgetForeground,
	hcLight: editorWidgetForeground
}, localize('notificationsForeground', "Notifications foreground color. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_BACKGROUND = registerColor('notifications.background', {
	dark: editorWidgetBackground,
	light: editorWidgetBackground,
	hcDark: editorWidgetBackground,
	hcLight: editorWidgetBackground
}, localize('notificationsBackground', "Notifications background color. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_LINKS = registerColor('notificationLink.foreground', {
	dark: textLinkForeground,
	light: textLinkForeground,
	hcDark: textLinkForeground,
	hcLight: textLinkForeground
}, localize('notificationsLink', "Notification links foreground color. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_CENTER_HEADER_FOREGROUND = registerColor('notificationCenterHeader.foreground', {
	dark: null,
	light: null,
	hcDark: null,
	hcLight: null
}, localize('notificationCenterHeaderForeground', "Notifications center header foreground color. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_CENTER_HEADER_BACKGROUND = registerColor('notificationCenterHeader.background', {
	dark: lighten(NOTIFICATIONS_BACKGROUND, 0.3),
	light: darken(NOTIFICATIONS_BACKGROUND, 0.05),
	hcDark: NOTIFICATIONS_BACKGROUND,
	hcLight: NOTIFICATIONS_BACKGROUND
}, localize('notificationCenterHeaderBackground', "Notifications center header background color. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_BORDER = registerColor('notifications.border', {
	dark: NOTIFICATIONS_CENTER_HEADER_BACKGROUND,
	light: NOTIFICATIONS_CENTER_HEADER_BACKGROUND,
	hcDark: NOTIFICATIONS_CENTER_HEADER_BACKGROUND,
	hcLight: NOTIFICATIONS_CENTER_HEADER_BACKGROUND
}, localize('notificationsBorder', "Notifications border color separating from other notifications in the notifications center. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_ERROR_ICON_FOREGROUND = registerColor('notificationsErrorIcon.foreground', {
	dark: editorErrorForeground,
	light: editorErrorForeground,
	hcDark: editorErrorForeground,
	hcLight: editorErrorForeground
}, localize('notificationsErrorIconForeground', "The color used for the icon of error notifications. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_WARNING_ICON_FOREGROUND = registerColor('notificationsWarningIcon.foreground', {
	dark: editorWarningForeground,
	light: editorWarningForeground,
	hcDark: editorWarningForeground,
	hcLight: editorWarningForeground
}, localize('notificationsWarningIconForeground', "The color used for the icon of warning notifications. Notifications slide in from the bottom right of the window."));

export const NOTIFICATIONS_INFO_ICON_FOREGROUND = registerColor('notificationsInfoIcon.foreground', {
	dark: editorInfoForeground,
	light: editorInfoForeground,
	hcDark: editorInfoForeground,
	hcLight: editorInfoForeground
}, localize('notificationsInfoIconForeground', "The color used for the icon of info notifications. Notifications slide in from the bottom right of the window."));

export const WINDOW_ACTIVE_BORDER = registerColor('window.activeBorder', {
	dark: null,
	light: null,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('windowActiveBorder', "The color used for the border of the window when it is active. Only supported in the macOS and Linux desktop client when using the custom title bar."));

export const WINDOW_INACTIVE_BORDER = registerColor('window.inactiveBorder', {
	dark: null,
	light: null,
	hcDark: contrastBorder,
	hcLight: contrastBorder
}, localize('windowInactiveBorder', "The color used for the border of the window when it is inactive. Only supported in the macOS and Linux desktop client when using the custom title bar."));

function darken(colorValue: ColorValue, factor: number): ColorTransform {
  return { op: ColorTransformType.Darken, value: colorValue, factor };
}

function lighten(colorValue: ColorValue, factor: number): ColorTransform {
  return { op: ColorTransformType.Lighten, value: colorValue, factor };
}

function transparent(colorValue: ColorValue, factor: number): ColorTransform {
  return { op: ColorTransformType.Transparent, value: colorValue, factor };
}

function oneOf(...colorValues: ColorValue[]): ColorTransform {
  return { op: ColorTransformType.OneOf, values: colorValues };
}

function ifDefinedThenElse(
  ifArg: ColorIdentifier,
  thenArg: ColorValue,
  elseArg: ColorValue
): ColorTransform {
  return {
    op: ColorTransformType.IfDefinedThenElse,
    if: ifArg,
    then: thenArg,
    else: elseArg,
  };
}

function lessProminent(
  colorValue: ColorValue,
  backgroundColorValue: ColorValue,
  factor: number,
  transparency: number
): ColorTransform {
  return {
    op: ColorTransformType.LessProminent,
    value: colorValue,
    background: backgroundColorValue,
    factor,
    transparency,
  };
}

function rgba(r: number, g: number, b: number, a: number) {
  return tinycolor2(`rgba (${r}, ${g}, ${b}, ${a})`).toHexString();
}

export function executeTransform(
  transform: ColorTransform,
  theme: any
): string | undefined {
  switch (transform.op) {
    case ColorTransformType.Darken: {
      const color = resolveColorValue(transform.value, theme);
      if (!color) return undefined;
      return tinycolor2(color).darken(transform.factor).toHexString();
    }
    case ColorTransformType.Lighten: {
      const color = resolveColorValue(transform.value, theme);
      if (!color) return undefined;
      return tinycolor2(color).lighten(transform.factor).toHexString();
    }
    case ColorTransformType.Transparent: {
      const color = resolveColorValue(transform.value, theme);
      if (!color) return undefined;
      return tinycolor2(color).setAlpha(transform.factor).toHexString();
    }
    case ColorTransformType.OneOf:
      for (const candidate of transform.values) {
        const color = resolveColorValue(candidate, theme);
        if (color) {
          return color;
        }
      }
      return undefined;

    case ColorTransformType.IfDefinedThenElse:
      return resolveColorValue(
        theme.defines(transform.if) ? transform.then : transform.else,
        theme
      );

    case ColorTransformType.LessProminent: {
      const from = resolveColorValue(transform.value, theme);
      if (!from) {
        return undefined;
      }

      const backgroundColor = resolveColorValue(transform.background, theme);
      if (!backgroundColor) {
        return tinycolor2(from)
          .setAlpha(transform.factor * transform.transparency)
          .toHexString();
      }

      const tFrom = tinycolor2(from);
      const tBg = tinycolor2(backgroundColor);

      return tFrom.getLuminance() < tBg.getLuminance()
        ? Color.getLighterColor(tFrom, tBg, transform.factor)
            .setAlpha(transform.transparency)
            .toHexString()
        : Color.getDarkerColor(tFrom, tBg, transform.factor)
            .setAlpha(transform.transparency)
            .toHexString();
    }
    default:
      throw new Error("Invalid transform");
  }
}

/**
 * @param colorValue Resolve a color value in the context of a theme
 */
export function resolveColorValue(
  colorValue: ColorValue | null,
  theme: any
): string | undefined {
  if (colorValue === null) {
    return undefined;
  } else if (typeof colorValue === "string") {
    if (colorValue[0] === "#") {
      return colorValue;
    }
    return resolveColorValue(theme[colorValue], theme);
  } else if (typeof colorValue === "object") {
    return executeTransform(colorValue, theme);
  }
  return undefined;
}

// setTimeout(_ => console.log(colorRegistry.toString()), 5000);
