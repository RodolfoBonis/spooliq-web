// Slicer analysis types — mirror of the backend `/slicer/analyze` contract.

/** Origin of the parsed analysis. */
export type SliceSource = 'gcode' | '3mf'

/** How confident the backend is about a catalog-filament match for a slot. */
export type SliceConfidence = 'exact' | 'close' | 'none'

/** A suggested catalog filament for a slicer filament slot. */
export interface SliceFilamentSuggestion {
  filament_id: string
  name: string
  color_hex: string
  material: string
  confidence: SliceConfidence
  /** Color-distance metric the backend used to rank the suggestion (lower = closer). */
  distance?: number
}

/** A single filament slot (AMS/extruder) detected in a plate. */
export interface SliceFilament {
  slot: number
  grams: number
  length_mm?: number
  color_hex?: string
  material?: string
  /**
   * Catalog match. Present (object or `null`) on the analyze/with-suggestions
   * responses; absent on the analysis embedded in a `Model3D`.
   */
  suggestion?: SliceFilamentSuggestion | null
}

/** A build plate (a 3MF/G-code can contain several). */
export interface SlicePlate {
  index: number
  name?: string
  print_time_seconds: number
  /** True when the slicer only provided an estimate (time/weight are approximate). */
  estimated: boolean
  filaments: SliceFilament[]
}

/** Slicer software identification. */
export interface SlicerInfo {
  name: string
  version: string
}

/** Full slicer analysis payload. */
export interface SliceAnalysis {
  source: SliceSource
  slicer: SlicerInfo
  plates: SlicePlate[]
  warnings: string[]
}
