import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { toast } from 'sonner';
import ProductCard from '../components/ProductCard'; 

// ==========================================
// CONFIGURACIÓN DE LUPA (Desktop)
// ==========================================
const ZOOM_LEVEL = 3; 
const OUTPUT_PANEL_SIZE = 450; 

export default function ProductDetail() {
  const { id } = useParams(); 
  const mainImageRef = useRef(null); 
  const sliderRef = useRef(null); // <-- Referencia para el carrusel
  
  const [mueble, setMueble] = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]); 
  const [cargando, setCargando] = useState(true);
  
  const [imagenActiva, setImagenActiva] = useState(null);
  const [showOutputZoom, setShowOutputZoom] = useState(false);
  const [[magnifierX, magnifierY], setXY] = useState([0, 0]); 
  const [[outputXPercent, outputYPercent], setOutputCoords] = useState([0, 0]); 

  useEffect(() => {
    async function obtenerDetalleMueble() {
      setCargando(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      
      if (!error && data) {
        setMueble(data);
        const fotoInicial = (data.gallery && data.gallery.length > 0) ? data.gallery[0] : data.image_url;
        setImagenActiva(fotoInicial);

        // BUSCAR PRODUCTOS RELACIONADOS (Aumentado a 10)
        const categoriaBuscada = data.category || 'Muebles';
        const { data: relacionados } = await supabase
          .from('products')
          .select('*')
          .eq('category', categoriaBuscada) 
          .neq('id', id) 
          .limit(10); // <-- LÍMITE A 10 PRODUCTOS
          
        if (relacionados) {
          setProductosRelacionados(relacionados);
        }
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

  // Funciones para deslizar el carrusel
  const deslizarIzquierda = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const deslizarDerecha = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const [modalMovilAbierto, setModalMovilAbierto] = useState(false);

  if (cargando) return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-slate-500 font-semibold animate-pulse">Cargando información...</p></div>;
  if (!mueble) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-bold text-slate-800">Mueble no encontrado</h2><Link to="/catalogo" className="text-emerald-500 font-bold hover:underline">Volver al catálogo</Link></div>;

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

      {/* MIGAS DE PAN (Breadcrumbs) */}
      <div className="mb-8 text-sm text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-emerald-500 transition-colors">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-emerald-500 transition-colors">{mueble.category || 'Muebles'}</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-[200px] md:max-w-none">{mueble.name}</span>
      </div>

      {/* DETALLE PRINCIPAL DEL PRODUCTO */}
      <div className="flex flex-col lg:flex-row gap-12 mb-20">
        
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

          {/* Miniaturas */}
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

          {tieneDescuento && <span className="inline-block bg-red-600 text-white text-sm font-bold px-3 py-1 rounded w-max mb-4 shadow-sm shadow-red-200">OFERTA ESPECIAL</span>}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">{mueble.name}</h1>
          <p className="text-slate-500 mb-6 font-medium">Categoría: <span className="text-emerald-600">{mueble.category || 'Muebles'}</span></p>
          
          <div className="flex items-end gap-4 mb-2">
            {tieneDescuento ? (
              <><span className="text-4xl font-black text-slate-800">${mueble.discount_price.toLocaleString('es-MX')}</span><span className="text-xl text-slate-400 line-through mb-1">${mueble.price.toLocaleString('es-MX')}</span></>
            ) : (
              <span className="text-4xl font-black text-slate-800">${mueble.price.toLocaleString('es-MX')}</span>
            )}
          </div>
          <p className={`font-bold mb-8 flex items-center gap-2 ${mueble.is_available ? 'text-emerald-500' : 'text-red-500'}`}>
            <span className={`w-3 h-3 rounded-full inline-block ${mueble.is_available ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            {mueble.is_available ? 'Disponible en inventario' : 'Agotado por el momento'}
          </p>
          
          <hr className="border-slate-200 mb-8" />
          
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Descripción del producto
          </h3>
          <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap">{mueble.description || "Sin descripción adicional proporcionada."}</p>
          
          <button 
            disabled={!mueble.is_available} 
            onClick={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                toast.error('Inicia sesión para contactar a nuestro equipo de ventas.');
                return;
              }
              toast.success('¡Iniciando chat seguro con el vendedor!');
            }}
            className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-3 ${mueble.is_available ? 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-1 hover:shadow-emerald-200' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {mueble.is_available ? 'Contactar al vendedor' : 'Sin inventario'}
          </button>
        </div>
      </div>

      {/* SECCIÓN DE PRODUCTOS RELACIONADOS (CARRUSEL) */}
      {productosRelacionados.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">También podría interesarte</h2>
              <p className="text-slate-500 mt-1">Más artículos de la categoría <span className="font-semibold text-emerald-600">{mueble.category}</span></p>
            </div>
            <Link to="/catalogo" className="hidden sm:inline-block text-emerald-600 font-bold hover:underline">
              Ver todo
            </Link>
          </div>
          
          <div className="relative group">
            
            {/* Flecha Izquierda (Solo visible en desktop al pasar el mouse) */}
            <button 
              onClick={deslizarIzquierda} 
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 bg-white border border-slate-200 rounded-full p-3 shadow-lg text-slate-800 hover:text-emerald-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Contenedor scrolleable con CSS inline para ocultar barra de scroll */}
            <div 
              ref={sliderRef} 
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`
                div::-webkit-scrollbar { display: none; }
              `}</style>
              
              {productosRelacionados.map((prod) => (
                <div key={prod.id} className="min-w-[280px] sm:min-w-[300px] snap-start flex-shrink-0">
                  <ProductCard mueble={prod} />
                </div>
              ))}
            </div>

            {/* Flecha Derecha (Solo visible en desktop al pasar el mouse) */}
            <button 
              onClick={deslizarDerecha} 
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 bg-white border border-slate-200 rounded-full p-3 shadow-lg text-slate-800 hover:text-emerald-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            
          </div>
        </div>
      )}

    </div>
  );
}