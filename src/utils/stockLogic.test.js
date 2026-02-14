import { describe, it, expect } from 'vitest';
import { calcularNuevoEstadoProducto } from './stockLogic';

describe('Lógica de Stock - Cálculo Automático de Reposición', () => {
  const productoBase = {
    id: 1,
    nombre: "Aceite 10W40",
    repo: 20,
    vta: 5
  };

  it('Debe descontar correctamente la reposición al aumentar ventas', () => {
    // Venta pasa de 5 a 6 (Delta +1). Repo debe bajar de 20 a 19.
    const resultado = calcularNuevoEstadoProducto(productoBase, "vta", 6);
    
    expect(resultado.productoActualizado.repo).toBe(19);
    expect(resultado.productoActualizado.vta).toBe(6);
    expect(resultado.logAuditoria).toBeDefined();
    expect(resultado.logAuditoria.repoNueva).toBe(19);
  });

  it('Debe aumentar la reposición si se corrige una venta a la baja', () => {
    // Venta pasa de 5 a 4 (Delta -1). Repo debe subir de 20 a 21.
    const resultado = calcularNuevoEstadoProducto(productoBase, "vta", 4);
    
    expect(resultado.productoActualizado.repo).toBe(21);
  });

  it('Debe permitir venta ajustando reposición a 0 (Caso Edge)', () => {
    // Repo es 20. Venta sube de 5 a 30 (Delta +25). Repo quedaría en -5.
    // Corrección: Ahora debe permitirlo y dejar repo en 0.
    const resultado = calcularNuevoEstadoProducto(productoBase, "vta", 30);
    expect(resultado.productoActualizado.repo).toBe(0);
    expect(resultado.productoActualizado.vta).toBe(30);
  });

  it('Debe generar alerta si la reposición cae bajo el umbral', () => {
    // Repo 20. Venta sube de 5 a 22 (Delta +17). Repo queda en 3 (Umbral 5).
    const resultado = calcularNuevoEstadoProducto(productoBase, "vta", 22);
    
    expect(resultado.productoActualizado.repo).toBe(3);
    expect(resultado.alerta).toBeDefined();
    expect(resultado.alerta.mensaje).toMatch(/Stock de Reposición bajo/);
  });
});
