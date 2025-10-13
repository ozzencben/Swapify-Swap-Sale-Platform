import { useContext } from "react";
import AuthContext from "../../context/auth/AuthContext";
import "./Home.css";

const Home = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="home-container">
      <h1>Home</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Home;
