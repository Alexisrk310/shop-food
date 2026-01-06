'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps
	extends Omit<React.ComponentProps<'input'>, 'type' | 'onChange'> {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({
	className,
	checked,
	onCheckedChange,
	...props
}: CheckboxProps) {
	return (
		<input
			type="checkbox"
			checked={checked}
			onChange={(e) => onCheckedChange?.(e.target.checked)}
			data-slot="checkbox"
			className={cn(
				'peer h-4 w-4 shrink-0 rounded-sm border border-input shadow-xs ring-offset-background transition-shadow outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 accent-primary cursor-pointer dark:bg-input/30 checked:bg-primary checked:border-primary aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
				className
			)}
			{...props}
		/>
	);
}

export { Checkbox };
