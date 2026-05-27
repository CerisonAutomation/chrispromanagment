// @ts-nocheck
import { render, screen, within } from '@/test/utils';
import { ErrorBoundary } from '@/components/error-boundary';

// Component that throws an error
function ThrowError({ shouldThrow }) {
  if (shouldThrow) {
throw new Error('Test error');
}
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test child</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test child')).toBeInTheDocument();
  });

  it('displays error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("We hit an unexpected error.")).toBeInTheDocument();
    expect(screen.getByText(/team has been notified/i)).toBeInTheDocument();
  });

  it('has reload and try again buttons in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
