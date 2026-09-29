import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

export default function RadarComparison({ dimensionScores, candidateName }) {
  if (!dimensionScores || Object.keys(dimensionScores).length === 0) {
    return <div className="text-sm text-slate-500 italic">No dimension data available.</div>;
  }

  // Format data for Recharts Radar
  const data = [
    {
      subject: 'Cleanliness',
      You: dimensionScores.cleanliness?.user_val || 3,
      Candidate: dimensionScores.cleanliness?.candidate_val || 3,
      fullMark: 5,
    },
    {
      subject: 'Sleep Cycle',
      You: dimensionScores.sleep_schedule?.user_val || 3,
      Candidate: dimensionScores.sleep_schedule?.candidate_val || 3,
      fullMark: 5,
    },
    {
      subject: 'Social / Guests',
      You: dimensionScores.social_battery?.user_val || 3,
      Candidate: dimensionScores.social_battery?.candidate_val || 3,
      fullMark: 5,
    },
    {
      subject: 'Noise Tolerance',
      You: dimensionScores.noise_tolerance?.user_val || 3,
      Candidate: dimensionScores.noise_tolerance?.candidate_val || 3,
      fullMark: 5,
    },
    {
      subject: 'WFH / Study',
      You: dimensionScores.work_routine?.user_val || 3,
      Candidate: dimensionScores.work_routine?.candidate_val || 3,
      fullMark: 5,
    },
    {
      subject: 'Kitchen Sharing',
      You: dimensionScores.kitchen_sharing?.user_val || 3,
      Candidate: dimensionScores.kitchen_sharing?.candidate_val || 3,
      fullMark: 5,
    },
  ];

  return (
    <div className="w-full h-72 flex flex-col items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Radar
            name="You"
            dataKey="You"
            stroke="#4f46e5"
            fill="#6366f1"
            fillOpacity={0.45}
          />
          <Radar
            name={candidateName || "Candidate"}
            dataKey="Candidate"
            stroke="#0ea5e9"
            fill="#38bdf8"
            fillOpacity={0.45}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
