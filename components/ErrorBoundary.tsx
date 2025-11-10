import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// FIX: The class must extend `Component<Props, State>` to be a valid React component,
// giving it access to props, state, and lifecycle methods, resolving errors about
// missing `state` and `props` properties.
class ErrorBoundary extends Component<Props, State> {
  // FIX: State must be initialized. Using a constructor that calls `super(props)` is a robust way to do this.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
    // FIX: Bind class methods to ensure `this` refers to the component instance when called from event handlers.
    this.handleTryAgain = this.handleTryAgain.bind(this);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleTryAgain() {
    // FIX: `this.setState` is available because the class extends React.Component.
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

    // FIX: `this.props.children` is accessible because the class correctly inherits from React.Component.
    return this.props.children;
  }
}

export default ErrorBoundary;
