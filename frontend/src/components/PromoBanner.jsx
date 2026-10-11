import "../css/PromoBanner1.css";
import promoBanner1 from "../assets/promoBanner1.jpg";

function PromoBanner() {
  return (
    <section className="promo-banner">
      <img
        src={promoBanner1}
        alt="Promotional Banner"
      />
    </section>
  );
}

export default PromoBanner;