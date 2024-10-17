import { Box } from '@mui/material';
import { useRef, useState } from 'react';

export default function FilePickerWrapper({ children, disabled, onFileChanged }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChanged(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileChanged(e.target.files[0]);
    }
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      sx={{
        border: dragActive ? '2px dashed #4A90E2' : '2px dashed #CCCCCC',
        borderRadius: 4,
        padding: '20px',
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      {children}
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
}