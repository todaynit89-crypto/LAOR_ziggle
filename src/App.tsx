import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Trash2, X, ChevronRight, Plus, BarChart2, List, Settings, Download, Upload, Copy, Check, Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const STORAGE_KEY = 'laor_infinite_data';
const HISTORY_KEY = 'laor_infinite_history';

interface HistoryEntry {
  id: string;
  ticker: string;
  date: string;
  seed: number;
  round: number;
  avgPrice: number;
  marketPrice: number;
  memo?: string;
  results: any;
}

export default function App() {
    const [tickers, setTickers] = useState<string[]>(['TQQQ']);
  const [activeTicker, setActiveTicker] = useState<string>('TQQQ');
  const [tickerData, setTickerData] = useState<Record<string, any>>({});
  const [isAddingTicker, setIsAddingTicker] = useState(false);
  const [newTickerName, setNewTickerName] = useState('');

  const [seed, setSeed] = useState<string>('');
  const [round, setRound] = useState<string>('');
  const [avgPrice, setAvgPrice] = useState<string>('');
  const [marketPrice, setMarketPrice] = useState<string>('');
  const [memo, setMemo] = useState<string>('');

  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [results, setResults] = useState<any>(null);
  
  const [toast, setToast] = useState<{ msg: string; show: boolean }>({ msg: '', show: false });
  const [isSaved, setIsSaved] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [historyViewMode, setHistoryViewMode] = useState<'list' | 'chart'>('list');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'calculator' | 'dashboard' | 'soul'>('calculator');

  const [showSimulation, setShowSimulation] = useState(false);
  const [showBudgetCalc, setShowBudgetCalc] = useState(false);
  const [calcPrice, setCalcPrice] = useState<string>('');
  const [calcSeed, setCalcSeed] = useState<string>('');
  const [calcResult, setCalcResult] = useState<{ total: number; daily: number; totalKRW: number; dailyKRW: number } | null>(null);

  const [soulCurrentAvg, setSoulCurrentAvg] = useState('');
  const [soulCurrentShares, setSoulCurrentShares] = useState('');
  const [soulTargetAvg, setSoulTargetAvg] = useState('');
  const [soulMarketPrice, setSoulMarketPrice] = useState('');
  const [soulResult, setSoulResult] = useState<{ additionalShares: number; additionalBudget: number } | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.tickers) {
          setTickers(data.tickers);
          setActiveTicker(data.activeTicker || data.tickers[0]);
          setTickerData(data.tickerData || {});
          
          const currentData = (data.tickerData || {})[data.activeTicker || data.tickers[0]] || {};
          setSeed(currentData.seed || '');
          setRound(currentData.round || '');
          setAvgPrice(currentData.avgPrice || '');
          setMarketPrice(currentData.marketPrice || '');
        } else {
          // Legacy migration
          setTickers(['TQQQ']);
          setActiveTicker('TQQQ');
          const legacyData = { seed: data.seed || '', round: data.round || '', avgPrice: data.avg || '', marketPrice: data.market || '' };
          setTickerData({ 'TQQQ': legacyData });
          setSeed(legacyData.seed);
          setRound(legacyData.round);
          setAvgPrice(legacyData.avgPrice);
          setMarketPrice(legacyData.marketPrice);
        }
      } catch {}
    }
    
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    if (rawHistory) {
      try {
        setHistory(JSON.parse(rawHistory));
      } catch {}
    }
  }, []);


  const showToast = (msg: string, duration = 2200) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg, show: false }), duration);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [key]: false })), 2000);
    showToast('📋 클립보드에 복사되었습니다');
  };

  const shareResults = () => {
    if (!results) return;
    const text = `[라오어 무한매수법 - ${activeTicker} ${results.round}회차]
🎯 매도: $${results.sellPrice.toFixed(2)}
📉 평단매수: $${results.locAvgPrice.toFixed(2)} (${results.locAvgShares}주)
📈 큰수매수: $${results.locHighPrice.toFixed(2)} (${results.locHighShares}주)
💰 오늘 예산: $${results.dailyBudget.toFixed(2)}`;
    
    if (navigator.share) {
      navigator.share({
        title: '오늘의 무한매수법 주문',
        text: text
      }).catch(() => {
        copyToClipboard(text, 'share');
      });
    } else {
      copyToClipboard(text, 'share');
    }
  };

  const exportData = () => {
    const data = {
      storage: localStorage.getItem(STORAGE_KEY),
      history: localStorage.getItem(HISTORY_KEY),
      theme: localStorage.getItem('laor_theme')
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `laor_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ 데이터가 백업되었습니다');
  };

  const exportCSV = () => {
    if (history.length === 0) {
      showToast('⚠ 내보낼 기록이 없습니다');
      return;
    }
    
    // CSV Header
    const headers = ['종목', '날짜', '회차', '총시드(USD)', '평단가(USD)', '시장가(USD)', '매도목표가(USD)', '평단매수(USD)', '평단매수(주)', '큰수매수(USD)', '큰수매수(주)', '일일예산(USD)', '남은예산(USD)', '메모'];
    
    // CSV Rows
    const rows = history.map(entry => {
      const res = entry.results || {};
      return [
        entry.ticker || 'TQQQ',
        entry.date,
        entry.round,
        entry.seed,
        entry.avgPrice,
        entry.marketPrice,
        res.sellPrice ? res.sellPrice.toFixed(2) : '',
        res.locAvgPrice ? res.locAvgPrice.toFixed(2) : '',
        res.locAvgShares || 0,
        res.locHighPrice ? res.locHighPrice.toFixed(2) : '',
        res.locHighShares || 0,
        res.dailyBudget ? res.dailyBudget.toFixed(2) : '',
        res.remaining ? res.remaining.toFixed(2) : '',
        entry.memo || ''
      ].map(val => `"${val}"`).join(',');
    });
    
    // Combine and add BOM for Excel UTF-8 support
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `laor_history_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✅ 엑셀(CSV) 파일로 내보냈습니다');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        try {
          const lines = text.replace(/^\uFEFF/, '').split('\n').filter(line => line.trim() !== '');
          if (lines.length <= 1) {
            showToast('⚠ 데이터가 없는 CSV 파일입니다');
            return;
          }
          
          const historyEntries: HistoryEntry[] = [];
          const uniqueTickers = new Set<string>();
          
          const parseCSVRow = (line: string) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current);
            return result;
          };

          for (let i = 1; i < lines.length; i++) {
            const row = parseCSVRow(lines[i]);
            if (row.length >= 13) {
              const ticker = row[0] || 'TQQQ';
              uniqueTickers.add(ticker);
              historyEntries.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                ticker: ticker,
                date: row[1],
                round: parseInt(row[2]) || 1,
                seed: parseFloat(row[3]) || 0,
                avgPrice: parseFloat(row[4]) || 0,
                marketPrice: parseFloat(row[5]) || 0,
                memo: row[13] || '',
                results: {
                  sellPrice: parseFloat(row[6]) || 0,
                  locAvgPrice: parseFloat(row[7]) || 0,
                  locAvgShares: parseInt(row[8]) || 0,
                  locHighPrice: parseFloat(row[9]) || 0,
                  locHighShares: parseInt(row[10]) || 0,
                  dailyBudget: parseFloat(row[11]) || 0,
                  remaining: parseFloat(row[12]) || 0
                }
              });
            }
          }
          
          if (historyEntries.length > 0) {
            // Merge with existing history or replace? Let's replace for consistency with JSON import
            localStorage.setItem(HISTORY_KEY, JSON.stringify(historyEntries));
            
            // Update tickers if needed
            const rawStorage = localStorage.getItem(STORAGE_KEY);
            let storageData = rawStorage ? JSON.parse(rawStorage) : { tickers: ['TQQQ'], activeTicker: 'TQQQ', tickerData: {} };
            
            uniqueTickers.forEach(t => {
              if (!storageData.tickers.includes(t)) {
                storageData.tickers.push(t);
                storageData.tickerData[t] = { seed: '', round: '', avgPrice: '', marketPrice: '' };
              }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));

            showToast('✅ CSV 기록이 복원되었습니다. 새로고침합니다.');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            showToast('❌ 올바른 형식의 CSV 파일이 아닙니다');
          }
        } catch (err) {
          showToast('❌ CSV 파일을 파싱하는 중 오류가 발생했습니다');
        }
      } else {
        // JSON Import
        try {
          const data = JSON.parse(text);
          if (data.storage) localStorage.setItem(STORAGE_KEY, data.storage);
          if (data.history) localStorage.setItem(HISTORY_KEY, data.history);
          if (data.theme) localStorage.setItem('laor_theme', data.theme);
          showToast('✅ 데이터가 복원되었습니다. 새로고침합니다.');
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          showToast('❌ 잘못된 백업 파일입니다');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calculateRequiredBudget = () => {
    const price = parseFloat(calcPrice);
    if (!price || price <= 0) {
      showToast('⚠ 올바른 주가를 입력해주세요');
      return;
    }
    
    // Standard Laor's method: 40 rounds, 2 shares per day
    const daily = price * 2;
    const total = daily * 40;
    const dailyKRW = daily * 1500;
    const totalKRW = total * 1500;
    
    setCalcResult({ total, daily, totalKRW, dailyKRW });
  };

  const validateInputs = () => {
    let valid = true;
    const newErrors: { [key: string]: boolean } = {};

    const s = parseFloat(seed);
    const r = parseInt(round);
    const a = parseFloat(avgPrice);
    const m = parseFloat(marketPrice);

    if (!s || s <= 0) {
      newErrors.seed = true;
      valid = false;
    }
    if (!r || r < 1 || r > 40) {
      newErrors.round = true;
      valid = false;
    }
    if (!a || a <= 0) {
      newErrors.avgPrice = true;
      valid = false;
    }
    if (!m || m <= 0) {
      newErrors.marketPrice = true;
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) showToast('⚠ 입력값을 확인해주세요');
    
    return valid ? { s, r, a, m } : null;
  };

  const calculate = () => {
    const v = validateInputs();
    if (!v) return;

    const { s: seedVal, r: roundVal, a: avgVal, m: marketVal } = v;

    const dailyBudget = seedVal / 40;
    const halfBudget = dailyBudget / 2;

    const sellPrice = avgVal * 1.1;

    const locAvgShares = Math.floor(halfBudget / avgVal);

    const locHighPrice = marketVal * 1.15;
    const locHighShares = Math.floor(halfBudget / locHighPrice);

    const usedBudget = dailyBudget * roundVal;
    const remaining = Math.max(0, seedVal - usedBudget);
    const pct = Math.round((roundVal / 40) * 100);
    
    const minSharesPossible = Math.floor(dailyBudget / marketVal);
    const isSeedSufficient = minSharesPossible >= 2;

    const expectedProfitUSD = usedBudget * 0.1;
    const expectedProfitKRW = expectedProfitUSD * 1500;

    // Simulation calculations
    const currentShares = usedBudget / avgVal;
    
    // Case A: Both filled (worst-case fill price)
    const caseAShares = currentShares + locAvgShares + locHighShares;
    const caseACost = usedBudget + (locAvgShares * avgVal) + (locHighShares * locHighPrice);
    const caseAAvg = caseAShares > 0 ? caseACost / caseAShares : avgVal;

    // Case B: Only High filled (worst-case fill price)
    const caseBShares = currentShares + locHighShares;
    const caseBCost = usedBudget + (locHighShares * locHighPrice);
    const caseBAvg = caseBShares > 0 ? caseBCost / caseBShares : avgVal;

    setResults({
      sellPrice,
      locAvgPrice: avgVal,
      locAvgShares,
      locHighPrice,
      locHighShares,
      dailyBudget,
      remaining,
      round: roundVal,
      pct,
      isSeedSufficient,
      expectedProfitUSD,
      expectedProfitKRW,
      simulations: {
        caseAAvg,
        caseBAvg
      }
    });
    
    setShowSimulation(false);
    
    // Scroll to results slightly after render
    setTimeout(() => {
      document.getElementById('resultArea')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const calculateSoul = () => {
    const A = parseFloat(soulCurrentAvg);
    const S = parseFloat(soulCurrentShares);
    const T = parseFloat(soulTargetAvg);
    const M = parseFloat(soulMarketPrice);

    if (!A || !S || !T || !M) {
      showToast('⚠ 모든 값을 입력해주세요');
      return;
    }
    if (T <= M) {
      showToast('⚠ 목표 평단가는 현재가보다 높아야 합니다');
      return;
    }
    if (A <= T) {
      showToast('⚠ 이미 목표 평단가보다 낮거나 같습니다');
      return;
    }

    const X = (S * (A - T)) / (T - M);
    const additionalShares = Math.ceil(X);
    const additionalBudget = additionalShares * M;

    setSoulResult({ additionalShares, additionalBudget });
  };

  const renderDashboard = () => {
    let totalSeed = 0;
    let totalInvested = 0;
    const chartData: any[] = [];

    tickers.forEach(t => {
      const data = tickerData[t] || {};
      const s = parseFloat(data.seed) || 0;
      const r = parseInt(data.round) || 0;
      const invested = (s / 40) * r;
      
      totalSeed += s;
      totalInvested += invested;

      if (invested > 0) {
        chartData.push({ name: t, value: invested });
      }
    });

    const remaining = totalSeed - totalInvested;
    if (remaining > 0) {
      chartData.push({ name: '현금(예수금)', value: remaining });
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

    return (
      <div className="border rounded-[14px] p-5 mb-3.5 transition-colors bg-[#111827] border-[#1e2d4a]">
        <h2 className="font-bold tracking-[1px] uppercase flex items-center gap-1.5 text-[#5a6a85] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block"></span>
          포트폴리오 대시보드
        </h2>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#1a2236] border border-[#1e2d4a] rounded-xl p-4">
            <div className="text-[#8896b0] text-sm mb-1">총 시드</div>
            <div className="font-mono font-bold text-xl text-[#e8edf5]">${totalSeed.toLocaleString(undefined, {maximumFractionDigits:2})}</div>
          </div>
          <div className="bg-[#1a2236] border border-[#1e2d4a] rounded-xl p-4">
            <div className="text-[#8896b0] text-sm mb-1">투입 금액 (추정)</div>
            <div className="font-mono font-bold text-xl text-[#3b82f6]">${totalInvested.toLocaleString(undefined, {maximumFractionDigits:2})}</div>
          </div>
        </div>

        {totalSeed > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === '현금(예수금)' ? '#334155' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toLocaleString(undefined, {maximumFractionDigits:2})}`}
                  contentStyle={{ backgroundColor: '#162032', borderColor: '#1e2d4a', borderRadius: '8px', color: '#e8edf5' }}
                  itemStyle={{ color: '#e8edf5' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#8896b0' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 text-[#5a6a85]">
            입력된 시드가 없습니다. 계산기에서 시드를 설정해주세요.
          </div>
        )}
      </div>
    );
  };

  const renderSoulCalculator = () => {
    return (
      <div className="border rounded-[14px] p-5 mb-3.5 transition-colors bg-[#111827] border-[#1e2d4a]">
        <h2 className="font-bold tracking-[1px] uppercase flex items-center gap-1.5 text-[#5a6a85] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block"></span>
          영혼법 (물타기) 계산기
        </h2>
        <p className="text-[#8896b0] text-sm mb-5 leading-relaxed">
          40회차가 끝났는데도 목표 수익에 도달하지 못했을 때, <br/>
          목표 평단가로 낮추기 위해 필요한 추가 매수량과 예산을 계산합니다.
        </p>

        <div className="space-y-3.5">
          <div className="field">
            <label className="block font-medium mb-1.5 text-[#8896b0]">현재 평균 매수 단가 ($)</label>
            <input 
              type="number" 
              value={soulCurrentAvg}
              onChange={e => setSoulCurrentAvg(e.target.value)}
              placeholder="예: 50.25" 
              className="w-full bg-[#1a2236] border border-[#1e2d4a] focus:border-[#3b82f6] rounded-[10px] px-3.5 py-3 text-[16px] font-mono font-semibold text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85] placeholder:font-normal"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-1.5 text-[#8896b0]">현재 보유 주식수 (주)</label>
            <input 
              type="number" 
              value={soulCurrentShares}
              onChange={e => setSoulCurrentShares(e.target.value)}
              placeholder="예: 150" 
              className="w-full bg-[#1a2236] border border-[#1e2d4a] focus:border-[#3b82f6] rounded-[10px] px-3.5 py-3 text-[16px] font-mono font-semibold text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85] placeholder:font-normal"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-1.5 text-[#8896b0]">원하는 목표 평단가 ($)</label>
            <input 
              type="number" 
              value={soulTargetAvg}
              onChange={e => setSoulTargetAvg(e.target.value)}
              placeholder="예: 45.00" 
              className="w-full bg-[#1a2236] border border-[#1e2d4a] focus:border-[#3b82f6] rounded-[10px] px-3.5 py-3 text-[16px] font-mono font-semibold text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85] placeholder:font-normal"
            />
          </div>
          <div className="field">
            <label className="block font-medium mb-1.5 text-[#8896b0]">현재 주가 ($)</label>
            <input 
              type="number" 
              value={soulMarketPrice}
              onChange={e => setSoulMarketPrice(e.target.value)}
              placeholder="예: 40.00" 
              className="w-full bg-[#1a2236] border border-[#1e2d4a] focus:border-[#3b82f6] rounded-[10px] px-3.5 py-3 text-[16px] font-mono font-semibold text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85] placeholder:font-normal"
            />
          </div>

          <button 
            onClick={calculateSoul}
            className="w-full mt-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3.5 rounded-[10px] transition-colors shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
          >
            계산하기
          </button>
        </div>

        {soulResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-4 rounded-xl border bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.1)]"
          >
            <div className="text-center mb-4">
              <div className="text-[#8896b0] mb-1">목표 달성을 위해 필요한 추가 매수</div>
              <div className="text-2xl font-black text-[#60a5fa] font-mono">
                {soulResult.additionalShares.toLocaleString()}주
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-[rgba(59,130,246,0.1)]">
              <span className="text-[#8896b0]">필요한 추가 예산</span>
              <div className="text-right">
                <div className="font-bold font-mono text-[#e8edf5]">
                  ${soulResult.additionalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-[#5a6a85]">
                  약 {(soulResult.additionalBudget * 1500).toLocaleString(undefined, { maximumFractionDigits: 0 })}원
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const saveData = () => {
    if (!seed && !round && !avgPrice && !marketPrice) {
      showToast('⚠ 저장할 데이터를 입력해주세요');
      return;
    }

    const newTickerData = {
      ...tickerData,
      [activeTicker]: { seed, round, avgPrice, marketPrice }
    };
    setTickerData(newTickerData);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tickers,
      activeTicker,
      tickerData: newTickerData
    }));
    
    showToast('✅ 데이터가 저장되었습니다');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const switchTicker = (ticker: string) => {
    const newTickerData = {
      ...tickerData,
      [activeTicker]: { seed, round, avgPrice, marketPrice }
    };
    setTickerData(newTickerData);
    
    setActiveTicker(ticker);
    const data = newTickerData[ticker] || { seed: '', round: '', avgPrice: '', marketPrice: '' };
    setSeed(data.seed || '');
    setRound(data.round || '');
    setAvgPrice(data.avgPrice || '');
    setMarketPrice(data.marketPrice || '');
    setResults(null);
    setErrors({});
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tickers,
      activeTicker: ticker,
      tickerData: newTickerData
    }));
  };

  const addTicker = () => {
    if (!newTickerName.trim()) return;
    const name = newTickerName.trim().toUpperCase();
    if (tickers.includes(name)) {
      showToast('⚠ 이미 존재하는 종목입니다');
      return;
    }
    
    const newTickers = [...tickers, name];
    setTickers(newTickers);
    
    const newTickerData = {
      ...tickerData,
      [activeTicker]: { seed, round, avgPrice, marketPrice },
      [name]: { seed: '', round: '', avgPrice: '', marketPrice: '' }
    };
    setTickerData(newTickerData);
    
    setActiveTicker(name);
    setSeed('');
    setRound('');
    setAvgPrice('');
    setMarketPrice('');
    setResults(null);
    setErrors({});
    setIsAddingTicker(false);
    setNewTickerName('');
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tickers: newTickers,
      activeTicker: name,
      tickerData: newTickerData
    }));
    showToast('✅ 새 종목이 추가되었습니다');
  };

  const deleteTicker = (tickerToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tickers.length === 1) {
      showToast('⚠ 최소 1개의 종목은 필요합니다');
      return;
    }
    const newTickers = tickers.filter(t => t !== tickerToDelete);
    setTickers(newTickers);
    
    const newTickerData = { ...tickerData };
    delete newTickerData[tickerToDelete];
    setTickerData(newTickerData);
    
    let nextActiveTicker = activeTicker;
    if (activeTicker === tickerToDelete) {
      nextActiveTicker = newTickers[0];
      setActiveTicker(nextActiveTicker);
      const data = newTickerData[nextActiveTicker] || { seed: '', round: '', avgPrice: '', marketPrice: '' };
      setSeed(data.seed || '');
      setRound(data.round || '');
      setAvgPrice(data.avgPrice || '');
      setMarketPrice(data.marketPrice || '');
      setResults(null);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tickers: newTickers,
      activeTicker: nextActiveTicker,
      tickerData: newTickerData
    }));
    showToast('🗑 종목이 삭제되었습니다');
  };

  const addToHistory = () => {
    if (!results) return;
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      ticker: activeTicker,
      date: new Date().toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      seed: parseFloat(seed),
      round: parseInt(round),
      avgPrice: parseFloat(avgPrice),
      marketPrice: parseFloat(marketPrice),
      memo: memo,
      results: results
    };
    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    showToast('✅ 기록에 추가되었습니다');
    setMemo('');
  };

  const deleteHistoryEntry = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    showToast('🗑 기록이 모두 삭제되었습니다');
  };

  const loadHistoryEntry = (entry: HistoryEntry) => {
    const targetTicker = entry.ticker || 'TQQQ';
    
    let newTickers = [...tickers];
    let newTickerData = { ...tickerData, [activeTicker]: { seed, round, avgPrice, marketPrice } };
    
    if (!tickers.includes(targetTicker)) {
      newTickers.push(targetTicker);
    }
    
    setTickers(newTickers);
    setActiveTicker(targetTicker);
    
    newTickerData = {
      ...newTickerData,
      [targetTicker]: {
        seed: entry.seed.toString(),
        round: entry.round.toString(),
        avgPrice: entry.avgPrice.toString(),
        marketPrice: entry.marketPrice.toString()
      }
    };
    setTickerData(newTickerData);
    
    setSeed(entry.seed.toString());
    setRound(entry.round.toString());
    setAvgPrice(entry.avgPrice.toString());
    setMarketPrice(entry.marketPrice.toString());
    setResults(entry.results);
    setShowHistory(false);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tickers: newTickers,
      activeTicker: targetTicker,
      tickerData: newTickerData
    }));
    
    showToast('✅ 기록을 불러왔습니다');
    setTimeout(() => {
      document.getElementById('resultArea')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') calculate();
  };

  const currentTickerHistory = history
    .filter(h => h.ticker === activeTicker)
    .sort((a, b) => a.round - b.round);

  return (
    <div className="relative z-10 max-w-[420px] mx-auto px-4 pt-4 pb-10 font-sans">
      {/* Header */}
      <div className="text-center py-5 pb-6 relative">
        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="absolute left-0 top-5 hover:text-cyan-700 transition-colors px-3 py-1.5 rounded-full hover:bg-cyan-50 text-[#22d3ee] bg-[rgba(34,211,238,0.1)] text-sm font-bold flex items-center gap-1"
            title="앱 설치"
          >
            <Download size={16} /> 앱 설치
          </button>
        )}
        <button 
          onClick={() => setShowHistory(true)}
          className="absolute right-10 top-5 hover:text-cyan-700 transition-colors p-2 rounded-full hover:bg-cyan-50 text-[#22d3ee] bg-[rgba(34,211,238,0.1)]"
          title="기록 보기"
        >
          <History size={20} />
        </button>
        <button 
          onClick={() => setShowSettings(true)}
          className="absolute right-0 top-5 hover:text-cyan-700 transition-colors p-2 rounded-full hover:bg-cyan-50 text-[#22d3ee] bg-[rgba(34,211,238,0.1)]"
          title="설정 및 백업"
        >
          <Settings size={20} />
        </button>
        <div className="font-bold tracking-[3px] uppercase mb-1.5 text-[#22d3ee]">
          LAOR INFINITE
        </div>
        <h1 className="text-[26px] font-black bg-gradient-to-br bg-clip-text text-transparent from-[#e8edf5] via-[#e8edf5] to-[#60a5fa]">
          무한매수법 비서
        </h1>
        <div className="font-medium mt-1 text-[#5a6a85]">매일의 주문을 한눈에</div>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="mt-3.5 font-medium px-3.5 py-1.5 rounded-full transition-colors text-[#22d3ee] bg-[rgba(34,211,238,0.1)] hover:bg-[rgba(34,211,238,0.2)]"
        >
          {showGuide ? '가이드 닫기 ✕' : '무한매수법이 처음이신가요? 💡'}
        </button>
      </div>

      {/* Guide Section */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 14 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="border rounded-[14px] p-5 text-left bg-[#162032] border-[#1e2d4a]">
              <h3 className="font-bold mb-3 flex items-center gap-1.5 text-[#e8edf5]">
                <span className="text-[16px]">💡</span> 무한매수법 핵심 가이드
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="font-bold mb-1 text-[#60a5fa]">1. 기본 원칙 및 필요 시드</div>
                  <p className="leading-relaxed text-[#8896b0]">
                    변동성이 큰 3배 레버리지 ETF(TQQQ, SOXL 등)를 대상으로 합니다. 투자할 총 금액(시드)을 <strong>40분할</strong>하여 매일 기계적으로 매수합니다. 하루에 두 번(평단가, 큰수) 매수 주문을 넣어야 하므로, 원칙적으로 <strong>최소 '현재 주가 × 2주 × 40일'</strong> 이상의 시드가 필요합니다.
                  </p>
                </div>
                
                <div>
                  <div className="font-bold mb-1 text-[#34d399]">2. 매수 규칙 (LOC 매수 활용)</div>
                  <p className="leading-relaxed mb-1.5 text-[#8896b0]">
                    <strong>1회차(첫날):</strong> 장중 아무 때나 현재가로 1주를 매수하여 시작합니다.<br/>
                    <strong>2~40회차:</strong> 매일 할당된 1회차 금액을 반으로 나누어 두 개의 LOC(종가 지정가) 주문을 설정합니다.
                  </p>
                  <ul className="leading-relaxed space-y-1.5 pl-1 text-[#8896b0]">
                    <li className="flex gap-1.5"><span className="font-bold text-[#34d399]">①</span> <span><strong>LOC 평단매수:</strong> 내 '평균 매수 단가'로 매수 (종가가 평단가보다 낮을 때만 체결)</span></li>
                    <li className="flex gap-1.5"><span className="font-bold text-[#34d399]">②</span> <span><strong>LOC 큰수매수:</strong> 현재가보다 '10~15% 높은 가격'으로 매수 (폭등하지 않는 한 무조건 체결)</span></li>
                  </ul>
                </div>

                <div>
                  <div className="font-bold mb-1 text-[#f87171]">3. 매도 규칙 (기계적 익절)</div>
                  <p className="leading-relaxed text-[#8896b0]">
                    매일 장이 열리기 전, 보유한 주식 전량을 <strong>내 평단가 대비 +10% 수익 가격</strong>에 지정가 매도 주문으로 걸어둡니다. 장중 한 번이라도 도달하면 전량 매도되며 사이클이 종료됩니다.
                  </p>
                </div>

                <div>
                  <div className="font-bold mb-1 text-[#fbbf24]">4. 40회차 소진 시 대응</div>
                  <p className="leading-relaxed text-[#8896b0]">
                    <strong>원칙적 종료:</strong> 40회차가 끝난 시점의 손익과 무관하게 전량 매도 후 새로운 사이클을 시작합니다.<br/>
                    <strong>영혼법(응용):</strong> 손절을 피하기 위해 새로운 40분할 시드를 추가 투입하여 평단가를 계속 낮추며 탈출을 도모합니다.
                  </p>
                </div>

                <div>
                  <div className="font-bold mb-1 text-[#a78bfa]">5. 소액 투자자를 위한 팁 (시드가 부족할 때)</div>
                  <p className="leading-relaxed text-[#8896b0]">
                    무한매수법은 꽤 많은 시드가 필요하다는 단점이 있습니다. 시드가 부족하다면 <strong>소수점 매매</strong>를 지원하는 증권사(토스증권, 미니스탁 등)를 활용해 보세요. 1주 단위가 아닌 '금액(달러)' 단위로 매수할 수 있어, 소액으로도 완벽하게 무한매수법의 비율을 맞춰 실천할 수 있습니다.
                  </p>
                </div>

                <div>
                  <div className="font-bold mb-1 text-[#22d3ee]">6. 제작자 의견 (남는 달러 활용법)</div>
                  <p className="leading-relaxed text-[#8896b0]">
                    무한매수법을 진행하며 계좌에 남는 달러가 아쉽다면, 미국판 파킹통장(적금)과 같은 <strong>SGOV</strong> 등의 초단기채 ETF를 사서 매월 배당(이자)을 받으면서 기다려도 좋습니다. (단, 매수 시점에 필요한 현금은 항상 확보해 두어야 합니다.)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation Tabs */}
      <div className="flex gap-2 mb-4 bg-[#1a2236] p-1.5 rounded-[12px] border border-[#1e2d4a]">
        <button 
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-2 rounded-[8px] font-bold text-[14px] transition-all ${activeTab === 'calculator' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#8896b0] hover:text-[#e8edf5]'}`}
        >
          계산기
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 rounded-[8px] font-bold text-[14px] transition-all ${activeTab === 'dashboard' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#8896b0] hover:text-[#e8edf5]'}`}
        >
          대시보드
        </button>
        <button 
          onClick={() => setActiveTab('soul')}
          className={`flex-1 py-2 rounded-[8px] font-bold text-[14px] transition-all ${activeTab === 'soul' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-[#8896b0] hover:text-[#e8edf5]'}`}
        >
          영혼법
        </button>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'soul' && renderSoulCalculator()}

      {activeTab === 'calculator' && (
        <>
          {/* Ticker Tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {tickers.map(ticker => (
          <div 
            key={ticker}
            onClick={() => switchTicker(ticker)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-bold cursor-pointer whitespace-nowrap transition-colors ${
              activeTicker === ticker 
                ? 'bg-[#3b82f6] text-white' 
                : 'bg-[#1a2236] text-slate-700 text-[#8896b0] border border-[#1e2d4a] hover:border-[#3b82f6] hover:text-[#e8edf5]'
            }`}
          >
            {ticker}
            {tickers.length > 1 && (
              <button 
                onClick={(e) => deleteTicker(ticker, e)}
                className={`ml-1 p-0.5 rounded-full ${activeTicker === ticker ? 'hover:bg-white/20 text-white/70 hover:text-white' : 'hover:bg-[#1e2d4a] text-[#5a6a85] hover:text-[#f87171]'}`}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        
        {isAddingTicker ? (
          <div className="flex items-center gap-1 border border-[#3b82f6] rounded-full px-2 py-1 bg-[#1a2236]">
            <input 
              type="text" 
              value={newTickerName}
              onChange={e => setNewTickerName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addTicker();
                if (e.key === 'Escape') { setIsAddingTicker(false); setNewTickerName(''); }
              }}
              placeholder="종목명"
              className="w-16 bg-transparent outline-none font-bold uppercase text-white"
              autoFocus
            />
            <button onClick={addTicker} className="p-0.5 rounded-full text-[#34d399] hover:bg-[#1e2d4a]"><Plus size={14} /></button>
            <button onClick={() => { setIsAddingTicker(false); setNewTickerName(''); }} className="p-0.5 rounded-full text-[#f87171] hover:bg-[#1e2d4a]"><X size={14} /></button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingTicker(true)}
            className="flex items-center justify-center w-7 h-7 rounded-full border hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors shrink-0 bg-[#1a2236] border-[#1e2d4a] text-[#8896b0]"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Input Card */}
      <div className="border rounded-[14px] p-5 mb-3.5 transition-colors bg-[#111827] border-[#1e2d4a] hover:border-[#2a3d5e]">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold tracking-[1px] uppercase flex items-center gap-1.5 text-[#5a6a85]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] inline-block"></span>
            투자 정보 입력
          </div>
          <button 
            onClick={() => {
              if (marketPrice) setCalcPrice(marketPrice);
              setShowBudgetCalc(true);
            }}
            className="font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[#60a5fa] bg-[rgba(59,130,246,0.1)] hover:bg-[rgba(59,130,246,0.2)]"
          >
            💰 시드 계산기
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="field">
            <label className="flex justify-between items-center font-medium mb-1.5 text-[#8896b0]">
              <span>총 투자 시드 ($)</span>
              {seed && !isNaN(parseFloat(seed)) && (
                <span className="text-[13px] text-[#5a6a85] font-normal">
                  약 {(parseFloat(seed) * 1500).toLocaleString()}원 <span className="text-[11px] opacity-80">(환율 1,500원 기준)</span>
                </span>
              )}
            </label>
            <input 
              type="number" 
              value={seed}
              onChange={e => setSeed(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="10,000" 
              inputMode="numeric"
              className={`w-full bg-[#1a2236] border ${errors.seed ? 'border-[#f87171] shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : 'border-[#1e2d4a] focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'} rounded-[10px] px-3.5 py-3 text-[16px] font-mono font-semibold text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85] placeholder:font-normal`}
            />
          </div>
          
          <div className="field">
            <label className="block font-medium mb-1.5 text-[#8896b0]">현재 진행 회차</label>
            <input 
              type="number" 
              value={round}
              onChange={e => setRound(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="1" 
              min="1" 
              max="40" 
              inputMode="numeric"
              className={`w-full bg-[#1a2236] border ${errors.round ? 'border-[#f87171] shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : 'border-[#1e2d4a] focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'} rounded-[10px] px-3.5 py-3 text-[16px] font-mono font-semibold text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85] placeholder:font-normal`}
            />
            <div className="mt-1 text-[#5a6a85]">1~40 범위 (40회차 = 1사이클 완료)</div>
            {errors.round && <div className="mt-1 text-[#f87171]">회차는 1~40 사이로 입력해주세요</div>}
          </div>

          <div className="field">
            <label className="block font-medium mb-1.5 text-[#8896b0]">현재 평균 매수 단가 ($)</label>
            <input 
              type="number" 
              step="0.01" 
              value={avgPrice}
              onChange={e => setAvgPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="50.25" 
              inputMode="decimal"
              className={`w-full bg-[#1a2236] border ${errors.avgPrice ? 'border-[#f87171] shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : 'border-[#1e2d4a] focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'} rounded-[10px] px-3.5 py-3 text-[16px] font-mono font-semibold text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85] placeholder:font-normal`}
            />
          </div>

          <div className="field">
            <label className="block font-medium mb-1.5 text-[#8896b0]">현재 시장가 ($)</label>
            <input 
              type="number" 
              step="0.01" 
              value={marketPrice}
              onChange={e => setMarketPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="48.50" 
              inputMode="decimal"
              className={`w-full bg-[#1a2236] border ${errors.marketPrice ? 'border-[#f87171] shadow-[0_0_0_3px_rgba(248,113,113,0.15)]' : 'border-[#1e2d4a] focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'} rounded-[10px] px-3.5 py-3 text-[16px] font-mono font-semibold text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85] placeholder:font-normal`}
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-4.5">
          <button 
            onClick={calculate}
            className="flex-1 border-none rounded-[10px] py-3.5 px-2.5 text-[15px] font-bold font-sans cursor-pointer transition-all active:scale-[0.97] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white hover:opacity-90"
          >
            계산하기
          </button>
          <button 
            onClick={saveData}
            className={`flex-1 rounded-[10px] py-3.5 px-2.5 text-[15px] font-bold font-sans cursor-pointer transition-all active:scale-[0.97] bg-[#1a2236] border-[1.5px] ${isSaved ? 'border-[#34d399] text-[#34d399]' : 'border-[#1e2d4a] text-[#8896b0] hover:border-[#34d399] hover:text-[#34d399]'}`}
          >
            {isSaved ? '저장됨 ✓' : '저장하기'}
          </button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div 
            id="resultArea"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="border rounded-[14px] p-5 mb-3.5 bg-[#111827] border-[#1e2d4a]">
              <div className="text-center mb-3.5">
                <h2 className="font-bold text-[#fbbf24]">📋 오늘의 주문 가이드</h2>
                <div className="inline-block mt-1.5 font-semibold px-3 py-[3px] rounded-full border bg-[rgba(251,191,36,0.1)] text-[#fbbf24] border-[rgba(251,191,36,0.2)]">
                  {results.round} / 40 회차
                </div>
              </div>

              {/* Seed Warning */}
              {!results.isSeedSufficient && (
                <div className="border rounded-[10px] p-3.5 mb-3.5 bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.2)]">
                  <div className="font-bold flex items-center gap-1.5 mb-1.5 text-[#f87171]">
                    <span>⚠</span> 시드 부족 경고
                  </div>
                  <div className="leading-relaxed text-[#e8edf5]">
                    1회차 예산(${results.dailyBudget.toFixed(2)})으로 현재가 기준 2주 이상 매수할 수 없습니다.<br/>
                    원활한 무한매수법 진행을 위해 시드를 늘리거나 주가가 낮은 종목을 선택하세요.<br/>
                    <span className="mt-1.5 block text-[#fbbf24]">💡 <strong>팁:</strong> 소수점 매매를 지원하는 증권사를 이용하면 소액으로도 가능합니다!</span>
                  </div>
                </div>
              )}

              {/* 매도 지정가 */}
              <div className="border rounded-[10px] p-4 mb-3.5 relative bg-[rgba(248,113,113,0.05)] border-[rgba(248,113,113,0.2)]">
                <div className="font-bold mb-2 flex items-center gap-1.5 text-[#f87171]">
                  <span className="text-[16px]">🎯</span> 매도 규칙 (SELL)
                </div>
                <div className="leading-relaxed mb-3 text-[#8896b0]">
                  매일 장 시작 전, 내 평단가 대비 <strong className="text-[#f87171]">+10% 가격</strong>에 <strong>보유 주식 전량</strong>을 <strong>'지정가 매도'</strong>로 걸어두세요.
                </div>
                
                <div className="rounded-lg p-3 border bg-[#111827] border-[rgba(248,113,113,0.1)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-[#5a6a85]">지정가 매도 주문가</span>
                    <span className="px-[7px] py-[1px] rounded font-bold bg-[rgba(248,113,113,0.15)] text-[#f87171]">SELL +10%</span>
                  </div>
                  <div className="font-mono font-bold flex items-center gap-2 text-[#f87171]">
                    ${results.sellPrice.toFixed(2)}
                    <button onClick={() => copyToClipboard(results.sellPrice.toFixed(2), 'sell')} className="text-slate-500 hover:text-red-500 transition-colors">
                      {copiedStates['sell'] ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-[rgba(248,113,113,0.1)]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8896b0]">체결 시 예상 수익</span>
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#34d399]">
                        +${results.expectedProfitUSD.toFixed(2)}
                      </div>
                      <div className="text-[#5a6a85]">
                        (약 {Math.round(results.expectedProfitKRW).toLocaleString()}원)
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-[#5a6a85]">* 환율 1,500원 기준</div>
                </div>
              </div>

              {results.round === 1 ? (
                /* 1회차 특별 표시 */
                <div className="border rounded-[10px] p-4 mb-2.5 relative bg-[#162032] border-[#1e2d4a]">
                  <div className="font-medium mb-2 flex items-center gap-1.5 text-[#8896b0]">
                    1회차 매수 <span className="px-[7px] py-[1px] rounded font-bold bg-[rgba(52,211,153,0.12)] text-[#34d399]">BUY</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono font-bold text-[#34d399]">현재가 매수</span>
                  </div>
                  <div className="mt-1.5 text-[#5a6a85]">장중 아무 시간에나 1주(또는 1회차 예산만큼)를 매수하여 사이클을 시작하세요.</div>
                </div>
              ) : (
                <>
                  {/* LOC 평단매수 */}
                  <div className="border rounded-[10px] p-4 mb-2.5 relative bg-[#162032] border-[#1e2d4a]">
                    <div className="font-medium mb-2 flex items-center gap-1.5 text-[#8896b0]">
                      ① LOC 평단매수 <span className="px-[7px] py-[1px] rounded font-bold bg-[rgba(52,211,153,0.12)] text-[#34d399]">BUY</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#34d399]">${results.locAvgPrice.toFixed(2)}</span>
                        <button onClick={() => copyToClipboard(results.locAvgPrice.toFixed(2), 'locAvg')} className="text-slate-500 hover:text-emerald-500 transition-colors">
                          {copiedStates['locAvg'] ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <span className="font-mono font-semibold text-[#e8edf5]">{results.locAvgShares}주</span>
                    </div>
                    <div className="mt-1.5 text-[#5a6a85]">평균 단가로 지정가 매수</div>
                    {results.locAvgShares === 0 && (
                      <div className="border px-2.5 py-1.5 rounded-md mt-1.5 text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.2)]">
                        ⚠ 예산 대비 단가가 높아 매수 불가 (0주)
                      </div>
                    )}
                  </div>

                  {/* LOC 큰수매수 */}
                  <div className="border rounded-[10px] p-4 mb-2.5 relative bg-[#162032] border-[#1e2d4a]">
                    <div className="font-medium mb-2 flex items-center gap-1.5 text-[#8896b0]">
                      ② LOC 큰수매수 <span className="px-[7px] py-[1px] rounded font-bold bg-[rgba(52,211,153,0.12)] text-[#34d399]">BUY +15%</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#34d399]">${results.locHighPrice.toFixed(2)}</span>
                        <button onClick={() => copyToClipboard(results.locHighPrice.toFixed(2), 'locHigh')} className="text-slate-500 hover:text-emerald-500 transition-colors">
                          {copiedStates['locHigh'] ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <span className="font-mono font-semibold text-[#e8edf5]">{results.locHighShares}주</span>
                    </div>
                    <div className="mt-1.5 text-[#5a6a85]">시장가 × 1.15 지정가 매수</div>
                    {results.locHighShares === 0 && (
                      <div className="border px-2.5 py-1.5 rounded-md mt-1.5 text-[#fbbf24] bg-[rgba(251,191,36,0.1)] border-[rgba(251,191,36,0.2)]">
                        ⚠ 예산 대비 단가가 높아 매수 불가 (0주)
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Summary */}
              <div className="flex justify-between items-center border rounded-[10px] px-4 py-3 mt-1 bg-[#1a2236] border-[#1e2d4a]">
                <span className="text-[#5a6a85]">금일 매수 배정 예산</span>
                <span className="font-mono font-bold text-[#22d3ee]">${results.dailyBudget.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border rounded-[10px] px-4 py-3 mt-2 bg-[#1a2236] border-[#1e2d4a]">
                <span className="text-[#5a6a85]">잔여 투자 예산</span>
                <span className="font-mono font-bold text-[#22d3ee]">${results.remaining.toFixed(2)}</span>
              </div>

              {/* Progress */}
              <div className="mt-3.5 mb-4">
                <div className="flex justify-between mb-1.5 text-[#5a6a85]">
                  <span>사이클 진행률</span>
                  <span>{results.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-[#1a2236]">
                  <div 
                    className="h-full bg-gradient-to-r from-[#3b82f6] to-[#22d3ee] rounded-full transition-all duration-600 ease-out"
                    style={{ width: `${results.pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Next Day Simulation */}
              {results.round < 40 && (
                <div className="mb-4">
                  <button 
                    onClick={() => setShowSimulation(!showSimulation)}
                    className="w-full flex items-center justify-between border hover:border-[#3b82f6] rounded-[10px] px-4 py-3 transition-colors font-bold bg-[#162032] border-[#1e2d4a] text-[#e8edf5]"
                  >
                    <span className="flex items-center gap-2">
                      <span>🔮</span> 내일 예상 평단가 보기
                    </span>
                    <ChevronRight size={16} className={`text-[#5a6a85] transition-transform ${showSimulation ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showSimulation && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border rounded-[10px] p-4 space-y-3 bg-[#1a2236] border-[#1e2d4a]">
                          <div className="mb-1 text-[#8896b0]">오늘 주문이 체결되었을 때 내일({results.round + 1}회차)의 예상 평단가입니다. (보수적 계산)</div>
                          
                          <div className="flex justify-between items-center pb-3 border-[#1e2d4a]">
                            <div>
                              <div className="font-bold text-[#e8edf5]">모두 체결 시</div>
                              <div className="text-[#5a6a85]">평단매수 + 큰수매수</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-[#34d399]">${results.simulations.caseAAvg.toFixed(2)}</div>
                              <div className="text-[#5a6a85]">
                                {results.simulations.caseAAvg < results.locAvgPrice ? '▼ 단가 하락' : '단가 유지/상승'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-bold text-[#e8edf5]">큰수매수만 체결 시</div>
                              <div className="text-[#5a6a85]">주가가 평단가보다 높을 때</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-[#f87171]">${results.simulations.caseBAvg.toFixed(2)}</div>
                              <div className="text-[#5a6a85]">
                                {results.simulations.caseBAvg > results.locAvgPrice ? '▲ 단가 상승' : '단가 유지/하락'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Memo Input */}
              <div className="mb-4">
                <label className="block font-medium mb-1.5 text-[#8896b0]">매매 일지 (메모)</label>
                <input
                  type="text"
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="오늘의 시장 상황이나 다짐을 기록해보세요"
                  className="w-full bg-[#1a2236] border border-[#1e2d4a] focus:border-[#3b82f6] rounded-[10px] px-3.5 py-3 text-[14px] text-[#e8edf5] outline-none transition-all placeholder:text-[#5a6a85]"
                />
              </div>

              <div className="mt-5 flex gap-2">
                <button 
                  onClick={addToHistory}
                  className="flex-1 border hover:border-[#3b82f6] hover:text-[#3b82f6] rounded-[10px] py-3.5 font-bold transition-colors flex items-center justify-center gap-2 bg-[#1a2236] border-[#1e2d4a] text-[#8896b0]"
                >
                  <History size={16} />
                  기록에 저장
                </button>
                <button
                  onClick={shareResults}
                  className="px-4 py-3.5 rounded-[10px] font-bold transition-all flex items-center justify-center border hover:border-[#3b82f6] hover:text-[#3b82f6] active:scale-[0.98] bg-[#1a2236] border-[#1e2d4a] text-[#8896b0]"
                  title="결과 공유하기"
                >
                  {copiedStates['share'] ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="rounded-[20px] w-full max-w-[360px] shadow-2xl overflow-hidden border bg-[#0f172a] border-[#1e2d4a]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-[#1e2d4a]">
                <h3 className="font-bold flex items-center gap-2 text-[#e8edf5]">
                  <Settings size={18} /> 설정 및 데이터 관리
                </h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 p-1 hover:text-[#e8edf5]">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="p-4 rounded-xl border bg-[#162032] border-[#1e2d4a]">
                  <h4 className="font-bold mb-2 flex items-center gap-1.5 text-[#8896b0]">
                    <Download size={16} /> 데이터 백업
                  </h4>
                  <p className="mb-3 leading-relaxed text-[#5a6a85]">
                    현재 저장된 모든 종목 설정과 기록을 파일로 다운로드합니다. 기기를 변경하거나 브라우저 캐시를 삭제하기 전에 반드시 백업하세요.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={exportData}
                      className="flex-1 py-2.5 rounded-lg font-bold transition-colors bg-[#e8edf5] text-[#0f172a] hover:bg-white text-sm"
                    >
                      전체 백업 (JSON)
                    </button>
                    <button 
                      onClick={exportCSV}
                      className="flex-1 py-2.5 rounded-lg font-bold transition-colors bg-[#10b981] text-white hover:bg-[#059669] text-sm"
                    >
                      엑셀 내보내기 (CSV)
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-[#162032] border-[#1e2d4a]">
                  <h4 className="font-bold mb-2 flex items-center gap-1.5 text-[#8896b0]">
                    <Upload size={16} /> 데이터 복원
                  </h4>
                  <p className="mb-3 leading-relaxed text-[#5a6a85]">
                    백업해둔 <span className="text-[#e8edf5] font-bold">JSON 또는 CSV 파일</span>을 불러와 데이터를 복구합니다. <br/>
                    <span className="text-red-500">주의: 현재 기기의 데이터는 덮어쓰기 됩니다.</span>
                  </p>
                  <input 
                    type="file" 
                    accept=".json,application/json,.csv,text/csv" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={importData}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 border rounded-lg font-bold transition-colors bg-[#1a2236] border-[#1e2d4a] text-[#e8edf5] hover:bg-[#1e2d4a]"
                  >
                    백업 파일(JSON/CSV) 불러오기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Calculator Modal */}
      <AnimatePresence>
        {showBudgetCalc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => {
              setShowBudgetCalc(false);
              setCalcResult(null);
              setCalcPrice('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="rounded-[20px] w-full max-w-[360px] shadow-2xl overflow-hidden border bg-[#0f172a] border-[#1e2d4a]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-[#1e2d4a]">
                <h3 className="font-bold flex items-center gap-2 text-[#e8edf5]">
                  💰 필요 예산 계산기
                </h3>
                <button 
                  onClick={() => {
                    setShowBudgetCalc(false);
                    setCalcResult(null);
                    setCalcPrice('');
                  }} 
                  className="text-slate-500 p-1 hover:text-[#e8edf5]"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Reverse Calculation Section */}
                <div className="rounded-xl p-3.5 border bg-[#162032] border-[#1e2d4a]">
                  <div className="font-bold mb-3 uppercase tracking-wider text-[#5a6a85]">시드 기준 역산 (얼마까지 가능?)</div>
                  <div className="space-y-3">
                    <div>
                      <label className="flex justify-between items-center mb-1 text-[#8896b0]">
                        <span>시드 금액 입력 ($)</span>
                        {(calcSeed || seed) && !isNaN(parseFloat(calcSeed || seed || '0')) && (
                          <span className="text-[12px] text-[#5a6a85]">
                            약 {(parseFloat(calcSeed || seed || '0') * 1500).toLocaleString()}원 <span className="text-[10px] opacity-80">(환율 1,500원 기준)</span>
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[#5a6a85]">$</span>
                        <input 
                          type="number" 
                          value={calcSeed}
                          onChange={e => setCalcSeed(e.target.value)}
                          placeholder={seed || "0"}
                          className="w-full border rounded-lg py-1.5 pl-7 pr-3 text-[13px] font-mono focus:ring-1 focus:ring-[#3b82f6] outline-none transition-all bg-[#111827] border-[#1e2d4a]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline pt-2 border-[#1e2d4a]/50">
                      <span className="font-bold text-[#22d3ee]">매수 가능 최대 주가</span>
                      <div className="text-right">
                        <div className="font-mono font-bold text-[#22d3ee]">
                          ${(parseFloat(calcSeed || seed || '0') / 80).toFixed(2)}
                        </div>
                        <div className="text-[#5a6a85]">
                          (약 {( (parseFloat(calcSeed || seed || '0') / 80) * 1500 ).toLocaleString(undefined, {maximumFractionDigits: 0})}원)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-[#1e2d4a]"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="px-2 bg-[#0f172a] text-[#5a6a85]">또는</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-[#8896b0]">종목 현재가 입력 (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[#5a6a85]">$</span>
                    <input 
                      type="number" 
                      value={calcPrice}
                      onChange={e => setCalcPrice(e.target.value)}
                      placeholder="예: 55.42"
                      className="w-full border rounded-xl py-3 pl-8 pr-4 text-[15px] font-mono focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all bg-[#162032] border-[#1e2d4a]"
                    />
                  </div>
                </div>

                <button 
                  onClick={calculateRequiredBudget}
                  className="w-full py-3.5 bg-[#3b82f6] text-white rounded-xl text-[14px] font-bold hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
                >
                  계산하기
                </button>

                {calcResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-xl p-4 space-y-4 bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.1)]"
                  >
                    <div className="flex justify-between items-start">
                      <span className="mt-1 text-[#8896b0]">총 필요 시드 (40회차)</span>
                      <div className="text-right">
                        <div className="font-black font-mono text-[#60a5fa]">
                          ${calcResult.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[#5a6a85]">
                          약 {calcResult.totalKRW.toLocaleString(undefined, { maximumFractionDigits: 0 })}원
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-start pt-3 border-[rgba(59,130,246,0.1)]">
                      <span className="mt-0.5 text-[#8896b0]">1회차 배정 예산</span>
                      <div className="text-right">
                        <div className="font-bold font-mono text-[#e8edf5]">
                          ${calcResult.daily.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[#5a6a85]">
                          약 {calcResult.dailyKRW.toLocaleString(undefined, { maximumFractionDigits: 0 })}원
                        </div>
                      </div>
                    </div>
                    <div className="leading-relaxed text-[#5a6a85]">
                      * 환율 1,500원 기준 (무한매수법 40분할 원칙)
                    </div>
                    <button 
                      onClick={() => {
                        setSeed(calcResult.total.toFixed(2));
                        if (calcPrice) {
                          setMarketPrice(calcPrice);
                        }
                        setShowBudgetCalc(false);
                        setCalcResult(null);
                        setCalcPrice('');
                        showToast('✅ 계산된 시드와 현재가가 입력되었습니다');
                      }}
                      className="w-full py-2 border rounded-lg font-bold transition-colors bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.2)] text-[#60a5fa] hover:bg-blue-50"
                    >
                      이 금액을 내 시드로 설정하기
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="border rounded-[16px] w-full max-w-[400px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl bg-[#111827] border-[#1e2d4a]"
            >
              <div className="flex items-center justify-between p-4 border-[#1e2d4a] bg-[#162032]">
                <h2 className="font-bold flex items-center gap-2 text-[#e8edf5]">
                  <History size={18} className="text-[#22d3ee]" />
                  {activeTicker} 기록
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg p-1 border bg-[#1a2236] border-[#1e2d4a]">
                    <button 
                      onClick={() => setHistoryViewMode('list')}
                      className={`p-1.5 rounded-md transition-colors ${historyViewMode === 'list' ? 'bg-[#3b82f6] text-white' : 'text-[#5a6a85] hover:text-[#e8edf5]'}`}
                    >
                      <List size={14} />
                    </button>
                    <button 
                      onClick={() => setHistoryViewMode('chart')}
                      className={`p-1.5 rounded-md transition-colors ${historyViewMode === 'chart' ? 'bg-[#3b82f6] text-white' : 'text-[#5a6a85] hover:text-[#e8edf5]'}`}
                    >
                      <BarChart2 size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => setShowHistory(false)}
                    className="hover:text-white p-1.5 rounded-full transition-colors ml-1 text-[#8896b0] hover:bg-[#1e2d4a]"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {historyViewMode === 'chart' ? (
                  <div className="h-[300px] w-full mt-2">
                    {currentTickerHistory.length < 2 ? (
                      <div className="py-10 text-[#5a6a85]">
                        차트를 보려면 같은 종목의 기록이 최소 2개 이상 필요합니다.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentTickerHistory} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
                          <XAxis dataKey="round" stroke="#5a6a85" fontSize={10} tickFormatter={(val) => `${val}회`} />
                          <YAxis stroke="#5a6a85" fontSize={10} domain={['auto', 'auto']} tickFormatter={(val) => `$${val}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: true ? '#162032' : '#ffffff', borderColor: true ? '#1e2d4a' : '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            labelStyle={{ color: true ? '#8896b0' : '#64748b', marginBottom: '4px' }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                            labelFormatter={(label) => `${label}회차`}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                          <Line type="monotone" dataKey="avgPrice" name="평단가" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
                          <Line type="monotone" dataKey="marketPrice" name="시장가" stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: '#f87171' }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                ) : (
                  <>
                    {currentTickerHistory.length === 0 ? (
                      <div className="py-10 text-[#5a6a85]">
                        저장된 기록이 없습니다.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentTickerHistory.map(entry => (
                          <div key={entry.id} className="border rounded-[12px] p-3.5 relative group bg-[#1a2236] border-[#1e2d4a]">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 text-[#8896b0]">
                                <span className="px-2 py-0.5 rounded font-bold bg-[#1e2d4a] text-[#e8edf5]">{entry.ticker || 'TQQQ'}</span>
                                {entry.date}
                              </div>
                              <button 
                                onClick={() => deleteHistoryEntry(entry.id)}
                                className="hover:text-red-500 transition-colors text-[#f87171]"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <div className="text-[#5a6a85]">회차</div>
                                <div className="font-bold text-[#e8edf5]">{entry.round}회차</div>
                              </div>
                              <div>
                                <div className="text-[#5a6a85]">평단가</div>
                                <div className="font-bold text-[#e8edf5]">${entry.avgPrice.toFixed(2)}</div>
                              </div>
                            </div>
                            
                            {entry.memo && (
                              <div className="mb-3 p-2.5 rounded-lg text-sm bg-[#0f172a] border border-[#1e2d4a] text-[#8896b0]">
                                <span className="font-bold text-[#60a5fa] mr-1.5">메모:</span>
                                {entry.memo}
                              </div>
                            )}
                            
                            <button 
                              onClick={() => loadHistoryEntry(entry)}
                              className="w-full py-2 text-[#3b82f6] text-[12px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 bg-[rgba(59,130,246,0.1)] hover:bg-[rgba(59,130,246,0.2)]"
                            >
                              불러오기 <ChevronRight size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {currentTickerHistory.length > 0 && historyViewMode === 'list' && (
                <div className="p-4 border-[#1e2d4a] bg-[#162032]">
                  <button 
                    onClick={clearHistory}
                    className="w-full py-2.5 font-bold hover:bg-red-50 rounded-lg transition-colors text-[#f87171] bg-[rgba(248,113,113,0.15)]"
                  >
                    모든 기록 삭제
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center py-5 pb-2.5 text-[11px] text-[#5a6a85]">
        <p>라오어 무한매수법 · 투자의 판단은 본인의 책임입니다</p>
        <p className="mt-1.5">제작자 지글 (todaynit1@gmail.com)</p>
      </div>

      {/* Toast */}
      <div className={`fixed bottom-[30px] left-1/2 -translate-x-1/2 bg-[#1e293b] border border-[#1e2d4a] text-[#e8edf5] px-6 py-3 rounded-xl text-[14px] font-medium z-[100] shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 pointer-events-none ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
        {toast.msg}
      </div>
    </div>
  );
}
