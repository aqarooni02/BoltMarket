export default {
  slots: {
    base: 'font-medium tracking-tight',
    label: '',
    leadingIcon: 'size-4',
    trailingIcon: 'size-4'
  },
  variants: {
    size: {
      xs: { base: 'h-7 px-2.5 text-xs rounded-[calc(var(--ui-radius)_-_2px)]' },
      sm: { base: 'h-8 px-3 text-sm rounded-[calc(var(--ui-radius)_-_2px)]' },
      md: { base: 'h-9 px-4 rounded-[calc(var(--ui-radius)_-_2px)]' },
      lg: { base: 'h-10 px-5 text-[0.95rem] rounded-[calc(var(--ui-radius)_-_2px)]' },
      xl: { base: 'h-11 px-6 text-base rounded-[calc(var(--ui-radius)_-_2px)]' }
    },
    color: {
      primary: { base: 'bg-primary text-primary-foreground hover:bg-primary/90' },
      neutral: { base: 'bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-black dark:hover:bg-neutral-300' }
    },
    variant: {
      solid: { base: 'shadow-sm ring-1 ring-black/5 dark:ring-white/10' },
      ghost: { base: 'bg-transparent hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60' },
      outline: { base: 'bg-transparent ring-1 ring-neutral-200 dark:ring-neutral-800 hover:bg-neutral-100/40 dark:hover.bg-neutral-800/40' },
      soft: { base: 'bg-primary/10 text-primary hover:bg-primary/15' },
      subtle: { base: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700' },
      link: { base: 'bg-transparent underline-offset-4 hover:underline' }
    }
  },
  defaultVariants: {
    size: 'md' as const,
    variant: 'solid' as const
  }
}


