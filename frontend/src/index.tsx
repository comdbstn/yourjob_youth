import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";

import "./styles/globals.css";
import "./styles/styleguide.css";
import "./styles/nice-select.css";

// ✅ Swiper 라이브러리
import "../public/css/swiper-bundle.css";
import { AlertProvider } from "./contexts/AlertContext";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  <HelmetProvider>
    <Provider store={store}>
      <AlertProvider>
        <App />
      </AlertProvider>
    </Provider>
  </HelmetProvider>
);
