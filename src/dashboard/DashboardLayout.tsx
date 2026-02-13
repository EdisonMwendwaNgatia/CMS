import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Members from "../members/Members";
import Visitors from "../visitors/Visitors";
import Ministries from "../ministries/Ministries";
import MinistryDetails from "../ministries/MinistryDetails";
import Attendance from "../attendance/Attendance";
import Families from "../families/Families";
import MarkAttendance from "../markAttendance/MarkAttendance";
import SundayServiceAttendance from "../markAttendance/SundayServiceAttendance";
import CellGroupAttendance from "../markAttendance/CellGroupAttendance";
import CellGroups from "../markAttendance/CellGroups";
import Reports from "../reports/Reports";
import { auth } from "../firebase/firebase";

export default function DashboardLayout() {
  const [greeting, setGreeting] = useState("");
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Get admin email from auth and extract name
    const userEmail = auth.currentUser?.email || "Admin";
    const name = userEmail.split('@')[0].split('.')[0];
    setAdminName(name.charAt(0).toUpperCase() + name.slice(1));
  }, []);

  const layoutStyle = {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f8fafc",
  };

  const mainContentStyle = {
    flex: 1,
    padding: "2rem",
    overflowY: "auto" as const,
    backgroundColor: "#f8fafc",
  };

  const contentAreaStyle = {
    backgroundColor: "transparent",
    borderRadius: "0",
    padding: "0",
    boxShadow: "none",
    minHeight: "calc(100vh - 120px)",
  };

  // Dashboard Home Component
  const DashboardHome = () => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    
    const tips = [
      {
        icon: "📊",
        title: "Track Attendance",
        description: "Use 'Mark Attendance' to record Sunday services and cell groups attendance.",
        color: "#3498db",
        bgColor: "#ebf5ff",
      },
      {
        icon: "👥",
        title: "Manage Members",
        description: "Keep member profiles updated and track their ministry involvement.",
        color: "#9b59b6",
        bgColor: "#f3e8ff",
      },
      {
        icon: "⛪",
        title: "Organize Ministries",
        description: "Create ministries and assign members to track group participation.",
        color: "#2ecc71",
        bgColor: "#e8f8f0",
      },
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      }, 4000);
      return () => clearInterval(interval);
    }, [tips.length]);

    // Waving hand animation keyframes
    const waveAnimation = `
      @keyframes wave {
        0% { transform: rotate(0deg); }
        10% { transform: rotate(14deg); }
        20% { transform: rotate(-8deg); }
        30% { transform: rotate(14deg); }
        40% { transform: rotate(-4deg); }
        50% { transform: rotate(10deg); }
        60% { transform: rotate(0deg); }
        100% { transform: rotate(0deg); }
      }
    `;

    const containerStyle = {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      minHeight: "calc(100vh - 120px)",
      padding: "2rem",
    };

    const welcomeCardStyle = {
      backgroundColor: "white",
      borderRadius: "32px",
      padding: "3rem 4rem",
      boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
      textAlign: "center" as const,
      maxWidth: "700px",
      width: "100%",
      marginBottom: "3rem",
      border: "1px solid #f0f0f0",
    };

    const greetingStyle = {
      fontSize: "1rem",
      color: "#64748b",
      marginBottom: "0.5rem",
      letterSpacing: "1px",
      textTransform: "uppercase" as const,
    };

    const welcomeRowStyle = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
      marginBottom: "1rem",
    };

    const titleStyle = {
      fontSize: "3rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: 0,
    };

    const waveEmojiStyle = {
      fontSize: "3rem",
      display: "inline-block",
      animation: "wave 2.5s infinite",
      transformOrigin: "70% 70%",
    };

    const subtitleStyle = {
      fontSize: "1.2rem",
      color: "#475569",
      margin: "0.5rem 0 0 0",
      lineHeight: "1.6",
    };

    const churchNameStyle = {
      marginTop: "1.5rem",
      padding: "0.75rem 1.5rem",
      backgroundColor: "#f8fafc",
      borderRadius: "50px",
      display: "inline-block",
      color: "#3498db",
      fontWeight: "500",
      fontSize: "1rem",
      border: "1px solid #e2e8f0",
    };

    const tipsGridStyle = {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "2rem",
      maxWidth: "1000px",
      width: "100%",
    };

    const tipCardStyle = {
      backgroundColor: "white",
      borderRadius: "24px",
      padding: "2rem 1.5rem",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      textAlign: "center" as const,
      transition: "all 0.3s ease",
      border: "1px solid #f0f0f0",
      opacity: 0,
      transform: "translateY(20px)",
      animation: "fadeInUp 0.5s ease forwards",
    };

    const tipIconStyle = (color: string, bgColor: string) => ({
      fontSize: "2.5rem",
      marginBottom: "1.5rem",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "80px",
      height: "80px",
      backgroundColor: bgColor,
      borderRadius: "30px",
      color: color,
    });

    const tipTitleStyle = {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#0f172a",
      margin: "0 0 0.75rem 0",
    };

    const tipDescStyle = {
      fontSize: "0.95rem",
      color: "#64748b",
      lineHeight: "1.6",
      margin: 0,
    };

    // Fade in animation
    const fadeInAnimation = `
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;

    // Calculate animation delays for tips
    const tipDelays = [0.2, 0.4, 0.6];

    return (
      <div style={containerStyle}>
        <style>{waveAnimation}</style>
        <style>{fadeInAnimation}</style>
        
        {/* Welcome Card */}
        <div style={welcomeCardStyle}>
          <div style={greetingStyle}>{greeting}</div>
          <div style={welcomeRowStyle}>
            <h1 style={titleStyle}>Welcome back, {adminName}</h1>
            <span style={waveEmojiStyle}>👋</span>
          </div>
          <p style={subtitleStyle}>
            Ready to manage today's church activities? 
            Use the navigation menu to access different sections.
          </p>
          <div style={churchNameStyle}>
            Deliverance Church Olepolos
          </div>
        </div>

        {/* Three Tips Cards */}
        <div style={tipsGridStyle}>
          {tips.map((tip, index) => (
            <div
              key={index}
              style={{
                ...tipCardStyle,
                animationDelay: `${tipDelays[index]}s`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 30px -10px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.05)";
              }}
              onClick={() => {
                // Navigate to relevant section based on tip
                const paths = ["/dashboard/mark-attendance", "/dashboard/members", "/dashboard/ministries"];
                window.location.href = paths[index];
              }}
            >
              <div style={tipIconStyle(tip.color, tip.bgColor)}>
                {tip.icon}
              </div>
              <h3 style={tipTitleStyle}>{tip.title}</h3>
              <p style={tipDescStyle}>{tip.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Tip of the Day */}
        <div style={{
          marginTop: "3rem",
          padding: "1rem 2rem",
          backgroundColor: "#f1f5f9",
          borderRadius: "50px",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          maxWidth: "600px",
          width: "100%",
          justifyContent: "center",
        }}>
          <span style={{ fontSize: "1.5rem" }}>💡</span>
          <span style={{ color: "#475569", fontSize: "0.95rem" }}>
            <strong>Pro Tip:</strong> {tips[currentTipIndex].description}
          </span>
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: "2rem",
          color: "#94a3b8",
          fontSize: "0.85rem",
        }}>
          Need help? Contact support at support@dc-olepolos.org
        </div>
      </div>
    );
  };

  return (
    <div style={layoutStyle}>
      <Sidebar />

      <main style={mainContentStyle}>
        <div style={contentAreaStyle}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="members" element={<Members />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="ministries" element={<Ministries />} />
            <Route path="ministries/:ministryId" element={<MinistryDetails />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="families" element={<Families />} />
            <Route path="mark-attendance" element={<MarkAttendance />} />
            <Route path="mark-attendance/sunday-service" element={<SundayServiceAttendance />} />
            <Route path="mark-attendance/cell-group" element={<CellGroupAttendance />} />
            <Route path="mark-attendance/cell-groups" element={<CellGroups />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}