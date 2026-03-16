import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';

const MATCH_AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/match-ai`;

interface AIMatchAnalysisProps {
  request: any;
  donors: any[];
  matches: any[];
}

export const AIMatchAnalysis = ({ request, donors, matches }: AIMatchAnalysisProps) => {
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const runAnalysis = async () => {
    if (!request || matches.length === 0) return;
    setLoading(true);
    setAnalysis('');
    setHasAnalyzed(true);

    try {
      const resp = await fetch(MATCH_AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ request, donors, matches }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'AI unavailable' }));
        setAnalysis(`⚠️ ${err.error || 'AI analysis failed'}`);
        setLoading(false);
        return;
      }

      if (!resp.body) {
        setAnalysis('⚠️ No response from AI');
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAnalysis(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error('AI match analysis error:', err);
      setAnalysis('⚠️ AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            AI {t('Analysis')}
          </h3>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading || !request || matches.length === 0}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : hasAnalyzed ? (
            <RefreshCw className="w-3.5 h-3.5" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {loading ? t('Analyzing...') : hasAnalyzed ? t('Re-analyze') : t('Analyze Matches')}
        </button>
      </div>

      {!hasAnalyzed && !loading && (
        <p className="text-xs text-muted-foreground">
          {matches.length > 0
            ? t('Click to get AI-powered donor matching recommendations')
            : t('Select a request with matches to use AI analysis')}
        </p>
      )}

      {(loading || analysis) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-foreground leading-relaxed"
        >
          {loading && !analysis && (
            <div className="flex items-center gap-2 text-muted-foreground py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">{t('AI analyzing donor matches...')}</span>
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_p]:text-xs [&_li]:text-xs [&_strong]:text-primary [&_ul]:space-y-1">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
          {loading && analysis && (
            <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5 align-middle" />
          )}
        </motion.div>
      )}
    </div>
  );
};
