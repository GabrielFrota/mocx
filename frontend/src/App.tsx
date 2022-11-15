import React from 'react';
import ListPersonPage from "./ListPersonPage";
import AddEditPersonPage from "./AddEditPersonPage";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/person/list" element={<ListPersonPage />} />
                <Route path="/person/new" element={<AddEditPersonPage />} />
                <Route path="/person/edit/:id" element={<AddEditPersonPage />} />
                <Route path="/" element={<Navigate to="/person/list" />} />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </Router>
    );
}

const PageNotFound = () => {
    return (
        <div>
            <h2>404 Page not found</h2>
        </div>
    );
}

export default App;
