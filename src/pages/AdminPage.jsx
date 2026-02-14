import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStock } from "../context/StockContext";
import { useNavigate } from "react-router-dom";
import { generarHtmlReporteTurno } from "../utils/printGenerator";

function AdminPage() {
  const { logout } = useAuth();
  const { 
    historialTurnos, 
    empleados, 
    agregarEmpleado, 
    eliminarEmpleado,
    productos,
    actualizarProducto,
    turnoActual,
    resetTotal
  } = useStock();
  const navigate = useNavigate();

  const [tab, setTab] = useState("historial");
  const [nuevoEmpleado, setNuevoEmpleado] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleReset = () => {
    if (window.confirm("🚨 ¡PELIGRO! 🚨\n\n¿Estás seguro de que deseas BORRAR TODO el sistema?\n\nSe eliminarán:\n- Historial de turnos\n- Empleados agregados\n- Stock actual\n- Datos del turno en curso\n\nEl sistema volverá al Turno 1 con los valores iniciales.")) {
      if (window.confirm("⚠️ CONFIRMACIÓN FINAL ⚠️\n\nEsta acción NO se puede deshacer.\n\n¿Realmente deseas reiniciar el sistema de fábrica?")) {
        resetTotal();
        alert("El sistema ha sido reiniciado correctamente.");
        logout();
        navigate("/");
      }
    }
  };

  const handleAgregarEmpleado = (e) => {
    e.preventDefault();
    if (nuevoEmpleado.trim()) {
      agregarEmpleado(nuevoEmpleado.trim());
      setNuevoEmpleado("");
    }
  };

  const handleImprimirTurno = (turno) => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    const htmlContent = generarHtmlReporteTurno(turno);

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Esperar un momento para que carguen estilos (aunque aquí son inline)
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  // Helper para validación de inputs
  const validarInput = (valor, permitirCeroInicial = false) => {
    // 1. Solo números
    let limpio = valor.replace(/[^0-9]/g, "");
    
    // 2. Sin ceros a la izquierda (salvo que sea solo "0" y se permita, o mientras se escribe)
    if (!permitirCeroInicial && limpio.length > 1 && limpio.startsWith("0")) {
      limpio = limpio.replace(/^0+/, "");
    }
    
    return limpio;
  };

  return (
    <div className="container-responsive" style={{ fontFamily: "sans-serif" }}>
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px",
        borderBottom: "2px solid #343a40",
        paddingBottom: "10px"
      }}>
        <h1>Panel de Administración</h1>
      </header>

      <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
        <button 
          onClick={() => setTab("historial")}
          style={tab === "historial" ? styles.tabActive : styles.tab}
        >
          📜 Historial de Turnos
        </button>
        <button 
          onClick={() => setTab("empleados")}
          style={tab === "empleados" ? styles.tabActive : styles.tab}
        >
          👥 Gestión Empleados
        </button>
        <button 
          onClick={() => setTab("correccion")}
          style={tab === "correccion" ? styles.tabActive : styles.tab}
        >
          ✏️ Corregir Stock Actual
        </button>
      </div>

      {tab === "historial" && (
        <div>
          <h3>Historial de Cierres de Turno</h3>
          {historialTurnos.length === 0 ? (
            <p>No hay turnos registrados aún.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {historialTurnos.map((h) => (
                <div key={h.id} style={styles.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong>{h.fecha} - Turno {h.turno}</strong>
                      <span>Cierre: {h.horaCierre}</span>
                    </div>
                    <button 
                      onClick={() => handleImprimirTurno(h)}
                      style={{
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "0.9rem"
                      }}
                      title="Imprimir Reporte"
                    >
                      🖨️ Imprimir
                    </button>
                  </div>
                  <div>
                    <strong>Responsables:</strong> {h.usuario.resp1} {h.usuario.resp2 ? `/ ${h.usuario.resp2}` : ""}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <strong>Observaciones:</strong> <br />
                    {h.observaciones || "Sin observaciones"}
                  </div>
                  
                  <details style={{ marginTop: "10px" }}>
                    <summary style={{ cursor: "pointer", color: "#007bff" }}>Ver Detalle Productos</summary>
                    <div className="table-responsive">
                      <table border="1" style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse", minWidth: "100%" }}>
                        <thead style={{ backgroundColor: "#343a40", color: "white" }}>
                          <tr>
                            <th style={{ padding: "10px", textAlign: "left" }}>Producto</th>
                            <th style={{ padding: "10px", textAlign: "center" }}>Inic</th>
                            <th style={{ padding: "10px", textAlign: "center" }}>Repo</th>
                            <th style={{ padding: "10px", textAlign: "center" }}>Vta</th>
                            <th style={{ padding: "10px", textAlign: "center" }}>Final</th>
                            <th style={{ padding: "10px", textAlign: "center" }}>Ideal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {h.productos.map((p) => {
                            const inic = Number(p.inic) || 0;
                            const repo = Number(p.repo) || 0;
                            const vta = Number(p.vta) || 0;
                            const final = inic + repo - vta;
                            const diff = final - Number(p.stockIdeal);
                            
                            return (
                              <tr key={p.id} style={{ backgroundColor: diff !== 0 ? "#fff3cd" : "white" }}>
                                <td>{p.nombre}</td>
                                <td align="center">{inic}</td>
                                <td align="center">{repo}</td>
                                <td align="center">{vta}</td>
                                <td align="center" style={{ fontWeight: "bold" }}>{final}</td>
                                <td align="center">{p.stockIdeal}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Lista de Alertas (Diferencias Inicio vs Anterior Y Stock Negativo) */}
                    <TurnoAlertas productos={h.productos} />
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "empleados" && (
        <div>
          <h3>Gestión de Responsables</h3>
          <form onSubmit={handleAgregarEmpleado} style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
            <input 
              type="text" 
              value={nuevoEmpleado}
              onChange={(e) => setNuevoEmpleado(e.target.value)}
              placeholder="Nombre del nuevo empleado"
              style={{ padding: "8px", width: "300px" }}
            />
            <button 
              type="submit"
              style={{ padding: "8px 15px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }}
            >
              Agregar
            </button>
          </form>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {empleados.map((emp) => (
              <li key={emp} style={{ 
                padding: "10px", 
                borderBottom: "1px solid #eee", 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: "400px"
              }}>
                {emp}
                <button 
                  onClick={() => eliminarEmpleado(emp)}
                  style={{ color: "red", border: "none", background: "none", cursor: "pointer", fontSize: "1.2rem" }}
                  title="Eliminar"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "correccion" && (
        <div>
          <h3>Corrección de Stock en Tiempo Real (Turno {turnoActual})</h3>
          <p style={{ color: "red" }}>⚠️ Cuidado: Los cambios aquí afectan directamente al turno en curso.</p>
          
          <div className="table-responsive">
            <table border="1" style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", minWidth: "100%" }}>
              <thead style={{ backgroundColor: "#343a40", color: "white" }}>
                <tr>
                  <th style={{ padding: "10px", textAlign: "left" }}>Producto</th>
                  <th style={{ textAlign: "center" }}>Stock Ant.</th>
                  <th style={{ textAlign: "center" }}>Inic (Físico)</th>
                  <th style={{ textAlign: "center" }}>Repo</th>
                  <th style={{ textAlign: "center" }}>Vta</th>
                  <th style={{ textAlign: "center" }}>Ideal</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ padding: "8px" }}>{p.nombre}</td>
                    {/* Stock Ant: No puede iniciar con 0 (salvo que sea 0) */}
                    <td align="center">
                      <input 
                        type="number"
                        min="0" 
                        value={p.stockFisicoAnterior || ""}
                        onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = validarInput(e.target.value, false);
                          actualizarProducto(p.id, "stockFisicoAnterior", val === "" ? 0 : Number(val));
                        }}
                        style={{ width: "50px", textAlign: "center" }}
                      />
                    </td>
                    {/* Inic (Físico): No puede iniciar con 0 (salvo que sea 0) */}
                    <td align="center">
                      <input 
                        type="text" 
                        value={p.inic}
                        onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                           const val = validarInput(e.target.value, false);
                           actualizarProducto(p.id, "inic", val);
                        }}
                        style={{ width: "50px", textAlign: "center" }}
                      />
                    </td>
                    {/* Repo: No negativos */}
                    <td align="center">
                      <input 
                        type="text" 
                        value={p.repo}
                        onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = validarInput(e.target.value, false);
                          actualizarProducto(p.id, "repo", val);
                        }}
                        style={{ width: "50px", textAlign: "center" }}
                      />
                    </td>
                    <td align="center">
                      <input 
                        type="text" 
                        value={p.vta}
                        onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = validarInput(e.target.value, false);
                          actualizarProducto(p.id, "vta", val);
                        }}
                        style={{ width: "50px", textAlign: "center" }}
                      />
                    </td>
                    <td align="center">
                      <input 
                        type="number"
                        min="0"
                        value={p.stockIdeal || ""}
                        onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = validarInput(e.target.value, false);
                          actualizarProducto(p.id, "stockIdeal", val === "" ? 0 : Number(val));
                        }}
                        style={{ width: "50px", textAlign: "center" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem"
              }}
            >
              Guardar y Salir
            </button>
          </div>
        </div>
      )}

      {/* Footer Zona de Peligro y Salida */}
      <div style={{ 
        marginTop: "50px", 
        paddingTop: "20px", 
        borderTop: "2px solid #dc3545", 
        display: "flex", 
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Cerrar Sesión
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{ color: "#dc3545", fontWeight: "bold", marginLeft: "10px" }}>⚠️ ZONA DE PELIGRO:</span>
          <button 
            onClick={handleReset}
            style={{
              backgroundColor: "#ffc107",
              color: "#212529",
              border: "1px solid #e0a800",
              padding: "8px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
            title="Borrar todo y reiniciar sistema"
          >
            Reset Total del Sistema
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  tab: {
    padding: "10px 20px",
    cursor: "pointer",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    marginRight: "5px"
  },
  tabActive: {
    padding: "10px 20px",
    cursor: "pointer",
    backgroundColor: "#343a40",
    color: "white",
    border: "1px solid #343a40",
    marginRight: "5px"
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  }
};

// Componente helper para mostrar alertas de turno
const TurnoAlertas = ({ productos }) => {
  // 1. Diferencias con turno anterior
  const diferencias = productos.filter(p => {
    const inic = Number(p.inic) || 0;
    if (p.stockFisicoAnterior === undefined || p.stockFisicoAnterior === null) return false;
    const anterior = Number(p.stockFisicoAnterior) || 0;
    return p.inic !== "" && inic !== anterior;
  });

  // 2. Stock Final Negativo (Faltante crítico en el turno)
  const stockNegativos = productos.filter(p => {
    const inic = Number(p.inic) || 0;
    const repo = Number(p.repo) || 0;
    const vta = Number(p.vta) || 0;
    const final = inic + repo - vta;
    return final < 0;
  });

  if (diferencias.length === 0 && stockNegativos.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#fee2e2", borderRadius: "4px", border: "1px solid #f5c6cb" }}>
      <strong style={{ color: "#721c24" }}>⚠️ Alertas del Turno:</strong>
      <ul style={{ margin: "5px 0 0 20px", color: "#721c24" }}>
        {diferencias.map(f => {
          const anterior = Number(f.stockFisicoAnterior) || 0;
          const inic = Number(f.inic) || 0;
          const diff = inic - anterior;
          const tipo = diff < 0 ? "Faltante (Inicio vs Anterior)" : "Sobrante (Inicio vs Anterior)";
          return (
            <li key={`diff-${f.id}`}>
              <strong>{f.nombre}</strong>: {tipo} de {Math.abs(diff)} (Anterior: {anterior} vs Actual: {inic})
            </li>
          );
        })}
        {stockNegativos.map(f => {
          const inic = Number(f.inic) || 0;
          const repo = Number(f.repo) || 0;
          const vta = Number(f.vta) || 0;
          const final = inic + repo - vta;
          return (
            <li key={`neg-${f.id}`}>
              <strong>{f.nombre}</strong>: 🛑 FALTANTE CRÍTICO (Stock Final: {final}) - Revisar Ventas/Carga
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AdminPage;
