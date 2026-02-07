import React from "react";
import FilaProducto from "./FilaProducto";

function VistaPlayero({
  usuario,
  productos,
  actualizarProducto,
  alFinalizarTurno,
  observaciones,
  setObservaciones,
  hitosHora,
}) {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>YPF - {usuario.turno}</h1>
        <div style={{ textAlign: "right" }}>
          <strong>Responsables:</strong> {usuario.resp1} y {usuario.resp2}{" "}
          <br />
          <small>Fecha: {usuario.fecha}</small> <br />
          {/* Si ya se grabó la hora del control, la mostramos [cite: 2026-01-16] */}
          {hitosHora?.inicioControl && (
            <small style={{ color: "green", fontWeight: "bold" }}>
              ✅ Control de Inicio: {hitosHora.inicioControl}
            </small>
          )}
        </div>
      </header>

      <table
        border="1"
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead style={{ backgroundColor: "#0056b3", color: "white" }}>
          <tr>
            <th>Producto</th>
            <th>Inic (Físico)</th>
            <th>Repo</th>
            <th>Vta</th>
            <th>Fin</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <FilaProducto
              key={p.id}
              producto={p}
              stockAnterior={p.stockIdealActual || p.stockIdealBase}
              onChange={actualizarProducto}
            />
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <label>
          <strong>Observaciones del turno:</strong>
        </label>{" "}
        <br />
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Ej: Faltó aceite Elaion por falta de stock..."
          style={{ width: "100%", height: "80px", marginTop: "10px" }}
        />
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={alFinalizarTurno}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Finalizar Turno
        </button>
      </div>
    </div>
  );
}

export default VistaPlayero;
