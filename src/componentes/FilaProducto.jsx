const FilaProducto = ({ producto, stockAnterior, onChange }) => {
  // 1. Ya no usamos useState acá. Usamos lo que viene de "producto" [cite: 2026-01-16]
  const nInic = Number(producto.inic) || 0;
  const nRepo = Number(producto.repo) || 0;
  const nVta = Number(producto.vta) || 0;

  // 🧮 CALCULO AUTOMÁTICO (sigue igual)
  const stockFinalCalculado = nInic + nRepo - nVta;

  // 🚨 ALERTA DE INICIO (sigue igual)
  const alertaInicio = producto.inic !== "" && nInic !== stockAnterior;

  return (
    <tr style={{ backgroundColor: alertaInicio ? "#fee2e2" : "transparent" }}>
      <td style={{ padding: "8px" }}>
        <strong>{producto.nombre}</strong> <br />
        <small style={{ color: "gray" }}>Ideal: {stockAnterior}</small>
      </td>

      {/* Inicio Físico */}
      <td>
        <input
          type="number"
          min="0" // Evita que bajen de 0 con las flechitas
          onKeyDown={(e) => {
            // Si la tecla presionada es el signo menos o la letra 'e' (exponencial), bloqueamos
            if (["-", "e", ".", ","].includes(e.key)) {
              e.preventDefault();
            }
          }}
          value={producto.inic}
          style={{
            width: "60px",
            border: alertaInicio ? "2px solid red" : "1px solid #ccc",
          }}
          // 2. Aquí llamamos a la función del padre [cite: 2026-01-16]
          onChange={(e) => {
            // Reemplazamos cualquier cosa que no sea número por un string vacío
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
          min="0" // Evita que bajen de 0 con las flechitas
          onKeyDown={(e) => {
            // Si la tecla presionada es el signo menos o la letra 'e' (exponencial), bloqueamos
            if (["-", "e", ".", ","].includes(e.key)) {
              e.preventDefault();
            }
          }}
          value={producto.vta}
          style={{ width: "60px" }}
          onChange={(e) => {
            // Reemplazamos cualquier cosa que no sea número por un string vacío
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
