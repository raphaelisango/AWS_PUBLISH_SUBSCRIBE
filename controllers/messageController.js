const Message = require("../models/Message");
const GroupMessage = require("../models/GroupMessage");

// Send a direct message
exports.sendMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get details of a direct message
exports.getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a direct message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send a message to a group
exports.sendGroupMessage = async (req, res) => {
  try {
    const message = new GroupMessage({
      groupId: req.params.groupId,
      ...req.body,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get messages of a group
exports.getGroupMessages = async (req, res) => {
  try {
    const messages = await GroupMessage.find({ groupId: req.params.groupId });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a message from a group
exports.deleteGroupMessage = async (req, res) => {
  try {
    const message = await GroupMessage.findOneAndDelete({
      groupId: req.params.groupId,
      _id: req.params.messageId,
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
