
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "./Sidebar";
import "./Documents.css";

function Documents() {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [folderId, setFolderId] = useState("");
    const [file, setFile] = useState(null);

    const [uploading, setUploading] = useState(false);


    // ==========================================
    // CHARGEMENT INITIAL
    // ==========================================

    useEffect(() => {
        loadDocuments();
        loadFolders();
    }, []);


    // ==========================================
    // RÉCUPÉRER LES DOCUMENTS
    // ==========================================

    const loadDocuments = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await api.get("/documents", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(
                "Documents Laravel :",
                response.data
            );

            setDocuments(response.data);

        } catch (error) {
            console.error(
                "Erreur documents :",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Impossible de récupérer les documents."
            );

        } finally {
            setLoading(false);
        }
    };


    // ==========================================
    // RÉCUPÉRER LES DOSSIERS
    // ==========================================

    const loadFolders = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await api.get("/folders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log(
                "Dossiers Laravel :",
                response.data
            );

            setFolders(response.data);

        } catch (error) {
            console.error(
                "Erreur dossiers :",
                error
            );
        }
    };


    // ==========================================
    // OUVRIR MODAL
    // ==========================================

    const openCreateModal = () => {
        setTitle("");
        setDescription("");
        setFolderId("");
        setFile(null);
        setError("");

        setShowModal(true);
    };


    // ==========================================
    // FERMER MODAL
    // ==========================================

    const closeModal = () => {
        if (uploading) {
            return;
        }

        setShowModal(false);

        setTitle("");
        setDescription("");
        setFolderId("");
        setFile(null);
        setError("");
    };


    // ==========================================
    // SÉLECTION DU FICHIER
    // ==========================================

    const handleFileChange = (event) => {
        const selectedFile =
            event.target.files[0];

        console.log(
            "Fichier sélectionné :",
            selectedFile
        );

        if (!selectedFile) {
            setFile(null);
            return;
        }

        // Maximum Laravel : 10 MB
        const maxSize =
            10 * 1024 * 1024;

        if (selectedFile.size > maxSize) {
            setFile(null);

            setError(
                "Le fichier ne doit pas dépasser 10 MB."
            );

            event.target.value = "";

            return;
        }

        setError("");
        setFile(selectedFile);
    };


    // ==========================================
    // ENVOYER LE DOCUMENT
    // ==========================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");


        // Vérifier le titre

        if (!title.trim()) {
            setError(
                "Le titre est obligatoire."
            );

            return;
        }


        // Vérifier le fichier

        if (!file) {
            setError(
                "Veuillez sélectionner un fichier."
            );

            return;
        }


        try {
            setUploading(true);

            const token =
                localStorage.getItem("token");


            if (!token) {
                navigate("/login");
                return;
            }


            // ==================================
            // FORMDATA
            // ==================================

            const formData =
                new FormData();


            formData.append(
                "title",
                title
            );


            formData.append(
                "description",
                description
            );


            formData.append(
                "file",
                file
            );


            if (folderId) {
                formData.append(
                    "folder_id",
                    folderId
                );
            }


            // ==================================
            // DEBUG
            // ==================================

            console.log(
                "===== FORM DATA ====="
            );


            for (
                const [key, value]
                of formData.entries()
            ) {
                console.log(
                    key,
                    value
                );
            }


            console.log(
                "====================="
            );


            // ==================================
            // POST LARAVEL
            // ==================================

            const response =
                await api.post(
                    "/documents",
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            console.log(
                "Document créé :",
                response.data
            );


            // ==================================
            // AJOUTER À LA LISTE
            // ==================================

            setDocuments(
                (currentDocuments) => [
                    ...currentDocuments,
                    response.data,
                ]
            );


            // ==================================
            // RESET
            // ==================================

            setTitle("");
            setDescription("");
            setFolderId("");
            setFile(null);

            setShowModal(false);


        } catch (error) {

            console.error(
                "Erreur upload :",
                error
            );


            console.error(
                "Réponse Laravel :",
                error.response?.data
            );


            // Session expirée

            if (
                error.response?.status === 401
            ) {
                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                navigate("/login");

                return;
            }


            // Erreurs validation Laravel

            if (
                error.response?.data?.errors
            ) {

                const errors =
                    error.response.data.errors;


                const messages =
                    Object.values(errors)
                        .flat()
                        .join(" ");


                setError(
                    messages
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Erreur lors de l'envoi du document."
                );
            }

        } finally {
            setUploading(false);
        }
    };


    // ==========================================
    // SUPPRIMER DOCUMENT
    // ==========================================

    const handleDelete = async (
        documentId
    ) => {

        const confirmation =
            window.confirm(
                "Voulez-vous vraiment supprimer ce document ?"
            );


        if (!confirmation) {
            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            await api.delete(
                `/documents/${documentId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            setDocuments(
                (currentDocuments) =>
                    currentDocuments.filter(
                        (document) =>
                            document.id !==
                            documentId
                    )
            );


        } catch (error) {

            console.error(
                "Erreur suppression :",
                error
            );


            setError(
                error.response?.data?.message ||
                "Impossible de supprimer le document."
            );
        }
    };


    // ==========================================
    // AFFICHAGE
    // ==========================================

    return (

        <div className="dashboard-layout">


            {/* SIDEBAR */}

            <Sidebar />


            {/* MAIN */}

            <main className="documents-main">


                {/* ==================================
                    HEADER
                ================================== */}

                <header className="documents-header">

                    <div>

                        <h1>
                            Documents
                        </h1>

                        <p>
                            Gestion des documents
                        </p>

                    </div>


                    <button
                        type="button"
                        className="add-document-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        + Nouveau document
                    </button>

                </header>


                {/* ==================================
                    CONTENT
                ================================== */}

                <section
                    className="documents-content"
                >


                    {/* LOADING */}

                    {loading && (

                        <p
                            className="documents-message"
                        >
                            Chargement des documents...
                        </p>

                    )}


                    {/* ERROR */}

                    {error &&
                        !showModal && (

                            <p
                                className="documents-error"
                            >
                                {error}
                            </p>

                        )
                    }


                    {/* EMPTY */}

                    {!loading &&
                        !error &&
                        documents.length === 0 && (

                            <div
                                className="empty-documents"
                            >

                                <div
                                    className="empty-document-icon"
                                >
                                    📄
                                </div>


                                <h2>
                                    Aucun document
                                </h2>


                                <p>
                                    Vous n'avez pas encore de document.
                                </p>

                            </div>

                        )
                    }


                    {/* DOCUMENTS */}

                    {!loading &&
                        documents.length > 0 && (

                            <div
                                className="documents-table-wrapper"
                            >

                                <table
                                    className="documents-table"
                                >

                                    <thead>

                                        <tr>

                                            <th>
                                                Document
                                            </th>

                                            <th>
                                                Type
                                            </th>

                                            <th>
                                                Taille
                                            </th>

                                            <th>
                                                Dossier
                                            </th>

                                            <th>
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {documents.map(
                                            (document) => (

                                                <tr
                                                    key={
                                                        document.id
                                                    }
                                                >


                                                    <td>

                                                        <div
                                                            className="document-name"
                                                        >

                                                            <span>
                                                                📄
                                                            </span>


                                                            <strong>
                                                                {
                                                                    document.title
                                                                }
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        {
                                                            document.file_type ||
                                                            "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            document.file_size
                                                                ? `${(
                                                                    document.file_size /
                                                                    1024
                                                                ).toFixed(1)} KB`
                                                                : "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            document.folder?.name ||
                                                            "-"
                                                        }

                                                    </td>


                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="document-action-button"
                                                        >
                                                            Voir
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="document-delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    document.id
                                                                )
                                                            }
                                                        >
                                                            Supprimer
                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )
                    }

                </section>


                {/* ==================================
                    MODAL
                ================================== */}

                {showModal && (

                    <div
                        className="modal-overlay"
                        onClick={
                            closeModal
                        }
                    >


                        <div
                            className="document-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >


                            {/* HEADER */}

                            <div
                                className="modal-header"
                            >

                                <h2>
                                    Nouveau document
                                </h2>


                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        uploading
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >


                                {/* TITRE */}

                                <div
                                    className="form-group"
                                >

                                    <label
                                        htmlFor="document-title"
                                    >
                                        Titre
                                    </label>


                                    <input
                                        id="document-title"
                                        type="text"
                                        value={title}
                                        onChange={(
                                            event
                                        ) =>
                                            setTitle(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Ex: Contrat de travail"
                                        required
                                    />

                                </div>


                                {/* DESCRIPTION */}

                                <div
                                    className="form-group"
                                >

                                    <label
                                        htmlFor="document-description"
                                    >
                                        Description
                                    </label>


                                    <textarea
                                        id="document-description"
                                        value={
                                            description
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setDescription(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Description du document"
                                        rows="4"
                                    />

                                </div>


                                {/* DOSSIER */}

                                <div
                                    className="form-group"
                                >

                                    <label
                                        htmlFor="document-folder"
                                    >
                                        Dossier
                                    </label>


                                    <select
                                        id="document-folder"
                                        value={
                                            folderId
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setFolderId(
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Aucun dossier
                                        </option>


                                        {folders.map(
                                            (folder) => (

                                                <option
                                                    key={
                                                        folder.id
                                                    }
                                                    value={
                                                        folder.id
                                                    }
                                                >
                                                    {
                                                        folder.name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* FICHIER */}

                                <div
                                    className="form-group"
                                >

                                    <label
                                        htmlFor="document-file"
                                    >
                                        Fichier
                                    </label>


                                    <input
                                        id="document-file"
                                        type="file"
                                        onChange={
                                            handleFileChange
                                        }
                                        required
                                    />


                                    {file && (

                                        <small>

                                            Fichier sélectionné :
                                            {" "}

                                            <strong>
                                                {
                                                    file.name
                                                }
                                            </strong>

                                        </small>

                                    )}


                                    <small>
                                        Taille maximale : 10 MB
                                    </small>

                                </div>


                                {/* ERROR */}

                                {error && (

                                    <p
                                        className="documents-error"
                                    >
                                        {error}
                                    </p>

                                )}


                                {/* BUTTONS */}

                                <div
                                    className="modal-actions"
                                >

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            uploading
                                        }
                                    >
                                        Annuler
                                    </button>


                                    <button
                                        type="submit"
                                        className="create-button"
                                        disabled={
                                            uploading
                                        }
                                    >

                                        {uploading
                                            ? "Upload en cours..."
                                            : "Ajouter le document"
                                        }

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}


export default Documents;

