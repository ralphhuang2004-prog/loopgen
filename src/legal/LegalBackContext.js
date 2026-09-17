import { createContext, useContext } from "react";
export const LegalBackContext = createContext(null);
export function useLegalBack() { return useContext(LegalBackContext); }
