import React from "react";
import Footer from "../common/Footer";
import Header from "../common/Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        width: "100vw",
        margin: "0 auto",
        overflowX: "hidden",
        minWidth: "1290px",
      }}
    >
      <Header />
      <main style={{ minHeight: "850px" }}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
