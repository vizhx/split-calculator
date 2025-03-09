import { User } from "lucide-react";

const ResultsSection = ({ members, calculations }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-teal-700">
        Final Split
      </h2>
      
      {/* Total Amount */}
      <div className="mb-6 p-4 bg-teal-50 rounded-lg">
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="flex flex-col mb-3 md:mb-0">
            <span className="text-sm text-teal-700">Total Bill Amount</span>
            <span className="text-lg font-bold text-teal-800">₹{(calculations.totalBill + calculations.totalDiscount).toFixed(2)}</span>
          </div>
          {calculations.totalDiscount > 0 && (
            <>
              <div className="flex flex-col mb-3 md:mb-0">
                <span className="text-sm text-teal-700">Discount Applied</span>
                <span className="text-lg font-bold text-teal-800">-₹{calculations.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-teal-700">Final Amount</span>
                <span className="text-lg font-bold text-teal-800">₹{(calculations.totalBill || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-teal-50 p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <span className="p-2 bg-teal-100 rounded-full mr-2 text-teal-700 flex-shrink-0">
                <User className="h-5 w-5 text-teal-600" />
              </span>
              <h3 className="font-medium truncate text-teal-800">
                {member.name}
              </h3>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-teal-600">Amount:</span>
                <span className="text-2xl font-bold text-teal-800">
                  ₹{(calculations.memberTotals?.[member.id] || 0).toFixed(2)}
                </span>
              </div>
              {calculations.itemizedBreakdown && calculations.memberShares[member.id] && (
                <div className="mt-2 text-xs text-teal-600">
                  <div className="border-t border-teal-200 pt-2">
                    {calculations.memberShares[member.id].map((item, idx) => (
                      <div key={idx} className="flex justify-between mb-1">
                        <span className="truncate max-w-32">{item.itemName}</span>
                        <span>₹{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsSection;