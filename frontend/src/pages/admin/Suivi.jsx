import { useState, useEffect } from 'react';
import api from '../../lib/axios';

export default function AdminSuivi() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) { console.error('Error fetching projects:', error); }
  };

  const fetchProblems = async (projectId) => {
    try {
      const { data } = await api.get('/problems');
      setProblems(data.filter(p => p.project_id === projectId && !p.resolved));
    } catch (error) { console.error('Error fetching problems:', error); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Suivi des Tâches</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Société</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tâches</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{p.nom_projet}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.nom_societe}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.tasks?.length || 0}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => { setSelectedProject(p); fetchProblems(p.id); }} className="text-blue-600 hover:text-blue-900">
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-full sm:max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
              <h3 className="text-xl font-bold">Tâches: {selectedProject.nom_projet}</h3>
              <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
            </div>
            
            <div className="overflow-y-auto flex-1 border border-gray-200 rounded-md">
              {selectedProject.tasks?.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border-b border-gray-200">Aucune tâche enregistrée.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Date</th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Type</th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Numéro</th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Statut</th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Créé par</th>
                        <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réalisé par</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedProject.tasks?.map(t => (
                        <tr key={t.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium border-r bg-gray-50">{t.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 border-r">{t.task_type}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 border-r">{t.task_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 border-r">{t.status}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 border-r">{t.user?.nom}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{t.user?.nom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {problems.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center mb-2">
                    <span className="text-red-600 text-lg mr-2">⚠️</span>
                    <h4 className="text-red-800 font-semibold">Problèmes signalés</h4>
                  </div>
                  <ul className="space-y-2">
                    {problems.map(p => (
                      <li key={p.id} className="bg-white p-3 rounded border border-red-100 shadow-sm flex justify-between items-center">
                        <div className="text-red-700 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <strong className="font-bold">{p.user?.nom}</strong>
                                <span className="text-xs bg-red-100 px-2 py-0.5 rounded-full font-bold">
                                    N° Tâche: {p.task?.task_id || 'Général'}
                                </span>
                                <span className="text-xs font-medium text-gray-500">
                                    Le: {p.date ? new Date(p.date).toLocaleDateString('fr-FR') : 'Non définie'}
                                </span>
                            </div>
                            <p className="text-gray-700 text-sm italic">"{p.description}"</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                              onClick={async () => {
                                  if (window.confirm('Marquer ce problème comme résolu ?')) {
                                      try {
                                          await api.put(`/problems/${p.id}`, { resolved: true });
                                          fetchProblems(selectedProject.id);
                                      } catch (e) { console.error(e); }
                                  }
                              }}
                              className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                              title="Marquer résolu"
                          >
                              Résolu
                          </button>
                          <button 
                              onClick={async () => {
                                  if(window.confirm('Supprimer ce problème ?')) {
                                      try {
                                          await api.delete(`/problems/${p.id}`);
                                          fetchProblems(selectedProject.id);
                                      } catch(e) { console.error(e); }
                                  }
                              }}
                              className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="Supprimer le problème"
                          >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
