import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { supabase } from '../services/supabaseClient';

export default function Catalog() {
  const [muebles, setMuebles] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // NUEVOS ESTADOS PARA BÚSQUEDA Y FILTRADO
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');

  useEffect(() => {
    async function obtenerMuebles() {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error) setMuebles(data);
      setCargando(false);
    }
    obtenerMuebles();
  }, []);

  // LÓGICA DE FILTRADO EN TIEMPO REAL
  const mueblesFiltrados = muebles.filter((mueble) => {
    // 1. Verificar si coincide con el texto escrito
    const coincideTexto = mueble.name.toLowerCase().includes(terminoBusqueda.toLowerCase()) || 
                          (mueble.description && mueble.description.toLowerCase().includes(terminoBusqueda.toLowerCase()));
    
    // 2. Verificar si coincide con la categoría seleccionada
    const categoriaDelMueble = mueble.category || 'Muebles'; // Si no tiene, asumimos 'Muebles'
    const coincideCategoria = categoriaSeleccionada === 'Todas' || categoriaDelMueble === categoriaSeleccionada;

    // Solo mostramos los que cumplan ambas condiciones
    return coincideTexto && coincideCategoria;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Catálogo Completo</h1>
          <p className="text-slate-500 mt-2">Explora toda nuestra colección y encuentra lo que necesitas.</p>
          <div className="w-16 h-1 bg-emerald-500 mt-4 rounded-full"></div>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Campo de Búsqueda */}
          <div className="relative flex-grow sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow outline-none shadow-sm text-slate-700"
            />
          </div>

          {/* Menú de Categorías */}
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm text-slate-700 bg-white cursor-pointer"
          >
            <option value="Todas">Todas las categorías</option>
            <option value="Muebles">Muebles</option>
            <option value="Electrónica">Electrónica</option>
            <option value="Decoración">Decoración</option>
          </select>
        </div>
      </div>

      {/* RESULTADOS */}
      {cargando ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-xl text-slate-500 font-semibold animate-pulse">Cargando catálogo...</p>
        </div>
      ) : mueblesFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mueblesFiltrados.map((mueble) => (
            <ProductCard key={mueble.id} mueble={mueble} />
          ))}
        </div>
      ) : (
        // Estado vacío (Cuando la búsqueda no encuentra nada)
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <svg className="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No encontramos resultados</h3>
          <p className="text-slate-500">
            Intenta buscar con otras palabras o cambia la categoría.
          </p>
          <button 
            onClick={() => { setTerminoBusqueda(''); setCategoriaSeleccionada('Todas'); }}
            className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-semibold transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </main>
  );
}