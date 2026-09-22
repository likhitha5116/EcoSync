import { useEffect, useState } from "react";
import "./App.css";

const pickupLabelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#205f43",
  fontSize: "14px",
  fontWeight: 700,
};

const pickupInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: "50px",
  padding: "12px 14px",
  border: "1px solid #cdded5",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#263d33",
  fontSize: "15px",
  outline: "none",
};

const priceCardStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  padding: "14px 16px",
  borderRadius: "12px",
  background: "#ffffff",
  border: "1px solid #d5e8dc",
};
const API = "http://localhost:5000/api";

function App() {
  const [activePage, setActivePage] = useState("home");
  const [showWasteForm, setShowWasteForm] = useState(false);
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [matches, setMatches] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [collectorSearch, setCollectorSearch] = useState("");
  const [collectorFilter, setCollectorFilter] = useState("All");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingPage, setPendingPage] = useState(null);

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [wasteForm, setWasteForm] = useState({
    companyName: "",
    industryType: "",
    location: "",
    wasteType: "",
    quantity: "",
    unit: "Kg",
    quality: "High",
    availabilityDate: "",
  });

  const [requirementForm, setRequirementForm] = useState({
    companyName: "",
    industryType: "",
    location: "",
    wasteType: "",
    quantity: "",
    unit: "Kg",
    minimumQuality: "Medium",
    requiredDate: "",
  });

  const [pickupForm, setPickupForm] = useState({
    name: "",
    phone: "",
    generatorType: "Sugarcane Juice Shop",
    location: "",
    wasteType: "Sugarcane Bagasse",
    quantity: "",
    unit: "Kg",
    moistureStatus: "Fresh/Wet",
    pricePerUnit: "",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("ecosyncUser");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (error) {
        localStorage.removeItem("ecosyncUser");
      }
    }
  }, []);

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const requireLogin = (page) => {
    if (!isLoggedIn) {
      setPendingPage(page);
      openAuth("login");
      return;
    }

    setActivePage(page);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (authForm.password !== authForm.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Registration creates the account, but does NOT log the user in.
      // The user must login explicitly after registration.
      setAuthMode("login");
      setAuthForm({
        name: "",
        email: authForm.email,
        password: "",
        confirmPassword: "",
      });

      alert("Registration successful! Please login to continue.");
    } catch (error) {
      alert(error.message);
      console.error("Registration error:", error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("ecosyncUser", JSON.stringify(data.user));
      setCurrentUser(data.user);
      setIsLoggedIn(true);
      setShowAuthModal(false);

      const pageAfterLogin = pendingPage;
      setPendingPage(null);

      setAuthForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      if (pageAfterLogin) {
        setActivePage(pageAfterLogin);
      }

      alert(`Login successful! Welcome ${data.user.name}.`);
    } catch (error) {
      alert(error.message);
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ecosyncUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
    setPendingPage(null);
    setShowWasteForm(false);
    setShowRequirementForm(false);
    setShowPickupForm(false);
    setActivePage("home");
    alert("You have been logged out.");
  };

  const loadMatches = async () => {
    if (!isLoggedIn) return;

    try {
      const response = await fetch(`${API}/matches`);
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  };

  const loadPickupRequests = async () => {
    try {
      const response = await fetch(`${API}/waste-generators`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load pickup requests");
      }

      setPickupRequests(data);
    } catch (error) {
      console.error("Failed to load pickup requests:", error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    if (activePage === "matches") {
      loadMatches();
    }

    if (activePage === "collector") {
      loadPickupRequests();
    }
  }, [activePage]);

  const handleWasteSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setShowWasteForm(false);
      openAuth("login");
      return;
    }

    try {
      const response = await fetch(`${API}/factories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...wasteForm,
          quantity: Number(wasteForm.quantity),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post waste");
      }

      alert("Waste posted successfully!");

      setShowWasteForm(false);

      setWasteForm({
        companyName: "",
        industryType: "",
        location: "",
        wasteType: "",
        quantity: "",
        unit: "Kg",
        quality: "High",
        availabilityDate: "",
      });

      loadMatches();
    } catch (error) {
      alert("Failed to post waste. Please check backend.");
      console.error(error);
    }
  };

  const handleRequirementSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setShowRequirementForm(false);
      openAuth("login");
      return;
    }

    try {
      const response = await fetch(`${API}/requirements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...requirementForm,
          quantity: Number(requirementForm.quantity),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post requirement");
      }

      alert("Requirement posted successfully!");

      setShowRequirementForm(false);

      setRequirementForm({
        companyName: "",
        industryType: "",
        location: "",
        wasteType: "",
        quantity: "",
        unit: "Kg",
        minimumQuality: "Medium",
        requiredDate: "",
      });

      loadMatches();
    } catch (error) {
      alert("Failed to post requirement. Please check backend.");
      console.error(error);
    }
  };


  const handlePickupSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setShowPickupForm(false);
      openAuth("login");
      return;
    }

    try {
      const response = await fetch(`${API}/waste-generators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pickupForm,
          quantity: Number(pickupForm.quantity),
          pricePerUnit: Number(pickupForm.pricePerUnit),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create pickup request");
      }

      alert("Pickup request submitted successfully!");
      setShowPickupForm(false);
      setPickupForm({
        name: "",
        phone: "",
        generatorType: "Sugarcane Juice Shop",
        location: "",
        wasteType: "Sugarcane Bagasse",
        quantity: "",
        unit: "Kg",
        moistureStatus: "Fresh/Wet",
        pricePerUnit: "",
      });
    } catch (error) {
      alert(error.message);
      console.error("Pickup request error:", error);
    }
  };

  const updatePickupStatus = async (id, status) => {
    try {
      const response = await fetch(`${API}/waste-generators/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setPickupRequests((previous) =>
        previous.map((request) =>
          request._id === id ? data : request
        )
      );

      alert(`Pickup status updated to ${status}`);
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  const handleDemoPayment = async (id) => {
    const confirmPayment = window.confirm(
      "This is a DEMO payment. No real money will be transferred. Continue?"
    );

    if (!confirmPayment) return;

    try {
      const response = await fetch(`${API}/waste-generators/${id}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Demo payment failed");
      }

      setPickupRequests((previous) =>
        previous.map((request) =>
          request._id === id ? data : request
        )
      );

      alert(
        `Demo payment successful!\nTransaction ID: ${data.transactionId}\nShop receives: ₹${Number(data.generatorEarnings || 0).toFixed(2)}`
      );
    } catch (error) {
      alert(error.message);
      console.error("Payment error:", error);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">EcoSync</div>

        <div className="nav-links">
          <button onClick={() => setActivePage("home")}>Home</button>

          <button onClick={() => requireLogin("waste")}>Waste</button>

          <button onClick={() => requireLogin("requirements")}>
            Requirements
          </button>

          <button onClick={() => requireLogin("matches")}>
            AI Matches
          </button>

          {isLoggedIn && (
            <button onClick={() => setActivePage("collector")}>
              Collector Dashboard
            </button>
          )}

          {isLoggedIn ? (
            <button className="login-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="login-btn" onClick={() => openAuth("login")}>
              Login
            </button>
          )}
        </div>
      </nav>

      {activePage === "home" && (
        <main>
          <section className="hero">
            <div className="hero-content">
              <p className="tagline">AI-POWERED INDUSTRIAL WASTE EXCHANGE</p>

              <h1>Turn Industrial Waste Into Valuable Resources</h1>

              <p>
                EcoSync connects industries that have waste with industries
                that can reuse it through intelligent resource matching.
              </p>

              <div className="hero-buttons">
                <button
                  className="primary-btn"
                  onClick={() => {
                    if (!isLoggedIn) {
                      openAuth("login");
                      return;
                    }
                    setShowWasteForm(true);
                  }}
                >
                  Post Waste
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => {
                    if (!isLoggedIn) {
                      openAuth("login");
                      return;
                    }
                    setShowRequirementForm(true);
                  }}
                >
                  Find a Match
                </button>
              </div>
            </div>
          </section>

          <section className="features">
            <div className="feature-card">
              <h3>♻️ Waste Exchange</h3>
              <p>
                Industries can post their available waste and by-products.
              </p>
            </div>

            <div className="feature-card">
              <h3>🤖 AI Matching</h3>
              <p>
                Our matching engine identifies suitable industries for reuse.
              </p>
            </div>

            <div className="feature-card">
              <h3>🌱 Circular Economy</h3>
              <p>
                Convert industrial waste into useful resources and reduce
                environmental impact.
              </p>
            </div>
          </section>

          <section className="pickup-section">
            <div className="pickup-content">
              <h2>🧃 Have Sugarcane Bagasse?</h2>
              <p>
                Sugarcane juice shops can submit a pickup request and receive
                an agreed payment for reusable bagasse.
              </p>
              <button
                className="primary-btn"
                onClick={() => {
                  if (!isLoggedIn) {
                    openAuth("login");
                    return;
                  }
                  setShowPickupForm(true);
                }}
              >
                Request Bagasse Pickup
              </button>
            </div>
          </section>
        </main>
      )}

      {activePage === "waste" && (
        <main className="page-section">
          <h1>Available Industrial Waste</h1>

          <p>
            Post your industrial waste so other industries can discover it.
          </p>

          <button
            className="primary-btn"
            onClick={() => {
              if (!isLoggedIn) {
                openAuth("login");
                return;
              }
              setShowWasteForm(true);
            }}
          >
            + Post Waste
          </button>
        </main>
      )}

      {activePage === "requirements" && (
        <main className="page-section">
          <h1>Waste Requirements</h1>

          <p>
            Tell EcoSync what waste material your industry needs.
          </p>

          <button
            className="primary-btn"
            onClick={() => {
              if (!isLoggedIn) {
                openAuth("login");
                return;
              }
              setShowRequirementForm(true);
            }}
          >
            + Post Requirement
          </button>
        </main>
      )}

      {activePage === "matches" && (
        <main className="page-section">
          <h1>AI Matches</h1>

          <p>
            EcoSync's matching engine finds potential connections between
            available waste and industry requirements.
          </p>

          {matches.length === 0 ? (
            <div className="empty-state">
              <h3>No matches found yet</h3>
              <p>
                Post waste and a requirement to generate AI matches.
              </p>
            </div>
          ) : (
            <div className="matches-container">
              {matches.map((match, index) => (
                <div className="match-card" key={index}>
                  <div className="match-score">
                    {match.matchScore}% MATCH
                  </div>

                  <h2>{match.factory.companyName}</h2>

                  <p>
                    <strong>Waste:</strong>{" "}
                    {match.factory.wasteType}
                  </p>

                  <p>
                    <strong>Available:</strong>{" "}
                    {match.factory.quantity} {match.factory.unit}
                  </p>

                  <p>
                    <strong>Requirement:</strong>{" "}
                    {match.requirement.companyName}
                  </p>

                  <p>
                    <strong>Required:</strong>{" "}
                    {match.requirement.quantity}{" "}
                    {match.requirement.unit}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {match.factory.location}
                  </p>

                  <div className="match-reasons">
                    <strong>Why this match?</strong>

                    <ul>
                      {match.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}


      {activePage === "collector" && (() => {
        const totalRequests = pickupRequests.length;
        const acceptedRequests = pickupRequests.filter(
          (request) => request.pickupStatus === "Accepted"
        ).length;
        const deliveredRequests = pickupRequests.filter(
          (request) => request.pickupStatus === "Delivered"
        ).length;
        const paidRequests = pickupRequests.filter(
          (request) => request.paymentStatus === "Paid"
        ).length;

        const filteredRequests = pickupRequests.filter((request) => {
          const search = collectorSearch.trim().toLowerCase();
          const matchesSearch =
            !search ||
            String(request.name || "").toLowerCase().includes(search) ||
            String(request.location || "").toLowerCase().includes(search) ||
            String(request.phone || "").toLowerCase().includes(search);

          const matchesFilter =
            collectorFilter === "All" ||
            request.pickupStatus === collectorFilter ||
            (collectorFilter === "Paid" && request.paymentStatus === "Paid");

          return matchesSearch && matchesFilter;
        });

        const getStepNumber = (request) => {
          if (request.paymentStatus === "Paid") return 5;
          if (request.pickupStatus === "Delivered") return 4;
          if (request.pickupStatus === "Picked Up") return 3;
          if (request.pickupStatus === "Accepted") return 2;
          return 1;
        };

        const steps = [
          "Pending",
          "Accepted",
          "Picked Up",
          "Delivered",
          "Paid",
        ];

        return (
          <main className="page-section">
            <h1>🚚 Collector Dashboard</h1>
            <p>
              Manage pickup requests, collection fees, delivery status and
              demo payments.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
                margin: "24px 0",
              }}
            >
              <div className="feature-card">
                <h3>📦 Total Requests</h3>
                <h2>{totalRequests}</h2>
              </div>
              <div className="feature-card">
                <h3>🤝 Accepted</h3>
                <h2>{acceptedRequests}</h2>
              </div>
              <div className="feature-card">
                <h3>📍 Delivered</h3>
                <h2>{deliveredRequests}</h2>
              </div>
              <div className="feature-card">
                <h3>💳 Paid</h3>
                <h2>{paidRequests}</h2>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <input
                type="text"
                placeholder="🔍 Search shop, location or phone"
                value={collectorSearch}
                onChange={(e) => setCollectorSearch(e.target.value)}
                style={{ flex: "1 1 260px" }}
              />

              <select
                value={collectorFilter}
                onChange={(e) => setCollectorFilter(e.target.value)}
                style={{ flex: "0 1 180px" }}
              >
                <option>All</option>
                <option>Pending</option>
                <option>Accepted</option>
                <option>Picked Up</option>
                <option>Delivered</option>
                <option>Paid</option>
              </select>

              <button className="primary-btn" onClick={loadPickupRequests}>
                🔄 Refresh
              </button>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <h3>No matching pickup requests</h3>
                <p>Try another search or filter.</p>
              </div>
            ) : (
              <div className="matches-container">
                {filteredRequests.map((request) => {
                  const currentStep = getStepNumber(request);

                  return (
                    <div className="match-card" key={request._id}>
                      <div className="match-score">
                        {request.paymentStatus === "Paid"
                          ? "PAYMENT COMPLETED ✓"
                          : request.pickupStatus}
                      </div>

                      <h2 style={{ marginBottom: "18px" }}>🧃 {request.name}</h2>

                      <div
                        style={{
                          padding: "16px",
                          marginBottom: "14px",
                          borderRadius: "12px",
                          background: "#f8faf8",
                          border: "1px solid #e1e7e1",
                        }}
                      >
                        <h3 style={{ margin: "0 0 12px" }}>👤 Shop Details</h3>
                        <p style={{ margin: "7px 0" }}><strong>Phone:</strong> {request.phone}</p>
                        <p style={{ margin: "7px 0" }}><strong>Generator:</strong> {request.generatorType}</p>
                        <p style={{ margin: "7px 0" }}><strong>Location:</strong> {request.location}</p>
                      </div>

                      <div
                        style={{
                          padding: "16px",
                          marginBottom: "14px",
                          borderRadius: "12px",
                          background: "#f8faf8",
                          border: "1px solid #e1e7e1",
                        }}
                      >
                        <h3 style={{ margin: "0 0 12px" }}>♻️ Waste Details</h3>
                        <p style={{ margin: "7px 0" }}><strong>Waste Type:</strong> {request.wasteType}</p>
                        <p style={{ margin: "7px 0" }}><strong>Quantity:</strong> {request.quantity} {request.unit}</p>
                        <p style={{ margin: "7px 0" }}><strong>Moisture:</strong> {request.moistureStatus}</p>
                      </div>

                      <div
                        style={{
                          margin: "20px 0",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "1px solid #ddd",
                          overflowX: "auto",
                        }}
                      >
                        <strong>Pickup Progress</strong>
                        <div
                          style={{
                            display: "flex",
                            minWidth: "520px",
                            justifyContent: "space-between",
                            gap: "8px",
                            marginTop: "16px",
                          }}
                        >
                          {steps.map((step, index) => {
                            const stepNumber = index + 1;
                            const completed = stepNumber <= currentStep;

                            return (
                              <div
                                key={step}
                                style={{
                                  flex: 1,
                                  textAlign: "center",
                                  fontWeight: completed ? "700" : "400",
                                  opacity: completed ? 1 : 0.45,
                                }}
                              >
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    lineHeight: "32px",
                                    margin: "0 auto 6px",
                                    borderRadius: "50%",
                                    border: "1px solid #888",
                                  }}
                                >
                                  {completed ? "✓" : stepNumber}
                                </div>
                                <small>{step}</small>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <hr />

                      <p>
                        <strong>Price per {request.unit}:</strong> ₹
                        {Number(request.pricePerUnit || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Total Transaction Value:</strong> ₹
                        {Number(request.totalAmount || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Shop Earnings:</strong> ₹
                        {Number(request.generatorEarnings || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Collector Fee:</strong> ₹
                        {Number(request.collectorFee || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>EcoSync Service Fee:</strong> ₹
                        {Number(request.platformFee || 0).toFixed(2)}
                      </p>
                      <p>
                        <strong>Payment Status:</strong> {request.paymentStatus}
                      </p>

                      {request.transactionId && (
                        <div
                          style={{
                            padding: "14px",
                            margin: "14px 0",
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                          }}
                        >
                          <p>
                            <strong>Transaction ID:</strong>{" "}
                            {request.transactionId}
                          </p>
                          <p>
                            <strong>Paid At:</strong>{" "}
                            {new Date(request.paidAt).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          margin: "16px 0",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "1px solid #e1e7e1",
                          background: "#f8faf8",
                        }}
                      >
                        <p style={{ margin: "0 0 8px" }}>
                          <strong>Moisture:</strong> {request.moistureStatus}
                        </p>

                        {request.moistureStatus === "Fresh/Wet" ? (
                          <p style={{ margin: 0 }}>
                            <strong>Processing Note:</strong>
                            <br />
                            This bagasse may require drying before industrial use.
                          </p>
                        ) : request.moistureStatus === "Partially Dry" ? (
                          <p style={{ margin: 0 }}>
                            <strong>Processing Note:</strong>
                            <br />
                            This bagasse may require additional drying before some industrial uses.
                          </p>
                        ) : (
                          <p style={{ margin: 0 }}>
                            <strong>Processing Note:</strong>
                            <br />
                            This bagasse is dry and may be suitable for industrial processing, subject to buyer requirements.
                          </p>
                        )}
                      </div>

                      <div className="collector-actions">
                        {request.pickupStatus === "Pending" && (
                          <button
                            className="primary-btn"
                            onClick={() =>
                              updatePickupStatus(request._id, "Accepted")
                            }
                          >
                            Accept Pickup
                          </button>
                        )}

                        {request.pickupStatus === "Accepted" && (
                          <button
                            className="primary-btn"
                            onClick={() =>
                              updatePickupStatus(request._id, "Picked Up")
                            }
                          >
                            Mark Picked Up
                          </button>
                        )}

                        {request.pickupStatus === "Picked Up" && (
                          <button
                            className="primary-btn"
                            onClick={() =>
                              updatePickupStatus(request._id, "Delivered")
                            }
                          >
                            Mark Delivered
                          </button>
                        )}

                        {request.pickupStatus === "Delivered" &&
                          request.paymentStatus !== "Paid" && (
                            <button
                              className="primary-btn"
                              onClick={() =>
                                handleDemoPayment(request._id)
                              }
                            >
                              💳 Pay ₹
                              {Number(request.totalAmount || 0).toFixed(2)} (Demo)
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        );
      })()}

      {showWasteForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="close-btn"
              onClick={() => setShowWasteForm(false)}
            >
              ×
            </button>

            <h2>Post Industrial Waste</h2>

            <form onSubmit={handleWasteSubmit}>
              <input
                placeholder="Company Name"
                value={wasteForm.companyName}
                onChange={(e) =>
                  setWasteForm({
                    ...wasteForm,
                    companyName: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Industry Type"
                value={wasteForm.industryType}
                onChange={(e) =>
                  setWasteForm({
                    ...wasteForm,
                    industryType: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Location"
                value={wasteForm.location}
                onChange={(e) =>
                  setWasteForm({
                    ...wasteForm,
                    location: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Waste Type"
                value={wasteForm.wasteType}
                onChange={(e) =>
                  setWasteForm({
                    ...wasteForm,
                    wasteType: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                value={wasteForm.quantity}
                onChange={(e) =>
                  setWasteForm({
                    ...wasteForm,
                    quantity: e.target.value,
                  })
                }
                required
              />

              <select
                value={wasteForm.unit}
                onChange={(e) =>
                  setWasteForm({
                    ...wasteForm,
                    unit: e.target.value,
                  })
                }
              >
                <option>Kg</option>
                <option>Ton</option>
                <option>Litres</option>
              </select>

              <select
                value={wasteForm.quality}
                onChange={(e) =>
                  setWasteForm({
                    ...wasteForm,
                    quality: e.target.value,
                  })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <input
                type="date"
                value={wasteForm.availabilityDate}
                onChange={(e) =>
                  setWasteForm({
                    ...wasteForm,
                    availabilityDate: e.target.value,
                  })
                }
                required
              />

              <button className="primary-btn" type="submit">
                Submit Waste
              </button>
            </form>
          </div>
        </div>
      )}

      {showRequirementForm && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              className="close-btn"
              onClick={() => setShowRequirementForm(false)}
            >
              ×
            </button>

            <h2>Post Waste Requirement</h2>

            <form onSubmit={handleRequirementSubmit}>
              <input
                placeholder="Company Name"
                value={requirementForm.companyName}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    companyName: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Industry Type"
                value={requirementForm.industryType}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    industryType: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Location"
                value={requirementForm.location}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    location: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Required Waste Type"
                value={requirementForm.wasteType}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    wasteType: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Required Quantity"
                value={requirementForm.quantity}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    quantity: e.target.value,
                  })
                }
                required
              />

              <select
                value={requirementForm.unit}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    unit: e.target.value,
                  })
                }
              >
                <option>Kg</option>
                <option>Ton</option>
                <option>Litres</option>
              </select>

              <select
                value={requirementForm.minimumQuality}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    minimumQuality: e.target.value,
                  })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <input
                type="date"
                value={requirementForm.requiredDate}
                onChange={(e) =>
                  setRequirementForm({
                    ...requirementForm,
                    requiredDate: e.target.value,
                  })
                }
                required
              />

              <button className="primary-btn" type="submit">
                Submit Requirement
              </button>
            </form>
          </div>
        </div>
      )}


      {showPickupForm && (
        <div
          className="modal-overlay"
          style={{
            background: "rgba(15, 55, 38, 0.48)",
            backdropFilter: "blur(4px)",
            padding: "24px",
          }}
        >
          <div
            className="modal"
            style={{
              width: "min(1100px, 96vw)",
              maxWidth: "1100px",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: "0",
              borderRadius: "24px",
              background: "#ffffff",
              boxShadow: "0 24px 70px rgba(20, 80, 55, 0.22)",
              border: "1px solid #d7eadf",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                padding: "38px 42px 32px",
                textAlign: "center",
                background: "linear-gradient(135deg, #edf9f1 0%, #f7fcf8 55%, #e8f7ed 100%)",
                borderBottom: "1px solid #d9ece0",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "24px",
                  top: "12px",
                  fontSize: "42px",
                  opacity: 0.65,
                }}
              >
                🍃
              </div>

              <div
                style={{
                  position: "absolute",
                  right: "28px",
                  top: "14px",
                  fontSize: "40px",
                  opacity: 0.65,
                }}
              >
                🌿
              </div>

              <button
                className="close-btn"
                onClick={() => setShowPickupForm(false)}
                style={{
                  position: "absolute",
                  right: "18px",
                  top: "14px",
                  zIndex: 2,
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  border: "1px solid #cfe4d7",
                  background: "rgba(255,255,255,0.9)",
                  color: "#245b43",
                  fontSize: "25px",
                  cursor: "pointer",
                  lineHeight: "1",
                }}
              >
                ×
              </button>

              <div
                style={{
                  fontSize: "42px",
                  lineHeight: "1",
                  marginBottom: "12px",
                }}
              >
                🧃🌿
              </div>

              <h2
                style={{
                  margin: "0 0 12px",
                  color: "#145c3b",
                  fontSize: "32px",
                  fontWeight: 750,
                  letterSpacing: "-0.5px",
                }}
              >
                Bagasse Pickup Request
              </h2>

              <p
                style={{
                  margin: "0 auto",
                  maxWidth: "760px",
                  color: "#587166",
                  fontSize: "16px",
                  lineHeight: 1.6,
                }}
              >
                Submit your reusable sugarcane bagasse and receive an agreed
                payment after the transaction is completed.
              </p>
            </div>

            <div style={{ padding: "30px 34px 34px", background: "#fbfefc" }}>
              <form onSubmit={handlePickupSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "22px",
                    marginBottom: "22px",
                  }}
                >
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "18px 20px 20px",
                      borderRadius: "16px",
                      background: "#f0faf4",
                      border: "1px solid #d8ebdf",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 16px",
                        color: "#17613f",
                        fontSize: "18px",
                      }}
                    >
                      👤 Shop Details
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "18px",
                      }}
                    >
                      <div>
                        <label style={pickupLabelStyle}>Shop / Owner Name</label>
                        <input
                          style={pickupInputStyle}
                          type="text"
                          placeholder="Enter shop / owner name"
                          value={pickupForm.name}
                          onChange={(e) =>
                            setPickupForm({ ...pickupForm, name: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label style={pickupLabelStyle}>Phone Number</label>
                        <input
                          style={pickupInputStyle}
                          type="tel"
                          placeholder="Enter phone number"
                          value={pickupForm.phone}
                          onChange={(e) =>
                            setPickupForm({ ...pickupForm, phone: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label style={pickupLabelStyle}>Location</label>
                        <input
                          style={pickupInputStyle}
                          type="text"
                          placeholder="Enter location"
                          value={pickupForm.location}
                          onChange={(e) =>
                            setPickupForm({ ...pickupForm, location: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "22px 22px 24px",
                      borderRadius: "18px",
                      background: "#ffffff",
                      border: "1px solid #dfeae3",
                      boxShadow: "0 6px 20px rgba(35, 91, 64, 0.06)",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 6px",
                        color: "#17613f",
                        fontSize: "19px",
                      }}
                    >
                      ♻️ Bagasse & Pickup Details
                    </h3>
                    <p
                      style={{
                        margin: "0 0 18px",
                        color: "#6a7d73",
                        fontSize: "14px",
                      }}
                    >
                      Provide a few more details so the collector can understand the
                      material and pickup request clearly.
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "18px",
                      }}
                    >
                      <div>
                        <label style={pickupLabelStyle}>Generator Type</label>
                        <select
                          style={pickupInputStyle}
                          value={pickupForm.generatorType}
                          onChange={(e) =>
                            setPickupForm({
                              ...pickupForm,
                              generatorType: e.target.value,
                            })
                          }
                        >
                          <option>Sugarcane Juice Shop</option>
                          <option>Small Sugarcane Vendor</option>
                          <option>Juice Center</option>
                          <option>Other Small Generator</option>
                        </select>
                      </div>

                      <div>
                        <label style={pickupLabelStyle}>Waste Type</label>
                        <select
                          style={pickupInputStyle}
                          value={pickupForm.wasteType}
                          onChange={(e) =>
                            setPickupForm({
                              ...pickupForm,
                              wasteType: e.target.value,
                            })
                          }
                        >
                          <option>Sugarcane Bagasse</option>
                          <option>Bagasse Fibre</option>
                          <option>Other Sugarcane Waste</option>
                        </select>
                      </div>

                      <div>
                        <label style={pickupLabelStyle}>Quantity</label>
                        <input
                          style={pickupInputStyle}
                          type="number"
                          placeholder="Enter quantity"
                          value={pickupForm.quantity}
                          onChange={(e) =>
                            setPickupForm({ ...pickupForm, quantity: e.target.value })
                          }
                          required
                          min="1"
                        />
                      </div>

                      <div>
                        <label style={pickupLabelStyle}>Unit</label>
                        <select
                          style={pickupInputStyle}
                          value={pickupForm.unit}
                          onChange={(e) =>
                            setPickupForm({ ...pickupForm, unit: e.target.value })
                          }
                        >
                          <option>Kg</option>
                          <option>Tons</option>
                        </select>
                      </div>

                      <div>
                        <label style={pickupLabelStyle}>Moisture Status</label>
                        <select
                          style={pickupInputStyle}
                          value={pickupForm.moistureStatus}
                          onChange={(e) =>
                            setPickupForm({
                              ...pickupForm,
                              moistureStatus: e.target.value,
                            })
                          }
                        >
                          <option>Fresh/Wet</option>
                          <option>Partially Dry</option>
                          <option>Dry</option>
                        </select>
                      </div>

                      <div>
                        <label style={pickupLabelStyle}>Proposed Price per Unit (₹)</label>
                        <input
                          style={pickupInputStyle}
                          type="number"
                          placeholder="Enter proposed price"
                          value={pickupForm.pricePerUnit}
                          onChange={(e) =>
                            setPickupForm({
                              ...pickupForm,
                              pricePerUnit: e.target.value,
                            })
                          }
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "18px",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: "#f6fbf8",
                        border: "1px solid #e0eee5",
                        color: "#557066",
                        fontSize: "13px",
                        lineHeight: 1.55,
                      }}
                    >
                      <strong style={{ color: "#17613f" }}>💡 Pickup information:</strong>{" "}
                      Quantity, unit, moisture condition and proposed price will be
                      used to calculate the estimated transaction value below.
                    </div>
                  </div>
                </div>

                {pickupForm.quantity && pickupForm.pricePerUnit && (
                  <div
                    style={{
                      padding: "20px",
                      marginBottom: "22px",
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #eefaf2, #f8fcf9)",
                      border: "1px solid #cfe6d8",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 14px",
                        color: "#17613f",
                        fontSize: "18px",
                      }}
                    >
                      💰 Estimated Transaction Details
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      <div style={priceCardStyle}>
                        <span>Transaction Value</span>
                        <strong>₹{(Number(pickupForm.quantity) * Number(pickupForm.pricePerUnit)).toFixed(2)}</strong>
                      </div>
                      <div style={priceCardStyle}>
                        <span>Shop Receives</span>
                        <strong>₹{(Number(pickupForm.quantity) * Number(pickupForm.pricePerUnit) * 0.8).toFixed(2)}</strong>
                      </div>
                      <div style={priceCardStyle}>
                        <span>Collector Fee</span>
                        <strong>₹{(Number(pickupForm.quantity) * Number(pickupForm.pricePerUnit) * 0.15).toFixed(2)}</strong>
                      </div>
                      <div style={priceCardStyle}>
                        <span>EcoSync Fee</span>
                        <strong>₹{(Number(pickupForm.quantity) * Number(pickupForm.pricePerUnit) * 0.05).toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "14px",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowPickupForm(false)}
                    style={{
                      padding: "14px 24px",
                      borderRadius: "12px",
                      border: "1px solid #cbded3",
                      background: "#ffffff",
                      color: "#426454",
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="primary-btn"
                    type="submit"
                    style={{
                      minWidth: "220px",
                      padding: "14px 28px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 8px 20px rgba(24, 112, 70, 0.18)",
                    }}
                  >
                    ✈️ Submit Pickup Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal login-modal auth-modal">
            <button
              className="close-btn"
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>

            <h2>{authMode === "login" ? "Welcome Back" : "Create Your EcoSync Account"}</h2>

            <p>
              {authMode === "login"
                ? "Login first to post industrial waste and requirements."
                : "Register first to use EcoSync waste exchange features."}
            </p>

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "active-tab" : ""}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === "register" ? "active-tab" : ""}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={authMode === "login" ? handleLogin : handleRegister}>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, name: e.target.value })
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Email Address"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                required
              />

              {authMode === "register" && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={authForm.confirmPassword}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              )}

              <button className="primary-btn auth-submit" type="submit">
                {authMode === "login" ? "Login" : "Create Account"}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === "login"
                ? "New to EcoSync? Click Register above."
                : "Already have an account? Click Login above."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;