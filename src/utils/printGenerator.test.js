import { describe, it, expect } from 'vitest';
import { generarHtmlReporteTurno } from './printGenerator';

describe('Generador de Reportes HTML', () => {
    const turnoMock = {
        fecha: "12/02/2026",
        turno: "1",
        horaCierre: "20:00",
        usuario: { resp1: "Juan", resp2: "Pedro" },
        observaciones: "Todo ok",
        productos: [
            {
                nombre: "Aceite 1L",
                inic: "10",
                repo: "5",
                vta: "2",
                stockIdeal: "20",
                stockFisicoAnterior: "10" // Coincide, no alerta
            },
            {
                nombre: "Aceite 4L",
                inic: "8", 
                repo: "0",
                vta: "0",
                stockIdeal: "10",
                stockFisicoAnterior: "10" // Diferencia de -2 (Faltante)
            }
        ]
    };

    it('Debe generar un HTML válido con los datos del turno', () => {
        const html = generarHtmlReporteTurno(turnoMock);
        
        expect(html).toContain('Reporte de Cierre de Turno');
        expect(html).toContain('12/02/2026');
        expect(html).toContain('Juan / Pedro');
        expect(html).toContain('Todo ok');
        expect(html).toContain('Aceite 1L');
    });

    it('Debe calcular correctamente el stock final en la tabla', () => {
        const html = generarHtmlReporteTurno(turnoMock);
        
        // Aceite 1L: 10 + 5 - 2 = 13
        // Buscamos "13" dentro de una celda bold, aunque es string matching simple
        expect(html).toContain('<td style="font-weight: bold;">13</td>');
    });

    it('Debe generar alertas si hay diferencias de stock', () => {
        const html = generarHtmlReporteTurno(turnoMock);
        
        expect(html).toContain('⚠️ Alertas del Turno:');
        expect(html).toContain('Faltante (Inicio vs Anterior) de 2');
    });

    it('NO debe generar alertas si todo coincide', () => {
        const turnoPerfecto = {
            ...turnoMock,
            productos: [
                {
                    nombre: "Aceite 1L",
                    inic: "10",
                    repo: "5",
                    vta: "2",
                    stockIdeal: "20",
                    stockFisicoAnterior: "10"
                }
            ]
        };
        const html = generarHtmlReporteTurno(turnoPerfecto);
        expect(html).not.toContain('⚠️ Alertas del Turno:');
    });
});
