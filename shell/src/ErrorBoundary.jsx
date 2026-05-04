import React from 'react';

/**
 * ErrorBoundary - Capture les erreurs des MFEs et empêche le crash total
 * Si un MFE crash, affiche un message d'erreur mais le reste fonctionne
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          background: '#1a0a0a',
          border: '2px solid #ff0000',
          borderRadius: '4px',
          color: '#ff6b6b',
          fontFamily: 'monospace',
        }}>
          <h3>⚠️ Erreur de chargement</h3>
          <p>{this.state.error?.message || 'Composant indisponible'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
