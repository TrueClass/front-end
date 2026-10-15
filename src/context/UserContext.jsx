import React, { createContext, useCallback, useContext, useState } from "react";

const UserContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("usuarioLogado") || "null");
  } catch {
    return null;
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [classesVersion, setClassesVersion] = useState(0);

  const login = useCallback((userData) => {
    localStorage.setItem("usuarioLogado", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  const refreshClasses = useCallback(() => setClassesVersion(v => v + 1), []);

  return (
    <UserContext.Provider value={{ user, login, logout, classesVersion, refreshClasses }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);
