import React, { useState } from "react";

function App() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [interests, setInterests] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const getPlan = async () => {
    if (!destination || !days) {
      alert("Please enter destination and days");
      return;
    }

    setLoading(true);
    setPlan("");

    try {
      const response = await fetch("http://localhost:5000/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, interests }),
      });

      const data = await response.json();
      if (data.plan) {
        // remove * characters (stars)
        const cleanText = data.plan.replace(/\*/g, "");
        setPlan(cleanText);
      } else {
        setPlan("Error: " + data.error);
      }
    } catch (err) {
      setPlan("Something went wrong.");
    }

    setLoading(false);
  };

  // Format AI response into structured HTML
  const formatPlan = (text) => {
    const parts = text.split(/Day\s*\d+/i);
    if (parts.length > 1) {
      return text.split(/(Day\s*\d+)/i).map((line, i) => {
        if (/Day\s*\d+/i.test(line)) {
          return (
            <h2 key={i} style={{ color: "#007bff", marginTop: "20px" }}>
              {line}
            </h2>
          );
        }
        return (
          <p key={i} style={{ margin: "8px 0", lineHeight: "1.6" }}>
            {line}
          </p>
        );
      });
    }

    // fallback: split by lines
    return text.split("\n").map((line, i) => (
      <p key={i} style={{ margin: "8px 0", lineHeight: "1.6" }}>
        {line}
      </p>
    ));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🌍 Wanderzz</h1>

      <input
        style={styles.input}
        type="text"
        placeholder="Enter destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      <input
        style={styles.input}
        type="number"
        placeholder="Enter number of days"
        value={days}
        onChange={(e) => setDays(e.target.value)}
      />

      <input
        style={styles.input}
        type="text"
        placeholder="Enter interests (optional)"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
      />

      <button style={styles.button} onClick={getPlan} disabled={loading}>
        {loading ? "Planning..." : "✨ Get Travel Plan"}
      </button>

      <div style={styles.result}>
        {plan && <div style={styles.card}>{formatPlan(plan)}</div>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    textAlign: "center",
    fontFamily: "Segoe UI, sans-serif",
    padding: "20px",
  },
  heading: { marginBottom: "20px", color: "#222", fontSize: "28px" },
  input: {
    width: "80%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "12px 24px",
    background: "linear-gradient(90deg,#007bff,#00c6ff)",
    color: "white",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "16px",
  },
  result: { marginTop: "30px", textAlign: "left" },
  card: {
    background: "#fdfdfd",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    whiteSpace: "pre-wrap",
  },
};

export default App;
