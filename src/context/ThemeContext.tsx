/**
 * ThemeContext.tsx — Global theme state using the React Context API.
 *
 * WHY Context API?
 * Without Context, passing a "theme" prop from App down through Board →
 * Column → TaskCard → every child is called "prop drilling". If you add
 * a new nested component, you must thread the prop manually through every
 * parent — a maintenance nightmare.
 *
 * Context creates a "global" value that any component in the tree can
 * read directly using useContext(), with no manual prop threading.
 *
 * INTERVIEW TIP: Context is best for LOW-FREQUENCY updates (theme, auth,
 * locale). For HIGH-FREQUENCY data (e.g., real-time updates), prefer
 * local state or a dedicated state manager to avoid mass re-renders.
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

type Theme = 'purple' | 'cyan' | 'rose';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/** Wrap your app with this to provide theme access everywhere */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('purple');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Custom hook to consume the theme — throws if used outside provider */
export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

/** Map theme name to Tailwind gradient classes */
export const themeGradients: Record<Theme, string> = {
  purple: 'from-violet-600 via-purple-600 to-indigo-600',
  cyan:   'from-cyan-500 via-sky-600 to-blue-600',
  rose:   'from-rose-500 via-pink-600 to-fuchsia-600',
};

export const themeAccents: Record<Theme, string> = {
  purple: 'text-violet-400',
  cyan:   'text-cyan-400',
  rose:   'text-rose-400',
};
