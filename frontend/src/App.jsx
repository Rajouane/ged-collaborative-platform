import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

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
import Trash from "./components/pages/Trash.jsx";

import "./App.css";

export default function App() {

    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(() => {
            return (
                localStorage.getItem(
                    "sidebarCollapsed"
                ) === "true"
            );
        });

    useEffect(() => {

        const handleSidebarChange = (event) => {
            setSidebarCollapsed(
                event.detail.collapsed
            );
        };

        window.addEventListener(
            "sidebar-change",
            handleSidebarChange
        );

        return () => {
            window.removeEventListener(
                "sidebar-change",
                handleSidebarChange
            );
        };

    }, []);

    const Page = ({ children }) => (
        <>
            <Sidebar />

            <main
                className={`app-page ${
                    sidebarCollapsed
                        ? "app-page-collapsed"
                        : ""
                }`}
            >
                {children}
            </main>
        </>
    );

    return (
        <Routes>

            {/* LOGIN */}

            <Route
                path="/login"
                element={<Login />}
            />

            {/* DASHBOARD */}

            <Route
                path="/dashboard"
                element={
                    <Page>
                        <Dashboard />
                    </Page>
                }
            />

            {/* DOCUMENTS */}

            <Route
                path="/documents"
                element={
                    <Page>
                        <Documents />
                    </Page>
                }
            />

            {/* DOCUMENT DETAILS */}

            <Route
                path="/documents/:id"
                element={
                    <Page>
                        <DocumentDetails />
                    </Page>
                }
            />

            {/* FOLDERS */}

            <Route
                path="/folders"
                element={
                    <Page>
                        <Folders />
                    </Page>
                }
            />

            {/* SPACES */}

            <Route
                path="/spaces"
                element={
                    <Page>
                        <Spaces />
                    </Page>
                }
            />

            {/* SPACE DETAILS */}

            <Route
                path="/spaces/:id"
                element={
                    <Page>
                        <SpaceDetails />
                    </Page>
                }
            />

            {/* USERS */}

            <Route
                path="/users"
                element={
                    <Page>
                        <Users />
                    </Page>
                }
            />

            {/* ANNOUNCEMENTS */}

            <Route
                path="/announcements"
                element={
                    <Page>
                        <Announcements />
                    </Page>
                }
            />

            {/* NOTIFICATIONS */}

            <Route
                path="/notifications"
                element={
                    <Page>
                        <Notifications />
                    </Page>
                }
            />

            {/* SETTINGS */}

            <Route
                path="/settings"
                element={
                    <Page>
                        <Settings />
                    </Page>
                }
            />

            {/* TRASH */}

            <Route
                path="/trash"
                element={
                    <Page>
                        <Trash />
                    </Page>
                }
            />

            {/* RACINE */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            {/* PAGE INEXISTANTE */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

        </Routes>
    );
}