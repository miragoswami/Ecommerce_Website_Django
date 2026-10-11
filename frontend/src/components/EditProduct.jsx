import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [oldImage, setOldImage] = useState("");
  const [newImage, setNewImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --------------------------------
  // GET PRODUCT + CATEGORIES
  // --------------------------------

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  async function fetchProduct() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/products/${id}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Product:", data);

      if (response.ok) {
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          stock: data.stock ?? "",
          category: data.category || "",
        });

        setOldImage(data.image || "");
      } else {
        console.log("Product error:", data);

        alert("Unable to load product.");

        navigate("/seller/dashboard");
      }
    } catch (error) {
      console.log("Fetch error:", error);

      alert("Something went wrong.");

      navigate("/seller/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/categories/"
      );

      const data = await response.json();

      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      console.log("Category error:", error);
    }
  }

  // --------------------------------
  // HANDLE TEXT INPUT
  // --------------------------------

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  }

  // --------------------------------
  // HANDLE IMAGE
  // --------------------------------

  function handleImageChange(e) {
    setNewImage(e.target.files[0]);
  }

  // --------------------------------
  // UPDATE PRODUCT
  // --------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("category", form.category);

    // Only send image if seller selected a new one
    if (newImage) {
      formData.append("image", newImage);
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/products/${id}/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Updated product:", data);

      if (response.ok) {
        alert("Product updated successfully!");

        navigate("/seller/dashboard");
      } else {
        console.log("Update error:", data);

        alert(
          data.detail ||
            "Failed to update product."
        );
      }
    } catch (error) {
      console.log("Update error:", error);

      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <div className="container mt-5">
        <h3>Loading product...</h3>
      </div>
    );
  }

  // --------------------------------
  // FORM
  // --------------------------------

  return (
    <div className="container mt-5 mb-5">

      <div className="card shadow p-4">

        <h2 className="mb-4">
          Edit Product
        </h2>

        <form onSubmit={handleSubmit}>

          {/* PRODUCT NAME */}

          <div className="mb-3">
            <label className="form-label">
              Product Name
            </label>

            <input
              type="text"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>


          {/* DESCRIPTION */}

          <div className="mb-3">
            <label className="form-label">
              Description
            </label>

            <textarea
              name="description"
              className="form-control"
              rows="4"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>


          {/* PRICE + STOCK */}

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Price
              </label>

              <input
                type="number"
                name="price"
                className="form-control"
                value={form.price}
                onChange={handleChange}
                min="0"
                required
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                className="form-control"
                value={form.stock}
                onChange={handleChange}
                min="0"
                required
              />

            </div>

          </div>


          {/* CATEGORY */}

          <div className="mb-3">

            <label className="form-label">
              Category
            </label>

            <select
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
              required
            >

              <option value="">
                Select Category
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}

            </select>

          </div>


          {/* OLD IMAGE */}

          {oldImage && (
            <div className="mb-3">

              <label className="form-label">
                Current Image
              </label>

              <br />

              <img
                src={oldImage}
                alt={form.name}
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

            </div>
          )}


          {/* NEW IMAGE */}

          <div className="mb-4">

            <label className="form-label">
              Change Image
            </label>

            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
            />

            <small className="text-muted">
              Leave empty if you want to keep the
              current image.
            </small>

          </div>


          {/* BUTTONS */}

          <button
            type="submit"
            className="btn btn-primary me-2"
            disabled={saving}
          >
            {saving
              ? "Updating..."
              : "Update Product"}
          </button>


          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate("/seller/dashboard")
            }
          >
            Cancel
          </button>

        </form>

      </div>

    </div>
  );
}

export default EditProduct;