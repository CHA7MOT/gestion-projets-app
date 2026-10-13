import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';

export default function UserProjets() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({ date: '', task_type: '', task_id: '', status: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [problemData, setProblemData] = useState({ description: '', date: new Date().toISOString().split('T')[0], task_id: null });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) { console.error(error); }
  };

  const handleOpenProject = (project) => {
    setSelectedProject(project);
    setFormData({ date: new Date().toISOString().split('T')[0], task_type: '', task_id: '', status: '', description: '' });
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({ date: task.date, task_type: task.task_type, task_id: task.task_id, status: task.status, description: task.description });
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Supprimer cette tâche?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjects();
      const res = await api.get(`/projects/${selectedProject.id}`);
      setSelectedProject(res.data);
    } catch (error) { console.error('Erreur suppression tâche', error); }
  };

  const handleSubmitProblem = async () => {
    if (!problemData.description.trim() || !problemData.task_id || !problemData.date) {
        alert('Veuillez remplir tous les champs du problème (description, date et tâche).');
        return;
    }
    try {
      await api.post('/problems', {
        project_id: selectedProject.id,
        task_id: problemData.task_id,
        date: problemData.date,
        description: problemData.description
      });
      setProblemData({ description: '', date: new Date().toISOString().split('T')[0], task_id: null });
      setShowProblemForm(false);
      alert('Problème signalé avec succès.');
    } catch (error) {
      console.error('Erreur signalement problème', error);
      alert(error.response?.data?.message || 'Erreur lors du signalement.');
    }
  };

  const openProblemFormForTask = (task) => {
    setProblemData({ 
        description: '', 
        date: new Date().toISOString().split('T')[0], 
        task_id: task.id,
        task_display_id: task.task_id 
    });
    setShowProblemForm(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, {
          ...formData
        });
      } else {
        await api.post('/tasks', {
          project_id: selectedProject.id,
          ...formData
        });
      }
      fetchProjects();
      const res = await api.get(`/projects/${selectedProject.id}`);
      setSelectedProject(res.data);
      setFormData({ date: new Date().toISOString().split('T')[0], task_type: '', task_id: '', status: '', description: '' });
      setEditingTask(null);
    } catch (error) { 
        console.error('Erreur sauvegarde tâche', error); 
        alert(error.response?.data?.message || 'Une erreur est survenue.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Projets Assignés</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow">
            Vous n'avez aucun projet assigné.
          </div>
        ) : (
          projects.map((p) => (
            <div key={p.id} 
                 onClick={() => handleOpenProject(p)}
                 className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group">
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {p.nom_projet}
                {p.status === 'closed' && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Fermé</span>}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{p.nom_societe}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                  {p.tasks?.length || 0} tâches
                </span>
                <span className="text-gray-400">
                  Fin: {p.contrat_end}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-full sm:max-w-5xl max-h-[90vh] flex flex-col md:flex-row gap-6 overflow-hidden">
            
            <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg flex flex-col overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  {editingTask ? 'Modifier une Tâche' : 'Ajouter une Tâche'}
                </h3>
              </div>
              
              {selectedProject.status === 'closed' ? (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                  <p className="font-bold">Projet Fermé</p>
                  <p className="text-sm">Vous ne pouvez plus ajouter ou modifier de tâches sur ce projet.</p>
                </div>
              ) : (
                <form onSubmit={handleSaveTask} className="flex flex-col gap-3">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de Tâche</label>
                    <select value={formData.task_type} onChange={e => setFormData({...formData, task_type: e.target.value})} required className="w-full border border-gray-300 rounded-md p-2">
                      <option value="">Sélectionner</option>
                      <option value="Installation">Installation</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Réparation">Réparation</option>
                      <option value="Désinstallation">Désinstallation</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de Tâche (5 caractères)</label>
                    <input type="text" value={formData.task_id} onChange={e => setFormData({...formData, task_id: e.target.value})} required maxLength="5" className="w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} required className="w-full border border-gray-300 rounded-md p-2">
                      <option value="">Sélectionner</option>
                      <option value="Vient de commencer">Vient de commencer</option>
                      <option value="En cours">En cours</option>
                      <option value="Bientôt terminé">Bientôt terminé</option>
                      <option value="Terminé">Terminé</option>
                    </select>
                  </div>
                  <div className="mb-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full border border-gray-300 rounded-md p-2 resize-none" rows="2" placeholder="Décrivez les actions menées..."></textarea>
                  </div>
                  <div className="mb-4">
                    {showProblemForm && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <h4 className="text-sm font-bold text-red-800 mb-2">
                            Signaler un problème sur: {problemData.task_display_id || 'la tâche sélectionnée'}
                        </h4>
                        <div className="mb-2">
                            <label className="block text-xs font-medium text-red-700 mb-1">Date du Problème</label>
                            <input type="date" value={problemData.date} onChange={e => setProblemData({...problemData, date: e.target.value})} className="w-full border border-red-300 rounded-md p-1 text-sm" />
                        </div>
                        <textarea value={problemData.description} onChange={e => setProblemData({...problemData, description: e.target.value})} placeholder="Décrivez le problème..." className="w-full border border-red-300 rounded-md p-2 mb-2 resize-none text-sm" rows="2"></textarea>
                        <div className="flex gap-2">
                            <button type="button" onClick={handleSubmitProblem} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                            Envoyer
                            </button>
                            <button type="button" onClick={() => setShowProblemForm(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-1 px-3 rounded text-sm">
                            Annuler
                            </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {editingTask && (
                        <button type="button" onClick={() => { setEditingTask(null); setFormData({ date: new Date().toISOString().split('T')[0], task_type: '', task_id: '', status: '', description: '' }); }} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-2 rounded-md flex justify-center items-center text-sm">
                        Annuler
                        </button>
                    )}
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-md flex justify-center items-center text-sm">
                        <PlusCircleIcon className="w-5 h-5 mr-1" /> {editingTask ? 'Enregistrer' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-800">Historique: {selectedProject.nom_projet}</h3>
                <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold leading-none">&times;</button>
              </div>
              <div className="overflow-y-auto flex-1 border border-gray-200 rounded-md">
                {selectedProject.tasks?.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Aucune tâche ajoutée.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase border-r border-gray-200">Date</th>
                          <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase border-r border-gray-200">Type</th>
                          <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase border-r border-gray-200">Numéro</th>
                          <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase border-r border-gray-200">Statut</th>
                          <th className="w-1/4 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase border-r border-gray-200">Description</th>
                          <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedProject.tasks?.slice().reverse().map(t => (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-white">{t.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{t.task_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{t.task_id}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">{t.status}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 break-words whitespace-pre-wrap border-r border-gray-200">{t.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                              {selectedProject.status !== 'closed' && (
                                  <div className="flex space-x-2">
                                    <button onClick={() => openProblemFormForTask(t)} className="text-red-500 hover:text-red-700" title="Signaler un problème">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => handleEditTask(t)} className="text-indigo-600 hover:text-indigo-900">
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDeleteTask(t.id)} className="text-red-600 hover:text-red-900">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
