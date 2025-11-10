import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Use modern class property syntax for state initialization.
  // This is a more concise and common pattern in modern React and can help
  // avoid complex `this` binding issues in the constructor, resolving the type errors.
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  // FIX: Use an arrow function for the event handler to automatically bind `this`.
  // This is the standard way to handle events in class components without manual binding in the constructor.
  private handleTryAgain = () => {
    this.setState({ hasError: false, error: undefined });
  };

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
