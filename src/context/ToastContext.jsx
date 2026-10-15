import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(null);

const TOAST_DURATION = 6000;

export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((text) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), TOAST_DURATION);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {message && (
        <div className="toast" role="status">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="toast__close" aria-label="Fechar aviso">×</button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
