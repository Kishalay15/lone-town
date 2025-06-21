import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const useLogout = () => {
  const { logout } = useAuth();

  return () => {
    socket.disconnect();
    logout();
    window.location.href = "/login";
  };
};

export default useLogout;
