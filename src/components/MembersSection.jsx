import { useState } from "react";
import { X, Plus, Edit, User, Check, Trash2 } from "lucide-react";
import InputWithButton from "./InputWithButton";

const MembersSection = ({
  members,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onRemoveMultipleMembers,
}) => {
  const [newMemberName, setNewMemberName] = useState("");
  const [memberMultiSelectMode, setMemberMultiSelectMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Member Item specific states (using object to track multiple members' editing states)
  const [editingStates, setEditingStates] = useState({});
  const [editNames, setEditNames] = useState({});

  // Member Item handlers
  const startEditing = (memberId, currentName) => {
    setEditingStates((prev) => ({ ...prev, [memberId]: true }));
    setEditNames((prev) => ({ ...prev, [memberId]: currentName }));
  };

  const handleSave = (memberId) => {
    onUpdateMember(memberId, editNames[memberId]);
    setEditingStates((prev) => ({ ...prev, [memberId]: false }));
  };

  const handleKeyDown = (e, memberId) => {
    if (e.key === "Enter") {
      handleSave(memberId);
    }
  };

  const getIcon = () => {
    return <User className="h-5 w-5 text-teal-600" />;
  };

  // Members Section handlers
  const handleAddMember = () => {
    onAddMember(newMemberName);
    setNewMemberName("");
  };

  const toggleMemberSelection = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((memberId) => memberId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const toggleMemberMultiSelectMode = () => {
    setMemberMultiSelectMode(!memberMultiSelectMode);
    if (memberMultiSelectMode) {
      setSelectedMembers([]);
      setEditingStates({});
    }
  };

  const deleteSelectedMembers = () => {
    onRemoveMultipleMembers(selectedMembers);
    setSelectedMembers([]);
    setMemberMultiSelectMode(false);
  };

  const handleNewMemberKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddMember();
    }
  };

  // Member Item component render
  const renderMemberItem = (member) => {
    const isEditing = editingStates[member.id] || false;
    const editName = editNames[member.id] || member.name;

    return (
      <div
        key={member.id}
        className={`flex items-center px-4 py-2 bg-teal-100 rounded-full 
          ${memberMultiSelectMode ? "cursor-pointer" : ""} 
          ${memberMultiSelectMode && selectedMembers.includes(member.id) ? "ring-2 ring-teal-500 ring-offset-1" : ""}`}
        onClick={memberMultiSelectMode ? () => toggleMemberSelection(member.id) : undefined}
      >
        <span className="mr-2 text-teal-700 flex-shrink-0">{getIcon()}</span>

        {isEditing ? (
          <div className="flex items-center">
            <input
              type="text"
              value={editName}
              onChange={(e) =>
                setEditNames((prev) => ({ ...prev, [member.id]: e.target.value }))
              }
              onKeyDown={(e) => handleKeyDown(e, member.id)}
              className="mr-2 px-2 py-1 w-24 border border-teal-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 text-teal-800"
              autoFocus
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave(member.id);
              }}
              className="text-teal-600 hover:text-teal-800 mr-1 p-1 bg-teal-50 rounded-full flex-shrink-0"
              type="button"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="mr-2 truncate max-w-32 text-teal-800">
              {member.name}
            </span>
            {!memberMultiSelectMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(member.id, member.name);
                }}
                className="text-teal-600 hover:text-teal-800 mr-1 p-1 bg-teal-50 rounded-full flex-shrink-0"
                type="button"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </>
        )}

        {!memberMultiSelectMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveMember(member.id);
            }}
            className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-full flex-shrink-0"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  // Main render
  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-teal-700">Group Members</h2>
        <div className="flex space-x-2">
          <button
            onClick={toggleMemberMultiSelectMode}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              memberMultiSelectMode
                ? "bg-teal-100 text-teal-800"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            type="button"
          >
            {memberMultiSelectMode ? "Cancel Selection" : "Select Multiple"}
          </button>
          {memberMultiSelectMode && (
            <button
              onClick={deleteSelectedMembers}
              disabled={selectedMembers.length === 0}
              className={`px-3 py-1 rounded text-sm font-medium flex items-center cursor-pointer ${
                selectedMembers.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
              type="button"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedMembers.length})
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {members.map((member) => renderMemberItem(member))}
      </div>


      <InputWithButton
        value={newMemberName}
        onChange={(e) => setNewMemberName(e.target.value)}
        onKeyDown={handleNewMemberKeyDown}
        placeholder="New member name"
        onButtonClick={handleAddMember}
        buttonIcon={<Plus className="h-5 w-5" />}
      />
        
    </div>
  );
};

export default MembersSection;