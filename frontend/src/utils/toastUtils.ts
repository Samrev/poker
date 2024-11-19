import { toast } from "react-toastify";

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showInfoToast = (message: string) => {
  toast.info(message, {
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
  });
};

export const showWarningToast = (message: string) => {
  toast.warn(message, {
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
  });
};
