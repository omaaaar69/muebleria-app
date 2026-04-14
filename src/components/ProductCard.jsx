import { Link } from 'react-router-dom';

export default function ProductCard({ mueble }) {
  const tieneDescuento = mueble.discount_price && mueble.discount_price < mueble.price;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <div className="relative h-56 bg-slate-100 w-full overflow-hidden group">
        {tieneDescuento && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">OFERTA</div>
        )}
        {mueble.image_url ? (
          <img src={mueble.image_url} alt={mueble.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">[Sin Imagen]</div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2">{mueble.name}</h3>
        <div className="mt-auto pt-4 flex flex-col">
          {tieneDescuento ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-600">${mueble.discount_price.toLocaleString('es-MX')}</span>
              <span className="text-sm text-slate-400 line-through">${mueble.price.toLocaleString('es-MX')}</span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-slate-800">${mueble.price.toLocaleString('es-MX')}</span>
          )}
          <span className={`text-sm mt-1 font-medium ${mueble.is_available ? 'text-emerald-500' : 'text-red-500'}`}>
            {mueble.is_available ? '✓ En Stock' : '✗ Agotado'}
          </span>
        </div>
        {mueble.is_available ? (
          <Link to={`/mueble/${mueble.id}`} className="mt-5 w-full py-2 rounded-md font-semibold transition-colors bg-slate-800 text-white hover:bg-slate-700 text-center block">
            Ver detalles
          </Link>
        ) : (
          <button disabled className="mt-5 w-full py-2 rounded-md font-semibold bg-slate-200 text-slate-400 cursor-not-allowed">Sin inventario</button>
        )}
      </div>
    </div>
  );
}