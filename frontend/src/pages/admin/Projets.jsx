import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function AdminProjets() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [formData, setFormData] = useState({
    nom_projet: '', description: '', nom_societe: '',
    contrat_start: '', contrat_end: '', status: 'active',
    cps_file: null
  });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) { console.error('Error fetching projects:', error); }
  };

  const handleOpenModal = (project = null) => {
    setEditingProject(project);
    if (project) {
      setFormData({
        nom_projet: project.nom_projet, description: project.description || '',
        nom_societe: project.nom_societe, contrat_start: project.contrat_start,
        contrat_end: project.contrat_end, status: project.status, cps_file: null
      });
    } else {
      setFormData({
        nom_projet: '', description: '', nom_societe: '',
        contrat_start: '', contrat_end: '', status: 'active', cps_file: null
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) fd.append(key, formData[key]);
    });

    try {
      if (editingProject) {
        fd.append('_method', 'PUT');
        await api.post(`/projects/${editingProject.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce projet?")) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Projets</h2>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouveau Projet
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet / Société</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{p.nom_projet}</div>
                  <div className="text-sm text-gray-500">{p.nom_societe}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {p.contrat_start} au {p.contrat_end}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.status === 'active' ? 'Actif' : 'Fermé'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleOpenModal(p)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  {p.cps_file && (
                    <a href={`http://localhost:8000/storage/${p.cps_file}`} target="_blank" rel="noreferrer" className="ml-4 text-gray-500 hover:text-gray-700 text-xs underline">
                      Voir CPS
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingProject ? 'Modifier le projet' : 'Nouveau projet'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du Projet</label>
                  <input type="text" value={formData.nom_projet} onChange={e => setFormData({...formData, nom_projet: e.target.value})} required className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom de la Société</label>
                  <input type="text" value={formData.nom_societe} onChange={e => setFormData({...formData, nom_societe: e.target.value})} required className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2" rows="3"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Début Contrat</label>
                  <input type="date" value={formData.contrat_start} onChange={e => setFormData({...formData, contrat_start: e.target.value})} required className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fin Contrat</label>
                  <input type="date" value={formData.contrat_end} onChange={e => setFormData({...formData, contrat_end: e.target.value})} required className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2">
                    <option value="active">Actif</option>
                    <option value="closed">Fermé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fichier CPS</label>
                  <input type="file" onChange={e => setFormData({...formData, cps_file: e.target.files[0]})} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
