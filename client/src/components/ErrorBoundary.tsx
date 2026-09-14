import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
          {/* Glowing icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-900/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-red-900/20 border border-red-700/50 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Something Went Wrong
          </h1>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
            NodeWaves Quest encountered an unexpected error. Please try reloading the page.
          </p>

          {/* Error details (collapsed by default in production feel) */}
          <details className="w-full max-w-2xl mb-6">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Technical details
            </summary>
            <div className="mt-2 p-4 rounded-lg bg-zinc-900 border border-zinc-700 overflow-auto">
              <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                {this.state.error?.message}
              </pre>
            </div>
          </details>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-bold text-sm",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer transition-all shadow-lg shadow-primary/20"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-bold text-sm",
                "bg-zinc-800 text-foreground border border-zinc-700",
                "hover:bg-zinc-700 cursor-pointer transition-all"
              )}
            >
              <Home size={16} />
              Go Home
            </button>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            © 2026 NodeWaves Quest
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
