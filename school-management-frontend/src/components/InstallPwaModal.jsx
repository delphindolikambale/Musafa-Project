import React, { useState } from 'react';
import { usePWA } from '../hooks/usePWA';
import { Download, X } from 'lucide-react';

const InstallPwaModal = () => {
  const { isInstallable, promptInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(true);

  if (!isInstallable || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] w-[90%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="pr-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Installer l'application</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ajoutez notre système à votre écran d'accueil pour un accès plus rapide.
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <button
        onClick={promptInstall}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
      >
        <Download size={16} />
        Installer maintenant
      </button>
    </div>
  );
};

export default InstallPwaModal;