const FilaProducto = ({ producto, stockIdeal, onChange, inicioBloqueado }) => {
  const nInic = Number(producto.inic) || 0;
  const nRepo = Number(producto.repo) || 0;
  const nVta = Number(producto.vta) || 0;

  // 🧮 CALCULO AUTOMÁTICO
  // Si no se ha ingresado el inicio (producto.inic === ""), mostramos 0 para no confundir con Repo
  const stockFinalCalculado = producto.inic === "" ? 0 : (nInic + nRepo - nVta);

  // 🚨 ALERTA DE INICIO: Comparamos el Físico que cuenta el playero vs el Stock Ideal
  // Si el usuario ya escribió algo (inic !== "") y no coincide con el ideal
  const stockAnterior = producto.stockFisicoAnterior || 0;
  const nIdeal = Number(stockIdeal) || 0;
  const alertaInicio = producto.inic !== "" && nInic !== nIdeal;

  return (
    <tr style={{ backgroundColor: alertaInicio ? "#fee2e2" : "transparent" }}>
      <td style={{ padding: "8px" }}>
        <strong>{producto.nombre}</strong> <br />
        <small style={{ color: "gray" }}>Ideal: {stockIdeal}</small>
      </td>

      {/* Cierre Anterior (Referencia visual inmodificable) */}
      <td style={{ textAlign: "center", backgroundColor: "#e2e3e5", color: "#495057", fontWeight: "bold" }}>
        {stockAnterior}
      </td>

      {/* Inicio Físico */}
      <td>
        <input
          type="number"
          min="0"
          disabled={inicioBloqueado}
          onKeyDown={(e) => {
            if (["-", "e", ".", ","].includes(e.key)) {
              e.preventDefault();
            }
          }}
          value={producto.inic}
          style={{
            width: "60px",
            border: alertaInicio ? "2px solid red" : "1px solid #ccc",
            textAlign: "center",
            backgroundColor: inicioBloqueado ? "#e9ecef" : "white",
            cursor: inicioBloqueado ? "not-allowed" : "text"
          }}
          onChange={(e) => {
            const valorLimpio = e.target.value.replace(/[^0-9]/g, "");
            onChange(producto.id, "inic", valorLimpio);
          }}
        />
      </td>

      {/* Reposición */}
      <td style={{ textAlign: "center", backgroundColor: "#fefce8" }}>
        <span style={{ fontWeight: "bold", color: "#854d0e" }}>
          {producto.repo || 0}
        </span>
      </td>

      {/* Ventas */}
      <td>
        <input
          type="number"
          min="0"
          onKeyDown={(e) => {
            if (["-", "e", ".", ","].includes(e.key)) {
              e.preventDefault();
            }
          }}
          value={producto.vta}
          style={{ width: "60px", textAlign: "center" }}
          onChange={(e) => {
            const valorLimpio = e.target.value.replace(/[^0-9]/g, "");
            onChange(producto.id, "vta", valorLimpio);
          }}
        />
      </td>

      {/* Stock Final (Resultado automático) */}
      <td
        style={{
          fontWeight: "bold",
          textAlign: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        {stockFinalCalculado}
      </td>
    </tr>
  );
};

export default FilaProducto;
