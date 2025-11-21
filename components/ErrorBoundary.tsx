import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
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