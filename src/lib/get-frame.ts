// =============================================================================
// GET FRAME UTILITY
// =============================================================================

export function getFrame(): Document | null {
  if (typeof window === "undefined") {
    return null;
  }
  
  // Try to find the puck iframe
  const iframe = window.document.querySelector("iframe[data-puck-frame]");
  if (iframe) {
    return (iframe as HTMLIFrameElement).contentDocument;
  }
  
  // Fallback to main document
  return window.document;
}
