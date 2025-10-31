import React from "react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="text-center p-8 border-2 border-dashed rounded-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action && (
        <a href={action.href}>
          <Button>{action.label}</Button>
        </a>
      )}
    </div>
  );
};

export default EmptyState;
