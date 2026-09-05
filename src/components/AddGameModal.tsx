import React, { useState } from 'react';
import { Game } from '../types.ts';
import { X, Plus, Play, Sparkles } from 'lucide-react';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGame: (game: Game) => void;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({
  isOpen,
  onClose,
  onAddGame,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('');
  const [previewActive, setPreviewActive] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const newGame: Game = {
      id: 'custom-' + Date.now(),
      title: title.trim(),
      category: category.trim() || 'Arcade',
      url: url.trim(),
      image:
        image.trim() ||
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80',
      description: description.trim() || 'User submitted unblocked iframe game.',
      controls: controls.trim() || 'Arrow keys / Mouse',
      isCustom: true,
    };

    onAddGame(newGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Add Custom Game</h3>
              <p className="text-xs text-slate-400">
                Add an embeddable iframe URL to your games list
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Game Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Retro Space Adventure"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="Clicker">Clicker</option>
                <option value="Arcade">Arcade</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Classic">Classic</option>
                <option value="Action">Action</option>
                <option value="Retro">Retro</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Controls Hint</label>
              <input
                type="text"
                value={controls}
                onChange={(e) => setControls(e.target.value)}
                placeholder="e.g. Arrow keys & Spacebar"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Iframe Game URL *</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/game/ or local path"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Thumbnail Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://... (Optional)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of gameplay..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm shadow-emerald-600/20 active:scale-95"
            >
              Add to Games
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
