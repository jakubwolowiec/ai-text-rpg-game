import styled, {createGlobalStyle} from "styled-components";

let bord = '#444'

export const GlobalStyles = createGlobalStyle`
    * {
       margin: 0;
       padding: 0;
       box-sizing: border-box;
    }
      
    body {
       font-family: monospace;
       background: #1a1a1a;
       color: #e0e0e0;
       line-height: 1.6;
    }
    
    .app-container {
       max-width: 1200px;
       margin: 0 auto;
       padding: 20px;
       display: grid;
       grid-template-columns: 300px 1fr;
       gap: 20px;
       min-height: 100vh;
    }
`;

export const Panel = styled.div`
    background: #2d2d2d;
    border: 1px solid ${bord};
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
`;

export const SectionTitle = styled.h2`
    color: #ffd700;
    border-bottom: 2px solid ${bord};
    padding-bottom: 10px;
    margin-bottom: 15px;
    font-size: 1.2em;
`;