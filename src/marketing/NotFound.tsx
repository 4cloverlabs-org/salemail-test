import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="cc-page">
      <div className="cc-container cc-notfound">
        <div className="cc-404">404</div>
        <h1>This page wandered off.</h1>
        <p>The page you’re looking for doesn’t exist or may have moved. Let’s get you back on track.</p>
        <div className="cc-cta-btns" style={{ justifyContent: 'center' }}>
          <Link to="/" className="cc-btn cc-btn-primary">Back home</Link>
          <Link to="/blog" className="cc-btn cc-btn-ghost">Read the blog</Link>
        </div>
      </div>
    </div>
  );
}
