import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { ADMIN_EMAILS } from "./admins";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (!ADMIN_EMAILS.includes(cred.user.email || "")) {
        setError("Access denied");
        await signOut(auth);
        return;
      }

      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  };

  // Container style - centers everything
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e9e9e9ff",
    padding: "20px",
  };

  // Card style - white background with subtle shadow
  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center" as const,
  };

  // Title style
  const titleStyle = {
    color: "#2c3e50",
    fontSize: "1.8rem",
    fontWeight: "600",
    margin: 0,
    lineHeight: 1.2,
  };

  // Subtitle style
  const subtitleStyle = {
    marginTop: "8px",
    color: "#7f8c8d",
    fontSize: "0.95rem",
    marginBottom: "32px",
  };

  // Input wrapper for consistent spacing
  const inputWrapperStyle = {
    marginBottom: "16px",
    textAlign: "left" as const,
  };

  // Label style (hidden but accessible)
  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    color: "#34495e",
    fontSize: "0.85rem",
    fontWeight: "500",
  };

  // Input style
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "0.95rem",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box" as const,
  };

  // Button style
  const buttonStyle = {
    width: "100%",
    padding: "14px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: "8px",
  };
  // Error message style
  const errorStyle = {
    color: "#e74c3c",
    fontSize: "0.9rem",
    marginTop: "12px",
    marginBottom: "0",
    padding: "10px",
    backgroundColor: "#fdf3f2",
    borderRadius: "6px",
    textAlign: "center" as const,
  };

  // Footer style
  const footerStyle = {
    marginTop: "24px",
    fontSize: "0.8rem",
    color: "#95a5a6",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "20px",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Deliverance Church Olepolos</h2>
        <p style={subtitleStyle}>Church Management System</p>

        <div style={inputWrapperStyle}>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="admin@church.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3498db";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={inputWrapperStyle}>
          <label htmlFor="password" style={labelStyle}>Password</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3498db";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.boxShadow = "none";
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
          />
        </div>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2980b9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#3498db";
          }}
        >
          Sign In
        </button>

        <div style={footerStyle}>
          <p style={{ margin: 0 }}>
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}