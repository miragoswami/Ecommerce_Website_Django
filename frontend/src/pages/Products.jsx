import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import { useSearchParams } from "react-router-dom";
import FooterSection from "../components/FooterSection";
import TrendingProducts from "./TrendingProducts";

function Products() {
  const [products, setProducts] = useState([]);

  const [searchParams] = useSearchParams();

  const categoryName = searchParams.get("category");
  const searchText = searchParams.get("search");

  // Get products from Django
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

  // Filter products
  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      !categoryName ||
      product.category_name?.toLowerCase() ===
        categoryName.toLowerCase();

    const searchMatch =
      !searchText ||
      product.name.toLowerCase().includes(searchText.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        <h2 className="mb-4">
          {categoryName || "All Products"}
        </h2>

        <div className="row">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                className="col-md-3 mb-4"
                key={product.id}
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>

        {/* Trending Products */}
        <TrendingProducts products={products} />

      </div>

      <FooterSection />
    </>
  );
}

export default Products;