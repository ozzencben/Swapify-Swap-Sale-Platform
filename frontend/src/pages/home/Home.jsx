import { useEffect, useRef, useState } from "react";
import Loader from "../../components/loader/Loader";
import ProductCard from "../../components/product-card/ProductCard";
import { getAllCategories } from "../../services/category";
import { getAllProducts } from "../../services/product";
import "./Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    id: "all",
    name: "Tüm Kategoriler",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ---------------- FETCH PRODUCTS ----------------
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const res = await getAllProducts();
        const productList = Array.isArray(res) ? res : res.products || [];
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        console.error("Product fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // ---------------- FETCH CATEGORIES ----------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        const categoryList = Array.isArray(res) ? res : res.categories || [];
        setCategories(categoryList);
      } catch (error) {
        console.error("Category fetch error:", error);
      }
    };
    fetchCategories();
  }, []);

  // ---------------- FILTER ----------------
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory.id !== "all") {
      filtered = filtered.filter(
        (p) =>
          p.category_id === selectedCategory.id ||
          p.category_name === selectedCategory.name
      );
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products]);

  // ---------------- CLOSE ON OUTSIDE CLICK ----------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="home-container">
      {/* ---------- Filter Bar ---------- */}
      <div className="home-filter-bar">
        <div className="home-search-box">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="ri-search-line"></i>
        </div>

        {/* ---------- Custom Category Dropdown ---------- */}
        <div className="home-category-dropdown" ref={dropdownRef}>
          <button
            className="home-category-btn"
            onClick={() => setOpenDropdown((prev) => !prev)}
          >
            <span>{selectedCategory.name}</span>
            <i
              className={`ri-arrow-down-s-line ${
                openDropdown ? "home-rotate" : ""
              }`}
            ></i>
          </button>

          {openDropdown && (
            <div className="home-dropdown-menu">
              <div
                className={`home-dropdown-item ${
                  selectedCategory.id === "all" ? "home-active" : ""
                }`}
                onClick={() => {
                  setSelectedCategory({ id: "all", name: "Tüm Kategoriler" });
                  setOpenDropdown(false);
                }}
              >
                Tüm Kategoriler
              </div>

              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`home-dropdown-item ${
                    selectedCategory.id === cat.id ? "home-active" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory({ id: cat.id, name: cat.name });
                    setOpenDropdown(false);
                  }}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Products ---------- */}
      <div className="home-products-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <p className="home-no-products">Ürün bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
