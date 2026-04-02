"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const validateField = (field, value) => {
    if (!value.trim()) {
      return `${field} is required`;
    }

    if (field === "email" && !emailPattern.test(value)) {
      return "Enter a valid email address";
    }

    if (field === "message" && value.trim().length < 10) {
      return "Message should be at least 10 characters";
    }

    return "";
  };

  const validateAll = () => {
    const nextErrors = {};

    for (const key of ["name", "email", "message"]) {
      const err = validateField(key, form[key]);
      if (err) {
        nextErrors[key] = err;
        // check each line one by one: stop at first missing field to guide user step-by-step.
        break;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChange = (evt) => {
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => {
      const updated = { ...prev, [name]: validateField(name, value) };
      if (!updated[name]) delete updated[name];
      return updated;
    });
  };

  const onSubmit = (evt) => {
    evt.preventDefault();
    setStatus("");

    if (!validateAll()) {
      setStatus("Please fix the highlighted error before submitting.");
      return;
    }

    // Simulated submit flow
    setStatus("Message sent successfully!");
    setForm(initialForm);
    setErrors({});
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
      <h1>Contact Me</h1>
      <p>Fill in each field (check line by line). We validate one field at a time to guide you.</p>

      <form onSubmit={onSubmit} noValidate>
        {[["name", "Name"], ["email", "Email"], ["message", "Message"]].map(([field, label]) => (
          <div key={field} style={{ marginBottom: "1rem" }}>
            <label htmlFor={field} style={{ display: "block", fontWeight: 600 }}>
              {label}
            </label>
            {field !== "message" ? (
              <input
                type={field === "email" ? "email" : "text"}
                id={field}
                name={field}
                value={form[field]}
                onChange={onChange}
                onBlur={(e) => {
                  const error = validateField(field, e.target.value);
                  setErrors((prev) => {
                    const next = { ...prev };
                    if (error) next[field] = error;
                    else delete next[field];
                    return next;
                  });
                }}
                style={{ width: "100%", padding: "0.5rem", borderColor: errors[field] ? "red" : "#ccc" }}
              />
            ) : (
              <textarea
                id={field}
                name={field}
                value={form[field]}
                onChange={onChange}
                onBlur={(e) => {
                  const error = validateField(field, e.target.value);
                  setErrors((prev) => {
                    const next = { ...prev };
                    if (error) next[field] = error;
                    else delete next[field];
                    return next;
                  });
                }}
                rows={6}
                style={{ width: "100%", padding: "0.5rem", borderColor: errors[field] ? "red" : "#ccc" }}
              />
            )}
            {errors[field] && <p style={{ color: "red", margin: "0.35rem 0 0" }}>{errors[field]}</p>}
          </div>
        ))}

        <button type="submit" style={{ padding: "0.75rem 1.2rem", fontSize: "1rem" }}>
          Send Message
        </button>
      </form>

      {status && <p style={{ marginTop: "1rem", color: status.includes("success") ? "green" : "darkred" }}>{status}</p>}
    </main>
  );
}

