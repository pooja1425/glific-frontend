import React from 'react';
import { Button as ButtonElement, CircularProgress } from '@material-ui/core';
import styles from './Button.module.css';

export interface ButtonProps {
  'data-testid'?: string;
  children: any;
  variant: 'text' | 'outlined' | 'contained' | undefined;
  color: 'inherit' | 'primary' | 'secondary' | 'default' | undefined;
  onClick?: any;
  className?: any;
  loading?: boolean;
}

export const Button: React.SFC<ButtonProps> = (props) => {
  let buttonColor = null;
  if (props.variant === 'outlined') buttonColor = styles.ButtonColor;
  return (
    <ButtonElement
      variant={props.variant}
      color={props.color}
      onClick={props.onClick}
      data-testid={props['data-testid']}
      className={`${styles.Button} ${props.className} ${buttonColor}`}
      disabled={props.loading}
    >
      {props.children}
      {props.loading && <CircularProgress size={28} className={styles.buttonProgress} />}
    </ButtonElement>
  );
};
