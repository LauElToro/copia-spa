'use client';

import React from "react";
import Link from "../../atoms/link/link";
import { BarChart, SmartToy, ArrowBack, AccountCircle, Settings, PowerSettingsNew } from "@mui/icons-material";

const Navbar = () => {
  return (
    <>
      <nav
        className="bg-black navbar navbar-expand-lg p-4"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1050}}
      >
        <div className="container-fluid mx-4 d-flex justify-content-center">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {/* centrado de links */}
            <ul className="navbar-nav d-flex justify-content-center align-items-center gap-md-5 gap-3 w-100">
              <li>
                <Link href="/admin/panel/panel-proliberter" className="proliberter-menu-link">
                  <BarChart sx={{ fontSize: "1.3rem" }} />
                  <span style={{ marginLeft: "0.7rem" }}>Analíticas</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/panel/panel-proliberter/assistant/mark" className="proliberter-menu-link">
                  <SmartToy sx={{ fontSize: "1.3rem" }} />
                  <span style={{ marginLeft: "0.7rem" }}>Asistente AI</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/panel/home" className="proliberter-menu-link">
                  <ArrowBack sx={{ fontSize: "1.3rem" }} />
                  <span style={{ marginLeft: "0.7rem" }}>Volver</span>
                </Link>
              </li>
            </ul>

            {/* dropdown a la derecha */}
            <div className="dropdown ms-auto">
              <button
                className="btn btn-link p-0 border-0 nav-link"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <AccountCircle sx={{ fontSize: "1.25rem" }} />
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end p-3 shadow-lg"
                aria-labelledby="dropdownMenuButton"
                style={{
                  minWidth: "260px",
                  borderRadius: "16px",
                  background: "#111",
                  color: "#fff"}}
              >
                <li>
                  <span
                    className="fw-bold d-block mb-3"
                    style={{ fontSize: "1.25rem" }}
                  >
                    Tecno Smart
                  </span>
                </li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center gap-2 text-white border-0"
                    style={{ background: "none", fontSize: "1.15rem" }}
                  >
                    <Settings sx={{ fontSize: "1.3rem" }} />{' '}
                    Configuración
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item d-flex align-items-center gap-2 text-white border-0"
                    style={{ background: "none", fontSize: "1.15rem" }}
                  >
                    <PowerSettingsNew sx={{ fontSize: "1.3rem" }} />{' '}
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* 👇 para que no tape el contenido */}
      <div style={{ height: "80px" }}></div>
    </>
  );
};

export default Navbar;
