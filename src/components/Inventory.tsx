// @ts-ignore
import React from "react";
import {InventoryItem} from "../types/gameTypes";
import {Panel, SectionTitle} from "../styles/GlobalStyles";

interface InventoryProps {
    inventory: InventoryItem[];
}

export const Inventory: React.FC<InventoryProps> = ({inventory}) =>{
    return (
        <Panel>
            <SectionTitle>Inventory</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px'}}>
                {inventory.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            background: '#444',
                            padding: '15px 10px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: '1px solid #555',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e)=>{
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e)=> {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {item.name}
                    </div>
                ))}
            </div>
        </Panel>
    );
};