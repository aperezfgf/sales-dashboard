
import React from 'react';
import type { Alert } from '../types';

interface AlertsListProps {
  alerts: Alert[];
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts }) => {
  const handleSendAlert = (alert: Alert) => {
    console.log('Sending alert to email/Telegram:', alert.message);
    // Placeholder: integrate email/Telegram webhook here
    alert('Alert sent: ' + alert.message);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Alerts</h2>
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {alerts.map((alert, index) => (
          <li
            key={index}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex justify-between items-start"
          >
            <span>{alert.message}</span>
            <button
              className="text-xs bg-red-500 text-white px-2 py-1 rounded ml-4 hover:bg-red-600"
              onClick={() => handleSendAlert(alert)}
            >
              Send
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
