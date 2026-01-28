import React from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import FieldExtension from "../../pages/FieldExtension";
import ErrorBoundary from "components/ErrorBoundary";
import "@contentstack/venus-components/build/main.css";
import "./styles.scss";

const getRouter = (): typeof BrowserRouter | typeof HashRouter => {
  const { hash } = window.location;

  // Check if URL has a hash-based path (e.g., /#/field-extension)
  if (hash && hash.startsWith("#/")) {
    return HashRouter;
  }

  return BrowserRouter;
};

const Router = getRouter();

const App: React.FC = () => {
  return (
    <div className="app">
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/field-extension" element={<FieldExtension />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </div>
  );
};

export default App;
