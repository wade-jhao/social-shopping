import React, { Component, ReactNode } from "react";
// import { sendGaEvent } from "@utils/track";

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: React.ErrorInfo | null;
  error: Error | null;
}

interface ErrorInfo {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: { error: ErrorInfo }) => JSX.Element;
}

class CustomErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorInfo: null,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // You can also log the error to an error reporting service here.
    // sendGaEvent<{ msg: string; type: string }>("error_notice", {
    //   msg: JSON.stringify(error),
    //   type: "react",
    // });
    this.setState({
      errorInfo: errorInfo,
      error: error,
    });
  }

  render(): ReactNode {
    const FallBack = this.props.fallback;
    if (this.state.hasError && this.state.errorInfo) {
      if (FallBack) {
        return (
          <FallBack
            error={{
              message: (this.state.error && this.state.error.toString()) || "",
              source:
                this.state.errorInfo && this.state.errorInfo.componentStack,
            }}
          />
        );
      }
      return (
        <div style={{ padding: 20 }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

export default CustomErrorBoundary;
