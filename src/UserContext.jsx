import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("usuarioLogado") || "null")
  );
  const [classesVersion, setClassesVersion] = useState(0);

  const login = (userData) => {
    localStorage.setItem("usuarioLogado", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const refreshClasses = () => setClassesVersion(v => v + 1);

  return (
    <UserContext.Provider value={{ user, login, logout, classesVersion, refreshClasses }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
