import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [promociones, setPromociones] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);

  // 1. Cargar las promociones activas desde Supabase
  useEffect(() => {
    async function fetchPromos() {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true) // Solo traemos las que pusiste como "Visible en Tienda"
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setPromociones(data);
      }
    }
    fetchPromos();
  }, []);

  // 2. Lógica del Carrusel Automático (Cambia cada 5 segundos)
  useEffect(() => {
    if (promociones.length <= 1) return; // Si hay 1 o 0 promos, no hay necesidad de rotar
    
    const intervalo = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % promociones.length);
    }, 5000); 
    
    return () => clearInterval(intervalo);
  }, [promociones.length]);

  // 3. Fallback (Si no has subido ninguna promo, muestra el diseño por defecto para que no se vea roto)
  if (promociones.length === 0) {
    return (
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-emerald-100 bg-emerald-600/80 mb-6 shadow-sm border border-emerald-500/30">
            ESPECIAL DE APERTURA
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
            Renueva tu espacio con <span className="text-blue-400">diseño y confort.</span>
          </h1>
        </div>
      </div>
    );
  }

  // 4. Vista Dinámica del Carrusel
  const promoActual = promociones[indiceActual];

  return (
    <div className="relative bg-slate-900 overflow-hidden h-[500px] md:h-[600px] flex items-center justify-center">
      
      {/* Imagen de fondo con opacidad suave */}
      <div className="absolute inset-0">
        <img 
          src={promoActual.image_url} 
          alt={promoActual.title} 
          className="w-full h-full object-cover opacity-60 transition-opacity duration-700 ease-in-out"
          key={promoActual.image_url} // Obliga a React a recargar la animación al cambiar de foto
        />
        {/* Gradiente oscuro inferior para que el texto resalte siempre */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
      </div>

      {/* Contenido (Textos y Botón) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
          {promoActual.title}
        </h1>
        {promoActual.subtitle && (
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-200 drop-shadow-md font-medium">
            {promoActual.subtitle}
          </p>
        )}
        
        <div className="mt-10">
          <Link to="/catalogo" className="px-8 py-3 text-base font-bold rounded-md text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg hover:shadow-emerald-500/30">
            Ver Catálogo
          </Link>
        </div>
      </div>

      {/* Indicadores del carrusel (Puntitos) */}
      {promociones.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
          {promociones.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setIndiceActual(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === indiceActual ? 'bg-emerald-500 scale-125 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
      
    </div>
  );
}