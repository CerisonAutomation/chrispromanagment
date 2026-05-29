import { Component } from "react";

/**
 * BlockErrorBoundary
 * Catches any render error inside a single CMS block so one bad block
 * never takes down the whole AdminPage canvas.
 *
 * Usage:
 *   <BlockErrorBoundary blockType="hero" blockId="b_hero">
 *     <SomeBlockRenderer />
 *   </BlockErrorBoundary>
 */
export class BlockErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Block error:", this.props.blockType, this.props.blockId, error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      const { blockType, blockId } = this.props;
      return (
        <div
          className="my-2 p-4 border border-red-500/40 bg-red-500/10 text-sm"
          data-testid={`block-error-${blockId || blockType || "unknown"}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-red-300">
              <strong>Block error:</strong>{" "}
              <code className="text-[#F5F5F0] bg-[#0F0F10] px-1.5 py-0.5">
                {blockType || "unknown"}
              </code>
              <span className="ml-2 text-red-200/70">
                {this.state.error?.message || "Render failed"}
              </span>
            </div>
            <button
              type="button"
              onClick={this.reset}
              className="text-red-200 hover:text-white underline underline-offset-2 text-xs"
            >
              try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default BlockErrorBoundary;
