"use client";

import { useStore } from "@/components/store/StoreProvider";

const borderClass: Record<string, string> = {
  success: "border-success",
  danger: "border-danger",
  info: "border-info",
  warning: "border-warning",
};

export function ToastViewport() {
  const { toasts, dismissToast } = useStore();

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast show align-items-center text-white bg-dark border shadow-lg ${borderClass[toast.type] ?? "border-danger"}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body d-flex align-items-center gap-2">
              <span style={{ color: "#e50914", fontSize: "1.1rem", fontWeight: "bold" }}>
                {toast.type === "success" ? "✔" : "●"}
              </span>
              <span style={{ fontSize: "0.92rem" }}>{toast.message}</span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() => dismissToast(toast.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
