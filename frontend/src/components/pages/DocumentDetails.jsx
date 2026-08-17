import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Sidebar from "./Sidebar.jsx";
import "./DocumentDetails.css";

export default function DocumentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDocument();
    }, [id]);

    const loadDocument = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/documents/${id}`);

            const data = response.data;

            setDocument(data?.data || data);
        } catch (err) {
            console.error("Erreur document :", err);

            setError(
                err.response?.data?.message ||
                "Impossible de récupérer les informations du document."
            );
        } finally {
            setLoading(false);
        }
    };

    const getFileName = () => {
        return (
            document?.file_name ||
            document?.filename ||
            document?.file?.name ||
            "Fichier"
        );
    };

    const getFileType = () => {
        const type = (
            document?.file_type ||
            document?.mime_type ||
            ""
        ).toLowerCase();

        const name = getFileName().toLowerCase();

        if (
            type.includes("pdf") ||
            name.endsWith(".pdf")
        ) {
            return "PDF";
        }

        if (
            type.includes("word") ||
            type.includes("document") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            return "WORD";
        }

        if (
            type.includes("excel") ||
            type.includes("sheet") ||
            name.endsWith(".xls") ||
            name.endsWith(".xlsx")
        ) {
            return "EXCEL";
        }

        if (
            type.includes("powerpoint") ||
            type.includes("presentation") ||
            name.endsWith(".ppt") ||
            name.endsWith(".pptx")
        ) {
            return "POWERPOINT";
        }

        if (
            type.includes("image") ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".png") ||
            name.endsWith(".webp")
        ) {
            return "IMAGE";
        }

        if (
            type.includes("zip") ||
            name.endsWith(".zip") ||
            name.endsWith(".rar")
        ) {
            return "ARCHIVE";
        }

        return "FICHIER";
    };

    const getFileIcon = () => {
        const type = getFileType();

        switch (type) {
            case "PDF":
                return "📕";

            case "WORD":
                return "📘";

            case "EXCEL":
                return "📗";

            case "POWERPOINT":
                return "📙";

            case "IMAGE":
                return "🖼️";

            case "ARCHIVE":
                return "🗜️";

            default:
                return "📄";
        }
    };

    const formatSize = (size) => {
        if (!size) {
            return "-";
        }

        const bytes = Number(size);

        if (Number.isNaN(bytes)) {
            return size;
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        if (bytes < 1024 * 1024 * 1024) {
            return `${(
                bytes /
                (1024 * 1024)
            ).toFixed(1)} MB`;
        }

        return `${(
            bytes /
            (1024 * 1024 * 1024)
        ).toFixed(1)} GB`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return "-";
        }

        return value.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const getAuthor = () => {
        if (!document?.user) {
            return "Inconnu";
        }

        return (
            `${document.user.first_name || ""} ${
                document.user.last_name || ""
            }`.trim() ||
            document.user.name ||
            document.user.email ||
            "Inconnu"
        );
    };

    const getFileUrl = () => {
        return (
            document?.file_url ||
            document?.url ||
            document?.file_path ||
            document?.path ||
            null
        );
    };

    const handleOpen = () => {
        const url = getFileUrl();

        if (!url) {
            setError(
                "Le fichier n'est pas disponible."
            );
            return;
        }

        let finalUrl = url;

        if (
            !url.startsWith("http://") &&
            !url.startsWith("https://")
        ) {
            finalUrl = `http://127.0.0.1:8000/storage/${url
                .replace(/^storage\//, "")
                .replace(/^\/+/, "")}`;
        }

        window.open(
            finalUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const handleDownload = async () => {
        try {
            setError("");

            const response = await api.get(
                `/documents/${id}/download`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([
                response.data,
            ]);

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download = getFileName();

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(
                "Erreur téléchargement :",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de télécharger le fichier."
            );
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Voulez-vous vraiment supprimer ce document ?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(
                `/documents/${id}`
            );

            navigate("/documents");
        } catch (err) {
            console.error(
                "Erreur suppression :",
                err
            );

            setError(
                err.response?.data?.message ||
                "Impossible de supprimer le document."
            );
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />

                <main className="document-details-main">
                    <div className="document-details-loading">
                        Chargement du document...
                    </div>
                </main>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="dashboard-layout">
                <Sidebar />

                <main className="document-details-main">

                    <button
                        className="document-back-button"
                        onClick={() =>
                            navigate("/documents")
                        }
                    >
                        ← Retour aux documents
                    </button>

                    <div className="document-details-error">
                        {error ||
                            "Document introuvable."}
                    </div>

                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="document-details-main">

                <header className="document-details-header">

                    <div>

                        <button
                            className="document-back-button"
                            onClick={() =>
                                navigate("/documents")
                            }
                        >
                            ← Retour aux documents
                        </button>

                        <h1>
                            Documents
                        </h1>

                    </div>

                    <button
                        className="document-delete-top-button"
                        onClick={handleDelete}
                    >
                        🗑 Supprimer
                    </button>

                </header>

                {error && (
                    <div className="document-details-error">
                        {error}
                    </div>
                )}

                <section className="document-preview-card">

                    <div className="document-preview-icon">
                        {getFileIcon()}
                    </div>

                    <div className="document-preview-content">

                        <div className="document-preview-type">
                            {getFileType()}
                        </div>

                        <h2>
                            {document.title ||
                                "Document sans titre"}
                        </h2>

                        <p>
                            {document.description ||
                                "Aucune description disponible pour ce document."}
                        </p>

                    </div>

                </section>

                <section className="document-action-card">

                    <div className="document-card-heading">

                        <span className="document-card-heading-icon">
                            ⚙️
                        </span>

                        <div>
                            <h2>
                                ACTIONS
                            </h2>

                            <p>
                                Gestion du document
                            </p>
                        </div>

                    </div>

                    <p className="document-action-description">
                        Ouvrez le fichier ou
                        téléchargez-le sur votre
                        ordinateur.
                    </p>

                    <div className="document-action-buttons">

                        <button
                            type="button"
                            className="document-open-button"
                            onClick={handleOpen}
                        >
                            ↗ Ouvrir
                        </button>

                        <button
                            type="button"
                            className="document-download-button"
                            onClick={handleDownload}
                        >
                            ↓ Télécharger
                        </button>

                    </div>

                </section>

                <section className="document-info-card">

                    <div className="document-card-heading">

                        <span className="document-card-heading-icon">
                            ℹ️
                        </span>

                        <div>
                            <h2>
                                INFORMATIONS
                            </h2>

                            <p>
                                Informations détaillées
                            </p>
                        </div>

                    </div>

                    <div className="document-info-grid">

                        <div className="document-info-item">

                            <span>
                                Nom fichier
                            </span>

                            <strong>
                                {getFileName()}
                            </strong>

                        </div>

                        <div className="document-info-item">

                            <span>
                                Type
                            </span>

                            <strong>
                                {getFileType()}
                            </strong>

                        </div>

                        <div className="document-info-item">

                            <span>
                                Taille
                            </span>

                            <strong>
                                {formatSize(
                                    document.file_size ||
                                    document.size
                                )}
                            </strong>

                        </div>

                        <div className="document-info-item">

                            <span>
                                Auteur
                            </span>

                            <strong>
                                {getAuthor()}
                            </strong>

                        </div>

                        <div className="document-info-item">

                            <span>
                                Espace
                            </span>

                            <strong>
                                {document.space?.name ||
                                    document.space_name ||
                                    "Aucun espace"}
                            </strong>

                        </div>

                        <div className="document-info-item">

                            <span>
                                Dossier
                            </span>

                            <strong>
                                {document.folder?.name ||
                                    document.folder_name ||
                                    "Aucun dossier"}
                            </strong>

                        </div>

                        <div className="document-info-item">

                            <span>
                                Créé le
                            </span>

                            <strong>
                                {formatDate(
                                    document.created_at
                                )}
                            </strong>

                        </div>

                        {document.updated_at && (
                            <div className="document-info-item">

                                <span>
                                    Modifié le
                                </span>

                                <strong>
                                    {formatDate(
                                        document.updated_at
                                    )}
                                </strong>

                            </div>
                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}