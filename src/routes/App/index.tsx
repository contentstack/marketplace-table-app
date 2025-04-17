import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import FieldExtension from '../../pages/FieldExtension';
import ErrorBoundary from 'components/ErrorBoundary';
import '@contentstack/venus-components/build/main.css';
import './styles.scss';

const App: React.FC = () => {
  return (
    <div className="app">
      <ErrorBoundary>
        <HashRouter>
          <Routes>
            <Route path="/field-extension" element={<FieldExtension />} />
          </Routes>
        </HashRouter>
      </ErrorBoundary>
    </div>
  );
};

export default App;
