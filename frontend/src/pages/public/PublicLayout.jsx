import { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Chrome commun (navbar + footer) partagé par toutes les pages vitrine publiques.
const PublicLayout = ({ children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
