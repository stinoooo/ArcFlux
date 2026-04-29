'use client'

import { Component, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Flux Error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center p-4 font-mono">
          <div className="panel reveal w-full max-w-md p-8">
            <div className="text-[10px] tracking-[0.25em] uppercase text-[var(--danger)] mb-4 flex items-center gap-2">
              <span className="led led-pulse text-[var(--danger)]" />
              Fault · 5xx
            </div>
            <h2 className="display-serif text-[32px] leading-[1.05] text-[var(--text)] mb-2">
              <span className="italic text-[var(--danger)]">/</span> System interrupted.
            </h2>
            <p className="text-[12px] leading-[1.7] text-[var(--text-dim)] mb-6 break-words">
              {this.state.error?.message || 'An unexpected fault occurred. Restart the instrument.'}
            </p>
            <Button
              variant="primary"
              onClick={this.handleRetry}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Restart
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
