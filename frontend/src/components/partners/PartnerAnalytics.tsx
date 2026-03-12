import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Eye, MousePointer2, MapPin, TrendingUp } from 'lucide-react';

export interface DailyStat {
    _id: {
        date: string;
        action: string;
    };
    count: number;
}

export interface PartnerStats {
    partner_id: string;
    period_days: number;
    summary: {
        views: number;
        website_clicks: number;
        map_clicks: number;
    };
    daily: DailyStat[];
}

interface PartnerAnalyticsProps {
    stats: PartnerStats;
}

export const PartnerAnalytics: React.FC<PartnerAnalyticsProps> = ({ stats }) => {
    // Transformer les données daily pour Recharts (format: { date: '2026-03-01', views: 10, clicks: 5, map: 2 })
    const chartData = useMemo(() => {
        const dataMap: Record<string, { date: string; views: number; website_clicks: number; map_clicks: number }> = {};
        
        // Initialiser les 30 derniers jours avec des zéros
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dataMap[dateStr] = { date: dateStr, views: 0, website_clicks: 0, map_clicks: 0 };
        }

        // Remplir avec les données réelles
        stats.daily.forEach(stat => {
            const date = stat._id.date;
            const action = stat._id.action;
            if (dataMap[date]) {
                if (action === 'partner_view') dataMap[date].views = stat.count;
                if (action === 'partner_click_website') dataMap[date].website_clicks = stat.count;
                if (action === 'partner_click_map') dataMap[date].map_clicks = stat.count;
            }
        });

        return Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
    }, [stats]);

    const formatXAxis = (tickItem: string) => {
        const d = new Date(tickItem);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Résumé en cartes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-echo-gold/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                            <Eye size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-echo-textMuted uppercase tracking-wider">Vues du profil</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-serif font-bold text-white">{stats.summary.views}</span>
                        <span className="text-xs text-blue-400 font-medium">vues</span>
                    </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-echo-gold/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-echo-gold/10 text-echo-gold group-hover:scale-110 transition-transform">
                            <MousePointer2 size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-echo-textMuted uppercase tracking-wider">Clics Site Web</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-serif font-bold text-white">{stats.summary.website_clicks}</span>
                        <span className="text-xs text-echo-gold font-medium">clics</span>
                    </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-echo-gold/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 transition-transform">
                            <MapPin size={20} />
                        </div>
                        <h3 className="text-sm font-medium text-echo-textMuted uppercase tracking-wider">Clics Carte</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-serif font-bold text-white">{stats.summary.map_clicks}</span>
                        <span className="text-xs text-green-400 font-medium">clics</span>
                    </div>
                </div>
            </div>

            {/* Graphique principal */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-serif text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-echo-gold" />
                        Activité des 30 derniers jours
                    </h3>
                    <div className="text-xs text-echo-textMuted bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                        Fréquence journalière
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorMap" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                fontSize={10} 
                                tickFormatter={formatXAxis} 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fill: '#9ca3af' }}
                            />
                            <YAxis 
                                fontSize={10} 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fill: '#9ca3af' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1a1a1a', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    color: '#fff'
                                }}
                                itemStyle={{ padding: '2px 0' }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Area 
                                type="monotone" 
                                dataKey="views" 
                                name="Vues profil"
                                stroke="#3B82F6" 
                                fillOpacity={1} 
                                fill="url(#colorViews)" 
                                strokeWidth={2}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="website_clicks" 
                                name="Clics Site Web"
                                stroke="#D4AF37" 
                                fillOpacity={1} 
                                fill="url(#colorClicks)" 
                                strokeWidth={2}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="map_clicks" 
                                name="Clics Carte"
                                stroke="#10B981" 
                                fillOpacity={1} 
                                fill="url(#colorMap)" 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
