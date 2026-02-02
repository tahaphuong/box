import { type SetStateAction } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PopoverContent } from "@/components/ui/popover";
import { Check } from "lucide-react";

export const PopOverOptions = ({
  options,
  option,
  onSelectOption,
}: {
  options: Record<string, string>;
  option: string | null;
  onSelectOption: (value: SetStateAction<string>) => void;
}) => {
  return (
    <PopoverContent className="w-45 p-0">
      <Command>
        <CommandEmpty>No options found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            {Object.entries(options).map(([key, label]) => (
              <CommandItem key={key} value={label} onSelect={onSelectOption}>
                <Check
                  className={`mr-2 h-4 w-4 ${option === key ? "opacity-100" : "opacity-0"}`}
                />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  );
};