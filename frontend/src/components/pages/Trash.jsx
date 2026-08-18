import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "./Sidebar.jsx";
import "./Trash.css";

export default function Trash() {

    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTrash = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/documents/trash");

            setDocuments(
                response.data?.data || []
            );

        } catch (error) {

            console.error(
                "Erreur corbeille :",
                error
            );

            setError(
                error.response?.data?.message ||
                "Impossible de charger la corbeille."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTrash();
    }, []);


    const restoreDocument = async (id) => {

        if (
            !window.confirm(
                "Voulez-vous restaurer ce document ?"
            )
        ) {
            return;
        }

        try {

            await api.put(
                `/documents/${id}/restore`
            );

            setDocuments(
                previous =>
                    previous.filter(
                        document =>
                            document.id !== id
                    )
            );

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Impossible de restaurer le document."
            );
        }
    };


    const deleteForever = async (id) => {

        if (
            !window.confirm(
                "Attention : ce document sera supprimé définitivement. Continuer ?"
            )
        ) {
            return;
        }

        try {

            await api.delete(
                `/documents/${id}/force`
            );

            setDocuments(
                previous =>
                    previous.filter(
                        document =>
                            document.id !== id
                    )
            );

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Impossible de supprimer définitivement le document."
            );
        }
    };


    const emptyTrash = async () => {

        if (documents.length === 0) {
            return;
        }

        if (
            !window.confirm(
                "Voulez-vous vraiment vider toute la corbeille ? Cette action est définitive."
            )
        ) {
            return;
        }

        try {

            await api.delete(
                "/documents/trash/empty"
            );

            setDocuments([]);

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Impossible de vider la corbeille."
            );
        }
    };


    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    const formatSize = (size) => {

        if (!size) {
            return "0 Ko";
        }

        if (size < 1024) {
            return `${size} octets`;
        }

        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} Ko`;
        }

        return `${(
            size /
            (1024 * 1024)
        ).toFixed(1)} Mo`;
    };


    return (
        <div className="trash-layout">

            <Sidebar />

            <main className="trash-main">

                <header className="trash-header">

                    <div className="trash-header-info">

                        <button
                            className="trash-back-button"
                            onClick={() =>
                                navigate("/documents")
                            }
                        >
                            ←
                        </button>

                        <div>
                            <h1>Corbeille</h1>

                            <p>
                                Documents supprimés
                            </p>
                        </div>

                    </div>

                    <button
                        className="trash-empty-button"
                        onClick={emptyTrash}
                        disabled={
                            documents.length === 0
                        }
                    >
                        🗑 Vider la corbeille
                    </button>

                </header>


                <section className="trash-content">

                    {error && (
                        <div className="trash-error">
                            {error}
                        </div>
                    )}


                    <div className="trash-info-card">

                        <div className="trash-info-icon">
                            🗑️
                        </div>

                        <div>
                            <strong>
                                {documents.length}
                            </strong>

                            <span>
                                document
                                {documents.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                dans la corbeille
                            </span>
                        </div>

                    </div>


                    {loading ? (

                        <div className="trash-message">
                            Chargement de la corbeille...
                        </div>

                    ) : documents.length === 0 ? (

                        <div className="trash-empty">

                            <div className="trash-empty-icon">
                                🗑️
                            </div>

                            <h2>
                                La corbeille est vide
                            </h2>

                            <p>
                                Les documents supprimés
                                apparaîtront ici.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/documents"
                                    )
                                }
                            >
                                Retour aux documents
                            </button>

                        </div>

                    ) : (

                        <div className="trash-table-wrapper">

                            <table className="trash-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Document
                                        </th>

                                        <th>
                                            Espace
                                        </th>

                                        <th>
                                            Taille
                                        </th>

                                        <th>
                                            Supprimé le
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {documents.map(
                                        document => (

                                            <tr
                                                key={
                                                    document.id
                                                }
                                            >

                                                <td>

                                                    <div className="trash-document">

                                                        <span className="trash-file-icon">
                                                            📄
                                                        </span>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    document.title
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    document.file_name
                                                                }
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>


                                                <td>

                                                    {document.space?.name ||
                                                        "Personnel"}

                                                </td>


                                                <td>

                                                    {formatSize(
                                                        document.file_size
                                                    )}

                                                </td>


                                                <td>

                                                    {formatDate(
                                                        document.deleted_at
                                                    )}

                                                </td>


                                                <td>

                                                    <div className="trash-actions">

                                                        <button
                                                            className="trash-restore-button"
                                                            onClick={() =>
                                                                restoreDocument(
                                                                    document.id
                                                                )
                                                            }
                                                        >
                                                            ♻ Restaurer
                                                        </button>

                                                        <button
                                                            className="trash-delete-button"
                                                            onClick={() =>
                                                                deleteForever(
                                                                    document.id
                                                                )
                                                            }
                                                        >
                                                            ❌ Supprimer
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}