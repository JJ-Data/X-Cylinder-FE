'use client'

import React from 'react'
import Container from '@/components/shared/Container'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { PiWarningDuotone } from 'react-icons/pi'

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export default class DashboardErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error to console with component stack
        console.error('[Dashboard Error Boundary]', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString()
        })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <Container>
                    <div className="min-h-[400px] flex items-center justify-center">
                        <div className="max-w-md w-full">
                            <Alert type="danger" showIcon>
                                <div className="flex items-start gap-3">
                                    <PiWarningDuotone className="text-2xl flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-2">
                                            Dashboard Error
                                        </h3>
                                        <p className="text-sm mb-3">
                                            An unexpected error occurred while loading the dashboard.
                                        </p>
                                        {this.state.error && (
                                            <details className="mb-3">
                                                <summary className="cursor-pointer text-sm font-medium">
                                                    Error Details
                                                </summary>
                                                <pre className="text-xs mt-2 p-2 bg-red-50 rounded overflow-auto">
                                                    {this.state.error.message}
                                                    {process.env.NODE_ENV === 'development' && (
                                                        <>
                                                            {'\n\nStack trace:\n'}
                                                            {this.state.error.stack}
                                                        </>
                                                    )}
                                                </pre>
                                            </details>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="solid"
                                                onClick={this.handleReset}
                                            >
                                                Try Again
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="plain"
                                                onClick={() => window.location.reload()}
                                            >
                                                Reload Page
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Alert>
                        </div>
                    </div>
                </Container>
            )
        }

        return this.props.children
    }
}