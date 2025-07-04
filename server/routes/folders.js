import express from 'express';
import Folder from '../models/Folder.js';
import Form from '../models/Form.js';

const router = express.Router();

// Get all folders
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find().sort({ updatedAt: -1 });
    
    // Update form count for each folder
    for (let folder of folders) {
      const formCount = await Form.countDocuments({ folderId: folder._id });
      if (folder.formCount !== formCount) {
        folder.formCount = formCount;
        await folder.save();
      }
    }
    
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get folder by ID with forms
router.get('/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    const forms = await Form.find({ folderId: req.params.id }).sort({ updatedAt: -1 });
    
    res.json({
      folder,
      forms
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new folder
router.post('/', async (req, res) => {
  try {
    const folder = new Folder(req.body);
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update folder
router.put('/:id', async (req, res) => {
  try {
    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete folder
router.delete('/:id', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Check if folder has forms
    const formCount = await Form.countDocuments({ folderId: req.params.id });
    if (formCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete folder with forms. Please move or delete all forms first.' 
      });
    }
    
    await Folder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Move forms to folder
router.post('/:id/move-forms', async (req, res) => {
  try {
    const { formIds } = req.body;
    
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    await Form.updateMany(
      { _id: { $in: formIds } },
      { folderId: req.params.id, updatedAt: new Date() }
    );
    
    // Update folder form count
    folder.formCount = await Form.countDocuments({ folderId: req.params.id });
    await folder.save();
    
    res.json({ message: 'Forms moved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;