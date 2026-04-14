import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  // Pestaña activa: 'productos' o 'promociones'
  const [tabActiva, setTabActiva] = useState('productos');

  // ==========================================
  // ESTADOS: PRODUCTOS
  // ==========================================
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [archivos, setArchivos] = useState([]); 
  const [previews, setPreviews] = useState([]); 

  // ==========================================
  // ESTADOS: PROMOCIONES (HERO)
  // ==========================================
  const [promociones, setPromociones] = useState([]);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoSubtitle, setPromoSubtitle] = useState('');
  const [promoFile, setPromoFile] = useState(null);
  const [promoPreview, setPromoPreview] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        cargarProductos();
        cargarPromociones();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        cargarProductos();
        cargarPromociones();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ==========================================
  // LÓGICA: PRODUCTOS
  // ==========================================
  const cargarProductos = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error) setProductos(data);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && (files.length < 4 || files.length > 10)) {
      toast.error('Debes subir entre 4 y 10 imágenes por producto.');
      e.target.value = ''; 
      setArchivos([]);
      setPreviews([]);
      return;
    }
    setArchivos(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const handleAgregarMueble = async (e) => {
    e.preventDefault();
    if (archivos.length < 4) {
      toast.error('Por favor selecciona al menos 4 imágenes.');
      return;
    }
    setCargando(true);
    let urlsGaleria = []; 

    if (archivos.length > 0) {
      toast.info(`Subiendo ${archivos.length} imágenes...`);
      for (const file of archivos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('muebles_imagenes').upload(fileName, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('muebles_imagenes').getPublicUrl(fileName);
          urlsGaleria.push(data.publicUrl);
        }
      }
    }

    const nuevoMueble = {
      name: nombre, description: descripcion, price: parseFloat(precio),
      is_available: true, image_url: urlsGaleria.length > 0 ? urlsGaleria[0] : null, gallery: urlsGaleria 
    };

    const { error } = await supabase.from('products').insert([nuevoMueble]);
    if (!error) {
      toast.success('¡Mueble agregado exitosamente!');
      setNombre(''); setDescripcion(''); setPrecio('');
      setArchivos([]); setPreviews([]);
      document.getElementById('file-upload').value = ''; 
      cargarProductos();
    } else toast.error('Error al guardar en la base de datos');
    setCargando(false);
  };

  const handleBorrarMueble = async (id) => {
    if (!window.confirm("¿Seguro que deseas borrar este mueble?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) { toast.info('Mueble eliminado'); cargarProductos(); }
  };

  // ==========================================
  // LÓGICA: PROMOCIONES
  // ==========================================
  const cargarPromociones = async () => {
    const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (!error) setPromociones(data);
  };

  const handlePromoFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPromoFile(file);
      setPromoPreview(URL.createObjectURL(file));
    }
  };

  const handleAgregarPromo = async (e) => {
    e.preventDefault();
    if (!promoFile) {
      toast.error('Selecciona una imagen para el banner.');
      return;
    }
    setCargando(true);
    toast.info('Subiendo banner promocional...');

    const fileExt = promoFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Subir imagen al bucket de promociones
    const { error: uploadError } = await supabase.storage.from('promociones').upload(fileName, promoFile);
    
    if (uploadError) {
      toast.error('Error al subir la imagen.');
      setCargando(false);
      return;
    }

    // Obtener la URL pública
    const { data } = supabase.storage.from('promociones').getPublicUrl(fileName);
    
    // Guardar en la tabla de promociones
    const nuevaPromo = {
      title: promoTitle,
      subtitle: promoSubtitle,
      image_url: data.publicUrl,
      is_active: true
    };

    const { error } = await supabase.from('promotions').insert([nuevaPromo]);

    if (!error) {
      toast.success('¡Promoción agregada!');
      setPromoTitle(''); setPromoSubtitle(''); setPromoFile(null); setPromoPreview(null);
      document.getElementById('promo-upload').value = '';
      cargarPromociones();
    } else {
      toast.error('Error al guardar la promoción.');
    }
    setCargando(false);
  };

  const handleTogglePromo = async (id, currentStatus) => {
    const { error } = await supabase.from('promotions').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) {
      toast.success(currentStatus ? 'Promoción desactivada' : 'Promoción activada');
      cargarPromociones();
    }
  };

  const handleBorrarPromo = async (id) => {
    if (!window.confirm("¿Seguro que deseas borrar este banner?")) return;
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (!error) { toast.info('Promoción eliminada'); cargarPromociones(); }
  };

  // ==========================================
  // LÓGICA: AUTH
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: e.target.email.value, password: e.target.password.value });
    if (error) toast.error('Credenciales incorrectas.');
    else toast.success('¡Bienvenido!');
    setCargando(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Sesión cerrada');
  };

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Acceso Privado</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" name="email" required className="w-full px-4 py-2 border rounded-md" placeholder="Correo" />
            <input type="password" name="password" required className="w-full px-4 py-2 border rounded-md" placeholder="Contraseña" />
            <button type="submit" disabled={cargando} className="w-full bg-slate-800 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-700">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
        <button onClick={handleLogout} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md font-semibold transition-colors">Cerrar Sesión</button>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="flex space-x-4 mb-8 border-b border-slate-200">
        <button 
          onClick={() => setTabActiva('productos')}
          className={`pb-4 px-2 font-semibold text-lg transition-colors border-b-2 ${tabActiva === 'productos' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          📦 Catálogo de Muebles
        </button>
        <button 
          onClick={() => setTabActiva('promociones')}
          className={`pb-4 px-2 font-semibold text-lg transition-colors border-b-2 ${tabActiva === 'promociones' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          🌟 Banners y Promociones
        </button>
      </div>
      
      {/* ========================================== */}
      {/* VISTA DE PRODUCTOS */}
      {/* ========================================== */}
      {tabActiva === 'productos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Agregar Mueble</h3>
            <form onSubmit={handleAgregarMueble} className="space-y-4">
              <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Nombre" />
              <input type="number" required value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Precio" />
              <textarea required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows="3" placeholder="Descripción"></textarea>
              <div className="bg-slate-50 p-4 rounded-md border border-dashed border-slate-300">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Galería (Mín 4, Máx 10)</label>
                <input id="file-upload" type="file" multiple accept="image/*" onChange={handleFileSelect} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {previews.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {previews.map((src, index) => <img key={index} src={src} alt="preview" className="h-16 w-16 object-cover rounded border" />)}
                  </div>
                )}
              </div>
              <button type="submit" disabled={cargando} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-md transition-colors shadow-md">
                {cargando ? 'Guardando...' : '+ Guardar Mueble'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Inventario Actual ({productos.length})</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-3 px-2">Miniatura</th>
                  <th className="py-3 px-2">Producto</th>
                  <th className="py-3 px-2">Precio</th>
                  <th className="py-3 px-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2">
                      {producto.image_url ? <img src={producto.image_url} alt={producto.name} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-slate-200 rounded text-xs text-slate-400 flex items-center justify-center">Sin foto</div>}
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-800">{producto.name}</td>
                    <td className="py-3 px-2">${producto.price.toLocaleString('es-MX')}</td>
                    <td className="py-3 px-2">
                      <button onClick={() => handleBorrarMueble(producto.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VISTA DE PROMOCIONES (HERO) */}
      {/* ========================================== */}
      {tabActiva === 'promociones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="text-xl font-bold text-emerald-700 mb-4">Nuevo Banner Hero</h3>
            <form onSubmit={handleAgregarPromo} className="space-y-4">
              <input type="text" required value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Título (Ej. Oferta Navideña)" />
              <input type="text" required value={promoSubtitle} onChange={(e) => setPromoSubtitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Subtítulo (Opcional)" />
              
              <div className="bg-emerald-50 p-4 rounded-md border border-dashed border-emerald-300">
                <label className="block text-sm font-semibold text-emerald-800 mb-2">Imagen de Fondo (Horizontal)</label>
                <input id="promo-upload" type="file" accept="image/*" onChange={handlePromoFileSelect} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200" />
                {promoPreview && (
                  <img src={promoPreview} alt="preview" className="mt-3 w-full h-32 object-cover rounded border border-emerald-200 shadow-sm" />
                )}
              </div>

              <button type="submit" disabled={cargando} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-md transition-colors shadow-md">
                {cargando ? 'Guardando...' : '+ Activar Banner'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Banners Activos y Pasados</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="py-3 px-2">Vista Previa</th>
                  <th className="py-3 px-2">Textos</th>
                  <th className="py-3 px-2">Estado</th>
                  <th className="py-3 px-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {promociones.map((promo) => (
                  <tr key={promo.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2">
                      <img src={promo.image_url} alt={promo.title} className="w-24 h-12 object-cover rounded shadow-sm" />
                    </td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-800 text-sm">{promo.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{promo.subtitle}</p>
                    </td>
                    <td className="py-3 px-2">
                      <button 
                        onClick={() => handleTogglePromo(promo.id, promo.is_active)}
                        className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${promo.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                      >
                        {promo.is_active ? 'Visible en Tienda' : 'Oculto'}
                      </button>
                    </td>
                    <td className="py-3 px-2">
                      <button onClick={() => handleBorrarPromo(promo.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}