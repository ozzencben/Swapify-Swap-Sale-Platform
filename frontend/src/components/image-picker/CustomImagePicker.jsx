import { useEffect, useRef, useState } from "react";
import { FaCamera, FaTimes } from "react-icons/fa";
import "./CustomImagePicker.css";

const CustomImagePicker = ({ onImagesSelect, result }) => {
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (result) {
      setPreviews([]);
    }
  }, [result]);

  useEffect(() => {
    console.log("🧩 onImagesSelect prop:", onImagesSelect);
  }, [onImagesSelect]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);

      // Seçilen dosyaları geri bildir
      if (typeof onImagesSelect === "function") {
        onImagesSelect(files);
      }
    }
  };

  const handleRemoveImage = (index) => {
    setPreviews((prev) => {
      const updated = [...prev];
      const removed = updated.splice(index, 1)[0];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return updated;
    });
  };

  return (
    <div className="custom-image-picker-multiple">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        style={{ display: "none" }}
      />

      {previews.length > 0 ? (
        <div className="image-grid">
          {previews.map((item, index) => (
            <div key={index} className="image-item">
              <img src={item.url} alt={`Preview ${index}`} />
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
              >
                <FaTimes />
              </button>
            </div>
          ))}
          <div className="image-item add-more" onClick={handleClick}>
            <FaCamera className="upload-icon" />
            <p>Add</p>
          </div>
        </div>
      ) : (
        <div className="upload-placeholder" onClick={handleClick}>
          <FaCamera className="upload-icon" />
          <p>Click to upload images</p>
        </div>
      )}
    </div>
  );
};

export default CustomImagePicker;
