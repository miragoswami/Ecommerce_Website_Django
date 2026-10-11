import "../css/FooterSection.css";


function FooterSection() {
  return (
    <footer>

      {/* Back To Top */}
      <div
        className="back-top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      >
        Back to Top
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="row">

            <div className="col-md-3">
              <h5>Get to Know Us</h5>
              <p>About Trend Cart</p>
              <p>Careers</p>
              <p>Blog</p>
              <p>Contact Us</p>
            </div>

            <div className="col-md-3">
              <h5>Connect With Us</h5>
              <p>Instagram</p>
              <p>Facebook</p>
              <p>Twitter</p>
            </div>

            <div className="col-md-3">
              <h5>Sell With Us</h5>
              <p>Become a Seller</p>
              <p>Affiliate Program</p>
              <p>Advertise Products</p>
            </div>

            <div className="col-md-3">
              <h5>Help</h5>
              <p>Your Account</p>
              <p>Returns</p>
              <p>Shipping Info</p>
              <p>Support</p>
            </div>

          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="footer-logo text-center">
        <h2>Trend Cart</h2>

        <button className="btn btn-outline-light mx-2">
          English
        </button>

        <button className="btn btn-outline-light">
          🇮🇳 India
        </button>
      </div>

      {/* Services */}
      <div className="footer-services">
        <div className="container">
          <div className="row text-center">

            <div className="col-md-3 mb-3">
              <h6>Trend Cart Fashion</h6>
              <small>Latest Fashion Trends</small>
            </div>

            <div className="col-md-3 mb-3">
              <h6>Trend Cart Prime</h6>
              <small>Fast Delivery</small>
            </div>

            <div className="col-md-3 mb-3">
              <h6>Trend Cart Music</h6>
              <small>Stream Music</small>
            </div>

            <div className="col-md-3 mb-3">
              <h6>Trend Cart Cloud</h6>
              <small>Cloud Services</small>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright text-center">
        <p>
          Terms & Conditions | Privacy Policy | Refund Policy
        </p>

        <p>
          © 2026 Trend Cart. All Rights Reserved.
        </p>
      </div>

    </footer>
  );
}

export default FooterSection;