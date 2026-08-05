import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("❌ ErrorBoundary caught:", error, errorInfo);
        // Optionally send to error tracking service
    }

    render() {
        if (this.state.hasError) {
            // Allow custom fallback or use default
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[100dvh] bg-black flex items-center justify-center p-6">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Something went wrong</h2>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            {this.props.message || "An unexpected error occurred. Please try refreshing the page."}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.reload();
                                }}
                                className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCcw size={16} /> Refresh
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.href = '/';
                                }}
                                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <Home size={16} /> Home
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">Error Details</summary>
                                <pre className="mt-2 text-xs text-red-400 bg-black/40 p-3 rounded-lg overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
