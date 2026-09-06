"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

interface HeaderContentValue {
  left: ReactNode | null
  right: ReactNode | null
}

interface HeaderContentDispatch {
  setLeft: (node: ReactNode | null) => void
  setRight: (node: ReactNode | null) => void
}

const HeaderContentContext = createContext<HeaderContentValue | null>(null)
const HeaderContentDispatchContext = createContext<HeaderContentDispatch | null>(null)

export function HeaderContentProvider({ children }: { children: ReactNode }) {
  const [left, setLeft] = useState<ReactNode | null>(null)
  const [right, setRight] = useState<ReactNode | null>(null)

  const dispatch = useMemo(() => ({ setLeft, setRight }), [])
  const value = useMemo(() => ({ left, right }), [left, right])

  return (
    <HeaderContentDispatchContext.Provider value={dispatch}>
      <HeaderContentContext.Provider value={value}>
        {children}
      </HeaderContentContext.Provider>
    </HeaderContentDispatchContext.Provider>
  )
}


export function useHeaderContentValue() {
  const ctx = useContext(HeaderContentContext)
  if (!ctx) {
    throw new Error("useHeaderContentValue must be used within a HeaderContentProvider")
  }
  return ctx
}

function useHeaderContentDispatch() {
  const ctx = useContext(HeaderContentDispatchContext)
  if (!ctx) {
    throw new Error("useHeaderContentDispatch must be used within a HeaderContentProvider")
  }
  return ctx
}

export function useHeaderContent(left: ReactNode | null, right?: ReactNode | null) {
  const { setLeft, setRight } = useHeaderContentDispatch()

  useEffect(() => {
    setLeft(left)
    return () => setLeft(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  useEffect(() => {
    setRight(right ?? null)
    return () => setRight(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [right])
}