import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [promociones, setPromociones] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    async function fetchPromos() {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setPromociones(data);
      }
    }
    fetchPromos();
  }, []);

  useEffect(() => {
    if (promociones.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % promociones.length);
    }, 5000); 
    return () => clearInterval(intervalo);
  }, [promociones.length]);

  if (promociones.length === 0) {
    return (
      <div className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
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

  const promoActual = promociones[indiceActual];

  return (
    <div className="relative bg-slate-900 overflow-hidden h-[500px] md:h-[600px] flex items-center justify-center">
      {/* Estilos inyectados para la animación fluida */}
      <style>
        {`
          @keyframes fadeZoom {
            0% { opacity: 0.4; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animacion-premium {
            animation: fadeZoom 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
        `}
      </style>

      {/* Imagen a todo color sin opacidad oscura general */}
      <div className="absolute inset-0">
        <img 
          src={promoActual.image_url} 
          alt={promoActual.title} 
          className="w-full h-full object-cover animacion-premium"
          key={promoActual.image_url} 
        />
        {/* Gradiente solo abajo para que resalten los puntos y el texto no se pierda */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10 mt-20">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          {promoActual.title}
        </h1>
        {promoActual.subtitle && (
          <p className="mt-4 max-w-2xl text-lg md:text-2xl text-slate-100 font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
            {promoActual.subtitle}
          </p>
        )}
        
        <div className="mt-10">
          <Link to="/catalogo" className="px-10 py-4 text-lg font-bold rounded-md text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-[0_4px_15px_rgba(16,185,129,0.5)]">
            Ver Catálogo
          </Link>
        </div>
      </div>

      {promociones.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
          {promociones.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setIndiceActual(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === indiceActual ? 'bg-emerald-500 scale-125 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}