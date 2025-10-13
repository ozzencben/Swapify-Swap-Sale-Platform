import { useEffect, useState } from "react";
import { toast } from "sonner"; // başarı/hata bildirimi
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import { PiWarningCircleLight } from "react-icons/pi";
import CustomImagePicker from "../../components/image-picker/CustomImagePicker";
import Loader from "../../components/loader/Loader";
import { getAllCategories } from "../../services/category";
import { createProduct } from "../../services/product"; 
import "./AddProduct.css";

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [conditionDropdownOpen, setConditionDropdownOpen] = useState(false);

  // Form alanları
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState({
    id: "",
    name: "",
  });
  const [selectedCondition, setSelectedCondition] = useState("");
  const [isTradeable, setIsTradeable] = useState(false);
  const [productImages, setProductImages] = useState([]); 
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(false);

  // Dropdown toggle
  const toggleCategoryDropdown = () => setCategoryDropdownOpen((prev) => !prev);
  const toggleConditionDropdown = () =>
    setConditionDropdownOpen((prev) => !prev);

  // Kategorileri getir
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        setLoading(true);
        const res = await getAllCategories();
        setCategories(res.categories || []);
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCategories();
  }, []);

  // Görsel seçimi
  const handleImageSelect = (files) => {
    // Tek veya çoklu seçimi destekler
    setProductImages(Array.isArray(files) ? files : [files]);
  };

  // Form gönderimi
  const handleSubmit = async () => {
    if (
      !title ||
      !description ||
      !price ||
      !selectedCategory.id ||
      !selectedCondition
    ) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      setSubmitting(true);

      const productData = {
        title,
        description,
        price,
        category_id: selectedCategory.id,
        condition: selectedCondition,
        is_tradeable: isTradeable,
        status: "active", 
        images: productImages,
      };

      const res = await createProduct(productData);

      if (res?.success) {
        toast.success("Product added successfully!");
        // Formu sıfırla
        setTitle("");
        setDescription("");
        setPrice("");
        setSelectedCategory({ id: "", name: "" });
        setSelectedCondition("");
        setIsTradeable(false);
        setProductImages([]);
        setResult(true);
      }
    } catch (error) {
      console.error("Product creation error:", error);
      toast.error("Product creation failed!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="add-product-container">
      <div className="add-product-form">
        {/* Product Name */}
        <div className="add-product-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Product name must be unique</p>
          </div>
          <div className="add-product-input-box">
            <input
              type="text"
              placeholder="Product Name"
              className="add-product-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        {/* Product Description */}
        <div className="add-product-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please enter a valid description</p>
          </div>
          <div className="add-product-input-box">
            <textarea
              placeholder="Product Description"
              className="add-product-input"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Product Price */}
        <div className="add-product-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please enter a valid price</p>
          </div>
          <div className="add-product-input-box">
            <input
              type="number"
              placeholder="Product Price"
              className="add-product-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Product Category */}
        <div className="add-product-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please select a category</p>
          </div>
          <div className="category-value-row" onClick={toggleCategoryDropdown}>
            <input
              type="text"
              placeholder="Product Category"
              className="add-product-input"
              value={selectedCategory.name}
              readOnly
            />
            {categoryDropdownOpen ? (
              <GoChevronUp className="dropdown-icon" />
            ) : (
              <GoChevronDown className="dropdown-icon" />
            )}
            <div
              className={`category-dropdown ${
                categoryDropdownOpen ? "active" : ""
              }`}
            >
              <ul>
                {categories.map((category) => (
                  <li
                    key={category.id || category._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory({
                        id: category.id || category._id,
                        name: category.name,
                      });
                      setCategoryDropdownOpen(false);
                    }}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Condition */}
        <div className="add-product-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please select a product condition</p>
          </div>
          <div
            className="condition-value-row"
            onClick={toggleConditionDropdown}
          >
            <input
              type="text"
              placeholder="Product Condition"
              className="add-product-input"
              value={selectedCondition}
              readOnly
            />
            {conditionDropdownOpen ? (
              <GoChevronUp className="dropdown-icon" />
            ) : (
              <GoChevronDown className="dropdown-icon" />
            )}
            <div
              className={`condition-dropdown ${
                conditionDropdownOpen ? "active" : ""
              }`}
            >
              <ul>
                {["Brand New", "Second Hand", "Refurbished"].map(
                  (condition) => (
                    <li
                      key={condition}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCondition(condition);
                        setConditionDropdownOpen(false);
                      }}
                    >
                      {condition}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="add-product-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please select a product image</p>
          </div>
          <CustomImagePicker onImageSelect={handleImageSelect} result={result} />
        </div>

        {/* Tradeable */}
        <div className="tradeable-container">
          <label className="container">
            <input
              type="checkbox"
              checked={isTradeable}
              onChange={(e) => setIsTradeable(e.target.checked)}
            />
            <svg viewBox="0 0 64 64" height="2em" width="2em">
              <path
                d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                pathLength="575.0541381835938"
                className="path"
              ></path>
            </svg>
          </label>
          <p>Is Tradeable?</p>
        </div>

        {/* Submit */}
        <button
          className="add-product-button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add Product"}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
