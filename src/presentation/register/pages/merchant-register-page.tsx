"use client";

import React, { useState } from 'react';
import { Store, Language, Phone, CreditCard, Email, Lock, Code } from '@mui/icons-material';
import MainLayout from '@/presentation/@shared/components/layouts/main-layout';
import Link from 'next/link';


const MerchantRegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  return (
    <MainLayout>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-8">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold">Registrar Cuenta</h1>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <form>
                  <div className="row">
                    {/* Columna Izquierda */}
                    <div className="col-md-6 pe-md-3">
                      {/* Commerce Name */}
                      <div className="mb-4">
                        <label htmlFor="commerceName" className="form-label d-flex align-items-center">
                          <Store sx={{ mr: 1 }} />{' '}
                          Nombre del Comercio
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="commerceName"
                          placeholder="Nombre de tu comercio"
                        />
                      </div>

                      {/* Country */}
                      <div className="mb-4">
                        <label htmlFor="country" className="form-label d-flex align-items-center">
                          <Language sx={{ mr: 1 }} />{' '}
                          País
                        </label>
                        <select className="form-select" id="country">
                          <option value="">Seleccionar país</option>
                          <option value="AR">Argentina</option>
                          <option value="CL">Chile</option>
                          <option value="CO">Colombia</option>
                          <option value="MX">México</option>
                          <option value="PE">Perú</option>
                          <option value="UY">Uruguay</option>
                          <option value="VE">Venezuela</option>
                        </select>
                      </div>

                      {/* Phone */}
                      <div className="mb-4">
                        <label htmlFor="phone" className="form-label d-flex align-items-center">
                          <Phone sx={{ mr: 1 }} />{' '}
                          Teléfono
                        </label>
                        <div className="d-flex gap-2">
                          <select className="form-select" style={{ width: '120px' }}>
                            <option value="">+54</option>
                            <option value="">+56</option>
                            <option value="">+57</option>
                            <option value="">+52</option>
                            <option value="">+51</option>
                            <option value="">+598</option>
                            <option value="">+58</option>
                          </select>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Código de área"
                            style={{ width: '100px' }}
                          />
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="Número"
                          />
                        </div>
                      </div>

                      {/* Plan Selection */}
                      <div className="mb-4">
                        <label htmlFor="plan-select" className="form-label d-flex align-items-center">
                          <CreditCard sx={{ mr: 1 }} />{' '}
                          Plan
                        </label>
                        <select 
                          id="plan-select"
                          className="form-select" 
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                        >
                          <option value="">Seleccionar plan</option>
                          <option value="satoshi">Satoshi</option>
                          <option value="liberter">Liberter</option>
                          <option value="pro">Pro Liberter</option>
                          <option value="partner">Partner</option>
                        </select>
                      </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="col-md-6 ps-md-3">
                      {/* Email */}
                      <div className="mb-4">
                        <label htmlFor="email" className="form-label d-flex align-items-center">
                          <Email sx={{ mr: 1 }} />{' '}
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          placeholder="Correo electrónico"
                        />
                      </div>

                      {/* Password */}
                      <div className="mb-4">
                        <label htmlFor="password" className="form-label d-flex align-items-center">
                          <Lock sx={{ mr: 1 }} />{' '}
                          Contraseña
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="password"
                            placeholder="Contraseña"
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </div>

                      {/* Repeat Password */}
                      <div className="mb-4">
                        <label htmlFor="repeatPassword" className="form-label d-flex align-items-center">
                          <Lock sx={{ mr: 1 }} />{' '}
                          Confirmar Contraseña
                        </label>
                        <div className="input-group">
                          <input
                            type={showRepeatPassword ? "text" : "password"}
                            className="form-control"
                            id="repeatPassword"
                            placeholder="Repetir contraseña"
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                          >
                            {showRepeatPassword ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                      </div>

                      {/* Referral Code */}
                      <div className="mb-4">
                        <label htmlFor="referralCode" className="form-label d-flex align-items-center">
                          <Code sx={{ mr: 1 }} />{' '}
                          Código
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="referralCode"
                          placeholder="Código de referido"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="btn btn-primary w-100 py-2 mb-3">
                    ¡Registrar comercio!
                  </button>

                  {/* Login Link */}
                  <div className="text-center">
                    ¿Ya tienes cuenta de comercio? <Link href="/login" className="text-decoration-none">¡Ingresá ahora!</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MerchantRegisterPage; 