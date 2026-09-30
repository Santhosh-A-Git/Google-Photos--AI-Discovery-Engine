import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-7xl mx-auto h-full flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl w-full shadow-lg">
            <h1 className="text-2xl font-bold text-red-700 mb-4 flex items-center gap-2">
              <span>⚠️</span> React Runtime Crash
            </h1>
            <p className="text-red-900 font-medium mb-4">The frontend encountered a rendering error and could not display this page.</p>
            <div className="bg-white p-4 rounded-lg font-mono text-sm text-slate-800 overflow-auto border border-red-100 max-h-96">
              <div className="font-bold text-red-600 mb-2">{this.state.error?.toString()}</div>
              <div className="whitespace-pre-wrap text-xs text-slate-600">{this.state.errorInfo?.componentStack}</div>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
