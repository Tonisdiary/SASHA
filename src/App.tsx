import React, { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
