import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type BaseProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type ButtonAsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variants: Record<ButtonVariant, string> = {
  primary: "border-brand bg-brand text-white hover:border-brand-dark hover:bg-brand-dark hover:text-white",
  secondary: "border-brand bg-white text-brand hover:bg-brand hover:text-white",
  ghost: "border-transparent bg-transparent text-brand hover:bg-band hover:text-brand-dark",
};

export function Button(props: ButtonProps) {
  const { children, variant = "primary", className = "" } = props;
  const classes = `inline-flex min-h-14 items-center justify-center rounded-xl border-2 px-6 py-3 text-balance text-center text-lg font-bold leading-snug no-underline transition-colors ${variants[variant]} ${className}`;

  if (props.href !== undefined) {
    const { children: linkChildren, variant: _variant, className: _className, href, ...linkProps } = props;

    return (
      <Link className={classes} {...linkProps} href={href}>
        {linkChildren}
      </Link>
    );
  }

  const { children: buttonChildren, variant: _variant, className: _className, href: _href, ...buttonProps } = props;

  return (
    <button className={classes} {...buttonProps}>
      {buttonChildren}
    </button>
  );
}
