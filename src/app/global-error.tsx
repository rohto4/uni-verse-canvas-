'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: '#000',
            }}>
              重大なエラー
            </h1>
            <p style={{
              color: '#666',
              marginBottom: '1.5rem',
              lineHeight: '1.5',
            }}>
              申し訳ございません。システムで予期しないエラーが発生しました。
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '1rem',
                borderRadius: '0.375rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: '#666',
                overflow: 'auto',
                maxHeight: '200px',
              }}>
                {error.message}
              </div>
            )}

            <button
              onClick={reset}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              もう一度試す
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
