import React from 'react';
import { InventoryItem } from '../types/gameTypes';
import '../App.css';

interface InventoryProps {
    inventory: InventoryItem[];
}

export const Inventory: React.FC<InventoryProps> = ({ inventory }) => {
    const getItemColor = (type: string) => {
        switch(type) {
            case 'weapon': return 'inventory-weapon';
            case 'armor': return 'inventory-armor';
            case 'consumable': return 'inventory-consumable';
            case 'special': return 'inventory-special';
            default: return 'inventory-item-default';
        }
    };

    const getItemIcon = (type: string) => {
        switch(type) {
            case 'weapon': return '⚔️';
            case 'armor': return '🛡️';
            case 'consumable': return '🧪';
            case 'special': return '✨';
            default: return '📦';
        }
    };

    const handleItemClick = (item: InventoryItem) => {
        // Tutaj można dodać logikę użycia przedmiotu
        console.log(`Clicked on: ${item.name}`);
    };

    return (
        <div className="panel">
            <h2 className="section-title">Inventory</h2>
            {inventory.length === 0 ? (
                <div className="empty-inventory">
                    <p className="text-secondary">Your inventory is empty.</p>
                </div>
            ) : (
                <div className="inventory-grid">
                    {inventory.map((item) => (
                        <div
                            key={item.id}
                            className={`inventory-item ${getItemColor(item.type)}`}
                            onClick={() => handleItemClick(item)}
                            title={`${item.name}${item.description ? `: ${item.description}` : ''}${item.quantity ? ` (x${item.quantity})` : ''}`}
                        >
                            <div className="inventory-item-icon">
                                {getItemIcon(item.type)}
                            </div>
                            <div className="inventory-item-name">
                                {item.name}
                            </div>
                            {item.quantity && item.quantity > 1 && (
                                <div className="inventory-item-quantity">
                                    x{item.quantity}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};