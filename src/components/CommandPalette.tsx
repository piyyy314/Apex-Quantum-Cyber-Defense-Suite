import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  BookOpen,
  Cpu,
  FileCode,
  CornerDownLeft,
  X,
  ArrowUp,
  ArrowDown,
  FolderOpen,
} from 'lucide-react';
import {
  CommandCategory,
  CommandNavigationTarget,
  CommandSearchItem,
  filterCommandItems,
} from '../data/commandPaletteIndex';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (target: CommandNavigationTarget) => void;
}

const CATEGORIES: Array<'All' | CommandCategory> = [
  'All',
  'Documentation',
  'Components',
  'Project Files',
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | CommandCategory>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const results = useMemo(
    () => filterCommandItems(query, activeCategory),
    [query, activeCategory]
  );

  // Reset state and focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveCategory('All');
      setSelectedIndex(0);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Keep selectedIndex within bounds when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Ensure keyboard-selected row remains scrolled into view
  useEffect(() => {
    if (!isOpen) return;
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, isOpen]);

  const handleSelectItem = (item: CommandSearchItem) => {
    onNavigate(item.target);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
      return;
    }

    if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectItem(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  const getCategoryIcon = (category: CommandCategory) => {
    switch (category) {
      case 'Documentation':
        return <BookOpen className="h-4 w-4 text-amber-400 shrink-0" />;
      case 'Components':
        return <Cpu className="h-4 w-4 text-cyan-400 shrink-0" />;
      case 'Project Files':
        return <FileCode className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
  };

  const getCategoryBadgeStyle = (category: CommandCategory) => {
    switch (category) {
      case 'Documentation':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Components':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Project Files':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-slate-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-[#0b1120] shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <Search className="h-5 w-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation, code components, and project files..."
            aria-label="Command palette search"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Category Scope Tabs */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition ${
                  activeCategory === category
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-mono text-slate-500 shrink-0">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[52vh] overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <FolderOpen className="h-8 w-8 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">
                No matching documentation, components, or files found
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Try searching for &ldquo;ML-KEM&rdquo;, &ldquo;server.ts&rdquo;, &ldquo;AEGIS&rdquo;, &ldquo;Kraus&rdquo;, or &ldquo;pytest&rdquo;.
              </div>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelectItem(item)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/40 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-100 truncate">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getCategoryBadgeStyle(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </p>
                      {item.path && (
                        <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                          {item.path}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 shrink-0 self-center px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
                      <span>Open</span>
                      <CornerDownLeft className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              <ArrowDown className="h-3 w-3" />
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" />
              <span>Open Target</span>
            </span>
          </div>
          <span>Ctrl+K / Cmd+K to toggle</span>
        </div>
      </div>
    </div>
  );
};
