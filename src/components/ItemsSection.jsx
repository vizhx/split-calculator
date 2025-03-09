import { useState, useEffect } from "react";
import { X, Plus, Edit, Check, Trash2, Pizza, User, Percent, ShieldOff, PieChart } from "lucide-react";
import InputWithButton from "./InputWithButton"; // Assuming this component exists

// Component to render the portion pie chart icon
const PortionPieChart = ({ totalPortions, allocatedPortions, size = 24, className = "", onClick }) => {
    // Early return if data is invalid
    if (!totalPortions || totalPortions < 1) return null;

    const radius = size / 2;
    const center = size / 2;
    const sliceAngle = 360 / totalPortions;

    // Generate pie slices
    const slices = [];
    for (let i = 0; i < totalPortions; i++) {
        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;

        // Convert angles to radians for calculation
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        // Calculate path coordinates
        const startX = center + radius * Math.cos(startRad);
        const startY = center + radius * Math.sin(startRad);
        const endX = center + radius * Math.cos(endRad);
        const endY = center + radius * Math.sin(endRad);

        // Create arc flag (always use large arc for slices less than 180 degrees)
        const largeArcFlag = sliceAngle > 180 ? 1 : 0;

        // Create path
        const path = `M ${center},${center} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;

        // Determine if this slice is allocated (active)
        const isActive = i < allocatedPortions;

        slices.push(
            <path
                key={i}
                d={path}
                fill={isActive ? "#0D9488" : "#E2E8F0"}
                stroke="#CBD5E1"
                strokeWidth="0.5"
            />
        );
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={`${className} ${onClick ? "cursor-pointer" : ""}`}
            onClick={onClick}
        >
            {slices}
        </svg>
    );
};

// Portion allocation modal component
const PortionAllocationModal = ({ item, member, onClose, onUpdatePortion, members }) => {
    const [portion, setPortion] = useState(item.portions?.[member.id] || 0); // Initialize with 0
    const [isIncrementing, setIsIncrementing] = useState(false); // State for debouncing
    const [isDecrementing, setIsDecrementing] = useState(false);

    const handleSave = () => {
        onUpdatePortion(item.id, member.id, portion);
        onClose();
    };

    // Calculate total allocated portions excluding this member
    const totalAllocatedOthers = Object.entries(item.portions || {})
        .filter(([id]) => parseInt(id) !== member.id)
        .reduce((sum, [, p]) => sum + p, 0);

    // Calculate maximum possible for this member
    const maxPossible = item.totalPortions;// Changed to 0


    const handleIncrement = () => {
        if (!isIncrementing) {
            setIsIncrementing(true);
            setPortion(prevPortion => Math.min(maxPossible, prevPortion + 1));
            setTimeout(() => setIsIncrementing(false), 200); // Debounce delay
        }
    };

    const handleDecrement = () => {
        if (!isDecrementing) {
            setIsDecrementing(true);
            setPortion(prevPortion => Math.max(0, prevPortion - 1));
            setTimeout(() => setIsDecrementing(false), 200); // Debounce delay
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-teal-700">
                        Assign Portions
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="flex items-center mb-3">
                        <User className="h-5 w-5 text-teal-600 mr-2" />
                        <span className="font-medium text-teal-800">{member.name}</span>
                    </div>

                    <div className="flex items-center mb-3">
                        <Pizza className="h-5 w-5 text-teal-600 mr-2" />
                        <span className="font-medium text-teal-800">{item.name}</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-teal-700">Total Portions:</span>
                        <span className="font-medium text-teal-800">{item.totalPortions}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-teal-700">Already Allocated:</span>
                        <span className="font-medium text-teal-800">{totalAllocatedOthers}</span>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-teal-700 mb-1">
                            Portions for {member.name}:
                        </label>
                        <div className="flex items-center">
                            <button
                                onClick={handleDecrement}
                                className="bg-teal-100 text-teal-800 rounded-l p-2 hover:bg-teal-200"
                                disabled={portion <= 0}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="0"
                                max={maxPossible}
                                value={portion}
                                onChange={(e) => setPortion(Math.min(maxPossible, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="w-16 text-center py-2 border-t border-b border-teal-300"
                            />
                            <button
                                onClick={handleIncrement}
                                className="bg-teal-100 text-teal-800 rounded-r p-2 hover:bg-teal-200"
                                disabled={portion >= maxPossible}
                            >
                                +
                            </button>
                            <span className="ml-2 text-teal-600">/ {item.totalPortions}</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <PortionPieChart
                            totalPortions={item.totalPortions}
                            allocatedPortions={portion}
                            size={60}
                        />
                    </div>

                    {portion + totalAllocatedOthers < item.totalPortions && (
                        <div className={'mt-3 p-2 rounded text-sm bg-yellow-100 text-yellow-800'}> Warning: not all portions are allocated</div>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const ItemsSection = ({
    items,
    members,
    onAddItem,
    onUpdateItem,
    onRemoveItem,
    onRemoveMultipleItems,
    onUpdatePrice,
    onToggleConsumer,
    onUpdatePortions,
    onUpdateDiscount, // New prop for handling discount updates
    onToggleDiscountExempt, // New prop for handling discount exemption
    discountPercentage = 0, // New prop for discount percentage
}) => {
    const [newItemName, setNewItemName] = useState("");
    const [itemMultiSelectMode, setItemMultiSelectMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editName, setEditName] = useState("");
    const [portionModal, setPortionModal] = useState(null);
    const [showDiscountInput, setShowDiscountInput] = useState(discountPercentage > 0);
    
    useEffect(() => {
        setShowDiscountInput(discountPercentage > 0);
    }, [discountPercentage]);

    const handleAddItem = () => {
        onAddItem(newItemName);
        setNewItemName("");

    };

    const toggleItemSelection = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const toggleItemMultiSelectMode = () => {
        setItemMultiSelectMode(!itemMultiSelectMode);
        if (itemMultiSelectMode) {
            setSelectedItems([]);
        }
    };

    const deleteSelectedItems = () => {
        onRemoveMultipleItems(selectedItems);
        setSelectedItems([]);
        setItemMultiSelectMode(false);

    };

    const startEditingItem = (id, name) => {
        setEditingItemId(id);
        setEditName(name);
    };

    const saveEditingItem = () => {
        onUpdateItem(editingItemId, editName);
        setEditingItemId(null);
        setEditName("");

    };

    const handleDiscountChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        onUpdateDiscount(Math.max(0, Math.min(100, value)));
    };

    // New handler for toggling discount exemption for an item
    const handleToggleDiscountExempt = (itemId) => {
        onToggleDiscountExempt(itemId);
    };

    // Handle Enter key press
    const handleItemKeyDown = (e) => {
        if (e.key === "Enter") {
            handleAddItem();
        }
    };

    const handleEditItemKeyDown = (e) => {
        if (e.key === "Enter") {
            saveEditingItem();
        }
    };

    // Update total portions for an item
    const updateTotalPortions = (itemId, newTotal) => {
        const item = items.find(item => item.id === itemId);
        if (!item) return;

        newTotal = Math.max(1, newTotal);

        // If portions data doesn't exist, initialize it
        let portions = item.portions || {};

        // If we're switching from equal split (1 portion) to portions split
        if (item.totalPortions === 1 && newTotal > 1) {
            // Initialize portions for all consumers with equal distribution
            const portionPerMember = Math.floor(newTotal / item.consumers.length);
            let remainingPortions = newTotal;

            portions = {};
            item.consumers.forEach((memberId, index) => {
                // Last member gets any remaining portions
                const isLast = index === item.consumers.length - 1;
                const memberPortion = isLast ? remainingPortions : portionPerMember;
                portions[memberId] = memberPortion;
                remainingPortions -= memberPortion;
            });
        }
        // If we're going back to equal split (1 portion)
        else if (newTotal === 1 && item.totalPortions > 1) {
            // Reset to one portion per member
            portions = {};
            item.consumers.forEach(memberId => {
                portions[memberId] = 1;
            });
        }
        else {
            const totalAllocated = Object.values(portions).reduce((sum, p) => sum + p, 0);
            if (totalAllocated > newTotal) {
                const scaling = newTotal / totalAllocated;
                Object.keys(portions).forEach(memberId => {
                    portions[memberId] = Math.max(1, Math.floor(portions[memberId] * scaling));
                });
                let revisedTotal = Object.values(portions).reduce((sum, p) => sum + p, 0);
                let diff = newTotal - revisedTotal;
                if (diff > 0) {
                    const memberIds = Object.keys(portions);
                    let idx = 0;
                    while (diff > 0 && idx < memberIds.length) {
                        portions[memberIds[idx]] += 1;
                        diff -= 1;
                        idx += 1;
                    }
                }
            }
            else if (totalAllocated < newTotal) { // Handle adding portions
                let diff = newTotal - totalAllocated;
                const memberIds = Object.keys(portions);
                let idx = 0;
                while (diff > 0 && idx < memberIds.length) {
                    portions[memberIds[idx]] += 1;
                    diff -= 1;
                    idx += 1;
                }
            }
        }

        onUpdatePortions(itemId, newTotal, portions);


    };

    // Update portion for a specific member
    const updateMemberPortion = (itemId, memberId, portion) => {
        const item = items.find(item => item.id === itemId);
        if (!item) return;

        // Create a new portions object
        const newPortions = { ...item.portions || {} };

        // Calculate current total allocated portions excluding this member
        const totalAllocatedOthers = Object.entries(newPortions)
            .filter(([id]) => parseInt(id) !== memberId)
            .reduce((sum, [, p]) => sum + p, 0);

        // Update this member's portion
        const newPortion = Math.max(0, portion);
        newPortions[memberId] = newPortion;

        // Calculate new total
        const newTotalAllocated = totalAllocatedOthers + newPortion;
        // Only adjust other portions if we exceed totalPortions
        if (newTotalAllocated > item.totalPortions) {
            // Calculate how much we need to reduce from others
            const excess = newTotalAllocated - item.totalPortions;

            // Find adjustable members (those with portions > 1, excluding current member)
            const adjustableMembers = Object.entries(newPortions)
                .filter(([id, p]) => parseInt(id) !== memberId && p >= 1)
                .map(([id, p]) => ({ id: parseInt(id), portion: p }));
            // Calculate total adjustable portions
            const totalAdjustable = adjustableMembers.reduce((sum, m) => sum + m.portion, 0);

            if (totalAdjustable > 0) {
                let remainingToAdjust = excess;

                // Sort by portion count descending to reduce higher portions first
                adjustableMembers.sort((a, b) => b.portion - a.portion);

                // First pass: proportional reduction
                for (const member of adjustableMembers) {
                    if (remainingToAdjust <= 0) break;

                    const reduce = Math.min(
                        remainingToAdjust,
                        Math.floor((member.portion / totalAdjustable) * excess)
                    );

                    if (reduce > 0) {
                        newPortions[member.id] = Math.max(0, newPortions[member.id] - reduce);
                        remainingToAdjust -= reduce;
                    }
                }

                // Second pass: if still over limit, reduce one at a time
                if (remainingToAdjust > 0) {
                    for (const member of adjustableMembers) {
                        if (remainingToAdjust <= 0) break;
                        if (newPortions[member.id] > 1) {
                            newPortions[member.id] -= 1;
                            remainingToAdjust -= 1;
                        }
                    }
                }
            } else {
                throw new Error("Cannot allocate unset portions");
            }

        }

        onUpdatePortions(itemId, item.totalPortions, newPortions);
    };

    // Get total allocated portions for an item
    const getTotalAllocatedPortions = (item) => {
        if (!item.portions) return 0;
        return Object.values(item.portions).reduce((sum, portion) => sum + portion, 0);
    };

    // Get allocated portions for a specific member
    const getMemberPortions = (item, memberId) => {
        if (!item.portions || !item.portions[memberId]) return 0;
        return item.portions[memberId];
    };
    const handlePriceChange = (itemId, price) => {
        onUpdatePrice(itemId, price);
        // Trigger recalculation after price update
    };

    const handleToggleConsumer = (itemId, memberId) => {
        onToggleConsumer(itemId, memberId);
        // Trigger recalculation after consumer toggle
    };
    const handleRemoveItem = (itemId) => {
        onRemoveItem(itemId);

    }

    // Icons mapping
    const icons = {
        user: <User className="h-5 w-5 text-teal-600" />,
        pizza: <Pizza className="h-5 w-5 text-teal-600" />,
    };

    return (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-teal-700">Food Items</h2>
                <div className="flex space-x-2">
                    {/* Discount Input */}
                    <div className="flex items-center mr-4">
                        
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={discountPercentage}
                            onChange={handleDiscountChange}
                            className="w-16 px-2 py-1 border border-teal-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                            placeholder="0%"
                        />
                        <Percent className="h-4 w-4 text-teal-600 mr-1" /><span className="ml-1 text-sm text-teal-700">off</span>
                    </div>
                    <button
                        onClick={toggleItemMultiSelectMode}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${itemMultiSelectMode
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
                            className={`px-3 py-1 rounded text-sm font-medium flex items-center ${selectedItems.length === 0
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                            type="button"
                        >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete ({selectedItems.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse mb-4 table-fixed">
                    <thead>
                        <tr className="bg-teal-100">
                            {itemMultiSelectMode && <th className="p-2 w-10 text-center"></th>}
                            <th className="p-2 ps-3 text-left w-1/4 text-teal-800">Item</th>
                            <th className="p-2 ps-3 text-left w-1/6 text-teal-800">Price</th>
                            <th className="p-2 ps-3 text-left w-1/6 text-teal-800">Portions</th>
                            {discountPercentage > 0 && (
                                <th className="p-2 w-16 text-center text-teal-800">
                                    <div className="flex items-center justify-center">
                                        <span className="text-xs">No Discount</span>
                                    </div>
                                </th>
                            )}

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
                                className={`border-b border-gray-200 ${itemMultiSelectMode && selectedItems.includes(item.id)
                                    ? "bg-teal-50"
                                    : ""
                                    }`}
                                onClick={() => itemMultiSelectMode && toggleItemSelection(item.id)}
                            >
                                {itemMultiSelectMode && (
                                    <td className="p-2 text-center w-10">
                                        <div
                                            className={`w-5 h-5 rounded border ${selectedItems.includes(item.id)
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
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        saveEditingItem();
                                                    }}
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
                                                            startEditingItem(item.id, item.name);
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
                                            value={item.price || ""}
                                            onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800 appearance-none"
                                        />
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.totalPortions || 1}
                                            onChange={(e) => updateTotalPortions(item.id, parseInt(e.target.value) || 1)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800"
                                        />

                                        {item.totalPortions > 1 && (<div className="ml-2">
                                            <PortionPieChart
                                                totalPortions={item.totalPortions || 1}
                                                allocatedPortions={getTotalAllocatedPortions(item)}
                                                size={24}
                                            />
                                        </div>)}


                                        {item.totalPortions > 1 && (
                                            <span className="ml-1 text-xs text-teal-600">
                                                {getTotalAllocatedPortions(item)}/{item.totalPortions}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                {/* Discount Exemption Column - Only visible when discount > 0 */}
                                {discountPercentage > 0 && (
                                    <td className="p-2 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleDiscountExempt(item.id);
                                            }}
                                            className={`w-6 h-6 rounded-full flex-shrink-0 inline-flex items-center justify-center ${
                                                item.discountExempt
                                                    ? "bg-red-500 text-white"
                                                    : "bg-gray-200"
                                            }`}
                                            title={item.discountExempt ? "No discount applied" : "Discount applied"}
                                            type="button"
                                        >
                                            {item.discountExempt && (
                                                <ShieldOff className="h-4 w-4" />
                                            )}
                                        </button>
                                        </div>
                                    </td>
                                )}
                                {members.map((member) => (
                                    <td key={member.id} className="p-2 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            {/* Consumption checkbox */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleConsumer(item.id, member.id);
                                                }}
                                                className={`w-6 h-6 rounded-full flex-shrink-0 inline-flex items-center justify-center ${item.consumers.includes(member.id)
                                                    ? "bg-teal-500 text-white"
                                                    : "bg-gray-200"
                                                    }`}
                                                type="button"
                                            >
                                                {item.consumers.includes(member.id) && (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </button>

                                            {/* Portion indicator - only shown if this member is a consumer */}
                                            {item.totalPortions > 1 && item.consumers.includes(member.id) && (
                                                <div
                                                    className="cursor-pointer rounded hover:bg-teal-50 p-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPortionModal({ item, member });
                                                    }}
                                                >
                                                    <PortionPieChart
                                                        totalPortions={item.totalPortions}
                                                        allocatedPortions={getMemberPortions(item, member.id)}
                                                        size={24}
                                                    />
                                                    <span className="text-xs text-teal-700 font-medium block mt-1">
                                                        {getMemberPortions(item, member.id) || 0}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                                {!itemMultiSelectMode && (
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveItem(item.id)
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

            <InputWithButton
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleItemKeyDown}
                placeholder="New food item"
                onButtonClick={handleAddItem}
                buttonIcon={<Plus className="h-5 w-5" />}
            />

            {portionModal && (
                <PortionAllocationModal
                    item={portionModal.item}
                    member={portionModal.member}
                    onClose={() => setPortionModal(null)}
                    onUpdatePortion={updateMemberPortion}
                    members={members}
                />
            )}
        </div>
    );
};


export default ItemsSection;
