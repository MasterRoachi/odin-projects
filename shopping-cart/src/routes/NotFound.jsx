import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="hold pad">
      <div className="empty-state">
        <h1>That page is not here</h1>
        <p>The link may be old, or the product may have gone.</p>
        <Link className="button" to="/shop">
          Back to the shop
        </Link>
      </div>
    </div>
  );
}
