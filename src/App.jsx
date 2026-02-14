import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StockProvider } from "./context/StockContext";
import LoginPage from "./pages/LoginPage";
import PlayeroPage from "./pages/PlayeroPage";
import BoxesPage from "./pages/BoxesPage";
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StockProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route
                path="/playero"
                element={
                  <ProtectedRoute requiredRole="playero">
                    <PlayeroPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/boxes"
                element={
                  <ProtectedRoute requiredRole="boxes">
                    <BoxesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </StockProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
