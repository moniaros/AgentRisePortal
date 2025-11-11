import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Replaced public class field with a constructor for state initialization to resolve an issue where `this.props` was not being recognized by the TypeScript compiler. The standard constructor pattern ensures proper component initialization and type inference.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

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
