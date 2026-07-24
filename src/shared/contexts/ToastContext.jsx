import { useCallback, useState } from 'react';
import ToastContext from './toastContextValue';

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastIdCounter;
    setToasts((current) => [...current, { id, message, type, exiting: false }]);

    setTimeout(() => {
      setToasts((current) =>
        current.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );
      setTimeout(() => {
        removeToast(id);
      }, 300);
    }, 3500);

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, toasts }}>
      {children}
      <div className="toaster-container" aria-live="polite" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item toast-item--${toast.type} ${toast.exiting ? 'toast-item--exiting' : ''}`}
            role="alert"
          >
            <span className="toast-icon">
              {toast.type === 'success' && <i className="bi bi-check-circle-fill" />}
              {toast.type === 'error' && <i className="bi bi-exclamation-circle-fill" />}
              {toast.type === 'info' && <i className="bi bi-info-circle-fill" />}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              type="button"
              aria-label="Close notification"
            >
              
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;

