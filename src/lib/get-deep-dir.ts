// =============================================================================
// GET DEEP DIRECTION UTILITY
// =============================================================================

export function getDeepDir(element: HTMLElement | null): "ltr" | "rtl" {
  if (!element) {
    return "ltr";
  }
  
  const dir = element.getAttribute("dir");
  if (dir === "rtl" || dir === "ltr") {
    return dir;
  }
  
  // Check parent
  return getDeepDir(element.parentElement);
}
