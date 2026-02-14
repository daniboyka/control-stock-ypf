
export const generarHtmlReporteTurno = (turno) => {
    // Lógica de alertas para el reporte
    const diferencias = turno.productos.filter(p => {
      const inic = Number(p.inic) || 0;
      if (p.stockFisicoAnterior === undefined || p.stockFisicoAnterior === null) return false;
      const anterior = Number(p.stockFisicoAnterior) || 0;
      return p.inic !== "" && inic !== anterior;
    });

    const stockNegativos = turno.productos.filter(p => {
      const inic = Number(p.inic) || 0;
      const repo = Number(p.repo) || 0;
      const vta = Number(p.vta) || 0;
      const final = inic + repo - vta;
      return final < 0;
    });

    let alertasHtml = '';
    if (diferencias.length > 0 || stockNegativos.length > 0) {
      alertasHtml += '<div style="margin-top: 15px; padding: 10px; border: 1px solid #721c24; background-color: #fee2e2; color: #721c24; border-radius: 4px;">';
      alertasHtml += '<strong>⚠️ Alertas del Turno:</strong><ul style="margin: 5px 0 0 20px;">';
      
      diferencias.forEach(f => {
        const anterior = Number(f.stockFisicoAnterior) || 0;
        const inic = Number(f.inic) || 0;
        const diff = inic - anterior;
        const tipo = diff < 0 ? "Faltante (Inicio vs Anterior)" : "Sobrante (Inicio vs Anterior)";
        alertasHtml += `<li><strong>${f.nombre}</strong>: ${tipo} de ${Math.abs(diff)} (Anterior: ${anterior} vs Actual: ${inic})</li>`;
      });

      stockNegativos.forEach(f => {
        const inic = Number(f.inic) || 0;
        const repo = Number(f.repo) || 0;
        const vta = Number(f.vta) || 0;
        const final = inic + repo - vta;
        alertasHtml += `<li><strong>${f.nombre}</strong>: 🛑 FALTANTE CRÍTICO (Stock Final: ${final})</li>`;
      });

      alertasHtml += '</ul></div>';
    }

    const htmlContent = `
      <html>
        <head>
          <title>Reporte de Turno - ${turno.fecha}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #000; }
            h1, h2, h3 { color: #000; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; font-size: 14px; }
            th { background-color: #f0f0f0; }
            .info-box { border: 1px solid #000; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
            .obs { margin-top: 10px; font-style: italic; }
            @media print {
              @page { size: A4; margin: 1cm; }
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <h1>Reporte de Cierre de Turno</h1>
          
          <div class="info-box">
            <p><strong>Fecha:</strong> ${turno.fecha}</p>
            <p><strong>Turno:</strong> ${turno.turno}</p>
            <p><strong>Hora Cierre:</strong> ${turno.horaCierre}</p>
            <p><strong>Responsables:</strong> ${turno.usuario.resp1} ${turno.usuario.resp2 ? `/ ${turno.usuario.resp2}` : ""}</p>
            <div class="obs"><strong>Observaciones:</strong> ${turno.observaciones || "Sin observaciones"}</div>
          </div>

          <h3>Detalle de Movimientos</h3>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">Producto</th>
                <th>Inic</th>
                <th>Repo</th>
                <th>Vta</th>
                <th>Final</th>
                <th>Ideal</th>
              </tr>
            </thead>
            <tbody>
              ${turno.productos.map(p => {
                const inic = Number(p.inic) || 0;
                const repo = Number(p.repo) || 0;
                const vta = Number(p.vta) || 0;
                const final = inic + repo - vta;
                return `
                  <tr>
                    <td style="text-align: left;">${p.nombre}</td>
                    <td>${inic}</td>
                    <td>${repo}</td>
                    <td>${vta}</td>
                    <td style="font-weight: bold;">${final}</td>
                    <td>${p.stockIdeal}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          ${alertasHtml}

          <div style="margin-top: 30px; border-top: 1px dashed #000; padding-top: 10px; text-align: center;">
            <p>Firma Responsable(s)</p>
          </div>
        </body>
      </html>
    `;

    return htmlContent;
};
