import { useContext, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Loader from "../../components/loader/Loader";
import AuthContext from "../../context/auth/AuthContext";
import { deleteProduct, getProductById } from "../../services/product";
import "./EditProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const { navigate } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProductById = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        console.log("res", res);

        setProduct(res.product);
      } catch (error) {
        console.error("Error fetching product by ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [id]);

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="edit-product-container">
      <div className="trash-button-box">
        <button className="trash-button" onClick={handleDeleteProduct}>
          <FaTrash className="svgIcon" />
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
