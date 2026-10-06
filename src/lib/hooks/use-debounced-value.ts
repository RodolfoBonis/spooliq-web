import { useEffect, useState } from 'react'

/** Structural equality for plain JSON-like data (request payloads). */
function isJsonEqual(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Returns `value` after it has stopped changing for `delayMs`.
 *
 * Values are compared structurally, so passing an object literal that is recreated on
 * every render is safe: the debounced reference only changes when the content does.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced((previous) => (isJsonEqual(previous, value) ? previous : value))
    }, delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
