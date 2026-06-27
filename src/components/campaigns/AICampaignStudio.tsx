import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Globe, FileText, CheckCircle2, Loader2, Lightbulb } from 'lucide-react';
import { campaignEngine, type CampaignStep } from './campaignEngine';

interface AICampaignStudioProps {
  onApplySequence: (steps: CampaignStep[]) => void;
  recipientEmail?: string;
}

export const AICampaignStudio: React.FC<AICampaignStudioProps> = ({ onApplySequence, recipientEmail }) => {
  const [urlInput, setUrlInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedMeta, setExtractedMeta] = useState<any | null>(null);

  const handleGenerate = async () => {
    if (!urlInput.trim() && !descInput.trim()) return;

    setExtractedMeta(null);
    let meta: any = { recipientEmail: recipientEmail || 'joshikushal148@gmail.com' };

    if (urlInput.trim()) {
      setIsScraping(true);
      try {
        const scraped = await campaignEngine.scrapeUrlMetadata(urlInput.trim());
        meta = { ...scraped, recipientEmail: recipientEmail || 'joshikushal148@gmail.com' };
      } catch {
        meta = { companyName: 'Target Client', industry: 'SaaS', painPoints: 'Scaling operations', recipientEmail: recipientEmail || 'joshikushal148@gmail.com' };
      }
      setIsScraping(false);
      setExtractedMeta(meta);
    }

    setIsGenerating(true);
    try {
      const sequence = await campaignEngine.generateAISequence(meta, descInput.trim());
      onApplySequence(sequence);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="camp-ai-studio" style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)', position: 'sticky', top: '24px' }}>
      <div className="camp-ai-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1rem', color: '#0f172a' }}>
          <Sparkles size={18} style={{ color: '#4f46e5' }} /> AI CAMPAIGN STUDIO
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
          <Globe size={15} style={{ color: '#6366f1' }} /> Client Website URL(s)
        </label>
        <input
          type="text"
          className="camp-input"
          placeholder="e.g. https://stripe.com or https://linear.app"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', padding: '12px', fontSize: '0.9rem' }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
          <FileText size={15} style={{ color: '#6366f1' }} /> OR Client Description & Pitch
        </label>
        <textarea
          className="camp-textarea"
          placeholder="e.g. We are an AI software agency helping B2B healthcare startups automate their patient onboarding workflows..."
          value={descInput}
          onChange={(e) => setDescInput(e.target.value)}
          style={{ minHeight: '120px', background: '#fff', border: '1px solid #e2e8f0', padding: '12px', fontSize: '0.9rem' }}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isScraping || isGenerating || (!urlInput.trim() && !descInput.trim())}
        className="camp-btn camp-btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 700, background: '#4f46e5', borderRadius: '8px' }}
      >
        {isScraping ? (
          <>
            <Loader2 size={18} className="crm-spin-ic" /> Scraping live metadata...
          </>
        ) : isGenerating ? (
          <>
            <Loader2 size={18} className="crm-spin-ic" /> Writing personalized copy...
          </>
        ) : (
          <>
            <Sparkles size={18} /> Generate & Auto-Fill Sequence
          </>
        )}
      </button>

      <div style={{ marginTop: '24px', background: '#fef9c3', border: '1px solid #fef08a', padding: '16px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#854d0e', marginBottom: '8px', fontSize: '0.85rem' }}>
          <Lightbulb size={15} /> Pro Tip
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#713f12', lineHeight: 1.5 }}>
          When you press generate, the AI scrapes live websites, analyzes tone, and generates the entire 4-step sequence (Initial Email + delays + 3 follow-ups) directly into your workflow on the left!
        </p>
      </div>
      
      <AnimatePresence>
        {extractedMeta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#166534', fontSize: '0.85rem', marginBottom: '8px' }}>
              <CheckCircle2 size={16} /> Live Scraped Intelligence
            </div>
            <div style={{ fontSize: '0.78rem', color: '#15803d', lineHeight: 1.5 }}>
              <div><strong>Company:</strong> {extractedMeta.companyName}</div>
              <div><strong>Industry:</strong> {extractedMeta.industry}</div>
              <div><strong>Pain Points:</strong> {extractedMeta.painPoints}</div>
              <div><strong>Tone:</strong> {extractedMeta.tone}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
