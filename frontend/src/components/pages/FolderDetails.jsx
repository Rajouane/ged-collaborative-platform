import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./FolderDetails.css";

export default function FolderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [folder, setFolder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        file: null,
    });

    useEffect(() => {
        loadFolder();
    }, [id]);

    const loadFolder = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/folders/${id}`);

            setFolder(response.data?.data || response.data);
        } catch (err) {
            console.error(err);
            setError("Impossible de charger le dossier.");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData({
            title: "",
            description: "",
            file: null,
        });

        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleCreateDocument = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("Veuillez saisir le titre du document.");
            return;
        }

        if (!formData.file) {
            alert("Veuillez sélectionner un fichier.");
            return;
        }

        try {
            setCreating(true);

            const data = new FormData();

            data.append("title", formData.title.trim());
            data.append("description", formData.description || "");
            data.append("folder_id", id);

            // Le dossier appartient déjà à un espace
            if (folder?.space_id) {
                data.append("space_id", folder.space_id);
            }

            data.append("file", formData.file);

            await api.post("/documents", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowModal(false);

            setFormData({
                title: "",
                description: "",
                file: null,
            });

            await loadFolder();
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Erreur lors de la création du document."
            );
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce document ?")) {
            return;
        }

        try {
            await api.delete(`/documents/${documentId}`);
            await loadFolder();
        } catch (err) {
            console.error(err);
            alert("Impossible de supprimer le document.");
        }
    };

    const handleOpenDocument = (documentId) => {
        navigate(`/documents/${documentId}`);
    };

    if (loading) {
        return (
            <div className="folder-details-page">
                <div className="folder-loading">
                    Chargement du dossier...
                </div>
            </div>
        );
    }

    if (error || !folder) {
        return (
            <div className="folder-details-page">
                <div className="folder-error">
                    {error || "Dossier introuvable."}
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/folders")}
                >
                    ← Retour aux dossiers
                </button>
            </div>
        );
    }

    const documents = folder.documents || [];

    return (
        <div className="folder-details-page">

            {/* HEADER */}
            <div className="folder-details-header">

                <button
                    className="back-button"
                    onClick={() => navigate("/folders")}
                >
                    ← Retour
                </button>

                <div className="folder-title-area">
                    <div className="folder-icon">📁</div>

                    <div>
                        <h1>{folder.name}</h1>

                        {folder.description && (
                            <p>{folder.description}</p>
                        )}
                    </div>
                </div>

                <button
                    className="add-document-button"
                    onClick={openCreateModal}
                >
                    + Ajouter un document
                </button>
            </div>

            {/* INFORMATIONS */}
            <div className="folder-info">

                <div className="info-card">
                    <span>Documents</span>
                    <strong>{documents.length}</strong>
                </div>

                <div className="info-card">
                    <span>Dossier</span>
                    <strong>{folder.name}</strong>
                </div>

                {folder.space && (
                    <div className="info-card">
                        <span>Espace</span>
                        <strong>{folder.space.name}</strong>
                    </div>
                )}

            </div>

            {/* DOCUMENTS */}
            <div className="documents-section">

                <div className="section-header">
                    <div>
                        <h2>Documents du dossier</h2>
                        <p>
                            Les documents enregistrés dans ce dossier.
                        </p>
                    </div>

                    <button
                        className="add-document-button small"
                        onClick={openCreateModal}
                    >
                        + Nouveau document
                    </button>
                </div>

                {documents.length === 0 ? (
                    <div className="empty-documents">
                        <div className="empty-icon">📄</div>

                        <h3>Aucun document</h3>

                        <p>
                            Ce dossier ne contient encore aucun document.
                        </p>

                        <button
                            className="add-document-button"
                            onClick={openCreateModal}
                        >
                            + Ajouter un document
                        </button>
                    </div>
                ) : (
                    <div className="documents-list">

                        {documents.map((document) => (
                            <div
                                className="document-card"
                                key={document.id}
                            >

                                <div className="document-icon">
                                    📄
                                </div>

                                <div className="document-info">

                                    <h3>{document.title}</h3>

                                    {document.description && (
                                        <p>
                                            {document.description}
                                        </p>
                                    )}

                                    <small>
                                        {document.created_at
                                            ? new Date(
                                                document.created_at
                                            ).toLocaleDateString("fr-FR")
                                            : ""}
                                    </small>

                                </div>

                                <div className="document-actions">

                                    <button
                                        onClick={() =>
                                            handleOpenDocument(document.id)
                                        }
                                    >
                                        Ouvrir
                                    </button>

                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            handleDeleteDocument(document.id)
                                        }
                                    >
                                        Supprimer
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal-overlay">

                    <div className="document-modal">

                        <div className="modal-header">

                            <div>
                                <h2>Nouveau document</h2>

                                <p>
                                    Ajouter un document dans :
                                    <strong> {folder.name}</strong>
                                </p>
                            </div>

                            <button
                                className="close-button"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleCreateDocument}>

                            <div className="form-group">

                                <label>Titre du document *</label>

                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Ex : Rapport mensuel"
                                />

                            </div>

                            <div className="form-group">

                                <label>Description</label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Description du document..."
                                    rows="4"
                                />

                            </div>

                            <div className="form-group">

                                <label>Fichier *</label>

                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleChange}
                                />

                                {formData.file && (
                                    <div className="selected-file">
                                        📎 {formData.file.name}
                                    </div>
                                )}

                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowModal(false)}
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={creating}
                                >
                                    {creating
                                        ? "Création..."
                                        : "Créer le document"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}