import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";

function LoginPage() {
  const { login } = useAuth();
  const { turnoActual, empleados } = useStock();
  const navigate = useNavigate();
  
  const [modo, setModo] = useState("playero");
  const [resp1, setResp1] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const manejarEnvio = (e) => {
    e.preventDefault();

    if (modo === "admin") {
      if (password === "1234") {
        login({ rol: "admin", nombre: "Administrador" });
        navigate("/admin");
      } else {
        alert("Contraseña incorrecta");
      }
      return;
    }

    const data = new FormData(e.target);
    const datosTurno = {
      rol: modo,
      turno: data.get("turno"),
      resp1: resp1,
      resp2: modo === "playero" ? data.get("resp2") : "SISTEMA-BOXES",
      fecha: new Date().toLocaleDateString("es-ES"),
    };

    login(datosTurno);
    
    // Redirección basada en el rol
    if (modo === "playero") {
      navigate("/playero");
    } else {
      navigate("/boxes");
    }
  };

  return (
    <div style={estilos.container} className="login-container">
      <h2 style={{ textAlign: "center" }}>YPF - Control de Stock</h2>

      <div style={estilos.tabContainer}>
        <button
          onClick={() => setModo("playero")}
          className="tab-button"
          style={modo === "playero" ? estilos.tabActive : estilos.tab}
        >
          ⛽ Playero
        </button>
        <button
          onClick={() => setModo("boxes")}
          className="tab-button"
          style={modo === "boxes" ? estilos.tabActive : estilos.tab}
        >
          🛠️ Boxes&nbsp;&nbsp;
        </button>
        <button
          onClick={() => setModo("admin")}
          className="tab-button"
          style={modo === "admin" ? { ...estilos.tabActive, backgroundColor: "#343a40" } : estilos.tab}
        >
          🔑 Admin&nbsp;&nbsp;
        </button>
      </div>

      <form onSubmit={manejarEnvio} style={estilos.form}>
        {modo === "admin" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label>Contraseña de Administrador:</label>
            <div style={{ display: "flex", position: "relative" }}>
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese clave"
                style={{ ...estilos.input, width: "100%", paddingRight: "40px" }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{
                  position: "absolute",
                  right: "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
                title={mostrarPassword ? "Ocultar clave" : "Ver clave"}
              >
                {mostrarPassword ? "👁️" : "🙈"}
              </button>
            </div>
            <button type="submit" style={{ ...estilos.btnEnviar, backgroundColor: "#343a40" }}>
              Ingresar como ADMIN
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label>{modo === "playero" ? "Turno Actual (Automático):" : "Horario de Ingreso:"}</label>
              {modo === "playero" ? (
                <input
                  type="text"
                  name="turno"
                  value={`Turno ${turnoActual}`}
                  readOnly
                  style={{
                    ...estilos.input,
                    backgroundColor: "#e9ecef",
                    cursor: "not-allowed",
                    fontWeight: "bold"
                  }}
                />
              ) : (
                <input
                  type="text"
                  name="turno"
                  value={
                    new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) + " (Repo)"
                  }
                  readOnly
                  style={{
                    ...estilos.input,
                    backgroundColor: "#e9ecef",
                    cursor: "not-allowed",
                  }}
                />
              )}
            </div>

            <label>
              {modo === "playero" ? "Responsable 1:" : "Encargado Boxes:"}
            </label>
            <select
              value={resp1}
              onChange={(e) => setResp1(e.target.value)}
              style={estilos.input}
              required
            >
              <option value="">Seleccionar...</option>
              {empleados.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>

            {modo === "playero" && (
              <>
                <label>Responsable 2 (Opcional):</label>
                <select name="resp2" style={estilos.input}>
                  <option value="">-- Ninguno --</option>
                  {empleados.filter((emp) => emp !== resp1).map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button type="submit" style={estilos.btnEnviar}>
              Ingresar como {modo.toUpperCase()}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

const estilos = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: "sans-serif",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  tabContainer: { display: "flex", marginBottom: "20px" },
  tab: {
    flex: 1,
    padding: "10px",
    cursor: "pointer",
    background: "#f0f0f0",
    border: "none",
    transition: "background 0.3s"
  },
  tabActive: {
    flex: 1,
    padding: "10px",
    cursor: "pointer",
    background: "#0056b3",
    color: "white",
    border: "none",
    fontWeight: "bold",
  },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" },
  btnEnviar: {
    padding: "10px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
    transition: "background 0.3s"
  },
};

export default LoginPage;
