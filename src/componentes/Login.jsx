import React, { useState } from "react";

// Simulamos la lista que vendría de tu base de datos
const EMPLEADOS = ["Juan Perez", "Marta Gomez", "Ricardo Fort", "Elena White"];

function Login({ alIniciarSesion }) {
  // El "cerebro" del formulario: sabe quién está entrando [cite: 2026-01-16]
  const [modo, setModo] = useState("playero");
  const [resp1, setResp1] = useState("");

  const manejarEnvio = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    const datosTurno = {
      rol: modo,
      turno: data.get("turno"),
      resp1: resp1,
      // Si es boxes, el segundo responsable es automático
      resp2: modo === "playero" ? data.get("resp2") : "SISTEMA-BOXES",
      fecha: new Date().toLocaleDateString(),
    };

    alIniciarSesion(datosTurno);
  };

  return (
    <div style={estilos.container}>
      <h2 style={{ textAlign: "center" }}>YPF - Control de Stock</h2>

      {/* SELECTOR DE ROL: Esto es lo que un reclutador miraría con lupa [cite: 2026-01-16] */}
      <div style={estilos.tabContainer}>
        <button
          onClick={() => setModo("playero")}
          style={modo === "playero" ? estilos.tabActive : estilos.tab}
        >
          ⛽ Playero
        </button>
        <button
          onClick={() => setModo("boxes")}
          style={modo === "boxes" ? estilos.tabActive : estilos.tab}
        >
          🛠️ Boxes
        </button>
      </div>

      <form onSubmit={manejarEnvio} style={estilos.form}>
        {/* 1. SECCIÓN DINÁMICA DE TURNO/HORARIO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>{modo === "playero" ? "Turno:" : "Horario de Ingreso:"}</label>
          {modo === "playero" ? (
            <select name="turno" style={estilos.input} required>
              <option value="Turno 1">Turno 1</option>
              <option value="Turno 2">Turno 2</option>
              <option value="Turno 3">Turno 3</option>
            </select>
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

        {/* 2. RESPONSABLE 1 (Encargado) */}
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
          {EMPLEADOS.map((emp) => (
            <option key={emp} value={emp}>
              {emp}
            </option>
          ))}
        </select>

        {/* 3. RESPONSABLE 2 (Solo Playero) */}
        {modo === "playero" && (
          <>
            <label>Responsable 2:</label>
            <select name="resp2" style={estilos.input} required>
              <option value="">Seleccionar...</option>
              {EMPLEADOS.filter((emp) => emp !== resp1).map((emp) => (
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
      </form>
    </div>
  );
}

// Estilos rápidos para que no se vea feo
const estilos = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: "sans-serif",
  },
  tabContainer: { display: "flex", marginBottom: "20px" },
  tab: {
    flex: 1,
    padding: "10px",
    cursor: "pointer",
    background: "#f0f0f0",
    border: "none",
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
  },
};

export default Login;
