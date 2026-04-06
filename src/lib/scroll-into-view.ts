// =============================================================================
// SCROLL INTO VIEW UTILITY
// =============================================================================

export function scrollIntoView(
  element: HTMLElement | null,
  options?: ScrollIntoViewOptions
) {
  if (element) {
    element.scrollIntoView(options);
  }
}
