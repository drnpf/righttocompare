import { useState, useEffect } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Firebase Connection Test Component
 *
 * Usage: Add this to any page to test Firebase connection
 * Example: Add to App.tsx temporarily: <FirebaseConnectionTest />
 */
export default function FirebaseConnectionTest() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking");
  const [details, setDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    try {
      // Test 1: Check if auth object exists
      if (!auth) {
        throw new Error("Auth object not initialized");
      }

      // Test 2: Check Firebase app config
      const appConfig = auth.app.options;

      // Test 3: Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("🔥 Firebase Auth State:", user ? "Logged In" : "Not Logged In");

        // Updates current details when event triggers listener
        setDetails({
          projectId: appConfig.projectId,
          authDomain: appConfig.authDomain,
          currentUserUID: user ? user.uid : "None",
          currentUserEmail: user ? user.email : "None",
          appName: auth.app.name,
          timestamp: new Date().toISOString(),
        });
        setStatus("connected");
      });

      // Cleanup
      return () => unsubscribe();
    } catch (error: any) {
      console.error("❌ Firebase Connection Error:", error);
      setDetails({ error: error.message });
      setStatus("error");
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: status === "connected" ? "#10b981" : status === "error" ? "#ef4444" : "#f59e0b",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        zIndex: 9999,
        maxWidth: "300px",
        fontSize: "12px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
        {status === "checking" && "🔄 Checking Firebase..."}
        {status === "connected" && "✅ Firebase Connected"}
        {status === "error" && "❌ Firebase Error"}
      </div>

      <div style={{ fontSize: "11px", opacity: 0.9 }}>
        {Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
      </div>

      {status === "connected" && (
        <div style={{ marginTop: "8px", fontSize: "10px", opacity: 0.8 }}>Check console for detailed logs</div>
      )}
    </div>
  );
}
