import React from 'react';
import ReactDOM from 'react-dom';
import App from './routes/App';
import reportWebVitals from './reportWebVitals';

document.addEventListener('DOMContentLoaded', () => {
  //@ts-ignore
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});

reportWebVitals();
