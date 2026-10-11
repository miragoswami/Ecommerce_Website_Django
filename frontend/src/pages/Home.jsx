import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import CategorySection from "../components/CategorySection";
import PromoBanner from "../components/PromoBanner";
import FooterSection from "../components/FooterSection";
import OfferBanner from "../components/OfferBanner";
import TrendingProducts from "./TrendingProducts";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Products from Django:", data);
        setProducts(data);
      })
      .catch((error) => {
        console.log("Product error:", error);
      });
  }, []);

  return (
    <>
      <Navbar />

      <OfferBanner />

      <CategorySection />

      <PromoBanner />

      <TrendingProducts products={products} />

      <FooterSection />
    </>
  );
}

export default Home;