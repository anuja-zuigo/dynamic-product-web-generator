import ImportLog from "../models/ImportLog.js";

export const listImportLogs = async (req, res) => {
  try {
    const logs = await ImportLog.find({})
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: logs });
  } catch (err) {
    console.error('Error fetching import logs:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve import logs' });
  }
};
