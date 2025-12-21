import React from 'react';
import { Button, Space } from 'antd';
import './ColorPalette.less';

const ColorPalette = () => {
  // Colors from the image (lower 3 palettes as requested for light theme)
  const colors = [
    '#C1E8FF', // Lightest - main color for light theme
    '#7DA0CA',
    '#5483B3',
    '#052659',
    '#021024'
  ];

  return (
    <div className="color-palette-container">
      <div className="color-palette-header">
        <h2>Color Palette</h2>
        <p>Designed for modern UI with gradient backgrounds</p>
      </div>
      
      <div className="color-palette-wrapper">
        {colors.map((color, index) => (
          <div 
            key={index} 
            className="color-swatch"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 4px 12px rgba(0, 0, 0, ${index < 3 ? 0.1 : 0.3})`,
              transition: 'all 0.3s ease-in-out'
            }}
          >
            <span className="color-code">{color}</span>
          </div>
        ))}
      </div>
      
      <div className="theme-usage">
        <h3>Theme Implementation</h3>
        <div className="theme-examples">
          <div className="example-box" style={{ backgroundColor: '#C1E8FF' }}>
            <h4>Light Theme</h4>
            <p>Primary color for light mode</p>
          </div>
          <div className="example-box" style={{ backgroundColor: '#021024' }}>
            <h4>Dark Theme</h4>
            <p>Primary color for dark mode</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;