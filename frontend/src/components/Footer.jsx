import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow"></div>

      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <h2 className="footer-logo">
            Aethel<span>Gard</span>
          </h2>

          <p>
            Embark on a legendary MMORPG adventure. Explore mysterious lands,
            battle epic bosses, collect rare equipment and forge your own
            legend.
          </p>

          <div className="footer-social">
            <a href="#">Discord</a>
            <a href="#">Facebook</a>
            <a href="#">YouTube</a>
            <a href="#">TikTok</a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4>Navigation</h4>

          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/download">Download</Link>
            </li>
            <li>
              <Link to="/news">News</Link>
            </li>
            <li>
              <Link to="/ranking">Ranking</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4>Support</h4>

          <ul>
            <li>
              <Link to="/faq">FAQ</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4>Community</h4>

          <ul>
            <li>Email: support@aethelgard.com</li>
            <li>Discord: discord.gg/aethelgard</li>
            <li>Server: Asia • Europe • America</li>
            <li>Support: 24 / 7</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} <span>AethelGard</span>. All Rights
        Reserved.
      </div>
    </footer>
  );
}
