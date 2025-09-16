import * as React from "react";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

const ToastContext = React.createContext<{
  toast: (props: ToastProps) => void;
} | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastProps & { id: string }>>(
    []
  );

  const toast = React.useCallback(
    ({ title, description, variant = "default", duration = 3000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-md transition-all animate-in fade-in ${
              toast.variant === "destructive" ? "bg-red-100 border-l-4 border-red-500" : "bg-green-100 border-l-4 border-green-500"
            }`}
          >
            {toast.title && <h4 className="font-bold">{toast.title}</h4>}
            {toast.description && <p className="text-sm">{toast.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = React.useContext(ToastContext);

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

export const toast = (props: ToastProps) => {
  // Placeholder for direct usage without hooks
  // In a real app, you'd need to handle this differently or use a library like react-hot-toast
  console.warn("Direct toast call outside React component", props);
  
  // Basic fallback if needed
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.textContent = `${props.title}: ${props.description}`;
    div.style.position = "fixed";
    div.style.top = "1rem";
    div.style.right = "1rem";
    div.style.background = props.variant === "destructive" ? "rgba(254,226,226,1)" : "rgba(220,252,231,1)";
    div.style.borderLeft = props.variant === "destructive" ? "4px solid rgb(239,68,68)" : "4px solid rgb(34,197,94)";
    div.style.padding = "1rem";
    div.style.borderRadius = "0.375rem";
    div.style.zIndex = "9999";
    
    document.body.appendChild(div);
    setTimeout(() => {
      div.remove();
    }, props.duration || 3000);
  }
};
