import React from "react";

type Props = {
    fallback?: React.ReactNode;
    children: React.ReactNode;
};

type State = {
    hasError: boolean;
};

class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? "Something went wrong";
        }

        return this.props.children;
    }
}

export default ErrorBoundary;