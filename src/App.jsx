import { useState } from "react";
import Login from "./componentes/Login";
import FilaProducto from "./componentes/FilaProducto";
import { PRODUCTOS_INICIALES } from "./datos.mock.js";

function App() {
  const [sesion, setSesion] = useState(null);
  const [observaciones, setObservaciones] = useState(""); // 1. Nuevo estado para notas [cite: 2026-01-16]
  // Creamos el estado para todos los productos basados en el MOCK [cite: 2026-01-16]
  const [productos, setProductos] = useState(
    PRODUCTOS_INICIALES.map((p) => ({
      ...p,
      inic: "",
      repo: "",
      vta: "",
    })),
  );

  if (!sesion) {
    return <Login alIniciarSesion={(datos) => setSesion(datos)} />;
  }

  // Función para que el hijo le avise al padre cuando un input cambia [cite: 2026-01-16]
  const actualizarProducto = (id, campo, valor) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)),
    );
  };

  const manejarFinalizarTurno = () => {
    // 1. Buscamos si hay algún producto que no cierre [cite: 2026-01-16]
    const productosConDiscrepancia = productos.filter((p) => {
      const final =
        (Number(p.inic) || 0) + (Number(p.repo) || 0) - (Number(p.vta) || 0);
      const ideal = p.stockIdealActual || p.stockIdealBase;
      return final + (Number(p.vta) || 0) !== ideal;
      // O más simple: si el stock físico + reposición no iguala al ideal esperado [cite: 2026-01-16]
    });

    let mensaje = "¿Deseas finalizar el turno?";

    // 2. Si hay errores, cambiamos el mensaje [cite: 2026-01-16]
    if (productosConDiscrepancia.length > 0) {
      mensaje = `⚠️ ATENCIÓN: Hay ${productosConDiscrepancia.length} productos que no coinciden con el stock ideal. 
    
¿Confirmaste que las ventas y reposiciones estén bien cargadas?`;
    }

    if (window.confirm(mensaje)) {
      console.log("DATOS FINALES LISTOS PARA ENVIAR:", {
        fecha: new Date().toLocaleDateString(),
        sesion,
        productos,
        observaciones,
      });
      // Aquí es donde mandaremos los datos a Supabase [cite: 2026-01-16]
      alert("Turno finalizado con éxito. Datos listos para la base de datos.");
      setSesion(null);
      setObservaciones("");
    }
  };

  return (
    <div className="container">
      <header
        style={{
          marginBottom: "20px",
          borderBottom: "2px solid #ffcc00",
          paddingBottom: "10px",
        }}
      >
        <h1>YPF - {sesion.turno}</h1>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>
            <strong>Responsables:</strong> {sesion.resp1} y {sesion.resp2}
          </p>
          <p>
            <strong>Inicio:</strong> {sesion.horaInicio}
          </p>
        </div>
      </header>

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th>Producto</th>
            <th>Inic (Físico)</th>
            <th>Repo</th>
            <th>Vta</th>
            <th>Fin</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((prod) => (
            <FilaProducto
              key={prod.id}
              producto={prod}
              stockAnterior={prod.stockIdealActual || prod.stockIdealBase}
              onChange={actualizarProducto} // Le pasamos el "teléfono" para que nos avise [cite: 2026-01-16]
            />
          ))}
        </tbody>
      </table>

      {/* 3. Módulo de Observaciones [cite: 2026-01-16] */}
      <div style={{ marginTop: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}
        >
          Observaciones del turno:
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Ej: Faltó aceite Elaion por falta de stock en depósito..."
          style={{
            width: "100%",
            height: "80px",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <footer style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={manejarFinalizarTurno}
          style={{
            backgroundColor: "#e11d48",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Finalizar Turno
        </button>

        {/* Botón extra para imprimir que usaremos después [cite: 2026-01-16] */}
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Imprimir Reporte
        </button>
      </footer>
    </div>
  );
}

export default App;
