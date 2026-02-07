import { useState, useEffect } from "react";
import Login from "./componentes/Login.jsx";
import VistaPlayero from "./componentes/VistaPlayero.jsx"; // ¡Faltaba esta importación! [cite: 2026-01-16]
import VistaBoxes from "./componentes/VistaBoxes.jsx"; // ¡Y esta también! [cite: 2026-01-16]
import { PRODUCTOS_INICIALES } from "./datos.mock.js";

function App() {
  const [usuario, setUsuario] = useState(null); // Usaremos 'usuario' para todo [cite: 2026-01-16]
  const [observaciones, setObservaciones] = useState("");
  // 1. Agregamos un estado para guardar las horas de los hitos [cite: 2026-01-16]
  const [hitosHora, setHitosHora] = useState({
    inicioControl: null,
    finControl: null,
  });

  const [productos, setProductos] = useState(
    PRODUCTOS_INICIALES.map((p) => ({
      ...p,
      inic: "",
      repo: "",
      vta: "",
    })),
  );

  // 2. Efecto para detectar cuando terminan de cargar el inicio [cite: 2026-01-16]
  useEffect(() => {
    // Verificamos que todos los productos tengan algo escrito en 'inic'
    const todosCargados = productos.every(
      (p) => p.inic !== "" && p.inic !== null,
    );

    if (todosCargados && !hitosHora.inicioControl && productos.length > 0) {
      setHitosHora((prev) => ({
        ...prev,
        inicioControl: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    }
  }, [productos, hitosHora.inicioControl]);

  const manejarLogin = (datosDelTurno) => {
    setUsuario(datosDelTurno);
  };

  const actualizarProducto = (id, campo, valor) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)),
    );
  };

  const manejarFinalizarTurno = () => {
    const productosConDiscrepancia = productos.filter((p) => {
      // Forzamos a que todo sea número antes de operar
      const inicial = Number(p.inic) || 0;
      const reposicion = Number(p.repo) || 0;
      const ventas = Number(p.vta) || 0;

      // El stock que queda físicamente en el estante
      const stockFisicoFinal = inicial + reposicion - ventas;

      // El stock que DEBERÍA haber según el sistema
      const idealEsperado = Number(p.stockIdealActual || p.stockIdealBase);

      // Solo hay error si el stock físico final NO es igual al ideal esperado
      return stockFisicoFinal !== idealEsperado;
    });

    let mensaje = "¿Deseas finalizar el turno?";

    if (productosConDiscrepancia.length > 0) {
      // Esto te ayudará a ver en consola exactamente qué producto falla y por qué [cite: 2026-01-16]
      console.log("Productos con error:", productosConDiscrepancia);
      mensaje = `⚠️ ATENCIÓN: Hay ${productosConDiscrepancia.length} productos que no coinciden con el stock ideal.`;
    }

    if (window.confirm(mensaje)) {
      console.log("DATOS FINALES ENVIADOS:", {
        usuario,
        productos,
        hitos: hitosHora,
      });
      alert("Turno finalizado con éxito.");
      setUsuario(null);
      setObservaciones("");
      setHitosHora({ inicioControl: null, finControl: null });
    }
  };

  return (
    <div className="App">
      {!usuario ? (
        <Login alIniciarSesion={manejarLogin} />
      ) : usuario.rol === "playero" ? (
        <VistaPlayero
          usuario={usuario}
          productos={productos}
          actualizarProducto={actualizarProducto}
          alFinalizarTurno={manejarFinalizarTurno}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          hitosHora={hitosHora}
        />
      ) : (
        <VistaBoxes
          productos={productos}
          alCambiarRepo={actualizarProducto}
          alFinalizar={() => setUsuario(null)}
        />
      )}
    </div>
  );
}

export default App;
