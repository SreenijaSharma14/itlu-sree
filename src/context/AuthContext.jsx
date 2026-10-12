import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* -----------------------------------------
     GET PROFILE
  ----------------------------------------- */

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      return;
    }

    setProfile(data);
  };

  /* -----------------------------------------
     INITIAL SESSION
  ----------------------------------------- */

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      }

      setLoading(false);
    };

    getInitialSession();

    /* -----------------------------------------
       LISTEN FOR LOGIN / LOGOUT
    ----------------------------------------- */

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /* -----------------------------------------
     REGISTER
  ----------------------------------------- */

  const register = async ({
    name,
    phone,
    email,
    password,
  }) => {
    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone,
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  /* -----------------------------------------
     LOGIN
  ----------------------------------------- */

  const login = async (email, password) => {
    setLoading(true);

    try {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /* -----------------------------------------
     LOGOUT
  ----------------------------------------- */

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
