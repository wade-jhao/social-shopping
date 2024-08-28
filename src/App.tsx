import { Suspense, useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { routeList } from "router";
import { renderRoutes } from "utils";
import "./App.scss";
import ErrorBoundary from "@components/CustomErrorBoundary";
import ErrorBlock from "@components/ErrorBlock";

interface ErrorInfo {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

function App() {
  const [error, setError] = useState<ErrorInfo | null>(null);

  useEffect(() => {
    const handleError = (
      message: string | Event,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ): boolean => {
      // Check if message is an instance of ErrorEvent to handle different event types
      if (message instanceof ErrorEvent) {
        setError({
          message: message.message,
          source: message.filename,
          lineno: message.lineno,
          colno: message.colno,
          error: message.error,
        });
      } else {
        setError({ message: message.toString() });
      }
      return true; // Prevent the firing of the default event handler
    };

    window.onerror = handleError;

    // Cleanup the event listener when the component unmounts
    return () => {
      window.onerror = null;
    };
  }, []);

  if (error) {
    return <ErrorBlock error={error} />;
  }

  return (
    <ErrorBoundary fallback={ErrorBlock}>
      <div className="App">
        <Router>
          <Suspense fallback={<CircularProgress />}>
            <Routes>
              {renderRoutes(routeList)}
              <Route path="*" element={<Navigate to={"/home"} replace />} />
            </Routes>
          </Suspense>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;
