/**
 * PageHeader - Responsive page header component
 * Mobile: compact title only. Desktop: full title + description.
 */

import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold tracking-tight md:text-2xl">
          {title}
        </h1>
        <p className="hidden text-muted-foreground md:block">{description}</p>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
