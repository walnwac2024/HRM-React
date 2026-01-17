import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Trash2, FileText, ImagePlus } from "lucide-react";
import { BASE_URL } from "../../../utils/api";

export default function NewsModal({ isOpen, onClose, onSave, initialData = null }) {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        is_published: false,
        post_type: "text",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                content: initialData.content || "",
                is_published: !!initialData.is_published,
                post_type: initialData.post_type || "text",
            });
            setImagePreview(initialData.image_url ? `${BASE_URL}${initialData.image_url}` : null);
            setImageFile(null);
            setRemoveImage(false);
        } else {
            setFormData({ title: "", content: "", is_published: false, post_type: "text" });
            setImagePreview(null);
            setImageFile(null);
            setRemoveImage(false);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setRemoveImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('content', formData.content);
            submitData.append('is_published', formData.is_published);
            submitData.append('post_type', formData.post_type);

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            if (removeImage) {
                submitData.append('removeImage', 'true');
            }

            await onSave(submitData);
            onClose();
        } catch (err) {
            console.error("Save news error:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-lg">
                <div className="modal-header">
                    <h2 className="text-lg font-bold text-gray-800">
                        {initialData ? "Edit News" : "Publish News"}
                    </h2>
                    <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body space-y-4">
                    {/* Post Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, post_type: 'text' })}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${formData.post_type === 'text'
                                    ? 'border-customRed bg-red-50 text-customRed'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <FileText size={18} />
                                <span className="font-medium">Text Post</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, post_type: 'image' })}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${formData.post_type === 'image'
                                    ? 'border-customRed bg-red-50 text-customRed'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <ImagePlus size={18} />
                                <span className="font-medium">Image Post</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-customRed outline-none transition-all"
                            placeholder="News Title"
                        />
                    </div>

                    {/* Content field - required for text posts, optional for image posts */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {formData.post_type === 'text' ? 'Content' : 'Caption (Optional)'}
                        </label>
                        <textarea
                            required={formData.post_type === 'text'}
                            rows={5}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-customRed outline-none transition-all resize-none"
                            placeholder={formData.post_type === 'text' ? "What's the update?" : "Add a caption (optional)"}
                        />
                    </div>

                    {/* Image field - optional for text posts, required for image posts */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {formData.post_type === 'image' ? 'Image (Required)' : 'Image (Optional)'}
                        </label>

                        {imagePreview && !removeImage ? (
                            <div className="relative group">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg border"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${formData.post_type === 'image'
                                ? 'border-customRed hover:border-red-600 bg-red-50'
                                : 'border-gray-300 hover:border-customRed'
                                }`}>
                                <ImageIcon size={32} className={formData.post_type === 'image' ? 'text-customRed mb-2' : 'text-gray-400 mb-2'} />
                                <span className={`text-sm ${formData.post_type === 'image' ? 'text-customRed font-medium' : 'text-gray-500'}`}>
                                    Click to upload image {formData.post_type === 'image' && '(Required)'}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">Max 5MB (JPG, PNG, GIF, WebP)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={formData.is_published}
                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                            className="w-4 h-4 text-customRed border-gray-300 rounded focus:ring-customRed"
                        />
                        <label htmlFor="is_published" className="text-sm text-gray-700 select-none">
                            Publish immediately (Push to WhatsApp)
                        </label>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-outline flex-1 sm:flex-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-success flex-1 sm:flex-none px-12 shadow-emerald-500/20"
                        >
                            {saving ? "Saving..." : initialData ? "Update News" : "Publish"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
