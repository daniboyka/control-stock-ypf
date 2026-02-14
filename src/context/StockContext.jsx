import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { PRODUCTOS_INICIALES, EMPLEADOS as EMPLEADOS_INICIALES } from "../data/mockData";
import { useAuth } from "./AuthContext";
import { calcularNuevoEstadoProducto } from "../utils/stockLogic";

const StockContext = createContext();

export function StockProvider({ children }) {
  const { usuario, logout } = useAuth();
  
  // Cargar turno actual desde localStorage o iniciar en 1
  const [turnoActual, setTurnoActual] = useState(() => {
    const saved = localStorage.getItem("turnoActual");
    return saved ? Number(saved) : 1;
  });

  // Cargar empleados desde localStorage o usar iniciales
  const [empleados, setEmpleados] = useState(() => {
    const saved = localStorage.getItem("empleados");
    return saved ? JSON.parse(saved) : EMPLEADOS_INICIALES;
  });

  // Cargar historial de turnos
  const [historialTurnos, setHistorialTurnos] = useState(() => {
    const saved = localStorage.getItem("historialTurnos");
    return saved ? JSON.parse(saved) : [];
  });

  // Cargar productos desde localStorage o usar iniciales
  const [productos, setProductos] = useState(() => {
    const saved = localStorage.getItem("productos");
    if (saved) {
      return JSON.parse(saved);
    }
    return PRODUCTOS_INICIALES.map((p) => ({
      ...p,
      inic: "",
      repo: "",
      vta: "",
    }));
  });

  // Persistir productos cada vez que cambian
  useEffect(() => {
    localStorage.setItem("productos", JSON.stringify(productos));
  }, [productos]);

  // Persistir turno actual
  useEffect(() => {
    localStorage.setItem("turnoActual", turnoActual);
  }, [turnoActual]);

  // Persistir empleados
  useEffect(() => {
    localStorage.setItem("empleados", JSON.stringify(empleados));
  }, [empleados]);

  // Persistir historial
  useEffect(() => {
    localStorage.setItem("historialTurnos", JSON.stringify(historialTurnos));
  }, [historialTurnos]);

  // Cargar fecha de corte de reposición por producto (para Boxes)
  // Estructura: { productoId: timestamp }
  const [cortesReposicion, setCortesReposicion] = useState(() => {
    const saved = localStorage.getItem("cortesReposicion");
    return saved ? JSON.parse(saved) : {};
  });

  // Persistir cortes de reposición
  useEffect(() => {
    localStorage.setItem("cortesReposicion", JSON.stringify(cortesReposicion));
  }, [cortesReposicion]);

  // Función para marcar que se ha realizado una reposición (resetea el contador visual)
  const confirmarReposicion = (productoId) => {
    setCortesReposicion((prev) => ({
      ...prev,
      [productoId]: new Date().toISOString()
    }));
  };

  // Función para confirmar reposición de TODOS los productos al salir de Boxes
  const confirmarReposicionGlobal = () => {
    const ahora = new Date().toISOString();
    setCortesReposicion((prev) => {
      const nuevoEstado = { ...prev };
      productos.forEach((p) => {
        nuevoEstado[p.id] = ahora;
      });
      return nuevoEstado;
    });
  };

  // Función para cancelar/resetear todas las reposiciones (vuelve a mostrar todas las ventas acumuladas)
  const cancelarCortesReposicion = () => {
    setCortesReposicion({});
    localStorage.removeItem("cortesReposicion");
  };

  const [observaciones, setObservaciones] = useState("");
  const [logsAuditoria, setLogsAuditoria] = useState([]); // Nuevo estado para logs
  
  const [hitosHora, setHitosHora] = useState({
    inicioControl: null,
    finControl: null,
  });

  // Gestión de empleados
  const agregarEmpleado = (nombre) => {
    if (!empleados.includes(nombre)) {
      setEmpleados([...empleados, nombre]);
    }
  };

  const eliminarEmpleado = (nombre) => {
    setEmpleados(empleados.filter((e) => e !== nombre));
  };

  // Función para resetear todo el sistema (Solo Admin)
  const resetTotal = () => {
    // 1. Limpiar estados
    setTurnoActual(1);
    setEmpleados(EMPLEADOS_INICIALES);
    setHistorialTurnos([]);
    setProductos(PRODUCTOS_INICIALES.map((p) => ({
      ...p,
      inic: "",
      repo: "",
      vta: "",
    })));
    setObservaciones("");
    setHitosHora({ inicioControl: null, finControl: null });

    // 2. Limpiar LocalStorage
    localStorage.removeItem("turnoActual");
    localStorage.removeItem("empleados");
    localStorage.removeItem("historialTurnos");
    localStorage.removeItem("productos");
    localStorage.removeItem("cortesReposicion");
    
    // Opcional: Recargar la página para asegurar limpieza total
    // window.location.reload(); 
  };

  // Efecto para detectar cuando se completa la carga del inicio (todos los datos)
  useEffect(() => {
    const todosDatosCargados = productos.every(
      (p) => p.inic !== "" && p.inic !== null
    );

    if (todosDatosCargados && !hitosHora.inicioControl && productos.length > 0) {
      setHitosHora((prev) => ({
        ...prev,
        inicioControl: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    }
  }, [productos, hitosHora.inicioControl]);

  const actualizarProducto = (id, campo, valor) => {
    // Buscamos el producto actual para aplicar la lógica de negocio
    const productoActual = productos.find((p) => p.id === id);
    if (!productoActual) return;

    try {
      // Delegamos el cálculo a la función pura de lógica de negocio
      const { productoActualizado, logAuditoria, alerta } = calcularNuevoEstadoProducto(
        productoActual,
        campo,
        valor
      );

      // 1. Actualizamos el estado del producto (Ventas y Repo calculada)
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? productoActualizado : p))
      );

      // 2. Si hubo transacción (venta), guardamos log
      if (logAuditoria) {
        setLogsAuditoria((prev) => [logAuditoria, ...prev]);
        console.log("📝 AUDITORÍA:", logAuditoria);
      }

      // 3. Notificación de excepción (Umbral bajo)
      if (alerta) {
        console.warn(alerta.mensaje);
        // Opcional: Podríamos mostrar un toast/alert aquí si se desea interrupción
      }

    } catch (error) {
      // Manejo robusto de errores (ej. Stock negativo)
      alert("⛔ ERROR: " + error.message);
      // No actualizamos el estado si hay error lógico
    }
  };

  // 🔄 Sincronización entre pestañas (Real-time local)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "productos" && e.newValue) {
        setProductos(JSON.parse(e.newValue));
      } else if (e.key === "turnoActual" && e.newValue) {
        setTurnoActual(Number(e.newValue));
      } else if (e.key === "empleados" && e.newValue) {
        setEmpleados(JSON.parse(e.newValue));
      } else if (e.key === "historialTurnos" && e.newValue) {
        setHistorialTurnos(JSON.parse(e.newValue));
      }
      // Si se detecta un borrado de claves críticas (Reset Total), recargar para limpiar estado
      else if ((e.key === "turnoActual" || e.key === "productos") && e.newValue === null) {
        window.location.reload();
      }
      else if (e.key === "cortesReposicion" && e.newValue) {
        setCortesReposicion(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const finalizarTurno = () => {
    // 1. VALIDACIÓN PREVIA: Verificar que todos los datos estén cargados
    const productosIncompletos = productos.filter((p) => {
      // Inic, Repo y Vta deben tener algún valor (aunque sea 0)
      // Usamos trim() si es string para evitar espacios vacíos
      const inic = String(p.inic).trim();
      const repo = String(p.repo).trim();
      const vta = String(p.vta).trim();
      
      return inic === "" || repo === "" || vta === "";
    });

    if (productosIncompletos.length > 0) {
      alert(`⚠️ NO SE PUEDE FINALIZAR EL TURNO\n\nFaltan datos en los siguientes productos:\n${productosIncompletos.map(p => `- ${p.nombre}`).join("\n")}\n\nPor favor, complete Inic, Repo y Vta para todos.`);
      return false;
    }

    // Ya no verificamos discrepancias de stock final vs ideal para alertar.
    // Solo pedimos confirmación simple.
    let mensaje = "¿Deseas finalizar el turno?";

    if (window.confirm(mensaje)) {
      const datosTurnoFinalizado = {
        id: crypto.randomUUID(),
        timestamp: Date.now(), // Guardamos timestamp exacto para comparaciones futuras
        fecha: new Date().toLocaleDateString("es-ES"),
        horaCierre: new Date().toLocaleTimeString(),
        usuario,
        turno: turnoActual,
        productos: [...productos], // Copia del estado actual
        hitos: hitosHora,
        observaciones,
      };

      console.log("DATOS FINALES ENVIADOS:", datosTurnoFinalizado);

      // Guardar en historial
      setHistorialTurnos((prev) => [datosTurnoFinalizado, ...prev]);

      // Preparar datos para el siguiente turno
      const siguienteTurno = turnoActual === 3 ? 1 : turnoActual + 1;
      
      const nuevosProductos = productos.map((p) => {
        const inicial = Number(p.inic) || 0;
        const reposicion = Number(p.repo) || 0;
        const ventas = Number(p.vta) || 0;
        
        // El stock final de este turno es: Inic + Repo - Vta
        // Este valor será el 'stockFisicoAnterior' del siguiente turno
        const stockFinal = inicial + reposicion - ventas;

        return {
          ...p,
          stockFisicoAnterior: stockFinal, // Actualizamos el cierre anterior
          inic: "", // Reseteamos contadores
          repo: "",
          vta: "",
        };
      });

      // Guardar y resetear
      setProductos(nuevosProductos);
      setTurnoActual(siguienteTurno);
      setObservaciones("");
      setHitosHora({ inicioControl: null, finControl: null });
      
      alert(`Turno finalizado con éxito. Iniciando Turno ${siguienteTurno}.`);
      logout(); // Cerrar sesión
      return true;
    }
    return false;
  };

  const value = useMemo(() => ({
    productos,
    actualizarProducto,
    hitosHora,
    observaciones,
    setObservaciones,
    finalizarTurno,
    turnoActual,
    empleados,
    agregarEmpleado,
    eliminarEmpleado,
    historialTurnos,
    resetTotal,
    logsAuditoria,
    cortesReposicion,
    confirmarReposicion,
    confirmarReposicionGlobal,
    cancelarCortesReposicion,
  }), [
    productos,
    hitosHora,
    observaciones,
    turnoActual,
    empleados,
    historialTurnos,
    logsAuditoria,
    cortesReposicion
  ]);

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock debe usarse dentro de un StockProvider");
  }
  return context;
}