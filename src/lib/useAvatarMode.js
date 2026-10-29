"use client";

import { useState, useEffect, useCallback } from "react";

export function useAvatarMode(dynamicAvatarUrl) {
  const [avatarMode, setAvatarMode] = useState("rocklee"); // "real" | "rocklee"

  useEffect(() => {
    // Read saved preference or default to rocklee
    const saved = typeof window !== "undefined" ? localStorage.getItem("portfolio_avatar_mode") : null;
    if (saved === "real" || saved === "rocklee") {
      setAvatarMode(saved);
    }

    const handleCustomChange = (e) => {
      if (e.detail?.mode && (e.detail.mode === "real" || e.detail.mode === "rocklee")) {
        setAvatarMode(e.detail.mode);
      }
    };

    window.addEventListener("portfolio_avatar_changed", handleCustomChange);
    return () => window.removeEventListener("portfolio_avatar_changed", handleCustomChange);
  }, []);

  const toggleAvatarMode = useCallback(() => {
    const nextMode = avatarMode === "rocklee" ? "real" : "rocklee";
    setAvatarMode(nextMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_avatar_mode", nextMode);
      window.dispatchEvent(
        new CustomEvent("portfolio_avatar_changed", { detail: { mode: nextMode } })
      );
    }
  }, [avatarMode]);

  const setSpecificMode = useCallback((mode) => {
    if (mode === "real" || mode === "rocklee") {
      setAvatarMode(mode);
      if (typeof window !== "undefined") {
        localStorage.setItem("portfolio_avatar_mode", mode);
        window.dispatchEvent(
          new CustomEvent("portfolio_avatar_changed", { detail: { mode } })
        );
      }
    }
  }, []);

  const currentSrc =
    avatarMode === "real"
      ? "/images/vivek-profile-photo.png"
      : dynamicAvatarUrl || "/images/rock-lee.png";

  const currentLabel =
    avatarMode === "real"
      ? "Vivek Pawar (Real Portrait)"
      : "Rock Lee (Anime Avatar - Genius of Hard Work)";

  const badgeIcon = avatarMode === "real" ? "👤" : "🍃";

  return {
    avatarMode,
    currentSrc,
    currentLabel,
    badgeIcon,
    toggleAvatarMode,
    setSpecificMode,
    isReal: avatarMode === "real",
    isRockLee: avatarMode === "rocklee",
  };
}
