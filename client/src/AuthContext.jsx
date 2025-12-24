import { createContext, useContext, useEffect, useState } from "react";
import { auth, signInWithGoogle, logout } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
            id: currentUser.uid,
            fullName: currentUser.displayName || "User",
            firstName: currentUser.displayName ? currentUser.displayName.split(" ")[0] : "User",
            primaryEmailAddress: { emailAddress: currentUser.email },
            imageUrl: currentUser.photoURL
        });
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoaded, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- HOOKS ONLY (No UI Components here) ---

export const useUser = () => {
    const context = useContext(AuthContext);
    return { ...context, isSignedIn: !!context.user };
};

export const SignedIn = ({ children }) => {
  const { user } = useUser();
  return user ? children : null;
};

export const SignedOut = ({ children }) => {
  const { user } = useUser();
  return !user ? children : null;
};

export const SignInButton = ({ mode, children, className, forceRedirectUrl }) => {
    const { signInWithGoogle } = useContext(AuthContext);
    
    const handleLogin = async (e) => {
        if (children && children.props && children.props.onClick) {
            children.props.onClick(e);
        }
        await signInWithGoogle();
    };

    return (
        <div className={className}>
            {children ? (
                {...children, props: { ...children.props, onClick: handleLogin }}
            ) : (
                <button onClick={signInWithGoogle}>Sign In</button>
            )}
        </div>
    );
};