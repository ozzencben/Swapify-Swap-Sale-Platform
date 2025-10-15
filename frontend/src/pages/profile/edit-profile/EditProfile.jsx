import { useContext, useEffect, useState } from "react";
import { CiCamera, CiUser } from "react-icons/ci";
import Loader from "../../../components/loader/Loader";
import AuthContext from "../../../context/auth/AuthContext";
import {
  createAddress,
  deleteAddress,
  getUserAddresses,
  updateAddress,
} from "../../../services/address";
import { updateUser } from "../../../services/auth";
import "./EditProfile.css";

const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // User info states
  const [firstname, setFirstname] = useState(user?.firstname || "");
  const [lastname, setLastname] = useState(user?.lastname || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Profile image
  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState(user?.profile_image || "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // Address info states
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    province: "",
    district: "",
    neighborhood: "",
    street: "",
    building_number: "",
    apartment_number: "",
    postal_code: "",
    address_note: "",
  });

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const res = await getUserAddresses();
        const data = Array.isArray(res) ? res : res.addresses || [];
        setAddresses(data);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  // Update user profile
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("firstname", firstname);
      formData.append("lastname", lastname);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("phone", phone);
      if (profileFile) formData.append("profile_image", profileFile);

      const res = await updateUser(formData);
      if (res.success) {
        setUser(res.user);
        alert("Profile updated successfully!");
        setProfileFile(null);
      }
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new address
  const handleAddAddress = async () => {
    try {
      setLoading(true);
      const res = await createAddress(newAddress);
      if (res.success) {
        setAddresses((prev) => [res.address, ...prev]);
        setNewAddress({
          province: "",
          district: "",
          neighborhood: "",
          street: "",
          building_number: "",
          apartment_number: "",
          postal_code: "",
          address_note: "",
        });
      }
    } catch (error) {
      console.error("Address creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (id) => {
    try {
      setLoading(true);
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    } catch (error) {
      console.error("Address deletion failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Edit address note (prompt for quick edit)
  const handleEditAddress = (addr) => {
    const updated = prompt(
      "Enter a new address note (leave blank to remove):",
      addr.address_note || ""
    );
    if (updated !== null) {
      handleUpdateAddress(addr.id, { address_note: updated });
    }
  };

  const handleUpdateAddress = async (id, updatedFields) => {
    try {
      setLoading(true);
      const res = await updateAddress(id, updatedFields);
      if (res.success) {
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === id ? res.address : addr))
        );
      }
    } catch (error) {
      console.error("Address update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="edit-profile-container">
      {/* ---------- USER INFO SECTION ---------- */}
      <div className="profile-section">
        <h2>Profile Information</h2>
        <div className="profile-info-box">
          <div className="profile-image">
            <label htmlFor="profileUpload" className="upload-label">
              {preview ? (
                <img src={preview} alt="Profile" className="pp" />
              ) : (
                <div className="pp-box">
                  <CiUser />
                </div>
              )}
              <div className="upload-overlay">
                <CiCamera />
              </div>
            </label>
            <input
              id="profileUpload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-fields">
            <input
              type="text"
              placeholder="First name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button className="save-btn" onClick={handleUpdateProfile}>
            Save Changes
          </button>
        </div>
      </div>

      {/* ---------- ADDRESS SECTION ---------- */}
      <div className="address-section">
        <h2>Addresses</h2>

        <div className="address-form">
          {Object.keys(newAddress).map((key) => (
            <input
              key={key}
              type="text"
              placeholder={key.replace("_", " ")}
              value={newAddress[key]}
              onChange={(e) =>
                setNewAddress({ ...newAddress, [key]: e.target.value })
              }
            />
          ))}
          <button className="add-btn" onClick={handleAddAddress}>
            Add New Address
          </button>
        </div>

        <div className="address-list">
          <h3>Saved Addresses</h3>
          {addresses.length > 0 ? (
            addresses.map((addr) => (
              <div key={addr.id} className="address-card">
                <p>
                  <strong>{addr.province}</strong> / {addr.district}
                </p>
                <p>
                  {addr.neighborhood}, {addr.street}, No: {addr.building_number}
                  {addr.apartment_number && ` / Apt ${addr.apartment_number}`}
                </p>
                {addr.postal_code && <p>Postal Code: {addr.postal_code}</p>}
                {addr.address_note && <p>Note: {addr.address_note}</p>}
                <div className="address-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditAddress(addr)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-address">No saved addresses found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
