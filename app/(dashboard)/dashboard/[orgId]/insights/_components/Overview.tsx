import React from 'react'
import { IOrgHourlyInsight } from '@/interfaces/ai.interfaces';
import { format } from 'date-fns';

export default function Overview({ insights }: { insights: IOrgHourlyInsight[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
                <div key={insight.id} className="border rounded-xl p-4 bg-card shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${insight.integrityStatus === 'stable' ? 'bg-green-100 text-green-700' :
                            insight.integrityStatus === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {insight.integrityStatus.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(insight.startTime), 'MMM d, h:mm a')}
                        </span>
                    </div>
                    <h4 className="font-semibold text-sm mb-2">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {insight.executiveSummary}
                    </p>
                </div>
            ))}
        </div>
    )
}
