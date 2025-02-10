const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get details of a group
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update group details
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.groupId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a member to a group
exports.addMember = async (req, res) => {
  try {
    const member = new GroupMember({
      groupId: req.params.groupId,
      ...req.body,
    });
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove a member from a group
exports.removeMember = async (req, res) => {
  try {
    const member = await GroupMember.findOneAndDelete({
      groupId: req.params.groupId,
      userId: req.params.userId,
    });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }
    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a list of group members
exports.getMembers = async (req, res) => {
  try {
    const members = await GroupMember.find({ groupId: req.params.groupId });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
