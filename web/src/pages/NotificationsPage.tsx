import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Trash2,
  ExternalLink,
  Check,
  Filter,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { appStateService } from '../services/appStateService';
import { NotificationItem } from '../types';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    appStateService.getNotifications()
  );
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filterType === 'unread') return !n.isRead;
      if (filterType === 'all') return true;
      return n.type === filterType;
    });
  }, [notifications, filterType]);

  const handleMarkAsRead = (id: string) => {
    appStateService.markNotificationRead(id);
    setNotifications(appStateService.getNotifications());
  };

  const handleMarkAllRead = () => {
    appStateService.markAllNotificationsRead();
    setNotifications(appStateService.getNotifications());
  };

  const handleOpenLink = (n: NotificationItem) => {
    handleMarkAsRead(n.id);
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#0284C7] uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Research Event Telemetry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding dispatched docking calculations, ADMET job status, and compiled scientific dossiers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Check className="w-3.5 h-3.5 text-slate-500" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterType === 'all'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterType('unread')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterType === 'unread'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
        <button
          onClick={() => setFilterType('analysis_completed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterType === 'analysis_completed'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilterType('analysis_failed')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            filterType === 'analysis_failed'
              ? 'bg-[#0284C7] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Failed
        </button>
      </div>

      {/* Notification Items List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Notifications</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your inbox is clear. Background calculation alerts and report delivery confirmations will show up here.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.isRead
                    ? 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                    : 'bg-sky-50/50 border-sky-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        item.type === 'analysis_completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.type === 'analysis_failed'
                          ? 'bg-rose-100 text-rose-700'
                          : item.type === 'report_generated'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.type === 'analysis_completed' && <CheckCircle2 className="w-4 h-4" />}
                      {item.type === 'analysis_failed' && <AlertCircle className="w-4 h-4" />}
                      {item.type === 'report_generated' && <FileText className="w-4 h-4" />}
                      {item.type === 'attention_required' && <AlertCircle className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-xs font-bold ${item.isRead ? 'text-slate-800' : 'text-slate-900'}`}>
                          {item.title}
                        </h3>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#0284C7]" title="Unread" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                      <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400 font-mono">
                        <span>{item.timestamp.replace('T', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {item.link && (
                      <button
                        onClick={() => handleOpenLink(item)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-semibold transition-all shadow-sm"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        title="Mark read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
