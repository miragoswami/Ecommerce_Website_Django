import "../css/CategorySection.css";

import ethnic from "../assets/ethnic.jpeg";
import western from "../assets/western.jpeg";
import menswear from "../assets/menswear.jpeg";
import footwear from "../assets/footwear.jpeg";
import homedecor from "../assets/homedecor.jpeg";
import beauty from "../assets/beauty.jpeg";
import accessories from "../assets/accessories.jpeg";
import grocery from "../assets/grocery.jpeg";

function CategorySection() {
  const categories = [
    {
      image: ethnic,
      name: "Ethnic Wear",
    },
    {
      image: western,
      name: "Western Dresses",
    },
    {
      image: menswear,
      name: "Menswear",
    },
    {
      image: footwear,
      name: "Footwear",
    },
    {
      image: homedecor,
      name: "Home Decor",
    },
    {
      image: accessories,
      name: "Accessories",
    },
    {
      image: grocery,
      name: "Grocery",
    },
  ];

  return (
    <section className="category-section py-5">
      <div className="container-fluid px-5">

        <div className="category-list d-flex justify-content-between align-items-start">

          {categories.map((category, index) => (
            <div className="category-item text-center" key={index}>

              <div className="category-image">
                <img
                  src={category.image}
                  alt={category.name}
                  className="img-fluid"
                />
              </div>

              <p className="category-name mt-3 mb-0">
                {category.name}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default CategorySection;