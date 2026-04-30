import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { X, Users, Building2Icon } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../../../../config/api";

const CampusAccess = ({ user, refreshUsers, onClose }) => {
    const themeMode = useSelector((state) => state.color.mode);
    const isDark = themeMode === "dark";

    const [campuses, setCampuses] = useState([]);
    const [selectedCampusIds, setSelectedCampusIds] = useState([]);
    const [accessedCampusData, setAccessedCampusData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Campuses
    const fetchCampuses = async () => {
        try {
            const response = await api.get("/api/campuses");
            console.log("Campuses API Response:", response.data);
            console.log("Campuses structure:", response.data?.map(c => ({ id: c.id, name: c.name, type: typeof c.id })));
            setCampuses(response.data || []);
        } catch (error) {
            console.error("Error fetching campuses:", error);
            setCampuses([]);
        }
    };

    // Fetch user's current campus access
    const fetchUserCampusAccess = async (userId) => {
        try {
            const response = await api.get(`api/user-campus-access/${userId}`);
            console.log("Access Campus API Response:", response.data);

            // Handle different API response structures
            let campusData = response.data || [];
            console.log("Raw campus data:", campusData);
            
            // Filter only active campuses (handle different field names)
            const activeCampuses = campusData.filter(c => {
                const isActive = c.isActive !== false && c.isActive !== null;
                console.log(`Campus ${c.campusId} - isActive: ${c.isActive}, keep: ${isActive}`);
                return isActive;
            });
            console.log("Active campuses only:", activeCampuses);
            
            const accessedIds = activeCampuses?.map(c => {
                console.log(`Processing campus access: ${JSON.stringify(c)}, campusId: ${c.campusId}, type: ${typeof c.campusId}, isActive: ${c.isActive}`);
                return Number(c.campusId);
            });
            console.log("Final Accessed IDs:", accessedIds, "Type:", accessedIds.map(id => typeof id));
            setAccessedCampusData(activeCampuses || []);
            setSelectedCampusIds(accessedIds || []);
        } catch (error) {
            console.error("Error fetching Accessed Campus:", error);
            setAccessedCampusData([]);
            setSelectedCampusIds([]);
        }
    };

    // Assign campuses to user
    const assignCampuses = async (userId) => {
        setIsLoading(true);
        try {
            console.log("userId", userId, "Selected campusids", selectedCampusIds);
            await api.post(`/api/user-campus-access/replace`, {
                "userId": userId,
                "campusIds": selectedCampusIds
            });
            toast.success(`Campus Assigned successfully`);
            
            
            // Refresh the parent component's user data
            refreshUsers();
            
            // Close the popup
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error("Assign campus error:", error);
            toast.error("Failed to assign campuses");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampuses();
        if (user?.id) {
            fetchUserCampusAccess(user.id);
        }
    }, [user.id]);

    // Debug: Monitor selectedCampusIds changes
    useEffect(() => {
        console.log("selectedCampusIds changed:", selectedCampusIds);
    }, [selectedCampusIds]);

    const cardClass = `relative overflow-hidden group rounded-3xl border backdrop-blur-xl transition-all duration-700 ${isDark
        ? 'bg-[#1E1E1E] border-white/10 shadow-2xl'
        : 'bg-white border-gray-200/80 shadow-lg'
        }`;

    return (
        <>
            <div className={`border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            Assign Campus Access
                        </h3>
                        <p className={`text-sm mt-2 mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Manage campus access for <span className="font-semibold">{user.displayName}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex h-[80vh]">
                {/* LEFT – SELECT CAMPUS */}
                <div className="w-2/3 p-5 overflow-y-auto h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary rounded-xl shadow-lg">
                            <Users className="size-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-primary">
                                Select Campuses
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {campuses?.map((campus) => (
                            <div
                                key={campus.id}
                                className={`group relative p-3 rounded-xl ${isDark ? "bg-[#1A1A1A] border-white/5 text-white border-gray-800/40" : "bg-white text-black border-gray-300/50"} border-2 hover:border-primary shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                            >
                                <div className={`flex items-center gap-3`}>
                                    <input
                                        type="checkbox"
                                        value={campus.id}
                                        className={`rounded text-2xl w-4 h-4 ${isDark ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"} text-primary focus:ring-primary focus:ring-2`}
                                        checked={(() => {
                                            const campusId = Number(campus.id);
                                            const isChecked = selectedCampusIds.includes(campusId);
                                            console.log(`Checkbox - Campus: ${campus.name} (${campus.id}), Number: ${campusId}, Selected: [${selectedCampusIds.join(', ')}], Checked: ${isChecked}`);
                                            return isChecked;
                                        })()}
                                        onChange={(e) => {
                                            const campusId = Number(campus.id);
                                            if (e.target.checked) {
                                                setSelectedCampusIds(prev => [...prev, campusId]);
                                            } else {
                                                setSelectedCampusIds(prev =>
                                                    prev.filter(id => id !== campusId)
                                                );
                                            }
                                        }}
                                    />
                                    <div className={`mb-2 flex-1 ${isDark ? "text-white" : "text-black"}`}>
                                        <h4 className="font-bold">
                                            {campus.name}
                                        </h4>
                                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                            Campus ID: {campus.id} 
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT – SELECTED CAMPUSES */}
                <div className="w-1/3 border-l border-white/5 p-5 flex flex-col h-full">
                    <div className="flex-1">
                        {/* SELECTION COUNTER */}
                        <div
                            className={`group relative p-3 rounded-xl border-2 ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'} shadow-lg hover:shadow-xl transition-all duration-300 mb-3`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-lg">
                                    <Users className="size-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-primary">
                                        Selected: {selectedCampusIds.length}
                                    </h4>
                                    <p className="text-xs text-white">
                                        Campuses selected
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SELECTED CAMPUSES LIST */}
                        {selectedCampusIds.length > 0 && (
                            <div className={`overflow-y-auto p-3 rounded-xl border-2 ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'} shadow-lg`}>
                                <h5 className="text-md font-semibold mb-2 text-white">
                                    Selected Campuses:
                                </h5>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {selectedCampusIds.map((campusId, index) => {
                                        const campus = campuses.find(c => Number(c.id) === campusId);
                                        return campus ? (
                                            <div key={campusId} className="text-sm text-primary">
                                                {index + 1}. {campus.name}
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SAVE BUTTON AT BOTTOM */}
                    <div className="mt-10 pt-4 border-t border-white/10 h-full">
                        <div
                            className={`group relative p-3 rounded-xl ${isDark ? "bg-green-500 text-white border-green-900 hover:border-green-500" : "bg-gray-100 text-gray-600"} border-2 ${isDark ? 'border-gray-700' : 'border-gray-300/50'} hover:${isDark ? 'border-gray-600' : 'border-gray-400'} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                            onClick={() => assignCampuses(user.id)}
                            disabled={true}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-lg">
                                    <Building2Icon className="size-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-sm ${isDark ? "text-white" : "text-black"}`}>
                                        Save
                                    </h4>
                                    <p className={`text-xs ${isDark ? "text-white" : "text-gray-600"}`}>
                                        Save campus access
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CampusAccess;
