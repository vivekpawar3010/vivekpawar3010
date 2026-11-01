"use client";

import { useState, useEffect, useRef } from "react";

export default function ProfileEditor() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
        }
      })
      .catch((err) => console.error("Error loading profile", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfileToServer = async (updatedData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/king/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("Failed to save: " + (data.error || "Unknown error"), "error");
      }
    } catch (err) {
      showToast("Network error saving profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/king/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Profile saved and synced to database successfully! 💾", "success");
      } else {
        showToast("Failed to update profile: " + (data.error || ""), "error");
      }
    } catch (err) {
      showToast("Error saving profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Photo Upload Handler ───────────────────────────────────────────────────
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showToast("⚠️ Only image files (JPG, PNG, WebP) are allowed", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const rawDataUrl = uploadEvent.target.result;
        const img = new Image();
        img.onload = () => {
          // Compress via canvas (max 1200px) so base64 strings stay light and fast
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL("image/webp", 0.9) || rawDataUrl;

          const newPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            url: compressedUrl,
            size: `${Math.round(file.size / 1024)} KB`,
            uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          };

          setProfile((prev) => {
            const currentPhotos = Array.isArray(prev.photos) ? prev.photos : [];
            const updatedPhotos = [newPhoto, ...currentPhotos];
            const updated = {
              ...prev,
              photos: updatedPhotos,
              activePhoto: compressedUrl,
              avatarUrl: compressedUrl,
            };
            saveProfileToServer(updated);
            return updated;
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("portfolio_avatar_mode", "custom");
            localStorage.setItem("portfolio_custom_photo", compressedUrl);
            window.dispatchEvent(
              new CustomEvent("portfolio_avatar_changed", {
                detail: { mode: "custom", photoUrl: compressedUrl },
              })
            );
          }
          showToast(`✨ "${file.name}" uploaded and set as active hero portrait!`, "success");
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── Set Photo as Active Portrait ──────────────────────────────────────────
  const handleSetActivePhoto = (photoUrl, photoName = "Photo") => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        activePhoto: photoUrl,
        avatarUrl: photoUrl,
      };
      saveProfileToServer(updated);
      return updated;
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_avatar_mode", "custom");
      localStorage.setItem("portfolio_custom_photo", photoUrl);
      window.dispatchEvent(
        new CustomEvent("portfolio_avatar_changed", {
          detail: { mode: "custom", photoUrl },
        })
      );
    }
    showToast(`🌟 "${photoName}" is now the active hero portrait!`, "success");
  };

  // ── Delete Single Uploaded Photo ──────────────────────────────────────────
  const handleDeletePhoto = (photoId, photoName) => {
    setProfile((prev) => {
      const currentPhotos = Array.isArray(prev.photos) ? prev.photos : [];
      const updatedPhotos = currentPhotos.filter((p) => p.id !== photoId);
      const targetPhoto = currentPhotos.find((p) => p.id === photoId);

      let nextActive = prev.activePhoto;
      if (targetPhoto && prev.activePhoto === targetPhoto.url) {
        nextActive = updatedPhotos.length > 0 ? updatedPhotos[0].url : "/images/vivek-portrait-cutout.png";
        if (typeof window !== "undefined") {
          localStorage.setItem("portfolio_custom_photo", nextActive);
          window.dispatchEvent(
            new CustomEvent("portfolio_avatar_changed", {
              detail: { mode: updatedPhotos.length > 0 ? "custom" : "real", photoUrl: nextActive },
            })
          );
        }
      }

      const updated = {
        ...prev,
        photos: updatedPhotos,
        activePhoto: nextActive,
        avatarUrl: nextActive,
      };
      saveProfileToServer(updated);
      return updated;
    });
    showToast(`🗑️ "${photoName || "Photo"}" removed from gallery.`, "info");
  };

  // ── Remove All Uploaded Photos ────────────────────────────────────────────
  const handleRemoveAllPhotos = () => {
    if (
      !confirm(
        "Are you sure you want to remove ALL uploaded photos? The website hero portrait will revert to the default cutout portrait."
      )
    ) {
      return;
    }
    const defaultCutout = "/images/vivek-portrait-cutout.png";
    setProfile((prev) => {
      const updated = {
        ...prev,
        photos: [],
        activePhoto: defaultCutout,
        avatarUrl: defaultCutout,
      };
      saveProfileToServer(updated);
      return updated;
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_avatar_mode", "real");
      localStorage.setItem("portfolio_custom_photo", defaultCutout);
      window.dispatchEvent(
        new CustomEvent("portfolio_avatar_changed", {
          detail: { mode: "real", photoUrl: defaultCutout },
        })
      );
    }
    showToast("🗑️ All uploaded photos removed. Reverted to default real portrait.", "info");
  };

  // ── Preset Selection Handler ──────────────────────────────────────────────
  const handleSelectPreset = (mode, url, label) => {
    setProfile((prev) => {
      const updated = {
        ...prev,
        avatarUrl: url,
        activePhoto: url,
      };
      saveProfileToServer(updated);
      return updated;
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_avatar_mode", mode);
      localStorage.setItem("portfolio_custom_photo", url);
      window.dispatchEvent(
        new CustomEvent("portfolio_avatar_changed", {
          detail: { mode, photoUrl: url },
        })
      );
    }
    showToast(`🎭 Active portrait changed to: ${label}`, "success");
  };

  if (loading) {
    return <div style={{ color: "var(--text-secondary)", padding: "2rem" }}>Loading profile editor...</div>;
  }

  if (!profile) return null;

  const uploadedPhotos = Array.isArray(profile.photos) ? profile.photos : [];
  const currentActiveUrl = profile.activePhoto || profile.avatarUrl || "/images/vivek-portrait-cutout.png";

  return (
    <div>
      {/* ── Toast Notification Banner ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: "0.92rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background:
              toast.type === "success"
                ? "rgba(16, 185, 129, 0.95)"
                : toast.type === "warning"
                ? "rgba(245, 158, 11, 0.95)"
                : toast.type === "info"
                ? "rgba(56, 189, 248, 0.95)"
                : "rgba(244, 63, 94, 0.95)",
            color: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
            animation: "slideInToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Top Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", margin: "0 0 6px", color: "var(--text-primary)" }}>
            👤 Profile & <span className="gradient-text">Hero Content Editor</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Upload photos, set the active hero portrait, manage photo gallery, and edit live bio and contacts.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ fontSize: "0.9rem", padding: "10px 22px" }}
        >
          {saving ? "Saving Changes..." : "Save Profile 💾"}
        </button>
      </div>

      <form onSubmit={handleSave} className="glass-card" style={{ padding: "2rem", display: "grid", gap: "1.8rem" }}>
        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 1: Photo Upload & Hero Portrait Selector
        ════════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            padding: "1.5rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 14,
            display: "grid",
            gap: "1.4rem",
          }}
        >
          {/* Header of Photo Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>📸</span>
                <h3 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 800, color: "var(--text-primary)" }}>
                  Website Hero Portrait & Photo Gallery
                </h3>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                Upload photos to update the hero portrait. Admin can activate ANY photo or remove all.
              </p>
            </div>

            {/* Quick Upload Trigger Button */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-lime"
                style={{
                  fontSize: "0.88rem",
                  padding: "8px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>➕</span> Upload New Photo
              </button>

              {uploadedPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveAllPhotos}
                  style={{
                    background: "rgba(244, 63, 94, 0.12)",
                    border: "1px solid rgba(244, 63, 94, 0.35)",
                    color: "#f43f5e",
                    fontSize: "0.85rem",
                    padding: "8px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                  }}
                  title="Remove all uploaded photos"
                >
                  🗑️ Remove All Photos ({uploadedPhotos.length})
                </button>
              )}
            </div>
          </div>

          {/* Active Portrait Highlight Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.2rem",
              padding: "1rem 1.2rem",
              borderRadius: 12,
              background: "var(--badge-bg)",
              border: "1.5px solid var(--accent-lime)",
              flexWrap: "wrap",
            }}
          >
            {/* Thumbnail Preview */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2.5px solid var(--accent-lime)",
                boxShadow: "0 0 20px var(--shadow-lime)",
                background: "var(--bg-base)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentActiveUrl}
                alt="Active Hero Portrait"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.src = "/images/vivek-portrait-cutout.png";
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background: "var(--accent-lime)",
                    color: "var(--text-on-accent)",
                    letterSpacing: "0.04em",
                  }}
                >
                  ACTIVE HERO PORTRAIT
                </span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  (Showing on 3D Holographic Portrait on live site)
                </span>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {currentActiveUrl.startsWith("data:")
                  ? "Custom Uploaded Photo (Active)"
                  : currentActiveUrl === "/images/rock-lee.png"
                  ? "Rock Lee Anime Avatar"
                  : currentActiveUrl === "/images/vivek-profile-photo.png"
                  ? "Vivek Studio Portrait"
                  : "Vivek Cutout Portrait (Default)"}
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: 2 }}>
                URL / Path: <code style={{ color: "var(--accent-brand)" }}>{currentActiveUrl.slice(0, 60)}...</code>
              </div>
            </div>
          </div>

          {/* ── Built-in Preset Avatar Selectors ── */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
              Default Studio & Anime Presets:
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() =>
                  handleSelectPreset("real", "/images/vivek-portrait-cutout.png", "Vivek Cutout Portrait")
                }
                style={{
                  fontSize: "0.82rem",
                  padding: "7px 14px",
                  borderRadius: 8,
                  border:
                    currentActiveUrl === "/images/vivek-portrait-cutout.png"
                      ? "2px solid var(--accent-lime)"
                      : "1px solid var(--border-subtle)",
                  background:
                    currentActiveUrl === "/images/vivek-portrait-cutout.png"
                      ? "var(--badge-bg)"
                      : "transparent",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>👤</span> Vivek Cutout Portrait
                {currentActiveUrl === "/images/vivek-portrait-cutout.png" && <span>✓</span>}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset("rocklee", "/images/rock-lee.png", "Rock Lee Anime")
                }
                style={{
                  fontSize: "0.82rem",
                  padding: "7px 14px",
                  borderRadius: 8,
                  border:
                    currentActiveUrl === "/images/rock-lee.png"
                      ? "2px solid var(--accent-lime)"
                      : "1px solid var(--border-subtle)",
                  background:
                    currentActiveUrl === "/images/rock-lee.png"
                      ? "var(--badge-bg)"
                      : "transparent",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>🍃</span> Rock Lee Anime
                {currentActiveUrl === "/images/rock-lee.png" && <span>✓</span>}
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset("real", "/images/vivek-profile-photo.png", "Vivek Studio Portrait")
                }
                style={{
                  fontSize: "0.82rem",
                  padding: "7px 14px",
                  borderRadius: 8,
                  border:
                    currentActiveUrl === "/images/vivek-profile-photo.png"
                      ? "2px solid var(--accent-lime)"
                      : "1px solid var(--border-subtle)",
                  background:
                    currentActiveUrl === "/images/vivek-profile-photo.png"
                      ? "var(--badge-bg)"
                      : "transparent",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>💼</span> Vivek Studio Portrait
                {currentActiveUrl === "/images/vivek-profile-photo.png" && <span>✓</span>}
              </button>
            </div>
          </div>

          {/* ── Uploaded Photos Gallery Grid ── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Uploaded Photo Gallery ({uploadedPhotos.length} Photos):
              </label>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Click &quot;Set as Active&quot; on any photo to update the website
              </span>
            </div>

            {uploadedPhotos.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "2.2rem 1.5rem",
                  borderRadius: 12,
                  border: "2px dashed var(--border-subtle)",
                  background: "var(--bg-surface)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-lime)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  No custom photos uploaded yet
                </div>
                <p style={{ margin: "4px 0 12px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Click here or press &quot;Upload New Photo&quot; above to select photos from your device.
                </p>
                <span
                  className="btn-lime"
                  style={{ fontSize: "0.82rem", padding: "6px 14px", display: "inline-block" }}
                >
                  Choose Photo from Device
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                  gap: "1.2rem",
                }}
              >
                {uploadedPhotos.map((photo) => {
                  const isActive = currentActiveUrl === photo.url;
                  return (
                    <div
                      key={photo.id}
                      style={{
                        borderRadius: 12,
                        border: isActive
                          ? "2px solid var(--accent-lime)"
                          : "1px solid var(--border-subtle)",
                        background: "var(--bg-surface)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: isActive ? "0 4px 20px var(--shadow-lime)" : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Photo Thumbnail */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: 180,
                          background: "var(--bg-base)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={photo.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        {isActive && (
                          <div
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              background: "var(--accent-lime)",
                              color: "var(--text-on-accent)",
                              fontSize: 10,
                              fontWeight: 800,
                              padding: "3px 8px",
                              borderRadius: 12,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}
                          >
                            ✓ ACTIVE
                          </div>
                        )}
                      </div>

                      {/* Photo Meta & Actions */}
                      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                        <div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "var(--text-primary)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={photo.name}
                          >
                            {photo.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
                            {photo.size} &bull; {photo.uploadedAt}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                          <button
                            type="button"
                            onClick={() => handleSetActivePhoto(photo.url, photo.name)}
                            disabled={isActive}
                            style={{
                              flex: 1,
                              padding: "6px 8px",
                              borderRadius: 6,
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: isActive ? "default" : "pointer",
                              border: "none",
                              background: isActive
                                ? "var(--badge-bg)"
                                : "var(--accent-lime)",
                              color: isActive ? "var(--accent-lime)" : "var(--text-on-accent)",
                              opacity: isActive ? 0.8 : 1,
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isActive ? "Active Now" : "Set as Active ✨"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id, photo.name)}
                            style={{
                              background: "rgba(244, 63, 94, 0.1)",
                              border: "1px solid rgba(244, 63, 94, 0.3)",
                              color: "#f43f5e",
                              borderRadius: 6,
                              padding: "6px 8px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                            title="Delete this photo"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 2: Name, Role & Headline
        ════════════════════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profile.name || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Professional Role / Title
            </label>
            <input
              type="text"
              name="role"
              value={profile.role || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
            Hero Headline / Tagline
          </label>
          <input
            type="text"
            name="tagline"
            value={profile.tagline || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--input-bg)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              color: "var(--text-primary)",
              fontSize: "0.95rem",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
            About Bio (Portfolio Introduction)
          </label>
          <textarea
            name="about"
            rows={4}
            value={profile.about || ""}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--input-bg)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 3: Status & Location
        ════════════════════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Live Status Badge
            </label>
            <input
              type="text"
              name="status"
              value={profile.status || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={profile.location || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 4: Social & Professional Links
        ════════════════════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              GitHub URL
            </label>
            <input
              type="url"
              name="github"
              value={profile.github || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              LinkedIn URL
            </label>
            <input
              type="url"
              name="linkedin"
              value={profile.linkedin || ""}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        {/* Save CTA */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-lime"
            style={{ padding: "11px 26px", fontSize: "0.95rem" }}
          >
            {saving ? "Saving Changes..." : "Save Profile 💾"}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes slideInToast {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
