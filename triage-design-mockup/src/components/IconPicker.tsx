import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { cn } from '../lib/utils';

// Curated list of popular icons
const POPULAR_ICONS = [
  'Sparkles', 'BarChart3', 'ClipboardCheck', 'Database', 'Timer',
  'Home', 'FileText', 'Hammer', 'FolderOpen', 'Palette',
  'ArrowRight', 'Settings', 'Users', 'Mail', 'Bell',
  'Calendar', 'Clock', 'Download', 'Upload', 'Search',
  'Heart', 'Star', 'ThumbsUp', 'MessageSquare', 'Share2',
  'Zap', 'TrendingUp', 'Award', 'Target', 'Rocket',
  'Shield', 'Lock', 'Unlock', 'Key', 'Eye',
  'CheckCircle', 'XCircle', 'AlertCircle', 'Info', 'HelpCircle',
  'Plus', 'Minus', 'X', 'Menu', 'MoreHorizontal',
  'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown', 'ChevronsUpDown',
  'Circle', 'Square', 'Triangle', 'Hexagon', 'Package',
  'Briefcase', 'Layers', 'Activity', 'PieChart', 'LineChart',
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search) return POPULAR_ICONS;
    return POPULAR_ICONS.filter((icon) =>
      icon.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as Icons.LucideIcon;
    return IconComponent || Icons.HelpCircle;
  };

  const CurrentIcon = getIconComponent(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="h-4 w-4" />
            <span>{value || 'Select icon...'}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          <div className="grid grid-cols-4 gap-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = getIconComponent(iconName);
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-md hover:bg-accent transition-colors relative',
                    value === iconName && 'bg-accent'
                  )}
                  title={iconName}
                >
                  <IconComponent className="h-5 w-5" />
                  {value === iconName && (
                    <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No icons found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
