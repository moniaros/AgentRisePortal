import React, { Component, ErrorInfo, ReactNode } from 'react';

// FIX: Use React.PropsWithChildren to correctly type the 'children' prop.
interface ErrorBoundaryProps extends React.PropsWithChildren {
  // No other props are needed, but this ensures 'children' is available.
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Initialize state as a class property instead of in the constructor.
  // This modern syntax resolves issues where TypeScript might not correctly recognize
  // 'this.state' and 'this.props' when assigned in the constructor, especially with
  // certain tsconfig settings like `useDefineForClassFields`. This fixes all errors
  // related to accessing 'this.state' and 'this.props'.
  state: ErrorBoundaryState = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col justify-center items-center h-screen bg-red-100 text-red-700 p-4">
          <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
          {this.state.error && (
            <pre className="mt-4 text-xs bg-white p-4 rounded border border-red-200 w-full max-w-2xl overflow-auto">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
