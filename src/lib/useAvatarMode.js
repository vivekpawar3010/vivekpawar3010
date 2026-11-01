"use client";

import { useState, useEffect, useCallback } from "react";

export function useAvatarMode(dynamicAvatarUrl) {
  const [avatarMode, setAvatarMode] = useState("real"); // "real" | "rocklee" | "custom"
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");

  useEffect(() => {
    // Read saved preference set by Admin
    const savedMode =
      typeof window !== "undefined"
        ? localStorage.getItem("portfolio_avatar_mode") || "real"
        : "real";
    const savedPhoto =
      typeof window !== "undefined"
        ? localStorage.getItem("portfolio_custom_photo") || ""
        : "";

    setAvatarMode(savedMode);
    if (savedPhoto) setCustomPhotoUrl(savedPhoto);

    // Sync with server profile activePhoto
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile?.activePhoto) {
          setCustomPhotoUrl(data.profile.activePhoto);
          if (savedMode === "custom") {
            setAvatarMode("custom");
          }
        }
      })
      .catch(() => {});

    const handleCustomChange = (e) => {
      if (e.detail?.mode) {
        setAvatarMode(e.detail.mode);
      }
      if (e.detail?.photoUrl !== undefined) {
        setCustomPhotoUrl(e.detail.photoUrl);
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

  const setSpecificMode = useCallback((mode, photoUrl = null) => {
    setAvatarMode(mode);
    if (photoUrl) setCustomPhotoUrl(photoUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_avatar_mode", mode);
      if (photoUrl) localStorage.setItem("portfolio_custom_photo", photoUrl);
      window.dispatchEvent(
        new CustomEvent("portfolio_avatar_changed", { detail: { mode, photoUrl } })
      );
    }
  }, []);

  let currentSrc = "/images/vivek-hologram-portrait.jpg";
  if (avatarMode === "rocklee") {
    currentSrc = "/images/rock-lee.png";
  } else if (avatarMode === "custom" && customPhotoUrl) {
    currentSrc = customPhotoUrl;
  } else if (customPhotoUrl) {
    currentSrc = customPhotoUrl;
  } else if (dynamicAvatarUrl) {
    currentSrc = dynamicAvatarUrl;
  }

  const currentLabel =
    avatarMode === "rocklee"
      ? "Rock Lee (Anime Avatar - Genius of Hard Work)"
      : avatarMode === "custom"
      ? "Vivek Pawar (Custom Selected Photo)"
      : "Vivek Pawar (Real Portrait)";

  const badgeIcon = avatarMode === "rocklee" ? "🍃" : "👤";

  return {
    avatarMode,
    currentSrc,
    customPhotoUrl,
    currentLabel,
    badgeIcon,
    toggleAvatarMode,
    setSpecificMode,
    isReal: avatarMode === "real",
    isRockLee: avatarMode === "rocklee",
    isCustom: avatarMode === "custom",
  };
}
