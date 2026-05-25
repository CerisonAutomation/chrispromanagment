import { renderHook, act } from '@testing-library/react-hooks';
import { render, screen } from '@/test/utils';
import { ModalProvider, useModal } from '../ModalContext';

function TestComponent() {
  const { contactModalOpen, openContactModal, closeContactModal } = useModal();
  return (
    <div>
      <span>{contactModalOpen ? 'Open' : 'Closed'}</span>
      <button onClick={() => openContactModal()}>Open</button>
      <button onClick={closeContactModal}>Close</button>
    </div>
  );
}

describe('ModalContext', () => {
  it('throws error when useModal is used outside provider', () => {
    expect(() => renderHook(() => useModal())).toThrow('useModal must be used within ModalProvider');
  });

  it('provides modal state and functions', () => {
    const { result } = renderHook(() => useModal(), {
      wrapper: ModalProvider,
    });

    expect(result.current.contactModalOpen).toBe(false);
    expect(typeof result.current.openContactModal).toBe('function');
    expect(typeof result.current.closeContactModal).toBe('function');
  });

  it('opens contact modal when openContactModal is called', () => {
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    expect(screen.getByText('Closed')).toBeInTheDocument();

    act(() => {
      screen.getByRole('button', { name: /open/i }).click();
    });

    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
