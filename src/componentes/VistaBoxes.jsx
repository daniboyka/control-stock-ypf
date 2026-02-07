import React from "react";

function VistaBoxes({ productos, alCambiarRepo, alFinalizar }) {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#0056b3" }}>🛠️ Panel de Reposición - Boxes</h2>
      <p>Cargue las unidades que está dejando en el exhibidor.</p>

      <table
        border="1"
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}
      >
        <thead style={{ backgroundColor: "#212529", color: "white" }}>
          <tr>
            <th>Producto</th>
            <th>Stock Actual</th>
            <th>Cargar Reposición</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: "10px" }}>
                <strong>{p.nombre}</strong>
              </td>
              <td style={{ textAlign: "center" }}>
                {/* Stock que hay en el estante antes de que Boxes reponga [cite: 2026-01-16] */}
                {Number(p.inic) - Number(p.vta)}
              </td>
              <td style={{ textAlign: "center" }}>
                <input
                  type="number"
                  min="0"
                  value={p.repo}
                  onChange={(e) => {
                    const valorLimpio = e.target.value.replace(/[^0-9]/g, "");
                    alCambiarRepo(p.id, "repo", valorLimpio);
                  }}
                  style={{ width: "80px", padding: "5px", fontSize: "16px" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={alFinalizar}
        style={{
          marginTop: "20px",
          padding: "12px 25px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Guardar y Salir
      </button>
    </div>
  );
}

export default VistaBoxes;
