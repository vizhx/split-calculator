import { useState, useEffect } from "react";
import { X, Plus, Edit, User, Pizza, Check, Trash2 } from "lucide-react";

const BillSplitCalculator = () => {
  const [members, setMembers] = useState([
    { id: 1, name: "Person 1", icon: "user" },
    { id: 2, name: "Person 2", icon: "user" },
  ]);

  const [items, setItems] = useState([
    { id: 1, name: "Food Item 1", price: 0, consumers: [1] },
  ]);

  const [newMemberName, setNewMemberName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [nextMemberId, setNextMemberId] = useState(3);
  const [nextItemId, setNextItemId] = useState(2);
  const [calculations, setCalculations] = useState({});
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editName, setEditName] = useState("");

  // Separate multi-select states for members and items
  const [memberMultiSelectMode, setMemberMultiSelectMode] = useState(false);
  const [itemMultiSelectMode, setItemMultiSelectMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  // Icons map
  const icons = {
    user: <User className="h-5 w-5 text-teal-600" />,
    pizza: <Pizza className="h-5 w-5 text-teal-600" />,
  };

  const addMember = () => {
    if (newMemberName.trim() === "") return;

    setMembers([
      ...members,
      {
        id: nextMemberId,
        name: newMemberName,
        icon: "user",
      },
    ]);
    setNextMemberId(nextMemberId + 1);
    setNewMemberName("");
  };

  const addItem = () => {
    if (newItemName.trim() === "") return;

    setItems([
      ...items,
      {
        id: nextItemId,
        name: newItemName,
        price: 0,
        consumers: [],
      },
    ]);
    setNextItemId(nextItemId + 1);
    setNewItemName("");
  };

  const removeMember = (id) => {
    setMembers(members.filter((member) => member.id !== id));

    // Remove this member from all items' consumers
    setItems(
      items.map((item) => ({
        ...item,
        consumers: item.consumers.filter((consumerId) => consumerId !== id),
      }))
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Multi-select deletion handlers
  const toggleMemberSelection = (id) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((memberId) => memberId !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const toggleItemSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const deleteSelectedMembers = () => {
    if (selectedMembers.length === 0) return;

    setMembers(
      members.filter((member) => !selectedMembers.includes(member.id))
    );

    // Remove these members from all items' consumers
    setItems(
      items.map((item) => ({
        ...item,
        consumers: item.consumers.filter(
          (consumerId) => !selectedMembers.includes(consumerId)
        ),
      }))
    );

    setSelectedMembers([]);
    setMemberMultiSelectMode(false);
  };

  const deleteSelectedItems = () => {
    if (selectedItems.length === 0) return;

    setItems(items.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setItemMultiSelectMode(false);
  };

  // Independent multi-select mode toggles
  const toggleMemberMultiSelectMode = () => {
    setMemberMultiSelectMode(!memberMultiSelectMode);
    if (memberMultiSelectMode) {
      setSelectedMembers([]);
    }
  };

  const toggleItemMultiSelectMode = () => {
    setItemMultiSelectMode(!itemMultiSelectMode);
    if (itemMultiSelectMode) {
      setSelectedItems([]);
    }
  };

  const updatePrice = (id, price) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, price: parseFloat(price) || 0 } : item
      )
    );
  };

  const toggleConsumer = (itemId, memberId) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const consumers = item.consumers.includes(memberId)
            ? item.consumers.filter((id) => id !== memberId)
            : [...item.consumers, memberId];
          return { ...item, consumers };
        }
        return item;
      })
    );
  };

  const startEditingMember = (id) => {
    const member = members.find((m) => m.id === id);
    if (member) {
      setEditingMemberId(id);
      setEditName(member.name);
    }
  };

  const startEditingItem = (id) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setEditingItemId(id);
      setEditName(item.name);
    }
  };

  const saveEditingMember = () => {
    if (editName.trim() === "") return;

    setMembers(
      members.map((member) =>
        member.id === editingMemberId ? { ...member, name: editName } : member
      )
    );
    setEditingMemberId(null);
    setEditName("");
  };

  const saveEditingItem = () => {
    if (editName.trim() === "") return;

    setItems(
      items.map((item) =>
        item.id === editingItemId ? { ...item, name: editName } : item
      )
    );
    setEditingItemId(null);
    setEditName("");
  };

  // Handle Enter key press for new member input
  const handleMemberKeyDown = (e) => {
    if (e.key === "Enter") {
      addMember();
    }
  };

  // Handle Enter key press for new item input
  const handleItemKeyDown = (e) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

  // Handle Enter key press for editing member name
  const handleEditMemberKeyDown = (e) => {
    if (e.key === "Enter") {
      saveEditingMember();
    }
  };

  // Handle Enter key press for editing item name
  const handleEditItemKeyDown = (e) => {
    if (e.key === "Enter") {
      saveEditingItem();
    }
  };

  // Calculate split
  useEffect(() => {
    const memberTotals = {};

    // Initialize all members with 0
    members.forEach((member) => {
      memberTotals[member.id] = 0;
    });

    // Calculate splits for each item
    items.forEach((item) => {
      if (item.price <= 0 || item.consumers.length === 0) return;

      const splitAmount = item.price / item.consumers.length;

      item.consumers.forEach((consumerId) => {
        memberTotals[consumerId] =
          (memberTotals[consumerId] || 0) + splitAmount;
      });
    });

    setCalculations(memberTotals);
  }, [items, members]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-teal-50 to-blue-50 font-sans font-inter">
      <div className="max-w-4xl mx-auto p-6 w-full">
        <h2 className="text-3xl font-bold text-left mb-8 text-teal-800">
          Bill Split Calculator
        </h2>

        {/* Members Section */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-teal-700">
              Group Members
            </h2>
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
                  <Trash2 className="h-4 w-4 mr-1" /> Delete (
                  {selectedMembers.length})
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {members.map((member) => (
              <div
                key={member.id}
                className={`flex items-center px-4 py-2 bg-teal-100 rounded-full 
                ${memberMultiSelectMode ? "cursor-pointer" : ""} 
                ${
                  memberMultiSelectMode && selectedMembers.includes(member.id)
                    ? "ring-2 ring-teal-500 ring-offset-1"
                    : ""
                }`}
                onClick={() =>
                  memberMultiSelectMode && toggleMemberSelection(member.id)
                }
              >
                <span className="mr-2 text-teal-700 flex-shrink-0">
                  {icons[member.icon]}
                </span>

                {editingMemberId === member.id ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={handleEditMemberKeyDown}
                      className="mr-2 px-2 py-1 w-24 border border-teal-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 text-teal-800"
                      autoFocus
                    />
                    <button
                      onClick={saveEditingMember}
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
                        onClick={() => startEditingMember(member.id)}
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
                    onClick={() => removeMember(member.id)}
                    className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-full flex-shrink-0"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={handleMemberKeyDown}
              placeholder="New member name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 pr-12"
            />
            <button
              onClick={addMember}
              className="absolute right-0 top-0 h-full px-4 bg-teal-600 text-white rounded-r-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-center"
              type="button"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bill Items Grid */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-teal-700">Food Items</h2>
            <div className="flex space-x-2">
              <button
                onClick={toggleItemMultiSelectMode}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  itemMultiSelectMode
                    ? "bg-teal-100 text-teal-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                type="button"
              >
                {itemMultiSelectMode ? "Cancel Selection" : "Select Multiple"}
              </button>
              {itemMultiSelectMode && (
                <button
                  onClick={deleteSelectedItems}
                  disabled={selectedItems.length === 0}
                  className={`px-3 py-1 rounded text-sm font-medium flex items-center ${
                    selectedItems.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                  type="button"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete (
                  {selectedItems.length})
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse mb-4 table-fixed">
              <thead>
                <tr className="bg-teal-100">
                  {itemMultiSelectMode && (
                    <th className="p-2 w-10 text-center"></th>
                  )}
                  <th className="p-2 ps-3 text-left w-1/3 text-teal-800">
                    Item
                  </th>
                  <th className="p-2 ps-3 text-left w-1/6 text-teal-800">
                    Price
                  </th>
                  {members.map((member) => (
                    <th key={member.id} className="p-2 text-center">
                      <div className="flex flex-col items-center">
                        <span className="flex-shrink-0">{icons.user}</span>
                        <span className="text-xs truncate max-w-full text-teal-800">
                          {member.name}
                        </span>
                      </div>
                    </th>
                  ))}
                  {!itemMultiSelectMode && <th className="p-2 w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 ${
                      itemMultiSelectMode && selectedItems.includes(item.id)
                        ? "bg-teal-50"
                        : ""
                    }`}
                    onClick={() =>
                      itemMultiSelectMode && toggleItemSelection(item.id)
                    }
                  >
                    {itemMultiSelectMode && (
                      <td className="p-2 text-center w-10">
                        <div
                          className={`w-5 h-5 rounded border ${
                            selectedItems.includes(item.id)
                              ? "bg-teal-500 border-teal-600"
                              : "border-gray-400"
                          } inline-flex items-center justify-center cursor-pointer`}
                        >
                          {selectedItems.includes(item.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </td>
                    )}
                    <td className="p-2">
                      <div className="flex items-center">
                        <span className="mr-2 text-teal-700 flex-shrink-0">
                          {icons.pizza}
                        </span>

                        {editingItemId === item.id ? (
                          <div className="flex items-center flex-grow">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={handleEditItemKeyDown}
                              className="mr-2 px-2 py-1 w-full border border-teal-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800"
                              autoFocus
                            />
                            <button
                              onClick={saveEditingItem}
                              className="text-teal-600 hover:text-teal-800 p-1 bg-teal-50 rounded-full flex-shrink-0"
                              type="button"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="mr-2 truncate max-w-32 text-teal-800">
                              {item.name}
                            </span>
                            {!itemMultiSelectMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingItem(item.id);
                                }}
                                className="text-teal-600 hover:text-teal-800 p-1 bg-teal-50 rounded-full flex-shrink-0"
                                type="button"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <span className="mr-1 text-gray-800">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price || ""}
                          onChange={(e) => updatePrice(item.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800"
                        />
                      </div>
                    </td>
                    {members.map((member) => (
                      <td key={member.id} className="p-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleConsumer(item.id, member.id);
                          }}
                          className={`w-6 h-6 rounded-full flex-shrink-0 inline-flex items-center justify-center ${
                            item.consumers.includes(member.id)
                              ? "bg-teal-500 text-white"
                              : "bg-gray-200"
                          }`}
                          type="button"
                        >
                          {item.consumers.includes(member.id) && (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    ))}
                    {!itemMultiSelectMode && (
                      <td className="p-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-full flex-shrink-0 inline-flex items-center justify-center"
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="relative">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleItemKeyDown}
              placeholder="New food item"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 pr-12"
            />
            <button
              onClick={addItem}
              className="absolute right-0 top-0 h-full px-4 bg-teal-600 text-white rounded-r-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-center"
              type="button"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-teal-700">
            Final Split
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="bg-blue-50 p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <span className="p-2 bg-teal-100 rounded-full mr-2 text-teal-700 flex-shrink-0">
                    {icons.user}
                  </span>
                  <h3 className="font-medium truncate text-teal-800">
                    {member.name}
                  </h3>
                </div>
                <div className="text-2xl font-bold text-teal-800">
                  ₹{(calculations[member.id] || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillSplitCalculator;
