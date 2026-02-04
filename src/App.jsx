import { useState } from 'react';
import Login from './componentes/Login';
import FilaProducto from './componentes/FilaProducto';
import { PRODUCTOS_INICIALES } from './datos.mock.js';

function App() {
  const [sesion, setSesion] = useState(null);

  // 1. Si no hay sesión, mostramos el Login
  if (!sesion) {
    return <Login alIniciarSesion={(datos) => setSesion(datos)} />;
  }
  
  // 2. Si hay sesión, mostramos la planilla completa
  return (
    <div className="container">
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #ffcc00', paddingBottom: '10px' }}>
        <h1>YPF - {sesion.turno}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p><strong>Responsables:</strong> {sesion.resp1} y {sesion.resp2}</p>
          <p><strong>Inicio:</strong> {sesion.horaInicio}</p>
        </div>
      </header>

      <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>Producto</th>
            <th>Inic (Físico)</th>
            <th>Repo</th>
            <th>Vta</th>
            <th>Fin</th>
          </tr>
        </thead>
        <tbody>
          {PRODUCTOS_INICIALES.map((prod) => (
            <FilaProducto 
              key={prod.id} 
              producto={prod} 
              // Usamos stockIdealActual si Boxes lo cambió, sino el Base
              stockAnterior={prod.stockIdealActual || prod.stockIdealBase} 
            />
          ))}
        </tbody>
      </table>

      <footer style={{ marginTop: '20px' }}>
        {/* Este botón limpia la sesión y vuelve al Login */}
        <button 
          onClick={() => {
            if(window.confirm("¿Estás seguro que deseas cerrar el turno?")) {
              setSesion(null);
            }
          }}
          style={{ backgroundColor: '#e11d48', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Finalizar Turno
        </button>
      </footer>
    </div>
  );
}

export default App;