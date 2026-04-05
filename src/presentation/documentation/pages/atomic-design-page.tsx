"use client";

import React, { useState } from "react";
import { Text } from "@/presentation/@shared/components/ui/atoms/text";
import { Link } from "@/presentation/@shared/components/ui/atoms/link";
import { Button } from "@/presentation/@shared/components/ui/atoms/button";
import { Input } from "@/presentation/@shared/components/ui/atoms/input";
import { Textarea } from "@/presentation/@shared/components/ui/atoms/textarea";
import { Select } from "@/presentation/@shared/components/ui/atoms/select";
import { Radio } from "@/presentation/@shared/components/ui/atoms/radio";
import { Checkbox } from "@/presentation/@shared/components/ui/atoms/checkbox";
import { Card } from "@/presentation/@shared/components/ui/atoms/card";
import { Image } from "@/presentation/@shared/components/ui/atoms/image";
import { Carousel } from "@/presentation/@shared/components/ui/molecules/carousel";
import { Pagination } from "@/presentation/@shared/components/ui/molecules/pagination";
import ImageSwiper from '@/presentation/@shared/components/ui/molecules/image-swiper';

export const AtomicDesignPage: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Text variant="h1" className="mb-8">
            Atomic Design
          </Text>

          <section>
            <Text variant="h2" className="mb-4">
              ¿Qué es Atomic Design?
            </Text>
            <Text variant="p" className="mb-4">
              Atomic Design es una metodología para crear sistemas de diseño.
              Fue creada por Brad Frost y se basa en la idea de que los
              componentes de una interfaz pueden dividirse en cinco niveles
              distintos:
            </Text>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Text variant="p">
                  <strong>Átomos:</strong> Los componentes más básicos como
                  botones, inputs, etiquetas, etc.
                </Text>
              </li>
              <li>
                <Text variant="p">
                  <strong>Moléculas:</strong> Grupos de átomos unidos para
                  formar componentes más complejos.
                </Text>
              </li>
              <li>
                <Text variant="p">
                  <strong>Organismos:</strong> Grupos de moléculas y/o átomos
                  que forman secciones relativamente complejas.
                </Text>
              </li>
              <li>
                <Text variant="p">
                  <strong>Templates:</strong> Estructuras de página que muestran
                  cómo se organizan los componentes.
                </Text>
              </li>
              <li>
                <Text variant="p">
                  <strong>Páginas:</strong> Instancias específicas de templates
                  con contenido real.
                </Text>
              </li>
            </ul>
          </section>

          <section>
            <Text variant="h2" className="mb-4">
              Nuestra Implementación
            </Text>
            <Text variant="p" className="mb-4">
              En este proyecto, hemos implementado Atomic Design de la siguiente
              manera:
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <Text variant="h3" className="mb-2">
                  Átomos
                </Text>
                <Text variant="p">Componentes básicos como:</Text>
                <ul className="list-disc pl-6 mt-2">
                  <li>Button</li>
                  <li>Input</li>
                  <li>Text</li>
                  <li>Link</li>
                  <li>Image</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <Text variant="h3" className="mb-2">
                  Moléculas
                </Text>
                <Text variant="p">Componentes compuestos como:</Text>
                <ul className="list-disc pl-6 mt-2">
                  <li>Carousel</li>
                  <li>Pagination</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <Text variant="h2" className="mb-6">
              Componentes
            </Text>
            <div className="space-y-8">
              {/* Átomos */}
              <div>
                <Text variant="h3" className="mb-4">
                  Átomos
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Button
                    </Text>
                    <div className="space-y-2">
                      <Button variant="primary">Botón Primario</Button>
                      <Button variant="secondary">Botón Secundario</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Input
                    </Text>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Escribe algo..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Textarea
                    </Text>
                    <div className="space-y-2">
                      <Textarea
                        value={textareaValue}
                        onChange={handleTextareaChange}
                        placeholder="Escribe algo..."
                      />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Select
                    </Text>
                    <div className="space-y-2">
                      <Select
                        options={[
                          { value: "1", label: "Opción 1" },
                          { value: "2", label: "Opción 2" },
                          { value: "3", label: "Opción 3" },
                        ]}
                      />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Radio
                    </Text>
                    <div className="space-y-2">
                      <Radio name="radio-group" label="Opción 1" />
                      <Radio name="radio-group" label="Opción 2" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Checkbox
                    </Text>
                    <div className="space-y-2">
                      <Checkbox label="Acepto los términos" />
                      <Checkbox label="Recibir notificaciones" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Image
                    </Text>
                    <div className="space-y-2">
                      <Image
                        src="https://via.placeholder.com/150"
                        alt="Ejemplo de imagen"
                        width={150}
                        height={150}
                      />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Link
                    </Text>
                    <div className="space-y-2">
                      <Link href="/" variant="primary" weight={600}>
                        Link Primario
                      </Link>
                      <Link href="/" variant="text">
                        Link Secundario
                      </Link>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Moléculas */}
              <div>
                <Text variant="h3" className="mb-4">
                  Moléculas
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Carousel
                    </Text>
                    <div className="h-48">
                      <Carousel
                        products={[
                          {
                            id: 1,
                            image: "https://img.freepik.com/free-vector/red-abstract-background_698452-1202.jpg",
                            title: "Slide 1",
                            price: 0
                          },
                          {
                            id: 2,
                            image: "https://img.freepik.com/free-vector/red-abstract-background_698452-1202.jpg",
                            title: "Slide 2",
                            price: 0
                          },
                          {
                            id: 3,
                            image: "https://img.freepik.com/free-vector/red-abstract-background_698452-1202.jpg",
                            title: "Slide 3",
                            price: 0
                          },
                        ]}
                      />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Pagination
                    </Text>
                    <div className="space-y-2">
                      <Pagination
                        currentPage={1}
                        totalPages={5}
                        onPageChange={(page) =>
                          console.log("Page changed:", page)
                        }
                      />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <Text variant="h4" className="mb-2">
                      Image Swiper
                    </Text>
                    <div className="space-y-2">
                      <div className="space-y-8 p-4">
                        {/* Basic usage */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Basic Image Swiper</h3>
                          <ImageSwiper
                            images={[
                              '/images/products/notebook.jpg',
                              '/images/products/celular.jpg',
                              '/images/products/botin.webp',
                              '/images/products/guante.jpg',
                              '/images/products/r34.jpg'
                            ]}
                            height="300px"
                          />
                        </div>
                  
                        {/* With custom configuration */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Configured Image Swiper</h3>
                          <ImageSwiper
                            images={[
                              '/images/products/notebook.jpg',
                              '/images/products/celular.jpg',
                              '/images/products/botin.webp',
                              '/images/products/guante.jpg',
                              '/images/products/r34.jpg'
                            ]}
                            slidesPerView={2}
                            spaceBetween={20}
                            loop={true}
                            showIndicators={true}
                            showNavigation={true}
                            autoplay={{ delay: 3000 }}
                            height="400px"
                            objectFit="contain"
                          />
                        </div>
                  
                        {/* With responsive breakpoints */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Responsive Image Swiper</h3>
                          <ImageSwiper
                            images={[
                              '/images/products/notebook.jpg',
                              '/images/products/celular.jpg',
                              '/images/products/botin.webp',
                              '/images/products/guante.jpg',
                              '/images/products/r34.jpg'
                            ]}
                            slidesPerView={1}
                            spaceBetween={10}
                            loop={false}
                            showIndicators={true}
                            showNavigation={false}
                            breakpoints={{
                              320: {
                                slidesPerView: 1,
                                spaceBetween: 10
                              },
                              768: {
                                slidesPerView: 2,
                                spaceBetween: 20
                              },
                              1024: {
                                slidesPerView: 3,
                                spaceBetween: 30
                              }
                            }}
                            height="350px"
                            className="rounded-lg overflow-hidden"
                          />
                        </div>
                  
                        {/* Minimal configuration */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Minimal Image Swiper</h3>
                          <ImageSwiper
                            images={[
                              '/images/products/notebook.jpg',
                              '/images/products/celular.jpg',
                              '/images/products/botin.webp',
                              '/images/products/guante.jpg',
                              '/images/products/r34.jpg'
                            ]}
                            showIndicators={false}
                            showNavigation={false}
                            height="250px"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8">
            <Link href="/" variant="primary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AtomicDesignPage;
