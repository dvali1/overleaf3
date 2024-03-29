export const ABSOLUTE_SIZE_REGEX = /[pbm]\{\s*(\d*[.]?\d+)\s*(mm|cm|pt|in)\s*\}/

export const RELATIVE_SIZE_REGEX =
  /[pbm]\{\s*(\d*[.]?\d+)\s*\\(linewidth|textwidth|columnwidth)\s*\}/

export type AbsoluteWidthUnits = 'mm' | 'cm' | 'in' | 'pt'
export type RelativeWidthCommand = 'linewidth' | 'textwidth' | 'columnwidth'
export type WidthUnit = AbsoluteWidthUnits | '%' | 'custom'

const ABSOLUTE_UNITS = ['mm', 'cm', 'in', 'pt'] as const
export const UNITS: WidthUnit[] = ['%', ...ABSOLUTE_UNITS, 'custom']

type PercentageWidth = {
  unit: '%'
  width: number
  command?: RelativeWidthCommand
}

type CustomWidth = {
  unit: 'custom'
  width: string
}

type AbsoluteWidth = {
  unit: Exclude<WidthUnit, '%' | 'custom'>
  width: number
}

export type WidthSelection = PercentageWidth | CustomWidth | AbsoluteWidth

export const isPercentageWidth = (
  width: WidthSelection
): width is PercentageWidth => {
  return width.unit === '%'
}

export const isAbsoluteWidth = (
  width: WidthSelection
): width is AbsoluteWidth => {
  return (ABSOLUTE_UNITS as readonly string[]).includes(width.unit)
}

export const isCustomWidth = (width: WidthSelection): width is CustomWidth => {
  return width.unit === 'custom'
}
