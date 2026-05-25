import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CMSProvider } from '@/context/cmscontext';
import { ModalProvider } from '@/context/modalcontext';
import { ErrorBoundary } from '@/components/error/boundary';

function AllProviders({ children }) {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <CMSProvider>
          <ModalProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </ModalProvider>
        </CMSProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

const customRender = (ui, options) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
