"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NavigationAction = () => void;

export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  const router = useRouter();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const pendingNavigationRef = useRef<NavigationAction | null>(null);
  const allowNavigationRef = useRef(false);

  const requestNavigation = useCallback(
    (navigate: NavigationAction) => {
      if (!hasUnsavedChanges || allowNavigationRef.current) {
        navigate();
        return;
      }

      pendingNavigationRef.current = navigate;
      setIsLeaveModalOpen(true);
    },
    [hasUnsavedChanges],
  );

  const stayOnPage = useCallback(() => {
    pendingNavigationRef.current = null;
    setIsLeaveModalOpen(false);
  }, []);

  const leavePage = useCallback(() => {
    const navigate = pendingNavigationRef.current;

    pendingNavigationRef.current = null;
    allowNavigationRef.current = true;
    setIsLeaveModalOpen(false);
    navigate?.();

    window.setTimeout(() => {
      allowNavigationRef.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowNavigationRef.current) return;
      event.preventDefault();
      event.returnValue = true;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleLinkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.href === window.location.href) return;

      event.preventDefault();
      event.stopPropagation();

      requestNavigation(() => {
        if (destination.origin === window.location.origin) {
          router.push(`${destination.pathname}${destination.search}${destination.hash}`);
          return;
        }

        window.location.assign(destination.href);
      });
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [hasUnsavedChanges, requestNavigation, router]);

  return {
    isLeaveModalOpen,
    requestNavigation,
    stayOnPage,
    leavePage,
  };
}
