"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSqlEditor, SqlTab } from "../hooks/useSqlEditor";

export type SqlEditorContextType = ReturnType<typeof useSqlEditor>;

const SqlEditorContext = createContext<SqlEditorContextType | undefined>(
  undefined,
);

export function SqlEditorProvider({ children }: { children: ReactNode }) {
  const value = useSqlEditor();
  return (
    <SqlEditorContext.Provider value={value}>
      {children}
    </SqlEditorContext.Provider>
  );
}

export function useSqlEditorContext() {
  const context = useContext(SqlEditorContext);
  if (!context) {
    throw new Error(
      "useSqlEditorContext must be used within a SqlEditorProvider",
    );
  }
  return context;
}
