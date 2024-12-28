import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "./ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

interface DropdownItem {
  value: string;
  label: string;
  color?: string;
}

interface DropdownProp {
  dropdownValue: string;
  setDropdownValue: (value: string) => void;
  dropdownItems: DropdownItem[];
}

const Dropdown = ({
  dropdownValue,
  setDropdownValue,
  dropdownItems,
}: DropdownProp) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            `w-[200px] justify-between ${
              dropdownItems.find(
                (dropdownItem) => dropdownItem.value === dropdownValue
              )?.color
            }`
          )}
        >
          {
            dropdownItems.find(
              (dropdownItem) => dropdownItem.value === dropdownValue
            )?.label
          }
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {dropdownItems.map((dropdownItem) => (
                <CommandItem
                  key={dropdownItem.value}
                  value={dropdownItem.value}
                  onSelect={(currentValue) => {
                    setDropdownValue(
                      currentValue === dropdownValue ? "" : currentValue
                    );
                    setOpen(false);
                  }}
                  className={cn(`${dropdownItem.color}`)}
                >
                  {dropdownItem.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      dropdownValue === dropdownItem.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Dropdown;
