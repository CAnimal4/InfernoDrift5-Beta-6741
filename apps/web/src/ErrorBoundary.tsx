import { Component, type ReactNode } from "react";

type State = { error?: Error };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="crash-screen">
        <h1>InfernoDrift4 recovered from a crash</h1>
        <p>{this.state.error.message}</p>
        <button type="button" onClick={() => location.reload()}>
          Reload game
        </button>
      </main>
    );
  }
}
