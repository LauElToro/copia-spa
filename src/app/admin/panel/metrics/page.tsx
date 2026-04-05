'use client';

import { Box } from '@mui/material';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import DataTable, { DataTableColumn } from '@/presentation/@shared/components/ui/atoms/table/table';
import useDevice from '@/presentation/@shared/hooks/use-device';
import { useEffect, useMemo, useState } from 'react';

export default function MetricsPage() {
  const { isDesktop } = useDevice();
  const [tableKey, setTableKey] = useState<string>('init');
  const [tab] = useState<'analytics' | 'messaging'>('analytics');

  // Tabla mock para asegurar render visible (misma UI que Transacciones)
  const columns: DataTableColumn[] = useMemo(() => [
    { title: 'KPI', data: 'kpi', responsivePriority: 1, searchable: true },
    { title: 'VALOR', data: 'value', responsivePriority: 1 },
    { title: 'PERÍODO', data: 'period', responsivePriority: 1 },
    { title: 'TENDENCIA', data: 'trend', responsivePriority: 1 },
  ], []);

  const data = useMemo(() => ([
    { kpi: 'Ventas totales', value: '61', period: 'Año', trend: '+12%' },
    { kpi: 'Ingresos mensuales', value: '$0,00', period: 'Mes', trend: '0%' },
    { kpi: 'Ingresos anuales', value: '$804.655,71', period: 'Año', trend: '+8%' },
  ]), []);

  // Forzar reinicialización del DataTable al montar (navegación ida y vuelta)
  useEffect(() => {
    setTableKey(`metrics-${Date.now()}`);
  }, []);

  // Función para cambiar tabs (reservada para uso futuro)
  // const handleTab = useCallback((next: 'analytics' | 'messaging') => {
  //   setTab(next);
  //   // fuerza re-inicialización de DataTable al cambiar a analytics
  //   if (next === 'analytics') {
  //     setTableKey(`metrics-${Date.now()}`);
  //   }
  // }, []);

  return (
    <div className="container-xxl mt-4">
      <div className="row mb-4">
        <div className="col-12 mb-4" style={{ display: tab === 'analytics' ? 'block' : 'none' }}>
          <Box sx={{ padding: '2.5rem' }}>
            <div className="row justify-content-center">
              <div className="col-12 col-lg-6 mb-4">
                <Text variant="h5" align={isDesktop ? 'left' : 'center'} weight='bold'>Métricas e IA</Text>
              </div>
            </div>
            <DataTable key={tableKey} id="metrics-table" columns={columns} data={data} className="shadow-lg" />
            {/* Fallback visible si por navegación el DataTable no inicializa */}
            <div className="table-responsive mt-4">
              <table className="table table-dark table-hover align-middle">
                <thead>
                  <tr>
                    <th>KPI</th>
                    <th>VALOR</th>
                    <th>PERÍODO</th>
                    <th>TENDENCIA</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, idx) => (
                    <tr key={`fallback-${idx}`}>
                      <td>{r.kpi}</td>
                      <td>{r.value}</td>
                      <td>{r.period}</td>
                      <td>{r.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
        </div>

        <div className="col-12 mb-4" style={{ display: tab === 'messaging' ? 'block' : 'none' }}>
          <Box sx={{ padding: '2.5rem' }}>
            <Text variant="h5" align={isDesktop ? 'left' : 'center'} weight='bold'>Mensajería</Text>
            <div className="text-secondary">Canal de mensajes en construcción.</div>
          </Box>
        </div>

        {/* Se elimina layout de Asistente IA según requerimiento */}
      </div>
    </div>
  );
}


