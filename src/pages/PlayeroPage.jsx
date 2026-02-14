import React from "react";
import FilaProducto from "../components/FilaProducto";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";

function PlayeroPage() {
  const { usuario } = useAuth();
  const {
    productos,
    actualizarProducto,
    finalizarTurno,
    observaciones,
    setObservaciones,
    hitosHora,
  } = useStock();

  if (!usuario) return <div>Cargando...</div>;

  return (
    <div className="container-responsive" style={{ fontFamily: "sans-serif" }}>
      <header
        style={{
          display: "flex",
          flexDirection: "column", // Cambio a columna
          alignItems: "center",     // Centrar horizontalmente el H1
          marginBottom: "20px",
          borderBottom: "1px solid #eee",
          paddingBottom: "10px"
        }}
      >
        <h1 style={{ margin: "0 0 10px 0", textAlign: "center" }}>YPF - Turno {usuario.turno}</h1>
        
        <div style={{ width: "100%", textAlign: "left" }}> {/* Contenedor ancho completo, texto a la izquierda */}
          <strong>Responsables:</strong> {usuario.resp1} {usuario.resp2 ? `y ${usuario.resp2}` : ""}
          <br />
          <small>Fecha: {usuario.fecha}</small> <br />
          {hitosHora?.inicioControl && (
            <small style={{ color: "green", fontWeight: "bold" }}>
              ✅ Control de Inicio: {hitosHora.inicioControl}
            </small>
          )}
        </div>
      </header>

      <div className="table-responsive">
        <table
          border="1"
          style={{ width: "100%", borderCollapse: "collapse", minWidth: "100%" }}
        >
          <thead style={{ backgroundColor: "#0056b3", color: "white" }}>
            <tr>
              <th style={{ padding: "10px", textAlign: "left" }}>Producto</th>
              <th style={{ padding: "10px", backgroundColor: "#004085" }}>Cierre Ant.</th>
              <th style={{ padding: "10px" }}>Inic (Físico)</th>
              <th style={{ padding: "10px" }}>Repo</th>
              <th style={{ padding: "10px" }}>Vta</th>
              <th style={{ padding: "10px" }}>Fin</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <FilaProducto
                key={p.id}
                producto={p}
                stockIdeal={p.stockIdeal}
                onChange={actualizarProducto}
                inicioBloqueado={!!hitosHora.inicioControl}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>
          <strong>Observaciones del turno:</strong>
        </label>{" "}
        <br />
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Ej: Faltó aceite Elaion por falta de stock..."
          style={{ 
            width: "100%", 
            height: "80px", 
            marginTop: "10px", 
            padding: "10px", 
            borderRadius: "4px",
            border: "1px solid #ccc" 
          }}
        />
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={finalizarTurno}
          style={{
            padding: "12px 25px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem"
          }}
        >
          Finalizar Turno
        </button>
      </div>
    </div>
  );
}

export default PlayeroPage;
