import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="wrap" style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center" }}>
      <div>
        <h1 className="sec-title" style={{ marginBottom: 12 }}>404</h1>
        <p style={{ color: "var(--muted)", marginBottom: 20 }}>That page wandered off.</p>
        <Link className="btn btn-primary" to="/">Back home</Link>
      </div>
    </div>
  );
}
