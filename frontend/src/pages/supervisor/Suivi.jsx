import { useState, useEffect } from 'react';
import api from '../../lib/axios';

export default function SupervisorSuivi(){ const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) { console.error('Error fetching projects:', error); }
  }

  const fetchProblems = async (projectId) => {
    try {
      const { data } = await api.get('/problems');
      setProblems(data.filter(p => p.project_id === projectId && !p.resolved));
    } catch (error) { console.error('Error fetching problems:', error); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Suivi des Tâches - Vue Globale</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Nom du Projet</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Société</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Contrat</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 text-lg">{p.nom_projet}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.tasks?.length || 0} tâches enregistrées
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{p.nom_societe}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {p.contrat_start} → {p.contrat_end}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setSelectedProject(p); fetchProblems(p.id); }} className="bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors">
                    Voir Tâches
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-full sm:max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-blue-600 to-indigo-700 flex flex-col sm:flex-row sm:justify-between sm:items-center text-white gap-4">
              <div>
                <h3 className="text-2xl font-bold">{selectedProject.nom_projet}</h3>
                <p className="text-blue-100 text-sm mt-1">{selectedProject.nom_societe}</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-white hover:text-red-200 transition-colors bg-white/20 hover:bg-white/30 rounded-full p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {selectedProject.tasks?.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p className="text-lg">Aucune tâche documentée pour le moment.</p>
                </div>
              ) : (
                <div className="border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="w-1/6 px-6 py-4 text-left font-semibold text-gray-700 tracking-wider border-r border-gray-200 border-b-2 border-b-gray-300">Date</th>
                          <th className="w-1/6 px-6 py-4 text-left font-semibold text-gray-700 tracking-wider border-r border-gray-200 border-b-2 border-b-gray-300">Type</th>
                          <th className="w-1/6 px-6 py-4 text-left font-semibold text-gray-700 tracking-wider border-r border-gray-200 border-b-2 border-b-gray-300">Numéro</th>
                          <th className="w-1/6 px-6 py-4 text-left font-semibold text-gray-700 tracking-wider border-r border-gray-200 border-b-2 border-b-gray-300">Statut</th>
                          <th className="w-1/6 px-6 py-4 text-left font-semibold text-gray-700 tracking-wider border-r border-gray-200 border-b-2 border-b-gray-300">Créé par</th>
                          <th className="w-1/6 px-6 py-4 text-left font-semibold text-gray-700 tracking-wider border-b-2 border-b-gray-300">Réalisé par</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedProject.tasks?.slice().reverse().map((t, idx) => (
                          <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="px-6 py-4 align-top border-r border-gray-200 tracking-tight text-indigo-700 font-semibold">{t.date}</td>
                            <td className="px-6 py-4 align-top text-gray-700">{t.task_type}</td>
                            <td className="px-6 py-4 align-top text-gray-700">{t.task_id}</td>
                            <td className="px-6 py-4 align-top text-gray-700">{t.status}</td>
                            <td className="px-6 py-4 align-top text-gray-700">{t.user?.nom}</td>
                            <td className="px-6 py-4 align-top text-gray-700">{t.user?.nom}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {problems.length > 0 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-red-600 text-xl mr-2">⚠️</span>
                    <h4 className="text-red-800 font-bold text-lg">Problèmes Signalés</h4>
                  </div>
                  <ul className="space-y-2">
                    {problems.map(p => (
                      <li key={p.id} className="bg-white p-3 rounded border-l-4 border-red-400 shadow-sm flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <strong className="text-red-700 font-bold">{p.user?.nom}</strong>
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full uppercase">Tâche: {p.task?.task_id || 'Général'}</span>
                            <span className="text-[11px] text-gray-500 font-medium">Date du problème: {p.date ? new Date(p.date).toLocaleDateString('fr-FR') : '—'}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{p.description}</p>
                          <div className="text-[10px] text-gray-400 mt-1 italic">Signalé le {new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                        <button 
                            onClick={async () => {
                                if(window.confirm('Supprimer ce problème ?')) {
                                    try {
                                        await api.delete(`/problems/${p.id}`);
                                        fetchProblems(selectedProject.id);
                                    } catch(e) { console.error(e); }
                                }
                            }}
                            className="text-red-300 hover:text-red-600 transition-colors p-1"
                            title="Supprimer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-white border-t flex justify-end">
              <button onClick={() => setSelectedProject(null)} className="px-6 py-2 bg-gray-600 text-white shadow hover:bg-gray-700 rounded-md transition-colors font-medium">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}