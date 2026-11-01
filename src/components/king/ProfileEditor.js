"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Trash2,
  Check,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Save,
  User,
  FileText,
  Globe,
  Award,
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";

export default function ProfileEditor() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: "success" | "error" | "info" }
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch("/api/king/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
        }
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        showToast("Failed to load profile data", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      education: { ...prev.education, [name]: value },
    }));
  };

  const handleThemeBackgroundChange = (themeKey, value) => {
    setProfile((prev) => ({
      ...prev,
      themeBackgrounds: {
        ...(prev.themeBackgrounds || {}),
        [themeKey]: value,
      },
    }));
  };

  const saveProfileToServer = async (payloadToSave) => {
    setSaving(true);
    try {
      const res = await fetch("/api/king/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSave),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Profile saved and synced successfully!", "success");
      } else {
        showToast("Failed to update profile: " + (data.error || ""), "error");
      }
    } catch {
      showToast("Error saving profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveProfileToServer(profile);
  };

  // ── Photo Upload Handler ───────────────────────────────────────────────────
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showToast("Only image files (JPG, PNG, WebP) are allowed", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const rawDataUrl = uploadEvent.target.result;
        const img = new Image();
        img.onload = () => {
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

          showToast(`Photo "${file.name}" uploaded and set as active hero portrait!`, "success");
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
    showToast(`Active portrait updated to: ${photoName}`, "success");
  };

  // ── Delete Individual Uploaded Photo ──────────────────────────────────────
  const handleDeletePhoto = (photoId, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to remove this photo?")) return;

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
    showToast("Photo removed from gallery.", "info");
  };

  // ── Remove All Uploaded Photos ────────────────────────────────────────────
  const handleRemoveAllPhotos = () => {
    if (!confirm("Delete ALL uploaded photos and revert to default real portrait?")) return;

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
    showToast("All uploaded photos removed. Reverted to default real portrait.", "info");
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
    showToast(`Active portrait changed to: ${label}`, "success");
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
        <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 10px" }} />
        Loading profile configurations...
      </div>
    );
  }

  if (!profile) return null;

  const uploadedPhotos = Array.isArray(profile.photos) ? profile.photos : [];
  const currentActiveUrl = profile.activePhoto || profile.avatarUrl || "/images/vivek-portrait-cutout.png";

  const themeBgs = profile.themeBackgrounds || {
    dark: "/images/bg-theme-1.jpg",
    warmAmber: "/images/bg-theme-2.jpg",
    electricCyan: "/images/bg-theme-3.jpg",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 10,
            background:
              toast.type === "success"
                ? "rgba(16, 185, 129, 0.95)"
                : toast.type === "error"
                ? "rgba(244, 63, 94, 0.95)"
                : "rgba(56, 189, 248, 0.95)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.9rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="section-tag">Hero & Persona</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
            Profile & Hero Content <span className="lime-underline">Editor</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.95rem" }}>
            Configure your active portraits, uploaded photo gallery, theme backgrounds, bio, and career credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="btn-lime"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px" }}
        >
          <Save size={16} />
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: Photo & Hero Avatar Management
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16, marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ImageIcon size={18} style={{ color: "var(--accent-brand)" }} />
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Hero Portrait & Custom Photo Gallery
              </h3>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              Upload any photo from your device. You can set ANY photo as the active portrait across the site or remove all.
            </p>
          </div>

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
              style={{ fontSize: "0.88rem", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Upload size={14} /> Upload New Photo
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
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Trash2 size={14} /> Remove All ({uploadedPhotos.length})
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
            padding: "1rem 1.4rem",
            borderRadius: 12,
            background: "var(--badge-bg)",
            border: "1.5px solid var(--accent-brand)",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2.5px solid var(--accent-brand)",
              boxShadow: "0 0 20px rgba(234, 88, 12, 0.3)",
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

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 9999,
                  background: "var(--accent-brand)",
                  color: "var(--text-on-accent)",
                  letterSpacing: "0.04em",
                }}
              >
                ACTIVE HERO PORTRAIT
              </span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                (Shown inside 3D Holographic Showcase on live site)
              </span>
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {currentActiveUrl.startsWith("data:")
                ? "Custom Uploaded Photo (Active)"
                : currentActiveUrl === "/images/vivek-hologram-portrait.jpg"
                ? "Vivek AI Portrait (Tech Hoodie & Cyan/Purple Rim Light)"
                : currentActiveUrl === "/images/vivek-suit-portrait.jpg"
                ? "Vivek Suit Portrait (Clean Navy Suit)"
                : currentActiveUrl === "/images/rock-lee.png"
                ? "Rock Lee Anime Avatar"
                : "Vivek Standard Portrait"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
              Active Path: <code style={{ color: "var(--accent-brand)" }}>{currentActiveUrl.slice(0, 75)}...</code>
            </div>
          </div>
        </div>

        {/* Presets Row */}
        <div style={{ marginBottom: "1.6rem" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            Quick Select Preset Portraits:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              type="button"
              onClick={() => handleSelectPreset("custom", "/images/vivek-hologram-portrait.jpg", "AI Tech Portrait")}
              style={{
                fontSize: "0.84rem",
                padding: "8px 14px",
                borderRadius: 8,
                border: currentActiveUrl === "/images/vivek-hologram-portrait.jpg" ? "2px solid var(--accent-brand)" : "1px solid var(--border-subtle)",
                background: currentActiveUrl === "/images/vivek-hologram-portrait.jpg" ? "var(--badge-bg)" : "var(--bg-surface)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={14} style={{ color: "var(--accent-brand)" }} /> Vivek AI Portrait (Dark Hoodie)
              {currentActiveUrl === "/images/vivek-hologram-portrait.jpg" && <Check size={14} style={{ color: "var(--accent-brand)" }} />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset("custom", "/images/vivek-suit-portrait.jpg", "Suit Portrait")}
              style={{
                fontSize: "0.84rem",
                padding: "8px 14px",
                borderRadius: 8,
                border: currentActiveUrl === "/images/vivek-suit-portrait.jpg" ? "2px solid var(--accent-brand)" : "1px solid var(--border-subtle)",
                background: currentActiveUrl === "/images/vivek-suit-portrait.jpg" ? "var(--badge-bg)" : "var(--bg-surface)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <User size={14} style={{ color: "var(--accent-secondary)" }} /> Vivek Navy Suit Portrait
              {currentActiveUrl === "/images/vivek-suit-portrait.jpg" && <Check size={14} style={{ color: "var(--accent-brand)" }} />}
            </button>

            <button
              type="button"
              onClick={() => handleSelectPreset("rocklee", "/images/rock-lee.png", "Rock Lee Anime")}
              style={{
                fontSize: "0.84rem",
                padding: "8px 14px",
                borderRadius: 8,
                border: currentActiveUrl === "/images/rock-lee.png" ? "2px solid var(--accent-brand)" : "1px solid var(--border-subtle)",
                background: currentActiveUrl === "/images/rock-lee.png" ? "var(--badge-bg)" : "var(--bg-surface)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>🍃</span> Rock Lee Anime
              {currentActiveUrl === "/images/rock-lee.png" && <Check size={14} style={{ color: "var(--accent-brand)" }} />}
            </button>
          </div>
        </div>

        {/* Uploaded Photos Gallery */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Uploaded Photo Gallery ({uploadedPhotos.length} Photos):
            </label>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Click &quot;Set as Active&quot; on any photo to show it on the website
            </span>
          </div>

          {uploadedPhotos.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "2rem 1.5rem",
                borderRadius: 12,
                border: "2px dashed var(--border-subtle)",
                background: "var(--bg-surface)",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <Upload size={32} style={{ color: "var(--accent-brand)", margin: "0 auto 8px" }} />
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                No custom photos uploaded yet
              </div>
              <p style={{ margin: "4px 0 10px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Click here or press &quot;Upload New Photo&quot; to pick images from your device.
              </p>
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
                      border: isActive ? "2px solid var(--accent-brand)" : "1px solid var(--border-subtle)",
                      background: "var(--bg-surface)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: isActive ? "0 4px 20px rgba(234, 88, 12, 0.25)" : "none",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: 180, background: "var(--bg-base)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {isActive && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: "var(--accent-brand)",
                            color: "var(--text-on-accent)",
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          ACTIVE
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {photo.name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 10 }}>
                        {photo.size} • {photo.uploadedAt}
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
                            background: isActive ? "var(--badge-bg)" : "var(--accent-brand)",
                            color: isActive ? "var(--accent-brand)" : "var(--text-on-accent)",
                            border: isActive ? "1px solid var(--accent-brand)" : "none",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: isActive ? "default" : "pointer",
                          }}
                        >
                          {isActive ? "Active ✓" : "Set as Active"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePhoto(photo.id, e)}
                          title="Delete photo"
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            background: "rgba(244, 63, 94, 0.12)",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            color: "#f43f5e",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={13} />
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
          SECTION 2: Theme Backgrounds for 3D Jupiter Hover
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="glass-card" style={{ padding: "1.8rem", borderRadius: 16, marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Sparkles size={18} style={{ color: "var(--accent-brand)" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Theme-Aware Background Portraits (3D Jupiter Hover)
          </h3>
        </div>
        <p style={{ margin: "0 0 1.2rem", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
          When visitors hover over the 3D Jupiter model on the Home page, the background transitions to these custom AI portraits based on the active website theme.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.2rem" }}>
          {/* Theme 1: Dark / Cyberpunk */}
          <div style={{ padding: "1rem", borderRadius: 12, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#a855f7" }} />
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Theme 1: Dark / Space Cyberpunk
              </span>
            </div>
            <div style={{ height: 120, borderRadius: 8, overflow: "hidden", marginBottom: 8, background: "#05080f" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={themeBgs.dark}
                alt="Theme 1 Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              Asset Path / URL:
            </label>
            <input
              type="text"
              value={themeBgs.dark || ""}
              onChange={(e) => handleThemeBackgroundChange("dark", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: "0.82rem",
              }}
            />
          </div>

          {/* Theme 2: Warm Amber / Cosmic */}
          <div style={{ padding: "1rem", borderRadius: 12, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ea580c" }} />
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Theme 2: Warm Amber & Cosmic Dust
              </span>
            </div>
            <div style={{ height: 120, borderRadius: 8, overflow: "hidden", marginBottom: 8, background: "#1a0b02" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={themeBgs.warmAmber}
                alt="Theme 2 Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              Asset Path / URL:
            </label>
            <input
              type="text"
              value={themeBgs.warmAmber || ""}
              onChange={(e) => handleThemeBackgroundChange("warmAmber", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: "0.82rem",
              }}
            />
          </div>

          {/* Theme 3: Clean Neo-Futuristic / Frost */}
          <div style={{ padding: "1rem", borderRadius: 12, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#0284c7" }} />
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Theme 3: Frost & Neo-Futuristic Studio
              </span>
            </div>
            <div style={{ height: 120, borderRadius: 8, overflow: "hidden", marginBottom: 8, background: "#f8fafc" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={themeBgs.electricCyan}
                alt="Theme 3 Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              Asset Path / URL:
            </label>
            <input
              type="text"
              value={themeBgs.electricCyan || ""}
              onChange={(e) => handleThemeBackgroundChange("electricCyan", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 6,
                color: "var(--text-primary)",
                fontSize: "0.82rem",
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: General Profile, Bio & Resume Details
      ════════════════════════════════════════════════════════════════════════ */}
      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: "2rem", borderRadius: 16, display: "grid", gap: "1.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <User size={18} style={{ color: "var(--accent-brand)" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Core Profile & Career Metadata
          </h3>
        </div>

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
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Role / Professional Title
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
                border: "1px solid var(--border-subtle)",
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
              border: "1px solid var(--border-subtle)",
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
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Resume URL & Academic Credentials */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Resume URL (Google Drive / Direct PDF)
            </label>
            <input
              type="url"
              name="resumeUrl"
              value={profile.resumeUrl || ""}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              CGPA Score
            </label>
            <input
              type="text"
              name="cgpa"
              value={profile.cgpa || "9.21 / 10"}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Final Sem SGPA
            </label>
            <input
              type="text"
              name="finalSemSgpa"
              value={profile.finalSemSgpa || "10.00 / 10"}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        {/* Education & Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Institution
            </label>
            <input
              type="text"
              name="institution"
              value={profile.education?.institution || ""}
              onChange={handleEducationChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              Degree
            </label>
            <input
              type="text"
              name="degree"
              value={profile.education?.degree || ""}
              onChange={handleEducationChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--input-bg)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        {/* Social Links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
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
                border: "1px solid var(--border-subtle)",
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
                border: "1px solid var(--border-subtle)",
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
                border: "1px solid var(--border-subtle)",
                borderRadius: 8,
                color: "var(--text-primary)",
                fontSize: "0.95rem",
              }}
            />
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-lime"
            style={{ padding: "11px 26px", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Save size={16} />
            {saving ? "Saving Changes..." : "Save Profile & Content"}
          </button>
        </div>
      </form>
    </div>
  );
}
