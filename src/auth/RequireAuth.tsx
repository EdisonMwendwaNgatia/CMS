import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
  }, []);

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  return children;
}
