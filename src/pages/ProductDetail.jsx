import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// ==========================================
// CONFIGURACIÓN DE LUPA (Desktop)
// ==========================================
const ZOOM_LEVEL = 3; // Aumento fuerte y claro (300%)
const OUTPUT_PANEL_SIZE = 450; // Tamaño del cuadro de ampliación

export default function ProductDetail() {
  const { id } = useParams(); 
  const mainImageRef = useRef(null); 
  
  const [mueble, setMueble] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  const [imagenActiva, setImagenActiva] = useState(null);
  const [showOutputZoom, setShowOutputZoom] = useState(false);
  const [[magnifierX, magnifierY], setXY] = useState([0, 0]); 
  const [[outputXPercent, outputYPercent], setOutputCoords] = useState([0, 0]); 

  useEffect(() => {
    async function obtenerDetalleMueble() {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) {
        setMueble(data);
        const fotoInicial = (data.gallery && data.gallery.length > 0) ? data.gallery[0] : data.image_url;
        setImagenActiva(fotoInicial);
      }
      setCargando(false);
    }
    obtenerDetalleMueble();
  }, [id]);

  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const elem = e.currentTarget;
    const { top, left, width, height } = elem.getBoundingClientRect();
    
    const x = e.clientX - left;
    const y = e.clientY - top;

    const offsetXPercent = (x / width);
    const offsetYPercent = (y / height);
    
    setXY([x, y]);
    setOutputCoords([offsetXPercent * 100, offsetYPercent * 100]);
  };

  const [modalMovilAbierto, setModalMovilAbierto] = useState(false);

  if (cargando) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-slate-500 font-semibold">Cargando información...</p></div>;
  if (!mueble) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-slate-800">Mueble no encontrado</h2><Link to="/" className="text-blue-500 hover:underline">Volver al inicio</Link></div>;

  const tieneDescuento = mueble.discount_price && mueble.discount_price < mueble.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* MODAL PANTALLA COMPLETA (SOLO MÓVIL) */}
      {modalMovilAbierto && imagenActiva && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="absolute top-0 w-full p-4 flex justify-end z-50 bg-gradient-to-b from-black/70 to-transparent">
            <button onClick={() => setModalMovilAbierto(false)} className="text-white text-4xl font-light hover:text-slate-300">&times;</button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <TransformWrapper initialScale={1} minScale={1} maxScale={4} centerOnInit>
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <img src={imagenActiva} alt="Zoom Móvil" className="w-full h-full object-contain" />
              </TransformComponent>
            </TransformWrapper>
          </div>
          <div className="absolute bottom-6 w-full text-center text-white/50 text-sm pointer-events-none">Usa dos dedos para hacer zoom</div>
        </div>
      )}

      <div className="mb-8 text-sm text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-blue-500 transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{mueble.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* COLUMNA IZQUIERDA: Galería */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 relative">
          
          <div 
            ref={mainImageRef}
            className="w-full h-[400px] md:h-[500px] shadow-sm border border-slate-200 rounded-xl bg-slate-100 overflow-hidden relative cursor-crosshair"
            onMouseEnter={() => setShowOutputZoom(true)}
            onMouseLeave={() => setShowOutputZoom(false)}
            onMouseMove={handleMouseMove}
            onClick={() => { if(window.innerWidth < 1024 && imagenActiva) setModalMovilAbierto(true); }}
          >
            {imagenActiva && (
              <>
                <img src={imagenActiva} alt={mueble.name} className="w-full h-full object-cover" />
                
                {/* RETÍCULO VISOR (Desktop Only) */}
                {showOutputZoom && window.innerWidth >= 1024 && (
                  <div
                    style={{
                      position: 'absolute',
                      pointerEvents: 'none',
                      height: `${100 / ZOOM_LEVEL}%`, 
                      width: `${100 / ZOOM_LEVEL}%`,
                      top: `${magnifierY - (OUTPUT_PANEL_SIZE / ZOOM_LEVEL / 2)}px`,
                      left: `${magnifierX - (OUTPUT_PANEL_SIZE / ZOOM_LEVEL / 2)}px`,
                      backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                      border: '1px solid rgba(0,0,0,0.1)', 
                      borderRadius: '4px', 
                      zIndex: 10
                    }}
                  />
                )}
                
                <div className="block md:hidden absolute bottom-3 right-3 bg-slate-800/80 p-2 rounded-full text-white backdrop-blur-sm shadow-md">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </>
            )}
          </div>

          {/* Miniaturas (Cuadrícula centrada y adaptable) */}
          {mueble.gallery && mueble.gallery.length > 0 && (
            <div className="w-full flex justify-center mt-2">
              <div className="flex flex-wrap justify-center gap-3 w-full">
                {mueble.gallery.map((url, index) => (
                  <div 
                    key={index} onClick={() => setImagenActiva(url)}
                    className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                      imagenActiva === url ? 'border-2 border-emerald-500 opacity-100 shadow-md scale-105' : 'border border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={url} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Información y Zoom */}
        <div className="w-full lg:w-1/2 flex flex-col relative">
          
          {/* PANEL DE ZOOM EXTERNO (Desktop Only) */}
          {showOutputZoom && window.innerWidth >= 1024 && imagenActiva && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-10px', 
                width: `${OUTPUT_PANEL_SIZE}px`,
                height: `${OUTPUT_PANEL_SIZE}px`,
                zIndex: 100,
                backgroundColor: 'white',
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                backgroundImage: `url('${imagenActiva}')`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${ZOOM_LEVEL * 100}%`, 
                backgroundPosition: `${outputXPercent}% ${outputYPercent}%`, 
              }}
            />
          )}

          {tieneDescuento && <span className="inline-block bg-red-600 text-white text-sm font-bold px-3 py-1 rounded w-max mb-4">OFERTA</span>}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">{mueble.name}</h1>
          <p className="text-slate-500 mb-6">Vendido por: Muebles & Co. Oficial</p>
          <div className="flex items-center gap-4 mb-2">
            {tieneDescuento ? (
              <><span className="text-4xl font-bold text-amber-600">${mueble.discount_price.toLocaleString('es-MX')}</span><span className="text-xl text-slate-400 line-through">${mueble.price.toLocaleString('es-MX')}</span></>
            ) : (
              <span className="text-4xl font-bold text-slate-800">${mueble.price.toLocaleString('es-MX')}</span>
            )}
          </div>
          <p className={`font-bold mb-8 ${mueble.is_available ? 'text-emerald-500' : 'text-red-500'}`}>
            {mueble.is_available ? '✓ Disponible en Stock' : '✗ Agotado'}
          </p>
          <hr className="border-slate-200 mb-8" />
          <h3 className="text-xl font-bold text-slate-800 mb-4">Descripción</h3>
          <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap">{mueble.description || "Sin descripción."}</p>
          <button disabled={!mueble.is_available} className={`w-full py-4 text-white text-lg font-bold rounded-lg shadow-lg transition-colors flex justify-center items-center gap-2 ${mueble.is_available ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 cursor-not-allowed'}`}>
            {mueble.is_available ? 'Contactar al vendedor' : 'Sin inventario'}
          </button>
        </div>
      </div>
    </div>
  );
}