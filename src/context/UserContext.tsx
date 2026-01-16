import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/firebase";

type AppUser = { uid: string; email?: string | null; displayName?: string | null } | null;
type UserContextValue = { user: AppUser; loading: boolean };

const UserContext = createContext<UserContextValue>({ user: null, loading: true });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: FirebaseUser | null) => {
      if (u) setUser({ uid: u.uid, email: u.email, displayName: u.displayName });
      else setUser(null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>;
};

export function useUser() {
  return useContext(UserContext);
}
