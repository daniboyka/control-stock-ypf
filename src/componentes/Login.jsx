import { EMPLEADOS } from '../datos.mock.js';

function Login({ alIniciarSesion }) {
  const manejarEnvio = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    
    // Armamos el objeto con los datos del formulario
    const datosTurno = {
      turno: data.get("turno"),
      resp1: data.get("resp1"),
      resp2: data.get("resp2"),
      horaInicio: new Date().toLocaleTimeString()
    };

    // Ejecutamos la función que vino por props para avisar al padre
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
          <select name="resp1" required>
            <option value="">Seleccione empleado</option>
            {EMPLEADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Responsable 2:</label>
          <select name="resp2" required>
            <option value="">Seleccione empleado</option>
            {EMPLEADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <button type="submit">Iniciar Control de Stock</button>
      </form>
    </div>
  );
}

export default Login;