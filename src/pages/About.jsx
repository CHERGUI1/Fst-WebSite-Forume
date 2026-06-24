export default function About() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8">
      {/* قسم العنوان التعريفي */}
      <section className="text-center space-y-4 max-w-3xl mx-auto relative">
        {/* توهج خلفي جمالي */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-900/10 dark:bg-blue-600/10 rounded-full blur-3xl -z-10" />
        
        <span className="inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
          À propos d'UniShare
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-300 bg-clip-text text-transparent leading-tight">
          Partager le savoir, <br className="hidden sm:block" /> propulser l'excellence.
        </h1>
        <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          UniShare est une initiative étudiante collaborative qui centralise les ressources académiques pour offrir à chacun les clés de sa réussite.
        </p>
      </section>

      {/* كروت المهام والقيم */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Centralisation Intelligente",
            description: "Fini les dossiers éparpillés et les groupes perdus. Retrouvez vos cours, TD et examens classés de façon ergonomique par cycle et semestre.",
            icon: (
              <svg className="w-6 h-6 text-blue-900 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            )
          },
          {
            title: "Esprit de Coopération",
            description: "Une plateforme construite par les étudiants, pour les étudiants. Partagez vos ressources pour guider les promotions actuelles et futures.",
            icon: (
              <svg className="w-6 h-6 text-indigo-900 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )
          },
          {
            title: "Validation par les Pairs",
            description: "Chaque ressource partagée fait l'objet d'une vérification pour garantir des supports d'étude fiables, clairs et conformes au programme.",
            icon: (
              <svg className="w-6 h-6 text-emerald-900 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )
          }
        ].map((card, idx) => (
          <div key={idx} className="p-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center border border-slate-100 dark:border-zinc-800/80">
                {card.icon}
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* قسم الإحصائيات والفلسفة */}
      <section className="bg-slate-900 dark:bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 translate-x-12">
          <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Notre Philosophie</h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Nous pensons que l'éducation doit être collaborative et accessible. En supprimant les barrières de l'information académique, nous aidons chaque étudiant à se concentrer sur l'essentiel : apprendre, comprendre et exceller.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {['Accessibilité', 'Partage libre', 'Fiabilité'].map((val) => (
                <span key={val} className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white border border-white/5">
                  {val}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-center">
            {[
              { label: "Spécialisations", val: "4 Filiales" },
              { label: "Ressources à jour", val: "100% Validées" },
              { label: "Fichiers & Vidéos", val: "1.5K+ Supports" },
              { label: "Coût d'utilisation", val: "Gratuit à vie" }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <div className="text-xl sm:text-2xl font-extrabold text-blue-400">{stat.val}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* كارت الدعم والتبني */}
      <section className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-md relative overflow-hidden">
        {/* تأثيرات توهج ملونة */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
          Soutenir le Projet UniShare
        </h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed mb-8">
          UniShare est maintenu bénévolement par la communauté. Votre soutien financier ou votre contribution technique nous permet de payer les serveurs et d'améliorer la plateforme.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#donation"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-900 dark:bg-blue-600 text-white font-semibold hover:bg-blue-800 dark:hover:bg-blue-500 transition shadow-sm hover:shadow-md text-sm cursor-pointer"
          >
            Faire un don ❤️
          </a>
          <a
            href="https://github.com/CHERGUI1/Fst-WebSite-Forume"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 font-semibold hover:bg-slate-200 dark:hover:bg-zinc-600 transition text-sm cursor-pointer border border-slate-200 dark:border-zinc-600"
          >
            Contribuer sur GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
