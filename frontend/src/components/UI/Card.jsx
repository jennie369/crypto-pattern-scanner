import React from 'react';
import './Card.css';

/**
 * Card Component - Responsive glass-morphism card
 * Uses design tokens for consistent styling
 *
 * @param {string} padding - 'compact' | 'default' | 'spacious'
 * @param {string} variant - 'default' | 'glass' | 'bordered'
 * @param {boolean} hoverable - Enable hover effects
 */
const Card = ({
  children,
  className = '',
  padding = 'default',
  variant = 'default',
  hoverable = false,
  onClick,
  ...props
}) => {
  const classes = [
    'ui-card',
    `ui-card-padding-${padding}`,
    `ui-card-${variant}`,
    hoverable ? 'ui-card-hoverable' : '',
    onClick ? 'ui-card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`ui-card-header ${className}`} {...props}>
    {children}
  </div>
);

// Card Body
export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`ui-card-body ${className}`} {...props}>
    {children}
  </div>
);

// Card Footer
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`ui-card-footer ${className}`} {...props}>
    {children}
  </div>
);

// Stat Card for profile/dashboard stats
export const StatCard = ({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  className = '',
  ...props
}) => (
  <Card className={`ui-stat-card ${className}`} padding="compact" {...props}>
    <div className="ui-stat-card-content">
      {Icon && (
        <div className="ui-stat-card-icon">
          <Icon size={24} />
        </div>
      )}
      <div className="ui-stat-card-info">
        <span className="ui-stat-card-label">{label}</span>
        <span className="ui-stat-card-value">{value}</span>
        {trend && (
          <span className={`ui-stat-card-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  </Card>
);

// Info Card for dashboard overview
export const InfoCard = ({
  icon: Icon,
  title,
  value,
  description,
  className = '',
  ...props
}) => (
  <Card className={`ui-info-card ${className}`} {...props}>
    {Icon && (
      <div className="ui-info-card-icon">
        <Icon size={32} />
      </div>
    )}
    <h4 className="ui-info-card-title">{title}</h4>
    <span className="ui-info-card-value">{value}</span>
    {description && (
      <p className="ui-info-card-description">{description}</p>
    )}
  </Card>
);

export default Card;
