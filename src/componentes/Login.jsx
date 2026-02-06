import { useState } from 'react'; // 1. Importamos useState [cite: 2026-01-16]
import { EMPLEADOS } from "../datos.mock.js";

function Login({ alIniciarSesion }) {
  // 2. Creamos un estado para el primer responsable [cite: 2026-01-16]
  const [resp1Seleccionado, setResp1Seleccionado] = useState("");

  const manejarEnvio = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);

    const datosTurno = {
      turno: data.get("turno"),
      resp1: data.get("resp1"),
      resp2: data.get("resp2"),
      horaInicio: new Date().toLocaleTimeString(),
    };

    alIniciarSesion(datosTurno);
  };

  return (
    <div className="login-container">
      <h2>Inicio de Turno YPF</h2>
      <form onSubmit={manejarEnvio}>
        <div className="form-group">
          <label>Seleccionar Turno:</label>
          <select name="turno" required>
            <option value="T1">Turno 1 (06:00 - 14:00)</option>
            <option value="T2">Turno 2 (14:00 - 22:00)</option>
            <option value="T3">Turno 3 (22:00 - 06:00)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Responsable 1:</label>
          <select 
            name="resp1" 
            required 
            onChange={(e) => setResp1Seleccionado(e.target.value)} // 3. Guardamos quién es el 1 [cite: 2026-01-16]
          >
            <option value="">Seleccione empleado</option>
            {EMPLEADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Responsable 2:</label>
          <select name="resp2" required>
            <option value="">Seleccione empleado</option>
            {/* 4. Filtramos la lista: solo mostramos los que NO son el resp1 [cite: 2026-01-16] */}
            {EMPLEADOS
              .filter((e) => e !== resp1Seleccionado) 
              .map((e) => (
                <option key={e} value={e}>{e}</option>
              ))
            }
          </select>
        </div>

        <button type="submit">Iniciar Control de Stock</button>
      </form>
    </div>
  );
}

export default Login;