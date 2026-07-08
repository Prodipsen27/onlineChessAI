/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PieceType, PieceColor } from '../types';

interface ChessPieceRendererProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
}

export const ChessPieceRenderer: React.FC<ChessPieceRendererProps> = ({ type, color, className = "" }) => {
  const c = color === 'white' ? 'w' : 'b';
  const imgUrl = `/pieces/${c}${type}.svg`;

  return (
    <img 
      src={imgUrl} 
      alt={`${color} ${type}`} 
      className={`w-full h-full drop-shadow-md select-none pointer-events-none ${className}`} 
      draggable={false} 
    />
  );
};
