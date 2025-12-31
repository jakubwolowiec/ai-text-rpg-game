import React, { useState, KeyboardEvent } from 'react';
import '../App.css';

interface ActionInputProps {
    onAction: (action: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const ActionInput: React.FC<ActionInputProps> = ({
                                                            onAction,
                                                            disabled = false,
                                                            placeholder = "What would you like to do?"
                                                        }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onAction(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }

        // Autouzupełnianie - strzałka w górę dla historii
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Tutaj można dodać historię komend
        }
    };

    return (
        <div className="panel">
            <h2 className="section-title">Action</h2>

            <form onSubmit={handleSubmit} className="action-form">
                <div className="action-input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="action-input"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={disabled || !input.trim()}
                        className="action-submit-btn"
                    >
                        {disabled ? '...' : 'Execute'}
                    </button>
                </div>

            </form>
        </div>
    );
};