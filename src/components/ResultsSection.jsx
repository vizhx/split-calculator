import { User } from "lucide-react";

const ResultsSection = ({ members, calculations }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-teal-700">
        Final Split
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-blue-50 p-4 rounded-lg shadow">
            <div className="flex items-center mb-2">
              <span className="p-2 bg-teal-100 rounded-full mr-2 text-teal-700 flex-shrink-0">
                <User className="h-5 w-5 text-teal-600" />
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
  );
};

export default ResultsSection;