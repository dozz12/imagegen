import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Image as ImageIcon, Wand2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const apiKey = ""; // Environment handles this

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Function to enhance prompt using Gemini
  const enhancePrompt = async () => {
    if (!prompt) return;
    setIsEnhancing(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Improve this image generation prompt to be more detailed and artistic: "${prompt}". Return only the improved prompt text.` }] }]
        })
      });
      const data = await response.json();
      const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
      setPrompt(enhancedText.trim());
    } catch (err) {
      console.error("Gagal memperbagus prompt", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Function to generate image using Imagen 4.0
  const generateImage = async (e) => {
    e?.preventDefault();
    if (!prompt) return;
    
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: { prompt: prompt },
          parameters: { sampleCount: 1 }
        })
      });

      if (!response.ok) throw new Error("Gagal menghubungi server Imagen.");

      const result = await response.json();
      const base64Data = result.predictions?.[0]?.bytesBase64Encoded;
      
      if (base64Data) {
        setImageUrl(`data:image/png;base64,${base64Data}`);
      } else {
        throw new Error("Format respons tidak dikenal.");
      }
    } catch (err) {
      setError("Ups! Terjadi kesalahan saat membuat gambar. Silakan coba lagi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ThurGPT-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-purple-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-purple-400 mb-4">
            <Sparkles size={14} />
            <span>AI Image Generation v4.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            ThurGPT
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Ubah kata-kata menjadi gambar spektakuler dengan kekuatan AI tercanggih.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Input */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-2xl">
              <label className="block text-sm font-semibold text-slate-400 mb-3 ml-1 uppercase tracking-wider">
                Imaginasi Anda
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Deskripsikan gambar yang ingin Anda buat... (contoh: Pemandangan cyberpunk Jakarta di tahun 2077)"
                className="w-full h-40 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all resize-none shadow-inner"
              />
              
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={enhancePrompt}
                  disabled={!prompt || isEnhancing || loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium border border-slate-700"
                >
                  {isEnhancing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                  <span>Perbagus Prompt</span>
                </button>
                
                <button
                  onClick={generateImage}
                  disabled={!prompt || loading || isEnhancing}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-white shadow-lg shadow-purple-500/25"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                  <span>Buat Gambar</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                <ImageIcon size={14} /> Tips Prompting
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gunakan kata sifat yang spesifik seperti "cinematic lighting", "high detail", "8k resolution", atau sebutkan gaya artis tertentu untuk hasil yang lebih memukau.
              </p>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="relative group">
            <div className="aspect-square w-full bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl transition-all">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400 animate-pulse" size={24} />
                  </div>
                  <p className="text-slate-400 font-medium animate-pulse">Sedang melukis...</p>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full group/img">
                  <img 
                    src={imageUrl} 
                    alt="AI Generated" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={handleDownload}
                      className="p-4 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all transform translate-y-4 group-hover/img:translate-y-0"
                    >
                      <Download className="text-white" size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="w-20 h-20 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-800">
                    <ImageIcon className="text-slate-700" size={40} />
                  </div>
                  <p className="text-slate-500 font-medium">Hasil gambar akan muncul di sini</p>
                </div>
              )}
            </div>

            {imageUrl && !loading && (
              <button
                onClick={handleDownload}
                className="absolute -bottom-4 right-8 flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold shadow-xl hover:bg-slate-200 transition-all scale-95 group-hover:scale-100"
              >
                <Download size={18} />
                Unduh Hasil
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-12 text-center border-t border-slate-900 mt-12">
        <p className="text-slate-600 text-sm">
          Powered by ThurGPT Image Engine v4.0 • 2026
        </p>
      </footer>
    </div>
  );
};

export default App;

