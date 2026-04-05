import React from "react";
import { render, screen } from "@testing-library/react";
import DataTable, { DataTableColumn } from "./table";

describe("Table", () => {
    const mockProducts = [
        {
          name: 'Test 1',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=60&q=80',
          price: '100 USDT',
          promo: 'Ninguna',
          status: 'Activo'},
        {
          name: 'Test 2',
          image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=60&q=80',
          price: '200 USDT',
          promo: 'Ninguna',
          status: 'Pausado'},
        {
          name: 'Test 3',
          image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=60&q=80',
          price: '300 USDT',
          promo: 'Ninguna',
          status: 'Pausado'},
    ];

    const columns: DataTableColumn[] = [
    {
        title: 'Nombre',
        data: 'name',
        responsivePriority: 1},

    {
        title: 'Estado',
        data: 'status',
        responsivePriority: 5,
        type: 'html',
        render: function(data: unknown, type: string) {
        if (type === 'display') {
            const statusClass = data === 'Activo' ? 'text-success' : 'text-danger';
            const statusText = data === 'Activo' ? 'Activo' : 'Inactivo';
            return `<span class="${statusClass} fw-bold">${statusText}</span>`;
        }
        return data as string;
        }
    }
    ];

  it("renders with default props", () => {
    render(<DataTable data={mockProducts} columns={columns} id="test-table" />);
    // La tabla ahora usa divs en lugar de elementos table, buscar por texto del header
    const tableHeader = screen.getByText("Nombre");
    expect(tableHeader).toBeInTheDocument();
    // Verificar que los datos se renderizan
    expect(screen.getByText("Test 1")).toBeInTheDocument();
  });
});