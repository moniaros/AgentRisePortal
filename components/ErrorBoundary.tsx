import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// FIX: Changed to use the named import `Component` to ensure TypeScript correctly recognizes the inherited properties like `props`.
class ErrorBoundary extends Component<Props, State> {
  // Use a class property to initialize state, which is a common and modern pattern.
  // FIX: Removed 'public' modifier to align with common React class component style and avoid potential tooling issues.
  state: State = {
    hasError: false,
    error: undefined,
  };

  // FIX: Removed 'public' modifier. Static methods are public by default.
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  // FIX: Removed 'public' modifier. Methods are public by default.
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  // FIX: Removed 'public' modifier. The render method is public by default.
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700">
          <h1 className="text-4xl font-bold">Oops! Something went wrong.</h1>
          <p className="mt-4 text-lg">We're sorry for the inconvenience. Please try refreshing the page.</p>
          {this.state.error && (
            <details className="mt-6 p-4 bg-red-100 rounded-md w-full max-w-2xl text-left">
              <summary>Error Details</summary>
              <pre className="mt-2 text-sm whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
