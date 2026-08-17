import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/pages/Sidebar.jsx";

import Login from "./components/pages/Login.jsx";
import Dashboard from "./components/pages/Dashboard.jsx";

import Documents from "./components/pages/Documents.jsx";
import DocumentDetails from "./components/pages/DocumentDetails.jsx";

import Folders from "./components/pages/Folders.jsx";

import Spaces from "./components/pages/Spaces.jsx";
import SpaceDetails from "./components/pages/SpaceDetails.jsx";

import Users from "./components/pages/Users.jsx";

import Announcements from "./components/pages/Announcements.jsx";
import Notifications from "./components/pages/Notifications.jsx";

import Settings from "./components/pages/Settings.jsx";

import "./App.css";

export default function App() {
    return (
        <Routes>

            {/* =========================================
                LOGIN
                Pas de Sidebar
            ========================================= */}

            <Route
                path="/login"
                element={<Login />}
            />


            {/* =========================================
                DASHBOARD
            ========================================= */}

            <Route
                path="/dashboard"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <Dashboard />
                        </div>
                    </>
                }
            />


            {/* =========================================
                DOCUMENTS
            ========================================= */}

            <Route
                path="/documents"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <Documents />
                        </div>
                    </>
                }
            />


            {/* =========================================
                DOCUMENT DETAILS
                Exemple : /documents/3
            ========================================= */}

            <Route
                path="/documents/:id"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <DocumentDetails />
                        </div>
                    </>
                }
            />


            {/* =========================================
                SETTINGS
                Exemple : /settings
            ========================================= */}

            <Route
                path="/settings"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <Settings />
                        </div>
                    </>
                }
            />


            {/* =========================================
                FOLDERS
            ========================================= */}

            <Route
                path="/folders"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <Folders />
                        </div>
                    </>
                }
            />


            {/* =========================================
                SPACES
            ========================================= */}

            <Route
                path="/spaces"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <Spaces />
                        </div>
                    </>
                }
            />


            {/* =========================================
                SPACE DETAILS
                Exemple : /spaces/3
            ========================================= */}

            <Route
                path="/spaces/:id"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <SpaceDetails />
                        </div>
                    </>
                }
            />


            {/* =========================================
                USERS
            ========================================= */}

            <Route
                path="/users"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <Users />
                        </div>
                    </>
                }
            />


            {/* =========================================
                ANNOUNCEMENTS
            ========================================= */}

            <Route
                path="/announcements"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <Announcements />
                        </div>
                    </>
                }
            />


            {/* =========================================
                NOTIFICATIONS
            ========================================= */}

            <Route
                path="/notifications"
                element={
                    <>
                        <Sidebar />

                        <div className="app-page">
                            <Notifications />
                        </div>
                    </>
                }
            />


            {/* =========================================
                DEFAULT
            ========================================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />


            {/* =========================================
                404
            ========================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>
    );
}