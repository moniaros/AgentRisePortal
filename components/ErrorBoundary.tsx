import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Switched to class property for state initialization.
  // The constructor-based approach was causing errors where `this.state` and `this.props` were not found.
  // This more modern syntax is often preferred and can resolve such build-time issues.
  state: State = {
    hasError: false,
    error: undefined,
  };

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
