import { Navigate } from "react-router-dom";

import AdminDashboard from "./AdminDashboard.jsx";
import ResponsableDashboard from "./ResponsableDashboard.jsx";
import UserDashboard from "./UserDashboard.jsx";

export default function Dashboard() {

    const userData =
        localStorage.getItem("user");

    if (!userData) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {

        console.error(
            "Erreur utilisateur :",
            error
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    const roleId =
        Number(user.role_id);


    /* ADMIN */

    if (roleId === 1) {
        return <AdminDashboard />;
    }


    /* RESPONSABLE */

    if (roleId === 2) {
        return <ResponsableDashboard />;
    }


    /* UTILISATEUR */

    if (roleId === 3) {
        return <UserDashboard />;
    }


    return (
        <div className="dashboard-error">

            <h2>
                Rôle non reconnu
            </h2>

            <p>
                Role ID :
                {" "}
                {user.role_id}
            </p>

        </div>
    );
}