import React, { useState, useEffect } from 'react';
import { User, ShoppingCart, Package, Users, ChevronDown, File, HelpingHand, MessageCircle, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmptyCart from "../../../assets/Images/EmptyCart.png";

const baseApi = process.env.VITE_BASE_API;

const AdminPurchaseHome = () => {
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(JSON.parse(sessionStorage.getItem("userdata")));
    const navigate = useNavigate();

    // Update userInfo when localStorage changes
    useEffect(() => {
    const handleStorageChange = () => {
        setUserInfo(JSON.parse(sessionStorage.getItem("userdata")));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}, []);

    // Fetch purchased features when userInfo changes
    useEffect(() => {
    const fetchFeatures = async () => {
        setLoading(true);
        setSelectedFeatures([]); // Reset features to avoid stale data
        try {
            if (userInfo?.user_id) {
                const response = await axios.get(`${baseApi}/api/admin/${userInfo.user_id}/features/`);
                setSelectedFeatures(response.data.features || []);
            }
        } catch (error) {
            console.error("Error fetching features:", error);
            setSelectedFeatures([]);
        } finally {
            setLoading(false);
        }
    };

    if (userInfo?.user_id) {
        fetchFeatures();
    } else {
        setLoading(false);
    }
}, [userInfo?.user_id]);

    const handleNavigateToStore = () => {
        navigate("/admin/purchase-icon");
    };

    const handleNavigateToDashboard = () => {
        navigate("/admin/home");
    };

    const featureMap = {
        "User Dashboard": { icon: <Users size={24} />, color: "bg-blue-500"},
        "Manager Dashboard": { icon: <Users size={24} />, color: "bg-blue-500" },
        "HR-Management": { icon: <Users size={24} />, color: "bg-green-500" },
        "Employment Management": { icon: <Users size={24} />, color: "bg-purple-500" },
        "Supervisor Management": { icon: <Users size={24} />, color: "bg-orange-500" },
        "Help Desk": { icon: <HelpingHand size={24} />, color: "bg-yellow-500" },
        "Project Management": { icon: <File size={24} />, color: "bg-red-500" },
        "KPI Employee": { icon: <Users2 size={24} />, color: "bg-indigo-500" },
        "Training & Development": { icon: <Users2 size={24} />, color: "bg-pink-500" },
        "KPI Manager": { icon: <Users2 size={24} />, color: "bg-teal-500" },
        "FeedBack": { icon: <MessageCircle size={24} />, color: "bg-cyan-500" },
        "Others": { icon: <Users size={24} />, color: "bg-gray-500" },
        "Inventory": { icon: <Package size={24} />, color: "bg-amber-500" },
        "Account Management": { icon: <Users size={24} />, color: "bg-emerald-500" },
    };

    const featureRoutes = {
        "User Dashboard": "/admin/user",
        "Manager Dashboard": "/admin/manager",
        "HR-Management": "/admin/hr-management",
        "Employment Management": "/admin/employee",
        "Supervisor Management": "/admin/supervisor",
        "Help Desk": "/admin/helpdesk",
        "Project Management": "/admin/projectManagement",
        "KPI Employee": "/admin/kpi-employee",
        "Training & Development": "/admin/training-programs",
        "KPI Manager": "/admin/kpi-manager",
        "FeedBack": "/admin/feedback",
        "Others": "/admin/other",
        "Inventory": "/admin/inventory",
        "Account Management": "/admin/account-management",
    };

    const handleFeatureClick = (featureName) => {
    console.log(`Navigating to ${featureName} feature...`);
    const route = featureRoutes[featureName];
    if (route) {
        navigate(route);
    } else {
        console.warn(`No route defined for feature: ${featureName}`);
        navigate(`/admin/feature/${featureName.toLowerCase().replace(/\s+/g, '-')}`);
    }
};

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <p className="text-gray-600 text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-blue-600 mb-3">Welcome, Admin!</h2>
                    <p className="text-gray-600 text-lg">
                        {selectedFeatures.length > 0
                            ? `You have ${selectedFeatures.length} purchased features in your dashboard.`
                            : "Your dashboard looks a bit empty right now."
                        }
                    </p>
                </div>

                {selectedFeatures.length > 0 ? (
                    <>
                        <div className="mb-12">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Your Purchased Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {selectedFeatures.map((feature, index) => {
                                    const featureData = featureMap[feature] || {
                                        icon: <Package size={24} />,
                                        color: "bg-gray-500"
                                    };

                                    return (
                                        <div
                                            key={`${feature}-${index}`}
                                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 cursor-pointer transform "
                                            onClick={() => handleFeatureClick(feature)}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
                                                    {featureData.icon}
                                                </div>
                                                <h4 className="text-sm font-medium text-gray-900 text-center leading-tight mb-3">
                                                    {feature}
                                                </h4>
                                                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform "
                                onClick={handleNavigateToStore}
                            >
                                <span className="text-base">Store</span>
                                <ShoppingCart className="w-5 h-5" />
                            </button>

                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-3 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform "
                                onClick={handleNavigateToDashboard}
                            >
                                <span className="text-base">Go to Dashboard</span>
                                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="mb-12 flex justify-center">
                            <div className="w-64 h-64 flex items-center justify-center">
                                <img
                                    src={EmptyCart}
                                    alt="Empty Cart"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-gray-700 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                                Click on the Store button below to explore and purchase features for your dashboard.
                            </p>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform "
                                onClick={handleNavigateToStore}
                            >
                                <span className="text-base">Visit Store</span>
                                <ShoppingCart className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminPurchaseHome;
