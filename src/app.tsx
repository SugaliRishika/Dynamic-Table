import React from 'react';
import TableComponent from './components/TableComponent';
import './assets/app.css'; 

function App() {
    return (
        <div className="app-container">
            <h1 className="app-heading">API - FETCHING</h1>
            <TableComponent />
        </div>
    );
}

export default App;
