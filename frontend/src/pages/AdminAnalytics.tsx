import { useState, useEffect, useCallback } from 'react';
import { ANALYTICS_API } from '../config/api';

interface DashboardData {
  period_days: number;
  acquisition: {
    total_visits: number;
    unique_sessions: number;
    by_source: { source: string; count: number }[];
    by_landing_page: { path: string; count: number }[];
    bounce_rate: number;
  };
  engagement: {
    avg_pages_per_session: number;
    top_pages: { path: string; views: number }[];
    top_ctas: { label: string; clicks: number }[];
  };
  conversion: {
    registrations: number;
    volunteers: number;
    partner_applications: number;
    scenariste_applications: number;
    helloasso_clicks: number;
    contact_submissions: number;
  };
  partners: {
    total_profile_views: number;
    total_website_clicks: number;
    conversion_rate: number;
  };
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-stone-900 border border-white/10 rounded-xl p-4 sm:p-6">
      <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-stone-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);

  const changePeriod = useCallback((p: number) => {
    setLoading(true);
    setPeriod(p);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${ANALYTICS_API}/admin/dashboard?period=${period}`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(d => { if (!cancelled) setData(d); })
      .catch((err) => { if (import.meta.env.DEV) console.error(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  if (loading) return <div className="p-8 text-stone-400">Chargement...</div>;
  if (!data) return <div className="p-8 text-red-400">Erreur de chargement</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <div className="flex gap-2">
          {[7, 14, 30].map(p => (
            <button
              key={p}
              onClick={() => changePeriod(p)}
              className={`px-3 py-1 rounded-lg text-sm ${
                period === p
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              {p}j
            </button>
          ))}
        </div>
      </div>

      {/* Acquisition */}
      <h2 className="text-lg font-semibold text-amber-500 mb-4">Acquisition</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Visites totales" value={data.acquisition.total_visits} />
        <StatCard label="Sessions uniques" value={data.acquisition.unique_sessions} />
        <StatCard label="Taux de rebond" value={`${Math.round(data.acquisition.bounce_rate * 100)}%`} />
        <StatCard label="Pages/session" value={data.engagement.avg_pages_per_session} />
      </div>

      {/* Sources */}
      {data.acquisition.by_source.length > 0 && (
        <div className="bg-stone-900 border border-white/10 rounded-xl p-4 sm:p-6 mb-8">
          <h3 className="text-white font-semibold mb-3">Sources d'acquisition</h3>
          <div className="space-y-2">
            {data.acquisition.by_source.map(s => (
              <div key={s.source} className="flex justify-between text-sm">
                <span className="text-stone-300">{s.source}</span>
                <span className="text-amber-500 font-mono">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement */}
      <h2 className="text-lg font-semibold text-amber-500 mb-4">Engagement</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Top pages */}
        <div className="bg-stone-900 border border-white/10 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold mb-3">Top pages</h3>
          <div className="space-y-2">
            {data.engagement.top_pages.slice(0, 8).map(p => (
              <div key={p.path} className="flex justify-between text-sm">
                <span className="text-stone-300 truncate mr-4">{p.path}</span>
                <span className="text-amber-500 font-mono shrink-0">{p.views}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Top CTAs */}
        <div className="bg-stone-900 border border-white/10 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold mb-3">Top CTAs</h3>
          <div className="space-y-2">
            {data.engagement.top_ctas.slice(0, 8).map(c => (
              <div key={c.label} className="flex justify-between text-sm">
                <span className="text-stone-300 truncate mr-4">{c.label}</span>
                <span className="text-amber-500 font-mono shrink-0">{c.clicks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion */}
      <h2 className="text-lg font-semibold text-amber-500 mb-4">Conversion</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Inscriptions" value={data.conversion.registrations} />
        <StatCard label="Benevoles" value={data.conversion.volunteers} />
        <StatCard label="Partenaires" value={data.conversion.partner_applications} />
        <StatCard label="Scenaristes" value={data.conversion.scenariste_applications} />
        <StatCard label="Clics HelloAsso" value={data.conversion.helloasso_clicks} />
        <StatCard label="Messages contact" value={data.conversion.contact_submissions} />
      </div>

      {/* Partners */}
      <h2 className="text-lg font-semibold text-amber-500 mb-4">Partenaires</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Vues profils" value={data.partners.total_profile_views} />
        <StatCard label="Clics sites" value={data.partners.total_website_clicks} />
        <StatCard label="Taux conversion" value={`${Math.round(data.partners.conversion_rate * 100)}%`} />
      </div>
    </div>
  );
}
