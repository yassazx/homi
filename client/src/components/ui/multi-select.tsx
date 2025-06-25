"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  className?: string
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, value = [], onChange, placeholder = "Select...", className }, ref) => {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const toggleDropdown = () => setOpen((prev) => !prev)
    const closeDropdown = () => setOpen(false)

    const handleSelect = (selectedValue: string) => {
      const newValue = value.includes(selectedValue)
        ? value.filter((v) => v !== selectedValue)
        : [...value, selectedValue]
      onChange?.(newValue)
    }

    // 🔒 Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          closeDropdown()
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [])

    return (
      <div className="relative w-full" ref={containerRef}>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onClick={toggleDropdown}
          className={cn("w-full justify-between", className)}
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((val) => (
                <Badge key={val} variant="secondary" className="mb-1 mr-1">
                  {options.find((option) => option.value === val)?.label}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-md">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        )}
      </div>
    )
  }
)

MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
