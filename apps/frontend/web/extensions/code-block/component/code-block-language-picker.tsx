import { memo, useCallback, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import type { SupportedLanguageConfig } from '../utils/supportedLanguages';

interface CodeBlockLanguagePickerProps {
  defaultLanguage?: string | null;
  language?: string | null;
  onLanguageSelect: (language: string) => void;
  supportedLanguages: SupportedLanguageConfig[];
}

export const CodeBlockLanguagePicker = memo(
  ({
    defaultLanguage,
    language,
    onLanguageSelect,
    supportedLanguages,
  }: CodeBlockLanguagePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const currentLanguage = useMemo(
      () =>
        supportedLanguages.find(
          (item) =>
            item.id === language ||
            (language != null && item.match.includes(language))
        ),
      [language, supportedLanguages]
    );

    const currentLanguageId =
      currentLanguage?.id ?? language ?? defaultLanguage ?? 'text';
    const currentLanguageName = currentLanguage?.name ?? currentLanguageId;

    const handlePopoverChange = useCallback((open: boolean) => {
      setIsOpen(open);

      if (!open) {
        setSearchValue('');
      }
    }, []);

    const handleSelect = useCallback(
      (selectedLanguage: string) => {
        onLanguageSelect(selectedLanguage);
        setIsOpen(false);
        setSearchValue('');
      },
      [onLanguageSelect]
    );

    return (
      <Popover open={isOpen} onOpenChange={handlePopoverChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label="选择代码语言"
            className="flex h-8 max-w-48 cursor-pointer items-center gap-1.5 rounded-sm px-2 text-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="truncate">{currentLanguageName}</span>
            <ChevronDown
              className={`size-4 shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-64 gap-0 overflow-hidden rounded-lg p-0"
          sideOffset={6}
        >
          <Command className="rounded-lg p-0">
            <CommandInput
              autoFocus
              placeholder="搜索语言"
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList className="max-h-80 p-1">
              <CommandEmpty>没有匹配的语言</CommandEmpty>
              {supportedLanguages.map((supportedLanguage) => {
                const isSelected = supportedLanguage.id === currentLanguageId;

                return (
                  <CommandItem
                    key={supportedLanguage.id}
                    className="min-h-9 px-3"
                    data-checked={isSelected}
                    keywords={[
                      supportedLanguage.name,
                      ...supportedLanguage.match,
                    ]}
                    value={supportedLanguage.id}
                    onSelect={() => handleSelect(supportedLanguage.id)}
                  >
                    <span className="truncate">{supportedLanguage.name}</span>
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

CodeBlockLanguagePicker.displayName = 'CodeBlockLanguagePicker';
