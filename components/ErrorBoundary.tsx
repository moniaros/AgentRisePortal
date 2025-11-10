import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
    // FIX: Bind the method to ensure `this` is correct when called,
    // avoiding class field syntax which seems to be incompatible with the project's tooling.
    this.handleTryAgain = this.handleTryAgain.bind(this);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleTryAgain() {
    this.setState({ hasError: false, error: undefined });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-4">
          <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p className="mb-4">We've logged the error and our team will look into it.</p>
          <button
            onClick={this.handleTryAgain}
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
