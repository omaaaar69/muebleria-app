import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-lg font-bold tracking-wider mb-4">MUEBLES & CO.</h3>
          <p className="text-sm text-slate-400">
            Transformando espacios con diseño, confort y calidad. Tu hogar merece lo mejor.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Inicio</Link></li>
            <li><Link to="/catalogo" className="hover:text-emerald-400 transition-colors">Catálogo Completo</Link></li>
            <li><Link to="/admin" className="hover:text-emerald-400 transition-colors">Acceso Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Atención al Cliente</h4>
          <p className="text-sm text-slate-400">Lun - Vie: 9:00 AM - 6:00 PM</p>
          <p className="text-sm text-slate-400 mt-2">contacto@mueblesco.com</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
        &copy; {new Date().getFullYear()} Muebles & Co. Todos los derechos reservados.
      </div>
    </footer>
  );
}