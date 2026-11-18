import { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import type { AppSection, NotificationItem } from '../types/autosense';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onMarkRead: (notificationId: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onNavigate: (section: AppSection) => void;
}

export function NotificationsPage({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}: NotificationsPageProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const visible = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <section className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-white">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">
            {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'} across diagnostics,
            maintenance, and device connections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0B1120] border border-slate-800 text-slate-300'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-[#0B1120] border border-slate-800 text-slate-300'
            }`}
          >
            Unread ({unreadCount})
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-200"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
        </div>
      </section>

      {visible.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <Bell className="w-8 h-8 text-blue-400 mx-auto" />
          <p className="text-sm font-medium text-white">You are all caught up</p>
          <p className="text-xs text-slate-400">
            New diagnostic findings and maintenance reminders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <article
              key={item.id}
              className={`bg-[#0F172A] border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.isRead ? 'border-slate-800 opacity-80' : 'border-blue-500/40'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="capitalize font-medium text-blue-400">{item.type}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">
                    {item.createdAtIso
                      ? new Date(item.createdAtIso).toLocaleString()
                      : 'Recent'}
                  </span>
                  {!item.isRead && (
                    <span className="text-amber-300 font-medium">· Unread</span>
                  )}
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-white">{item.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.message}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.relatedPath && (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.relatedPath as AppSection)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-200 min-h-[36px]"
                  >
                    Open
                  </button>
                )}
                {!item.isRead && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white min-h-[36px]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
