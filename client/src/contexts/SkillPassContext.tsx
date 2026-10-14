import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  seedState,
  type DemoActor,
  type Role,
  type SkillPassAction,
  type SkillPassState,
} from "@shared/skillpass";

type CandidateMatch = {
  workerId: string;
  score: number;
  trade: number;
  skills: number;
  experience: number;
  location: number;
  explanation: string;
};
type JobMatches = { jobId: string; candidates: CandidateMatch[] }[];
type ContextValue = {
  actor: DemoActor | null;
  state: SkillPassState;
  loading: boolean;
  busy: boolean;
  persistence: string;
  matches: JobMatches;
  error: string;
  login: (
    role: Role,
    workerId?: string,
    employerId?: string
  ) => Promise<DemoActor>;
  logout: () => void;
  dispatch: (action: SkillPassAction) => Promise<SkillPassState>;
  refresh: () => Promise<void>;
  clearError: () => void;
};
const SkillPassContext = createContext<ContextValue | null>(null);
const tokenKey = "skillpass-demo-token",
  actorKey = "skillpass-demo-actor",
  cacheKey = "skillpass-demo-cache";

export function SkillPassProvider({ children }: { children: React.ReactNode }) {
  const [actor, setActor] = useState<DemoActor | null>(() => {
    try {
      if (!sessionStorage.getItem(tokenKey)) {
        sessionStorage.removeItem(actorKey);
        return null;
      }
      return JSON.parse(sessionStorage.getItem(actorKey) || "null");
    } catch {
      return null;
    }
  });
  const [state, setState] = useState<SkillPassState>(() => {
    try {
      if (!sessionStorage.getItem(tokenKey)) {
        localStorage.removeItem(cacheKey);
        return seedState();
      }
      return (
        JSON.parse(localStorage.getItem(cacheKey) || "null") ?? seedState()
      );
    } catch {
      return seedState();
    }
  });
  const [loading, setLoading] = useState(!!sessionStorage.getItem(tokenKey)),
    [busy, setBusy] = useState(false);
  const [persistence, setPersistence] = useState("Browser demo data"),
    [matches, setMatches] = useState<JobMatches>([]),
    [error, setError] = useState("");
  const persistLocal = useCallback((data: SkillPassState) => {
    setState(data);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {}
  }, []);
  const resetSession = useCallback((message = "") => {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(actorKey);
    try {
      localStorage.removeItem(cacheKey);
    } catch {}
    setActor(null);
    setState(seedState());
    setMatches([]);
    setPersistence("Browser demo data");
    setError(message);
    setLoading(false);
  }, []);
  const loadState = useCallback(
    async (token: string) => {
      const response = await fetch("/api/skillpass/state", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Unable to load SkillPass demo data.");
      persistLocal(body.state);
      setPersistence(body.persistence || "Browser demo data");
      setMatches(body.matches || []);
    },
    [persistLocal]
  );
  const refresh = useCallback(async () => {
    const token = sessionStorage.getItem(tokenKey);
    if (!token) {
      resetSession();
      return;
    }
    try {
      await loadState(token);
      setError("");
    } catch (e) {
      resetSession(
        e instanceof Error ? e.message : "Could not refresh demo data."
      );
    } finally {
      setLoading(false);
    }
  }, [loadState, resetSession]);
  useEffect(() => {
    if (sessionStorage.getItem(tokenKey)) void refresh();
    else setLoading(false);
  }, [refresh]);
  const login = useCallback(
    async (role: Role, workerId?: string, employerId?: string) => {
      setBusy(true);
      resetSession();
      try {
        const response = await fetch("/api/skillpass/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, workerId, employerId }),
        });
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Demo login could not be started.");
        await loadState(body.token);
        sessionStorage.setItem(tokenKey, body.token);
        sessionStorage.setItem(actorKey, JSON.stringify(body.actor));
        setActor(body.actor);
        return body.actor as DemoActor;
      } catch (e) {
        const message = e instanceof Error ? e.message : "Demo login failed.";
        resetSession(message);
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [loadState, resetSession]
  );
  const logout = useCallback(() => resetSession(), [resetSession]);
  const dispatch = useCallback(
    async (action: SkillPassAction) => {
      const token = sessionStorage.getItem(tokenKey);
      if (!token)
        throw new Error("Choose a demo role before changing records.");
      setBusy(true);
      setError("");
      let sessionExpired = false;
      try {
        const response = await fetch("/api/skillpass/action", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        });
        const body = await response.json();
        if (!response.ok) {
          sessionExpired = response.status === 401;
          throw new Error(
            body.error || "The requested change could not be saved."
          );
        }
        persistLocal(body.state);
        setPersistence(body.persistence || "Browser demo data");
        setMatches(body.matches || []);
        return body.state as SkillPassState;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "The change could not be saved.";
        if (sessionExpired) resetSession(message);
        else setError(message);
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [persistLocal, resetSession]
  );
  const value = useMemo(
    () => ({
      actor,
      state,
      loading,
      busy,
      persistence,
      matches,
      error,
      login,
      logout,
      dispatch,
      refresh,
      clearError: () => setError(""),
    }),
    [
      actor,
      state,
      loading,
      busy,
      persistence,
      matches,
      error,
      login,
      logout,
      dispatch,
      refresh,
    ]
  );
  return (
    <SkillPassContext.Provider value={value}>
      {children}
    </SkillPassContext.Provider>
  );
}
export function useSkillPass() {
  const value = useContext(SkillPassContext);
  if (!value) throw new Error("SkillPassProvider is missing.");
  return value;
}
