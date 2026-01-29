
import React, { useState, useEffect, useMemo } from 'react';
import { getTokenLogs, TokenLog } from '@stores/tokenLogStore';
import { Badge, Button, DataTable, Column, Modal } from '@shared/components/ui';
import { Loader2, RefreshCw, FileText, User as UserIcon, Eye, X, Copy, Check } from 'lucide-react';

export const TokenLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<TokenLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<TokenLog | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await getTokenLogs();
            setLogs(data);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const getActionBadgeColor = (action: string): 'purple' | 'blue' | 'green' | 'slate' => {
        switch (action) {
            case 'CURRICULUM_GEN': return 'purple';
            case 'QUIZ_GEN': return 'blue';
            case 'STUDENT_CHAT': return 'green';
            default: return 'slate';
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Column definitions for DataTable
    const columns: Column<TokenLog>[] = useMemo(() => [
        {
            key: 'timestamp',
            header: 'Timestamp',
            width: 'w-40',
            render: (value) => (
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(value)}
                </span>
            ),
            getValue: (log) => log.timestamp,
        },
        {
            key: 'userName',
            header: 'User',
            searchable: true,
            render: (_, log) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300">
                        <UserIcon className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{log.userName || 'Unknown'}</span>
                </div>
            ),
        },
        {
            key: 'actionType',
            header: 'Action',
            searchable: true,
            render: (value) => (
                <Badge color={getActionBadgeColor(value)}>
                    {value.replace('_', ' ')}
                </Badge>
            ),
        },
        {
            key: 'model',
            header: 'Model',
            width: 'w-32',
            render: (value) => (
                <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">{value}</span>
            ),
        },
        {
            key: 'tokensUsed',
            header: 'Tokens',
            align: 'right' as const,
            width: 'w-24',
            render: (value) => (
                <span className="font-bold text-slate-700 dark:text-slate-200">{value.toLocaleString()}</span>
            ),
            getValue: (log) => log.tokensUsed,
        },
        {
            key: 'metadata',
            header: 'Details',
            sortable: false,
            searchable: false,
            render: (value, log) => {
                const hasData = value && Object.keys(value).length > 0;
                return hasData ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                        }}
                        className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 py-1 rounded-md transition-colors border border-indigo-200 dark:border-indigo-800"
                    >
                        <Eye className="w-3 h-3" />
                        View Details
                    </button>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500">-</span>
                );
            },
        },
    ], []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Token Usage Logs</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track AI consumption across the platform</p>
                </div>
                <Button onClick={loadLogs} variant="outline" size="sm" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span className="ml-2">Refresh</span>
                </Button>
            </div>

            <DataTable
                data={logs}
                columns={columns}
                searchable={true}
                searchPlaceholder="Search by user or action..."
                selectable={false}
                paginated={true}
                pageSize={25}
                pageSizeOptions={[10, 25, 50, 100]}
                loading={loading}
                emptyMessage="No log records found."
                compact={true}
            />

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title="Log Details"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        {/* Summary Info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">User</div>
                                <div className="font-medium text-slate-800 dark:text-white">{selectedLog.userName || 'Unknown'}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Action</div>
                                <Badge color={getActionBadgeColor(selectedLog.actionType)}>
                                    {selectedLog.actionType.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Model</div>
                                <div className="font-mono text-xs text-slate-800 dark:text-white">{selectedLog.model}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tokens Used</div>
                                <div className="font-bold text-indigo-600 dark:text-indigo-400">{selectedLog.tokensUsed.toLocaleString()}</div>
                            </div>
                            <div className="col-span-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Timestamp</div>
                                <div className="font-mono text-xs text-slate-800 dark:text-white">
                                    {new Date(selectedLog.timestamp).toLocaleString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Metadata JSON */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Metadata</h4>
                                <button
                                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.metadata, null, 2))}
                                    className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3 h-3 text-emerald-500" /> Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3 h-3" /> Copy JSON
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                                    {JSON.stringify(selectedLog.metadata, null, 2) || '{}'}
                                </pre>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setSelectedLog(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
