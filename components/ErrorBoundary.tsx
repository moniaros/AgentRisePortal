import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Replaced the constructor with a class property for state initialization.
  // This modern syntax explicitly declares the 'state' property on the class,
  // resolving TypeScript errors where component instance properties were not being found.
  public state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700">
            <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
            <p>We've logged the error and our team will look into it.</p>
            <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
                Try again
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
