import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../services/AuthService';
import api from '../services/api';
import mqttService from '../services/mqttService';
import EventList from './EventList';
import StatsCard from './StatsCard';
import AlertButton from './AlertButton';
import RealTimeChart from './RealTimeChart';

function Dashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, todayEvents: 0, lastEvent: null });
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState([]);
  const mqttCallbacksRef = useRef({});

  const loadEvents = useCallback(async () => {
    if (!user?.deviceId) return;
    try {
      const response = await api.get('/events', {
        params: { device_id: user.deviceId, limit: 50 }
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.deviceId]);

  const loadStats = useCallback(async () => {
    if (!user?.deviceId) return;
    try {
      const response = await api.get('/stats', {
        params: { device_id: user.deviceId }
      });
      setStats(response.data.stats || { totalEvents: 0, todayEvents: 0, lastEvent: null });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, [user?.deviceId]);

  useEffect(() => {
    if (!user?.deviceId) return;

    loadEvents();
    loadStats();
  }, [user?.deviceId, loadEvents, loadStats]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  useEffect(() => {
    if (!user?.deviceId) return;

    const eventTopic = `medibox/${user.deviceId}/event`;
    const alertTopic = `medibox/${user.deviceId}/alert`;
    
    // Clean up previous callbacks
    Object.keys(mqttCallbacksRef.current).forEach(topic => {
      mqttService.unsubscribe(topic);
    });
    mqttCallbacksRef.current = {};

    // Create event callback
    const eventCallback = (data) => {
      console.log('New real-time event:', data);
      const event = {
        id: Date.now(),
        device_id: data.device_id || user.deviceId,
        pill_removed: data.pill_removed || true,
        weight: data.weight,
        weight_diff: data.weight_diff,
        timestamp: data.timestamp,
        created_at: new Date().toISOString()
      };
      setEvents(prev => [event, ...prev].slice(0, 50));
      setRealtimeData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString(),
          weight: data.weight || 0,
          weightDiff: data.weight_diff || 0
        }];
        return newData.slice(-20);
      });
      // Load stats asynchronously without blocking
      loadStats().catch(err => console.error('Error loading stats:', err));
    };

    // Create alert callback
    const alertCallback = (data) => {
      console.log('Alert received:', data);
      // Use non-blocking notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('MediMind Pro', {
          body: data.message || 'New alert received',
          icon: '/favicon.ico' // Add icon if available
        });
      } else if ('Notification' in window && Notification.permission === 'default') {
        // Permission not yet requested, request it
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('MediMind Pro', {
              body: data.message || 'New alert received'
            });
          } else {
            // Fallback to alert if permission denied
            alert(`Alert: ${data.message || 'New alert received'}`);
          }
        });
      } else {
        // Fallback to alert if notifications not available
        alert(`Alert: ${data.message || 'New alert received'}`);
      }
    };

    // Register callbacks
    mqttCallbacksRef.current[eventTopic] = eventCallback;
    mqttCallbacksRef.current[alertTopic] = alertCallback;
    mqttService.onMessage(eventTopic, eventCallback);
    mqttService.onMessage(alertTopic, alertCallback);
    
    // Connect MQTT
    mqttService.connect(user.deviceId);

    // Cleanup on unmount or user change
    return () => {
      Object.keys(mqttCallbacksRef.current).forEach(topic => {
        mqttService.unsubscribe(topic);
      });
      mqttCallbacksRef.current = {};
      mqttService.disconnect();
    };
  }, [user?.deviceId, loadStats]);

  const handleRefresh = useCallback(() => {
    loadEvents();
    loadStats();
  }, [loadEvents, loadStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MediMind Pro</h1>
            <p className="text-sm text-gray-600">Device: {user?.deviceId}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Hello, {user?.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Events"
            value={stats.totalEvents}
            icon="💊"
          />
          <StatsCard
            title="Today's Events"
            value={stats.todayEvents}
            icon="📅"
          />
          <StatsCard
            title="Last Event"
            value={stats.lastEvent ? new Date(stats.lastEvent.created_at).toLocaleString() : 'N/A'}
            icon="⏰"
          />
        </div>

        {/* Alert Button */}
        <div className="mb-8">
          <AlertButton deviceId={user?.deviceId} />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Real-Time Chart</h2>
          <RealTimeChart data={realtimeData} />
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Events</h2>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : (
            <EventList events={events} />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

