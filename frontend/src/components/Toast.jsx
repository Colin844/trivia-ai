const Toast = ({ toast }) =>
  toast ? (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow z-50 ${
      toast.variant === "success"
        ? "bg-green-200 text-green-800"
        : "bg-gray-200 text-gray-800"
    }`}>
      {toast.text}
    </div>
  ) : null;

export default Toast;