import { createContext, useContext, useState } from "react";

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [ownerModalStep, setOwnerModalStep] = useState(1);
  
  // Pre-fill data for forms
  const [contactPreFill, setContactPreFill] = useState({});
  const [ownerPreFill, setOwnerPreFill] = useState({});

  const openContactModal = (preFill = {}) => {
    setContactPreFill(preFill);
    setContactModalOpen(true);
  };

  const closeContactModal = () => {
    setContactModalOpen(false);
    setContactPreFill({});
  };

  const openOwnerModal = (preFill = {}, step = 1) => {
    setOwnerPreFill(preFill);
    setOwnerModalStep(step);
    setOwnerModalOpen(true);
  };

  const closeOwnerModal = () => {
    setOwnerModalOpen(false);
    setOwnerPreFill({});
    setOwnerModalStep(1);
  };

  return (
    <ModalContext.Provider
      value={{
        contactModalOpen,
        ownerModalOpen,
        ownerModalStep,
        setOwnerModalStep,
        contactPreFill,
        ownerPreFill,
        openContactModal,
        closeContactModal,
        openOwnerModal,
        closeOwnerModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};
