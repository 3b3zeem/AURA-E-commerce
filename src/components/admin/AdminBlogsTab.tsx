"use client";

import React, { useState, useEffect } from "react";
import { BlogPost, BlogCategory } from "@/types";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Tag,
  Layers,
  X,
  Upload,
  User,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createBlogInDb,
  updateBlogInDb,
  deleteBlogInDb,
  getBlogCategoryObjects,
  createBlogCategoryInDb,
  deleteBlogCategoryInDb,
} from "@/lib/services/db";

interface AdminBlogsTabProps {
  blogs: BlogPost[];
  onRefresh: () => void;
}

export function AdminBlogsTab({ blogs, onRefresh }: AdminBlogsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    cover_image: "",
    author_name: "",
    author_avatar: "",
    read_time_minutes: 5,
    summary: "",
    content: "",
    tags: "",
    is_featured: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    const cats = await getBlogCategoryObjects();
    setBlogCategories(cats);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setCatSubmitting(true);
    try {
      const res = await createBlogCategoryInDb(newCatName.trim());
      if (res) {
        toast.success(`Blog category "${res.name}" created!`);
        setNewCatName("");
        loadCategories();
      } else {
        toast.error("Failed to create blog category");
      }
    } catch {
      toast.error("Error creating category");
    } finally {
      setCatSubmitting(false);
    }
  };

  const confirmDeleteToast = (message: string, onConfirm: () => void) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-sm w-full bg-white shadow-2xl border border-slate-300 p-4 font-sans text-xs flex flex-col space-y-3 pointer-events-auto border-l-4 border-l-rose-600`}
        >
          <div className="flex items-start space-x-2">
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-bold text-slate-900 leading-snug">{message}</p>
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase transition-colors shadow-sm cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const targetCat = blogCategories.find((c) => c.id === id);
    const catNameLower = name.toLowerCase().trim();
    const catSlugLower = (targetCat?.slug || "").toLowerCase().trim();

    const assignedArticles = blogs.filter((b) => {
      const bCat = (b.category || "").toLowerCase().trim();
      return bCat === catNameLower || (catSlugLower && bCat === catSlugLower);
    });

    if (assignedArticles.length > 0) {
      toast.error(
        `Cannot delete category "${name}" because ${assignedArticles.length} blog article(s) are assigned to it.`,
        {
          duration: 5000,
          style: {
            background: "#fff1f2",
            color: "#be123c",
            border: "1px solid #fecdd3",
            fontWeight: "bold",
          },
        }
      );
      return;
    }

    confirmDeleteToast(`Delete blog category "${name}"?`, async () => {
      const ok = await deleteBlogCategoryInDb(id);
      if (ok) {
        toast.success(`Blog category "${name}" deleted!`);
        loadCategories();
      } else {
        toast.error("Failed to delete category");
      }
    });
  };

  const openCreateModal = () => {
    setEditingBlog(null);
    const defaultCategory = blogCategories.length > 0 ? blogCategories[0].name : "";
    setFormData({
      title: "",
      slug: "",
      category: defaultCategory,
      cover_image: "",
      author_name: "",
      author_avatar: "",
      read_time_minutes: 5,
      summary: "",
      content: "",
      tags: "",
      is_featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      cover_image: blog.cover_image,
      author_name: blog.author_name,
      author_avatar: blog.author_avatar || "",
      read_time_minutes: blog.read_time_minutes,
      summary: blog.summary,
      content: blog.content,
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
      is_featured: Boolean(blog.is_featured),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    confirmDeleteToast(`Are you sure you want to delete article "${title}"?`, async () => {
      const ok = await deleteBlogInDb(id);
      if (ok) {
        toast.success("Blog post deleted successfully");
        onRefresh();
      } else {
        toast.error("Failed to delete blog post");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        category: formData.category,
        cover_image: formData.cover_image,
        author_name: formData.author_name,
        author_avatar: formData.author_avatar,
        read_time_minutes: Number(formData.read_time_minutes),
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_featured: formData.is_featured,
      };

      if (editingBlog) {
        const res = await updateBlogInDb(editingBlog.id, payload);
        if (res) {
          toast.success("Article updated successfully!");
          setIsModalOpen(false);
          onRefresh();
        } else {
          toast.error("Failed to update article");
        }
      } else {
        const res = await createBlogInDb(payload);
        if (res) {
          toast.success("Article published successfully!");
          setIsModalOpen(false);
          onRefresh();
        } else {
          toast.error("Failed to create article");
        }
      }
    } catch {
      toast.error("An error occurred while saving article");
    } finally {
      setSubmitting(false);
    }
  };

  const categoryFilterList = ["All", ...Array.from(new Set([
    ...blogCategories.map((c) => c.name),
    ...blogs.map((b) => b.category),
  ]))];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCategory = selectedCategory === "All" || b.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormData((prev) => ({ ...prev, cover_image: reader.result as string }));
          toast.success("Cover image uploaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormData((prev) => ({ ...prev, author_avatar: reader.result as string }));
          toast.success("Author avatar uploaded successfully!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white text-slate-900 border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-slate-900" />
            <h2 className="text-lg font-black uppercase font-mono tracking-tight text-slate-900">
              JOURNAL & BLOG ARTICLES ({blogs.length})
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Manage blog posts and blog categories separately from product catalog.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider border border-slate-300 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Blog Categories ({blogCategories.length})</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-200">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {categoryFilterList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-300 hover:border-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs text-slate-900 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-mono font-black tracking-wider text-[11px]">
              <th className="p-3">Cover</th>
              <th className="p-3">Article Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Author</th>
              <th className="p-3">Read Time</th>
              <th className="p-3">Featured</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium">
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                  No articles found. Click "New Article" above to publish your first post.
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 w-16">
                    <img
                      src={blog.cover_image}
                      alt={blog.title}
                      className="w-12 h-10 object-cover border border-slate-300 bg-slate-100"
                    />
                  </td>
                  <td className="p-3 max-w-xs">
                    <span className="font-bold text-slate-900 block truncate">{blog.title}</span>
                    <span className="text-[11px] text-slate-500 truncate block">/{blog.slug}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-mono font-bold text-[10px] uppercase border border-amber-300">
                      {blog.category}
                    </span>
                  </td>
                  <td className="p-3">{blog.author_name}</td>
                  <td className="p-3 font-mono">{blog.read_time_minutes} mins</td>
                  <td className="p-3">
                    {blog.is_featured ? (
                      <span className="px-2 py-0.5 bg-slate-900 text-amber-400 text-[10px] font-mono font-bold uppercase border border-slate-800">
                        FEATURED
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`/blogs/${blog.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
                        title="Preview Article"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openEditModal(blog)}
                        className="p-1.5 bg-slate-900 hover:bg-black text-white border border-slate-800 transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id, blog.title)}
                        className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Managing Blog Categories */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black uppercase text-slate-900 font-mono">
                  BLOG CATEGORIES MANAGEMENT
                </h3>
              </div>
              <button onClick={() => setIsCatModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form to Add New Category */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New Category Name..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                disabled={catSubmitting}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase transition-colors shrink-0 disabled:opacity-50"
              >
                {catSubmitting ? "Adding..." : "Add"}
              </button>
            </form>

            {/* List of Existing Blog Categories */}
            <div className="space-y-2 max-h-60 overflow-y-auto pt-2 border-t border-slate-200">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase block">
                Existing Blog Categories ({blogCategories.length}):
              </span>
              {blogCategories.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No categories created in Supabase yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {blogCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between py-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">/{cat.slug}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 text-rose-600 hover:text-rose-900 hover:bg-rose-50 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Article Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-300 w-full max-w-2xl p-6 space-y-6 shadow-2xl my-8 h-auto md:h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight font-mono">
                {editingBlog ? "Edit Article" : "Create New Article"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-700 block">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                    placeholder="Article Headline..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-700 block">Category *</label>
                  <div className="flex gap-2">
                    {blogCategories.length > 0 ? (
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                      >
                        {blogCategories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                        placeholder="Audio, Tech..."
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold uppercase text-slate-700 block">
                    Cover Image (Upload File or Enter URL) *
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Image Preview Thumbnail */}
                    {formData.cover_image ? (
                      <div className="relative w-16 h-12 shrink-0 border border-slate-300 bg-slate-100 overflow-hidden group">
                        <img
                          src={formData.cover_image}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-12 shrink-0 border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}

                    {/* Upload File Input Button */}
                    <label className="px-3 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Image URL Text Input */}
                    <input
                      type="text"
                      required
                      value={formData.cover_image}
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900 text-xs"
                      placeholder="https://... or uploaded base64 data"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-700 block">Read Time (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.read_time_minutes}
                    onChange={(e) => setFormData({ ...formData, read_time_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-700 block">Author Name</label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-slate-700 block">
                    Author Avatar (Upload File or Enter URL)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Avatar Preview Thumbnail */}
                    {formData.author_avatar ? (
                      <div className="relative w-9 h-9 rounded-full shrink-0 border border-slate-300 bg-slate-100 overflow-hidden">
                        <img
                          src={formData.author_avatar}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full shrink-0 border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                    )}

                    {/* Upload File Input Button */}
                    <label className="px-2.5 py-2 bg-slate-900 hover:bg-black text-white font-bold text-[11px] uppercase transition-colors flex items-center justify-center space-x-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Avatar URL Text Input */}
                    <input
                      type="text"
                      value={formData.author_avatar}
                      onChange={(e) => setFormData({ ...formData, author_avatar: e.target.value })}
                      className="flex-1 px-2.5 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900 text-xs"
                      placeholder="https://... avatar URL"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-slate-700 block">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                  placeholder="Tech, Audio, Planar"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-slate-700 block">Summary *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900"
                  placeholder="Short excerpt for card list..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-slate-700 block">Article Body Content *</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-slate-900 font-mono text-[11px]"
                  placeholder="Supports Markdown headers #, ###, and paragraphs..."
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-0"
                />
                <label htmlFor="is_featured" className="font-bold uppercase text-slate-900 cursor-pointer">
                  Feature this article at the top of the Journal page
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingBlog ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
