
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
    const [actionLoading, setActionLoading] = useState(null);

    // =====================================================
    // CHARGER LA CORBEILLE
    // =====================================================

    const fetchTrash = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/documents/trash");

            const data = response.data;

            if (Array.isArray(data)) {
                setDocuments(data);
            } else if (Array.isArray(data?.data)) {
                setDocuments(data.data);
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error(
                "Erreur chargement corbeille :",
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

    // =====================================================
    // INITIALISATION
    // =====================================================

    useEffect(() => {
        fetchTrash();
    }, []);

    // =====================================================
    // RESTAURER UN DOCUMENT
    // =====================================================

    const restoreDocument = async (id) => {
        if (!id) {
            return;
        }

        const confirmed = window.confirm(
            "Voulez-vous vraiment restaurer ce document ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(`restore-${id}`);
            setError("");

            await api.put(
                `/documents/${id}/restore`
            );

            setDocuments((previous) =>
                previous.filter(
                    (document) =>
                        document.id !== id
                )
            );
        } catch (error) {
            console.error(
                "Erreur restauration :",
                error
            );

            setError(
                error.response?.data?.message ||
                "Impossible de restaurer le document."
            );
        } finally {
            setActionLoading(null);
        }
    };

    // =====================================================
    // SUPPRESSION DEFINITIVE
    // =====================================================

    const deleteForever = async (id) => {
        if (!id) {
            return;
        }

        const confirmed = window.confirm(
            "Attention : ce document sera supprimé définitivement. Cette action est irréversible.\n\nContinuer ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(`delete-${id}`);
            setError("");

            await api.delete(
                `/documents/${id}/force`
            );

            setDocuments((previous) =>
                previous.filter(
                    (document) =>
                        document.id !== id
                )
            );
        } catch (error) {
            console.error(
                "Erreur suppression définitive :",
                error
            );

            setError(
                error.response?.data?.message ||
                "Impossible de supprimer définitivement le document."
            );
        } finally {
            setActionLoading(null);
        }
    };

    // =====================================================
    // VIDER LA CORBEILLE
    // =====================================================

    const emptyTrash = async () => {
        if (documents.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            `Vous avez ${documents.length} document${
                documents.length > 1 ? "s" : ""
            } dans la corbeille.\n\nTous les documents seront supprimés définitivement. Cette action est irréversible.\n\nVoulez-vous continuer ?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading("empty");
            setError("");

            await api.delete(
                "/documents/trash/empty"
            );

            setDocuments([]);
        } catch (error) {
            console.error(
                "Erreur vidage corbeille :",
                error
            );

            setError(
                error.response?.data?.message ||
                "Impossible de vider la corbeille."
            );
        } finally {
            setActionLoading(null);
        }
    };

    // =====================================================
    // RETOUR AUX DOCUMENTS
    // =====================================================

    const goToDocuments = () => {
        navigate("/documents");
    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "-";
        }

        return value.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // =====================================================
    // FORMAT TAILLE
    // =====================================================

    const formatSize = (size) => {
        if (
            size === null ||
            size === undefined ||
            size === ""
        ) {
            return "0 Ko";
        }

        const bytes = Number(size);

        if (Number.isNaN(bytes)) {
            return "-";
        }

        if (bytes < 1024) {
            return `${bytes} octets`;
        }

        if (bytes < 1024 * 1024) {
            return `${(
                bytes / 1024
            ).toFixed(1)} Ko`;
        }

        if (bytes < 1024 * 1024 * 1024) {
            return `${(
                bytes /
                (1024 * 1024)
            ).toFixed(1)} Mo`;
        }

        return `${(
            bytes /
            (1024 * 1024 * 1024)
        ).toFixed(1)} Go`;
    };

    // =====================================================
    // TYPE DE FICHIER
    // =====================================================

    const getFileType = (document) => {
        const type = (
            document.file_type ||
            document.mime_type ||
            ""
        ).toLowerCase();

        const name = (
            document.file_name ||
            document.filename ||
            ""
        ).toLowerCase();

        if (
            type.includes("pdf") ||
            name.endsWith(".pdf")
        ) {
            return {
                key: "pdf",
                label: "PDF",
            };
        }

        if (
            type.includes("word") ||
            type.includes("document") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            return {
                key: "word",
                label: "DOC",
            };
        }

        if (
            type.includes("excel") ||
            type.includes("sheet") ||
            name.endsWith(".xls") ||
            name.endsWith(".xlsx")
        ) {
            return {
                key: "excel",
                label: "XLS",
            };
        }

        if (
            type.includes("image") ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".png") ||
            name.endsWith(".webp")
        ) {
            return {
                key: "image",
                label: "IMG",
            };
        }

        if (
            type.includes("zip") ||
            name.endsWith(".zip") ||
            name.endsWith(".rar")
        ) {
            return {
                key: "zip",
                label: "ZIP",
            };
        }

        return {
            key: "file",
            label: "FILE",
        };
    };

    // =====================================================
    // NOM AUTEUR
    // =====================================================

    const getAuthorName = (document) => {
        if (!document?.user) {
            return "Inconnu";
        }

        const user = document.user;

        return (
            `${user.first_name || ""} ${
                user.last_name || ""
            }`.trim() ||
            user.name ||
            user.email ||
            "Inconnu"
        );
    };

    // =====================================================
    // INITIALES
    // =====================================================

    const getInitials = (name) => {
        if (
            !name ||
            name === "Inconnu"
        ) {
            return "?";
        }

        const parts = name
            .trim()
            .split(/\s+/);

        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`
                .toUpperCase();
        }

        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="trash-layout">

            <Sidebar />

            <main className="trash-main">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="trash-header">

                    <div className="trash-header-info">

                        <button
                            type="button"
                            className="trash-back-button"
                            onClick={goToDocuments}
                            aria-label="Retour aux documents"
                        >
                            ←
                        </button>

                        <div>
                            <h1>
                                Corbeille
                            </h1>

                            <p>
                                Documents supprimés
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="trash-empty-button"
                        onClick={emptyTrash}
                        disabled={
                            documents.length === 0 ||
                            actionLoading !== null
                        }
                    >
                        {actionLoading === "empty"
                            ? "Vidage..."
                            : "🗑 Vider la corbeille"}
                    </button>

                </header>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <section className="trash-content">

                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div className="trash-error">
                            <span>
                                {error}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                                aria-label="Fermer"
                            >
                                ×
                            </button>
                        </div>
                    )}


                    {/* =================================================
                        INFO CARD
                    ================================================= */}

                    {!loading && (
                        <div className="trash-info-card">

                            <div className="trash-info-icon">
                                🗑️
                            </div>

                            <div className="trash-info-text">

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
                    )}


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading && (
                        <div className="trash-message">

                            <div className="trash-spinner">
                            </div>

                            <span>
                                Chargement de la corbeille...
                            </span>

                        </div>
                    )}


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!loading &&
                        documents.length === 0 && (

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
                                    type="button"
                                    onClick={
                                        goToDocuments
                                    }
                                >
                                    ← Retour aux documents
                                </button>

                            </div>
                        )}


                    {/* =================================================
                        TABLE
                    ================================================= */}

                    {!loading &&
                        documents.length > 0 && (

                            <div className="trash-table-wrapper">

                                <table className="trash-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                DOCUMENT
                                            </th>

                                            <th>
                                                TYPE
                                            </th>

                                            <th>
                                                ESPACE
                                            </th>

                                            <th>
                                                AUTEUR
                                            </th>

                                            <th>
                                                TAILLE
                                            </th>

                                            <th>
                                                SUPPRIMÉ LE
                                            </th>

                                            <th>
                                                ACTIONS
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {documents.map(
                                            (document) => {

                                                const meta =
                                                    getFileType(
                                                        document
                                                    );

                                                const author =
                                                    getAuthorName(
                                                        document
                                                    );

                                                const restoring =
                                                    actionLoading ===
                                                    `restore-${document.id}`;

                                                const deleting =
                                                    actionLoading ===
                                                    `delete-${document.id}`;

                                                const disabled =
                                                    actionLoading !==
                                                    null;

                                                return (
                                                    <tr
                                                        key={
                                                            document.id
                                                        }
                                                    >

                                                        {/* DOCUMENT */}

                                                        <td>

                                                            <div className="trash-document">

                                                                <span
                                                                    className={`trash-file-icon ${meta.key}`}
                                                                >
                                                                    {
                                                                        meta.label
                                                                    }
                                                                </span>

                                                                <div className="trash-document-info">

                                                                    <strong>
                                                                        {
                                                                            document.title ||
                                                                            "Sans titre"
                                                                        }
                                                                    </strong>

                                                                    <small>
                                                                        {
                                                                            document.file_name ||
                                                                            document.filename ||
                                                                            "Fichier"
                                                                        }
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* TYPE */}

                                                        <td>

                                                            <span
                                                                className={`trash-type ${meta.key}`}
                                                            >
                                                                {
                                                                    meta.label
                                                                }
                                                            </span>

                                                        </td>


                                                        {/* ESPACE */}

                                                        <td>

                                                            {
                                                                document
                                                                    .space
                                                                    ?.name ||
                                                                document.space_name ||
                                                                "Personnel"
                                                            }

                                                        </td>


                                                        {/* AUTEUR */}

                                                        <td>

                                                            <div className="trash-author">

                                                                <span className="trash-author-avatar">
                                                                    {getInitials(
                                                                        author
                                                                    )}
                                                                </span>

                                                                <span>
                                                                    {
                                                                        author
                                                                    }
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* TAILLE */}

                                                        <td>

                                                            {formatSize(
                                                                document.file_size ||
                                                                document.size
                                                            )}

                                                        </td>


                                                        {/* DATE */}

                                                        <td>

                                                            {formatDate(
                                                                document.deleted_at
                                                            )}

                                                        </td>


                                                        {/* ACTIONS */}

                                                        <td>

                                                            <div className="trash-actions">

                                                                <button
                                                                    type="button"
                                                                    className="trash-restore-button"
                                                                    onClick={() =>
                                                                        restoreDocument(
                                                                            document.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        disabled
                                                                    }
                                                                >
                                                                    {restoring
                                                                        ? "Restauration..."
                                                                        : "♻ Restaurer"}
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    className="trash-delete-button"
                                                                    onClick={() =>
                                                                        deleteForever(
                                                                            document.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        disabled
                                                                    }
                                                                >
                                                                    {deleting
                                                                        ? "Suppression..."
                                                                        : "✕ Supprimer"}
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                );
                                            }
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

