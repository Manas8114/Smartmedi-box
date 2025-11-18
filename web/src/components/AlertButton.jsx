import React, { useState } from 'react';
import api from '../services/api';

function AlertButton({ deviceId }) {
  const [message, setMessage] = useState('Time to take your medication');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendAlert = async () => {
    if (!deviceId) {
      alert('Device ID not available');
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await api.post('/alert', {
        device_id: deviceId,
        message: message
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending alert:', error);
      alert('Error sending alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Send Alert</h3>
      <div className="flex space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Alert message"
        />
        <button
          onClick={handleSendAlert}
          disabled={loading}
          className={`px-6 py-2 rounded-md font-medium text-white ${
            success
              ? 'bg-green-600'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } disabled:opacity-50`}
        >
          {loading ? 'Sending...' : success ? '✓ Sent' : 'Send Alert'}
        </button>
      </div>
    </div>
  );
}

export default AlertButton;

