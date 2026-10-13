import { useState, useEffect } from 'react';
import api from '../lib/axios';
import { CheckCircleIcon, BellIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckIcon } from '@heroicons/react/24/solid';

const parseData = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch { return {}; }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Erreur chargement notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Erreur marquage lu', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      fetchNotifications();
    } catch (error) {
      console.error('Erreur marquage tout lu', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Erreur suppression notification', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <BellIcon className="w-8 h-8 mr-2 text-blue-600" />
          Mes Notifications
        </h2>
        {notifications.some(n => !n.read_at) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <CheckCircleIcon className="w-5 h-5 mr-2" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <BellIcon className="w-12 h-12 text-gray-300 mb-3" />
             <p>Vous n'avez aucune notification.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => {
              const data = parseData(notification.data);
              return (
              <div 
                key={notification.id} 
                className={`p-5 flex items-start transition-colors ${!notification.read_at ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
              >
                <div className={`mt-1 mr-4 rounded-full p-2 ${!notification.read_at ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                   {notification.read_at ? <CheckCircleIcon className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold ${!notification.read_at ? 'text-gray-900' : 'text-gray-600'}`}>
                      Projet: {data.nom_projet ?? '—'}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.read_at ? 'text-gray-800' : 'text-gray-600'}`}>
                    {data.message ?? 'Notification'}
                  </p>
                </div>
                {!notification.read_at && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="ml-4 text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
                    title="Marquer comme lu"
                  >
                    <CheckCircleIcon className="w-6 h-6" />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="ml-2 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon className="w-6 h-6" />
                </button>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
