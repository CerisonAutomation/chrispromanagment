import { Component, ErrorInfo } from "react";
import { cn } from '@/lib/utils';

export interface BlockErrorBoundaryProps {
  blockType?: string;
  blockId?: string;
  children: React.ReactNode;
}

interface BlockErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * BlockErrorBoundary - Catches render errors inside CMS blocks to prevent full page crashes
 * @param props - Component props (blockType, blockId, children)
 * @returns React component
 */
export class BlockErrorBoundary extends Component<BlockErrorBoundaryProps, BlockErrorBoundaryState> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Block error:", this.props.blockType, this.props.blockId, error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      const { blockType, blockId } = this.props;
      return (
        <div
          className={cn("my-2 p-4 border border-red-500/40 bg-red-500/10 text-sm")}
          data-testid={`block-error-${blockId || blockType || "unknown"}`}
          aria-label="Block render error"
        >
          <div className="flex items-center justify-between">
            <div className="text-red-300">
              <strong>Block error:</strong>{" "}
              <code className={cn("text-[#F5F5F0] bg-[#0F0F10] px-1.5 py-0.5")}>
                {blockType || "unknown"}
              </code>
              <span className="ml-2 text-red-200/70">
                {this.state.error?.message || "Render failed"}
              </span>
            </div>
            <button
              type="button"
              onClick={this.reset}
              className={cn("text-red-200 hover:text-white underline underline-offset-2 text-xs")}
              aria-label="Try rendering block again"
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
