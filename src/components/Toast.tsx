import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type}`}>
          <div className="toast-icon-wrapper">
            {toast.type === 'success' && <CheckCircle2 size={18} className="toast-icon success" />}
            {toast.type === 'error' && <AlertTriangle size={18} className="toast-icon error" />}
            {toast.type === 'info' && <Info size={18} className="toast-icon info" />}
          </div>
          <div className="toast-body">
            <h4 className="toast-title">{toast.title}</h4>
            {toast.description && <p className="toast-desc">{toast.description}</p>}
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
