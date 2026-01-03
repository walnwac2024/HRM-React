const { pool } = require("../../Utils/db");
const { pushToWhatsApp, getWhatsAppStatus, initWhatsApp, syncGroups, logoutWhatsApp } = require("../../Utils/whatsapp");
const fs = require('fs');
const path = require('path');

/**
 * GET /api/v1/news
 */
async function listNews(req, res) {
    try {
        const user = req.session?.user || {};
        const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
        const isAdmin = userRoles.some(r => ["admin", "super_admin", "hr", "developer"].includes(String(r).toLowerCase()));

        let query = `
            SELECT n.*, e.Employee_Name as author_name 
            FROM news n 
            LEFT JOIN employee_records e ON n.author_id = e.id
        `;

        if (!isAdmin) {
            query += " WHERE n.is_published = 1";
        }
        query += " ORDER BY n.created_at DESC";

        const [rows] = await pool.execute(query);
        return res.json(rows);
    } catch (err) {
        console.error("listNews error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * POST /api/v1/news
 */
async function createNews(req, res) {
    const { title, content, is_published, post_type = 'text' } = req.body;
    const authorId = req.session?.user?.id;
    const imageUrl = req.file ? `/uploads/news/${req.file.filename}` : null;

    // Validation based on post type
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    if (post_type === 'text' && !content) {
        return res.status(400).json({ message: "Content is required for text posts" });
    }

    if (post_type === 'image' && !imageUrl) {
        return res.status(400).json({ message: "Image is required for image posts" });
    }

    try {
        const [result] = await pool.execute(
            "INSERT INTO news (title, content, post_type, image_url, author_id, is_published) VALUES (?, ?, ?, ?, ?, ?)",
            [title, content || '', post_type, imageUrl, authorId, is_published ? 1 : 0]
        );

        const newsId = result.insertId;

        if (is_published) {
            // Get target group from settings
            const [settings] = await pool.execute("SELECT setting_value FROM settings WHERE setting_key = 'whatsapp_group_id'");
            const targetGroupId = settings.length > 0 ? settings[0].setting_value : process.env.WHP_GROUP_ID;

            if (targetGroupId) {
                const imagePath = imageUrl ? path.join(__dirname, '../../', imageUrl) : null;
                const message = content ? `📢 *${title}*\n\n${content}` : `📢 *${title}*`;
                await pushToWhatsApp(message, targetGroupId, imagePath);
            }
        }

        return res.status(201).json({ message: "News created", id: newsId });
    } catch (err) {
        console.error("createNews error:", err);
        // Clean up uploaded file if database insert fails
        if (req.file) {
            fs.unlink(req.file.path, () => { });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * PATCH /api/v1/news/:id
 */
async function updateNews(req, res) {
    const { id } = req.params;
    const { title, content, is_published, removeImage, post_type } = req.body;
    const newImageUrl = req.file ? `/uploads/news/${req.file.filename}` : null;

    try {
        const [existing] = await pool.execute("SELECT is_published, image_url, post_type FROM news WHERE id = ?", [id]);
        if (existing.length === 0) return res.status(404).json({ message: "News not found" });

        const wasPublished = existing[0].is_published;
        const oldImageUrl = existing[0].image_url;
        const currentPostType = post_type || existing[0].post_type;

        // Validation based on post type
        if (currentPostType === 'text' && !content) {
            return res.status(400).json({ message: "Content is required for text posts" });
        }

        // Determine final image URL
        let finalImageUrl = oldImageUrl;
        if (removeImage === 'true') {
            finalImageUrl = null;
        } else if (newImageUrl) {
            finalImageUrl = newImageUrl;
        }

        if (currentPostType === 'image' && !finalImageUrl) {
            return res.status(400).json({ message: "Image is required for image posts" });
        }

        await pool.execute(
            "UPDATE news SET title = ?, content = ?, post_type = ?, image_url = ?, is_published = ? WHERE id = ?",
            [title, content || '', currentPostType, finalImageUrl, is_published ? 1 : 0, id]
        );

        // Delete old image if replaced or removed
        if (oldImageUrl && (newImageUrl || removeImage === 'true')) {
            const oldImagePath = path.join(__dirname, '../../', oldImageUrl);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error('Failed to delete old image:', err);
            });
        }

        if (is_published && !wasPublished) {
            // Get target group from settings
            const [settings] = await pool.execute("SELECT setting_value FROM settings WHERE setting_key = 'whatsapp_group_id'");
            const targetGroupId = settings.length > 0 ? settings[0].setting_value : process.env.WHP_GROUP_ID;

            if (targetGroupId) {
                const imagePath = finalImageUrl ? path.join(__dirname, '../../', finalImageUrl) : null;
                const message = content ? `📢 *${title}*\n\n${content}` : `📢 *${title}*`;
                await pushToWhatsApp(message, targetGroupId, imagePath);
            }
        }

        return res.json({ message: "News updated" });
    } catch (err) {
        console.error("updateNews error:", err);
        // Clean up new uploaded file if update fails
        if (req.file) {
            fs.unlink(req.file.path, () => { });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * DELETE /api/v1/news/:id
 */
async function deleteNews(req, res) {
    const { id } = req.params;
    try {
        // Get image URL before deleting
        const [existing] = await pool.execute("SELECT image_url FROM news WHERE id = ?", [id]);
        const imageUrl = existing.length > 0 ? existing[0].image_url : null;

        await pool.execute("DELETE FROM news WHERE id = ?", [id]);

        // Delete associated image file
        if (imageUrl) {
            const imagePath = path.join(__dirname, '../../', imageUrl);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Failed to delete image:', err);
            });
        }

        return res.json({ message: "News deleted" });
    } catch (err) {
        console.error("deleteNews error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * GET /api/v1/news/whatsapp/status
 */
async function getWHStatus(req, res) {
    const statusResult = await getWhatsAppStatus();
    // Also fetch the currently selected group from settings
    try {
        const [settings] = await pool.execute("SELECT setting_value FROM settings WHERE setting_key = 'whatsapp_group_id'");
        statusResult.selectedGroupId = settings.length > 0 ? settings[0].setting_value : null;
    } catch (e) {
        console.error("Error fetching group setting", e);
    }
    return res.json(statusResult);
}

/**
 * POST /api/v1/news/whatsapp/init
 */
function initWH(req, res) {
    initWhatsApp();
    return res.json({ message: "WhatsApp initialization started" });
}

/**
 * POST /api/v1/news/whatsapp/settings
 */
async function setWHSettings(req, res) {
    const { groupId } = req.body;
    if (!groupId) return res.status(400).json({ message: "groupId is required" });

    try {
        await pool.execute(
            "INSERT INTO settings (setting_key, setting_value) VALUES ('whatsapp_group_id', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
            [groupId, groupId]
        );
        return res.json({ message: "WhatsApp settings updated" });
    } catch (err) {
        console.error("setWHSettings error:", err);
        return res.status(500).json({ message: "Server error" });
    }
}

/**
 * POST /api/v1/news/whatsapp/sync
 */
async function syncWHGroups(req, res) {
    const groups = await syncGroups();
    return res.json({ message: "Groups synced", groups });
}

/**
 * POST /api/v1/news/whatsapp/logout
 */
async function logoutWH(req, res) {
    const { hardReset } = req.body;
    // Trigger logout in background and return immediately for better UX
    logoutWhatsApp(hardReset === true).catch(err => console.error("Background logout error:", err));
    return res.json({ message: hardReset ? "WhatsApp hard reset initiated" : "WhatsApp logout initiated" });
}

module.exports = {
    listNews,
    createNews,
    updateNews,
    deleteNews,
    getWHStatus,
    initWH,
    setWHSettings,
    syncWHGroups,
    logoutWH,
};
