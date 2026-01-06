'use client';

import { useState } from 'react';
import { Send, Users, Mail, Loader2, AlertCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { sendReengagementEmails, sendNudgeEmails } from './actions';
// import { useLanguage } from '@/components/LanguageProvider';

export default function EmailToolsPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    // const { t } = useLanguage();

    const handleSendReengagement = async () => {
        setLoading('reengagement');
        setResult(null);
        try {
            const res = await sendReengagementEmails();
            setResult(res);
        } catch (error) {
            setResult({ success: false, error: 'Error al enviar correos' });
        } finally {
            setLoading(null);
        }
    };

    const handleSendNudge = async () => {
        setLoading('nudge');
        setResult(null);
        try {
            const res = await sendNudgeEmails();
            setResult(res);
        } catch (error) {
            setResult({ success: false, error: 'Error al enviar correos' });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Herramientas de Email Marketing
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Envía campañas de correo a tus clientes para aumentar la retención y ventas.
                        </p>
                    </div>

                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Re-engagement Card */}
                    <div className="group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-24 h-24 text-violet-600" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6 text-violet-600">
                                <Users className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Campaña de Re-engagement
                            </h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Envía un correo a usuarios inactivos (más de 30 días sin compra) ofreciendo un descuento especial.
                            </p>

                            <button
                                onClick={handleSendReengagement}
                                disabled={!!loading}
                                className="w-full py-3 px-4 bg-slate-900 hover:bg-violet-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-lg group-hover:shadow-violet-500/20"
                            >
                                {loading === 'reengagement' ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                                ) : (
                                    <>
                                        <span>Enviar Correos de Re-engagement</span>
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Nudge Card */}
                    <div className="group bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Mail className="w-24 h-24 text-fuchsia-600" />
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-6 text-fuchsia-600">
                                <Mail className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Recordatorio de Carritos
                            </h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Envía un recordatorio a usuarios con carritos abandonados o que no han comprado recientemente.
                            </p>

                            <button
                                onClick={handleSendNudge}
                                disabled={!!loading}
                                className="w-full py-3 px-4 bg-slate-900 hover:bg-fuchsia-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-lg group-hover:shadow-fuchsia-500/20"
                            >
                                {loading === 'nudge' ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                                ) : (
                                    <>
                                        <span>Enviar Recordatorios</span>
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Message */}
                {result && (
                    <div className={`rounded-xl border p-6 flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${result.success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <div className={`p-3 rounded-full h-fit ${result.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {result.success ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>

                        <div className="flex-1">
                            <h4 className={`text-lg font-bold mb-1 ${result.success ? 'text-emerald-900' : 'text-red-900'}`}>
                                {result.success ? 'Correos enviados exitosamente' : 'Error al enviar correos'}
                            </h4>
                            {result.error && <p className="text-red-600 mb-2">{String(result.error)}</p>}

                            {result.success && (
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="bg-emerald-100/50 rounded-lg p-4 text-center">
                                        <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700 mb-1">Enviados</div>
                                        <div className="text-2xl font-bold text-emerald-900">{result.sent}</div>
                                    </div>
                                    <div className="bg-emerald-100/50 rounded-lg p-4 text-center">
                                        <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700 mb-1">Fallidos</div>
                                        <div className="text-2xl font-bold text-emerald-900">{result.errors?.length || 0}</div>
                                    </div>
                                    <div className="bg-emerald-100/50 rounded-lg p-4 text-center">
                                        <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700 mb-1">Total</div>
                                        <div className="text-2xl font-bold text-emerald-900">{result.total}</div>
                                    </div>
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
                                <div className="mt-4 bg-white/50 rounded-lg p-4 border border-red-100 overflow-auto max-h-40 text-xs font-mono text-red-700">
                                    {result.errors.map((e: any, i: number) => (
                                        <div key={i} className="mb-1 last:mb-0">
                                            {e.email}: {String(e.error?.message || e.error)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
