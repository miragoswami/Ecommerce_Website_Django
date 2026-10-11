import ProductCard from "../components/ProductCard";

function TrendingProducts({ products }) {
  return (
    <div className="container my-5">
      <h2 className="mb-4">
        Trending Products
      </h2>

      <div className="row">
        {products.map((product) => (
          <div
            className="col-md-3 mb-4"
            key={product.id}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingProducts;