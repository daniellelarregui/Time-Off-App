import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";

function App() {
  const [user, setUser] = useState({});
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    manager: ""
  });
  const [requests, setRequests] = useState([]);

  // 1) Fetch current user info
  useEffect(() => {
    invoke("getCurrentUser").then(setUser);
    loadRequests();
  }, []);

  // 2) Load all requests (for manager view)
  const loadRequests = () =>
    invoke("listRequests").then(setRequests);

  // 3) Submit new request
  const submit = async e => {
    e.preventDefault();
    await invoke("createRequest", form);
    setForm({ startDate: "", endDate: "", reason: "", manager: "" });
    loadRequests();
  };

  // 4) Approve or deny
  const updateStatus = async (id, status) => {
    await invoke("updateRequest", { id, status });
    loadRequests();
  };

  // If this user is a manager of anyone, show pending approvals:
  const isManager = requests.some(r => r.manager === user.username);

  return (
    <div style={{ padding: 16, fontFamily: "Arial" }}>
      {!isManager ? (
        /* Employee submits a request */
        <form onSubmit={submit}>
          <h3>Request Time Off</h3>
          <label>
            Start Date<br/>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </label><br/>
          <label>
            End Date<br/>
            <input
              type="date"
              value={form.endDate}
              onChange={e => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </label><br/>
          <label>
            Reason<br/>
            <textarea
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              required
            />
          </label><br/>
          <label>
            Manager Username<br/>
            <input
              type="text"
              value={form.manager}
              onChange={e => setForm({ ...form, manager: e.target.value })}
              placeholder="e.g. jsmith"
              required
            />
          </label><br/>
          <button type="submit">Submit</button>
        </form>
      ) : (
        /* Manager approves/denies */
        <div>
          <h3>Pending Approvals</h3>
          {requests
            .filter(r => r.manager === user.username && r.status === "PENDING")
            .map(r => (
              <div key={r.id} style={{ marginBottom: 12 }}>
                <strong>{r.employeeName}</strong>: {r.startDate} → {r.endDate}<br/>
                <em>{r.reason}</em><br/>
                <button onClick={() => updateStatus(r.id, "APPROVED")}>
                  Approve
                </button>
                <button onClick={() => updateStatus(r.id, "DENIED")}>
                  Deny
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default App;
