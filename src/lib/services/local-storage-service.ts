export const storage = {
  getItem: (key: string): string | null => {
    // Check if window is defined (i.e., we're on the client)
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(key);
  },

  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') {
      console.warn(`Tried to set localStorage key "${key}" on the server.`);
      return;
    }
    window.localStorage.setItem(key, value);
  },
};
