// src/components/common/ErrorBoundary.js

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Optionally reload the page
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="text-8xl mb-6">😞</div>
              <h1 className="text-4xl font-bold text-red-700 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-red-800 mb-3">Error Details (Development Only):</h3>
                <pre className="text-sm text-red-700 overflow-auto max-h-64 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-4 rounded-xl text-xl font-bold transition transform hover:scale-105"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-xl text-xl font-bold transition"
              >
                Go Home
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Made with Bob
