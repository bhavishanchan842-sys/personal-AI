import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../api';

export default function MyRequests({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load match requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setUpdatingId(requestId);
      await api.updateRequestStatus(requestId, newStatus);
      fetchRequests();
    } catch (err) {
      alert(err.message || 'Failed to update request');
    } finally {
      setUpdatingId(null);
    }
  };

  const receivedRequests = requests.filter(r => r.receiver_id === currentUser?.id);
  const sentRequests = requests.filter(r => r.sender_id === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Send className="w-4 h-4" />
            Connection Hub
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Roommate Invitations & Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your connection requests and unlock direct contact info once mutual interest is confirmed.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs">Loading connections...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Incoming Invitations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              Received Invitations ({receivedRequests.length})
            </h2>

            {receivedRequests.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No pending invitations received yet.
              </p>
            ) : (
              <div className="space-y-3">
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={req.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender.full_name}`}
                        alt={req.sender.full_name}
                        className="w-11 h-11 rounded-full object-cover border border-indigo-100"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{req.sender.full_name}</span>
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                            {req.compatibility_score}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-1.5">{req.sender.college_or_company}</p>
                        {req.message && (
                          <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 italic">
                            "{req.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action or Accepted Contacts */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'accepted')}
                            disabled={updatingId === req.id}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'rejected')}
                            disabled={updatingId === req.id}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
                          >
                            Decline
                          </button>
                        </>
                      ) : req.status === 'accepted' ? (
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Connected!
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-emerald-600" /> {req.sender.phone || '+1 (555) 234-5678'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-emerald-600" /> {req.sender.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-semibold text-[11px]">Declined</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Invitations */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              Sent Invitations ({sentRequests.length})
            </h2>

            {sentRequests.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                You haven't sent any invitations yet. Go to Find Roommates to send one!
              </p>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={req.receiver.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.receiver.full_name}`}
                        alt={req.receiver.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{req.receiver.full_name}</span>
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {req.compatibility_score}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{req.receiver.college_or_company}</p>
                      </div>
                    </div>

                    <div>
                      {req.status === 'accepted' ? (
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Accepted by {req.receiver.full_name}!
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-emerald-600" /> {req.receiver.phone || '+1 (555) 456-7890'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-emerald-600" /> {req.receiver.email}
                          </div>
                        </div>
                      ) : req.status === 'rejected' ? (
                        <span className="text-slate-400 font-semibold">Declined</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" /> Awaiting Response
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
