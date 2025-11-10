import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Refactored to use a standard constructor for state initialization and method binding.
  // This is a more robust pattern, ensuring compatibility even if class properties are not configured in the build setup.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.handleTryAgain = this.handleTryAgain.bind(this);
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleTryAgain() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700">
            <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong.</h1>
            <p>We've logged the error and our team will look into it.</p>
            <button
                onClick={this.handleTryAgain}
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