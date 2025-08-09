import React from "react";
import Footer from "../common/Footer";
import CorpHeader from "../common/CorpHeader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <CorpHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
