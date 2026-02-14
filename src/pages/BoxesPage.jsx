import React, { useMemo } from "react";
import { useStock } from "../context/StockContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function BoxesPage() {
  const { 
    productos, 
    actualizarProducto, 
    historialTurnos, 
    cortesReposicion, 
    confirmarReposicionGlobal
  } = useStock();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Optimización: Calcular ventas acumuladas de una sola vez
  const ventasAcumuladasMap = useMemo(() => {
    const map = {};
    // Inicializar mapa con 0
    productos.forEach(p => map[p.id] = 0);

    historialTurnos.forEach(turno => {
      try {
        // Validaciones básicas del turno
        if (!turno.fecha || !turno.horaCierre) return;
        
        let incluirTurno = false;

        // 1. Verificación por TIMESTAMP (Definitiva)
        if (turno.timestamp) {
          // Si el turno tiene timestamp, verificamos contra cada producto individualmente
          // o optimizamos si asumimos que el corte es global?
          // El corte es per-producto en teoria, pero en UI se hace global.
          // Vamos a iterar productos dentro del turno para ser precisos.
          incluirTurno = true; // Flag temporal, la decisión real es por producto abajo
        } else {
          // 2. Lógica Legacy (Fecha string)
          let fechaTurno;
          if (turno.fecha.includes("/")) {
            const [dia, mes, anio] = turno.fecha.split("/");
            fechaTurno = new Date(`${anio}/${mes}/${dia} ${turno.horaCierre}`);
          } else {
            fechaTurno = new Date(`${turno.fecha} ${turno.horaCierre}`);
          }

          if (!isNaN(fechaTurno.getTime())) {
             // Asignamos una propiedad temporal para usarla abajo
             turno._fechaLegacy = fechaTurno.toISOString();
             incluirTurno = true;
          }
        }

        if (incluirTurno) {
            turno.productos.forEach(prodEnTurno => {
                const productoId = prodEnTurno.id;
                const fechaCorte = cortesReposicion[productoId];
                const cantidad = Number(prodEnTurno.vta) || 0;

                if (cantidad > 0) {
                    let sumar = false;
                    
                    if (turno.timestamp) {
                        const fechaCorteTime = fechaCorte ? new Date(fechaCorte).getTime() : 0;
                        if (turno.timestamp > fechaCorteTime) {
                            sumar = true;
                        }
                    } else if (turno._fechaLegacy) {
                         if (!fechaCorte || turno._fechaLegacy > fechaCorte) {
                             sumar = true;
                         }
                    }

                    if (sumar) {
                        map[productoId] = (map[productoId] || 0) + cantidad;
                    }
                }
            });
        }

      } catch (e) {
        console.warn("Error procesando turno para ventas:", turno, e);
      }
    });

    return map;
  }, [historialTurnos, cortesReposicion, productos]);

  // Helper para validación de inputs
  const validarInput = (valor) => {
    // 1. Solo números
    let limpio = valor.replace(/[^0-9]/g, "");
    
    // 2. Sin ceros a la izquierda (salvo que sea solo "0")
    if (limpio.length > 1 && limpio.startsWith("0")) {
      limpio = limpio.replace(/^0+/, "");
    }
    return limpio;
  };

  const handleFinalizar = () => {
    // Al finalizar, actualizamos la fecha de corte de TODOS los productos
    // para que la próxima vez que se entre a Boxes, el contador empiece de cero.
    
    // CORRECCIÓN: Pedir confirmación explícita para reiniciar los contadores.
    // Si el usuario solo entra a mirar, no debe reiniciar.
    const confirmar = window.confirm(
      "¿Desea marcar los productos como 'REPUESTOS' y reiniciar los contadores de ventas a cero?\n\n" +
      "✅ ACEPTAR: Reinicia contadores y sale.\n" +
      "❌ CANCELAR: Sale SIN reiniciar contadores (mantiene ventas acumuladas)."
    );

    if (confirmar) {
      confirmarReposicionGlobal();
    }
    
    logout();
    navigate("/");
  };

  return (
    <div className="container-responsive" style={{ fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#0056b3", textAlign: "center", marginBottom: "10px" }}>🛠️ Panel de Reposición - Boxes</h1>
      <p style={{ textAlign: "center", marginBottom: "20px" }}>Cargue reposición.</p>

      <div className="table-responsive">
        <table
          border="1"
          style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", minWidth: "100%" }}
        >
        <thead style={{ backgroundColor: "#212529", color: "white" }}>
          <tr>
            <th style={{ padding: "10px", textAlign: "left" }}>Producto</th>
            <th style={{ padding: "10px" }}>Ventas (Turnos Finalizados)</th>
            <th style={{ padding: "10px" }}>Stock Ideal (Objetivo)</th>
            <th style={{ padding: "10px" }}>Cargar Reposición</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: "10px" }}>
                <strong>{p.nombre}</strong>
              </td>
              {/* Ventas Acumuladas */}
              <td style={{ textAlign: "center", backgroundColor: "#e9ecef", fontWeight: "bold" }}>
                {ventasAcumuladasMap[p.id] || 0}
              </td>
              {/* Columna editable para Stock Ideal */}
              <td style={{ textAlign: "center", backgroundColor: "#fff3cd" }}>
                 <input
                  type="number"
                  min="0"
                  value={p.stockIdeal || ""}
                  onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                  onChange={(e) => {
                    const val = validarInput(e.target.value);
                    actualizarProducto(p.id, "stockIdeal", val);
                  }}
                  style={{ width: "80px", padding: "5px", fontSize: "16px", fontWeight: "bold" }}
                />
              </td>
              <td style={{ textAlign: "center" }}>
                <div style={{ display: "flex", gap: "5px", justifyContent: "center", alignItems: "center" }}>
                  <input
                    type="number"
                    min="0"
                    value={p.repo}
                    onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                    onChange={(e) => {
                      const val = validarInput(e.target.value);
                      actualizarProducto(p.id, "repo", val);
                    }}
                    style={{ width: "80px", padding: "5px", fontSize: "16px" }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <button
        onClick={handleFinalizar}
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
        Salir / Confirmar Reposición
      </button>
    </div>
  );
}

export default BoxesPage;
