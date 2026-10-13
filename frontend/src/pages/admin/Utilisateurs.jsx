import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminUtilisateurs() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', password: '', specialite: '',
    role_id: '', project_ids: []
  });

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, projRes] = await Promise.all([
        api.get('/users'), api.get('/roles'), api.get('/projects')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setProjectsList(projRes.data);
    } catch (error) { console.error(error); }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        nom: user.nom, prenom: user.prenom, email: user.email,
        password: '', specialite: user.specialite || '',
        role_id: user.role_id,
        project_ids: user.projects.map(p => p.id)
      });
    } else {
      setFormData({
        nom: '', prenom: '', email: '', password: '', specialite: '',
        role_id: roles[0]?.id || '', project_ids: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) { console.error(err); alert("Erreur lors de l'enregistrement"); }
  };

  const handleDelete = async (id) => {
    if (currentUser && currentUser.id === id) {
      alert("Vous ne pouvez pas vous supprimer vous-même.");
      return;
    }
    if (!window.confirm("Supprimer cet utilisateur?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) { console.error(err); }
  };

  const toggleProject = (projectId) => {
    setFormData(prev => {
      const isSelected = prev.project_ids.includes(projectId);
      if (isSelected) {
        return { ...prev, project_ids: prev.project_ids.filter(id => id !== projectId) };
      } else {
        return { ...prev, project_ids: [...prev.project_ids, projectId] };
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
        <button onClick={() => handleOpenModal()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouvel Utilisateur
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle / Spécialité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projets Assignés</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{u.prenom} {u.nom}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {u.role?.name}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">{u.specialite}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {u.projects?.map(p => (
                      <span key={p.id} className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                        {p.nom_projet}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleOpenModal(u)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  {currentUser?.id !== u.id ? (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button disabled className="text-gray-300 cursor-not-allowed" title="Vous ne pouvez pas vous supprimer vous-même">
                      <TrashIcon className="w-5 h-5" />
                    </button>
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
            <h3 className="text-xl font-bold mb-4">{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{editingUser ? 'Mot de passe (laisser vide pour ne pas modifier)' : 'Mot de passe'}</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} {...(!editingUser && {required: true})} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Spécialité</label>
                  <input type="text" value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <select value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})} required className="mt-1 w-full border border-gray-300 rounded-md p-2">
                    {roles.map(r => (
                      <option 
                        key={r.id} 
                        value={r.id}
                        disabled={currentUser?.id === editingUser?.id && String(r.id) !== String(editingUser?.role_id)}
                      >
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.role_id == roles.find(r => r.name === 'User')?.id && (
                  <div className="col-span-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projets Assignés</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-gray-200 p-3 rounded-md bg-gray-50 max-h-64 overflow-y-auto">
                      {projectsList.map(p => (
                        <label key={p.id} className="flex items-center space-x-2 text-sm">
                          <input 
                            type="checkbox" 
                            checked={formData.project_ids.includes(p.id)}
                            onChange={() => toggleProject(p.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span>{p.nom_projet}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
