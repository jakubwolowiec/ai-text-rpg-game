//@ts-ignore
import React, {useState} from "react";

interface ActionInputProps {
    onAction: (action: string) => void;
    disabled?: boolean;
}

export const ActionInput: React.FC<ActionInputProps> = ({onAction, disabled = false}) => {
  const [input, setInput] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim() && !disabled){
          onAction(input.trim());
          setInput('');
      }
  };

  return (
    <form onSubmit={handleSubmit} style={{gridColumn: '1 / -1'}}>
        <div style={{display:'flex', gap:'10px'}}>
            <input
                type= "text"
                value= {input}
                onChange= {(e) => setInput(e.target.value)}
                placeholder= "Enter your action..."
                disabled={disabled}
                style={{
                    flex: 1,
                    padding: '12px',
                    background: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: '#e0e0e0',
                    fontFamily: 'monospace'
                }} />
            <button
                type="submit"
                disabled={disabled || !input.trim()}
                style={{
                    padding: '12px 24px',
                    background: disabled ? '#555' : '#ffd700',
                    color: disabled ? '#999' : '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold'
                }}>
                Execute
            </button>
        </div>
    </form>
  );
};