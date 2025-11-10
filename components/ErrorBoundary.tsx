import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Replaced class field state initialization with a constructor. This ensures the component's `this` context is correctly set up, resolving errors where `this.props` and `this.setState` were not found. This is a safer pattern for React class components, especially with modern TypeScript compilers.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-4">
          <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p className="mb-4">We've logged the error and our team will look into it.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Try again
          </button>
          {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left bg-white p-4 rounded border border-red-200 w-full max-w-2xl">
                  <summary>Error Details</summary>
                  <pre className="mt-2 text-sm whitespace-pre-wrap">
                      {this.state.error?.toString()}
                      <br />
                      {this.state.error?.stack}
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
