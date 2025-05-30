
import React from 'react';

interface InsightBoxProps {
  insights: string[];
}

export const InsightBox: React.FC<InsightBoxProps> = ({ insights }) => {
  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6 rounded">
      <h3 className="text-lg font-semibold text-indigo-800 mb-2">AI-Generated Insights</h3>
      <ul className="list-disc pl-5 text-sm text-indigo-700">
        {insights.map((insight, index) => (
          <li key={index}>{insight}</li>
        ))}
      </ul>
    </div>
  );
};
