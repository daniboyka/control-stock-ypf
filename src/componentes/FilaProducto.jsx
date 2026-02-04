import { useState } from 'react';

const FilaProducto = ({ producto, stockAnterior }) => {
  const [datos, setDatos] = useState({ inic: '', repo: '', vta: '' });

  // Convertimos a número para evitar errores (si está vacío, usamos 0)
  const nInic = Number(datos.inic) || 0;
  const nRepo = Number(datos.repo) || 0;
  const nVta = Number(datos.vta) || 0;

  // 🧮 CALCULO AUTOMÁTICO: La fórmula de YPF
  const stockFinalCalculado = nInic + nRepo - nVta;

  // 🚨 ALERTA 1: ¿Lo que cargó como inicio coincide con lo que debería haber (Ideal)?
  const alertaInicio = datos.inic !== '' && nInic !== stockAnterior;

  return (
    <tr style={{ backgroundColor: alertaInicio ? '#fee2e2' : 'transparent' }}>
      <td style={{ padding: '8px' }}>
        <strong>{producto.nombre}</strong> <br/>
        <small style={{ color: 'gray' }}>Ideal: {stockAnterior}</small>
      </td>
      
      {/* Inicio Físico */}
      <td>
        <input 
          type="number" 
          value={datos.inic}
          style={{ width: '60px', border: alertaInicio ? '2px solid red' : '1px solid #ccc' }}
          onChange={(e) => setDatos({...datos, inic: e.target.value})}
        />
      </td>

      {/* Reposición (Lo que pone Boxes) */}
      <td>
        <input 
          type="number" 
          value={datos.repo}
          style={{ width: '60px' }}
          onChange={(e) => setDatos({...datos, repo: e.target.value})} 
        />
      </td>

      {/* Ventas (Lo que dice el sistema/tickets) */}
      <td>
        <input 
          type="number" 
          value={datos.vta}
          style={{ width: '60px' }}
          onChange={(e) => setDatos({...datos, vta: e.target.value})} 
        />
      </td>

      {/* Stock Final (Resultado automático) */}
      <td style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc' }}>
        {stockFinalCalculado}
      </td>
    </tr>
  );
};

export default FilaProducto;