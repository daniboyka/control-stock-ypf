/**
 * Lógica de negocio para gestión de stock y reposición automática.
 */
export const calcularNuevoEstadoProducto = (productoActual, campo, valor, umbralMinimo = 5) => {
  // Si no es el campo de ventas, retorno simple
  if (campo !== "vta") {
    return {
      productoActualizado: { ...productoActual, [campo]: valor },
      logAuditoria: null,
      alerta: null
    };
  }

  const ventasAnteriores = Number(productoActual.vta) || 0;
  const ventasNuevas = Number(valor) || 0;

  // Validación: Ventas negativas no permitidas
  if (ventasNuevas < 0) {
    throw new Error("La cantidad de ventas no puede ser negativa.");
  }

  const deltaVentas = ventasNuevas - ventasAnteriores;

  // Si no hay cambio real, no hacemos nada
  if (deltaVentas === 0) {
    return {
      productoActualizado: { ...productoActual, vta: valor },
      logAuditoria: null,
      alerta: null
    };
  }

  const repoActual = Number(productoActual.repo) || 0;
  // Regla: Repo Nueva = Repo Actual - (Ventas Nuevas - Ventas Anteriores)
  let repoNueva = repoActual - deltaVentas;

  // Validación: Reposición no puede ser negativa
  // CORRECCIÓN: Si la reposición calculada es negativa, la ajustamos a 0.
  // Esto permite que el Playero marque ventas incluso si supera la carga teórica.
  if (repoNueva < 0) {
    repoNueva = 0;
  }

  // Generar Log de Auditoría
  const logAuditoria = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    productoId: productoActual.id,
    productoNombre: productoActual.nombre,
    accion: "VENTA_AUTOMATICA",
    detalle: `Venta: ${ventasAnteriores} -> ${ventasNuevas} (Delta: ${deltaVentas})`,
    repoAnterior: repoActual,
    repoNueva: repoNueva
  };

  // Generar Alerta de Umbral
  let alerta = null;
  if (repoNueva < umbralMinimo) {
    alerta = {
      tipo: "warning",
      mensaje: `⚠️ Stock de Reposición bajo para ${productoActual.nombre}: ${repoNueva} unidades.`
    };
  }

  return {
    productoActualizado: {
      ...productoActual,
      vta: valor,
      repo: repoNueva
    },
    logAuditoria,
    alerta
  };
};
