import { useContext, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { GoChevronDown } from "react-icons/go";
import { PiWarningCircleLight } from "react-icons/pi";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import CustomImagePicker from "../../components/image-picker/CustomImagePicker";
import Loader from "../../components/loader/Loader";
import AuthContext from "../../context/auth/AuthContext";
import { getAllCategories, getCategoryById } from "../../services/category";
import {
  deleteProduct,
  getProductById,
  removeProductImage,
  updateProduct,
} from "../../services/product";
import "./EditProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const { navigate } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showEditCategoryDropdown, setShowEditCategoryDropdown] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const conditions = ["Brand New", "Second Hand", "Refurbished"];
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [showEditConditionDropdown, setShowEditConditionDropdown] =
    useState(false);

  const [productImages, setProductImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [addedImages, setAddedImages] = useState([]);

  // Ürünü ID ile getir
  useEffect(() => {
    const fetchProductById = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        setProduct(res.product);
        setProductName(res.product.title);
        setDescription(res.product.description);
        setPrice(res.product.price);

        const categoryRes = await getCategoryById(res.product.category_id);
        setSelectedCategory(categoryRes.category.name);
        setSelectedCondition(res.product.condition);
        setProductImages(res.product.images || []);
      } catch (error) {
        console.error("Error fetching product by ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [id]);

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

  // dropdown toggle
  const toggleEditCategoryDropdown = () => {
    setShowEditCategoryDropdown((prev) => !prev);
    setShowEditConditionDropdown(false);
  };

  const toggleEditConditionDropdown = () => {
    setShowEditConditionDropdown((prev) => !prev);
    setShowEditCategoryDropdown(false);
  };

  // kategori ve condition seçimi
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowEditCategoryDropdown(false);
  };

  const handleConditionClick = (condition) => {
    setSelectedCondition(condition);
    setShowEditConditionDropdown(false);
  };

  // Görsel seçimi
  const handleImageSelect = (files) => {
    if (!files || files.length === 0) return;
    const selectedFiles = Array.from(files);
    setProductImages((prev) => [...prev, ...selectedFiles]);
    setAddedImages((prev) => [...prev, ...selectedFiles]);
  };

  // Görsel silme
  const handleRemoveImage = (index) => {
    const removed = productImages[index];

    if (typeof removed === "string") {
      // eski görsel URL ise backend’e bildir
      removeProductImage(product.id, removed)
        .then(() => {
          toast.success("Image removed successfully!");
          setProductImages((prev) => prev.filter((_, i) => i !== index));
        })
        .catch((err) => {
          console.error("Error removing image:", err);
          toast.error("Failed to remove image!");
        });
    } else {
      // yeni eklenen henüz yüklenmemiş görsel
      setAddedImages((prev) => prev.filter((f) => f !== removed));
      setProductImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Ürün silme
  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product!");
    }
  };

  // Ürün güncelleme
  const handleUpdateProduct = async () => {
    try {
      setLoading(true);
      const categoryObj = categories.find(
        (cat) => cat.name === selectedCategory
      );

      const updatedData = {
        title: productName || "",
        description: description || "",
        price: price || 0,
        category_id: categoryObj ? categoryObj.id : product.category_id,
        condition: selectedCondition || "",
        is_tradeable: product.is_tradeable,
        status: product.status,
        images: addedImages,
        removedImages,
      };

      const res = await updateProduct(id, updatedData);
      if (res.success) {
        toast.success("Product updated successfully!");
        navigate(`/product-detail/${id}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product!");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) return <Loader />;

  return (
    <div className="edit-product-container">
      <div className="trash-button-box">
        <button className="trash-button" onClick={handleDeleteProduct}>
          <FaTrash className="svgIcon" />
        </button>
      </div>

      <div className="edit-form-container">
        {/* product name */}
        <div className="edit-form-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please enter the name of the product you want to update.</p>
          </div>
          <div className="edit-product-input">
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
        </div>

        {/* description */}
        <div className="edit-form-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>
              Please enter the description of the product you want to update.
            </p>
          </div>
          <div className="edit-product-input">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        {/* price */}
        <div className="edit-form-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please enter the price of the product you want to update.</p>
          </div>
          <div className="edit-product-input">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>

        {/* category */}
        <div className="edit-form-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please select the category of the product you want to update.</p>
          </div>
          <div className="edit-product-input">
            <input
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
            <GoChevronDown
              className="down-icon"
              onClick={toggleEditCategoryDropdown}
            />
            <div
              className={`edit-category-dropdown ${
                showEditCategoryDropdown ? "show" : ""
              }`}
            >
              <ul>
                {categories.map((category) => (
                  <li
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* condition */}
        <div className="edit-form-item">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>
              Please select the condition of the product you want to update.
            </p>
          </div>
          <div className="edit-product-input">
            <input
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
            />
            <GoChevronDown
              className="down-icon"
              onClick={toggleEditConditionDropdown}
            />
            <div
              className={`edit-condition-dropdown ${
                showEditConditionDropdown ? "show" : ""
              }`}
            >
              <ul>
                {conditions.map((condition) => (
                  <li
                    key={condition}
                    onClick={() => handleConditionClick(condition)}
                  >
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* product images */}
        <div className="edit-form-images-container">
          <div className="tips">
            <PiWarningCircleLight className="warning-icon" />
            <p>Please upload the images of the product you want to update.</p>
          </div>

          {productImages.length > 0 && (
            <div className="image-preview-container">
              {productImages.map((img, index) => (
                <div key={index} className="preview-item">
                  <img
                    src={
                      typeof img === "string" ? img : URL.createObjectURL(img)
                    }
                    alt={`Product ${index}`}
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="image-select-area">
            <CustomImagePicker onImagesSelect={handleImageSelect} />
          </div>
        </div>

        {/* güncelleme butonu */}
        <div className="edit-form-submit">
          <button onClick={handleUpdateProduct} className="update-btn">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
