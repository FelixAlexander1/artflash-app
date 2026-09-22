import { useState } from 'react';
import { Layers, HelpCircle, LayoutGrid, PlusCircle, Sparkles, GraduationCap, Shield, UserCheck, X, LogOut } from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, role, setRole, user, setUser }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const allNavItems = [
  { id: 'flashcards', label: 'Tarjetas', icon: Layers },
  { id: 'quiz', label: 'Examen Quiz', icon: HelpCircle },
  { id: 'gallery', label: 'Catálogo', icon: LayoutGrid, teacherOnly: true }, 
  { id: 'curator', label: 'Curador (+)', icon: PlusCircle, teacherOnly: true },
];

  const navItems = allNavItems.filter((item) => !item.teacherOnly || role === 'teacher');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch('http://127.0.0.1:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Guardar Token y Usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setRole(data.user.role);
        setUser(data.user);
        setShowLoginModal(false);
        setEmail('');
        setPassword('');
      } else {
        setErrorMsg(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error en el login:', err);
      setErrorMsg('No se pudo conectar con el servidor');
    }
  };

  const handleLogout = () => {
    // Limpiar localStorage al cerrar sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setRole('student');
    setUser(null);
    
    if (activeTab === 'gallery' || activeTab === 'curator') {
      setActiveTab('flashcards');
    }
  };

  return (
    <>
      <header className="border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('flashcards')}>
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 rounded-xl shadow-md shadow-amber-500/20">
              <Sparkles size={20} />
            </div>
            <span className="font-black text-xl tracking-tight text-white hidden md:inline">
              Art<span className="text-amber-400">Flash</span>
            </span>
          </div>

          {/* Navegación */}
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Área de Usuario / Estado del Rol */}
          <div className="flex items-center gap-2">
            {role === 'teacher' ? (
              <div className="flex items-center gap-2 bg-neutral-900 p-1.5 px-3 rounded-2xl border border-amber-500/30 text-xs">
                <Shield size={15} className="text-amber-400" />
                <span className="text-white font-bold hidden lg:inline">{user?.name || 'Profesor'}</span>
                <button 
                  onClick={handleLogout} 
                  className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-rose-400 transition ml-1"
                  title="Cerrar sesión"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold rounded-xl text-xs transition"
              >
                <Shield size={15} className="text-amber-400" />
                <span>Acceso Profe</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-sm w-full relative shadow-2xl">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <UserCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Iniciar Sesión</h3>
                <p className="text-xs text-neutral-400">Panel de Docentes y Curadores</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="profe@arte.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 text-center font-semibold pt-1">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition mt-2 shadow-md shadow-amber-500/10"
              >
                Ingresar al Sistema
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}