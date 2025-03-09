import { useState, useEffect } from "react";
import MembersSection from "./components/MembersSection";
import ItemsSection from "./components/ItemsSection";
import ResultsSection from "./components/ResultsSection";

const BillSplitCalculator = () => {
  const [members, setMembers] = useState([
    { id: 1, name: "Person 1", icon: "user" },
    { id: 2, name: "Person 2", icon: "user" },
  ]);
  const [items, setItems] = useState([
    { id: 1, name: "Food Item 1", price: 0, consumers: [1], totalPortions: 1, discountExempt: false },
  ]);
  const [nextMemberId, setNextMemberId] = useState(3);
  const [nextItemId, setNextItemId] = useState(2);
  const [calculations, setCalculations] = useState({});
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Calculate each person's share whenever items or members change
  useEffect(() => {
    calculateShares();
  }, [items, members, discountPercentage]);

  const calculateShares = () => {
    const memberShares = {};
    const memberTotals = {};
    let totalDiscount = 0;

    // Initialize totals for each member
    members.forEach(member => {
      memberTotals[member.id] = 0;
      memberShares[member.id] = [];
    });

    // Calculate each item's share per consumer
    items.forEach(item => {
      if (!item.price || item.consumers.length === 0) return;

      const price = parseFloat(item.price);
      if (isNaN(price) || price <= 0) return;

      // Apply discount if applicable
      const isDiscountApplicable = discountPercentage > 0 && !item.discountExempt;
      const discountMultiplier = isDiscountApplicable ? (1 - discountPercentage / 100) : 1;
      const effectivePrice = price * discountMultiplier;

      // Track total discount amount
      if (isDiscountApplicable) {
        totalDiscount += price - effectivePrice;
      }

      // If using portions (totalPortions > 1)
      if (item.totalPortions > 1 && item.portions) {
        const totalAllocatedPortions = item.totalPortions;
        if (totalAllocatedPortions <= 0) return;

        // Calculate price per portion
        const pricePerPortion = effectivePrice / totalAllocatedPortions;

        // Assign costs based on portions
        item.consumers.forEach(memberId => {
          const memberPortion = item.portions[memberId] || 0;
          if (memberPortion > 0) {
            const share = pricePerPortion * memberPortion;

            memberShares[memberId].push({
              itemId: item.id,
              itemName: item.name,
              amount: share,
              portions: memberPortion,
              originalPrice: price,
              discounted: isDiscountApplicable
            });

            memberTotals[memberId] += share;
          }
        });
      }
      // Equal split
      else {
        const sharePerPerson = effectivePrice / item.consumers.length;

        item.consumers.forEach(memberId => {
          memberShares[memberId].push({
            itemId: item.id,
            itemName: item.name,
            amount: sharePerPerson,
            portions: 1,
            originalPrice: price,
            discounted: isDiscountApplicable
          });

          memberTotals[memberId] += sharePerPerson;
        });
      }
    });

    // Calculate total bill
    const totalBill = Object.values(memberTotals).reduce((sum, amount) => sum + amount, 0);

    setCalculations({
      memberShares,
      memberTotals,
      totalBill,
      totalDiscount,
      itemizedBreakdown: true
    });
  };

  const addMember = (name) => {
    if (name.trim() === "") return;
    setMembers([
      ...members,
      {
        id: nextMemberId,
        name: name,
        icon: "user",
      },
    ]);
    setNextMemberId(nextMemberId + 1);
  };

  const updateMember = (id, newName) => {
    if (newName.trim() === "") return;
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, name: newName } : member
      )
    );
  };

  const removeMember = (id) => {
    setMembers(members.filter((member) => member.id !== id));
    // Remove this member from all items' consumers
    setItems(
      items.map((item) => ({
        ...item,
        consumers: item.consumers.filter((consumerId) => consumerId !== id),
        // Also remove from portions if applicable
        portions: item.portions
          ? Object.fromEntries(
            Object.entries(item.portions).filter(
              ([memberId]) => parseInt(memberId) !== id
            )
          )
          : undefined
      }))
    );
  };

  const removeMultipleMembers = (memberIds) => {
    if (memberIds.length === 0) return;
    setMembers(
      members.filter((member) => !memberIds.includes(member.id))
    );
    // Remove these members from all items' consumers and portions
    setItems(
      items.map((item) => {
        const updatedItem = {
          ...item,
          consumers: item.consumers.filter(
            (consumerId) => !memberIds.includes(consumerId)
          )
        };
        // Also remove from portions if applicable
        if (item.portions) {
          updatedItem.portions = Object.fromEntries(
            Object.entries(item.portions).filter(
              ([memberId]) => !memberIds.includes(parseInt(memberId))
            )
          );
        }
        return updatedItem;
      })
    );
  };

  const addItem = (name) => {
    if (name.trim() === "") return;
    setItems([
      ...items,
      {
        id: nextItemId,
        name: name,
        price: 0,
        consumers: [],
        totalPortions: 1, // Default to 1 portion (equal split)
        discountExempt: false // Default to applying discounts
      },
    ]);
    setNextItemId(nextItemId + 1);
  };

  const updateItem = (id, newName) => {
    if (newName && newName.trim() === "") return;
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, name: newName };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const removeMultipleItems = (itemIds) => {
    if (itemIds.length === 0) return;
    setItems(items.filter((item) => !itemIds.includes(item.id)));
  };

  const updatePrice = (id, price) => {
    const numericPrice = parseFloat(price);
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, price: isNaN(numericPrice) ? 0 : numericPrice };
        }
        return item;
      })
    );
  };

  const toggleConsumer = (itemId, memberId) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          let newConsumers;
          if (item.consumers.includes(memberId)) {
            // Remove consumer
            newConsumers = item.consumers.filter((id) => id !== memberId);

            // Also remove from portions if applicable
            const newPortions = item.portions
              ? Object.fromEntries(
                Object.entries(item.portions).filter(
                  ([id]) => parseInt(id) !== memberId
                )
              )
              : undefined;

            return {
              ...item,
              consumers: newConsumers,
              portions: newPortions
            };
          } else {
            // Add consumer
            newConsumers = [...item.consumers, memberId];

            // Add to portions if using portions
            let newPortions = item.portions ? { ...item.portions } : {};
            if (item.totalPortions > 1) {
              // Try to distribute portions evenly
              const portionPerMember = Math.floor(item.totalPortions / newConsumers.length);
              let remainingPortions = item.totalPortions;

              // Reset portions for all consumers
              newPortions = {};
              newConsumers.forEach((id, index) => {
                // Last member gets any remaining portions
                const isLast = index === newConsumers.length - 1;
                const memberPortion = isLast ? remainingPortions : portionPerMember;
                newPortions[id] = memberPortion;
                remainingPortions -= memberPortion;
              });
            }

            return {
              ...item,
              consumers: newConsumers,
              portions: item.totalPortions > 1 ? newPortions : undefined
            };
          }
        }
        return item;
      })
    );
  };


  const updatePortions = (itemId, totalPortions, portions) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            totalPortions,
            portions: totalPortions > 1 ? portions : undefined
          };
        }
        return item;
      })
    );
  };

  // New handler for discount percentage updates
  const updateDiscount = (percentage) => {
    setDiscountPercentage(percentage);
  };

  // New handler for toggling discount exemption for an item
  const toggleDiscountExempt = (itemId) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          return { ...item, discountExempt: !item.discountExempt };
        }
        return item;
      })
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-teal-800 mb-8 text-center">
        Bill Split Calculator
      </h1>

      <MembersSection
        members={members}
        onAddMember={addMember}
        onUpdateMember={updateMember}
        onRemoveMember={removeMember}
        onRemoveMultipleMembers={removeMultipleMembers}
      />

      <ItemsSection
        items={items}
        members={members}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
        onRemoveMultipleItems={removeMultipleItems}
        onUpdatePrice={updatePrice}
        onToggleConsumer={toggleConsumer}
        onUpdatePortions={updatePortions}
        discountPercentage={discountPercentage}
        onUpdateDiscount={updateDiscount}
        onToggleDiscountExempt={toggleDiscountExempt}
      />

      <ResultsSection
        members={members}
        calculations={calculations}
      />
    </div>
  );
};

export default BillSplitCalculator;