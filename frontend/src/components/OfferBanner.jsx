import { Link } from "react-router-dom";
import OfferBannerImg from "../assets/OfferBanner.png";

function OfferBanner() {
  return (
    <div className="offer-banner">
      <Link to="/products" title="Shop The Offer">
        <img
          src={OfferBannerImg}
          alt="Shop The Offer"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            cursor: "pointer",
          }}
        />
      </Link>
    </div>
  );
}

export default OfferBanner;